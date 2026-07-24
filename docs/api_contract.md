# API Contract

## 1. Purpose

This document defines the REST API contract between the frontend and backend of the Consumer Grievance Assistance Platform.

It specifies:

- endpoint conventions,

- authentication,

- request and response structures,

- case operations,

- evidence operations,

- AI operations,

- RAG guidance,

- complaint operations,

- timeline operations,

- and error handling.

This document defines **what the API exposes**, not how it is implemented.

---

# 2. API Style

The backend exposes a REST API.

Base path:

```text
/api/v1
```

Example:

```text
GET /api/v1/cases
POST /api/v1/cases
GET /api/v1/cases/{case_id}
```

All application endpoints should remain under the versioned API prefix.

---

# 3. Communication

Architecture:

```text
React Frontend
      │
      │ HTTPS / JSON
      ▼
FastAPI Backend
```

The frontend communicates only with FastAPI.

The frontend must never directly communicate with:

```text
MongoDB
Groq
FAISS
File Storage
```

---

# 4. Content Types

Normal API requests use:

```text
Content-Type: application/json
```

File uploads use:

```text
multipart/form-data
```

Responses normally use:

```text
application/json
```

---

# 5. Naming Convention

JSON properties use:

```text
snake_case
```

Example:

```json
{
  "case_id": "...",
  "issue_type": "defective_product",
  "desired_resolution": "refund",
  "created_at": "..."
}
```

Do not mix:

```text
caseId
case_id
CaseID
```

within the API.

---

# 6. Standard Success Response

Single-resource endpoints may return the resource directly.

Example:

```json
{
  "id": "case_123",
  "title": "Defective Smartwatch",
  "status": "preparing"
}
```

Do not unnecessarily wrap every response inside multiple layers such as:

```json
{
  "success": true,
  "data": {
    "result": {
      "item": {}
    }
  }
}
```

Keep responses simple.

---

# 7. Standard Error Response

All API errors should follow a consistent structure.

```json
{
  "error": {
    "code": "CASE_NOT_FOUND",
    "message": "The requested case was not found.",
    "details": null
  }
}
```

Validation errors may include details:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address."
      }
    ]
  }
}
```

---

# 8. HTTP Status Codes

Use standard HTTP semantics.

| Status        | Meaning                                  |
| ------------- | ---------------------------------------- |
| `200`         | Successful request                       |
| `201`         | Resource created                         |
| `204`         | Successful request with no response body |
| `400`         | Invalid request                          |
| `401`         | Authentication required                  |
| `403`         | User lacks permission                    |
| `404`         | Resource not found                       |
| `409`         | Resource conflict                        |
| `413`         | Uploaded file too large                  |
| `422`         | Validation failure                       |
| `429`         | Rate limit reached                       |
| `500`         | Unexpected server error                  |
| `502` / `503` | External service unavailable             |

---

# 9. Authentication

MVP authentication uses:

```text
Email + Password + JWT
```

Protected requests include:

```text
Authorization: Bearer <token>
```

The backend extracts the authenticated user's identity from the token.

The frontend must never provide a trusted `user_id` to determine resource ownership.

---

# 10. Authentication Endpoints

## Register

```text
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:

```text
201 Created
```

```json
{
  "id": "...",
  "name": "Example User",
  "email": "user@example.com"
}
```

Possible errors:

```text
EMAIL_ALREADY_EXISTS
INVALID_PASSWORD
VALIDATION_ERROR
```

---

# 11. Login

```text
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

Possible errors:

```text
INVALID_CREDENTIALS
```

---

# 12. Current User

```text
GET /api/v1/users/me
```

Response:

```json
{
  "id": "...",
  "name": "Example User",
  "email": "user@example.com",
  "created_at": "2026-07-24T10:00:00Z"
}
```

---

# 13. Cases

Cases are the central API resource.

Base path:

```text
/api/v1/cases
```

All case endpoints require authentication.

---

# 14. Create Case

```text
POST /api/v1/cases
```

Request:

```json
{
  "title": "Defective headphones",
  "description": "I bought headphones two weeks ago and the left speaker stopped working."
}
```

Only basic information is required initially.

Response:

```text
201 Created
```

```json
{
  "id": "...",
  "title": "Defective headphones",
  "description": "...",
  "category": null,
  "issue_type": null,
  "desired_resolution": "unknown",
  "status": "draft",
  "created_at": "...",
  "updated_at": "..."
}
```

Case creation should succeed independently of Groq availability.

AI analysis is a separate operation.

---

# 15. List Cases

```text
GET /api/v1/cases
```

Returns cases belonging only to the authenticated user.

Example:

```json
{
  "items": [
    {
      "id": "...",
      "title": "Defective headphones",
      "category": "electronics",
      "status": "preparing",
      "created_at": "..."
    }
  ],
  "total": 1
}
```

---

# 16. Case Filtering

Optional query parameters may include:

```text
GET /api/v1/cases?status=resolved

