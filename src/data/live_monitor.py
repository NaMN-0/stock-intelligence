import asyncio
import yfinance as yf
from datetime import datetime
from src.core.config import settings, tickers
from src.core.logger import logger
from src.core.market_hours import MarketHours
from src.core.state import state_cache

class LivePriceMonitor:
    def __init__(self):
        self.polling_interval = settings.market.polling_interval_seconds
        self.running = False

    async def start(self):
        """Starts the live price polling loop."""
        self.running = True
        logger.info(f"Live Monitor Active: Polling every {self.polling_interval}s")
        
        while self.running:
            try:
                # Only poll if market is open or in pre/post hours
                session = MarketHours.get_market_session()
                if session != "closed":
                    await self.poll_prices()
                else:
                    # Sleep for a longer duration if market is closed (e.g., 5 mins)
                    await asyncio.sleep(300)
                    continue
                    
                await asyncio.sleep(self.polling_interval)
            except Exception as e:
                logger.debug(f"Error in LivePriceMonitor loop: {e}")
                await asyncio.sleep(self.polling_interval)

    async def stop(self):
        """Stops the live price polling loop."""
        self.running = False
        logger.info("Stopping LivePriceMonitor")

    async def poll_prices(self):
        """Polls prices for all tracked tickers in chunks of 100."""
        chunk_size = 100
        for i in range(0, len(tickers), chunk_size):
            chunk = tickers[i:i + chunk_size]
            try:
                data = await asyncio.to_thread(
                    yf.download, 
                    tickers=chunk, 
                    period="1d", 
                    interval="1m", 
                    progress=False,
                    group_by="ticker"
                )
                
                if data.empty:
                    continue

                # Track data size
                state_cache.track_data(data.memory_usage(deep=True).sum())

                for ticker in chunk:
                    try:
                        ticker_data = data[ticker] if len(chunk) > 1 else data
                        if ticker_data.empty:
                            continue
                            
                        # Try to get the last non-NaN price
                        prices = ticker_data['Close'].dropna()
                        if prices.empty:
                            continue
                            
                        last_price = prices.iloc[-1]
                        if hasattr(last_price, 'item'): 
                            last_price = float(last_price.iloc[0]) if hasattr(last_price, 'iloc') else float(last_price)
                        
                        state_cache.update_price(ticker, float(last_price))
                    except Exception as e:
                        logger.debug(f"Price update error {ticker}: {str(e)}")
                        continue
                        
            except Exception as e:
                state_cache.add_error(f"Live poll failed: {str(e)}")
                logger.debug(f"Failed to poll price chunk starting index {i}: {e}")
            
            # Small delay between chunks to avoid hard throttling
            if i + chunk_size < len(tickers):
                await asyncio.sleep(0.5)
