from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class TickerState(BaseModel):
    ticker: str
    last_price: Optional[float] = None
    last_update: Optional[datetime] = None
    best_strategy: Optional[str] = None
    last_signal: Optional[Dict[str, Any]] = None
    expected_move: Optional[Dict[str, Any]] = None

class SystemMetrics(BaseModel):
    total_tickers: int = 0
    data_processed_mb: float = 0.0
    errors_count: int = 0
    uptime_seconds: float = 0.0
    last_error: Optional[str] = None
    start_time: datetime = datetime.now()

class StateCache:
    def __init__(self):
        self.tickers: Dict[str, TickerState] = {}
        self.metrics = SystemMetrics()

    def _ensure_ticker(self, ticker: str) -> TickerState:
        if ticker not in self.tickers:
            self.tickers[ticker] = TickerState(ticker=ticker)
            self.metrics.total_tickers = len(self.tickers)
        return self.tickers[ticker]

    def add_error(self, error_msg: str):
        self.metrics.errors_count += 1
        self.metrics.last_error = f"[{datetime.now().strftime('%H:%M:%S')}] {error_msg}"

    def track_data(self, size_bytes: int):
        self.metrics.data_processed_mb += size_bytes / (1024 * 1024)

    def update_price(self, ticker: str, price: float):
        state = self._ensure_ticker(ticker)
        state.last_price = price
        state.last_update = datetime.now()

    def update_strategy(self, ticker: str, strategy_name: str):
        state = self._ensure_ticker(ticker)
        state.best_strategy = strategy_name

    def update_signal(self, ticker: str, signal: Dict[str, Any]):
        state = self._ensure_ticker(ticker)
        state.last_signal = signal

    def update_forecast(self, ticker: str, forecast: Dict[str, Any]):
        state = self._ensure_ticker(ticker)
        state.expected_move = forecast

    def get_state(self, ticker: str) -> Optional[TickerState]:
        return self.tickers.get(ticker)

    def get_all_states(self) -> Dict[str, TickerState]:
        return self.tickers
    
    def get_metrics(self) -> Dict[str, Any]:
        self.metrics.uptime_seconds = (datetime.now() - self.metrics.start_time).total_seconds()
        return self.metrics.dict()

# Global state cache
state_cache = StateCache()
