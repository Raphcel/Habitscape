# Habitscape Full Stack Architecture

This folder contains the Habitscape web application:

- `frontend`: React + Vite user interface.
- `backend`: Express.js REST API with PostgreSQL persistence.
- `backend_requirements.md`: backend delivery requirements and acceptance criteria.
- `docker-compose.yml`: development Docker setup for PostgreSQL + Express backend.

The ML services live outside this folder in `../ML/Habitscape`.

## Architecture

```mermaid
graph TD
    FE["React + Vite frontend"]
    BE["Express API"]
    DB[("PostgreSQL")]
    ML["FastAPI food detection service"]

    FE -->|"REST /api/v1"| BE
    BE -->|"SQL"| DB
    BE -->|"multipart image /api/v1/analyze"| ML
```

The frontend never calls the ML service directly. It sends authenticated requests to the Express backend, and the backend forwards food images to the FastAPI ML service.

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

## Local Development

Start the ML food detection service first:

```bash
cd "../ML/Habitscape/food-detection"
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Before running image analysis, place the YOLO model at `../ML/Habitscape/food-detection/weights/best.pt` and configure `SUMOPOD_API_KEY` in the ML service `.env`.

Start PostgreSQL and the backend with Docker:

```bash
cd "Full Stack"
docker compose up --build
```

The compose setup starts PostgreSQL, initializes the database schema, then starts the backend on `http://localhost:5000`.

Start the frontend separately:

```bash
cd "Full Stack/frontend"
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173`  
Backend health check: `http://localhost:5000/api/v1/health`  
Backend Swagger docs: `http://localhost:5000/docs`  
ML health check: `http://localhost:8000/health`

## Backend Docker Configuration

`docker-compose.yml` runs:

- `postgres`: PostgreSQL 16 with a persistent Docker volume.
- `backend`: Express API built from `backend/Dockerfile`.

PostgreSQL is kept on the internal Compose network to avoid conflicts with a local PostgreSQL install. To open `psql` inside the container:

```bash
docker compose exec postgres psql -U habitscape -d habitscape
```

The backend container uses:

```dotenv
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://habitscape:habitscape@postgres:5432/habitscape
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=24h
FASTAPI_BASE_URL=http://host.docker.internal:8000
CLIENT_ORIGIN=http://localhost:5173
```

`FASTAPI_BASE_URL` points to `host.docker.internal` so the container can reach the ML service running on the host machine at port `8000`.

For production, replace all development secrets, restrict CORS, and use managed PostgreSQL plus production storage if image persistence is required later.

## API Flow Summary

- `POST /api/v1/food-logs/analyze`: authenticated image analysis only; returns an unsaved draft.
- `POST /api/v1/food-logs`: authenticated confirmed save; inserts the final food log.
- `GET /api/v1/food-logs`: authenticated food history.
- `PATCH /api/v1/food-logs/:id`: authenticated update for existing logs.
- `DELETE /api/v1/food-logs/:id`: authenticated delete for existing logs.

The ML service endpoint used by the backend is `POST /api/v1/analyze` from `ML/Habitscape/food-detection`.
