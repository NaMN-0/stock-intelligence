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
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "BRK-B", "UNH", "V", 
            "JNJ", "WMT", "JPM", "PG", "MA", "LLY", "CVX", "HD", "ABBV", "KO", 
            "AVGO", "PEP", "ORCL", "MRK", "BAC", "COST", "TMO", "PFE", "ADBE", "ABT", 
            "CSCO", "NKE", "MCD", "DIS", "WFC", "CRM", "VZ", "AMD", "PM", "T", 
            "TXN", "DHR", "INTC", "HON", "UPS", "NEE", "MS", "RTX", "LOW", "IBM", 
            "COP", "CVS", "CAT", "AXP", "AMAT", "DE", "GE", "LMT", "GS", "INTU", 
            "PLD", "BLK", "BKNG", "TJX", "MDLZ", "ADP", "CI", "ABNB", "GILD", "SYK", 
            "PANW", "SNPS", "REGN", "ISRG", "ADI", "LRCX", "VRTX", "EQIX", "CDNS", "EL", 
            "MU", "SLB", "ZTS", "KLAC", "EOG", "BSX", "AMT", "HUM", "C", "MO", 
            "PYPL", "LULU", "MAR", "CME", "MPC", "AON", "TGT", "ADSK", "ORLY", "PH", 
            "PGR", "CTAS", "MCK", "MARA", "RIOT", "COIN", "MSTR", "SOXL", "TQQQ", "SQ",
            "MVIS", "MULN", "GNS", "BBI", "AMC", "GME", "BB", "NKLA", "AAL", "CCL",
            "DAL", "UAL", "SAVE", "JETS", "XOM", "BP", "SHEL", "TTE", "VLO", "PSX",
            "OXY", "DVN", "HAL", "BKR", "KMI", "WMB", "OKE", "MPW", "RITM", "NLY",
            "AGNC", "STWD", "BX", "KRR", "APO", "FIG", "KKR", "TROW", "BEN", "STT",
            "BK", "AMP", "PRU", "MET", "AFL", "ALL", "TRV", "CB", "PGR", "MTB",
            "FITB", "HBAN", "KEY", "RF", "CFG", "TFC", "PNC", "USB", "SCHW", "TD",
            "RY", "BMO", "BNS", "CM", "HSBC", "SAN", "BBVA", "ING", "CS", "DB",
            "UBS", "LYG", "BCS", "NWG", "RELI", "INFY", "WIT", "HDB", "IBN", "TSM",
            "ASML", "BABA", "JD", "PDD", "BIDU", "NTES", "TME", "IQ", "BILI", "XPEV",
            "LI", "NIO", "BYDDF", "HMC", "TM", "STLA", "RACE", "F", "GM", "LCID",
            "RIVN", "FSR", "WKHS", "QS", "CHPT", "BLNK", "EVGO", "PLUG", "FCEL", "BE",
            "NEE", "DUK", "SO", "D", "AEP", "EXC", "SRE", "XEL", "ED", "PEG",
            "PCG", "FE", "WEC", "ES", "AWK", "VST", "TLN", "CEG", "NET", "OKTA",
            "CRWD", "ZS", "DDOG", "SNOW", "PLTR", "AI", "PATH", "U", "RBLX", "SE",
            "MELI", "SHOP", "SQ", "PYPL", "AFRM", "UPST", "SOFI", "HOOD", "COIN", "MARA",
            "RIOT", "HUT", "HIVE", "BITF", "CLSK", "WULF", "MSTR", "DKNG", "PENN", "WYNN",
            "LVS", "MLCO", "CZR", "MGM", "HLT", "MAR", "H", "BKNG", "EXPE", "TRIP",
            "ABNB", "UBER", "LYFT", "DASH", "GRUB", "TKWY", "W", "CHWY", "ETSY", "EBAY"
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
                    if data.empty: continue

                    for ticker in chunk:
                        try:
                            df = data[ticker] if len(chunk) > 1 else data
                            if df.empty or len(df) < 2: continue
                            
                            last = df.iloc[-1]
                            prev = df.iloc[-2]
                            price = float(last['Close'])
                            # Lowered floor for penny stocks
                            if price < 0.05 or math.isnan(price): continue
                            
                            volat = (last['High'] - last['Low']) / price if price > 0 else 0
                            v_ratio = last['Volume'] / df['Volume'].mean() if df['Volume'].mean() > 0 else 1
                            gap = abs(last['Open'] - prev['Close']) / prev['Close'] if prev['Close'] > 0 else 0
                            
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
