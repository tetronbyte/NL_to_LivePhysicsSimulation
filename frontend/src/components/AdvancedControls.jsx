// frontend/src/components/AdvancedControls.jsx (NEW)
import React, { useState } from 'react';

const AdvancedControls = ({ worldState, onUpdate, onUpdateWorld, onSetCircularMotion, onSetCollision }) => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!worldState || worldState.objects.length === 0) {
    return null;
  }

  const selectedObj = worldState.objects.find(o => o.id === selectedObject);

  const handleVectorChange = (parameter, axis, value) => {
    if (!selectedObject) return;
    
    const obj = worldState.objects.find(o => o.id === selectedObject);
    const newValue = { ...obj[parameter] };
    newValue[axis] = parseFloat(value) || 0;
    
    onUpdate(selectedObject, parameter, newValue);
  };

  const handleScalarChange = (parameter, value) => {
    if (!selectedObject) return;
    onUpdate(selectedObject, parameter, parseFloat(value) || 0);
  };

  const handleStringChange = (parameter, value) => {
    if (!selectedObject) return;
    onUpdate(selectedObject, parameter, value);
  };

  const handleCircularMotion = (enabled) => {
    if (!selectedObject || !selectedObj) return;
    
    const center = { x: 50, y: 50 };
    const radius = 15;
    const angularVelocity = 1.0;
    
    onSetCircularMotion(selectedObject, center, radius, angularVelocity, 0, enabled);
  };

  return (
    <div className="advanced-controls">
      <div className="section-header">
        <h3>Advanced Controls</h3>
        <button 
          className="toggle-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} {showAdvanced ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Object Selection */}
      <div className="control-group">
        <label>Select Object:</label>
        <select
          value={selectedObject || ''}
          onChange={(e) => setSelectedObject(e.target.value)}
        >
          <option value="">-- Choose object --</option>
          {worldState.objects.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.label} ({obj.shape})
            </option>
          ))}
        </select>
      </div>

      {selectedObj && (
        <>
          {/* Basic Parameters */}
          <div className="parameters-section">
            <h4>Motion Parameters</h4>
            
            <div className="param-row">
              <label>Velocity X (m/s):</label>
              <input
                type="number"
                step="0.5"
                value={selectedObj.velocity.x.toFixed(2)}
                onChange={(e) => handleVectorChange('velocity', 'x', e.target.value)}
              />
            </div>

            <div className="param-row">
              <label>Velocity Y (m/s):</label>
              <input
                type="number"
                step="0.5"
                value={selectedObj.velocity.y.toFixed(2)}
                onChange={(e) => handleVectorChange('velocity', 'y', e.target.value)}
              />
            </div>

            <div className="param-row">
              <label>Mass (kg):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedObj.mass.toFixed(2)}
                onChange={(e) => handleScalarChange('mass', e.target.value)}
              />
            </div>

            <div className="param-row">
              <label>Radius (m):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={selectedObj.radius.toFixed(2)}
                onChange={(e) => handleScalarChange('radius', e.target.value)}
              />
            </div>
          </div>

          {/* Collision Settings */}
          <div className="parameters-section">
            <h4>Collision Settings</h4>
            
            <div className="param-row">
              <label>Collision Type:</label>
              <select
                value={selectedObj.collision_type}
                onChange={(e) => {
                  const type = e.target.value;
                  const restitution = type === 'elastic' ? 1.0 : 
                                    type === 'perfectly_inelastic' ? 0.0 : 0.5;
                  onSetCollision(selectedObject, type, restitution);
                }}
              >
                <option value="elastic">Elastic</option>
                <option value="inelastic">Inelastic</option>
                <option value="perfectly_inelastic">Perfectly Inelastic</option>
              </select>
            </div>

            {selectedObj.collision_type === 'inelastic' && (
              <div className="param-row">
                <label>Restitution (0-1):</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedObj.restitution}
                  onChange={(e) => onSetCollision(
                    selectedObject, 
                    selectedObj.collision_type, 
                    parseFloat(e.target.value)
                  )}
                />
                <span>{selectedObj.restitution.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="parameters-section">
            <h4>Appearance</h4>
            
            <div className="param-row">
              <label>Shape:</label>
              <select
                value={selectedObj.shape}
                onChange={(e) => handleStringChange('shape', e.target.value)}
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </div>

            <div className="param-row">
              <label>Color:</label>
              <input
                type="color"
                value={selectedObj.color}
                onChange={(e) => handleStringChange('color', e.target.value)}
              />
            </div>

            <div className="param-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={selectedObj.show_velocity_vector}
                  onChange={(e) => onUpdate(selectedObject, 'show_velocity_vector', e.target.checked)}
                />
                Show Velocity Vector
              </label>
            </div>

            <div className="param-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={selectedObj.show_trajectory}
                  onChange={(e) => onUpdate(selectedObject, 'show_trajectory', e.target.checked)}
                />
                Show Trajectory
              </label>
            </div>
          </div>

          {/* Circular Motion */}
          {showAdvanced && (
            <div className="parameters-section">
              <h4>Circular Motion</h4>
              
              <div className="param-row checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedObj.circular_motion?.enabled || false}
                    onChange={(e) => handleCircularMotion(e.target.checked)}
                  />
                  Enable Circular Motion
                </label>
              </div>

              {selectedObj.circular_motion?.enabled && (
                <>
                  <div className="param-row">
                    <label>Radius (m):</label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={selectedObj.circular_motion.radius}
                      onChange={(e) => {
                        const newRadius = parseFloat(e.target.value);
                        onSetCircularMotion(
                          selectedObject,
                          selectedObj.circular_motion.center,
                          newRadius,
                          selectedObj.circular_motion.angular_velocity,
                          selectedObj.circular_motion.angle,
                          true
                        );
                      }}
                    />
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="40"
                      value={selectedObj.circular_motion.radius.toFixed(1)}
                      onChange={(e) => {
                        const newRadius = parseFloat(e.target.value);
                        onSetCircularMotion(
                          selectedObject,
                          selectedObj.circular_motion.center,
                          newRadius,
                          selectedObj.circular_motion.angular_velocity,
                          selectedObj.circular_motion.angle,
                          true
                        );
                      }}
                      className="number-input"
                    />
                  </div>

                  <div className="param-row">
                    <label>Angular Velocity (rad/s):</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={selectedObj.circular_motion.angular_velocity}
                      onChange={(e) => {
                        const newAngVel = parseFloat(e.target.value);
                        onSetCircularMotion(
                          selectedObject,
                          selectedObj.circular_motion.center,
                          selectedObj.circular_motion.radius,
                          newAngVel,
                          selectedObj.circular_motion.angle,
                          true
                        );
                      }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5"
                      value={selectedObj.circular_motion.angular_velocity.toFixed(2)}
                      onChange={(e) => {
                        const newAngVel = parseFloat(e.target.value);
                        onSetCircularMotion(
                          selectedObject,
                          selectedObj.circular_motion.center,
                          selectedObj.circular_motion.radius,
                          newAngVel,
                          selectedObj.circular_motion.angle,
                          true
                        );
                      }}
                      className="number-input"
                    />
                  </div>

                  <div className="info-display">
                    <p><strong>Radius:</strong> {selectedObj.circular_motion.radius.toFixed(2)} m</p>
                    <p><strong>Angular Velocity:</strong> {selectedObj.circular_motion.angular_velocity.toFixed(2)} rad/s</p>
                    <p><strong>Tangential Velocity:</strong> {selectedObj.circular_motion.tangential_velocity.toFixed(2)} m/s</p>
                    <p><strong>Centripetal Accel:</strong> {selectedObj.circular_motion.centripetal_acceleration.toFixed(2)} m/s²</p>
                    <p><strong>Period:</strong> {selectedObj.circular_motion.period.toFixed(2)} s</p>
                    <p><strong>Frequency:</strong> {selectedObj.circular_motion.frequency.toFixed(2)} Hz</p>
                    <p><strong>Angle:</strong> {selectedObj.circular_motion.angle_degrees.toFixed(1)}°</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Current State Info */}
          <div className="parameters-section">
            <h4>Current State</h4>
            <div className="info-display">
              <p><strong>Position:</strong> ({selectedObj.position.x.toFixed(2)}, {selectedObj.position.y.toFixed(2)}) m</p>
              <p><strong>Speed:</strong> {Math.sqrt(selectedObj.velocity.x**2 + selectedObj.velocity.y**2).toFixed(2)} m/s</p>
              <p><strong>Acceleration:</strong> {Math.sqrt(selectedObj.acceleration.x**2 + selectedObj.acceleration.y**2).toFixed(2)} m/s²</p>
              <p><strong>KE:</strong> {selectedObj.kinetic_energy.toFixed(2)} J</p>
              <p><strong>PE:</strong> {selectedObj.potential_energy.toFixed(2)} J</p>
              <p><strong>Momentum:</strong> {selectedObj.momentum_magnitude.toFixed(2)} kg⋅m/s</p>
              <p><strong>Displacement:</strong> {selectedObj.displacement_magnitude.toFixed(2)} m</p>
              <p><strong>Distance Traveled:</strong> {selectedObj.distance_traveled.toFixed(2)} m</p>
            </div>
          </div>
        </>
      )}

      {/* World Settings */}
      <div className="parameters-section world-settings">
        <h4>World Settings</h4>
        
        <div className="param-row checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={worldState.gravity_enabled}
              onChange={(e) => onUpdateWorld({ gravity_enabled: e.target.checked })}
            />
            Gravity Enabled
          </label>
        </div>

        {worldState.gravity_enabled && (
          <div className="param-row">
            <label>Gravity (m/s²):</label>
            <input
              type="number"
              step="0.1"
              value={worldState.gravity_strength.toFixed(1)}
              onChange={(e) => onUpdateWorld({ gravity_strength: parseFloat(e.target.value) })}
            />
          </div>
        )}

        <div className="param-row checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={worldState.collision_enabled}
              onChange={(e) => onUpdateWorld({ collision_enabled: e.target.checked })}
            />
            Collision Detection
          </label>
        </div>
      </div>

      <style jsx>{`
        .advanced-controls {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-height: 600px;
          overflow-y: auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .toggle-btn {
          padding: 4px 12px;
          background: #ecf0f1;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .toggle-btn:hover {
          background: #d5dbdb;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .control-group select {
          width: 100%;
          padding: 8px;
          font-size: 14px;
          border: 2px solid #ddd;
          border-radius: 4px;
        }

        .parameters-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #ecf0f1;
        }

        .parameters-section h4 {
          margin: 0 0 12px 0;
          color: #34495e;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .param-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 12px;
        }

        .param-row label {
          flex: 1;
          font-size: 13px;
          color: #2c3e50;
        }

        .param-row input[type="number"],
        .param-row input[type="color"],
        .param-row select {
          flex: 0 0 120px;
          padding: 6px;
          font-size: 13px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .param-row input[type="range"] {
          flex: 1;
        }

        .param-row span {
          flex: 0 0 40px;
          font-size: 13px;
          color: #7f8c8d;
        }

        .checkbox-row {
          justify-content: flex-start;
        }

        .checkbox-row label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .info-display {
          background: #ecf0f1;
          padding: 12px;
          border-radius: 4px;
          font-size: 13px;
        }

        .info-display p {
          margin: 6px 0;
          color: #2c3e50;
        }

        .info-display strong {
          color: #34495e;
        }

        .world-settings {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdvancedControls;
