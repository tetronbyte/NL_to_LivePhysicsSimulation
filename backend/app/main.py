# backend/app/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .api import routes, websocket
from .services.simulation_service import SimulationService

app = FastAPI(title="Physics Simulation API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(routes.router, prefix="/api", tags=["simulation"])

# WebSocket endpoint
simulation_service = SimulationService()

@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await websocket.websocket_endpoint(websocket, simulation_service)

@app.get("/")
async def root():
    return {
        "message": "Physics Simulation API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
