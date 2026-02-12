# backend/app/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json

class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, simulation_service):
    """WebSocket endpoint for real-time simulation updates"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Wait for commands from client
            data = await websocket.receive_text()
            command = json.loads(data)
            
            if command["type"] == "step":
                result = simulation_service.step(1)
                await websocket.send_json(result)
            
            elif command["type"] == "start":
                simulation_service.start()
                # Send updates in real-time
                while simulation_service.simulator and simulation_service.simulator.is_running:
                    result = simulation_service.step(1)
                    await websocket.send_json(result)
                    await asyncio.sleep(0.016)  # 60 FPS
            
            elif command["type"] == "stop":
                simulation_service.stop()
                await websocket.send_json({"status": "stopped"})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
