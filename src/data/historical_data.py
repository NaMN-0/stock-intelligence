import os
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from typing import Optional, Dict
import sys
from src.core.config import settings
from src.core.logger import logger
from src.core.state import state_cache

class HistoricalDataManager:
    def __init__(self):
        self.cache_dir = settings.data.cache_dir
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
            
    def get_historical_data(self, ticker: str, timeframe: str) -> Optional[pd.DataFrame]:
        """Fetches historical data for a ticker and timeframe."""
        cache_path = os.path.join(self.cache_dir, f"{ticker}_{timeframe}.parquet")
        cached_df = None
        if os.path.exists(cache_path):
            try:
                cached_df = pd.read_parquet(cache_path)
                last_ts = cached_df.index[-1]
                # If cache is fresh (within 1 hour for intraday), use it immediately
                if datetime.now(last_ts.tzinfo) - last_ts < timedelta(hours=1):
                    logger.debug(f"Loaded fresh cached data for {ticker} ({timeframe})")
                    return cached_df
            except Exception as e:
                logger.error(f"Error reading cache for {ticker} ({timeframe}): {e}")

        new_data = self.refresh_data(ticker, timeframe)
        if new_data is not None:
            return new_data
            
        if cached_df is not None:
            logger.warning(f"Refresh failed for {ticker}. Using stale cache as fallback.")
            return cached_df

        return None

    def refresh_data(self, ticker: str, timeframe: str) -> Optional[pd.DataFrame]:
        """Force refreshes historical data from yfinance."""
        logger.debug(f"Fetching fresh historical data for {ticker} ({timeframe})")
        
        period = f"{settings.market.historical_period_months}mo"
        
        # yfinance timeframe mapping
        interval_map = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "1h": "1h",
            "1d": "1d"
        }
        
        interval = interval_map.get(timeframe, "1d")
        
        # Adjust period for small intervals as yfinance has limits
        # 1m data is only available for the last 7 days
        # 5m/15m/1h data for the last 60 days
        if timeframe == "1m":
            period = "7d"
        elif timeframe in ["5m", "15m", "1h"]:
            period = "60d"
            
        try:
            data = yf.download(ticker, period=period, interval=interval, progress=False)
            if data.empty:
                logger.debug(f"No data returned for {ticker} ({timeframe})")
                return None
                
            # Ensure consistent index name for frontend
            data.index.name = "Datetime"
            
            cache_path = os.path.join(self.cache_dir, f"{ticker}_{timeframe}.parquet")
            data.to_parquet(cache_path)
            return data
        except Exception as e:
            logger.debug(f"Failed to fetch data for {ticker} ({timeframe}): {e}")
            return None

    def fetch_all(self, tickers: list):
        """Pre-fetches data for all tickers and timeframes in batches."""
        logger.info(f"Syncing historical data for {len(tickers)} assets...")
        
        for tf in settings.data.timeframes:
            # Determine period and interval
            interval_map = {"1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "1d": "1d"}
            interval = interval_map.get(tf, "1h")
            period = "60d" if tf in ["5m", "15m", "1h"] else "7d" if tf == "1m" else "1y"

            chunk_size = 50
            for i in range(0, len(tickers), chunk_size):
                chunk = tickers[i:i + chunk_size]
                try:
                    logger.debug(f"Fetching {tf} data chunk: {i}/{len(tickers)}...")
                    data = yf.download(chunk, period=period, interval=interval, progress=False, group_by="ticker")
                    
                    if data.empty: continue
                    
                    # Track total bytes processed (estimate from dataframe memory usage)
                    state_cache.track_data(data.memory_usage(deep=True).sum())

                    for ticker in chunk:
                        try:
                            ticker_data = data[ticker] if len(chunk) > 1 else data
                            if ticker_data.empty or ticker_data.isna().all().all():
                                continue
                                
                            # Ensure consistent index name for frontend
                            ticker_data.index.name = "Datetime"
                            
                            # Flatten columns if necessary
                            if isinstance(ticker_data.columns, pd.MultiIndex):
                                ticker_data.columns = ticker_data.columns.get_level_values(0)
                            
                            cache_path = os.path.join(self.cache_dir, f"{ticker}_{tf}.parquet")
                            ticker_data.to_parquet(cache_path)
                            
                            # Seed the initial price in state cache from the latest historical point
                            if not ticker_data['Close'].empty:
                                last_price = ticker_data['Close'].dropna().iloc[-1]
                                if hasattr(last_price, 'item'): last_price = float(last_price)
                                state_cache.update_price(ticker, float(last_price))
                        except Exception as e:
                            state_cache.add_error(f"Cache save error {ticker}: {str(e)}")
                            continue
                except Exception as e:
                    state_cache.add_error(f"Batch fetch failed {tf}: {str(e)}")
                    logger.debug(f"Batch fetch failed for chunk {i}: {e}")
