// frontend/src/pages/Home.jsx (COMPLETE REDESIGN)
import React, { useState, useEffect, useRef } from 'react';
import ProblemInput from '../components/ProblemInput';
import SimulationCanvas from '../components/SimulationCanvas';
import ParameterControls from '../components/ParameterControls';
import AdvancedControls from '../components/AdvancedControls';
import ParameterExplanation from '../components/ParameterExplanation';
import PresetSelector from '../components/PresetSelector';
import EnergyChart from '../components/EnergyChart';
import FreeBodyDiagram from '../components/FreeBodyDiagram';
import EquationDisplay from '../components/EquationDisplay';
import TimeGraphs from '../components/TimeGraphs';
import simulationClient from '../api/client';

const Home = () => {
  const [worldState, setWorldState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showFBD, setShowFBD] = useState(false);
  const [activeTab, setActiveTab] = useState('controls');
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const animationRef = useRef(null);

  // ... (keep all existing handler functions)
  const handleCreateSimulation = async (problemText) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationClient.createSimulation(problemText);
      
      if (response.success) {
        setWorldState(response.world_state);
        setScenarioDescription(response.scenario_description);
        setIsPlaying(false);
      } else {
        setError(response.error_message || 'Failed to create simulation');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = async (presetName, parameters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await simulationClient.createPreset(presetName, parameters);
      
      if (response.success) {
        setWorldState(response.world_state);
        setScenarioDescription(`Preset: ${presetName}`);
        setIsPlaying(false);
      } else {
        setError(response.error_message || 'Failed to create preset');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (objectId, parameter, value) => {
    try {
      const response = await simulationClient.updateParameter(objectId, parameter, value);
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateWorld = async (settings) => {
    try {
      const response = await simulationClient.updateWorld(settings);
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetCircularMotion = async (objectId, center, radius, angularVelocity, initialAngle, enabled) => {
    try {
      const response = await simulationClient.setCircularMotion(
        objectId, center, radius, angularVelocity, initialAngle, enabled
      );
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetCollision = async (objectId, collisionType, restitution) => {
    try {
      const response = await simulationClient.setCollisionSettings(objectId, collisionType, restitution);
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddObject = async (objectData) => {
    try {
      const response = await simulationClient.addObject(objectData);
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    try {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const response = await simulationClient.reset();
      if (response.success) {
        setWorldState(response.world_state);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStart = async () => {
    try {
      await simulationClient.start();
      setIsPlaying(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStop = async () => {
    try {
      await simulationClient.stop();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStepOnce = async () => {
    try {
      const newState = await simulationClient.stepOnce();
      setWorldState(newState);
    } catch (err) {
      setError(err.message);
    }
  };

  // Animation loop
  useEffect(() => {
    const animate = async () => {
      if (isPlaying) {
        try {
          const newState = await simulationClient.step(1);
          setWorldState(newState);
          animationRef.current = requestAnimationFrame(animate);
        } catch (err) {
          setError(err.message);
          setIsPlaying(false);
        }
      }
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`home theme-${theme}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🚀 Physics Simulator</h1>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-container">
        {/* Left Sidebar - Input */}
        <aside className="left-sidebar">
          <ProblemInput
            onSubmit={handleCreateSimulation}
            isLoading={isLoading}
          />

          <PresetSelector
            onSelectPreset={handlePresetSelect}
            isLoading={isLoading}
          />

          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {scenarioDescription && (
            <div className="scenario-info">
              <h3>📋 Current Scenario</h3>
              <p>{scenarioDescription}</p>
            </div>
          )}
        </aside>

        {/* Center - Simulation View */}
        <main className="center-content">
          <div className="simulation-section">
            {worldState ? (
              <>
                <div className="canvas-toolbar">
                  <h3>Simulation View</h3>
                  <div className="toolbar-controls">
                    <label>
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                      />
                      Grid
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showVectors}
                        onChange={(e) => setShowVectors(e.target.checked)}
                      />
                      Vectors
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={showFBD}
                        onChange={(e) => setShowFBD(e.target.checked)}
                      />
                      Free Body Diagram
                    </label>
                    <button 
                      className="add-btn"
                      onClick={() => setShowAddModal(true)}
                      disabled={isPlaying}
                    >
                      ➕ Add Object
                    </button>
                  </div>
                </div>

                <div className="canvas-and-fbd">
                  <SimulationCanvas 
                    worldState={worldState} 
                    showGrid={showGrid}
                    showVectors={showVectors}
                  />
                  {showFBD && (
                    <FreeBodyDiagram worldState={worldState} />
                  )}
                </div>

                {/* Dynamic Equation Display */}
                <EquationDisplay worldState={worldState} />

                {/* Graphs Section */}
                <div className="graphs-section">
                  <TimeGraphs worldState={worldState} />
                  <EnergyChart energyHistory={worldState?.energy_history} />
                </div>
              </>
            ) : (
              <div className="placeholder">
                <div className="placeholder-content">
                  <h2>👋 Welcome to Physics Simulator</h2>
                  <p>Get started by:</p>
                  <ul>
                    <li>🖊️ Typing a physics problem</li>
                    <li>⚡ Selecting a preset scenario</li>
                    <li>📚 Learning from examples</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Controls */}
        <aside className="right-sidebar">
          {worldState && (
            <>
              <div className="control-tabs">
                <button
                  className={activeTab === 'controls' ? 'active' : ''}
                  onClick={() => setActiveTab('controls')}
                >
                  🎮 Controls
                </button>
                <button
                  className={activeTab === 'advanced' ? 'active' : ''}
                  onClick={() => setActiveTab('advanced')}
                >
                  ⚙️ Advanced
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'controls' && (
                  <ParameterControls
                    worldState={worldState}
                    onUpdate={handleUpdate}
                    onReset={handleReset}
                    onStart={handleStart}
                    onStop={handleStop}
                    onStepOnce={handleStepOnce}
                    isPlaying={isPlaying}
                  />
                )}

                {activeTab === 'advanced' && (
                  <AdvancedControls
                    worldState={worldState}
                    onUpdate={handleUpdate}
                    onUpdateWorld={handleUpdateWorld}
                    onSetCircularMotion={handleSetCircularMotion}
                    onSetCollision={handleSetCollision}
                  />
                )}
              </div>

              {/* System Stats */}
              <div className="system-stats">
                <h4>📊 System Statistics</h4>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-label">Objects:</span>
                    <span className="stat-value">{worldState.objects.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">{worldState.time.toFixed(2)} s</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Energy:</span>
                    <span className="stat-value">{worldState.total_mechanical_energy.toFixed(2)} J</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Momentum:</span>
                    <span className="stat-value">{worldState.total_momentum_magnitude.toFixed(2)} kg⋅m/s</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Bottom Section - Parameter Guide */}
      <footer className="bottom-section">
        <ParameterExplanation />
      </footer>

      <style jsx>{`
        :root[data-theme="light"] {
          --bg-primary: #f5f7fa;
          --bg-secondary: #ffffff;
          --bg-tertiary: #e8eef3;
          --text-primary: #2c3e50;
          --text-secondary: #7f8c8d;
          --border-color: #dfe6e9;
          --accent-color: #3498db;
          --accent-hover: #2980b9;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        :root[data-theme="dark"] {
          --bg-primary: #1a1a2e;
          --bg-secondary: #16213e;
          --bg-tertiary: #0f3460;
          --text-primary: #e8e9eb;
          --text-secondary: #a8adb5;
          --border-color: #2d3748;
          --accent-color: #4a90e2;
          --accent-hover: #357abd;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          --gradient: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
        }

        .home {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        /* Header */
        .header {
          background: var(--gradient);
          padding: 16px 24px;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h1 {
          color: white;
          font-size: 24px;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .theme-toggle {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        /* Main Container */
        .main-container {
          max-width: 1800px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 320px 1fr 340px;
          gap: 24px;
          flex: 1;
        }

        /* Sidebars */
        .left-sidebar,
        .right-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: calc(100vh - 140px);
          overflow-y: auto;
        }

        /* Center Content */
        .center-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .simulation-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .canvas-toolbar {
          background: var(--bg-secondary);
          padding: 16px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow);
        }

        .canvas-toolbar h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 16px;
        }

        .toolbar-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .toolbar-controls label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .toolbar-controls input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .add-btn {
          padding: 8px 14px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover:not(:disabled) {
          background: #229954;
          transform: translateY(-1px);
        }

        .add-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .canvas-and-fbd {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
        }

        .graphs-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Error Message */
        .error-message {
          background: #e74c3c;
          color: white;
          padding: 14px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        }

        .error-message button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
        }

        /* Scenario Info */
        .scenario-info {
          background: var(--bg-secondary);
          padding: 16px;
          border-radius: 8px;
          box-shadow: var(--shadow);
        }

        .scenario-info h3 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
          font-size: 14px;
        }

        .scenario-info p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
        }

        /* Placeholder */
        .placeholder {
          background: var(--bg-secondary);
          padding: 60px 40px;
          border-radius: 8px;
          box-shadow: var(--shadow);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-content {
          text-align: center;
          max-width: 500px;
        }

        .placeholder-content h2 {
          color: var(--text-primary);
          margin-bottom: 16px;
          font-size: 28px;
        }

        .placeholder-content p {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .placeholder-content ul {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }

        .placeholder-content li {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        /* Control Tabs */
        .control-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .control-tabs button {
          padding: 10px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-tabs button:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .control-tabs button.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        /* System Stats */
        .system-stats {
          background: var(--bg-secondary);
          padding: 16px;
          border-radius: 8px;
          box-shadow: var(--shadow);
        }

        .system-stats h4 {
          margin: 0 0 14px 0;
          color: var(--text-primary);
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
          background: var(--bg-tertiary);
          border-radius: 6px;
        }

        .stat-label {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: bold;
          color: var(--text-primary);
        }

        /* Bottom Section */
        .bottom-section {
          max-width: 1800px;
          margin: 0 auto;
          padding: 0 24px 24px;
        }

        /* Scrollbar */
        .left-sidebar::-webkit-scrollbar,
        .right-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .left-sidebar::-webkit-scrollbar-track,
        .right-sidebar::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
          border-radius: 3px;
        }

        .left-sidebar::-webkit-scrollbar-thumb,
        .right-sidebar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        /* Responsive */
        @media (max-width: 1600px) {
          .main-container {
            grid-template-columns: 300px 1fr 320px;
          }
        }

        @media (max-width: 1400px) {
          .main-container {
            grid-template-columns: 1fr;
          }

          .graphs-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
