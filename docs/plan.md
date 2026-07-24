# Master Implementation Plan — AI-Powered Consumer Grievance Platform

## 1. Overview & Strategy

This document outlines the step-by-step implementation plan for building the **AI-Powered Consumer Grievance Assistance Platform**.

### Core Development Philosophy
1. **Inside-Out / Incremental Growth**: Build a solid, working core application first (Authentication, Cases, Data Persistence) before introducing AI capabilities.
2. **Phase-by-Phase Execution**: Each phase is self-contained, testable, and produces a working baseline that the next phase builds upon.
3. **Deterministic First**: Ensure core data integrity, permissions, and business rules are handled by normal application code before layering AI generation on top.
4. **Zero-Cost Rule**: Use open-source, free local tools and APIs (FastAPI, React, MongoDB, Groq free tier, Sentence Transformers, FAISS, Tesseract, Docker).
5. **Strict Quality Gate & Continuous Testing**: Every single feature and phase MUST be rigorously tested and verified (automated backend/frontend tests + empirical runtime verification) before declaring the phase complete and moving forward. No phase advances with unverified code or failing tests.

---

## 2. System Architecture & Tech Stack Summary

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: FastAPI (Python 3.12+) + Pydantic v2 + Motor (Async MongoDB driver)
- **Database**: MongoDB (Local / Containerized)
- **LLM Inference**: Groq API (`groq` Python SDK)
- **Embeddings & Vector Search**: `sentence-transformers` (`all-MiniLM-L6-v2`) + `FAISS`
- **Document Processing & OCR**: `PyMuPDF` + `Tesseract OCR`
- **Testing & Quality Assurance**: Root `/tests` directory (Pytest + Vitest) + unified `run_tests.bat` / `run_tests.sh` scripts
- **Containerization**: Docker + Docker Compose

---

## 3. Phase Roadmap

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Foundation & Infrastructure                              │
│ (FastAPI setup, MongoDB connection, JWT Auth, Case CRUD, React Shell)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: AI Problem Understanding & Follow-Up Questions                │
│ (Groq SDK, Case Analysis, Structured Pydantic Output, AI Questions UI) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Evidence Management & Case Timeline                           │
│ (Local file storage, Evidence collection, Auto Timeline Events UI)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Knowledge Ingestion & Vector Search Pipeline                  │
│ (PyMuPDF ingestion, Chunking, Sentence Transformers, FAISS index)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: RAG-Grounded AI Guidance                                      │
│ (Vector query construction, Context Builder, Grounded Groq prompts)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Complaint Generation & Export                                 │
│ (Multi-source prompt context, Complaint Draft editor, TXT/PDF export)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 7: Advanced Evidence Intelligence (OCR & Extraction)              │
│ (Tesseract OCR, Invoice metadata extraction, Smart Evidence Checklist) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 8: Hardening, Docker Compose & Final Verification                │
│ (Security audit, Exception handling, Docker Orchestration, E2E tests)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Phase Specifications

### Phase 1: Core Foundation & Infrastructure

**Goal**: Establish the backend API, database connection, user authentication, case management CRUD, and frontend baseline shell.

#### Key Deliverables:
1. **Backend Base Structure**:
   - `backend/` directory with FastAPI initialization, CORS middleware, `.env` config parser.
   - Database module (`backend/shared/database.py`) using `motor.motor_asyncio` for MongoDB.
2. **Authentication Module (`backend/auth/` & `backend/users/`)**:
   - Models: User schema (`name`, `email`, `password_hash`, `created_at`).
   - Password hashing using `passlib` / `bcrypt` or `argon2`.
   - Endpoints: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
   - JWT dependency for protected route authorization.
3. **Case Module (`backend/cases/`)**:
   - Models: Case schema (`user_id`, `title`, `description`, `category`, `issue_type`, `desired_resolution`, `status`, `created_at`, `updated_at`).
   - Repository: `CaseRepository` handling MongoDB queries.
   - Endpoints:
     - `POST /api/v1/cases` (Create case)
     - `GET /api/v1/cases` (List user cases)
     - `GET /api/v1/cases/{id}` (Get case details with ownership check)
     - `PATCH /api/v1/cases/{id}/status` (Update case status)
4. **Frontend Baseline (`frontend/`)**:
   - Setup React + TypeScript + Vite + Tailwind CSS.
   - Auth pages: Login & Signup screens.
   - Protected layout & Navigation bar.
   - Dashboard page displaying user's case list and "Create New Case" modal.

