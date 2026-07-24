# Technology Stack

## 1. Purpose

This document defines the approved technology stack for the AI-Powered Consumer Grievance Assistance Platform.

Its purpose is to:

- maintain consistency across the project,

- prevent unnecessary dependencies,

- keep development cost at ₹0,

- provide clear technology choices for developers and AI coding agents,

- and ensure every major technology has a clear responsibility.

Architecture belongs in `architecture.md`.

Product requirements belong in `PRD.md`.

---

# 2. Core Technology Principles

All technology decisions must follow these rules.

### Rule 1 — Zero-Cost Development

The complete project must be developable without purchasing software, APIs, databases, or infrastructure.

Allowed:

- open-source software,

- local development tools,

- free developer APIs,

- free cloud tiers.

Avoid dependencies that require payment for basic development.

---

### Rule 2 — Prefer Open Technologies

When two technologies provide similar functionality, prefer the technology that:

- is open-source,

- can run locally,

- has strong documentation,

- has a large developer ecosystem,

- and does not create unnecessary vendor lock-in.

---

### Rule 3 — Keep the Stack Small

Do not introduce a new framework or infrastructure component when an existing component can reasonably solve the problem.

---

### Rule 4 — AI Agents Must Follow This Stack

AI coding agents must not introduce alternative databases, frameworks, cloud services, or paid APIs without documenting and approving the change in `decision_log.md`.

---

# 3. Approved Stack

| Layer               | Technology               |
| ------------------- | ------------------------ |
| Frontend            | React + TypeScript       |
| Build Tool          | Vite                     |
| Styling             | Tailwind CSS             |
| Backend             | FastAPI                  |
| Backend Language    | Python                   |
| API Style           | REST                     |
| Database            | MongoDB                  |
| AI Inference        | Groq API                 |
| AI SDK              | Groq Python SDK          |
| Data Validation     | Pydantic                 |
| Embeddings          | Sentence Transformers    |
| Vector Search       | Qdrant Vector Database   |
| OCR                 | Tesseract OCR            |
| PDF Processing      | PyMuPDF                  |
| Authentication      | JWT                      |
| Password Hashing    | Argon2 / bcrypt          |
| File Storage        | Local filesystem for MVP |
| Testing             | Pytest + Vitest          |
| API Testing         | Bruno / Postman          |
| Version Control     | Git + GitHub             |
| CI                  | GitHub Actions           |
| Containers          | Docker                   |
| Local Orchestration | Docker Compose           |

All core technologies must remain usable for free.

---

# 4. Frontend

## React

The frontend will use:

```text
React
+
TypeScript
+
Vite
```

React provides the component-based architecture required for the dashboard and case-management interface.

TypeScript is required instead of plain JavaScript.

This provides:

- better type safety,

- clearer API contracts,

- improved refactoring,

- fewer runtime errors,

- better collaboration between developers.

---

# 5. Vite

Vite will be used for frontend development and builds.

Responsibilities:

- development server,

- hot module replacement,

- production builds,

- environment configuration.

Do not introduce another frontend build system unless required.

---

# 6. Tailwind CSS

Tailwind CSS will be used for styling.

The UI should remain:

- minimal,

- modern,

- responsive,

- accessible,

- consistent.

Reusable components should be created instead of repeatedly copying large Tailwind class combinations.

---

# 7. UI Components

A free/open-source component system may be used where it improves development speed.

Recommended:

```text
shadcn/ui
```

Useful components include:

- dialogs,

- dropdowns,

- forms,

- tabs,

- cards,

- alerts,

- tooltips,

- command interfaces.

Components should be customized to match the application's design rather than leaving the project looking like an unmodified template.

---

# 8. Icons

Use:

```text
Lucide React
```

for interface icons.

Avoid mixing multiple icon libraries unnecessarily.

---

# 9. Frontend Data Flow

The frontend communicates only with the backend.

```text
React
  │
  │ HTTPS / REST
  ▼
FastAPI
```

The frontend must never directly communicate with:

```text
Groq
MongoDB
FAISS
File Storage
```

API keys and database credentials must never exist in frontend code.

---

# 10. Backend

## FastAPI

The backend will use:

```text
Python
+
FastAPI
```

