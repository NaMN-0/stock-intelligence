import yaml
import os
from pydantic import BaseModel, Field
from typing import List

class AppConfig(BaseModel):
    name: str
    version: str

class MarketConfig(BaseModel):
    region: str
    timezone: str
    polling_interval_seconds: int
    historical_period_months: int

class DataConfig(BaseModel):
    cache_dir: str
    timeframes: List[str]

class LoggingConfig(BaseModel):
    level: str
    format: str

class Config(BaseModel):
    app: AppConfig
    market: MarketConfig
    data: DataConfig
    logging: LoggingConfig

def load_config(config_path: str = "config/app_config.yaml") -> Config:
    with open(config_path, "r") as f:
        config_dict = yaml.safe_load(f)
    return Config(**config_dict)

def load_tickers(tickers_path: str = "config/tickers.yaml") -> List[str]:
    with open(tickers_path, "r") as f:
        tickers_dict = yaml.safe_load(f)
    return tickers_dict.get("tickers", [])

# Global config instance
settings = load_config()
tickers = load_tickers()