GET /api/v1/cases?category=electronics
```

Pagination should be introduced if required.

Do not retrieve every historical case indefinitely.

---

# 17. Get Case

```text
GET /api/v1/cases/{case_id}
```

Response:

```json
{
  "id": "...",
  "title": "Defective headphones",
  "description": "...",
  "category": "electronics",
  "issue_type": "defective_product",
  "desired_resolution": "replacement",
  "status": "preparing",
  "created_at": "...",
  "updated_at": "..."
}
```

The backend must verify ownership.

---

# 18. Update Case

```text
PATCH /api/v1/cases/{case_id}
```

Example request:

```json
{
  "title": "Defective wireless headphones",
  "desired_resolution": "refund"
}
```

Only provided fields should be updated.

Response:

```text
200 OK
```

with the updated Case.

---

# 19. Update Case Status

Use a dedicated endpoint because status transitions have business meaning.

```text
PATCH /api/v1/cases/{case_id}/status
```

Request:

```json
{
  "status": "submitted"
}
```

Response:

```json
{
  "id": "...",
  "status": "submitted",
  "updated_at": "..."
}
```

A timeline event should automatically be generated.

---

# 20. Delete Case

```text
DELETE /api/v1/cases/{case_id}
```

Response:

```text
204 No Content
```

The backend is responsible for deleting associated private resources according to `data_model.md`.

---

# 21. Case AI Analysis

Case creation and AI analysis remain separate operations.

```text
POST /api/v1/cases/{case_id}/analysis
```

This operation sends the relevant case information through the AI system.

Response:

```json
{
  "id": "...",
  "analysis_type": "case_understanding",

  "result": {
    "summary": "The user purchased headphones that became defective shortly after purchase.",

    "category": "electronics",

    "issue_type": "defective_product",

    "desired_resolution": "unknown",

    "key_facts": [
      "Headphones were purchased approximately two weeks ago.",
      "Left speaker stopped working."
    ],

    "missing_information": [
      "exact_purchase_date",
      "seller_name",
      "preferred_resolution"
    ]
  },

  "created_at": "..."
}
```

---

# 22. Why Analysis Is Separate

Avoid:

```text
POST /cases
     │
     ▼
Database
     │
     ▼
Groq
     │
     ▼
Case Creation
```

because Groq failure could prevent the Case from being created.

Instead:

```text
Create Case
    │
    ▼
Saved
    │
    ▼
