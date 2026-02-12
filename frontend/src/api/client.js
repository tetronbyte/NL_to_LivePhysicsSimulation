// frontend/src/api/client.js (COMPLETE UPDATE)
const API_BASE_URL = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws';

export class SimulationClient {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
  }

  async createSimulation(problemText) {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem_text: problemText }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create simulation');
    }

    return await response.json();
  }

  async createPreset(presetName, parameters = {}) {
    const response = await fetch(`${API_BASE_URL}/preset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preset_name: presetName, parameters }),
    });

    if (!response.ok) {
      throw new Error('Failed to create preset');
    }

    return await response.json();
  }

  async step(numSteps = 1) {
    const response = await fetch(`${API_BASE_URL}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ num_steps: numSteps }),
    });

    if (!response.ok) {
      throw new Error('Failed to step simulation');
    }

    return await response.json();
  }

  async stepOnce() {
    const response = await fetch(`${API_BASE_URL}/step-once`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to step simulation');
    }

    return await response.json();
  }

  async addObject(objectData) {
    const response = await fetch(`${API_BASE_URL}/add-object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objectData),
    });

    if (!response.ok) {
      throw new Error('Failed to add object');
    }

    return await response.json();
  }

  async updateParameter(objectId, parameter, value) {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_id: objectId,
        parameter: parameter,
        value: value,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update parameter');
    }

    return await response.json();
  }

  async updateWorld(settings) {
    const response = await fetch(`${API_BASE_URL}/update-world`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update world');
    }

    return await response.json();
  }

  async setCircularMotion(objectId, center, radius, angularVelocity, initialAngle = 0, enabled = true) {
    const response = await fetch(`${API_BASE_URL}/circular-motion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_id: objectId,
        center,
        radius,
        angular_velocity: angularVelocity,
        initial_angle: initialAngle,
        enabled,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to set circular motion');
    }

    return await response.json();
  }

  async setCircularMotionRadius(objectId, radius) {
    const response = await fetch(`${API_BASE_URL}/circular-motion-radius`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_id: objectId,
        radius: radius,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update radius');
    }

    return await response.json();
  }

  async setCollisionSettings(objectId, collisionType, restitution) {
    const response = await fetch(`${API_BASE_URL}/collision-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_id: objectId,
        collision_type: collisionType,
        restitution: restitution,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to set collision settings');
    }

    return await response.json();
  }

  async reset() {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to reset simulation');
    }

    return await response.json();
  }

  async start() {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to start simulation');
    }
    
    return await response.json();
  }

  async stop() {
    const response = await fetch(`${API_BASE_URL}/stop`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to stop simulation');
    }
    
    return await response.json();
  }

  async getState() {
    const response = await fetch(`${API_BASE_URL}/state`);
    if (!response.ok) {
      throw new Error('Failed to get state');
    }
    return await response.json();
  }

  // WebSocket support
  connectWebSocket(onMessage) {
    if (this.ws) {
      this.disconnectWebSocket();
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  sendWebSocketCommand(command) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(command));
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new SimulationClient();