#### Verification Criteria:
- User can sign up, log in, receive a JWT token, and access protected routes.
- User can create a new grievance case and see it populated on the Dashboard.
- Accessing another user's case ID returns a `403 Forbidden` error.

---

### Phase 2: AI Problem Understanding & Follow-Up Questions

**Goal**: Integrate Groq API to analyze unstructured user complaint text into structured grievance data and generate follow-up questions.

#### Key Deliverables:
1. **Groq Provider Abstraction (`backend/ai/providers/groq.py`)**:
   - Client wrapper using `groq` SDK with model configuration via environment variable (`GROQ_MODEL`).
   - Retries and fallback exception handling.
2. **AI Case Analysis (`backend/ai/`)**:
   - Pydantic response schema `CaseAnalysis`:
     ```python
     class CaseAnalysis(BaseModel):
         summary: str
         category: str
         issue_type: str
         desired_resolution: str
         key_facts: list[str]
         missing_information: list[str]
     ```
   - Prompt definition `backend/ai/prompts/case_analysis.py`.
   - Endpoint: `POST /api/v1/cases/{id}/analyze`
     - Runs description through Groq, validates output with Pydantic, stores result in `ai_analyses` collection, and updates `cases` record fields.
3. **AI Follow-Up Question Generator**:
   - Prompt definition `backend/ai/prompts/follow_up.py`.
   - Endpoint: `POST /api/v1/cases/{id}/follow-up`
     - Generates 3–5 targeted questions based on `missing_information`.
   - Endpoint: `POST /api/v1/cases/{id}/answers`
     - Updates case profile with user-provided answers.
4. **Frontend Integration**:
   - Interactive Case Creation wizard: "Describe your issue in your own words".
   - AI Analysis card showing extracted Category, Issue Type, and Summary.
   - Interactive "AI Assistant Needs More Details" questionnaire card on the Case Detail page.

#### Verification Criteria:
- Entering an unstructured complaint (e.g. "My smartwatch stopped charging after 2 weeks...") produces structured JSON with category `electronics` and issue_type `defective_product`.
- Groq output is strictly validated against Pydantic models before being stored in MongoDB.
- Answering follow-up questions successfully updates case state.

---

### Phase 3: Evidence Management & Case Timeline

**Goal**: Enable file uploads, evidence metadata tracking, and automated case timeline recording.

#### Key Deliverables:
1. **Evidence Storage & Module (`backend/evidence/`)**:
   - Storage service saving binary files to `storage/evidence/{user_id}/{case_id}/{filename}`.
   - Evidence metadata collection (`evidence`) in MongoDB (`case_id`, `user_id`, `original_filename`, `storage_key`, `mime_type`, `size_bytes`, `evidence_type`, `created_at`).
   - Endpoints:
     - `POST /api/v1/cases/{id}/evidence` (Upload file)
     - `GET /api/v1/cases/{id}/evidence` (List case files)
     - `GET /api/v1/cases/{id}/evidence/{evidence_id}/download` (Download file)
     - `DELETE /api/v1/cases/{id}/evidence/{evidence_id}` (Delete file)
2. **Timeline Module (`backend/timeline/`)**:
   - Collection: `timeline_events` (`case_id`, `user_id`, `event_type`, `description`, `metadata`, `created_at`).
   - Service automatically creating timeline records during backend actions (`case_created`, `analysis_completed`, `evidence_uploaded`, `status_changed`).
   - Endpoint: `GET /api/v1/cases/{id}/timeline`.
3. **Frontend Integration**:
   - Evidence Upload dropzone and gallery view on Case Detail page.
   - Interactive Visual Timeline showing chronological case events.

#### Verification Criteria:
- User can upload PDF/image evidence files and view them in the evidence gallery.
- Uploading evidence automatically creates a `evidence_uploaded` event on the case timeline.
- Files are saved securely in local storage and forbidden from cross-user access.

---

### Phase 4: Knowledge Ingestion & Vector Search Pipeline

**Goal**: Build the offline knowledge ingestion script, chunking engine, local embedding generator, and FAISS vector index.

#### Key Deliverables:
1. **Knowledge Collections (`knowledge_sources`, `knowledge_chunks`)**:
   - MongoDB schemas for storing original document metadata and text chunks.
2. **Offline Knowledge Ingestion Script (`scripts/ingest_knowledge.py`)**:
   - PDF Text Extraction using `PyMuPDF` (`fitz`).
   - Text cleaning (whitespace normalization, header removal).
   - Structure-aware chunking (400–700 tokens with section overlap).
   - Embedding generation using `sentence-transformers` (`all-MiniLM-L6-v2`).
   - Save vector embeddings into `storage/faiss_index.bin`.
   - Save chunk texts and source metadata to MongoDB `knowledge_chunks` and `knowledge_sources`.
