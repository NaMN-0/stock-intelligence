import pandas as pd
import numpy as np
import pandas_ta_classic as ta
from typing import Dict, Any, List
from .base import BaseStrategy, Signal
from datetime import datetime

class PennyBreakoutStrategy(BaseStrategy):
    """
    Specially tuned strategy for penny stocks ($0.05 - $5.00).
    Focuses on extreme volume surges (>300% avg) and volatility breakouts.
    """
    def __init__(self):
        super().__init__("Penny Breakout")

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        if len(df) < 20: 
            df['signal'] = Signal.NEUTRAL
            df['confidence'] = 0.0
            return df

        # Volume Surge: Current Vol vs 20-period Avg Vol
        df['vol_ma'] = df['Volume'].rolling(window=20).mean()
        # Squeeze to handle potential MultiIndex
        vol = df['Volume'].squeeze()
        ma = df['vol_ma'].squeeze()
        df['vol_surge'] = vol / ma
        
        # Volatility: ATR relative to price
        close = df['Close'].squeeze()
        high = df['High'].squeeze()
        low = df['Low'].squeeze()
        
        df['atr'] = ta.atr(high, low, close, length=14)
        df['volatility_ratio'] = df['atr'] / close
        
        # RSI for overbought/oversold catch
        df['rsi'] = ta.rsi(close, length=14)

        # Signal Logic
        df['signal'] = Signal.NEUTRAL
        df['confidence'] = 0.5

        # Penny Breakout Bullish: High Volume + RSI < 70 + Price > MA20
        df['ma20'] = close.rolling(window=20).mean()
        
        # Ensure masks are Series
        vol_surge = df['vol_surge'].squeeze()
        rsi = df['rsi'].squeeze()
        ma20 = df['ma20'].squeeze()
        
        bull_mask = (vol_surge > 2.5) & (close > ma20) & (rsi < 80)
        bear_mask = (vol_surge > 2.5) & (close < ma20) & (rsi > 20)

        df.loc[bull_mask, 'signal'] = Signal.BULLISH
        df.loc[bear_mask, 'signal'] = Signal.BEARISH
        
        # Confidence based on volume surge magnitude
        df['confidence'] = (df['vol_surge'] / 10.0).clip(0.1, 0.95)
        
        return df

    def get_current_signal(self, df: pd.DataFrame, ticker: str = "UNKNOWN") -> Dict[str, Any]:
        df_signaled = self.generate_signals(df)
        last_row = df_signaled.iloc[-1]
        
        return {
            'ticker': ticker,
            'strategy': self.name,
            'signal': last_row['signal'],
            'confidence': float(last_row['confidence']),
            'price': float(last_row['Close']),
            'timestamp': df.index[-1],
            'metadata': {
                'volume_surge': f"{last_row['vol_surge']:.2f}x",
                'rsi': f"{last_row['rsi']:.1f}",
                'volatility': f"{last_row['volatility_ratio']:.2%}"
            }
        }
