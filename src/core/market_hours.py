from datetime import datetime, time
import pytz
from src.core.config import settings
from src.core.logger import logger

class MarketHours:
    @staticmethod
    def is_market_open() -> bool:
        """Checks if the US market is currently open."""
        tz = pytz.timezone(settings.market.timezone)
        now = datetime.now(tz)
        
        # Check for weekends
        if now.weekday() >= 5:
            return False
            
        market_open = time(9, 30)
        market_close = time(16, 0)
        
        current_time = now.time()
        
        return market_open <= current_time <= market_close

    @staticmethod
    def get_market_session() -> str:
        """Returns the current market session: 'pre-market', 'open', 'mid', 'close', 'after-hours'."""
        tz = pytz.timezone(settings.market.timezone)
        now = datetime.now(tz)
        
        current_time = now.time()
        
        if now.weekday() >= 5:
            return "closed"
            
        if time(4, 0) <= current_time < time(9, 30):
            return "pre-market"
        elif time(9, 30) <= current_time < time(11, 0):
            return "open"
        elif time(11, 0) <= current_time < time(14, 0):
            return "mid"
        elif time(14, 0) <= current_time < time(16, 0):
            return "close"
        elif time(16, 0) <= current_time < time(20, 0):
            return "after-hours"
        else:
            return "closed"
