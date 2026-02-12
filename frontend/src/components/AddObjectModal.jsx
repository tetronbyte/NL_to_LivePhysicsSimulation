// frontend/src/components/AddObjectModal.jsx (NEW)
import React, { useState } from 'react';

const AddObjectModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    label: 'New Object',
    mass: 1.0,
    positionX: 50,
    positionY: 20,
    velocityX: 0,
    velocityY: 0,
    radius: 0.5,
    color: '#3498db',
    shape: 'circle',
    width: 1.0,
    height: 1.0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const objectData = {
      label: formData.label,
      mass: parseFloat(formData.mass),
      position: { x: parseFloat(formData.positionX), y: parseFloat(formData.positionY) },
      velocity: { x: parseFloat(formData.velocityX), y: parseFloat(formData.velocityY) },
      radius: parseFloat(formData.radius),
      color: formData.color,
      shape: formData.shape,
      width: parseFloat(formData.width),
      height: parseFloat(formData.height)
    };

    onAdd(objectData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>➕ Add New Object</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Label:</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleChange('label', e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mass (kg):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.mass}
                onChange={(e) => handleChange('mass', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Radius (m):</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.radius}
                onChange={(e) => handleChange('radius', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Position X:</label>
              <input
                type="number"
                step="1"
                value={formData.positionX}
                onChange={(e) => handleChange('positionX', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Position Y:</label>
              <input
                type="number"
                step="1"
                value={formData.positionY}
                onChange={(e) => handleChange('positionY', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Velocity X (m/s):</label>
              <input
                type="number"
                step="0.5"
                value={formData.velocityX}
                onChange={(e) => handleChange('velocityX', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Velocity Y (m/s):</label>
              <input
                type="number"
                step="0.5"
                value={formData.velocityY}
                onChange={(e) => handleChange('velocityY', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Shape:</label>
              <select
                value={formData.shape}
                onChange={(e) => handleChange('shape', e.target.value)}
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Color:</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </div>
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Object
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }

          .modal-content {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: fadeIn 0.3s ease-in;
          }

          h3 {
            margin: 0 0 24px 0;
            color: var(--text-primary);
            font-size: 22px;
          }

          .form-group {
            margin-bottom: 16px;
            flex: 1;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: var(--text-primary);
            font-size: 13px;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 10px;
            font-size: 14px;
            border: 2px solid var(--input-border);
            border-radius: 6px;
            background: var(--input-bg);
            color: var(--text-primary);
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--accent-color);
          }

          .form-row {
            display: flex;
            gap: 16px;
          }

          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .button-group button {
            flex: 1;
            padding: 12px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cancel-btn {
            background: var(--bg-tertiary);
            color: var(--text-primary);
          }

          .cancel-btn:hover {
            background: var(--bg-hover);
          }

          .submit-btn {
            background: var(--accent-color);
            color: white;
          }

          .submit-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
        `}</style>

      </div>
    </div>
  );
};

export default AddObjectModal;
