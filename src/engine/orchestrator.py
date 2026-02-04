import asyncio
from typing import List
from src.core.config import settings, tickers
from src.core.logger import logger
from src.core.market_hours import MarketHours
from src.core.state import state_cache
from src.data.historical_data import HistoricalDataManager
from src.data.live_monitor import LivePriceMonitor
from src.engine.selector import StrategySelector
from src.engine.forecast import ForecastEngine

class ServiceOrchestrator:
    def __init__(self):
        self.data_manager = HistoricalDataManager()
        self.live_monitor = LivePriceMonitor()
        self.selector = StrategySelector(self.data_manager)
        self.forecaster = ForecastEngine(self.data_manager)
        self.running = False

    async def start(self):
        global tickers
        self.running = True
        logger.info("Starting ServiceOrchestrator")
        
        # 0. Initial Discovery
        await self.run_discovery()

        # 1. Initial data fetch and strategy selection
        logger.info(f"Performing initial setup for {len(tickers)} tickers...")
        await asyncio.to_thread(self.data_manager.fetch_all, tickers)
        
        logger.info(f"Executing strategy ranking (this may take a few minutes for {len(tickers)} tickers)...")
        await asyncio.to_thread(self.selector.select_best_strategies, tickers)
        
        # 2. Initial signal generation
        logger.info("Generating initial signals...")
        await self.update_all_intelligence()
        
        # 3. Start live price monitor
        asyncio.create_task(self.live_monitor.start())
        
        # 4. Start intelligence loop
        asyncio.create_task(self.intelligence_loop())

        # 5. Start periodic discovery loop to grow universe incrementally
        asyncio.create_task(self.discovery_loop())

    async def run_discovery(self):
        """Runs the ticker discovery process and updates the global tickers list."""
        global tickers
        from src.engine.discovery import TickerDiscovery
        discovery_limit = 2000
        discovery_results = await TickerDiscovery.get_high_potential_tickers(limit=discovery_limit)
        
        if discovery_results:
            # Union with existing tickers to grow incrementally
            current_set = set(tickers)
            new_tickers = [t for t in discovery_results if t not in current_set]
            
            if new_tickers:
                tickers.extend(new_tickers)
                logger.info(f"Added {len(new_tickers)} new tickers. Universe size: {len(tickers)}")
                
                # Perform setup for ONLY the new tickers
                await asyncio.to_thread(self.data_manager.fetch_all, new_tickers)
                await asyncio.to_thread(self.selector.select_best_strategies, new_tickers)
        else:
            if not tickers:
                logger.warning("Dynamic discovery failed and no tickers exist. Falling back...")
                results = TickerDiscovery.get_all_indices_tickers()
                tickers.clear()
                tickers.extend(results)
                logger.info(f"Fallback universe size: {len(tickers)} tickers.")

    async def discovery_loop(self):
        """Periodically runs discovery to find new high-potential tickers."""
        while self.running:
            try:
                # Wait 30 minutes between discovery runs
                await asyncio.sleep(1800)
                if MarketHours.get_market_session() != "closed":
                    logger.info("Running periodic ticker discovery...")
                    await self.run_discovery()
            except Exception as e:
                logger.error(f"Error in discovery loop: {e}")
                await asyncio.sleep(300)

    async def update_all_intelligence(self):
        """Generates signals and forecasts for all tickers."""
        for ticker in tickers:
            try:
                state = state_cache.get_state(ticker)
                
                # Get strategy instance
                strategy_name = (state.best_strategy if state else None) or self.selector.strategies[0].name
                strategy = self.selector.get_strategy_instance(strategy_name)
                
                # Get latest historical data
                df = self.data_manager.get_historical_data(ticker, "1h")
                if df is not None and not df.empty:
                    # Generate signal
                    signal = strategy.get_current_signal(df, ticker=ticker)
                    state_cache.update_signal(ticker, signal)
                    
                    # Update forecast
                    self.forecaster.compute_forecast(ticker)
            except Exception as e:
                logger.debug(f"Error updating intelligence for {ticker}: {e}")

    async def intelligence_loop(self):
        """Loop to regenerate signals and forecasts based on latest prices."""
        while self.running:
            try:
                session = MarketHours.get_market_session()
                if session != "closed":
                    await self.update_all_intelligence()
                    logger.debug("Intelligence loop iteration completed")
                
                # Run every 30 seconds for intelligence updates
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.debug(f"Error in intelligence loop: {e}")
                await asyncio.sleep(60)

    async def stop(self):
        self.running = False
        await self.live_monitor.stop()
        logger.info("ServiceOrchestrator stopped")
