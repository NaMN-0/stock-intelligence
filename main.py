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
from src.api import routes

orchestrator = ServiceOrchestrator()
routes.orchestrator_instance = orchestrator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Intelligence Server...")
    # Start orchestrator in the background so the port binds immediately
    asyncio.create_task(orchestrator.start())
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
    import os
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting {settings.app.name} on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
