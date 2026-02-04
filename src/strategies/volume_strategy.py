import pandas as pd
import pandas_ta_classic as ta
from typing import Dict, Any
from src.strategies.base import BaseStrategy, Signal
from src.core.logger import logger

class VolumeStrategy(BaseStrategy):
    def __init__(self, volume_ma: int = 20, spike_threshold: float = 2.0):
        super().__init__(name="Volume_Spike_Confirmation")
        self.volume_ma = volume_ma
        self.spike_threshold = spike_threshold # Volume must be 2x average

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # Calculate Volume SMA
        df['Vol_SMA'] = df['Volume'].rolling(window=self.volume_ma).mean()
        # Ensure we are dealing with Series even if yfinance returns multi-column
        vol = df['Volume'].squeeze()
        ma = df['Vol_SMA'].squeeze()
        
        # Price change
        df['Price_Change'] = df['Close'].squeeze().pct_change()
        
        # Signal logic
        df['signal'] = Signal.NEUTRAL
        df['confidence'] = 0.0
        
        # Volume spike: current volume > threshold * average
        vol = df['Volume'].squeeze()
        ma = df['Vol_SMA'].squeeze()
        volume_spike = vol > (ma * self.spike_threshold)
        
        # Bullish: Volume spike + Positive price change
        bullish_mask = volume_spike & (df['Price_Change'] > 0)
        df.loc[bullish_mask, 'signal'] = Signal.BULLISH
        
        # Bearish: Volume spike + Negative price change
        bearish_mask = volume_spike & (df['Price_Change'] < 0)
        df.loc[bearish_mask, 'signal'] = Signal.BEARISH
        
        # Confidence based on spike intensity
        vol_ratio = (vol / ma).squeeze()
        df['vol_ratio'] = vol_ratio
        df.loc[volume_spike, 'confidence'] = (vol_ratio / (self.spike_threshold * 2)).clip(0, 1.0)
        
        return df

    def get_current_signal(self, df: pd.DataFrame, ticker: str = "UNKNOWN") -> Dict[str, Any]:
        if df.empty or len(df) < self.volume_ma:
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
                'volume': float(last_row['Volume']),
                'avg_volume': float(last_row['Vol_SMA']),
                'volume_ratio': float(last_row['Volume'] / last_row['Vol_SMA']) if last_row['Vol_SMA'] > 0 else 0
            }
        }