Analyze Case
```

This creates a more resilient application.

---

# 23. Get Latest Case Analysis

```text
GET /api/v1/cases/{case_id}/analysis/latest
```

Returns the latest successful case-understanding analysis.

Response:

```json
{
  "id": "...",
  "analysis_type": "case_understanding",
  "result": {},
  "created_at": "..."
}
```

---

# 24. Follow-Up Questions

```text
POST /api/v1/cases/{case_id}/follow-up-questions
```

Response:

```json
{
  "questions": [
    {
      "id": "purchase_date",
      "question": "When did you purchase the product?"
    },
    {
      "id": "preferred_resolution",
      "question": "Would you prefer a refund, replacement, or repair?"
    }
  ]
}
```

The AI should normally generate no more than 3–5 questions.

---

# 25. Follow-Up Answers

```text
POST /api/v1/cases/{case_id}/follow-up-answers
```

Request:

```json
{
  "answers": [
    {
      "question_id": "purchase_date",
      "answer": "4 July 2026"
    },
    {
      "question_id": "preferred_resolution",
      "answer": "Refund"
    }
  ]
}
```

The backend may use these answers to update appropriate structured case fields.

Original answers should remain available where necessary for traceability.

---

# 26. Evidence

Base path:

```text
/api/v1/cases/{case_id}/evidence
```

All evidence operations require:

```text
authenticated user
+
case ownership
```

---

# 27. Upload Evidence

```text
POST /api/v1/cases/{case_id}/evidence
```

Content type:

```text
multipart/form-data
```

Fields:

```text
file
evidence_type
```

Example evidence type:

```text
invoice
```

Response:

```text
201 Created
```

```json
{
  "id": "...",
  "original_filename": "invoice.pdf",
  "mime_type": "application/pdf",
  "evidence_type": "invoice",
  "processing_status": "pending",
  "created_at": "..."
}
```

---

# 28. Evidence Upload Validation

The backend must validate:

- allowed MIME type,

- allowed extension,

- file size,

- case ownership.

Never trust the filename alone to determine file type.

Allowed file formats and maximum sizes belong in `security.md`.

---

# 29. List Evidence

```text
GET /api/v1/cases/{case_id}/evidence
```

Response:

```json
{
  "items": [
    {
      "id": "...",
      "original_filename": "invoice.pdf",
      "evidence_type": "invoice",
      "processing_status": "completed",
      "created_at": "..."
    }
  ]
}
```

---

# 30. Get Evidence Metadata

```text
GET /api/v1/cases/{case_id}/evidence/{evidence_id}
```

Returns metadata and processing information.

It should not automatically return the binary file itself.

---

# 31. Access Evidence File

Use a dedicated protected endpoint.

```text
GET /api/v1/cases/{case_id}/evidence/{evidence_id}/file
```

The backend must verify ownership before serving the file.

Do not expose unrestricted local filesystem paths.

---

# 32. Process Evidence

```text
POST /api/v1/cases/{case_id}/evidence/{evidence_id}/process
```

Pipeline:

```text
File
 ↓
Text Extraction / OCR
 ↓
AI Extraction
 ↓
Structured Evidence
```

Response:

```json
{
  "evidence_id": "...",
  "processing_status": "completed",

  "extracted_data": {
    "seller": "ABC Electronics",
    "purchase_date": "2026-07-04",
    "order_number": "AX19282",
    "amount": 4999
  }
}
```

---

# 33. Delete Evidence

```text
DELETE /api/v1/cases/{case_id}/evidence/{evidence_id}
```

Response:

```text
204 No Content
```

The backend deletes:

```text
metadata
+
stored file
```

according to storage rules.

---

# 34. AI Guidance

Users can request grounded guidance for a Case.

```text
POST /api/v1/cases/{case_id}/guidance
```

Optional request:

```json
{
  "question": "What should I do next?"
}
```

If no explicit question is provided, the system may generate general next-step guidance.

---

# 35. Guidance Response

Example:

```json
{
  "answer": "Based on the available guidance, you should first preserve your purchase documentation and contact the seller through a documented communication channel...",

  "sources": [
    {
      "source_id": "...",
      "title": "Consumer Guidance",
      "reference": "...",
      "chunk_id": "..."
    }
  ],

  "created_at": "..."
}
```

Source metadata must originate from the RAG system.

Groq must not invent citations.

---

# 36. Insufficient Knowledge

If retrieval cannot find sufficient reliable context, the API should still succeed technically.

Example:

```json
{
  "answer": "The current knowledge base does not contain enough reliable information to provide guidance for this issue.",

  "sources": []
}
```

This is not a server error.

---

# 37. Complaints

Base path:

```text
/api/v1/cases/{case_id}/complaints
```

---

# 38. Generate Complaint

```text
POST /api/v1/cases/{case_id}/complaints/generate
```

The backend gathers:

```text
Case
+
Follow-Up Information
+
Relevant Evidence
+
RAG Guidance
```

and generates a draft.

Response:

```text
201 Created
```

```json
{
  "id": "...",

  "title": "Complaint regarding defective wireless headphones",

  "content": "...",

  "version": 1,

  "status": "draft",

  "generated_by_ai": true,

  "created_at": "...",
  "updated_at": "..."
}
```

---

# 39. List Complaints

```text
GET /api/v1/cases/{case_id}/complaints
```

Response:

```json
{
  "items": [
    {
      "id": "...",
      "title": "...",
      "version": 1,
      "status": "draft",
      "created_at": "..."
    }
  ]
}
```

---

# 40. Get Complaint

```text
GET /api/v1/cases/{case_id}/complaints/{complaint_id}
```

Returns the complete complaint.

---

# 41. Edit Complaint

```text
PATCH /api/v1/cases/{case_id}/complaints/{complaint_id}
```

Example:

```json
{
  "title": "Formal complaint regarding defective headphones",
  "content": "..."
}
```

The user is allowed to modify AI-generated content.

---

# 42. Finalize Complaint

```text
POST /api/v1/cases/{case_id}/complaints/{complaint_id}/finalize
```

Response:

```json
{
  "id": "...",
  "status": "finalized",
  "updated_at": "..."
}
```

Finalization does NOT automatically submit the complaint externally.

---

# 43. Timeline

```text
GET /api/v1/cases/{case_id}/timeline
```

Response:

```json
{
  "items": [
    {
      "id": "...",
      "event_type": "case_created",
      "description": "Case created",
      "created_at": "..."
    },
    {
      "id": "...",
      "event_type": "evidence_uploaded",
      "description": "Invoice uploaded",
      "created_at": "..."
    }
  ]
}
```

Default ordering:

```text
oldest → newest
```

The frontend may visually reverse this if required.

---

# 44. Timeline Creation

There should NOT normally be:

```text
POST /timeline
```

available to the frontend.

Timeline events are generated internally.

Example:

```text
POST /evidence
      │
      ▼
