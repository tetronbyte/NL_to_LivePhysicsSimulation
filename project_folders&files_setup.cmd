:: Create root-level folders
mkdir backend
mkdir frontend

:: ================= BACKEND =================
mkdir backend\app
mkdir backend\app\api
mkdir backend\app\nlp
mkdir backend\app\physics
mkdir backend\app\services
mkdir backend\app\models

:: Backend files
type nul > backend\app\main.py
type nul > backend\app\api\routes.py
type nul > backend\app\api\websocket.py

type nul > backend\app\nlp\parser.py
type nul > backend\app\nlp\prompt_templates.py
type nul > backend\app\nlp\schema.py

type nul > backend\app\physics\vector.py
type nul > backend\app\physics\object.py
type nul > backend\app\physics\forces.py
type nul > backend\app\physics\world.py
type nul > backend\app\physics\simulator.py
type nul > backend\app\physics\equations.py

type nul > backend\app\services\simulation_service.py
type nul > backend\app\models\pydantic_models.py

type nul > backend\requirements.txt
type nul > backend\run.py

:: ================= FRONTEND =================
mkdir frontend\src
mkdir frontend\src\components
mkdir frontend\src\pages
mkdir frontend\src\api

:: Frontend files
type nul > frontend\src\components\SimulationCanvas.jsx
type nul > frontend\src\components\ParameterControls.jsx
type nul > frontend\src\components\ProblemInput.jsx

type nul > frontend\src\pages\Home.jsx
type nul > frontend\src\api\client.js

type nul > frontend\package.json

:: Root README
type nul > README.md
