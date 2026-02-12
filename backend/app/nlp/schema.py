# backend/app/nlp/schema.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PhysicsEntity(BaseModel):
    """Represents a physics entity extracted from text"""
    name: str
    type: str = "projectile"  # Add default
    mass: float = 1.0
    radius: float = 0.5
    color: str = "#3498db"
    initial_position: Dict[str, float] = Field(default_factory=lambda: {"x": 50.0, "y": 0.0})
    initial_velocity: Dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})

class PhysicsForce(BaseModel):
    """Represents a force in the simulation"""
    type: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class SimulationScenario(BaseModel):
    """Structured representation of a physics problem"""
    description: str
    scenario_type: str = "projectile"  # Add default
    entities: List[PhysicsEntity]
    forces: List[PhysicsForce] = Field(default_factory=list)  # Make optional with default
    environment: Dict[str, Any] = Field(default_factory=lambda: {
        "width": 100,
        "height": 100,
        "ground_level": 0
    })
    duration: float = 10.0

class ParsedProblem(BaseModel):
    """Response from NLP parsing"""
    success: bool
    scenario: Optional[SimulationScenario] = None
    error_message: Optional[str] = None
