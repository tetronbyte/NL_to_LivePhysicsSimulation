# backend/app/physics/energy.py (NEW)
from .vector import Vector
from typing import List

class EnergyCalculator:
    """Calculate various forms of energy"""
    
    @staticmethod
    def kinetic_energy(obj) -> float:
        """Calculate kinetic energy: KE = 0.5 * m * v^2"""
        speed_squared = obj.velocity.magnitude_squared()
        return 0.5 * obj.mass * speed_squared
    
    @staticmethod
    def potential_energy(obj, g: float = 9.8, reference_height: float = 0) -> float:
        """Calculate gravitational potential energy: PE = m * g * h"""
        height = obj.position.y - reference_height
        return obj.mass * g * height
    
    @staticmethod
    def mechanical_energy(obj, g: float = 9.8, reference_height: float = 0) -> float:
        """Calculate total mechanical energy: E = KE + PE"""
        ke = EnergyCalculator.kinetic_energy(obj)
        pe = EnergyCalculator.potential_energy(obj, g, reference_height)
        return ke + pe
    
    @staticmethod
    def elastic_potential_energy(displacement: float, spring_constant: float) -> float:
        """Calculate elastic potential energy: PE = 0.5 * k * x^2"""
        return 0.5 * spring_constant * (displacement ** 2)
    
    @staticmethod
    def work_done(force: Vector, displacement: Vector) -> float:
        """Calculate work done: W = F · d"""
        return force.dot(displacement)
    
    @staticmethod
    def power(force: Vector, velocity: Vector) -> float:
        """Calculate power: P = F · v"""
        return force.dot(velocity)
    
    @staticmethod
    def total_kinetic_energy(objects: List) -> float:
        """Calculate total kinetic energy of system"""
        return sum(EnergyCalculator.kinetic_energy(obj) for obj in objects)
    
    @staticmethod
    def total_potential_energy(objects: List, g: float = 9.8, reference_height: float = 0) -> float:
        """Calculate total potential energy of system"""
        return sum(EnergyCalculator.potential_energy(obj, g, reference_height) for obj in objects)
    
    @staticmethod
    def total_mechanical_energy(objects: List, g: float = 9.8, reference_height: float = 0) -> float:
        """Calculate total mechanical energy of system"""
        return sum(EnergyCalculator.mechanical_energy(obj, g, reference_height) for obj in objects)

class EnergyTracker:
    """Track energy changes over time"""
    
    def __init__(self):
        self.history = []
        self.initial_energy = None
    
    def record(self, time: float, kinetic: float, potential: float, mechanical: float):
        """Record energy values at a time point"""
        self.history.append({
            "time": time,
            "kinetic": kinetic,
            "potential": potential,
            "mechanical": mechanical
        })
        
        if self.initial_energy is None:
            self.initial_energy = mechanical
    
    def get_energy_loss(self) -> float:
        """Calculate total energy loss"""
        if not self.history or self.initial_energy is None:
            return 0.0
        current_energy = self.history[-1]["mechanical"]
        return self.initial_energy - current_energy
    
    def clear(self):
        """Clear history"""
        self.history.clear()
        self.initial_energy = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "history": self.history,
            "initial_energy": self.initial_energy,
            "energy_loss": self.get_energy_loss()
        }
