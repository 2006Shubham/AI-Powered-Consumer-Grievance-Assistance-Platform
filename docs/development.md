# Development Guide

## 1. Purpose

This document defines how developers and AI coding agents should work on the project.

It covers:

- repository organization,

- local development,

- Git workflow,

- coding conventions,

- environment configuration,

- testing,

- and collaboration.

---

# 2. Repository Structure

The repository uses the following top-level structure:

```text
project-root/
│
├── frontend/                 # React + Vite application
├── backend/                  # FastAPI application
├── docs/                     # Project documentation
│
├── .gitignore
├── README.md
└── docker-compose.yml        # Added when required
```

These three primary directories should remain stable.

AI coding agents must NOT reorganize the repository into structures such as `apps/`, `packages/`, or separate repositories unless explicitly approved.

---

# 3. Frontend Structure

The frontend uses:

```text
React
+
TypeScript
+
Vite
+
Tailwind CSS
```

Recommended structure:

```text
frontend/
│
├── src/
│   ├── components/           # Shared UI components
│   │
│   ├── features/             # Feature-specific code
│   │   ├── auth/
│   │   ├── cases/
│   │   ├── evidence/
│   │   ├── guidance/
│   │   └── complaints/
│   │
│   ├── pages/                # Application pages
│   ├── api/                  # Backend API communication
│   ├── hooks/                # Shared React hooks
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Small generic utilities
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── package.json
├── vite.config.ts
└── .env.example
```

Prefer feature-oriented organization.

Do not place the entire application inside `components/`.

---

# 4. Backend Structure

The backend uses:

```text
Python
+
FastAPI
```

Recommended structure:

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── auth/
│   ├── users/
│   ├── cases/
│   ├── evidence/
│   ├── complaints/
│   ├── timeline/
│   │
│   ├── ai/
│   │   ├── providers/
│   │   ├── prompts/
│   │   └── schemas/
│   │
│   ├── rag/
│   │   ├── ingestion/
│   │   ├── embeddings/
│   │   ├── retrieval/
│   │   └── index/
│   │
│   ├── documents/
│   ├── repositories/
│   │
│   ├── core/                 # Config, database, security
│   └── shared/
│
├── tests/
├── requirements.txt
└── .env.example
```

The exact internal structure may evolve as implementation progresses.

Avoid large generic files such as:

```text
services.py
helpers.py
utils.py
```

when the functionality clearly belongs to a domain module.

---

# 5. Documentation Structure

All project documentation lives inside:

```text
docs/
```

Current structure:

```text
docs/
│
├── PRD.md
├── architecture.md
├── techstack.md
├── data_model.md
├── ai_system.md
├── api_contract.md
├── security.md
├── tests.md
├── development.md
├── decision_log.md
└── knowledge_base.md
```

These documents act as the source of truth for developers and AI coding agents.

---

# 6. Documentation Responsibilities

```text
PRD.md
→ What are we building and why?

architecture.md
→ How is the system structured?

techstack.md
→ Which technologies are approved?

data_model.md
→ How is data represented?

ai_system.md
→ How do Groq, AI and RAG work?

api_contract.md
→ How do frontend and backend communicate?

security.md
→ What security rules must be followed?

tests.md
→ How do we verify correctness?

development.md
→ How do developers work on the project?

decision_log.md
→ Why were important decisions made?

knowledge_base.md
→ What information is allowed into RAG?
```

Avoid duplicating the same information across multiple documents.

---

# 7. Local Requirements

Developers require:

```text
Git
Node.js
Python 3.12+
MongoDB
```

Docker may be introduced for consistent local infrastructure.

All required development tools must have free options.

---

# 8. Frontend Setup

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

---

# 9. Backend Setup

Navigate to:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the environment and install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --reload
```

Interactive API documentation is available through FastAPI's `/docs` endpoint during development.

---

# 10. Environment Configuration

Frontend configuration belongs in:

```text
frontend/.env
```

Backend configuration belongs in:

```text
backend/.env
```

Example backend configuration:

```text
MONGODB_URI=
MONGODB_DATABASE=

GROQ_API_KEY=
GROQ_MODEL=

JWT_SECRET=

EMBEDDING_MODEL=
FAISS_INDEX_PATH=

STORAGE_PATH=
```

Provide:

```text
frontend/.env.example
backend/.env.example
```

Real `.env` files must never be committed.

---

# 11. Secret Ownership

Backend-only secrets include:

```text
GROQ_API_KEY
MONGODB_URI
JWT_SECRET
```

They must NEVER appear inside:

```text
frontend/
```

The frontend should contain only configuration safe for browser exposure.

---

# 12. Development Workflow

Use:

```text
main
 │
 ├── feature/case-management
 ├── feature/groq-integration
 ├── feature/rag
 ├── feature/evidence-processing
 ├── feature/dashboard
 └── fix/<issue>
```

Normal workflow:

