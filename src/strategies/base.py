from abc import ABC, abstractmethod
import pandas as pd
import pandas_ta_classic as ta
from typing import Dict, Any, List

class Signal(ABC):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"

class BaseStrategy(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generates signals for the given historical data.
        Should return a copy of the dataframe with added signal columns.
        Required columns in output: 'signal' (bullish/bearish/neutral), 'confidence' (0-1)
        """
        pass

    @abstractmethod
    def get_current_signal(self, df: pd.DataFrame, ticker: str = "UNKNOWN") -> Dict[str, Any]:
        """
        Calculates the current signal for the most recent data point.
        Returns: {
            'ticker': str,
            'strategy': str,
            'signal': str,
            'confidence': float,
            'price': float,
            'timestamp': datetime,
            'metadata': dict
        }
        """
        pass

    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Utility to calculate common indicators on a dataframe."""
        # This will be overridden or called by subclasses
        return df.copy()
