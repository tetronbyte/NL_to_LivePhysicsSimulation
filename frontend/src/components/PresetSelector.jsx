// frontend/src/components/PresetSelector.jsx (NEW)
import React from 'react';

const presets = [
  {
    id: 'projectile_motion',
    name: '🎯 Projectile Motion',
    description: 'Launch a projectile at an angle',
    icon: '📐',
    defaultParams: { velocity: 15, angle: 45 }
  },
  {
    id: 'free_fall',
    name: '⬇️ Free Fall',
    description: 'Drop an object from height',
    icon: '🪂',
    defaultParams: { height: 20, mass: 1 }
  },
  {
    id: 'elastic_collision',
    name: '💥 Elastic Collision',
    description: 'Two objects collide elastically',
    icon: '⚡',
    defaultParams: { mass1: 2, mass2: 1 }
  },
  {
    id: 'inelastic_collision',
    name: '🔗 Inelastic Collision',
    description: 'Objects collide and stick together',
    icon: '🧲',
    defaultParams: { mass1: 2, mass2: 1 }
  },
  {
    id: 'circular_motion',
    name: '🔄 Circular Motion',
    description: 'Object moving in a circle',
    icon: '🌀',
    defaultParams: { radius: 15, angular_velocity: 1 }
  },
  {
    id: 'pendulum',
    name: '⚖️ Pendulum',
    description: 'Simple pendulum oscillation',
    icon: '🎱',
    defaultParams: { length: 15, initial_angle: 30 }
  },
  {
    id: 'spring_oscillation',
    name: '🌊 Spring Oscillation',
    description: 'Mass on a spring',
    icon: '〰️',
    defaultParams: { spring_constant: 10, displacement: 5 }
  },
  {
    id: 'newton_cradle',
    name: '⚫ Newton\'s Cradle',
    description: 'Demonstration of momentum conservation',
    icon: '🎯',
    defaultParams: { num_balls: 5 }
  }
];

const PresetSelector = ({ onSelectPreset, isLoading }) => {
  return (
    <div className="preset-selector">
      <h3>⚡ Quick Start Scenarios</h3>
      <p className="subtitle">Choose a preset scenario to explore physics concepts</p>
      
      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className="preset-card"
            onClick={() => onSelectPreset(preset.id, preset.defaultParams)}
            disabled={isLoading}
          >
            <div className="preset-icon">{preset.icon}</div>
            <div className="preset-content">
              <h4>{preset.name}</h4>
              <p>{preset.description}</p>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .preset-selector {
          background: var(--card-bg);
          padding: 24px;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-in;
        }

        .preset-selector h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        .subtitle {
          margin: 0 0 20px 0;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .preset-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--bg-tertiary);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
        }

        .preset-card:hover:not(:disabled) {
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: var(--bg-hover);
        }

        .preset-card:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preset-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .preset-content {
          flex: 1;
        }

        .preset-content h4 {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .preset-content p {
          margin: 0;
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
      `}</style>

    </div>
  );
};

export default PresetSelector;
