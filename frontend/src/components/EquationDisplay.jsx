// frontend/src/components/EquationDisplay.jsx (NEW)
import React, { useState, useEffect } from 'react';

const EquationDisplay = ({ worldState }) => {
  const [relevantEquations, setRelevantEquations] = useState([]);

  useEffect(() => {
    if (!worldState) return;

    const equations = [];
    const obj = worldState.objects.find(o => !o.is_static);
    
    if (!obj) return;

    // Always show Newton's Second Law
    const netForce = Math.sqrt(
      (obj.acceleration.x * obj.mass) ** 2 + 
      (obj.acceleration.y * obj.mass) ** 2
    );
    equations.push({
      title: "Newton's Second Law",
      formula: "F = ma",
      substituted: `F = ${obj.mass.toFixed(2)} × ${Math.sqrt(obj.acceleration.x**2 + obj.acceleration.y**2).toFixed(2)}`,
      result: `F = ${netForce.toFixed(2)} N`,
      category: 'force'
    });

    // Kinematic equations if moving
    const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
    const accel = Math.sqrt(obj.acceleration.x ** 2 + obj.acceleration.y ** 2);
    
    if (speed > 0.1 || accel > 0.1) {
      equations.push({
        title: "Velocity",
        formula: "v = u + at",
        substituted: `v = ${speed.toFixed(2)} m/s (current)`,
        result: `|v| = ${speed.toFixed(2)} m/s`,
        category: 'kinematics'
      });
    }

    // Energy equations
    equations.push({
      title: "Kinetic Energy",
      formula: "KE = ½mv²",
      substituted: `KE = ½ × ${obj.mass.toFixed(2)} × ${speed.toFixed(2)}²`,
      result: `KE = ${obj.kinetic_energy.toFixed(2)} J`,
      category: 'energy'
    });

    if (worldState.gravity_enabled) {
      equations.push({
        title: "Potential Energy",
        formula: "PE = mgh",
        substituted: `PE = ${obj.mass.toFixed(2)} × ${worldState.gravity_strength.toFixed(1)} × ${obj.position.y.toFixed(2)}`,
        result: `PE = ${obj.potential_energy.toFixed(2)} J`,
        category: 'energy'
      });

      equations.push({
        title: "Mechanical Energy",
        formula: "E = KE + PE",
        substituted: `E = ${obj.kinetic_energy.toFixed(2)} + ${obj.potential_energy.toFixed(2)}`,
        result: `E = ${obj.mechanical_energy.toFixed(2)} J`,
        category: 'energy'
      });
    }

    // Momentum
    equations.push({
      title: "Linear Momentum",
      formula: "p = mv",
      substituted: `p = ${obj.mass.toFixed(2)} × ${speed.toFixed(2)}`,
      result: `|p| = ${obj.momentum_magnitude.toFixed(2)} kg⋅m/s`,
      category: 'momentum'
    });

    // Circular motion equations
    if (obj.circular_motion && obj.circular_motion.enabled) {
      const cm = obj.circular_motion;
      
      equations.push({
        title: "Centripetal Force",
        formula: "Fc = mv²/r",
        substituted: `Fc = ${obj.mass.toFixed(2)} × ${cm.tangential_velocity.toFixed(2)}² / ${cm.radius.toFixed(2)}`,
        result: `Fc = ${(obj.mass * cm.centripetal_acceleration).toFixed(2)} N`,
        category: 'circular'
      });

      equations.push({
        title: "Angular Velocity",
        formula: "ω = v/r",
        substituted: `ω = ${cm.tangential_velocity.toFixed(2)} / ${cm.radius.toFixed(2)}`,
        result: `ω = ${cm.angular_velocity.toFixed(3)} rad/s`,
        category: 'circular'
      });

      equations.push({
        title: "Period",
        formula: "T = 2π/ω",
        substituted: `T = 2π / ${cm.angular_velocity.toFixed(3)}`,
        result: `T = ${cm.period.toFixed(2)} s`,
        category: 'circular'
      });
    }

    // Projectile motion - time of flight
    if (obj.velocity.y !== 0 && worldState.gravity_enabled && obj.position.y > worldState.ground_level + 1) {
      const timeToGround = obj.velocity.y / worldState.gravity_strength + 
                          Math.sqrt((obj.velocity.y ** 2) + 2 * worldState.gravity_strength * obj.position.y) / worldState.gravity_strength;
      
      equations.push({
        title: "Time of Flight",
        formula: "t = 2v₀/g",
        substituted: `t ≈ ${timeToGround.toFixed(2)} s`,
        result: `(estimated)`,
        category: 'projectile'
      });
    }

    setRelevantEquations(equations);
  }, [worldState]);

  if (!worldState || relevantEquations.length === 0) {
    return null;
  }

  const categories = [...new Set(relevantEquations.map(eq => eq.category))];

  return (
    <div className="equation-display">
      <h3>📐 Dynamic Equations</h3>
      
      <div className="equations-grid">
        {categories.map(category => (
          <div key={category} className="category-section">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            {relevantEquations
              .filter(eq => eq.category === category)
              .map((eq, idx) => (
                <div key={idx} className="equation-card">
                  <div className="equation-title">{eq.title}</div>
                  <div className="equation-formula">{eq.formula}</div>
                  <div className="equation-substituted">{eq.substituted}</div>
                  <div className="equation-result">{eq.result}</div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .equation-display {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .equations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .category-section {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
        }

        .category-section h4 {
          margin: 0 0 10px 0;
          color: #34495e;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .equation-card {
          background: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 8px;
          border-left: 3px solid #3498db;
        }

        .equation-card:last-child {
          margin-bottom: 0;
        }

        .equation-title {
          font-size: 11px;
          color: #7f8c8d;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .equation-formula {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 4px;
        }

        .equation-substituted {
          font-size: 11px;
          color: #34495e;
          margin-bottom: 2px;
        }

        .equation-result {
          font-size: 13px;
          font-weight: bold;
          color: #27ae60;
        }
      `}</style>
    </div>
  );
};

export default EquationDisplay;
