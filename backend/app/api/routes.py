# backend/app/api/routes.py (UPDATE)
from fastapi import APIRouter, HTTPException
import traceback
from ..models.pydantic_models import (
    SimulationRequest,
    SimulationResponse,
    UpdateParameterRequest,
    StepRequest,
    CreateObjectRequest,
    UpdateWorldRequest,
    CircularMotionRequest,
    CollisionSettingsRequest,
    ScenarioPresetRequest,
    VectorModel
)
from ..services.simulation_service import SimulationService
from ..physics.vector import Vector

router = APIRouter()
simulation_service = SimulationService()

@router.post("/simulate", response_model=SimulationResponse)
async def create_simulation(request: SimulationRequest):
    """Create a new simulation from natural language problem"""
    try:
        result = await simulation_service.create_from_text(request.problem_text)
        
        if not result.get("success"):
            error_msg = result.get("error_message", "Unknown error")
            print(f"Simulation creation failed: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        return SimulationResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception in create_simulation: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preset")
async def create_preset(request: ScenarioPresetRequest):
    """Create simulation from preset"""
    result = simulation_service.create_preset(request.preset_name, request.parameters)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error_message"))
    
    return result

@router.post("/step")
async def step_simulation(request: StepRequest):
    """Advance simulation by specified steps"""
    result = simulation_service.step(request.num_steps)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/step-once")
async def step_once():
    """Execute single step (for step-by-step mode)"""
    result = simulation_service.step_once()
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/add-object")
async def add_object(request: CreateObjectRequest):
    """Add a new object to the simulation"""
    obj_data = {
        "mass": request.mass,
        "position": {"x": request.position.x, "y": request.position.y},
        "velocity": {"x": request.velocity.x, "y": request.velocity.y},
        "radius": request.radius,
        "label": request.label,
        "color": request.color,
        "shape": request.shape,
        "width": request.width,
        "height": request.height
    }
    
    result = simulation_service.add_object(obj_data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/update")
async def update_parameter(request: UpdateParameterRequest):
    """Update simulation parameter"""
    result = simulation_service.update_parameter(
        request.object_id,
        request.parameter,
        request.value
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/update-world")
async def update_world(request: UpdateWorldRequest):
    """Update world settings"""
    updates = {}
    if request.gravity_enabled is not None:
        updates["gravity_enabled"] = request.gravity_enabled
    if request.gravity_strength is not None:
        updates["gravity_strength"] = request.gravity_strength
    if request.collision_enabled is not None:
        updates["collision_enabled"] = request.collision_enabled
    
    result = simulation_service.update_world(updates)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/circular-motion")
async def set_circular_motion(request: CircularMotionRequest):
    """Set circular motion for an object"""
    center = Vector(request.center.x, request.center.y)
    result = simulation_service.set_circular_motion(
        request.object_id,
        center,
        request.radius,
        request.angular_velocity,
        request.initial_angle,
        request.enabled
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/collision-settings")
async def set_collision_settings(request: CollisionSettingsRequest):
    """Set collision settings for an object"""
    result = simulation_service.set_collision_settings(
        request.object_id,
        request.collision_type,
        request.restitution
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/reset")
async def reset_simulation():
    """Reset simulation to initial state"""
    result = simulation_service.reset()
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/start")
async def start_simulation():
    """Start simulation"""
    simulation_service.start()
    return {"status": "started"}

@router.post("/stop")
async def stop_simulation():
    """Stop simulation"""
    simulation_service.stop()
    return {"status": "stopped"}

@router.get("/state")
async def get_state():
    """Get current simulation state"""
    if simulation_service.world:
        return simulation_service.world.to_dict()
    else:
        raise HTTPException(status_code=404, detail="No active simulation")

# backend/app/api/routes.py (ADD new endpoint)
@router.post("/circular-motion-radius")
async def update_circular_motion_radius(object_id: str, radius: float):
    """Update circular motion radius"""
    if not simulation_service.world:
        raise HTTPException(status_code=400, detail="No active simulation")
    
    obj = simulation_service.world.get_object(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    
    if not obj.circular_motion or not obj.circular_motion.enabled:
        raise HTTPException(status_code=400, detail="Object is not in circular motion")
    
    obj.circular_motion.set_radius(radius)
    
    return {"success": True, "world_state": simulation_service.world.to_dict()}
