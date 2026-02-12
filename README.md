\# Natural Language to Live Physics Simulator



An AI-powered physics simulation platform with comprehensive visualization, real-time controls, and educational features.



\*\*Sections:\*\* Overview · Features · Architecture · Installation · Quick Start · Usage · API · Physics Concepts · Testing · Contributing



---



\## Overview



Physics Simulator is a physics education and visualization platform that combines:



\* AI-powered natural language input

\* Real-time physics simulation engine

\* Advanced motion and energy visualization

\* Interactive parameter controls

\* Educational equation and concept display



It is designed for:



\* Students learning mechanics

\* Educators demonstrating physical phenomena

\* Developers experimenting with physics engines

\* Researchers prototyping classical mechanics scenarios



This is the first official release of the project.



---



\## Features



\### Core Physics Engine



\* Newton’s Laws of Motion

\* Force-based motion (gravity, drag, friction, springs)

\* Momentum conservation

\* Energy conservation (kinetic ↔ potential)

\* Elastic and inelastic collisions (restitution 0.0–1.0)

\* Circular motion with adjustable radius and angular velocity

\* Projectile motion

\* Oscillations (spring-mass and pendulum)

\* Multi-object interactions (50+ objects supported)



---



\### Visualization System



\* Free Body Diagrams (force vectors with magnitudes)

\* Dynamic equation display with substituted values

\* Position vs Time graph

\* Velocity vs Time graph

\* Acceleration vs Time graph

\* Energy chart (KE, PE, total energy)

\* Trajectory paths

\* Velocity vectors

\* Circular motion path visualization



---



\### Interactive Controls



\*\*Basic Controls\*\*



\* Mass adjustment (0.1–20 kg)

\* Velocity magnitude and angle

\* Elasticity slider (0.0–1.0)

\* Position setting

\* Gravity toggle

\* Shape selection

\* Color customization



\*\*Advanced Controls\*\*



\* Circular motion radius

\* Angular velocity

\* Drag, friction, spring constants

\* Collision configuration

\* Environment settings

\* Time step control



---



\### User Interface



\* 3-column layout (Input | Simulation | Controls)

\* Unified control panel

\* Collapsible parameter guide

\* Dark and Light theme support

\* Step-by-step simulation mode

\* Play / Pause / Reset / Frame stepping

\* Preset scenarios

\* Zoom and pan canvas



---



\### AI-Powered Natural Language Input



Example:



Input:



```

A 2 kg ball is thrown at 30 degrees with 15 m/s

```



The system automatically configures:



\* Mass

\* Initial velocity components

\* Gravity

\* Simulation type



Supported scenarios:



\* Projectile motion

\* Collisions (elastic/inelastic)

\* Circular motion

\* Oscillations

\* Multi-object systems



---



\## Architecture



```

physics-simulator/

├── backend/

│   ├── app/

│   │   ├── api/

│   │   ├── nlp/

│   │   ├── physics/

│   │   ├── services/

│   │   └── presets/

│   ├── requirements.txt

│   └── run.py

│

├── frontend/

│   ├── src/

│   │   ├── api/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── App.jsx

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

│

│

└── README.md

```



---



\## Installation



\### Prerequisites



\* Python 3.9+

\* Node.js 18+

\* Ollama (optional for local LLM) or any other LLM's API



---



\### Backend Setup



```bash

cd backend



python -m venv venv



\# Windows

venv\\Scripts\\activate



\# macOS/Linux

source venv/bin/activate



pip install -r requirements.txt



\# Optional: pull local LLM

ollama pull gpt-oss:20b (low hardware) or gpt-oss:120b (high hardware)

\# Optional: pull cloud LLM (ollama cloud)

ollama pull kimi-k2.5:cloud



python run.py

```



Backend runs at:



```

http://localhost:8000

```



---



\### Frontend Setup



```bash

cd frontend

npm install

npm run dev

```



Frontend runs at:



```

http://localhost:3000

```



---



\## Quick Start



1\. Start backend and frontend servers

2\. Open `http://localhost:3000`

3\. Choose a preset or enter a natural language problem

4\. Click Create Simulation

5\. Use play/pause/reset and adjust parameters live



---



\## Usage



\### Natural Language Example



```

A 2.5 kg projectile is launched at 35 degrees with 18 m/s

```



The system automatically:



\* Converts angle to velocity components

\* Sets gravity

\* Initializes projectile simulation



---



\### Manual Object Creation



1\. Click Add Object

2\. Set mass, position, velocity

3\. Choose shape and color

4\. Enable circular motion if needed

5\. Adjust parameters in real-time



---



\## API Endpoints



\### Create Simulation



```

POST /api/simulate

```



Request:



```json

{

&nbsp; "problem\_text": "A ball is thrown upward at 10 m/s"

}

```



---



\### Preset Scenario



```

POST /api/preset

```



---



\### Update Parameter



```

POST /api/update

```



---



\### Circular Motion



```

POST /api/circular-motion

```



---



\### Collision Settings



```

POST /api/collision-settings

```



---



\### Simulation Control



```

POST /api/start

POST /api/stop

POST /api/reset

POST /api/step-once

POST /api/step

```



---



\## Physics Concepts Covered



\* Newton’s First Law (Inertia)

\* Newton’s Second Law (F = ma)

\* Newton’s Third Law (Action–Reaction)

\* Conservation of Momentum

\* Conservation of Energy

\* Projectile Motion

\* Circular Motion

\* Simple Harmonic Motion

\* Work–Energy Theorem

\* Kinematics Equations



Detailed explanations available in `docs/PHYSICS.md`.



---



\## Testing



\### Backend



```bash

cd backend

pytest tests/

```



\### Frontend



```bash

cd frontend

npm test

```



Manual testing includes:



\* Circular motion validation

\* Elasticity slider behavior

\* Theme switching

\* Graph rendering

\* Multi-object collision scenarios



---



\## Contributing



1\. Fork the repository

2\. Create a feature branch

3\. Implement changes

4\. Add tests

5\. Submit a pull request



\### Code Style



\* Python: PEP 8

\* JavaScript: ESLint

\* Use type hints and clear comments

\* Follow modular design



---



\## Technologies Used



\* FastAPI

\* React

\* Ollama (LLM support)

\* HTML5 Canvas

\* NumPy



---



Built for physics education and interactive learning.



