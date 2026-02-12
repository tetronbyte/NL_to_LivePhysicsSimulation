// frontend/src/components/ParameterExplanation.jsx (NEW)
import React, { useState } from 'react';

const parameterInfo = {
  velocity: {
    name: "Velocity",
    unit: "m/s (meters per second)",
    description: "The rate of change of position. A vector quantity with both magnitude (speed) and direction.",
    significance: "Determines how fast and in what direction an object moves. Positive Y is upward, positive X is rightward.",
    examples: ["10 m/s upward = initial throw speed", "0 m/s = object at rest"]
  },
  mass: {
    name: "Mass",
    unit: "kg (kilograms)",
    description: "The amount of matter in an object. Measures resistance to acceleration (inertia).",
    significance: "Heavier objects require more force to accelerate. Affects momentum, kinetic energy, and gravitational force.",
    examples: ["1 kg = typical ball", "2 kg = heavier object falls at same rate (no air resistance)"]
  },
  acceleration: {
    name: "Acceleration",
    unit: "m/s² (meters per second squared)",
    description: "The rate of change of velocity. Caused by net force acting on object.",
    significance: "Shows how quickly velocity changes. Gravity causes constant downward acceleration of 9.8 m/s².",
    examples: ["9.8 m/s² = Earth's gravity", "0 m/s² = constant velocity motion"]
  },
  momentum: {
    name: "Momentum",
    unit: "kg⋅m/s (kilogram-meters per second)",
    description: "Product of mass and velocity (p = mv). Conserved in closed systems.",
    significance: "Measures 'quantity of motion'. In collisions, total momentum before = total momentum after.",
    examples: ["Heavy truck vs car: truck has more momentum at same speed"]
  },
  kineticEnergy: {
    name: "Kinetic Energy",
    unit: "J (Joules)",
    description: "Energy of motion. KE = ½mv². Depends on mass and velocity squared.",
    significance: "Energy available to do work. Doubles if mass doubles, quadruples if velocity doubles.",
    examples: ["Moving ball can break glass = KE converted to breaking work"]
  },
  potentialEnergy: {
    name: "Potential Energy",
    unit: "J (Joules)",
    description: "Stored energy due to position. PE = mgh for gravity.",
    significance: "Can be converted to kinetic energy. Higher objects have more PE.",
    examples: ["Ball at 10m height can fall and gain speed = PE → KE"]
  },
  restitution: {
    name: "Coefficient of Restitution",
    unit: "dimensionless (0 to 1)",
    description: "Measure of bounciness. 1 = perfectly elastic (no energy loss), 0 = perfectly inelastic (objects stick).",
    significance: "Determines how much kinetic energy is retained after collision.",
    examples: ["Rubber ball = 0.9", "Clay = 0.0", "Steel on steel = 0.95"]
  },
  angularVelocity: {
    name: "Angular Velocity",
    unit: "rad/s (radians per second)",
    description: "Rate of rotation. 2π rad/s = one complete rotation per second.",
    significance: "Determines how fast object moves in circular path. Related to tangential velocity by v = ωr.",
    examples: ["1 rad/s at 10m radius = 10 m/s tangential speed"]
  },
  centripetalForce: {
    name: "Centripetal Force",
    unit: "N (Newtons)",
    description: "Force directed toward center of circular path. Required to maintain circular motion.",
    significance: "Without it, object would move in straight line (Newton's 1st law). F = mv²/r = mω²r.",
    examples: ["String tension on swinging ball", "Gravity keeping moon in orbit"]
  },
  gravity: {
    name: "Gravitational Acceleration",
    unit: "m/s²",
    description: "Acceleration due to Earth's gravity. Standard value is 9.8 m/s² downward.",
    significance: "All objects fall at same rate (ignoring air resistance). Causes parabolic projectile paths.",
    examples: ["Moon = 1.6 m/s²", "Earth = 9.8 m/s²", "Jupiter = 24.8 m/s²"]
  }
};

const ParameterExplanation = () => {
  const [selectedParam, setSelectedParam] = useState('velocity');

  const info = parameterInfo[selectedParam];

  return (
    <div className="parameter-explanation">
      <h3>📚 Parameter Guide</h3>
      
      <div className="param-selector">
        <label>Learn about:</label>
        <select 
          value={selectedParam} 
          onChange={(e) => setSelectedParam(e.target.value)}
        >
          <option value="velocity">Velocity</option>
          <option value="mass">Mass</option>
          <option value="acceleration">Acceleration</option>
          <option value="momentum">Momentum</option>
          <option value="kineticEnergy">Kinetic Energy</option>
          <option value="potentialEnergy">Potential Energy</option>
          <option value="restitution">Coefficient of Restitution</option>
          <option value="angularVelocity">Angular Velocity</option>
          <option value="centripetalForce">Centripetal Force</option>
          <option value="gravity">Gravity</option>
        </select>
      </div>

      {info && (
        <div className="param-info">
          <h4>{info.name}</h4>
          
          <div className="info-section">
            <strong>Unit:</strong>
            <p>{info.unit}</p>
          </div>

          <div className="info-section">
            <strong>What is it?</strong>
            <p>{info.description}</p>
          </div>

          <div className="info-section">
            <strong>Why it matters:</strong>
            <p>{info.significance}</p>
          </div>

          <div className="info-section">
            <strong>Examples:</strong>
            <ul>
              {info.examples.map((example, idx) => (
                <li key={idx}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .parameter-explanation {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
        }

        .parameter-explanation h3 {
          margin: 0 0 16px 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        .param-selector {
          margin-bottom: 20px;
        }

        .param-selector label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .param-selector select {
          width: 100%;
          padding: 10px;
          font-size: 14px;
          border: 2px solid var(--input-border);
          border-radius: 6px;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .param-info {
          background: var(--bg-tertiary);
          padding: 16px;
          border-radius: 6px;
          border-left: 4px solid var(--accent-color);
        }

        .param-info h4 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--text-primary);
          padding-bottom: 8px;
          border-bottom: 2px solid var(--border-color);
        }

        .info-section {
          margin-bottom: 16px;
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        .info-section strong {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .info-section p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .info-section ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .info-section li {
          margin-bottom: 6px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary);
        }
      `}</style>

    </div>
  );
};

export default ParameterExplanation;