EvidenceService
      │
      ├── Save Evidence
      │
      └── Create Timeline Event
```

This prevents clients from creating false history.

---

# 45. Dashboard Summary

A convenience endpoint may be provided:

```text
GET /api/v1/dashboard
```

Example:

```json
{
  "total_cases": 5,
  "active_cases": 3,
  "resolved_cases": 2,

  "recent_cases": [
    {
      "id": "...",
      "title": "Defective headphones",
      "status": "preparing"
    }
  ]
}
```

This avoids requiring the frontend to make many requests simply to render the dashboard.

---

# 46. Health Endpoint

Provide:

```text
GET /api/v1/health
```

Response:

```json
{
  "status": "ok"
}
```

This endpoint should remain lightweight.

It should not call Groq on every health check.

---

# 47. AI Provider Failure

If Groq is temporarily unavailable:

```text
POST /cases/{id}/analysis
```

may return:

```text
503 Service Unavailable
```

with:

```json
{
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI analysis is temporarily unavailable. Please try again later.",
    "details": null
  }
}
```

The existing Case remains unchanged.

---

# 48. AI Rate Limit

If provider limits are reached:

```text
429 Too Many Requests
```

Example:

```json
{
  "error": {
    "code": "AI_RATE_LIMITED",
    "message": "AI processing is temporarily unavailable due to usage limits.",
    "details": null
  }
}
```

Do not expose provider-specific internal errors directly to users.

---

# 49. Validation Errors

Invalid input should fail before business logic executes.

Example:

```text
Request
  ↓
Pydantic
  ↓
Invalid
  ↓
422
```

AI calls should never occur for requests that already fail deterministic validation.

---

# 50. Resource Ownership

For nested resources:

```text
/cases/{case_id}/evidence/{evidence_id}
```

the backend must verify:

```text
Authenticated User
        │
        ▼
Owns Case?
        │
        ▼
Evidence belongs to Case?
        │
        ▼
Allow Operation
```

Never check only the evidence ID.

---

# 51. ID Handling

MongoDB ObjectIds are serialized as strings in the API.

Frontend:

```json
{
  "id": "687e..."
}
```

not:

```json
{
  "_id": {
    "$oid": "687e..."
  }
}
```

MongoDB implementation details must remain inside the backend.

---

# 52. Date Handling

All API timestamps use ISO 8601 UTC.

Example:

```text
2026-07-24T10:35:42Z
```

The frontend converts timestamps into appropriate local display formats.

---

# 53. Pagination

Collection endpoints that may grow should support pagination.

Recommended query:

```text
?page=1&page_size=20
```

Example response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 43
}
```

Maximum `page_size` should be enforced by the backend.

---

# 54. Search and Filtering

Filtering should use query parameters.

Example:

```text
GET /cases?status=resolved&category=electronics
```

Do not create endpoints such as:

```text
/getResolvedElectronicsCases
```

REST resources should remain composable.

---

# 55. API Versioning

Current version:

```text
/api/v1
```

Breaking API changes require a version change.

Example:

```text
/api/v2
```

Adding optional fields usually does not require a new API version.

---

# 56. OpenAPI

FastAPI's generated OpenAPI specification represents the implementation-level API contract.

During development:

```text
/docs
```

provides interactive Swagger documentation.

```text
/openapi.json
```

provides the machine-readable schema.

