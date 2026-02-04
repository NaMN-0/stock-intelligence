from typing import Dict, List, Any, Type
from src.strategies.base import BaseStrategy
from src.strategies.ema_strategy import EMAStrategy
from src.strategies.bollinger_strategy import BollingerStrategy
from src.strategies.volume_strategy import VolumeStrategy
from src.strategies.pennystock_strategy import PennyBreakoutStrategy
from src.engine.evaluator import StrategyEvaluator
from src.data.historical_data import HistoricalDataManager
from src.core.logger import logger
from src.core.state import state_cache

class StrategySelector:
    def __init__(self, data_manager: HistoricalDataManager):
        self.data_manager = data_manager
        self.strategies: List[BaseStrategy] = [
            EMAStrategy(),
            BollingerStrategy(),
            VolumeStrategy(),
            PennyBreakoutStrategy()
        ]

    def select_best_strategies(self, tickers: List[str]):
        """Runs backtests for all tickers and selects the best performing strategy for each."""
        total = len(tickers)
        for i, ticker in enumerate(tickers):
            if (i + 1) % 50 == 0:
                logger.info(f"Ranking Progress: {i + 1}/{total} tickers evaluated.")

            best_strategy = None
            best_score = -float('inf')
            
            # Use 1h timeframe for selection by default
            df = self.data_manager.get_historical_data(ticker, "1h")
            if df is None or df.empty:
                continue
                
            for strategy in self.strategies:
                # ENFORCE CONSTRAINT: Penny Breakout is ONLY for stocks < $5.00
                last_row = df.iloc[-1]
                
                # Robustly extract price as a single float
                if isinstance(last_row, pd.Series):
                    # If multiple columns named 'Close', last_row['Close'] might be a Series
                    price_val = last_row['Close']
                    if hasattr(price_val, 'iloc'):
                        current_price = float(price_val.iloc[0])
                    else:
                        current_price = float(price_val)
                else:
                    # Fallback for unexpected shapes
                    current_price = float(last_row['Close'])
                
                if strategy.name == "Penny Breakout" and current_price >= 5.0:
                    continue
                
                # ENFORCE CONSTRAINT: Other strategies are for stocks >= $1.00 (optional but good for stability)
                if strategy.name != "Penny Breakout" and current_price < 1.0:
                    continue

                evaluator = StrategyEvaluator(strategy)
                metrics = evaluator.evaluate(df)
                
                if "error" not in metrics:
                    score = metrics.get("score", 0)
                    if score > best_score:
                        best_score = score
                        best_strategy = strategy.name
            
            if best_strategy:
                logger.debug(f"Best strategy for {ticker}: {best_strategy} (Score: {best_score:.4f})")
                state_cache.update_strategy(ticker, best_strategy)

    def get_strategy_instance(self, strategy_name: str) -> BaseStrategy:
        for s in self.strategies:
            if s.name == strategy_name:
                return s
        return self.strategies[0] # Default
