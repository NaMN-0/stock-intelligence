import pandas as pd
import pandas_ta_classic as ta
from typing import Dict, Any
from src.strategies.base import BaseStrategy, Signal
from src.core.logger import logger

class BollingerStrategy(BaseStrategy):
    def __init__(self, length: int = 20, std_dev: int = 2):
        super().__init__(name="Bollinger_Bands_Reversion")
        self.length = length
        self.std_dev = std_dev

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # Calculate Bollinger Bands
        bbands = ta.bbands(df['Close'], length=self.length, std=self.std_dev)
        if bbands is None or bbands.empty:
            df['signal'] = Signal.NEUTRAL
            df['confidence'] = 0.0
            return df
            
        df = pd.concat([df, bbands], axis=1)
        
        # Column names from pandas_ta bbands
        lower_col = f'BBL_{self.length}_{float(self.std_dev)}'
        upper_col = f'BBU_{self.length}_{float(self.std_dev)}'
        mid_col = f'BBM_{self.length}_{float(self.std_dev)}'
        
        # Signal logic: Mean reversion
        df['signal'] = Signal.NEUTRAL
        df['confidence'] = 0.0
        
        # Bullish: Price below lower band (oversold)
        bullish_mask = (df['Close'] < df[lower_col])
        df.loc[bullish_mask, 'signal'] = Signal.BULLISH
        
        # Bearish: Price above upper band (overbought)
        bearish_mask = (df['Close'] > df[upper_col])
        df.loc[bearish_mask, 'signal'] = Signal.BEARISH
        
        # Confidence based on how far it's outside the bands
        band_width = df[upper_col] - df[lower_col]
        df.loc[bullish_mask, 'confidence'] = (df[lower_col] - df['Close']) / band_width
        df.loc[bearish_mask, 'confidence'] = (df['Close'] - df[upper_col]) / band_width
        
        df['confidence'] = df['confidence'].clip(0, 1.0)
        
        return df

    def get_current_signal(self, df: pd.DataFrame, ticker: str = "UNKNOWN") -> Dict[str, Any]:
        if df.empty or len(df) < self.length:
            return {
                'ticker': ticker,
                'strategy': self.name,
                'signal': Signal.NEUTRAL,
                'confidence': 0.0,
                'metadata': {'error': 'Insufficient data'}
            }
            
        df_with_signals = self.generate_signals(df)
        last_row = df_with_signals.iloc[-1]
        
        lower_col = f'BBL_{self.length}_{float(self.std_dev)}'
        upper_col = f'BBU_{self.length}_{float(self.std_dev)}'
        
        return {
            'ticker': ticker,
            'strategy': self.name,
            'signal': last_row['signal'],
            'confidence': float(last_row['confidence']),
            'price': float(last_row['Close']),
            'timestamp': last_row.name,
            'metadata': {
                'lower_band': float(last_row[lower_col]),
                'upper_band': float(last_row[upper_col]),
                'percent_b': float((last_row['Close'] - last_row[lower_col]) / (last_row[upper_col] - last_row[lower_col]))
            }
        }