FastAPI was selected because the project contains significant AI, RAG, OCR, and document-processing functionality.

Python provides an excellent ecosystem for these tasks.

FastAPI also provides:

- asynchronous API support,

- automatic OpenAPI documentation,

- Pydantic integration,

- dependency injection,

- simple REST API development.

---

# 11. Python Version

Use:

```text
Python 3.12+
```

All developers should use the same major Python version whenever possible.

The exact supported version should also be defined in the repository configuration.

---

# 12. API Design

The application will use REST APIs.

Example:

```text
/api/v1/auth
/api/v1/users
/api/v1/cases
/api/v1/evidence
/api/v1/ai
/api/v1/knowledge
```

API contracts will be documented separately in:

```text
docs/api_contract.md
```

---

# 13. Data Validation

Use:

```text
Pydantic
```

for:

- request validation,

- response schemas,

- AI structured output validation,

- configuration validation.

Example:

```python
class CaseAnalysis(BaseModel):
    category: str
    issue_type: str
    desired_resolution: str | None
    confidence: float
```

AI-generated JSON must be parsed and validated using Pydantic before entering application state.

---

# 14. Database

## MongoDB

MongoDB will be the primary application database.

It stores:

- users,

- grievance cases,

- evidence metadata,

- timeline events,

- AI analyses,

- generated complaints,

- knowledge-source metadata.

MongoDB fits the project because grievance cases contain both predictable application fields and flexible AI-generated information.

Example:

```text
Case

_id
user_id
title
description
category
status

analysis
├── issue_type
├── summary
├── confidence
└── extracted_information

created_at
updated_at
```

Detailed schemas belong in:

```text
docs/data_model.md
```

---

# 15. MongoDB Development Environment

During local development, MongoDB should run locally.

Recommended:

```text
Docker
   │
   ▼
MongoDB Container
```

This avoids requiring every developer to configure an external database account.

A hosted free tier may be used for demonstration/deployment when available.

The application must not depend on hosted-only MongoDB features.

---

# 16. MongoDB Driver

Use an actively maintained MongoDB Python driver compatible with the selected FastAPI architecture.

Database access should be isolated behind repository/data-access classes.

Example:

```text
CaseService
     │
     ▼
CaseRepository
     │
     ▼
MongoDB
```

Business logic should not contain raw database queries throughout the codebase.

---

# 17. AI Inference

## Groq

Groq will be the primary LLM inference provider.

Groq will initially support:

- grievance analysis,

- information extraction,

- follow-up questions,

- case summaries,

- complaint generation,

- RAG-grounded guidance.

Architecture:

```text
Application
     │
     ▼
AIService
     │
     ▼
LLMProvider
     │
     ▼
GroqProvider
     │
     ▼
Groq API
```

Application modules must not directly call Groq.

---

# 18. Groq Provider Abstraction

Groq should remain replaceable.

Define an abstraction conceptually similar to:

```text
LLMProvider

generate()
generate_structured()
```

Then:

```text
LLMProvider
     │
     ▼
GroqProvider
```

This prevents Groq-specific code from spreading across the application.

If API limits or provider availability change later, another provider can be introduced without rewriting business logic.

---

# 19. AI Models

Specific model names should NOT be hardcoded throughout the application.

Instead:

```text
GROQ_MODEL=<model-name>
```

should be configured through environment variables.

This is important because available Groq models may change over time.

Model selection belongs in configuration, not application logic.

---

# 20. Embeddings

LLM generation and embeddings are different responsibilities.

Groq will handle generation.

For embeddings, use:

```text
Sentence Transformers
```

with a free, locally runnable embedding model.

Pipeline:

```text
Text
 │
 ▼
Sentence Transformer
 │
 ▼
Embedding Vector
```

Advantages:

- free,

- runs locally,

- no embedding API charges,

- works offline after model download,

- avoids unnecessary external dependencies.

The exact embedding model will be documented in `ai_system.md`.

---

# 21. Vector Search

## Qdrant Vector Database

Qdrant Cloud provides scalable, high-performance vector similarity search.

```text
Knowledge Documents
       │
       ▼
    Chunking
       │
       ▼
   Embeddings
       │
       ▼
 Qdrant Cloud Vector Store
```

Reasons for using Qdrant:

- free cloud tier,

- high performance,