Frontend developers should be able to inspect these during development.

---

# 57. Frontend API Layer

React components should not scatter raw HTTP requests throughout the codebase.

Prefer:

```text
UI Component
     │
     ▼
Feature Hook / Service
     │
     ▼
API Client
     │
     ▼
Backend
```

Conceptual frontend structure:

```text
src/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── cases.ts
│   ├── evidence.ts
│   ├── guidance.ts
│   └── complaints.ts
```

---

# 58. Backend API Layer

Backend routes should remain thin.

```text
Router
  │
  ▼
Validation
  │
  ▼
Service
  │
  ▼
Repository / AI / RAG
```

Avoid:

```text
Router
 ├── database query
 ├── business logic
 ├── Groq call
 ├── prompt
 └── file processing
```

inside one endpoint function.

---

# 59. MVP Endpoint Summary

## Authentication

```text
POST   /auth/register
POST   /auth/login
GET    /users/me
```

## Cases

```text
POST   /cases
GET    /cases
GET    /cases/{case_id}
PATCH  /cases/{case_id}
PATCH  /cases/{case_id}/status
DELETE /cases/{case_id}
```

## AI

```text
POST /cases/{case_id}/analysis
GET  /cases/{case_id}/analysis/latest

POST /cases/{case_id}/follow-up-questions
POST /cases/{case_id}/follow-up-answers

POST /cases/{case_id}/guidance
```

## Evidence

```text
POST   /cases/{case_id}/evidence
GET    /cases/{case_id}/evidence
GET    /cases/{case_id}/evidence/{evidence_id}
GET    /cases/{case_id}/evidence/{evidence_id}/file
POST   /cases/{case_id}/evidence/{evidence_id}/process
DELETE /cases/{case_id}/evidence/{evidence_id}
```

## Complaints

```text
POST  /cases/{case_id}/complaints/generate
GET   /cases/{case_id}/complaints
GET   /cases/{case_id}/complaints/{complaint_id}
PATCH /cases/{case_id}/complaints/{complaint_id}
POST  /cases/{case_id}/complaints/{complaint_id}/finalize
```

## Timeline

```text
GET /cases/{case_id}/timeline
```

## Dashboard

```text
GET /dashboard
```

## System

```text
GET /health
```

---

# 60. MVP API Flow

A normal user journey should look approximately like:

```text
POST /auth/login
        │
        ▼
POST /cases
        │
        ▼
POST /cases/{id}/analysis
        │
        ▼
POST /cases/{id}/follow-up-questions
        │
        ▼
POST /cases/{id}/follow-up-answers
        │
        ▼
POST /cases/{id}/evidence
        │
        ▼
POST /evidence/{id}/process
        │
        ▼
POST /cases/{id}/guidance
        │
        ▼
POST /cases/{id}/complaints/generate
        │
        ▼
PATCH /complaints/{id}
        │
        ▼
POST /complaints/{id}/finalize
```

Each step should remain independently recoverable.

A failure at one stage should not erase successful previous stages.

---

# 61. API Rules for AI Coding Agents

AI coding agents must follow these rules:

1. Do not create new endpoints when an existing endpoint can support the requirement.

2. Keep all application endpoints under `/api/v1`.

3. Use REST conventions.

4. Use `snake_case` for JSON.

5. Never trust frontend-provided user ownership.

6. Never expose MongoDB-specific representations.

7. Never expose Groq API errors directly.

8. Never return API keys or internal secrets.

9. Never expose unrestricted filesystem paths.

10. Keep route handlers thin.

11. Validate requests with Pydantic.

12. Use the standard error structure.

13. Generate timeline events from backend actions.

14. AI failure must not corrupt Case state.

15. New endpoints must be documented here.

---

# 62. Contract Change Policy

When an API change is required:

```text
Requirement
    ↓
Check Existing API
    ↓
Can existing contract support it?
    │
   Yes ──► Extend safely
    │
    No
    ▼
Design Change
    ↓
Update api_contract.md
    ↓
Implement
    ↓
Update Tests
```

Breaking changes should not be introduced silently.

---

# 63. Core API Principle

The API should remain:

> **Predictable for the frontend, secure for the user, resilient to AI failures, and simple enough for six developers to understand.**

The backend owns application rules.

The frontend owns presentation.

Groq owns language generation.

MongoDB owns persistent application data.

FAISS owns vector retrieval.

These boundaries should remain explicit.
