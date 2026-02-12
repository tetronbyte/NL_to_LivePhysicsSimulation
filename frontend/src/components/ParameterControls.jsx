// frontend/src/components/ParameterControls.jsx (UPDATE - Enhanced Version)
import React, { useState } from 'react';

const ParameterControls = ({ worldState, onUpdate, onReset, onStart, onStop, onStepOnce, isPlaying }) => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [stepMode, setStepMode] = useState(false);

  if (!worldState || worldState.objects.length === 0) {
    return null;
  }

  const handleVelocityChange = (axis, value) => {
    if (!selectedObject) return;
    
    const obj = worldState.objects.find(o => o.id === selectedObject);
    const newVelocity = { ...obj.velocity };
    newVelocity[axis] = parseFloat(value) || 0;
    
    onUpdate(selectedObject, 'velocity', newVelocity);
  };

  const handleMassChange = (value) => {
    if (!selectedObject) return;
    onUpdate(selectedObject, 'mass', parseFloat(value) || 1);
  };

  const handleVelocityMagnitudeChange = (magnitude) => {
    if (!selectedObject) return;
    const obj = worldState.objects.find(o => o.id === selectedObject);
    
    // Keep current direction, change magnitude
    const currentSpeed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
    if (currentSpeed === 0) {
      onUpdate(selectedObject, 'velocity', { x: magnitude, y: 0 });
    } else {
      const scale = magnitude / currentSpeed;
      onUpdate(selectedObject, 'velocity', { 
        x: obj.velocity.x * scale, 
        y: obj.velocity.y * scale 
      });
    }
  };

  const handleVelocityAngleChange = (angleDeg) => {
    if (!selectedObject) return;
    const obj = worldState.objects.find(o => o.id === selectedObject);
    
    // Keep current magnitude, change direction
    const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
    const angleRad = (angleDeg * Math.PI) / 180;
    
    onUpdate(selectedObject, 'velocity', {
      x: speed * Math.cos(angleRad),
      y: speed * Math.sin(angleRad)
    });
  };

  const selectedObj = worldState.objects.find(o => o.id === selectedObject);

  const getCurrentAngle = () => {
    if (!selectedObj) return 0;
    const angle = Math.atan2(selectedObj.velocity.y, selectedObj.velocity.x);
    return (angle * 180 / Math.PI).toFixed(0);
  };

  const getCurrentSpeed = () => {
    if (!selectedObj) return 0;
    return Math.sqrt(selectedObj.velocity.x ** 2 + selectedObj.velocity.y ** 2).toFixed(2);
  };

  return (
    <div className="parameter-controls">
      <h3>🎮 Simulation Controls</h3>

      {/* Playback Controls */}
      <div className="control-buttons">
        <button 
          onClick={onStart} 
          disabled={isPlaying}
          title="Play continuous simulation"
        >
          ▶ Play
        </button>
        <button 
          onClick={onStop} 
          disabled={!isPlaying}
          title="Pause simulation"
        >
          ⏸ Pause
        </button>
        <button 
          onClick={() => {
            setStepMode(true);
            onStepOnce();
          }}
          disabled={isPlaying}
          title="Advance one frame"
        >
          ⏭ Step
        </button>
        <button 
          onClick={onReset}
          title="Reset to initial state"
        >
          ↻ Reset
        </button>
      </div>

      {stepMode && (
        <div className="step-info">
          Step-by-step mode active. Click Step to advance one frame.
        </div>
      )}

      {/* Object Selection */}
      <div className="object-selector">
        <label>Select Object:</label>
        <select
          value={selectedObject || ''}
          onChange={(e) => setSelectedObject(e.target.value)}
        >
          <option value="">-- Choose object --</option>
          {worldState.objects.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.label}
            </option>
          ))}
        </select>
      </div>

      {selectedObj && (
        <div className="parameters">
          <h4>Adjust: {selectedObj.label}</h4>

          {/* Velocity - Magnitude and Direction */}
          <div className="param-section">
            <h5>Velocity Control</h5>
            
            <div className="parameter-group">
              <label>Speed (m/s):</label>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={getCurrentSpeed()}
                onChange={(e) => handleVelocityMagnitudeChange(parseFloat(e.target.value))}
              />
              <input
                type="number"
                step="0.5"
                value={getCurrentSpeed()}
                onChange={(e) => handleVelocityMagnitudeChange(parseFloat(e.target.value))}
                className="number-input"
              />
            </div>

            <div className="parameter-group">
              <label>Angle (degrees):</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={getCurrentAngle()}
                onChange={(e) => handleVelocityAngleChange(parseFloat(e.target.value))}
              />
              <input
                type="number"
                step="5"
                value={getCurrentAngle()}
                onChange={(e) => handleVelocityAngleChange(parseFloat(e.target.value))}
                className="number-input"
              />
            </div>

            <div className="velocity-components">
              <div className="component">
                <label>Vx:</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedObj.velocity.x.toFixed(2)}
                  onChange={(e) => handleVelocityChange('x', e.target.value)}
                />
              </div>
              <div className="component">
                <label>Vy:</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedObj.velocity.y.toFixed(2)}
                  onChange={(e) => handleVelocityChange('y', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Mass Control */}
          <div className="param-section">
            <h5>Mass Control</h5>
            
            <div className="parameter-group">
              <label>Mass (kg):</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={selectedObj.mass}
                onChange={(e) => handleMassChange(e.target.value)}
              />
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedObj.mass.toFixed(2)}
                onChange={(e) => handleMassChange(e.target.value)}
                className="number-input"
              />
            </div>
          </div>
          
          {/* Elasticity Control */}
          <div className="param-section">
            <h5>Collision Properties</h5>
            
            <div className="parameter-group">
              <label>Elasticity (e):</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedObj.restitution}
                onChange={(e) => {
                  const restitution = parseFloat(e.target.value);
                  onSetCollision(selectedObject, selectedObj.collision_type, restitution);
                }}
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={selectedObj.restitution.toFixed(1)}
                onChange={(e) => {
                  const restitution = parseFloat(e.target.value);
                  onSetCollision(selectedObject, selectedObj.collision_type, restitution);
                }}
                className="number-input"
              />
            </div>

            <div className="elasticity-info">
              <p>
                {selectedObj.restitution === 1.0 && "Perfectly elastic - no energy loss"}
                {selectedObj.restitution === 0.0 && "Perfectly inelastic - maximum energy loss"}
                {selectedObj.restitution > 0 && selectedObj.restitution < 1 && 
                  `Partially elastic - ${((1 - selectedObj.restitution) * 100).toFixed(0)}% energy loss`}
              </p>
            </div>
          </div>

          {/* Current State Display */}
          <div className="info">
            <h5>Current State</h5>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Position:</span>
                <span className="info-value">
                  ({selectedObj.position.x.toFixed(2)}, {selectedObj.position.y.toFixed(2)}) m
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Speed:</span>
                <span className="info-value">{getCurrentSpeed()} m/s</span>
              </div>
              <div className="info-item">
                <span className="info-label">Acceleration:</span>
                <span className="info-value">
                  {Math.sqrt(selectedObj.acceleration.x**2 + selectedObj.acceleration.y**2).toFixed(2)} m/s²
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">KE:</span>
                <span className="info-value">{selectedObj.kinetic_energy.toFixed(2)} J</span>
              </div>
              <div className="info-item">
                <span className="info-label">PE:</span>
                <span className="info-value">{selectedObj.potential_energy.toFixed(2)} J</span>
              </div>
              <div className="info-item">
                <span className="info-label">Momentum:</span>
                <span className="info-value">{selectedObj.momentum_magnitude.toFixed(2)} kg⋅m/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .parameter-controls {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 20px;
        }

        h4 {
          color: #34495e;
          margin: 20px 0 16px 0;
          font-size: 16px;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 8px;
        }

        h5 {
          color: #34495e;
          margin: 16px 0 12px 0;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .control-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .control-buttons button {
          padding: 12px 8px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          background: #3498db;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-buttons button:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-1px);
        }

        .control-buttons button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
        }

        .step-info {
          padding: 10px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          font-size: 12px;
          color: #856404;
          margin-bottom: 16px;
        }

        .object-selector {
          margin-bottom: 20px;
        }

        .object-selector label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .object-selector select {
          width: 100%;
          padding: 10px;
          font-size: 14px;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
        }

        .object-selector select:focus {
          outline: none;
          border-color: #3498db;
        }

        .parameters {
          border-top: 2px solid #ecf0f1;
          padding-top: 20px;
        }

        .param-section {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .parameter-group {
          display: grid;
          grid-template-columns: 120px 1fr 80px;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .parameter-group label {
          font-size: 13px;
          color: #2c3e50;
          font-weight: 600;
        }

        .parameter-group input[type="range"] {
          width: 100%;
        }

        .parameter-group .number-input {
          padding: 6px;
          font-size: 13px;
          border: 1px solid #ddd;
          border-radius: 4px;
          text-align: center;
        }

        .velocity-components {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #dee2e6;
        }

        .component {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .component label {
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
          min-width: 30px;
        }

        .component input {
          flex: 1;
          padding: 6px;
          font-size: 13px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .info {
          background: #e8f4f8;
          padding: 16px;
          border-radius: 6px;
          border-left: 4px solid #3498db;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
};

export default ParameterControls;
