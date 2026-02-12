# backend/app/physics/vector.py (UPDATE)
import math
from typing import Union

class Vector:
    """2D Vector class for physics calculations"""
    
    def __init__(self, x: float, y: float):
        self.x = float(x)
        self.y = float(y)
    
    def __add__(self, other: 'Vector') -> 'Vector':
        """Add two vectors"""
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other: 'Vector') -> 'Vector':
        """Subtract two vectors"""
        return Vector(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar: float) -> 'Vector':
        """Multiply vector by scalar"""
        return Vector(self.x * scalar, self.y * scalar)
    
    def __truediv__(self, scalar: float) -> 'Vector':
        """Divide vector by scalar"""
        if scalar == 0:
            raise ValueError("Cannot divide by zero")
        return Vector(self.x / scalar, self.y / scalar)
    
    def __neg__(self) -> 'Vector':
        """Negate vector"""
        return Vector(-self.x, -self.y)
    
    def __repr__(self) -> str:
        return f"Vector({self.x:.2f}, {self.y:.2f})"
    
    def magnitude(self) -> float:
        """Calculate vector magnitude"""
        return math.sqrt(self.x**2 + self.y**2)
    
    def magnitude_squared(self) -> float:
        """Calculate squared magnitude (faster)"""
        return self.x**2 + self.y**2
    
    def normalize(self) -> 'Vector':
        """Return normalized vector"""
        mag = self.magnitude()
        if mag == 0:
            return Vector(0, 0)
        return self / mag
    
    def dot(self, other: 'Vector') -> float:
        """Dot product"""
        return self.x * other.x + self.y * other.y
    
    def cross(self, other: 'Vector') -> float:
        """2D cross product (returns scalar z-component)"""
        return self.x * other.y - self.y * other.x
    
    def perpendicular(self) -> 'Vector':
        """Return perpendicular vector (rotated 90° CCW)"""
        return Vector(-self.y, self.x)
    
    def distance_to(self, other: 'Vector') -> float:
        """Distance to another vector"""
        return (self - other).magnitude()
    
    def angle(self) -> float:
        """Angle in radians from positive x-axis"""
        return math.atan2(self.y, self.x)
    
    def angle_to(self, other: 'Vector') -> float:
        """Angle to another vector"""
        return math.acos(self.dot(other) / (self.magnitude() * other.magnitude()))
    
    def rotate(self, angle_rad: float) -> 'Vector':
        """Rotate vector by angle (radians)"""
        cos_a = math.cos(angle_rad)
        sin_a = math.sin(angle_rad)
        return Vector(
            self.x * cos_a - self.y * sin_a,
            self.x * sin_a + self.y * cos_a
        )
    
    def project_onto(self, other: 'Vector') -> 'Vector':
        """Project this vector onto another"""
        if other.magnitude_squared() == 0:
            return Vector(0, 0)
        return other * (self.dot(other) / other.magnitude_squared())
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {"x": self.x, "y": self.y}
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Vector':
        """Create vector from dictionary"""
        return cls(data["x"], data["y"])
    
    @classmethod
    def from_polar(cls, magnitude: float, angle_rad: float) -> 'Vector':
        """Create vector from polar coordinates"""
        return cls(magnitude * math.cos(angle_rad), magnitude * math.sin(angle_rad))
    
    @staticmethod
    def zero() -> 'Vector':
        """Return zero vector"""
        return Vector(0, 0)
