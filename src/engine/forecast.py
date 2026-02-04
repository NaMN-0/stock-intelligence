import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from src.core.config import settings
from src.core.logger import logger
from src.core.state import state_cache, TickerState
from src.data.historical_data import HistoricalDataManager
from src.strategies.base import Signal

class ForecastEngine:
    def __init__(self, data_manager: HistoricalDataManager):
        self.data_manager = data_manager

    def compute_forecast(self, ticker: str) -> Optional[Dict[str, Any]]:
        """
        Computes the expected move and directional bias for a ticker.
        """
        state = state_cache.get_state(ticker)
        if not state or not state.best_strategy:
            return None

        # Get data for volatility calculation (1h or 15m)
        df = self.data_manager.get_historical_data(ticker, "1h")
        if df is None or df.empty:
            return None

        last_price = state.last_price
        if last_price is None:
            # Fallback to last close from historical data if live price isn't polled yet
            last_price = float(df['Close'].iloc[-1])
        
        # Calculate ATR for price range
        df['tr'] = np.maximum(
            df['High'] - df['Low'],
            np.maximum(
                abs(df['High'] - df['Close'].shift(1)),
                abs(df['Low'] - df['Close'].shift(1))
            )
        )
        atr_series = df['tr'].rolling(window=14).mean()
        if atr_series.empty or pd.isna(atr_series.iloc[-1]):
            atr = 0.01 * last_price # Default small volatility
        else:
            atr = atr_series.iloc[-1]
        
        # Directional bias from last signal
        signal = state.last_signal
        if not signal or signal.get('signal') is None:
            return None
            
        bias = signal['signal']
        confidence = signal.get('confidence', 0.5)
        
        # Expected range: price +/- ATR * multiplier
        # If bullish, range is skewed upwards
        multiplier = 1.0 + (float(confidence) * 0.5)
        
        expected_min = last_price - (atr * multiplier)
        expected_max = last_price + (atr * multiplier)
        
        # Pivot points / Invalidation
        invalidation = 0.0
        if bias == Signal.BULLISH:
            invalidation = last_price - (atr * 1.5)
        elif bias == Signal.BEARISH:
            invalidation = last_price + (atr * 1.5)

        forecast = {
            "price": last_price,
            "bias": bias,
            "confidence": confidence,
            "expected_range": {
                "min": float(expected_min),
                "max": float(expected_max)
            },
            "invalidation_point": float(invalidation),
            "volatility_atr": float(atr),
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
        state_cache.update_forecast(ticker, forecast)
        return forecast
