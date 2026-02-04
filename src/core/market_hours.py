from datetime import datetime, time
import pytz
from src.core.config import settings
from src.core.logger import logger

class MarketHours:
    MARKETS = {
        "US": {"tz": "America/New_York", "open": time(9, 30), "close": time(16, 0)},
        "India": {"tz": "Asia/Kolkata", "open": time(9, 15), "close": time(15, 30)},
        "Crypto": {"tz": "UTC", "open": time(0, 0), "close": time(23, 59, 59)}
    }

    @staticmethod
    def is_market_open() -> bool:
        """Checks if ANY configured market is currently open."""
        for name, config in MarketHours.MARKETS.items():
            tz = pytz.timezone(config["tz"])
            now = datetime.now(tz)
            
            # Crypto is 24/7
            if name == "Crypto":
                return True
                
            # For stocks, check weekends
            if now.weekday() >= 5:
                continue
                
            current_time = now.time()
            if config["open"] <= current_time <= config["close"]:
                return True
        return False

    @staticmethod
    def get_market_session() -> str:
        """Returns the active market session or 'closed'."""
        status = []
        for name, config in MarketHours.MARKETS.items():
            tz = pytz.timezone(config["tz"])
            now = datetime.now(tz)
            current_time = now.time()
            
            if name == "Crypto":
                status.append("crypto-live")
                continue

            if now.weekday() >= 5:
                continue

            if config["open"] <= current_time <= config["close"]:
                status.append(f"{name.lower()}-open")
            elif time(4, 0) <= current_time < config["open"]:
                status.append(f"{name.lower()}-pre")
        
        return ", ".join(status) if status else "closed"
