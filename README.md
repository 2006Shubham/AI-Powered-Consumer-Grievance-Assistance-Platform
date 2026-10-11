# AI-Powered Consumer Grievance Assistance Platform

An AI-assisted platform that helps consumers turn an unstructured complaint into an organized grievance case. Users can describe a problem, receive AI-assisted analysis and guidance, upload evidence, generate a formal complaint, and track case activity.

The platform is designed to assist with grievance preparation. It does not replace an official consumer forum, grievance portal, lawyer, or other authoritative legal service.

## Product flow

```text
Create account
    -> Create a case
    -> Describe the problem
    -> Analyze the case with AI
    -> Answer follow-up questions
    -> Upload and process evidence
    -> Retrieve relevant guidance
    -> Generate and edit a complaint
    -> Export the complaint
    -> Track the case timeline
```

## Features

- Email/password authentication with JWT tokens and bcrypt password hashing.
- Case creation, listing, retrieval, ownership checks, and status updates.
- AI case analysis and structured follow-up questions using Groq.
- AI chat for case-specific assistance.
- Retrieval-augmented guidance using a curated consumer-rights knowledge base.
- Evidence upload, local file storage, download, deletion, and processing.
- OCR and evidence checklist support.
- Complaint company lookup, complaint generation, editing, and export.
- Case timeline events for creation and status changes.
- React dashboard and case-management interface.
- Local fallbacks for evidence storage, embeddings, and vector search during development.

## Architecture

The project uses a modular monolith backend and a separate frontend:

```text
React + TypeScript + Vite
            |
          REST
            |
FastAPI modular backend
  |       |       |       |
Auth    Cases    AI    Evidence
            |
         MongoDB
            |
     Groq API (AI generation)
```

### Repository layout

```text
.
├── backend/                  # FastAPI application
│   ├── ai/                   # Groq, RAG, prompts, and AI services
│   ├── auth/                 # Signup, login, JWT authentication
│   ├── cases/                # Case models, repository, and routes
│   ├── complaints/           # Complaint generation and export
│   ├── documents/            # OCR and evidence intelligence
│   ├── evidence/             # Upload and evidence management
│   ├── timeline/             # Case timeline routes
│   └── shared/               # Configuration and database access
├── frontend/                 # React/Vite application
│   └── src/
├── tests/                    # Backend unit and integration tests
├── docs/                     # Product, architecture, API, and security docs
├── docker-compose.yml        # Backend, frontend, and MongoDB services
└── .env.example              # Environment variable template
```

## Requirements

For local development:

- Python 3.12 or compatible Python 3.11+ installation.
- Node.js and npm.
- MongoDB running locally on port `27017`.
- A Groq API key for AI features.

Docker Compose is also provided for environments where Docker is installed.

## Configuration

Copy the example environment file to `.env`:

```powershell
Copy-Item .env.example .env
```

Set at least these values:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=grievance_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=gsk_your_actual_key
GROQ_MODEL=openai/gpt-oss-20b
STORAGE_PATH=storage
FAISS_INDEX_PATH=storage/faiss_index.bin
```

The following integrations are optional for local development and may remain empty:

```env
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_URL_ENDPOINT=
QDRANT_URL=
QDRANT_API_KEY=
```

When ImageKit is not configured, evidence files are stored under `storage/`. When Qdrant is not configured, the application uses its local fallback vector store.

Never commit `.env`, API keys, database credentials, or uploaded files.

## Windows local setup

Run these commands from the repository root:

```powershell
cd "C:\path\to\AI-Powered-Consumer-Grievance-Assistance-Platform"
```

### 1. Install backend dependencies

```powershell
& ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
```

If you are using a system Python instead of `.venv`, replace the executable path with your Python interpreter.

### 2. Start the backend

Keep this terminal open:

```powershell
$env:PYTHONPATH = (Get-Location).Path

& ".venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

If the backend is already running, do not start a second copy on port `8000`.

### 3. Install and start the frontend

Open a second PowerShell terminal:

```powershell
cd "C:\path\to\AI-Powered-Consumer-Grievance-Assistance-Platform\frontend"
npm install
npm run dev -- --host 127.0.0.1
```

### 4. Open the application

- Frontend: <http://127.0.0.1:5173>
- Backend health: <http://127.0.0.1:8000/api/v1/health>
- Swagger API documentation: <http://127.0.0.1:8000/docs>

The health endpoint should return:

```json
{
  "status": "ok",
  "service": "consumer-grievance-api"
}
```

## API overview

All backend routes are prefixed with `/api/v1`.

### Authentication

```text
POST /auth/signup
POST /auth/login
GET  /auth/me
```

### Cases

```text
POST  /cases
GET   /cases
GET   /cases/{case_id}
PATCH /cases/{case_id}/status
```

### AI assistance

```text
POST /cases/{case_id}/ai/analyze
POST /cases/{case_id}/ai/follow-up
POST /cases/{case_id}/ai/answers
POST /cases/{case_id}/ai/chat
```

### Evidence and documents

```text
POST   /cases/{case_id}/evidence
GET    /cases/{case_id}/evidence
GET    /cases/{case_id}/evidence/{evidence_id}/download
DELETE /cases/{case_id}/evidence/{evidence_id}
POST   /cases/{case_id}/evidence/{evidence_id}/process
GET    /cases/{case_id}/evidence-checklist
```

### Guidance, complaints, and timeline

```text
POST /cases/{case_id}/ai/guidance
POST /cases/{case_id}/complaint/company-lookup
POST /cases/{case_id}/complaint/generate
GET  /cases/{case_id}/complaint
PUT  /cases/{case_id}/complaint
GET  /cases/{case_id}/complaint/export
GET  /cases/{case_id}/timeline
```

The interactive and authoritative endpoint definitions are available at `/docs` while the backend is running.

## Testing and builds

Run backend tests from the repository root:

```powershell
& ".venv\Scripts\python.exe" -m pytest tests -q
```

Run frontend checks from `frontend`:

```powershell
npm run build
npm test
```

The frontend build runs TypeScript checking before creating the Vite production bundle.

## Docker Compose

If Docker Desktop is installed and running:

```powershell
docker compose up --build
```

The Compose services use:

- Frontend: <http://localhost:3001>
- Backend: <http://localhost:8001>
- MongoDB: `localhost:27017`

The backend container overrides `MONGODB_URI` to use the Compose MongoDB service.

## Development notes

- Keep application endpoints under `/api/v1`.
- Case-specific resources must verify ownership in the backend.
- Do not put Groq credentials or privileged business logic in the frontend.
- Use local storage and local vector fallbacks for development unless cloud services are explicitly required.
- Treat AI output as assistance that must be reviewed by the user.
- Consult the documents in `docs/` for the product requirements, data model, API contract, security rules, and development conventions.

## License and status

This repository is an actively developed project. Review the repository's license and contribution policy before redistributing or deploying it.
