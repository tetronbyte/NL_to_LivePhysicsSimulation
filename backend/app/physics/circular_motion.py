# backend/app/physics/circular_motion.py (UPDATE)
from .vector import Vector
import math

class CircularMotion:
    """Manage circular motion for objects"""
    
    def __init__(self, center: Vector, radius: float, angular_velocity: float, initial_angle: float = 0):
        self.center = center
        self.radius = radius
        self.angular_velocity = angular_velocity  # rad/s
        self.angle = initial_angle  # radians
        self.enabled = False
        self.clockwise = False  # Direction of rotation
    
    @classmethod
    def from_linear_velocity(cls, center: Vector, radius: float, linear_velocity: float, initial_angle: float = 0):
        """Create circular motion from linear velocity: ω = v/r"""
        angular_velocity = linear_velocity / radius if radius > 0 else 0
        return cls(center, radius, angular_velocity, initial_angle)
    
    def update(self, obj, dt: float):
        """Update object position for circular motion"""
        if not self.enabled:
            return
        
        # Update angle
        if self.clockwise:
            self.angle -= self.angular_velocity * dt
        else:
            self.angle += self.angular_velocity * dt
        
        self.angle = self.angle % (2 * math.pi)  # Keep between 0 and 2π
        
        # Calculate new position on circle
        obj.position.x = self.center.x + self.radius * math.cos(self.angle)
        obj.position.y = self.center.y + self.radius * math.sin(self.angle)
        
        # Calculate tangential velocity (perpendicular to radius)
        velocity_magnitude = self.angular_velocity * self.radius
        
        if self.clockwise:
            # Clockwise: velocity is perpendicular to radius, pointing right when at top
            obj.velocity.x = -velocity_magnitude * math.sin(self.angle)
            obj.velocity.y = velocity_magnitude * math.cos(self.angle)
        else:
            # Counter-clockwise: velocity is perpendicular to radius, pointing left when at top
            obj.velocity.x = -velocity_magnitude * math.sin(self.angle)
            obj.velocity.y = velocity_magnitude * math.cos(self.angle)
        
        # Calculate centripetal acceleration (toward center)
        centripetal_accel = self.get_centripetal_acceleration()
        direction_to_center = self.center - obj.position
        if direction_to_center.magnitude() > 0:
            direction_to_center = direction_to_center.normalize()
            obj.acceleration = direction_to_center * centripetal_accel
    
    def set_radius(self, new_radius: float):
        """Change radius while maintaining angular velocity"""
        self.radius = new_radius
    
    def set_linear_velocity(self, linear_velocity: float):
        """Set angular velocity from linear velocity"""
        if self.radius > 0:
            self.angular_velocity = linear_velocity / self.radius
    
    def get_centripetal_acceleration(self) -> float:
        """Calculate centripetal acceleration: a_c = ω^2 * r"""
        return (self.angular_velocity ** 2) * self.radius
    
    def get_centripetal_force(self, mass: float) -> float:
        """Calculate centripetal force: F_c = m * a_c"""
        return mass * self.get_centripetal_acceleration()
    
    def get_tangential_velocity(self) -> float:
        """Calculate tangential velocity: v = ω * r"""
        return self.angular_velocity * self.radius
    
    def get_period(self) -> float:
        """Calculate period: T = 2π / ω"""
        if self.angular_velocity == 0:
            return float('inf')
        return (2 * math.pi) / abs(self.angular_velocity)
    
    def get_frequency(self) -> float:
        """Calculate frequency: f = ω / 2π"""
        return abs(self.angular_velocity) / (2 * math.pi)
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "center": self.center.to_dict(),
            "radius": self.radius,
            "angular_velocity": self.angular_velocity,
            "angle": self.angle,
            "angle_degrees": math.degrees(self.angle),
            "tangential_velocity": self.get_tangential_velocity(),
            "centripetal_acceleration": self.get_centripetal_acceleration(),
            "period": self.get_period(),
            "frequency": self.get_frequency(),
            "enabled": self.enabled,
            "clockwise": self.clockwise
        }
