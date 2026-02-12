# backend/app/physics/object.py (UPDATE)
from typing import List, Optional, Dict
from .vector import Vector
from .forces import Force
from .circular_motion import CircularMotion
from .energy import EnergyCalculator

class PhysicsObject:
    """Represents a physics object in the simulation"""
    
    def __init__(
        self,
        mass: float,
        position: Vector,
        velocity: Vector,
        radius: float = 0.5,
        label: str = "Object",
        color: str = "#3498db",
        object_id: Optional[str] = None,
        shape: str = "circle",  # "circle", "square", "rectangle"
        width: float = 1.0,
        height: float = 1.0
    ):
        self.mass = mass
        self.position = position
        self.velocity = velocity
        self.radius = radius
        self.label = label
        self.color = color
        self.object_id = object_id or label
        self.shape = shape
        self.width = width
        self.height = height
        
        self.forces: List[Force] = []
        self.acceleration = Vector(0, 0)
        self.trajectory: List[dict] = []
        self.is_static = False
        
        # Initial state (for tracking displacement)
        self.initial_position = Vector(position.x, position.y)
        self.initial_velocity = Vector(velocity.x, velocity.y)
        
        # Circular motion
        self.circular_motion: Optional[CircularMotion] = None
        
        # Energy tracking
        self.kinetic_energy = 0.0
        self.potential_energy = 0.0
        
        # Collision properties
        self.collision_type = "elastic"  # "elastic", "inelastic", "perfectly_inelastic"
        self.restitution = 1.0  # Coefficient of restitution
        
        # Momentum
        self.momentum = Vector(0, 0)
        
        # Display options
        self.show_velocity_vector = True
        self.show_force_vectors = False
        self.show_trajectory = True
        
    def apply_force(self, force: Force):
        """Add a force to the object"""
        self.forces.append(force)
    
    def clear_forces(self):
        """Remove all forces"""
        self.forces.clear()
    
    def enable_circular_motion(self, center: Vector, radius: float, angular_velocity: float, initial_angle: float = 0):
        """Enable circular motion for this object"""
        self.circular_motion = CircularMotion(center, radius, angular_velocity, initial_angle)
        self.circular_motion.enabled = True
    
    def disable_circular_motion(self):
        """Disable circular motion"""
        if self.circular_motion:
            self.circular_motion.enabled = False
    
    def update(self, dt: float, g: float = 9.8):
        """Update object state using Euler integration"""
        if self.is_static:
            return
        
        # Handle circular motion separately
        if self.circular_motion and self.circular_motion.enabled:
            self.circular_motion.update(self, dt)
            # Update energy for circular motion
            self.kinetic_energy = EnergyCalculator.kinetic_energy(self)
            self.potential_energy = EnergyCalculator.potential_energy(self, g)
            self.momentum = self.velocity * self.mass
            
            # Store trajectory
            if self.show_trajectory and len(self.trajectory) < 1000:
                self.trajectory.append({
                    "x": self.position.x,
                    "y": self.position.y,
                    "time": len(self.trajectory) * dt
                })
            return
        
        # Calculate net force
        net_force = Vector(0, 0)
        for force in self.forces:
            net_force = net_force + force.compute(self)
        
        # F = ma => a = F/m
        if self.mass > 0:
            self.acceleration = net_force / self.mass
        else:
            self.acceleration = Vector(0, 0)
        
        # Update velocity: v = v0 + a*dt
        self.velocity = self.velocity + (self.acceleration * dt)
        
        # Update position: x = x0 + v*dt
        self.position = self.position + (self.velocity * dt)
        
        # Update energy
        self.kinetic_energy = EnergyCalculator.kinetic_energy(self)
        self.potential_energy = EnergyCalculator.potential_energy(self, g)
        
        # Update momentum
        self.momentum = self.velocity * self.mass
        
        # Store trajectory for visualization
        if self.show_trajectory and len(self.trajectory) < 1000:  # Limit trajectory points
            self.trajectory.append({
                "x": self.position.x,
                "y": self.position.y,
                "time": len(self.trajectory) * dt
            })
    
    def get_displacement(self) -> Vector:
        """Get displacement from initial position"""
        return self.position - self.initial_position
    
    def get_distance_traveled(self) -> float:
        """Get total distance traveled along trajectory"""
        if len(self.trajectory) < 2:
            return 0.0
        
        distance = 0.0
        for i in range(1, len(self.trajectory)):
            p1 = Vector(self.trajectory[i-1]["x"], self.trajectory[i-1]["y"])
            p2 = Vector(self.trajectory[i]["x"], self.trajectory[i]["y"])
            distance += p1.distance_to(p2)
        return distance
    
    def reset_to_initial(self):
        """Reset object to initial state"""
        self.position = Vector(self.initial_position.x, self.initial_position.y)
        self.velocity = Vector(self.initial_velocity.x, self.initial_velocity.y)
        self.acceleration = Vector(0, 0)
        self.trajectory.clear()
        if self.circular_motion:
            self.circular_motion.angle = 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        data = {
            "id": self.object_id,
            "mass": self.mass,
            "position": self.position.to_dict(),
            "velocity": self.velocity.to_dict(),
            "acceleration": self.acceleration.to_dict(),
            "radius": self.radius,
            "label": self.label,
            "color": self.color,
            "is_static": self.is_static,
            "shape": self.shape,
            "width": self.width,
            "height": self.height,
            
            # Energy and momentum
            "kinetic_energy": self.kinetic_energy,
            "potential_energy": self.potential_energy,
            "mechanical_energy": self.kinetic_energy + self.potential_energy,
            "momentum": self.momentum.to_dict(),
            "momentum_magnitude": self.momentum.magnitude(),
            
            # Initial state
            "initial_position": self.initial_position.to_dict(),
            "initial_velocity": self.initial_velocity.to_dict(),
            "displacement": self.get_displacement().to_dict(),
            "displacement_magnitude": self.get_displacement().magnitude(),
            "distance_traveled": self.get_distance_traveled(),
            
            # Display options
            "show_velocity_vector": self.show_velocity_vector,
            "show_force_vectors": self.show_force_vectors,
            "show_trajectory": self.show_trajectory,
            
            # Collision properties
            "collision_type": self.collision_type,
            "restitution": self.restitution,
        }
        
        # Add circular motion info if enabled
        if self.circular_motion and self.circular_motion.enabled:
            data["circular_motion"] = self.circular_motion.to_dict()
        
        return data
