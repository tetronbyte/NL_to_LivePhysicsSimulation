# backend/app/physics/collision.py (NEW)
from .vector import Vector
from typing import List, Tuple, Optional
import math

class CollisionResult:
    """Result of a collision detection"""
    
    def __init__(self, collided: bool, normal: Vector = None, penetration: float = 0):
        self.collided = collided
        self.normal = normal or Vector.zero()
        self.penetration = penetration

class CollisionDetector:
    """Detect collisions between physics objects"""
    
    @staticmethod
    def check_circle_circle(obj1, obj2) -> CollisionResult:
        """Check collision between two circular objects"""
        displacement = obj2.position - obj1.position
        distance = displacement.magnitude()
        min_distance = obj1.radius + obj2.radius
        
        if distance < min_distance:
            penetration = min_distance - distance
            normal = displacement.normalize() if distance > 0 else Vector(1, 0)
            return CollisionResult(True, normal, penetration)
        
        return CollisionResult(False)
    
    @staticmethod
    def check_circle_rect(circle_obj, rect_obj) -> CollisionResult:
        """Check collision between circle and rectangle"""
        # Simplified: treat rectangle as circle with equivalent radius
        rect_radius = math.sqrt(rect_obj.width**2 + rect_obj.height**2) / 2
        displacement = rect_obj.position - circle_obj.position
        distance = displacement.magnitude()
        min_distance = circle_obj.radius + rect_radius
        
        if distance < min_distance:
            penetration = min_distance - distance
            normal = displacement.normalize() if distance > 0 else Vector(1, 0)
            return CollisionResult(True, normal, penetration)
        
        return CollisionResult(False)

class CollisionResolver:
    """Resolve collisions between objects"""
    
    @staticmethod
    def resolve_elastic(obj1, obj2, normal: Vector):
        """Resolve elastic collision (coefficient of restitution = 1)"""
        # Relative velocity
        relative_velocity = obj2.velocity - obj1.velocity
        velocity_along_normal = relative_velocity.dot(normal)
        
        # Don't resolve if objects are moving apart
        if velocity_along_normal > 0:
            return
        
        # Calculate impulse scalar
        e = 1.0  # Coefficient of restitution (elastic)
        impulse_scalar = -(1 + e) * velocity_along_normal
        impulse_scalar /= (1 / obj1.mass + 1 / obj2.mass)
        
        # Apply impulse
        impulse = normal * impulse_scalar
        obj1.velocity = obj1.velocity - (impulse / obj1.mass)
        obj2.velocity = obj2.velocity + (impulse / obj2.mass)
    
    @staticmethod
    def resolve_inelastic(obj1, obj2, normal: Vector, restitution: float = 0.5):
        """Resolve inelastic collision"""
        # Relative velocity
        relative_velocity = obj2.velocity - obj1.velocity
        velocity_along_normal = relative_velocity.dot(normal)
        
        # Don't resolve if objects are moving apart
        if velocity_along_normal > 0:
            return
        
        # Calculate impulse scalar
        e = restitution  # Coefficient of restitution
        impulse_scalar = -(1 + e) * velocity_along_normal
        impulse_scalar /= (1 / obj1.mass + 1 / obj2.mass)
        
        # Apply impulse
        impulse = normal * impulse_scalar
        obj1.velocity = obj1.velocity - (impulse / obj1.mass)
        obj2.velocity = obj2.velocity + (impulse / obj2.mass)
    
    @staticmethod
    def resolve_perfectly_inelastic(obj1, obj2):
        """Resolve perfectly inelastic collision (objects stick together)"""
        # Conservation of momentum: m1*v1 + m2*v2 = (m1+m2)*v_final
        total_mass = obj1.mass + obj2.mass
        final_velocity = (obj1.velocity * obj1.mass + obj2.velocity * obj2.mass) / total_mass
        
        obj1.velocity = final_velocity
        obj2.velocity = final_velocity
    
    @staticmethod
    def separate_objects(obj1, obj2, penetration: float, normal: Vector):
        """Separate overlapping objects"""
        # Move objects apart proportional to their masses
        total_mass = obj1.mass + obj2.mass
        separation1 = normal * (penetration * (obj2.mass / total_mass))
        separation2 = normal * (-penetration * (obj1.mass / total_mass))
        
        obj1.position = obj1.position + separation1
        obj2.position = obj2.position + separation2

class MomentumCalculator:
    """Calculate momentum and related quantities"""
    
    @staticmethod
    def linear_momentum(obj) -> Vector:
        """Calculate linear momentum: p = m*v"""
        return obj.velocity * obj.mass
    
    @staticmethod
    def total_momentum(objects: List) -> Vector:
        """Calculate total momentum of system"""
        total = Vector.zero()
        for obj in objects:
            total = total + MomentumCalculator.linear_momentum(obj)
        return total
    
    @staticmethod
    def momentum_magnitude(obj) -> float:
        """Calculate momentum magnitude"""
        return MomentumCalculator.linear_momentum(obj).magnitude()
