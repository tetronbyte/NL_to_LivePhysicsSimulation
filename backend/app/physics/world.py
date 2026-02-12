# backend/app/physics/world.py (UPDATE)
from typing import List, Dict, Optional
from .object import PhysicsObject
from .vector import Vector
from .collision import CollisionDetector, CollisionResolver
from .energy import EnergyCalculator, EnergyTracker

class World:
    """Represents the physics world containing all objects"""
    
    def __init__(
        self,
        width: float = 100,
        height: float = 100,
        ground_level: Optional[float] = None
    ):
        self.width = width
        self.height = height
        self.ground_level = ground_level if ground_level is not None else 0
        self.objects: List[PhysicsObject] = []
        self.time = 0.0
        
        # Collision detection
        self.collision_enabled = True
        self.collision_detector = CollisionDetector()
        self.collision_resolver = CollisionResolver()
        
        # Energy tracking
        self.energy_tracker = EnergyTracker()
        
        # World settings
        self.gravity_enabled = True
        self.gravity_strength = 9.8
        
    def add_object(self, obj: PhysicsObject):
        """Add an object to the world"""
        self.objects.append(obj)
    
    def remove_object(self, object_id: str):
        """Remove an object by ID"""
        self.objects = [obj for obj in self.objects if obj.object_id != object_id]
    
    def get_object(self, object_id: str) -> Optional[PhysicsObject]:
        """Get object by ID"""
        for obj in self.objects:
            if obj.object_id == object_id:
                return obj
        return None
    
    def clear(self):
        """Remove all objects"""
        self.objects.clear()
        self.time = 0.0
        self.energy_tracker.clear()
    
    def check_ground_collision(self, obj: PhysicsObject) -> bool:
        """Check if object hits the ground"""
        if obj.position.y - obj.radius <= self.ground_level:
            obj.position.y = self.ground_level + obj.radius
            return True
        return False
    
    def handle_ground_collisions(self):
        """Handle ground collisions with coefficient of restitution"""
        for obj in self.objects:
            if obj.is_static:
                continue
            
            if self.check_ground_collision(obj):
                # Apply restitution
                obj.velocity.y = abs(obj.velocity.y) * obj.restitution
                if obj.velocity.y < 0.5:  # Stop if velocity too small
                    obj.velocity.y = 0
                    obj.velocity.x *= 0.9  # Apply some friction
    
    def handle_object_collisions(self):
        """Handle collisions between objects"""
        if not self.collision_enabled:
            return
        
        # Check all pairs of objects
        for i in range(len(self.objects)):
            for j in range(i + 1, len(self.objects)):
                obj1 = self.objects[i]
                obj2 = self.objects[j]
                
                # Skip if either is static
                if obj1.is_static or obj2.is_static:
                    continue
                
                # Detect collision
                result = self.collision_detector.check_circle_circle(obj1, obj2)
                
                if result.collided:
                    # Separate objects
                    self.collision_resolver.separate_objects(obj1, obj2, result.penetration, result.normal)
                    
                    # Resolve collision based on type
                    if obj1.collision_type == "elastic" and obj2.collision_type == "elastic":
                        self.collision_resolver.resolve_elastic(obj1, obj2, result.normal)
                    elif obj1.collision_type == "perfectly_inelastic" or obj2.collision_type == "perfectly_inelastic":
                        self.collision_resolver.resolve_perfectly_inelastic(obj1, obj2)
                    else:
                        # Inelastic with average restitution
                        avg_restitution = (obj1.restitution + obj2.restitution) / 2
                        self.collision_resolver.resolve_inelastic(obj1, obj2, result.normal, avg_restitution)
    
    def handle_collisions(self):
        """Handle all collisions"""
        self.handle_ground_collisions()
        self.handle_object_collisions()
    
    def calculate_total_energy(self) -> Dict[str, float]:
        """Calculate total energy in the system"""
        total_ke = EnergyCalculator.total_kinetic_energy(self.objects)
        total_pe = EnergyCalculator.total_potential_energy(self.objects, self.gravity_strength, self.ground_level)
        total_me = total_ke + total_pe
        
        return {
            "kinetic": total_ke,
            "potential": total_pe,
            "mechanical": total_me
        }
    
    def get_total_momentum(self) -> Vector:
        """Calculate total momentum in the system"""
        from .collision import MomentumCalculator
        return MomentumCalculator.total_momentum(self.objects)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        energy = self.calculate_total_energy()
        momentum = self.get_total_momentum()
        
        return {
            "width": self.width,
            "height": self.height,
            "ground_level": self.ground_level,
            "objects": [obj.to_dict() for obj in self.objects],
            "time": self.time,
            "gravity_enabled": self.gravity_enabled,
            "gravity_strength": self.gravity_strength,
            "collision_enabled": self.collision_enabled,
            
            # System properties
            "total_kinetic_energy": energy["kinetic"],
            "total_potential_energy": energy["potential"],
            "total_mechanical_energy": energy["mechanical"],
            "total_momentum": momentum.to_dict(),
            "total_momentum_magnitude": momentum.magnitude(),
            
            # Energy tracking
            "energy_history": self.energy_tracker.to_dict()
        }