3. **RAG Vector Store Wrapper (`backend/rag/index/faiss_store.py`)**:
   - Loading and querying local FAISS index.
   - Vector similarity search (`top_k = 5`).
4. **Retriever Service (`backend/rag/retrieval/retriever.py`)**:
   - Maps FAISS result vector IDs back to MongoDB `knowledge_chunks` to fetch exact text and source citations.

#### Verification Criteria:
- Running `python scripts/ingest_knowledge.py sample_guidance.pdf` generates FAISS index and populates `knowledge_chunks` collection.
- Executing a test similarity query (e.g. "seller replacement refusal") returns top-5 relevant chunks with correct metadata.

---

### Phase 5: RAG-Grounded AI Guidance

**Goal**: Connect RAG retrieval to Groq inference so users receive grounded advice with cited references.

#### Key Deliverables:
1. **Context Builder (`backend/rag/context/builder.py`)**:
   - Assembles retrieved knowledge chunks and case details into a structured prompt context block.
2. **Grounded RAG Endpoint (`backend/ai/` & `backend/rag/`)**:
   - Endpoint: `POST /api/v1/cases/{id}/guidance`
     1. Constructs semantic search query from case description + category + issue_type.
     2. Runs vector search via FAISS + MongoDB to fetch top-K knowledge chunks.
     3. Builds grounded system prompt instructing Groq to use *only* provided context and cite source titles.
     4. Calls Groq API and parses output.
     5. Stores result in `ai_analyses` (`analysis_type: "rag_guidance"`).
     6. Returns guidance answer + list of cited source references (`source_id`, `title`, `section`).
3. **Frontend Integration**:
   - "Get AI Next-Step Guidance" panel on Case Detail page.
   - Displays grounded recommendations alongside clickable source reference badges ("Consumer Rights Guidance Section 4", etc.).

#### Verification Criteria:
- Asking "What should I do next?" returns actionable guidance based on ingested knowledge documents.
- Generated guidance displays verifiable source titles.
- If no knowledge context matches, system gracefully responds that context is insufficient rather than hallucinating.

---

### Phase 6: Complaint Generation & Export

**Goal**: Build the automated formal complaint draft generator with interactive user editing and export capabilities.

#### Key Deliverables:
1. **Complaint Generation Engine (`backend/ai/prompts/complaint_generation.py`)**:
   - Aggregates case details, user answers, evidence summary, and RAG guidance.
   - Prompt produces a formal complaint document structure (Recipient, Subject, Summary of Issue, Chronological Timeline, Requested Resolution, Closing).
2. **Complaint Module (`backend/complaints/`)**:
   - Collection: `complaints` (`case_id`, `user_id`, `title`, `content`, `status`, `version`, `created_at`, `updated_at`).
   - Endpoints:
     - `POST /api/v1/cases/{id}/complaint` (Generate complaint draft)
     - `GET /api/v1/cases/{id}/complaint` (Fetch complaint draft)
     - `PUT /api/v1/cases/{id}/complaint` (Save user edits)
3. **Frontend Integration**:
   - "Generate Formal Complaint" button and workflow.
   - Rich Markdown/Text editor allowing user to review and edit the draft.
   - "Copy to Clipboard" and "Download as TXT / PDF" export actions.
   - Auto-creates `complaint_generated` event on case timeline.

#### Verification Criteria:
- Clicking "Generate Complaint" produces a comprehensive, professional complaint draft using case information.
- User edits are saved to MongoDB as user-controlled content.
- User can download the complaint text file locally.

---

### Phase 7: Advanced Evidence Intelligence (OCR & Extraction)

**Goal**: Implement document processing with OCR to automatically extract key values from uploaded invoices/receipts and generate a smart evidence checklist.

#### Key Deliverables:
1. **Document Processing Engine (`backend/documents/`)**:
   - PDF text extraction via `PyMuPDF`.
   - Scanned image OCR via `Tesseract OCR` (`pytesseract`).
2. **Evidence Intelligence Service (`backend/ai/prompts/evidence_analysis.py`)**:
   - Interprets raw OCR text using Groq to extract structured metadata (`seller`, `product`, `purchase_date`, `order_number`, `amount`).
   - Endpoint: `POST /api/v1/cases/{id}/evidence/{evidence_id}/process`
     - Updates evidence record with extracted text and suggested case metadata.
