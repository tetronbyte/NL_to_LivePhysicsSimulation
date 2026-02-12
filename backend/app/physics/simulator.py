# backend/app/physics/simulator.py (UPDATE)
from .world import World
from .object import PhysicsObject

class Simulator:
    """Physics simulation engine"""
    
    def __init__(self, world: World, dt: float = 0.016):
        self.world = world
        self.dt = dt  # Time step (default 60 FPS)
        self.is_running = False
        self.max_time = 30.0  # Maximum simulation time in seconds
        self.step_mode = False  # Step-by-step mode
        
    def step(self):
        """Advance simulation by one time step"""
        if not self.is_running and not self.step_mode:
            return
        
        # Stop if max time reached
        if self.world.time >= self.max_time:
            self.is_running = False
            return
        
        # Update all objects
        for obj in self.world.objects:
            obj.update(self.dt, self.world.gravity_strength)
        
        # Handle collisions
        self.world.handle_collisions()
        
        # Update world time
        self.world.time += self.dt
        
        # Track energy
        energy = self.world.calculate_total_energy()
        self.world.energy_tracker.record(
            self.world.time,
            energy["kinetic"],
            energy["potential"],
            energy["mechanical"]
        )
        
        # Reset step mode
        self.step_mode = False
    
    def run_steps(self, num_steps: int = 1) -> dict:
        """Run multiple simulation steps and return world state"""
        for _ in range(num_steps):
            self.step()
        return self.world.to_dict()
    
    def step_once(self) -> dict:
        """Execute a single step (for step-by-step mode)"""
        self.step_mode = True
        self.step()
        return self.world.to_dict()
    
    def reset(self):
        """Reset simulation"""
        self.world.time = 0.0
        self.is_running = False
        self.world.energy_tracker.clear()
        for obj in self.world.objects:
            obj.reset_to_initial()
    
    def start(self):
        """Start simulation"""
        self.is_running = True
    
    def stop(self):
        """Stop simulation"""
        self.is_running = False
    
    def set_gravity(self, enabled: bool, strength: float = 9.8):
        """Enable/disable gravity"""
        self.world.gravity_enabled = enabled
        self.world.gravity_strength = strength
        
        # Update gravity forces on all objects
        from .forces import Gravity
        for obj in self.world.objects:
            # Remove existing gravity forces
            obj.forces = [f for f in obj.forces if not isinstance(f, Gravity)]
            
            # Add new gravity force if enabled
            if enabled:
                obj.apply_force(Gravity(strength))