- cloud-accessible vector indexing,

- metadata filtering and payload storage,

- fast cosine vector similarity matching.

---

# 22. Vector Metadata

Qdrant stores vector embeddings alongside structured payload metadata directly in point records.

---

# 23. RAG Stack

The initial RAG system is implemented using:

```text
PyMuPDF
     ↓
Text
     ↓
Custom Chunking
     ↓
Sentence Transformers
     ↓
Qdrant Cloud
     ↓
Retriever
     ↓
Context Builder
     ↓
Groq
```

Do NOT initially introduce LangChain or LlamaIndex.

The team should first understand:

- chunking,

- embeddings,

- cosine similarity,

- retrieval,

- context construction,

- prompt grounding.

Frameworks may be introduced later if they solve a demonstrated problem.

---

# 24. PDF Processing

Use:

```text
PyMuPDF
```

for extracting text from machine-readable PDF files.

Pipeline:

```text
PDF
 │
 ▼
PyMuPDF
 │
 ▼
Extracted Text
```

If the PDF contains scanned images rather than selectable text, OCR may be required.

---

# 25. OCR

Use:

```text
Tesseract OCR
```

for optical character recognition.

Example:

```text
Scanned Invoice
       │
       ▼
Image Processing
       │
       ▼
Tesseract
       │
       ▼
Extracted Text
       │
       ▼
AI Information Extraction
```

Tesseract is free and runs locally.

No paid OCR API should be required.

---

# 26. File Storage

During the MVP, evidence files will use:

```text
Local File Storage
```

Example:

```text
storage/
└── evidence/
    └── <user-id>/
        └── <case-id>/
            ├── invoice.pdf
            └── screenshot.png
```

MongoDB stores only metadata and storage references.

The storage interface should remain abstract enough to support object storage later.

---

# 27. Authentication

Authentication will initially use:

```text
Email
+
Password
+
JWT
```

Flow:

```text
Login
  │
  ▼
Verify Credentials
  │
  ▼
Generate Token
  │
  ▼
Authenticated Request
```

OAuth and social login are not required for the MVP.

---

# 28. Password Security

Passwords must never be stored directly.

Use:

```text
Argon2
```

or another approved modern password-hashing implementation.

Stored data should contain:

```text
password_hash
```

never:

```text
password
```

---

# 29. API Documentation

FastAPI automatically generates OpenAPI documentation.

During development:

```text
/docs
```

can provide interactive API documentation.

`api_contract.md` remains the human-readable architectural API specification.

OpenAPI represents the actual implementation contract.

---

# 30. Testing

Backend:

```text
pytest
```

Frontend:

```text
Vitest
+
React Testing Library
```

API testing/debugging:

```text
Bruno
```

or Postman's free functionality.

Detailed testing strategy belongs in:

```text
docs/tests.md
```

---

# 31. Code Quality

## Python

Recommended tools:

```text
Ruff
```

for linting and formatting.

Optional:

```text
mypy
```

for additional static type checking where useful.

## TypeScript

Use:

```text
ESLint
```

for static analysis.

Formatting and linting rules should be shared across the repository.

---

# 32. Version Control

Use:

```text
Git
+
GitHub
```

The repository should use feature branches.

Example:

```text
main
 │
 ├── feature/case-management
 ├── feature/groq-integration
 ├── feature/rag
 ├── feature/evidence-processing
 └── feature/dashboard
```

Changes should reach `main` through pull requests.

---

# 33. CI/CD

Use:

```text
GitHub Actions
```

for automated validation.

Basic pipeline:

```text
Pull Request
     │
     ▼
Install Dependencies
     │
     ├── Backend Lint
     ├── Backend Tests
     ├── Frontend Lint
     ├── Frontend Tests
     └── Build
            │
            ▼
       PR Validation
```

The CI pipeline must not require paid infrastructure.

---

# 34. Containers

Use:

```text
Docker
+
Docker Compose
```

for consistent local environments.

Example:

```text
docker compose up
```

should eventually start the required local infrastructure.

Conceptually:

```text
Docker Compose
│
├── frontend
├── backend
└── mongodb
```

FAISS and local file storage can initially exist inside/backend-adjacent persistent volumes rather than separate services.

---

# 35. Environment Configuration