3. **Smart Evidence Checklist**:
   - Evaluates current evidence against grievance category and suggests missing supporting files (e.g. "Warranty Card missing", "Seller Email Rejection missing").
4. **Frontend Integration**:
   - "Processing Document..." spinner during upload.
   - Auto-population suggestion banner on Case page ("Extracted Seller: ABC Store on Invoice — Accept / Reject").
   - Smart Evidence Checklist UI card.

#### Verification Criteria:
- Uploading an image invoice triggers Tesseract OCR and Groq extraction.
- Extracted fields (Seller, Date, Amount) are suggested to the user without overwriting user data automatically.
- Smart checklist correctly highlights missing supporting document types for the category.

---

### Phase 8: Hardening, Docker Compose & Final Verification

**Goal**: Harden security, optimize performance, implement Docker orchestration, and execute full end-to-end verification.

#### Key Deliverables:
1. **System Hardening & Security Audit**:
   - Ensure all case APIs enforce strict ownership validation (`user_id == auth_user.id`).
   - Prompt injection defense: Wrap all user/document text in explicit untrusted blocks in prompts.
   - Rate limiting & exception handling for Groq API calls.
2. **Docker Orchestration**:
   - `backend/Dockerfile` (Python 3.12 + Tesseract OCR binary dependencies).
   - `frontend/Dockerfile` (Node build + Vite preview/Nginx).
   - `docker-compose.yml` orchestrating:
     - `backend` (FastAPI)
     - `frontend` (React UI)
     - `mongodb` (Database)
3. **Root Test Architecture (`tests/`)**:
   - Centralized root `/tests` directory structure:
     ```text
     tests/
     ├── unit/
     │   ├── test_auth.py
     │   ├── test_cases.py
     │   ├── test_ai_analysis.py
     │   └── test_rag.py
     ├── integration/
     │   ├── test_evidence_workflow.py
     │   └── test_complaint_flow.py
     ├── e2e/
     │   └── test_full_pipeline.py
     └── fixtures/
         ├── sample_cases.json
         └── sample_invoice.pdf
     ```
4. **Unified One-Click Test Runners (`run_tests.bat` & `run_tests.sh`)**:
   - `run_tests.bat` (for Windows):
     ```cmd
     @echo off
     echo Running Backend Tests...
     cd backend && pytest ../tests --tb=short
     if %errorlevel% neq 0 ( echo Backend tests failed! & exit /b %errorlevel% )
     echo Running Frontend Tests...
     cd ../frontend && npm test -- --run
     if %errorlevel% neq 0 ( echo Frontend tests failed! & exit /b %errorlevel% )
     echo All tests passed successfully!
     ```
   - `run_tests.sh` (for Linux/macOS):
     ```bash
     #!/usr/bin/env bash
     set -e
     echo "Running Backend Tests..."
     (cd backend && pytest ../tests --tb=short)
     echo "Running Frontend Tests..."
     (cd frontend && npm test -- --run)
     echo "All tests passed successfully!"
     ```

#### Verification Criteria:
- Running `run_tests.bat` or `run_tests.sh` executes all backend and frontend test suites in a single command.
- Running `docker compose up` starts the complete application stack from scratch.
- Full E2E user flow succeeds without errors:
  `Sign Up -> Create Case -> AI Analysis -> AI Follow-Ups -> Evidence Upload -> RAG Guidance -> Complaint Generation -> Export`.

---

## 5. Summary Matrix of Phases & Dependencies

| Phase | Title | Primary Tech Stack | Prerequisites |
|-------|-------|--------------------|---------------|
| **1** | Core Foundation & Infrastructure | FastAPI, React, MongoDB, JWT | None |
| **2** | AI Problem Understanding & Follow-ups | Groq SDK, Pydantic | Phase 1 |
| **3** | Evidence Management & Case Timeline | Local Storage, MongoDB, React UI | Phase 1 |
| **4** | Knowledge Ingestion & Vector Search | PyMuPDF, Sentence Transformers, FAISS | Phase 1 |
| **5** | RAG-Grounded AI Guidance | FAISS, Groq SDK, Context Builder | Phase 2, Phase 4 |
| **6** | Complaint Generation & Export | Groq SDK, Markdown Editor | Phase 2, Phase 5 |
| **7** | Advanced Evidence Intelligence | Tesseract OCR, PyMuPDF, Groq SDK | Phase 3, Phase 5 |
| **8** | Hardening & Docker Orchestration | Docker Compose, Pytest, Vitest | All Phases |
