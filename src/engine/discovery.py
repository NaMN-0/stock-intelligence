import pandas as pd
import numpy as np
import yfinance as yf
from src.core.logger import logger
from typing import List, Tuple
import asyncio
import math

class TickerDiscovery:
    @staticmethod
    def get_all_indices_tickers() -> List[str]:
        """Scrapes tickers from S&P 500, NASDAQ-100, Dow 30, and Russell 1000."""
        import requests
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        all_tickers = set()

        sources = [
            ("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies", 0, "Symbol"),
            ("https://en.wikipedia.org/wiki/Nasdaq-100", 4, "Ticker"),
            ("https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average", 1, "Symbol"),
            ("https://en.wikipedia.org/wiki/Russell_1000_Index", 2, "Ticker"),
            ("https://en.wikipedia.org/wiki/List_of_S%26P_600_companies", 0, "Symbol")
        ]

        # Massive fallback list (Top 300+ most active/major stocks)
        fallback = [
            # Global & Crypto Fallback (24/7 Coverage)
            "BTC-USD", "ETH-USD", "SOL-USD", "DOGE-USD", "XRP-USD", "ADA-USD",
            "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS", "SBI-N.NS",
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "BRK-B", "UNH", "V", 
            "JNJ", "WMT", "JPM", "PG", "MA", "LLY", "CVX", "HD", "KO", 
            "AVGO", "PEP", "ORCL", "MRK", "BAC", "COST", "TMO", "PFE", "ADBE", "ABT", 
            "CSCO", "NKE", "MCD", "DIS", "WFC", "CRM", "VZ", "AMD", "PM", "T", 
            "TXN", "DHR", "INTC", "HON", "UPS", "NEE", "MS", "RTX", "LOW", "IBM", 
            "AMAT", "DE", "GE", "LMT", "GS", "INTU", 
            "PLD", "BLK", "BKNG", "TJX", "MDLZ", "ADP", "CI", "ABNB", "GILD", "SYK", 
            "PANW", "SNPS", "REGN", "ISRG", "ADI", "VRTX", "EQIX", "CDNS", "EL", 
            "MU", "SLB", "ZTS", "EOG", "BSX", "AMT", "HUM", "C", "MO", 
            "PYPL", "LULU", "MAR", "CME", "MPC", "AON", "TGT", "ADSK", "ORLY", "PH", 
            "PGR", "CTAS", "MCK", "MARA", "RIOT", "COIN", "MSTR", "SOXL", "TQQQ",
            "MVIS", "AMC", "GME", "BB", "AAL", "CCL",
            "DAL", "UAL", "JETS", "XOM", "BP", "SHEL", "TTE", "VLO", "PSX",
            "OXY", "DVN", "HAL", "BKR", "KMI", "WMB", "OKE", "MPW", "RITM", "NLY",
            "AGNC", "STWD", "BX", "APO", "FIG", "KKR", "TROW", "BEN", "STT",
            "BK", "AMP", "PRU", "MET", "AFL", "ALL", "TRV", "CB", "MTB",
            "FITB", "HBAN", "KEY", "RF", "CFG", "TFC", "PNC", "USB", "SCHW", "TD",
            "RY", "BMO", "BNS", "CM", "HSBC", "SAN", "BBVA", "ING",
            "UBS", "LYG", "BCS", "NWG", "RELI", "INFY", "WIT", "HDB", "IBN", "TSM",
            "ASML", "BABA", "JD", "PDD", "BIDU", "NTES", "TME", "IQ", "BILI", "XPEV",
            "LI", "NIO", "BYDDF", "HMC", "TM", "STLA", "RACE", "F", "GM", "LCID",
            "RIVN", "WKHS", "QS", "CHPT", "BLNK", "EVGO", "PLUG", "BE",
            "DUK", "SO", "D", "AEP", "EXC", "SRE", "XEL", "ED", "PEG",
            "PCG", "FE", "WEC", "ES", "AWK", "VST", "TLN", "CEG", "NET", "OKTA",
            "CRWD", "ZS", "DDOG", "SNOW", "PLTR", "AI", "PATH", "U", "RBLX", "SE",
            "MELI", "SHOP", "AFRM", "UPST", "SOFI", "HOOD", "HUT", "HIVE", "BITF", "CLSK", "WULF", "DKNG", "PENN", "WYNN",
            "LVS", "MLCO", "CZR", "MGM", "HLT", "H", "EXPE", "TRIP",
            "UBER", "LYFT", "DASH", "W", "CHWY", "ETSY", "EBAY"
        ]

        for url, table_index, col_name in sources:
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    tables = pd.read_html(response.text)
                    df = tables[table_index]
                    tickers_list = df[col_name].tolist()
                    all_tickers.update([str(t).replace('.', '-') for t in tickers_list])
            except Exception as e:
                logger.debug(f"Failed to fetch from {url}: {e}")

        if not all_tickers:
            return fallback

        return list(all_tickers)

    @staticmethod
    async def get_high_potential_tickers(limit: int = 1000) -> List[str]:
        """
        Fetches the complete universe of major tickers and ranks them.
        """
        logger.info(f"Scanning universe for high-potential assets (Limit: {limit})...")
        
        pool = TickerDiscovery.get_all_indices_tickers()
        if not pool: return []
            
        logger.debug(f"Initial universe size: {len(pool)} tickers.")
        
        try:
            # Batch ranking logic for 1000 tickers - using chunks to avoid timeouts
            scored_tickers: List[Tuple[str, float]] = []
            chunk_size = 50
            
            for i in range(0, len(pool), chunk_size):
                chunk = pool[i:i + chunk_size]
                try:
                    data = await asyncio.to_thread(yf.download, tickers=chunk, period="5d", interval="1d", progress=False, group_by="ticker")
                    if data is None or data.empty: continue

                    for ticker in chunk:
                        try:
                            if len(chunk) > 1:
                                if ticker not in data.columns.get_level_values(0):
                                    continue
                                df = data[ticker]
                            else:
                                df = data
                            if df.empty or len(df) < 2: continue
                            
                            last = df.iloc[-1]
                            prev = df.iloc[-2]
                            price_val = last['Close']
                            price = float(price_val.iloc[0] if hasattr(price_val, 'iloc') else price_val)
                            
                            # Lowered floor for penny stocks
                            if price < 0.05 or math.isnan(price): continue
                            
                            high_val = last['High']
                            low_val = last['Low']
                            high = float(high_val.iloc[0] if hasattr(high_val, 'iloc') else high_val)
                            low = float(low_val.iloc[0] if hasattr(low_val, 'iloc') else low_val)
                            
                            volat = (high - low) / price if price > 0 else 0
                            
                            vol_val = last['Volume']
                            vol = float(vol_val.iloc[0] if hasattr(vol_val, 'iloc') else vol_val)
                            avg_vol = df['Volume'].squeeze().mean()
                            
                            v_ratio = vol / avg_vol if avg_vol > 0 else 1
                            
                            prev_close_val = prev['Close']
                            prev_close = float(prev_close_val.iloc[0] if hasattr(prev_close_val, 'iloc') else prev_close_val)
                            open_val = last['Open']
                            curr_open = float(open_val.iloc[0] if hasattr(open_val, 'iloc') else open_val)
                            
                            gap = abs(curr_open - prev_close) / prev_close if prev_close > 0 else 0
                            
                            # For penny stocks, volatility and volume ratio are weighted higher
                            if price < 5.0:
                                score = (volat * 150) + (v_ratio * 5) + (gap * 100)
                            else:
                                score = (volat * 100) + (v_ratio * 3) + (gap * 60)
                            
                            if math.isnan(score) or math.isinf(score): score = 0
                            
                            scored_tickers.append((ticker, score))
                        except Exception: continue
                except Exception as e:
                    logger.debug(f"Discovery chunk {i} failed: {e}")
                    continue
            
            scored_tickers.sort(key=lambda x: x[1], reverse=True)
            top = [t[0] for t in scored_tickers[:limit]]
            logger.info(f"Discovery Complete: Selected top {len(top)} assets.")
            return top
            
        except Exception as e:
            logger.error(f"Universe discovery failed: {e}")
            return pool[:limit]
