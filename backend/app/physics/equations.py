# backend/app/physics/equations.py
import math
from .vector import Vector

class KinematicEquations:
    """Physics equations for kinematic calculations"""
    
    @staticmethod
    def final_velocity(initial_velocity: float, acceleration: float, time: float) -> float:
        """v = v0 + at"""
        return initial_velocity + acceleration * time
    
    @staticmethod
    def displacement(initial_velocity: float, acceleration: float, time: float) -> float:
        """s = v0*t + 0.5*a*t^2"""
        return initial_velocity * time + 0.5 * acceleration * time * time
    
    @staticmethod
    def max_height_projectile(initial_velocity_y: float, g: float = 9.8) -> float:
        """h_max = v0^2 / (2g)"""
        return (initial_velocity_y ** 2) / (2 * g)
    
    @staticmethod
    def time_to_peak(initial_velocity_y: float, g: float = 9.8) -> float:
        """t = v0 / g"""
        return initial_velocity_y / g
    
    @staticmethod
    def projectile_range(initial_velocity: float, angle_deg: float, g: float = 9.8) -> float:
        """R = (v0^2 * sin(2θ)) / g"""
        angle_rad = math.radians(angle_deg)
        return (initial_velocity ** 2 * math.sin(2 * angle_rad)) / g
    
    @staticmethod
    def decompose_velocity(speed: float, angle_deg: float) -> Vector:
        """Decompose velocity into x and y components"""
        angle_rad = math.radians(angle_deg)
        vx = speed * math.cos(angle_rad)
        vy = speed * math.sin(angle_rad)
        return Vector(vx, vy)