Secrets and environment-specific settings belong in environment variables.

Example:

```text
# Backend

MONGODB_URI=
MONGODB_DATABASE=

GROQ_API_KEY=
GROQ_MODEL=

JWT_SECRET=
JWT_EXPIRATION=

STORAGE_PATH=
FAISS_INDEX_PATH=
```

Provide:

```text
.env.example
```

with placeholders.

Never commit:

```text
.env
API keys
database credentials
JWT secrets
```

---

# 36. Development Environment

Recommended developer tools:

```text
VS Code / JetBrains IDE
Git
GitHub
Docker Desktop / Docker Engine
Node.js
Python
```

All tools required to build the application must have free options.

---

# 37. Deployment Strategy

Deployment is intentionally provider-independent.

The architecture should support:

```text
Frontend
   ↓
Static Hosting

Backend
   ↓
Python-Compatible Hosting

MongoDB
   ↓
Free Hosted Tier
OR
Self-Hosted MongoDB

Files
   ↓
Local/Persistent Storage
```

Specific cloud providers should be selected only when deployment begins because free-tier offerings frequently change.

Development must not depend on deployment-provider-specific functionality.

---

# 38. Cost Constraint

The target development cost is:

# ₹0

Core stack:

| Technology            | Cost                                             |
| --------------------- | ------------------------------------------------ |
| React                 | Free                                             |
| TypeScript            | Free                                             |
| Vite                  | Free                                             |
| Tailwind CSS          | Free                                             |
| FastAPI               | Free                                             |
| Python                | Free                                             |
| MongoDB               | Free locally                                     |
| Groq                  | Free developer access subject to provider limits |
| Sentence Transformers | Free                                             |
| FAISS                 | Free                                             |
| Tesseract             | Free                                             |
| PyMuPDF               | Free/open-source components used by project      |
| Docker                | Free development options                         |
| Git                   | Free                                             |
| GitHub                | Free tier                                        |
| GitHub Actions        | Free allocation                                  |
| JWT                   | Free                                             |
| Local file storage    | Free                                             |

Free cloud/API tiers can impose quotas.

Therefore, the system should remain locally runnable wherever practical.

---

# 39. Technologies Explicitly Not Required

Do not introduce these into the MVP without a documented reason:

```text
Kubernetes
Kafka
RabbitMQ
Redis
Elasticsearch
GraphQL
LangChain
LlamaIndex
Pinecone
Firebase
Supabase
Paid OCR APIs
Paid embedding APIs
Paid authentication providers
Paid monitoring platforms
```

This does NOT mean these technologies are bad.

They simply do not currently solve a problem significant enough to justify additional complexity or dependency.

---

# 40. Technology Ownership

Each technology should have a clear purpose.

```text
React
→ User Interface

FastAPI
→ Application Backend

MongoDB
→ Application Data

Groq
→ LLM Inference

Sentence Transformers
→ Embeddings

FAISS
→ Vector Similarity Search

PyMuPDF
→ PDF Text Extraction

Tesseract
→ OCR

Local Storage
→ Evidence Files

Docker
→ Development Environment

GitHub Actions
→ Continuous Integration
```

A technology should not be added unless its responsibility can be clearly stated.

---

# 41. Final Stack Overview

```text
                    ┌───────────────┐
                    │ React + TS    │
                    │ Tailwind      │
                    └───────┬───────┘
                            │
                           REST
                            │
                    ┌───────▼───────┐
                    │    FastAPI    │
                    │    Python     │
                    └───────┬───────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
      MongoDB          AI / RAG          File Storage
                           │
                  ┌────────┼────────┐
                  │        │        │
                  ▼        ▼        ▼
                Groq   Sentence   Tesseract
                        Transformers
                            │
                            ▼
                           FAISS
```

The stack intentionally favors technologies that are simple, educational, locally runnable, and free.

---

# 42. Technology Change Policy

If a developer or AI agent believes another technology should be introduced:

1. Identify the limitation of the existing stack.

2. Explain why the existing technology cannot reasonably solve it.

3. Confirm the proposed technology can be used within the project's zero-cost constraint.

4. Evaluate additional complexity.

5. Record the decision in `decision_log.md`.

6. Update this document after approval.

Do not silently introduce new infrastructure.
