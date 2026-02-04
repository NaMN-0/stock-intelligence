import math
from typing import Any
from pydantic import BaseModel

def sanitize_json_data(data: Any) -> Any:
    """
    Recursively cleans data for JSON serialization.
    - Replaces NaN/Inf with None.
    - Converts Pydantic models to dictionaries.
    - Recursively processes dicts and lists.
    - Handles nested structures.
    """
    try:
        if isinstance(data, BaseModel):
            data = data.dict()
            
        if isinstance(data, dict):
            return {str(k): sanitize_json_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [sanitize_json_data(v) for v in data]
        elif isinstance(data, float):
            if math.isnan(data) or math.isinf(data):
                return None
            return data
        elif hasattr(data, 'isoformat'): # Handles datetime, date, pd.Timestamp
            return data.isoformat()
        elif hasattr(data, 'item'): # Handles numpy scalars
            val = data.item()
            return sanitize_json_data(val)
        elif hasattr(data, 'to_dict'):
            return sanitize_json_data(data.to_dict())
        return data
    except Exception:
        return None # Final fallback to prevent 500 crashes
