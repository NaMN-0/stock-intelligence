import pandas as pd
import numpy as np
from typing import Dict, Any, List
from src.strategies.base import BaseStrategy, Signal
from src.core.logger import logger

class StrategyEvaluator:
    def __init__(self, strategy: BaseStrategy):
        self.strategy = strategy

    def evaluate(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Backtests the strategy on historical data and returns performance metrics.
        """
        if df.empty or len(df) < 50:
            return {"error": "Insufficient data"}

        # Generate signals
        df_results = self.strategy.generate_signals(df)
        
        # Simple backtest: buy next open, sell next next open if signal changes
        # For simplicity, we'll calculate returns based on signal held for 1 period
        df_results['next_return'] = df_results['Close'].shift(-1).pct_change()
        
        # Filter for signals
        bullish_returns = df_results[df_results['signal'] == Signal.BULLISH]['next_return']
        bearish_returns = df_results[df_results['signal'] == Signal.BEARISH]['next_return']
        
        # Metrics
        win_rate = 0.0
        total_trades = len(bullish_returns) + len(bearish_returns)
        
        if total_trades > 0:
            wins = (bullish_returns > 0).sum() + (bearish_returns < 0).sum()
            win_rate = wins / total_trades
            
        avg_return = 0.0
        if total_trades > 0:
            # Note: bearish returns are positive if price went down (we "sell" or short)
            # In this simple model, we assume buying bullish and selling bearish
            combined_returns = pd.concat([bullish_returns, -bearish_returns])
            avg_return = combined_returns.mean()
            
        # Cumulative return
        cum_return = (1 + pd.concat([bullish_returns, -bearish_returns])).prod() - 1 if total_trades > 0 else 0
        
        # Max Drawdown (simplified)
        max_drawdown = 0.0
        if total_trades > 0:
            returns_series = pd.concat([bullish_returns, -bearish_returns])
            cum_returns = (1 + returns_series).cumprod()
            rolling_max = cum_returns.expanding().max()
            drawdown = (cum_returns - rolling_max) / rolling_max
            max_drawdown = drawdown.min()

        return {
            "strategy": self.strategy.name,
            "win_rate": float(win_rate),
            "avg_return": float(avg_return),
            "total_trades": int(total_trades),
            "cumulative_return": float(cum_return),
            "max_drawdown": float(max_drawdown),
            "score": float(win_rate * (1 + avg_return) * (1 + max_drawdown)) # Heuristic score
        }
