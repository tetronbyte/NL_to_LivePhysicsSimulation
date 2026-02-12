# backend/app/services/simulation_service.py (UPDATE)
from typing import Optional, Dict, Any
from ..physics.simulator import Simulator
from ..physics.world import World
from ..physics.object import PhysicsObject
from ..physics.vector import Vector
from ..physics.forces import Gravity, Drag, Friction, Spring, ConstantForce, CentripetalForce
from ..nlp.parser import PhysicsProblemParser
from ..nlp.schema import SimulationScenario
import math

class SimulationService:
    """Service for managing physics simulations"""
    
    def __init__(self):
        self.simulator: Optional[Simulator] = None
        self.world: Optional[World] = None
        self.parser = PhysicsProblemParser()
        self.current_scenario: Optional[SimulationScenario] = None
    
    async def create_from_text(self, problem_text: str) -> dict:
        """Create simulation from natural language text"""
        # Parse the problem
        parsed = await self.parser.parse(problem_text)
        
        if not parsed.success:
            return {
                "success": False,
                "error_message": parsed.error_message
            }
        
        # Create simulation from scenario
        return self.create_from_scenario(parsed.scenario)
    
    # backend/app/services/simulation_service.py (UPDATE create_from_scenario)
    def create_from_scenario(self, scenario: SimulationScenario) -> dict:
        """Create simulation from structured scenario"""
        try:
            self.current_scenario = scenario
            
            # Create world
            env = scenario.environment
            self.world = World(
                width=env.get("width", 100),
                height=env.get("height", 100),
                ground_level=env.get("ground_level", 0)
            )
            
            # Add entities
            for entity in scenario.entities:
                pos = Vector(
                    entity.initial_position["x"],
                    entity.initial_position["y"]
                )
                vel = Vector(
                    entity.initial_velocity["x"],
                    entity.initial_velocity["y"]
                )
                
                obj = PhysicsObject(
                    mass=entity.mass,
                    position=pos,
                    velocity=vel,
                    radius=entity.radius,
                    label=entity.name,
                    color=entity.color,
                    object_id=entity.name,
                    shape="circle"
                )
                
                # Check if this entity should have circular motion
                if hasattr(entity, 'circular_motion') and entity.circular_motion:
                    cm = entity.circular_motion
                    center = Vector(cm.get("center", {}).get("x", 50), cm.get("center", {}).get("y", 50))
                    radius = cm.get("radius", entity.radius * 20)  # Scale up radius
                    linear_vel = cm.get("linear_velocity", vel.magnitude())
                    
                    # Enable circular motion
                    from .physics.circular_motion import CircularMotion
                    obj.circular_motion = CircularMotion.from_linear_velocity(center, radius, linear_vel, 0)
                    obj.circular_motion.enabled = True
                    
                    # Position object at start of circle
                    obj.position.x = center.x + radius
                    obj.position.y = center.y
                    obj.velocity.x = 0
                    obj.velocity.y = linear_vel
                
                # Apply forces (only if not in circular motion)
                if not (obj.circular_motion and obj.circular_motion.enabled):
                    for force_config in scenario.forces:
                        if force_config.type == "gravity":
                            g = force_config.parameters.get("g", 9.8)
                            obj.apply_force(Gravity(g))
                        elif force_config.type == "drag":
                            coeff = force_config.parameters.get("coefficient", 0.1)
                            obj.apply_force(Drag(coeff))
                        elif force_config.type == "friction":
                            mu_k = force_config.parameters.get("mu_k", 0.3)
                            mu_s = force_config.parameters.get("mu_s", 0.5)
                            obj.apply_force(Friction(mu_k, mu_s))
                
                self.world.add_object(obj)
            
            # Add center marker for circular motion
            if scenario.scenario_type == "circular_motion":
                for entity in scenario.entities:
                    if hasattr(entity, 'circular_motion') and entity.circular_motion:
                        cm = entity.circular_motion
                        center = Vector(cm.get("center", {}).get("x", 50), cm.get("center", {}).get("y", 50))
                        
                        center_obj = PhysicsObject(
                            mass=0.1,
                            position=center,
                            velocity=Vector(0, 0),
                            radius=0.3,
                            label="Center",
                            color="#34495e",
                            object_id="center_point"
                        )
                        center_obj.is_static = True
                        self.world.add_object(center_obj)
            
            # Create simulator
            self.simulator = Simulator(self.world, dt=0.016)
            
            return {
                "success": True,
                "world_state": self.world.to_dict(),
                "scenario_description": scenario.description
            }
            
        except Exception as e:
            import traceback
            print(f"Error creating simulation: {traceback.format_exc()}")
            return {
                "success": False,
                "error_message": f"Error creating simulation: {str(e)}"
            }

    
    def create_preset(self, preset_name: str, parameters: Dict[str, Any]) -> dict:
        """Create simulation from preset"""
        try:
            if preset_name == "projectile_motion":
                return self._create_projectile_preset(parameters)
            elif preset_name == "free_fall":
                return self._create_freefall_preset(parameters)
            elif preset_name == "elastic_collision":
                return self._create_elastic_collision_preset(parameters)
            elif preset_name == "inelastic_collision":
                return self._create_inelastic_collision_preset(parameters)
            elif preset_name == "circular_motion":
                return self._create_circular_motion_preset(parameters)
            elif preset_name == "pendulum":
                return self._create_pendulum_preset(parameters)
            elif preset_name == "spring_oscillation":
                return self._create_spring_preset(parameters)
            elif preset_name == "newton_cradle":
                return self._create_newton_cradle_preset(parameters)
            else:
                return {"success": False, "error_message": "Unknown preset"}
        except Exception as e:
            return {"success": False, "error_message": str(e)}
    
    def _create_projectile_preset(self, params: Dict) -> dict:
        """Create projectile motion preset"""
        velocity = params.get("velocity", 15.0)
        angle_deg = params.get("angle", 45.0)
        angle_rad = math.radians(angle_deg)
        
        self.world = World(width=100, height=60, ground_level=0)
        
        vx = velocity * math.cos(angle_rad)
        vy = velocity * math.sin(angle_rad)
        
        obj = PhysicsObject(
            mass=1.0,
            position=Vector(10, 0),
            velocity=Vector(vx, vy),
            radius=0.5,
            label="Projectile",
            color="#e74c3c"
        )
        obj.apply_force(Gravity(9.8))
        self.world.add_object(obj)
        
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_freefall_preset(self, params: Dict) -> dict:
        """Create free fall preset"""
        height = params.get("height", 20.0)
        mass = params.get("mass", 1.0)
        
        self.world = World(width=100, height=max(40, height * 1.5), ground_level=0)
        
        obj = PhysicsObject(
            mass=mass,
            position=Vector(50, height),
            velocity=Vector(0, 0),
            radius=0.5,
            label="Falling Object",
            color="#3498db"
        )
        obj.apply_force(Gravity(9.8))
        self.world.add_object(obj)
        
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_elastic_collision_preset(self, params: Dict) -> dict:
        """Create elastic collision preset"""
        self.world = World(width=100, height=40, ground_level=0)
        
        # Object 1 - moving right
        obj1 = PhysicsObject(
            mass=params.get("mass1", 2.0),
            position=Vector(20, 20),
            velocity=Vector(5, 0),
            radius=1.0,
            label="Object 1",
            color="#e74c3c"
        )
        obj1.collision_type = "elastic"
        obj1.restitution = 1.0
        self.world.add_object(obj1)
        
        # Object 2 - stationary
        obj2 = PhysicsObject(
            mass=params.get("mass2", 1.0),
            position=Vector(50, 20),
            velocity=Vector(0, 0),
            radius=1.0,
            label="Object 2",
            color="#3498db"
        )
        obj2.collision_type = "elastic"
        obj2.restitution = 1.0
        self.world.add_object(obj2)
        
        self.world.gravity_enabled = False
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_inelastic_collision_preset(self, params: Dict) -> dict:
        """Create inelastic collision preset"""
        self.world = World(width=100, height=40, ground_level=0)
        
        # Object 1 - moving right
        obj1 = PhysicsObject(
            mass=params.get("mass1", 2.0),
            position=Vector(20, 20),
            velocity=Vector(5, 0),
            radius=1.0,
            label="Object 1",
            color="#e74c3c"
        )
        obj1.collision_type = "perfectly_inelastic"
        self.world.add_object(obj1)
        
        # Object 2 - moving left
        obj2 = PhysicsObject(
            mass=params.get("mass2", 1.0),
            position=Vector(50, 20),
            velocity=Vector(-3, 0),
            radius=1.0,
            label="Object 2",
            color="#3498db"
        )
        obj2.collision_type = "perfectly_inelastic"
        self.world.add_object(obj2)
        
        self.world.gravity_enabled = False
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_circular_motion_preset(self, params: Dict) -> dict:
        """Create circular motion preset"""
        radius = params.get("radius", 15.0)
        angular_velocity = params.get("angular_velocity", 1.0)
        
        self.world = World(width=100, height=100, ground_level=0)
        
        center = Vector(50, 50)
        obj = PhysicsObject(
            mass=1.0,
            position=Vector(50 + radius, 50),
            velocity=Vector(0, angular_velocity * radius),
            radius=0.5,
            label="Orbiting Object",
            color="#9b59b6"
        )
        obj.enable_circular_motion(center, radius, angular_velocity, 0)
        self.world.add_object(obj)
        
        # Add center point (static)
        center_obj = PhysicsObject(
            mass=1.0,
            position=center,
            velocity=Vector(0, 0),
            radius=0.3,
            label="Center",
            color="#34495e"
        )
        center_obj.is_static = True
        self.world.add_object(center_obj)
        
        self.world.gravity_enabled = False
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_pendulum_preset(self, params: Dict) -> dict:
        """Create pendulum preset"""
        length = params.get("length", 15.0)
        angle_deg = params.get("initial_angle", 30.0)
        angle_rad = math.radians(angle_deg)
        
        self.world = World(width=100, height=80, ground_level=0)
        
        # Anchor point
        anchor = Vector(50, 60)
        
        # Bob position
        bob_x = anchor.x + length * math.sin(angle_rad)
        bob_y = anchor.y - length * math.cos(angle_rad)
        
        bob = PhysicsObject(
            mass=1.0,
            position=Vector(bob_x, bob_y),
            velocity=Vector(0, 0),
            radius=0.8,
            label="Pendulum Bob",
            color="#e67e22"
        )
        
        # Apply forces
        bob.apply_force(Gravity(9.8))
        bob.apply_force(Spring(k=50, anchor=anchor, rest_length=length))
        
        self.world.add_object(bob)
        
        # Add anchor (static)
        anchor_obj = PhysicsObject(
            mass=1.0,
            position=anchor,
            velocity=Vector(0, 0),
            radius=0.3,
            label="Anchor",
            color="#34495e"
        )
        anchor_obj.is_static = True
        self.world.add_object(anchor_obj)
        
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_spring_preset(self, params: Dict) -> dict:
        """Create spring oscillation preset"""
        k = params.get("spring_constant", 10.0)
        displacement = params.get("displacement", 5.0)
        
        self.world = World(width=100, height=40, ground_level=0)
        
        anchor = Vector(30, 20)
        
        obj = PhysicsObject(
            mass=1.0,
            position=Vector(anchor.x + 10 + displacement, 20),
            velocity=Vector(0, 0),
            radius=0.8,
            label="Mass",
            color="#1abc9c"
        )
        obj.apply_force(Spring(k=k, anchor=anchor, rest_length=10))
        obj.apply_force(Drag(0.05))  # Damping
        
        self.world.add_object(obj)
        
        # Add anchor
        anchor_obj = PhysicsObject(
            mass=1.0,
            position=anchor,
            velocity=Vector(0, 0),
            radius=0.3,
            label="Anchor",
            color="#34495e"
        )
        anchor_obj.is_static = True
        self.world.add_object(anchor_obj)
        
        self.world.gravity_enabled = False
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def _create_newton_cradle_preset(self, params: Dict) -> dict:
        """Create Newton's cradle preset"""
        num_balls = params.get("num_balls", 5)
        
        self.world = World(width=100, height=60, ground_level=0)
        
        spacing = 2.0
        start_x = 40
        y = 30
        
        for i in range(num_balls):
            x = start_x + i * spacing
            
            obj = PhysicsObject(
                mass=1.0,
                position=Vector(x, y),
                velocity=Vector(0, 0),
                radius=0.8,
                label=f"Ball {i+1}",
                color="#95a5a6"
            )
            obj.collision_type = "elastic"
            obj.restitution = 1.0
            
            # First ball gets initial velocity
            if i == 0:
                obj.velocity.x = 5.0
            
            self.world.add_object(obj)
        
        self.world.gravity_enabled = False
        self.simulator = Simulator(self.world)
        return {"success": True, "world_state": self.world.to_dict()}
    
    def step(self, num_steps: int = 1) -> dict:
        """Advance simulation"""
        if not self.simulator:
            return {"error": "No active simulation"}
        
        return self.simulator.run_steps(num_steps)
    
    def step_once(self) -> dict:
        """Execute single step for step-by-step mode"""
        if not self.simulator:
            return {"error": "No active simulation"}
        
        return self.simulator.step_once()
    
    def add_object(self, obj_data: dict) -> dict:
        """Add a new object to the simulation"""
        if not self.world:
            return {"error": "No active simulation"}
        
        try:
            obj = PhysicsObject(
                mass=obj_data["mass"],
                position=Vector(obj_data["position"]["x"], obj_data["position"]["y"]),
                velocity=Vector(obj_data["velocity"]["x"], obj_data["velocity"]["y"]),
                radius=obj_data.get("radius", 0.5),
                label=obj_data["label"],
                color=obj_data.get("color", "#3498db"),
                shape=obj_data.get("shape", "circle"),
                width=obj_data.get("width", 1.0),
                height=obj_data.get("height", 1.0)
            )
            
            # Apply gravity if enabled
            if self.world.gravity_enabled:
                obj.apply_force(Gravity(self.world.gravity_strength))
            
            self.world.add_object(obj)
            
            return {"success": True, "world_state": self.world.to_dict()}
        except Exception as e:
            return {"error": str(e)}
    
    def update_parameter(self, object_id: str, parameter: str, value) -> dict:
        """Update object parameter"""
        if not self.world:
            return {"error": "No active simulation"}
        
        obj = self.world.get_object(object_id)
        if not obj:
            return {"error": f"Object {object_id} not found"}
        
        try:
            if parameter == "velocity":
                obj.velocity = Vector(value["x"], value["y"])
                obj.initial_velocity = Vector(value["x"], value["y"])
            elif parameter == "position":
                obj.position = Vector(value["x"], value["y"])
                obj.initial_position = Vector(value["x"], value["y"])
            elif parameter == "mass":
                obj.mass = float(value)
            elif parameter == "radius":
                obj.radius = float(value)
            elif parameter == "collision_type":
                obj.collision_type = str(value)
            elif parameter == "restitution":
                obj.restitution = float(value)
            elif parameter == "shape":
                obj.shape = str(value)
            elif parameter == "color":
                obj.color = str(value)
            elif parameter == "show_velocity_vector":
                obj.show_velocity_vector = bool(value)
            elif parameter == "show_trajectory":
                obj.show_trajectory = bool(value)
            
            # Reset simulation
            self.simulator.reset()
            
            return {"success": True, "world_state": self.world.to_dict()}
        except Exception as e:
            return {"error": str(e)}
    
    def update_world(self, updates: dict) -> dict:
        """Update world settings"""
        if not self.world:
            return {"error": "No active simulation"}
        
        try:
            if "gravity_enabled" in updates:
                self.world.gravity_enabled = updates["gravity_enabled"]
            
            if "gravity_strength" in updates:
                self.world.gravity_strength = updates["gravity_strength"]
            
            if "collision_enabled" in updates:
                self.world.collision_enabled = updates["collision_enabled"]
            
            # Update gravity forces on all objects
            if "gravity_enabled" in updates or "gravity_strength" in updates:
                self.simulator.set_gravity(
                    self.world.gravity_enabled,
                    self.world.gravity_strength
                )
            
            return {"success": True, "world_state": self.world.to_dict()}
        except Exception as e:
            return {"error": str(e)}
    
    def set_circular_motion(self, object_id: str, center: Vector, radius: float, 
                          angular_velocity: float, initial_angle: float, enabled: bool) -> dict:
        """Set circular motion for an object"""
        if not self.world:
            return {"error": "No active simulation"}
        
        obj = self.world.get_object(object_id)
        if not obj:
            return {"error": f"Object {object_id} not found"}
        
        try:
            if enabled:
                obj.enable_circular_motion(center, radius, angular_velocity, initial_angle)
            else:
                obj.disable_circular_motion()
            
            return {"success": True, "world_state": self.world.to_dict()}
        except Exception as e:
            return {"error": str(e)}
    
    def set_collision_settings(self, object_id: str, collision_type: str, restitution: float) -> dict:
        """Set collision settings for an object"""
        if not self.world:
            return {"error": "No active simulation"}
        
        obj = self.world.get_object(object_id)
        if not obj:
            return {"error": f"Object {object_id} not found"}
        
        try:
            obj.collision_type = collision_type
            obj.restitution = restitution
            
            return {"success": True, "world_state": self.world.to_dict()}
        except Exception as e:
            return {"error": str(e)}
    
    def reset(self) -> dict:
        """Reset simulation to initial state"""
        if not self.simulator or not self.current_scenario:
            return {"error": "No active simulation"}
        
        self.simulator.reset()
        return {"success": True, "world_state": self.world.to_dict()}
    
    def start(self):
        """Start simulation"""
        if self.simulator:
            self.simulator.start()
    
    def stop(self):
        """Stop simulation"""
        if self.simulator:
            self.simulator.stop()
