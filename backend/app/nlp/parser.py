# backend/app/nlp/parser.py
import json
import os
import re
import math
from dotenv import load_dotenv
from typing import Optional
import httpx
from pydantic import ValidationError
from .schema import ParsedProblem, SimulationScenario
from .prompt_templates import get_parser_prompt

load_dotenv()

class PhysicsProblemParser:
    """Parse natural language physics problems using Ollama Cloud"""
    
    def __init__(
        self,
        model_name: str = "kimi-k2.5:cloud",
        api_key: str = None,
        base_url: str = "https://ollama.com/api"
    ):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("API_KEY")
        self.base_url = base_url

        if not self.api_key:
            raise ValueError("API_KEY not found in environment variables.")
    
    async def parse(self, problem_text: str) -> ParsedProblem:
        try:
            prompt = get_parser_prompt(problem_text)

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/generate",
                    headers=headers,
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )

                response.raise_for_status()
                result = response.json()

                response_text = result.get("response", "")
                print(f"Raw LLM Response: {response_text}")

                scenario_data = self._extract_json(response_text)

                if not scenario_data:
                    print("Failed to extract JSON, using fallback parser")
                    from .fallback_parser import parse_simple_projectile
                    scenario = parse_simple_projectile(problem_text)
                    return ParsedProblem(success=True, scenario=scenario)

                # ✅ Post-process circular motion
                scenario_data = self._parse_circular_motion(scenario_data)

                print(f"Extracted JSON: {json.dumps(scenario_data, indent=2)}")

                scenario = SimulationScenario(**scenario_data)
                return ParsedProblem(success=True, scenario=scenario)

        except Exception as e:
            import traceback
            print(f"Parser Exception: {traceback.format_exc()}")

            try:
                from .fallback_parser import parse_simple_projectile
                scenario = parse_simple_projectile(problem_text)
                return ParsedProblem(success=True, scenario=scenario)
            except:
                return ParsedProblem(
                    success=False,
                    error_message=f"Error parsing problem: {str(e)}"
                )


    def _extract_json(self, text: str) -> Optional[dict]:
        """Extract JSON object from text"""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON in code blocks
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Try to find any JSON object
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
        return None
    def _parse_circular_motion(self, scenario_data: dict) -> dict:
        """Post-process circular motion scenarios"""
        if scenario_data.get("scenario_type") == "circular_motion":
            for entity in scenario_data.get("entities", []):
                # Calculate circular motion parameters from velocity
                vel = entity.get("initial_velocity", {})
                speed = math.sqrt(vel.get("x", 0)**2 + vel.get("y", 0)**2)
                
                # Estimate center and radius if not specified
                pos = entity.get("initial_position", {"x": 50, "y": 50})
                
                # Add circular motion metadata
                entity["circular_motion"] = {
                    "enabled": True,
                    "center": {"x": 50, "y": 50},  # Center of canvas
                    "radius": entity.get("radius", 15),
                    "linear_velocity": speed
                }
        
        return scenario_data
    
    async def parse(self, problem_text: str) -> ParsedProblem:
        """Parse a physics problem into structured format"""
        try:
            prompt = get_parser_prompt(problem_text)

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/generate",
                    headers=headers,
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )

                response.raise_for_status()
                result = response.json()

                response_text = result.get("response", "")
                print(f"Raw LLM Response: {response_text}")

                scenario_data = self._extract_json(response_text)

                if not scenario_data:
                    print("Failed to extract JSON, using fallback parser")
                    from .fallback_parser import parse_simple_projectile
                    scenario = parse_simple_projectile(problem_text)
                    return ParsedProblem(success=True, scenario=scenario)

                # Post-process circular motion
                scenario_data = self._parse_circular_motion(scenario_data)
                
                print(f"Extracted JSON: {json.dumps(scenario_data, indent=2)}")

                try:
                    scenario = SimulationScenario(**scenario_data)
                    return ParsedProblem(success=True, scenario=scenario)
                except ValidationError as ve:
                    print(f"Validation Error: {ve}, using fallback parser")
                    from .fallback_parser import parse_simple_projectile
                    scenario = parse_simple_projectile(problem_text)
                    return ParsedProblem(success=True, scenario=scenario)

        except Exception as e:
            import traceback
            print(f"Parser Exception: {traceback.format_exc()}")
            try:
                from .fallback_parser import parse_simple_projectile
                scenario = parse_simple_projectile(problem_text)
                return ParsedProblem(success=True, scenario=scenario)
            except:
                return ParsedProblem(
                    success=False,
                    error_message=f"Error parsing problem: {str(e)}"
                )