```text
Pull latest main
       ↓
Create feature branch
       ↓
Implement
       ↓
Test locally
       ↓
Commit
       ↓
Push
       ↓
Pull Request
       ↓
Review + CI
       ↓
Merge
```

Do not develop major features directly on `main`.

---

# 13. Commit Convention

Use clear commits:

```text
feat: add case creation endpoint

feat: implement grievance analysis

feat: add evidence upload UI

fix: enforce case ownership

test: add authorization tests

docs: update AI architecture

refactor: extract Groq provider
```

Avoid meaningless messages such as:

```text
update
changes
final
final fix
working
```

---

# 14. Pull Requests

Each pull request should answer:

1. What changed?

2. Why was it required?

3. How was it tested?

4. Did it change any documented contract?

Keep PRs focused on one logical change whenever possible.

---

# 15. Team Ownership

Suggested primary ownership:

| Member   | Area                          |
| -------- | ----------------------------- |
| Member 1 | Frontend & UX                 |
| Member 2 | Backend & MongoDB             |
| Member 3 | Groq & AI                     |
| Member 4 | RAG & Knowledge Base          |
| Member 5 | Evidence, OCR & Documents     |
| Member 6 | Integration, Testing & DevOps |

Ownership means primary responsibility.

It does not prevent other members from contributing to that area.

---

# 16. Backend Layering

Backend features should generally follow:

```text
Route
  ↓
Service
  ↓
Repository
  ↓
MongoDB
```

AI operations:

```text
Service
  ↓
AI Service
  ↓
Groq Provider
```

RAG:

```text
Service
  ↓
RAG Service
  ↓
Retriever
  ↓
FAISS + MongoDB
```

Avoid putting database queries, Groq calls and business logic directly inside route handlers.

---

# 17. Frontend Layering

Frontend communication should follow:

```text
Page / Component
       ↓
Feature Logic / Hook
       ↓
API Client
       ↓
FastAPI
```

Do not scatter direct `fetch()` calls throughout React components.

Centralize API communication under:

```text
frontend/src/api/
```

---

# 18. Shared API Contract

The frontend and backend must follow:

```text
docs/api_contract.md
```

If the backend changes an API response that affects the frontend:

```text
Update API contract
        ↓
Update Backend
        ↓
Update Frontend
        ↓
Update Tests
```

Do not silently change API structures.

---

# 19. Database Changes

Database structures must follow:

```text
docs/data_model.md
```

When changing a schema:

1. Check existing data impact.

2. Update Pydantic models.

3. Update repositories.

4. Update API schemas if required.

5. Update tests.

6. Update `data_model.md`.

---

# 20. AI Development

AI functionality must follow:

```text
docs/ai_system.md
```

When changing prompts:

```text
Modify Prompt
     ↓
Run AI Evaluation Cases
     ↓
Compare Results
     ↓
Approve Change
```

Do not judge prompt quality from a single example.

---

# 21. Adding Dependencies

Before adding a package, verify:

```text
Is it necessary?
      ↓
Is it free?
      ↓
Is it maintained?
      ↓
Can the existing stack solve this?
```

Do not introduce paid services or dependencies requiring paid infrastructure.

Major technology additions must be recorded in:

```text
docs/decision_log.md
```

---

# 22. Testing Before Push

Backend:

```bash
pytest
```

Frontend:

```bash
npm run test
npm run build
```

Also run configured linters.

A feature should not be considered complete when its relevant tests fail.

---

# 23. Merge Requirements

Do not merge when:

```text
Tests fail
Lint fails
Frontend build fails
Critical security checks fail
```

Bug fixes should preferably include regression tests.

---

# 24. Documentation Updates

Code and documentation should evolve together.

Examples:

```text
New API
→ api_contract.md

New collection
→ data_model.md

New AI capability
→ ai_system.md

New dependency
→ techstack.md

New security rule
→ security.md

Important architectural decision
→ decision_log.md
```

A feature is not fully complete when its documented contract has become incorrect.

---

# 25. Rules for AI Coding Agents

Before implementing a task, AI coding agents should read the relevant documents under `docs/`.

AI agents must:

1. Preserve the `frontend/`, `backend/`, `docs/` top-level structure.

2. Follow `techstack.md`.

3. Follow existing API contracts.

4. Follow the documented data model.

5. Respect security rules.

6. Add tests for important behavior.

7. Avoid unnecessary dependencies.

8. Never introduce paid services.

9. Never hardcode secrets.

10. Never reorganize major architecture without approval.

11. Update documentation when contracts change.

12. Prefer existing project patterns over inventing new ones.

If requirements conflict or an architectural change is necessary, document the decision rather than silently changing the system.

---

# 26. Development Principle

The repository should remain understandable from its top level:

```text
frontend/
    → What users interact with

backend/
    → Application, AI and data logic

docs/
    → What the system is supposed to do
```

Prefer simple, explicit organization over unnecessary abstraction.

The goal is for any team member—or AI coding agent—to quickly understand where a change belongs and how it affects the rest of the system.
