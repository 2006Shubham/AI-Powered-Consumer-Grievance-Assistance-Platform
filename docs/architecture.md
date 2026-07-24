# System Architecture

## 1. Purpose

This document defines the high-level architecture of the AI-Powered Consumer Grievance Assistance Platform.

It explains:

- major system components,

- responsibilities of each component,

- communication between components,

- boundaries between modules,

- and architectural rules contributors must follow.

Product requirements and features belong in `PRD.md`.

Technology-specific choices belong in `techstack.md`.

---

# 2. Architectural Goals

The architecture should prioritize:

1. **Simplicity** — avoid unnecessary distributed systems or microservices.

2. **Modularity** — AI, RAG, evidence processing, and business logic should remain independently understandable.

3. **Maintainability** — six developers should be able to work simultaneously without excessive conflicts.

4. **Testability** — core logic should be testable without calling external AI services.

5. **Security** — user cases and uploaded evidence must remain private.

6. **Extensibility** — advanced AI features can be introduced later without rewriting the core system.

---

# 3. Architecture Style

The application will use a:

> **Modular Monolith + Separate Frontend**

```text
┌─────────────────────┐
│                     │
│   React Frontend    │
│                     │
└──────────┬──────────┘
           │
        HTTPS/REST
           │
           ▼
┌─────────────────────────────────────────┐
│                                         │
│              Backend API                │
│                                         │
│  ┌─────────┐ ┌────────┐ ┌────────────┐ │
│  │  Auth   │ │ Cases  │ │ Evidence   │ │
│  └─────────┘ └────────┘ └────────────┘ │
│                                         │
│  ┌─────────┐ ┌────────┐ ┌────────────┐ │
│  │   AI    │ │  RAG   │ │ Documents  │ │
│  └─────────┘ └────────┘ └────────────┘ │
│                                         │
└──────┬─────────────┬─────────────┬──────┘
       │             │             │
       ▼             ▼             ▼

    MongoDB       Groq API     File Storage
       │
       ▼
 Vector Search
```

The backend is deployed as one application but internally divided into clearly separated modules.

Microservices are intentionally avoided for the MVP.

---

# 4. Major Components

## 4.1 Frontend

The frontend is responsible for presentation and user interaction.

Responsibilities:

- authentication screens,

- dashboard,

- case creation,

- case management,

- evidence uploads,

- AI interactions,

- complaint editing,

- timeline visualization,

- displaying retrieved sources.

The frontend must **not** contain business rules or directly communicate with Groq.

```text
Frontend
   │
   │ REST API
   ▼
Backend
```

All privileged operations must pass through the backend.

---

# 5. Backend

The backend acts as the central application layer.

It is divided into domain modules.

```text
backend/
│
├── auth/
├── users/
├── cases/
├── evidence/
├── timeline/
├── ai/
├── rag/
├── documents/
└── shared/
```

Each module owns a specific responsibility.

Modules may communicate through defined service interfaces.

---

# 6. Authentication Module

Responsible for:

- account creation,

- login,

- authentication,

- authorization,

- password management,

- user identity.

Every request accessing case information must verify ownership.

Example:

```text
GET /cases/123
       │
       ▼
Authenticate User
       │
       ▼
Verify Case Ownership
       │
       ▼
Return Case
```

A user must never be able to access another user's case by modifying an ID.

---

# 7. Case Module

The Case module represents the core business domain.

It manages:

- grievance cases,

- case descriptions,

- categories,

- issue types,

- desired resolutions,

- case statuses,

- case updates.

Other modules operate **around a Case**.

```text
                 Case
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
     Evidence   Timeline    AI
                              │
                              ▼
                             RAG
```

The Case module should not contain AI-specific implementation details.

---

# 8. Evidence Module

The Evidence module manages files attached to cases.

Responsibilities:

- upload validation,

- evidence metadata,

- evidence association with cases,

- secure file access,

- deletion,

- evidence classification.

Example:

```text
User Upload
     │
     ▼
Validate File
     │
     ▼
Store File
     │
     ▼
Create Evidence Record
     │
     ▼
Attach to Case
```

The database stores metadata.

Actual files should be stored using the configured file-storage provider.

---

# 9. Document Processing Module

Document Processing converts uploaded evidence into machine-readable information.

Possible pipeline:

```text
Uploaded Document
       │
       ▼
Detect File Type
       │
       ▼
Extract Text
       │
       ├── PDF Parser
       └── OCR
       │
       ▼
Normalize Text
       │
       ▼
Information Extraction
```

The module should expose a simple interface such as:

```text
process_document(file)
```

Other modules should not need to know which OCR or PDF library is being used.

---

# 10. AI Module

The AI module provides all communication with Groq.

No other backend module should directly call the Groq API.

```text
Application
     │
     ▼
 AI Service
     │
     ▼
Groq Client
     │
     ▼
 Groq API
```

Responsibilities include:

- case analysis,

- structured information extraction,

- follow-up question generation,

- complaint generation,

- case summarization,

- evidence interpretation.

The AI layer should return structured results whenever possible.

Example:

```json
{
  "category": "Electronics",
  "issue_type": "Defective Product",
  "confidence": 0.91
}
```

Prompt definitions should remain separate from API/networking code.

Detailed AI behavior belongs in `ai_system.md`.

---

# 11. RAG Module

The RAG module grounds AI responses using trusted information.

Its responsibility is retrieval — not general case management.

```text
User Question / Case
          │
          ▼
     Query Creation
          │
          ▼
    Vector Search
          │
          ▼
 Relevant Documents
          │
          ▼
    Context Builder
          │
          ▼
       AI Module
          │
          ▼
 Grounded Response
```

The module should return both:

```text
retrieved context
+
source metadata
```

This allows the frontend to display where guidance originated.

---

# 12. Knowledge Ingestion

Knowledge ingestion happens separately from normal user requests.

```text
Trusted Documents
       │
       ▼
Text Extraction
       │
       ▼
Cleaning
       │
       ▼
Chunking
       │
       ▼
Embedding Generation
       │
       ▼
Vector Storage
```

Only curated and approved sources should enter the production knowledge base.

User-uploaded evidence and the shared grievance knowledge base are logically separate datasets.

---

# 13. Database

MongoDB acts as the primary system of record.

It stores structured application information including:

- users,

- cases,

- evidence metadata,

- timeline events,

- AI analyses,

- generated complaints,

- knowledge-source metadata.

MongoDB is the authoritative source for application state.

Vector search must not become the authoritative database for case information.

---

# 14. File Storage

Uploaded evidence should not be stored directly inside MongoDB documents.

Instead:

```text
MongoDB

Evidence
├── id
├── case_id
├── filename
├── storage_key
└── metadata

              │
              ▼

        File Storage

        actual_file.pdf
```

This keeps database responsibilities separate from binary-file storage.

---

# 15. Timeline

Important case actions should generate timeline events.

Example:

```text
Case Created
     ↓
Evidence Uploaded
     ↓
AI Analysis Completed
     ↓
Complaint Generated
     ↓
Status Changed
```

Timeline events should be generated by backend operations rather than manually reconstructed by the frontend.

---

# 16. Primary Case Analysis Flow

When a user creates a grievance:

```text
User
 │
 ▼
Frontend
 │
 ▼
POST /cases
 │
 ▼
Case Service
 │
 ├──────────────► Database
 │
 ▼
AI Service
 │
 ▼
Groq
 │
 ▼
Structured Analysis
 │
 ▼
Validation
 │
 ▼
Database
 │
 ▼
Frontend
```

AI output must be validated before being stored.

Never assume LLM output is valid simply because JSON was requested.

---

# 17. RAG Guidance Flow

When the user requests guidance:

```text
Case
 │
 ▼
RAG Service
 │
 ▼
Retrieve Relevant Knowledge
 │
 ▼
Context
 │
 ▼
AI Service
 │
 ▼
Groq
 │
 ▼
Grounded Response
 │
 ├── Answer
 │
 └── Sources
 │
 ▼
Frontend
```

---

# 18. Complaint Generation Flow

```text
Case Information
       │
       ├── Description
       ├── AI Analysis
       ├── User Answers
       ├── Evidence
       └── Retrieved Guidance
                 │
                 ▼
             AI Service
                 │
                 ▼
               Groq
                 │
                 ▼
        Generated Complaint
                 │
                 ▼
              Validate
                 │
                 ▼
               Store
                 │
                 ▼
          User Reviews/Edits
```

The user remains responsible for approving the final complaint.

---

# 19. External Dependencies

