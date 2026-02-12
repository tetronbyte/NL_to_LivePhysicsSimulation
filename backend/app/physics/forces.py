# backend/app/physics/forces.py (UPDATE)
from .vector import Vector
import math

class Force:
    """Base force class"""
    
    def __init__(self):
        self.enabled = True
    
    def compute(self, obj) -> Vector:
        """Compute force on an object"""
        if not self.enabled:
            return Vector.zero()
        raise NotImplementedError

class Gravity(Force):
    """Gravitational force"""
    
    def __init__(self, g: float = 9.8):
        super().__init__()
        self.g = g
    
    def compute(self, obj) -> Vector:
        """F = m * g (downward)"""
        if not self.enabled:
            return Vector.zero()
        return Vector(0, -self.g * obj.mass)

class Drag(Force):
    """Air resistance force"""
    
    def __init__(self, coefficient: float = 0.1):
        super().__init__()
        self.coefficient = coefficient
    
    def compute(self, obj) -> Vector:
        """F = -k * v^2 (opposite to velocity)"""
        if not self.enabled:
            return Vector.zero()
        speed = obj.velocity.magnitude()
        if speed == 0:
            return Vector.zero()
        drag_magnitude = self.coefficient * speed * speed
        direction = obj.velocity.normalize()
        return direction * (-drag_magnitude)

class Friction(Force):
    """Kinetic and static friction"""
    
    def __init__(self, mu_k: float = 0.3, mu_s: float = 0.5):
        super().__init__()
        self.mu_k = mu_k  # Kinetic friction coefficient
        self.mu_s = mu_s  # Static friction coefficient
    
    def compute(self, obj) -> Vector:
        """F = -μ * N (opposite to velocity)"""
        if not self.enabled:
            return Vector.zero()
        
        # Normal force (assuming on flat surface)
        normal_force = obj.mass * 9.8
        
        speed = obj.velocity.magnitude()
        if speed == 0:
            return Vector.zero()
        
        friction_magnitude = self.mu_k * normal_force
        direction = obj.velocity.normalize()
        return direction * (-friction_magnitude)

class Spring(Force):
    """Spring force (Hooke's law)"""
    
    def __init__(self, k: float, anchor: Vector, rest_length: float = 0):
        super().__init__()
        self.k = k  # Spring constant
        self.anchor = anchor
        self.rest_length = rest_length
    
    def compute(self, obj) -> Vector:
        """F = -k * (x - x0)"""
        if not self.enabled:
            return Vector.zero()
        displacement = obj.position - self.anchor
        distance = displacement.magnitude()
        extension = distance - self.rest_length
        
        if distance == 0:
            return Vector.zero()
        
        direction = displacement.normalize()
        return direction * (-self.k * extension)

class ConstantForce(Force):
    """Constant force in a direction"""
    
    def __init__(self, force_vector: Vector):
        super().__init__()
        self.force_vector = force_vector
    
    def compute(self, obj) -> Vector:
        if not self.enabled:
            return Vector.zero()
        return self.force_vector

class CentripetalForce(Force):
    """Centripetal force for circular motion"""
    
    def __init__(self, center: Vector, radius: float, angular_velocity: float):
        super().__init__()
        self.center = center
        self.radius = radius
        self.angular_velocity = angular_velocity
    
    def compute(self, obj) -> Vector:
        """F = m * ω^2 * r (toward center)"""
        if not self.enabled:
            return Vector.zero()
        
        # Direction toward center
        to_center = self.center - obj.position
        distance = to_center.magnitude()
        
        if distance == 0:
            return Vector.zero()
        
        direction = to_center.normalize()
        
        # Centripetal acceleration: a = ω^2 * r
        centripetal_accel = self.angular_velocity ** 2 * self.radius
        force_magnitude = obj.mass * centripetal_accel
        
        return direction * force_magnitude

class InteractionForce(Force):
    """Force between two objects (e.g., gravitational, electric)"""
    
    def __init__(self, other_obj, strength: float = 10.0):
        super().__init__()
        self.other_obj = other_obj
        self.strength = strength
    
    def compute(self, obj) -> Vector:
        """F = k / r^2 (inverse square law)"""
        if not self.enabled:
            return Vector.zero()
        
        displacement = self.other_obj.position - obj.position
        distance = displacement.magnitude()
        
        if distance == 0:
            return Vector.zero()
        
        direction = displacement.normalize()
        force_magnitude = self.strength / (distance ** 2)
        
        return direction * force_magnitude
