from fastapi import APIRouter, HTTPException
import pandas as pd
from typing import List, Dict, Any
import asyncio
from src.core.config import tickers
from src.core.state import state_cache
from src.data.historical_data import HistoricalDataManager
from src.core.logger import logger

from src.utils.serialization import sanitize_json_data

router = APIRouter()
data_manager = HistoricalDataManager()

# Registry for orchestrator to avoid circular imports
orchestrator_instance = None

@router.get("/tickers", response_model=List[str])
async def get_tickers():
    return tickers

@router.post("/tickers/add")
async def add_tickers(new_symbols: List[str]):
    """Adds new tickers to the universe and triggers discovery."""
    from src.core.config import tickers
    import yaml
    import os
    
    added = []
    for sym in new_symbols:
        s = sym.strip().upper()
        if s and s not in tickers:
            tickers.append(s)
            added.append(s)
    
    if added:
        # Persist to tickers.yaml
        try:
            config_path = os.path.join(os.getcwd(), "config", "tickers.yaml")
            with open(config_path, 'w') as f:
                yaml.dump({"tickers": tickers}, f)
            logger.info(f"Persisted {len(added)} new tickers to config")
        except Exception as e:
            logger.error(f"Failed to persist tickers: {e}")

        # Trigger orchestrator to start syncing these new tickers
        if orchestrator_instance:
            asyncio.create_task(orchestrator_instance.run_discovery())
        
    return {"status": "success", "added": added, "total": len(tickers)}

@router.get("/states")
async def get_all_states():
    # Sanitize to prevent NaN/Inf JSON errors
    return sanitize_json_data(state_cache.get_all_states())

@router.get("/system-metrics")
async def get_system_metrics():
    return sanitize_json_data(state_cache.get_metrics())

@router.get("/states/filter/{signal_type}")
async def get_filtered_states(signal_type: str):
    all_states = state_cache.get_all_states()
    filtered = {
        t: s for t, s in all_states.items() 
        if s.last_signal and s.last_signal.get("signal") == signal_type.lower()
    }
    return sanitize_json_data(filtered)

@router.get("/live-price/{ticker}")
async def get_live_price(ticker: str):
    state = state_cache.get_state(ticker.upper())
    if not state or state.last_price is None:
        raise HTTPException(status_code=404, detail="Ticker not found or no price data yet")
    return sanitize_json_data({
        "ticker": state.ticker,
        "price": state.last_price,
        "timestamp": state.last_update
    })

@router.get("/best-strategy/{ticker}")
async def get_best_strategy(ticker: str):
    state = state_cache.get_state(ticker.upper())
    if not state or not state.best_strategy:
        raise HTTPException(status_code=404, detail="Best strategy not yet determined for ticker")
    return sanitize_json_data({
        "ticker": state.ticker,
        "best_strategy": state.best_strategy
    })

@router.get("/current-signal/{ticker}")
async def get_current_signal(ticker: str):
    state = state_cache.get_state(ticker.upper())
    if not state or not state.last_signal:
        raise HTTPException(status_code=404, detail="No signal available for ticker")
    return sanitize_json_data(state.last_signal)

@router.get("/expected-move/{ticker}")
async def get_expected_move(ticker: str):
    state = state_cache.get_state(ticker.upper())
    if not state or not state.expected_move:
        raise HTTPException(status_code=404, detail="No forecast available for ticker")
    return sanitize_json_data(state.expected_move)

@router.get("/historical/{ticker}")
async def get_historical(ticker: str, timeframe: str = "1h"):
    ticker = ticker.upper()
    try:
        df = data_manager.get_historical_data(ticker, timeframe)
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="Historical data not found")
        
        # Return last 100 rows as JSON
        data = df.tail(100).reset_index().to_dict(orient="records")
        return sanitize_json_data(data)
    except Exception as e:
        state_cache.add_error(f"Historical api error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return sanitize_json_data({"status": "healthy", "timestamp": str(pd.Timestamp.now())})
