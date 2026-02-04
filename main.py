import uvicorn
import asyncio
import pandas as pd # Required for health check timestamp
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.core.config import settings
from src.core.logger import logger
from src.engine.orchestrator import ServiceOrchestrator

orchestrator = ServiceOrchestrator()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Intelligence Server...")
    await orchestrator.start()
    yield
    # Shutdown
    logger.info("Shutting down Intelligence Server...")
    await orchestrator.stop()

app = FastAPI(
    title=settings.app.name,
    version=settings.app.version,
    lifespan=lifespan
)

app.add_middleware( CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    logger.info(f"Starting {settings.app.name} on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
