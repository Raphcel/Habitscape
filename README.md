# Habitscape Full Stack

Habitscape is a capstone MVP for health and nutrition tracking. This folder contains the React frontend, Express backend, PostgreSQL schema, Docker Compose setup, and Postman collection for local API testing.

## Architecture

```mermaid
flowchart LR
  FE[React / Vite Frontend] --> BE[Express API]
  BE --> DB[(PostgreSQL)]
  BE --> FoodML[FastAPI Food Detection ML]
  BE -. planned .-> BMIML[FastAPI BMI ML]
```

Main services:

| Service | Stack | Local URL |
|---|---|---|
| Frontend | React + Vite | http://localhost:5173 |
| Backend | Express.js | http://localhost:5000 |
| PostgreSQL | Postgres 16 | localhost:5432 |
| Food ML | FastAPI + Ultralytics/YOLO | http://localhost:8000 |
| BMI ML | FastAPI + TensorFlow/Keras | http://localhost:8001 |

## Snap Food Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant ML
    participant DB

    User->>Frontend: Upload meal photo
    Frontend->>Backend: POST /api/v1/food-logs/analyze (image)
    Backend->>ML: POST /api/v1/analyze (file)
    ML-->>Backend: Detection, nutrition, AI summary
    Backend-->>Frontend: Unsaved draft result
    User->>Frontend: Review or edit values
    User->>Frontend: Confirm
    Frontend->>Backend: POST /api/v1/food-logs
    Backend->>DB: Insert confirmed food log
```

Images are not persisted by the backend in the current MVP flow. The frontend keeps a local preview while the user reviews the result. Confirmed food logs store nutrition data and may have `image_url = null`.

## Prerequisites

- Docker Desktop with Docker Compose v2.
- The full workspace layout must stay as-is:

```text
Capstone/
├── Full Stack/
│   ├── backend/
│   ├── frontend/
│   └── docker-compose.yml
└── ML/
    └── Habitscape/
        ├── food-detection/
        └── bmi-classification/
```

## Required ML Model Files

The Docker setup can build containers without the model files, but real ML prediction endpoints will fail until the files exist.

Food detection expects:

```text
ML/Habitscape/food-detection/weights/best.pt
```

BMI classification expects:

```text
ML/Habitscape/bmi-classification/models/bmi_model_new.keras
ML/Habitscape/bmi-classification/models/scaler_bmi_new.pkl
```

If these files are missing, use manual backend routes and health checks first. Treat ML inference as blocked until the artifacts are added.

## Run Everything With Docker

From this `Full Stack` folder:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Express health: http://localhost:5000/api/v1/health
- Express Swagger: http://localhost:5000/docs
- Food ML Swagger: http://localhost:8000/docs
- BMI ML Swagger: http://localhost:8001/docs

Stop services:

```bash
docker compose down
```

Stop and delete database/uploads volumes:

```bash
docker compose down -v
```

## Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f food-ml
docker compose logs -f bmi-ml
docker compose logs -f postgres
```

## Environment Defaults

The local Docker Compose file sets development defaults automatically.

| Variable | Docker value |
|---|---|
| `DATABASE_URL` | `postgres://habitscape:habitscape@postgres:5432/habitscape` |
| `JWT_SECRET` | `local-dev-secret-change-me` |
| `FASTAPI_BASE_URL` | `http://food-ml:8000` |
| `CLIENT_ORIGIN` | `http://localhost:5173` |
| `VITE_API_URL` | `http://localhost:5000/api/v1` |

For DeepSeek/SumoPod-backed ML calls, set these before running Compose if you have real credentials.

PowerShell:

```powershell
$env:SUMOPOD_API_KEY="your_key_here"
docker compose up --build
```

On macOS/Linux:

```bash
export SUMOPOD_API_KEY="your_key_here"
docker compose up --build
```

If no key is set, Compose uses a placeholder so the containers can start, but AI-backed endpoints can still fail.

## Database Initialization

The backend service runs this on startup:

```bash
npm run db:init
```

That applies:

```text
backend/src/db/schema.sql
```

The database data is stored in the Docker volume `postgres-data`.

## Health Checks

Use these after `docker compose up --build`:

```bash
curl http://localhost:5000/api/v1/health
curl http://localhost:8000/health
curl http://localhost:8001/api/v1/health
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/api/v1/health
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8001/api/v1/health
```

## API Testing With Postman

Import these two files into Postman:

```text
postman/Habitscape.postman_collection.json
postman/Habitscape.local.postman_environment.json
```

Select the `Habitscape Local` environment before running requests.

Recommended order:

1. `00 - Express Health / Health Check`
2. `01 - Auth / Register - New Test User`
3. `01 - Auth / Get Current User`
4. `02 - Food Logs / Create Manual Food Log`
5. `03 - Weight / Add Weight Log`
6. Direct ML health checks

Image upload requests require selecting a real local image file in Postman.

## Known Integration Issue

The current Express-to-Food-ML contract appears to be out of sync.

Current Express behavior:

```text
POST /predict/food
body: { log_id, image_url }
```

Current Food ML FastAPI behavior:

```text
POST /api/v1/analyze
multipart/form-data field: file
```

Because of that, Docker may start every service successfully while `POST /api/v1/food-logs/analyze` through Express still fails. Fixing this contract is separate from the Docker setup.

Recommended fix direction:

- Either update Express to forward multipart image data to `POST /api/v1/analyze`.
- Or add a compatible FastAPI endpoint that accepts `{ log_id, image_url }`.
- Lock the contract with OpenAPI docs or integration tests.

## Troubleshooting

### Backend cannot connect to PostgreSQL

Check the database service:

```bash
docker compose logs -f postgres
```

Then restart backend:

```bash
docker compose restart backend
```

### Port already in use

Stop any local process using ports `5173`, `5000`, `5432`, `8000`, or `8001`, or change the host port in `docker-compose.yml`.

### Food ML image prediction fails

Confirm the model exists:

```text
ML/Habitscape/food-detection/weights/best.pt
```

Then check logs:

```bash
docker compose logs -f food-ml
```

### BMI prediction fails

Confirm both files exist:

```text
ML/Habitscape/bmi-classification/models/bmi_model_new.keras
ML/Habitscape/bmi-classification/models/scaler_bmi_new.pkl
```

Then check logs:

```bash
docker compose logs -f bmi-ml
```

### Frontend cannot reach backend

The Docker frontend uses:

```text
VITE_API_URL=http://localhost:5000/api/v1
```

Check that the backend is exposed on the host:

```bash
curl http://localhost:5000/api/v1/health
```

## Manual Run Without Docker

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run db:init
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Food ML:

```bash
cd ../ML/Habitscape/food-detection
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

BMI ML:

```bash
cd ../ML/Habitscape/bmi-classification
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
