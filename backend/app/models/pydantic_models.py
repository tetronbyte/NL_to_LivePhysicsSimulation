# backend/app/models/pydantic_models.py (UPDATE)
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class VectorModel(BaseModel):
    x: float
    y: float

class CircularMotionModel(BaseModel):
    center: VectorModel
    radius: float
    angular_velocity: float
    angle: float
    angle_degrees: float
    tangential_velocity: float
    period: float
    frequency: float
    enabled: bool

class PhysicsObjectModel(BaseModel):
    id: str
    mass: float
    position: VectorModel
    velocity: VectorModel
    acceleration: VectorModel
    radius: float
    label: str
    color: str
    is_static: bool = False
    shape: str = "circle"
    width: float = 1.0
    height: float = 1.0
    
    # Energy and momentum
    kinetic_energy: float
    potential_energy: float
    mechanical_energy: float
    momentum: VectorModel
    momentum_magnitude: float
    
    # Initial state and displacement
    initial_position: VectorModel
    initial_velocity: VectorModel
    displacement: VectorModel
    displacement_magnitude: float
    distance_traveled: float
    
    # Display options
    show_velocity_vector: bool
    show_force_vectors: bool
    show_trajectory: bool
    
    # Collision properties
    collision_type: str
    restitution: float
    
    # Circular motion (optional)
    circular_motion: Optional[CircularMotionModel] = None

class EnergyHistoryModel(BaseModel):
    history: List[Dict[str, float]]
    initial_energy: Optional[float]
    energy_loss: float

class WorldStateModel(BaseModel):
    width: float
    height: float
    ground_level: float
    objects: List[PhysicsObjectModel]
    time: float
    gravity_enabled: bool
    gravity_strength: float
    collision_enabled: bool
    
    # System properties
    total_kinetic_energy: float
    total_potential_energy: float
    total_mechanical_energy: float
    total_momentum: VectorModel
    total_momentum_magnitude: float
    
    # Energy tracking
    energy_history: EnergyHistoryModel

class SimulationRequest(BaseModel):
    problem_text: str

class SimulationResponse(BaseModel):
    success: bool
    world_state: Optional[WorldStateModel] = None
    error_message: Optional[str] = None
    scenario_description: Optional[str] = None

class UpdateParameterRequest(BaseModel):
    object_id: str
    parameter: str  # "velocity", "position", "mass", "radius", "collision_type", etc.
    value: Dict[str, float] | float | str

class StepRequest(BaseModel):
    num_steps: int = 1

class CreateObjectRequest(BaseModel):
    mass: float = 1.0
    position: VectorModel
    velocity: VectorModel
    radius: float = 0.5
    label: str = "Object"
    color: str = "#3498db"
    shape: Literal["circle", "square", "rectangle"] = "circle"
    width: float = 1.0
    height: float = 1.0

class UpdateWorldRequest(BaseModel):
    gravity_enabled: Optional[bool] = None
    gravity_strength: Optional[float] = None
    collision_enabled: Optional[bool] = None

class CircularMotionRequest(BaseModel):
    object_id: str
    center: VectorModel
    radius: float
    angular_velocity: float
    initial_angle: float = 0.0
    enabled: bool = True

class ForceRequest(BaseModel):
    object_id: str
    force_type: Literal["gravity", "drag", "friction", "spring", "constant", "centripetal"]
    parameters: Dict[str, Any] = {}
    enabled: bool = True

class CollisionSettingsRequest(BaseModel):
    object_id: str
    collision_type: Literal["elastic", "inelastic", "perfectly_inelastic"]
    restitution: float = 1.0

class ScenarioPresetRequest(BaseModel):
    preset_name: Literal[
        "projectile_motion",
        "free_fall",
        "elastic_collision",
        "inelastic_collision",
        "circular_motion",
        "pendulum",
        "spring_oscillation",
        "newton_cradle"
    ]
    parameters: Dict[str, Any] = {}
