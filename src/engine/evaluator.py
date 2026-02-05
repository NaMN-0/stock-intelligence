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
        combined_returns = pd.Series(dtype=float)
        if total_trades > 0:
            combined_returns = pd.concat([bullish_returns, -bearish_returns])
            avg_return = combined_returns.mean()
            
        # Cumulative return
        cum_return = (1 + combined_returns).prod() - 1 if not combined_returns.empty else 0
        
        # Max Drawdown (simplified)
        max_drawdown = 0.0
        if not combined_returns.empty:
            cum_returns = (1 + combined_returns).cumprod()
            rolling_max = cum_returns.expanding().max()
            drawdown = (cum_returns - rolling_max) / rolling_max
            max_drawdown = drawdown.min()

        # Profit Factor: Sum of winning returns / sum of absolute losing returns
        profit_factor = 1.0
        if not combined_returns.empty:
            pos_sum = combined_returns[combined_returns > 0].sum()
            neg_sum = abs(combined_returns[combined_returns < 0].sum())
            if neg_sum > 0:
                profit_factor = pos_sum / neg_sum
            elif pos_sum > 0:
                profit_factor = 2.0 # Good PF if no losses

        # Sharpe Approximation (Daily basis)
        sharpe = 0.0
        if total_trades > 5:
            std = combined_returns.std()
            if std > 0:
                sharpe = (avg_return / std) * np.sqrt(252)

        # Confidence Score: Weighted mix of Win Rate, Profit Factor, and Sharpe
        confidence = (win_rate * 0.4) + (min(profit_factor, 2.0) / 2.0 * 0.3) + (min(max(sharpe, 0), 3.0) / 3.0 * 0.3)
        confidence = float(np.clip(confidence, 0.1, 0.98))

        return {
            "strategy": self.strategy.name,
            "win_rate": float(win_rate),
            "profit_factor": float(profit_factor),
            "sharpe_ratio": float(sharpe),
            "total_trades": int(total_trades),
            "cumulative_return": float(cum_return),
            "max_drawdown": float(max_drawdown),
            "confidence": confidence,
            "score": float(confidence * (1 + avg_return)) 
        }
