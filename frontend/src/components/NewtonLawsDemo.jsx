// frontend/src/components/NewtonLawsDemo.jsx (NEW)
import React, { useState } from 'react';

const NewtonLawsDemo = () => {
  const [selectedLaw, setSelectedLaw] = useState(1);

  const laws = {
    1: {
      title: "First Law - Law of Inertia",
      statement: "An object at rest stays at rest, and an object in motion stays in motion with the same velocity, unless acted upon by a net external force.",
      explanation: "Objects resist changes in their motion. Without forces, velocity remains constant.",
      realWorld: [
        "Seat belts: Your body continues forward when car stops",
        "Hockey puck sliding on ice keeps moving",
        "Astronauts float in space (no net force)"
      ],
      formula: "ΣF = 0 → Δv = 0"
    },
    2: {
      title: "Second Law - F = ma",
      statement: "The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.",
      explanation: "More force = more acceleration. More mass = less acceleration for same force.",
      realWorld: [
        "Pushing a heavy box requires more force than a light one",
        "Same force accelerates a car faster than a truck",
        "Gravity accelerates all objects at 9.8 m/s² (ignoring air)"
      ],
      formula: "F = ma  or  a = F/m"
    },
    3: {
      title: "Third Law - Action-Reaction",
      statement: "For every action, there is an equal and opposite reaction.",
      explanation: "Forces always come in pairs. When object A pushes on object B, object B pushes back on A with equal force in opposite direction.",
      realWorld: [
        "Rocket propulsion: Gas pushed down, rocket pushed up",
        "Walking: You push ground backward, ground pushes you forward",
        "Recoil when firing a gun"
      ],
      formula: "F₁₂ = -F₂₁"
    }
  };

  const law = laws[selectedLaw];

  return (
    <div className="newton-laws">
      <h3>⚛️ Newton's Laws of Motion</h3>

      <div className="law-selector">
        {[1, 2, 3].map(num => (
          <button
            key={num}
            className={`law-btn ${selectedLaw === num ? 'active' : ''}`}
            onClick={() => setSelectedLaw(num)}
          >
            Law {num}
          </button>
        ))}
      </div>

      <div className="law-content">
        <h4>{law.title}</h4>
        
        <div className="law-section">
          <strong>Statement:</strong>
          <p className="statement">{law.statement}</p>
        </div>

        <div className="law-section">
          <strong>In Simple Terms:</strong>
          <p>{law.explanation}</p>
        </div>

        <div className="law-section">
          <strong>Formula:</strong>
          <div className="formula">{law.formula}</div>
        </div>

        <div className="law-section">
          <strong>Real-World Examples:</strong>
          <ul>
            {law.realWorld.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .newton-laws {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .newton-laws h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 20px;
        }

        .law-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .law-btn {
          flex: 1;
          padding: 12px;
          background: #ecf0f1;
          border: 2px solid transparent;
          border-radius: 6px;
          font-weight: 600;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.3s;
        }

        .law-btn:hover {
          background: #d5dbdb;
        }

        .law-btn.active {
          background: #3498db;
          color: white;
          border-color: #2980b9;
        }

        .law-content {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
        }

        .law-content h4 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .law-section {
          margin-bottom: 20px;
        }

        .law-section:last-child {
          margin-bottom: 0;
        }

        .law-section strong {
          display: block;
          margin-bottom: 8px;
          color: #34495e;
          font-size: 14px;
        }

        .law-section p {
          margin: 0;
          color: #2c3e50;
          line-height: 1.6;
          font-size: 14px;
        }

        .statement {
          font-style: italic;
          background: white;
          padding: 12px;
          border-left: 4px solid #3498db;
          border-radius: 4px;
        }

        .formula {
          background: white;
          padding: 12px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          color: #e74c3c;
          text-align: center;
        }

        .law-section ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .law-section li {
          margin-bottom: 8px;
          color: #2c3e50;
          line-height: 1.5;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default NewtonLawsDemo;
