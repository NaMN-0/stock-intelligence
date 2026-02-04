import sqlite3
import json
import os
from datetime import datetime
from src.core.config import settings
from src.core.logger import logger
from src.utils.serialization import sanitize_json_data

class DatabaseManager:
    def __init__(self):
        self.db_path = os.path.join(settings.data.cache_dir, "market_data.db")
        self._init_db()

    def _init_db(self):
        """Initializes the database schema."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # Table for Ticker States
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ticker_states (
                        ticker TEXT PRIMARY KEY,
                        last_price REAL,
                        last_update TEXT,
                        best_strategy TEXT,
                        last_signal TEXT,
                        expected_move TEXT
                    )
                """)
                # Table for System Metrics
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS system_metrics (
                        id INTEGER PRIMARY KEY DEFAULT 1,
                        total_tickers INTEGER,
                        processed_tickers INTEGER,
                        data_processed_mb REAL,
                        errors_count INTEGER,
                        last_error TEXT,
                        updated_at TEXT
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")

    def save_ticker_state(self, ticker: str, state_dict: dict):
        """Saves or updates a ticker's state in the database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO ticker_states 
                    (ticker, last_price, last_update, best_strategy, last_signal, expected_move)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    ticker,
                    state_dict.get('last_price'),
                    state_dict.get('last_update').isoformat() if state_dict.get('last_update') else None,
                    state_dict.get('best_strategy'),
                    json.dumps(sanitize_json_data(state_dict.get('last_signal'))),
                    json.dumps(sanitize_json_data(state_dict.get('expected_move')))
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"DB Error saving {ticker}: {e}")

    def load_all_ticker_states(self) -> dict:
        """Loads all ticker states from the database."""
        states = {}
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM ticker_states")
                for row in cursor.fetchall():
                    ticker = row['ticker']
                    states[ticker] = {
                        'ticker': ticker,
                        'last_price': row['last_price'],
                        'last_update': datetime.fromisoformat(row['last_update']) if row['last_update'] else None,
                        'best_strategy': row['best_strategy'],
                        'last_signal': json.loads(row['last_signal']) if row['last_signal'] else None,
                        'expected_move': json.loads(row['expected_move']) if row['expected_move'] else None
                    }
        except Exception as e:
            logger.error(f"DB Error loading states: {e}")
        return states

    def save_metrics(self, metrics_dict: dict):
        """Saves system metrics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO system_metrics 
                    (id, total_tickers, processed_tickers, data_processed_mb, errors_count, last_error, updated_at)
                    VALUES (1, ?, ?, ?, ?, ?, ?)
                """, (
                    metrics_dict.get('total_tickers'),
                    metrics_dict.get('processed_tickers'),
                    metrics_dict.get('data_processed_mb'),
                    metrics_dict.get('errors_count'),
                    metrics_dict.get('last_error'),
                    datetime.now().isoformat()
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"DB Error saving metrics: {e}")

    def load_metrics(self) -> dict:
        """Loads system metrics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM system_metrics WHERE id = 1")
                row = cursor.fetchone()
                if row:
                    return {
                        'total_tickers': row['total_tickers'],
                        'processed_tickers': row['processed_tickers'],
                        'data_processed_mb': row['data_processed_mb'],
                        'errors_count': row['errors_count'],
                        'last_error': row['last_error']
                    }
        except Exception as e:
            logger.error(f"DB Error loading metrics: {e}")
        return {}
