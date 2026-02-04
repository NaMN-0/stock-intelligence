import pandas as pd
import pandas_ta_classic as ta
from typing import Dict, Any
from src.strategies.base import BaseStrategy, Signal
from src.core.logger import logger

class EMAStrategy(BaseStrategy):
    def __init__(self, fast_ema: int = 12, slow_ema: int = 26, rsi_period: int = 14):
        super().__init__(name="EMA_Crossover_RSI")
        self.fast_ema = fast_ema
        self.slow_ema = slow_ema
        self.rsi_period = rsi_period

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # Squeeze to handle potential MultiIndex
        close = df['Close'].squeeze()

        # Calculate EMA
        df[f'EMA_{self.fast_ema}'] = ta.ema(close, length=self.fast_ema)
        df[f'EMA_{self.slow_ema}'] = ta.ema(close, length=self.slow_ema)
        
        # Calculate RSI
        df['RSI'] = ta.rsi(close, length=self.rsi_period)
        
        # Signal logic
        df['signal'] = Signal.NEUTRAL
        df['confidence'] = 0.0
        
        # Bullish: Fast > Slow + RSI > 50
        bullish_mask = (df[f'EMA_{self.fast_ema}'] > df[f'EMA_{self.slow_ema}']) & (df['RSI'] > 50)
        df.loc[bullish_mask, 'signal'] = Signal.BULLISH
        
        # Bearish: Fast < Slow + RSI < 50
        bearish_mask = (df[f'EMA_{self.fast_ema}'] < df[f'EMA_{self.slow_ema}']) & (df['RSI'] < 40)
        df.loc[bearish_mask, 'signal'] = Signal.BEARISH
        
        # Confidence based on RSI distance from center (50)
        df.loc[bullish_mask, 'confidence'] = (df['RSI'] - 50) / 40 # Max confidence at RSI 90
        df.loc[bearish_mask, 'confidence'] = (50 - df['RSI']) / 40 # Max confidence at RSI 10
        
        df['confidence'] = df['confidence'].clip(0, 1.0)
        
        return df

    def get_current_signal(self, df: pd.DataFrame, ticker: str = "UNKNOWN") -> Dict[str, Any]:
        if df.empty or len(df) < self.slow_ema:
            return {
                'ticker': ticker,
                'strategy': self.name,
                'signal': Signal.NEUTRAL,
                'confidence': 0.0,
                'metadata': {'error': 'Insufficient data'}
            }
            
        df_with_signals = self.generate_signals(df)
        last_row = df_with_signals.iloc[-1]
        
        return {
            'ticker': ticker,
            'strategy': self.name,
            'signal': last_row['signal'],
            'confidence': float(last_row['confidence']),
            'price': float(last_row['Close']),
            'timestamp': last_row.name,
            'metadata': {
                'fast_ema': float(last_row[f'EMA_{self.fast_ema}']),
                'slow_ema': float(last_row[f'EMA_{self.slow_ema}']),
                'rsi': float(last_row['RSI'])
            }
        }
