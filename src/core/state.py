from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from src.core.logger import logger
import os
from src.core.config import settings

class TickerState(BaseModel):
    ticker: str
    last_price: Optional[float] = None
    last_update: Optional[datetime] = None
    best_strategy: Optional[str] = None
    last_signal: Optional[Dict[str, Any]] = None
    expected_move: Optional[Dict[str, Any]] = None

class SystemMetrics(BaseModel):
    total_tickers: int = 0
    processed_tickers: int = 0
    is_syncing: bool = False
    data_processed_mb: float = 0.0
    errors_count: int = 0
    uptime_seconds: float = 0.0
    last_error: Optional[str] = None
    start_time: datetime = Field(default_factory=datetime.now)

from src.core.database import DatabaseManager

class StateCache:
    def __init__(self):
        self.tickers: Dict[str, TickerState] = {}
        self.metrics = SystemMetrics()
        self.db = DatabaseManager()
        self._load_from_db()

    def _load_from_db(self):
        """Restores state and metrics from SQL on startup."""
        try:
            persisted_states = self.db.load_all_ticker_states()
            for ticker, state_data in persisted_states.items():
                self.tickers[ticker] = TickerState(**state_data)
            
            persisted_metrics = self.db.load_metrics()
            if persisted_metrics:
                for k, v in persisted_metrics.items():
                    setattr(self.metrics, k, v)
            
            self.metrics.total_tickers = len(self.tickers)
            logger.info(f"Restored {len(self.tickers)} ticker states from database.")
            
            # Reset session-specific metrics
            self.metrics.errors_count = 0
            self.metrics.last_error = None
            self.metrics.processed_tickers = 0
            self.metrics.start_time = datetime.now()
            
        except Exception as e:
            logger.error(f"Failed to restore state from DB: {e}")

    def _ensure_ticker(self, ticker: str) -> TickerState:
        if ticker not in self.tickers:
            self.tickers[ticker] = TickerState(ticker=ticker)
            self.metrics.total_tickers = len(self.tickers)
        return self.tickers[ticker]

    def add_error(self, error_msg: str):
        self.metrics.errors_count += 1
        self.metrics.last_error = f"[{datetime.now().strftime('%H:%M:%S')}] {error_msg}"
        self.db.save_metrics(self.get_metrics())

    def track_data(self, size_bytes: int):
        # Deprecated: usage is now calculated from disk directly
        pass

    def _calculate_cache_size(self) -> float:
        """Calculates total size of cache directory in MB."""
        try:
            total_size = 0
            cache_dir = settings.data.cache_dir
            if os.path.exists(cache_dir):
                for entry in os.scandir(cache_dir):
                    if entry.is_file():
                        total_size += entry.stat().st_size
            return total_size / (1024 * 1024)
        except Exception:
            return 0.0

    def update_price(self, ticker: str, price: float):
        state = self._ensure_ticker(ticker)
        state.last_price = price
        state.last_update = datetime.now()
        # Price updates are too frequent for DB; we'll rely on periodic strategy/signal saves
        # but we could save here if needed.

    def update_strategy(self, ticker: str, strategy_name: str):
        state = self._ensure_ticker(ticker)
        state.best_strategy = strategy_name
        self.db.save_ticker_state(ticker, state.dict())

    def update_signal(self, ticker: str, signal: Dict[str, Any]):
        state = self._ensure_ticker(ticker)
        state.last_signal = signal
        self.db.save_ticker_state(ticker, state.dict())

    def update_forecast(self, ticker: str, forecast: Dict[str, Any]):
        state = self._ensure_ticker(ticker)
        state.expected_move = forecast
        self.db.save_ticker_state(ticker, state.dict())

    def set_syncing(self, value: bool):
        self.metrics.is_syncing = value
        if value:
            self.metrics.processed_tickers = 0
        self.db.save_metrics(self.get_metrics())

    def increment_processed(self):
        self.metrics.processed_tickers += 1
        # Save metrics every 5 tickers to avoid DB overhead during bulk setup
        if self.metrics.processed_tickers % 5 == 0:
            self.db.save_metrics(self.get_metrics())

    def get_state(self, ticker: str) -> Optional[TickerState]:
        return self.tickers.get(ticker)

    def get_all_states(self) -> Dict[str, TickerState]:
        return self.tickers
    
    def get_metrics(self) -> Dict[str, Any]:
        self.metrics.uptime_seconds = (datetime.now() - self.metrics.start_time).total_seconds()
        # Update cache size on read (throttling could be added if needed)
        self.metrics.data_processed_mb = self._calculate_cache_size()
        return self.metrics.dict()

# Global state cache
state_cache = StateCache()