The core system should minimize external dependencies.

External services are accessed through adapters.

```text
Application Logic
       │
       ▼
     Interface
       │
       ▼
     Adapter
       │
       ├── Groq
       ├── File Storage
       └── Embedding Provider
```

This allows providers to be changed without rewriting business logic.

For example:

```text
AIService
   │
   ▼
GroqProvider
```

could later become:

```text
AIService
   │
   ▼
DifferentProvider
```

without changing the Case module.

---

# 20. Error Handling

Errors should be categorized.

```text
ApplicationError
│
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── NotFoundError
├── AIServiceError
├── DocumentProcessingError
└── StorageError
```

External service failures should never expose internal stack traces to users.

AI failure should also not destroy or invalidate the user's existing case.

---

# 21. Logging

The backend should produce structured logs for important operations.

Examples:

```text
user.login
case.created
evidence.uploaded
ai.analysis.started
ai.analysis.completed
rag.retrieval.completed
complaint.generated
```

Never log:

- passwords,

- authentication tokens,

- Groq API keys,

- complete sensitive documents,

- unnecessary personal information.

---

# 22. Configuration

Environment-specific values must come from configuration/environment variables.

Example:

```text
DATABASE_URL
GROQ_API_KEY
JWT_SECRET
STORAGE_CONFIG
VECTOR_DATABASE_CONFIG
```

Secrets must never be committed to Git.

A `.env.example` file should document required variables without containing real credentials.

---

# 23. Suggested Repository Structure

```text
grievance-ai/
│
├── apps/
│   ├── web/
│   └── api/
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── techstack.md
│   ├── data_model.md
│   ├── ai_system.md
│   ├── api_contract.md
│   ├── security.md
│   ├── tests.md
│   ├── development.md
│   └── decision_log.md
│
├── scripts/
│   └── knowledge_ingestion/
│
├── knowledge/
│   └── README.md
│
├── infrastructure/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── docker-compose.yml
└── README.md
```

The internal structures of `web` and `api` will be defined once the final technology stack is selected.

---

# 24. Architectural Boundaries

These rules should be followed by both developers and AI coding agents.

### Rule 1

The frontend must never directly call Groq.

```text
Frontend ──X──► Groq
Frontend ─────► Backend ─────► Groq
```

### Rule 2

API keys and secrets never enter frontend code.

### Rule 3

Business logic should not live inside route/controller handlers.

Controllers should:

```text
Receive Request
      ↓
Validate
      ↓
Call Service
      ↓
Return Response
```

### Rule 4

Only the AI module communicates directly with Groq.

### Rule 5

Only the RAG module performs knowledge retrieval.

### Rule 6

LLM output is always considered untrusted input and must be validated.

### Rule 7

Case data belongs in MongoDB, not the vector database.

### Rule 8

User evidence and shared knowledge-base documents must remain logically separated.

### Rule 9

Every protected case operation must verify ownership.

### Rule 10

Do not introduce a new infrastructure component without documenting the reason in `decision_log.md`.

---

# 25. What We Are Intentionally NOT Building

For the MVP, do not introduce:

- microservices,

- Kubernetes,

- message queues,

- event streaming platforms,

- autonomous agent swarms,

- separate databases for every module,

- complicated distributed workflows.

These technologies can be valuable at scale but would increase complexity without solving an immediate project requirement.

The goal is to build a well-structured system, not the largest possible architecture.

---

# 26. Evolution Path

The architecture should allow gradual evolution.

```text
Phase 1

Modular Monolith
      ↓

Phase 2

Better RAG
Document Intelligence
AI Verification
      ↓

Phase 3

Specialized AI Agents
      ↓

Phase 4

Extract services only
when scaling requires it
```

Architecture changes must be driven by demonstrated requirements rather than anticipated complexity.

---

# 27. Source of Truth

When implementation questions arise:

```text
Product behavior
      → PRD.md

System structure
      → architecture.md

Technology choice
      → techstack.md

Database/schema
      → data_model.md

AI/RAG behavior
      → ai_system.md

API behavior
      → api_contract.md

Security
      → security.md

Testing
      → tests.md

Development workflow
      → development.md

Architectural reasoning
      → decision_log.md
```

If documents conflict, the conflict should be resolved and documented rather than allowing implementation to silently choose one interpretation.
