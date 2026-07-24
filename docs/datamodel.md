# Data Model

## 1. Purpose

This document defines the application's persistent data model.

It specifies:

- MongoDB collections,

- document structures,

- relationships,

- ownership rules,

- indexes,

- validation expectations,

- and data lifecycle rules.

Product behavior belongs in `PRD.md`.

System structure belongs in `architecture.md`.

Technology choices belong in `techstack.md`.

AI-specific behavior belongs in `ai_system.md`.

---

# 2. Database

The primary application database is:

```text
MongoDB
```

MongoDB stores structured application data.

It is the authoritative source for:

- users,

- grievance cases,

- evidence metadata,

- AI analyses,

- generated complaints,

- timeline events,

- knowledge-source metadata.

Binary files are NOT stored directly in MongoDB.

Vector embeddings are NOT stored directly in normal application documents.

---

# 3. Core Data Model

The application revolves around a **Case**.

```text
                    User
                      │
                      │ owns
                      ▼
                    Case
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
     Evidence      Timeline      AI Analysis
                                      │
                                      ▼
                                  Complaint
```

Knowledge-base data exists separately.

```text
Knowledge Source
       │
       ▼
Knowledge Chunks
       │
       ▼
FAISS Vectors
```

---

# 4. Collections

The MVP uses the following collections:

| Collection          | Purpose                    |
| ------------------- | -------------------------- |
| `users`             | User accounts              |
| `cases`             | Grievance cases            |
| `evidence`          | Uploaded evidence metadata |
| `timeline_events`   | Case activity history      |
| `ai_analyses`       | Structured AI results      |
| `complaints`        | Generated complaint drafts |
| `knowledge_sources` | Knowledge-base documents   |
| `knowledge_chunks`  | Searchable document chunks |

Avoid creating additional collections unless there is a clear requirement.

---

# 5. ID Strategy

MongoDB `ObjectId` will be used as the internal identifier.

Example:

```json
{
  "_id": "ObjectId(...)"
}
```

API responses should expose IDs as strings.

Example:

```json
{
  "id": "6878fa..."
}
```

Database-specific `ObjectId` representations should not leak into frontend logic.

---

# 6. Users Collection

Collection:

```text
users
```

Represents registered users.

Example:

```json
{
  "_id": "ObjectId",

  "name": "Example User",
  "email": "user@example.com",

  "password_hash": "...",

  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Required fields:

| Field           | Type     |
| --------------- | -------- |
| `_id`           | ObjectId |
| `name`          | string   |
| `email`         | string   |
| `password_hash` | string   |
| `created_at`    | datetime |
| `updated_at`    | datetime |

---

# 7. User Constraints

Email addresses must be unique.

Create a unique index:

```text
users.email
```

Passwords must never be stored directly.

Allowed:

```text
password_hash
```

Forbidden:

```text
password
plain_password
```

---

# 8. Cases Collection

Collection:

```text
cases
```

A Case represents one consumer grievance.

Example:

```json
{
  "_id": "ObjectId",

  "user_id": "ObjectId",

  "title": "Defective Smartwatch",

  "description": "The smartwatch stopped charging after two weeks...",

  "category": "electronics",

  "issue_type": "defective_product",

  "desired_resolution": "replacement",

  "status": "preparing",

  "created_at": "datetime",

  "updated_at": "datetime"
}
```

---

# 9. Case Ownership

Every case must belong to exactly one user.

```text
User
 │
 │ 1
 │
 ▼
Case
 *
```

The relationship is represented using:

```text
cases.user_id
```

Every case operation must verify:

```text
case.user_id == authenticated_user.id
```

Never trust a user-supplied `user_id`.

The backend obtains the user identity from authentication.

---

# 10. Case Status

Allowed MVP statuses:

```text
draft
preparing
complaint_generated
submitted
awaiting_response
resolved
closed
```

Typical flow:

```text
draft
  ↓
preparing
  ↓
complaint_generated
  ↓
submitted
  ↓
awaiting_response
  ↓
resolved
```

Not every case must follow every status.

For example:

```text
draft → closed
```

is valid.

---

# 11. Case Category

Categories should use normalized internal values.

Example:

```text
electronics
ecommerce
telecom
banking
subscription
delivery
general_service
other
```

The frontend may display:

```text
Electronics
E-Commerce
Banking & Payments
```

but the database should store stable normalized values.

---

# 12. Issue Type

Issue types describe the actual grievance.

Examples:

```text
defective_product
refund_not_received
service_not_provided
incorrect_charge
warranty_dispute
delivery_issue
subscription_issue
misleading_information
other
```

The list can evolve.

Do not make database structure dependent on a fixed issue taxonomy.

---

# 13. Desired Resolution

Example values:

```text
refund
replacement
repair
service_completion
charge_reversal
explanation
compensation
other
unknown
```

This field may initially be:

```text
unknown
```

and later be updated after AI follow-up questions.

---

# 14. Evidence Collection

Collection:

```text
evidence
```

Evidence represents a file attached to a case.

Examples:

- invoices,

- screenshots,

- photographs,

- warranty documents,

- emails,

- receipts.

Example:

```json
{
  "_id": "ObjectId",

  "case_id": "ObjectId",
  "user_id": "ObjectId",

  "original_filename": "invoice.pdf",

  "storage_key": "user123/case456/invoice.pdf",

  "mime_type": "application/pdf",

  "size_bytes": 245120,

  "evidence_type": "invoice",

  "processing_status": "completed",

  "extracted_text": "...",

  "created_at": "datetime"
}
```

---

# 15. Why Evidence Is Separate

Do not embed uploaded evidence documents inside the Case document.

Instead:

```text
Case
 │
 │ case_id
 ▼
Evidence
```

Reasons:

- cases may contain multiple files,

- evidence can become large,

- document processing has its own lifecycle,

- evidence may need independent deletion,

- keeps Case documents small.

---

# 16. Evidence Types

Initial evidence types:

```text
invoice
receipt
screenshot
product_photo
email
warranty
order_confirmation
company_response
other
```

The system should tolerate:

```text
other
```

rather than rejecting unknown document categories.

---

# 17. Evidence Processing Status

Document processing can take time or fail.

Use:

```text
pending
processing
completed
failed
```

Example:

```text
Upload
  ↓
pending
  ↓
processing
  ↓
completed
```

or:

```text
processing
   ↓
 failed
```

Failure must not delete the uploaded evidence record.

---

# 18. Extracted Evidence Information

Structured information discovered from evidence may be stored under:

```json
{
  "extracted_data": {
    "seller": "Example Store",
    "product": "Smartwatch",
    "purchase_date": "2026-07-01",
    "order_number": "ORD12345",
    "amount": 4999
  }
}
```

Because different document types contain different information, `extracted_data` is intentionally flexible.

The original extracted text should remain available for reprocessing.

---

# 19. Timeline Events Collection

Collection:

```text
timeline_events
```

Timeline events represent important actions during a case.

Example:

```json
{
  "_id": "ObjectId",

  "case_id": "ObjectId",
  "user_id": "ObjectId",

  "event_type": "evidence_uploaded",

  "description": "Invoice uploaded",

  "metadata": {
    "evidence_id": "ObjectId"
  },

  "created_at": "datetime"
}
```

---

# 20. Timeline Event Types

Examples:

```text
case_created
case_updated
evidence_uploaded
evidence_deleted
analysis_completed
guidance_generated
complaint_generated
complaint_updated
status_changed
case_resolved
```

The timeline is primarily generated by backend actions.

The frontend should not independently invent timeline events.

---

# 21. AI Analyses Collection

Collection:

```text
ai_analyses
```

Stores structured results produced by AI operations.

Example:

```json
{
  "_id": "ObjectId",

  "case_id": "ObjectId",

  "analysis_type": "case_understanding",

  "model": "configured-model",

  "result": {
    "summary": "Customer received a defective smartwatch...",
    "category": "electronics",
    "issue_type": "defective_product",
    "desired_resolution": "unknown",
    "missing_information": [
      "purchase_date",
      "preferred_resolution"
    ]
  },

  "created_at": "datetime"
}
```

---

# 22. Why Store AI Analyses?

AI results should not simply disappear after being displayed.

Storing them provides:

- reproducibility,

- debugging,

- history,

- comparison after prompt changes,

- reduced unnecessary API calls.

However, AI analysis is not automatically considered authoritative.

---

# 23. Analysis Types

Possible values:

```text
case_understanding
follow_up_questions
evidence_analysis
case_summary
rag_guidance
response_analysis
```

More types may be introduced as AI functionality expands.

---

# 24. AI Output Ownership

AI analysis belongs to a case.

```text
Case
 │
 │ 1
 │
 ▼
AI Analysis
 *
```

A case may have multiple analyses over time.

Do not overwrite old analyses unnecessarily.

---

# 25. Model Metadata

Store enough metadata to understand how an analysis was produced.

Recommended:

```json
{
  "provider": "groq",
  "model": "configured-model",
  "prompt_version": "case-analysis-v1"
}
```

Do NOT store:

- API keys,

- authentication tokens,

- internal secrets.

---

# 26. Complaints Collection

Collection:

```text
complaints
```

Stores AI-generated complaint drafts.

Example:

```json
{
  "_id": "ObjectId",

  "case_id": "ObjectId",
  "user_id": "ObjectId",

  "title": "Complaint regarding defective smartwatch",

  "content": "...",

  "version": 1,

  "status": "draft",

  "generated_by_ai": true,

  "created_at": "datetime",

  "updated_at": "datetime"
}
```

---

# 27. Complaint Editing

Users may edit AI-generated complaints.

The stored complaint therefore becomes user-controlled content after generation.

Example:

```text
AI Generation
      ↓
Draft v1
      ↓
User Edits
      ↓
Draft v2
```

For the MVP, full document version history is optional.

At minimum, store the latest version.

---

# 28. Complaint Status

Possible values:

```text
draft
finalized
submitted
```

This status is separate from overall Case status.

---

# 29. Knowledge Sources Collection

Collection:

```text
knowledge_sources
```

Represents trusted documents used by RAG.

Example:

```json
{
  "_id": "ObjectId",

  "title": "Consumer Grievance Guidance",

  "source_type": "official_document",

  "source_reference": "...",

  "authority": "Relevant Authority",

  "status": "active",

  "ingested_at": "datetime",

  "updated_at": "datetime"
}
```

Only curated sources should enter the production knowledge base.

---

# 30. Knowledge Source Status

Possible values:

```text
active
inactive
needs_review
```

If information becomes outdated, it can be disabled without immediately deleting historical metadata.

---

# 31. Knowledge Chunks Collection

Collection:

```text
knowledge_chunks
```

Represents pieces of knowledge documents used for retrieval.

Example:

```json
{
  "_id": "ObjectId",

  "source_id": "ObjectId",

  "chunk_index": 12,

  "text": "...",

  "metadata": {
    "section": "Refunds",
    "page": 4
  },

  "vector_id": 1842,

  "created_at": "datetime"
}
```

---

# 32. FAISS Relationship

Embeddings are stored in FAISS.

Metadata and original text remain in MongoDB.

```text
MongoDB

KnowledgeChunk
_id: ABC
vector_id: 1842
text: "..."

        │
        │ vector_id
        ▼

FAISS

Vector 1842
[0.18, -0.04, ...]
```

Retrieval:

```text
Query
  ↓
Embedding
  ↓
FAISS Search
  ↓
Vector IDs
  ↓
MongoDB
  ↓
Knowledge Chunks
```

---

# 33. Do Not Mix Knowledge and Evidence

These represent fundamentally different information.

```text
Knowledge Base
│
├── official guidance
├── procedures
└── trusted reference material


User Evidence
│
├── invoices
├── screenshots
├── emails
└── photographs
```

Knowledge documents can be retrieved across users.

Evidence belongs to one user's case.

User evidence must NEVER accidentally become part of the shared RAG knowledge base.

---

# 34. Relationships Overview

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Case          Evidence
 │
 ├───────────────┐
 │               │
 ▼               ▼
Timeline      AI Analysis
 │
 ▼
Complaint


Knowledge Source
       │
       ▼
Knowledge Chunk
       │
       ▼
FAISS Vector
```

More precisely:

```text
User 1 ─────── * Case

Case 1 ─────── * Evidence

Case 1 ─────── * TimelineEvent

Case 1 ─────── * AIAnalysis

Case 1 ─────── * Complaint

KnowledgeSource 1 ─────── * KnowledgeChunk

KnowledgeChunk 1 ─────── 1 FAISS Vector
```

---

# 35. Embedding vs Referencing

Use referencing when:

- child records can grow independently,

- records have their own lifecycle,

- records may become large,

- records are queried independently.

Therefore:

```text
Case → Evidence
Case → Timeline
Case → AI Analysis
```

use references.

Use embedded objects for small structures that belong entirely to their parent.

Example:

```json
{
  "extracted_data": {
    "seller": "...",
    "order_number": "...",
    "amount": 4999
  }
}
```

Do not automatically create a collection for every nested object.

---

# 36. Required Indexes

At minimum:

## Users

```text
email UNIQUE
```

## Cases

```text
user_id
user_id + status
created_at
```

## Evidence

```text
case_id
user_id
```

## Timeline

```text
case_id + created_at
```

## AI Analyses

```text
case_id + analysis_type
```

## Complaints

```text
case_id
```

## Knowledge Chunks

```text
source_id
vector_id UNIQUE
```

Indexes should be added based on actual query patterns rather than indexing every field.

---

# 37. Timestamps

Store timestamps in UTC.

Use:

```text
created_at
updated_at
```

where appropriate.

The frontend is responsible for presenting timestamps in the user's local timezone.

Do not store formatted strings such as:

```text
"24 July 2026, 8:30 PM"
```

Store actual datetime values.

---

# 38. Deletion Rules

Deleting a Case requires handling associated data.

Conceptually:

```text
Delete Case
   │
   ├── Evidence metadata
   ├── Evidence files
   ├── Timeline events
   ├── AI analyses
   └── Complaints
```

Deletion logic must live in the backend.

Do not rely on the frontend to perform multiple independent deletion requests.

---

# 39. User Deletion

Deleting a user requires deleting or anonymizing all associated private information.

```text
User
 │
 ▼
Cases
 │
 ├── Evidence
 ├── Files
 ├── Timeline
 ├── AI Analyses
 └── Complaints
```

Exact account-deletion policy can be expanded later.

---

# 40. Validation

MongoDB's flexible schema does NOT mean application data should be unvalidated.

All incoming application data must pass through Pydantic models.

```text
Request
   ↓
Pydantic Validation
   ↓
Service Layer
   ↓
Repository
   ↓
MongoDB
```

AI-generated data follows the same rule.

```text
Groq
  ↓
Raw Output
  ↓
Parse
  ↓
Pydantic Validation
  ↓
Application
```

Never directly insert raw LLM output into MongoDB.

---

# 41. Sensitive Data

Potentially sensitive information includes:

- names,

- emails,

- invoices,

- order numbers,

- addresses,

- screenshots,

- correspondence,

- uploaded documents.

The application should collect only information required for grievance assistance.

Never store:

```text
passwords in plaintext
API keys
JWT secrets
Groq credentials
unnecessary payment credentials
```

Detailed rules belong in:

```text
security.md
```

---

# 42. Schema Evolution

MongoDB documents may evolve over time.

New fields should generally be:

```text
optional
+
backward compatible
```

Example:

Old:

```json
{
  "title": "...",
  "category": "electronics"
}
```

New:

```json
{
  "title": "...",
  "category": "electronics",
  "priority": "medium"
}
```

Existing documents should continue functioning.

Large schema changes should use explicit migration scripts.

---

# 43. Repository Layer

Application services should not directly depend on MongoDB queries.

Use:

```text
API Route
   ↓
Service
   ↓
Repository
   ↓
MongoDB
```

Example:

```text
CaseRouter
   ↓
CaseService
   ↓
CaseRepository
   ↓
MongoDB
```

This keeps database logic centralized and easier to test.

---

# 44. Data Ownership Rules

These rules are mandatory.

### User owns Cases

A user may access only their own cases.

### Case owns Evidence

Evidence cannot exist without a valid Case.

### Case owns Timeline

Timeline events belong to one Case.

### Case owns AI Analyses

AI analyses must reference their Case.

### Case owns Complaints

Generated complaints must reference their Case.

### Knowledge Base is Shared

Approved knowledge sources are application-level resources and are not owned by individual users.

---

# 45. Data That Must NOT Be Duplicated

Avoid storing the same authoritative information in multiple places.

For example, do not maintain:

```text
Case.evidence[]
```

containing full evidence documents while also maintaining:

```text
evidence collection
```

The Evidence collection is authoritative.

Likewise, do not copy entire knowledge documents into every AI analysis.

Store references where practical.

---

# 46. MVP Data Scope

For the MVP, prioritize:

```text
users
   ↓
cases
   ↓
evidence
   ↓
ai_analyses
   ↓
complaints
   ↓
timeline_events
```

Then implement:

```text
knowledge_sources
       ↓
knowledge_chunks
       ↓
FAISS
```

Do not create advanced analytics collections, notification systems, audit databases, agent memory, or other speculative structures until required.

---

# 47. Source of Truth

| Information         | Source              |
| ------------------- | ------------------- |
| User identity       | `users`             |
| Grievance state     | `cases`             |
| Evidence metadata   | `evidence`          |
| Evidence binary     | File storage        |
| Case history        | `timeline_events`   |
| AI results          | `ai_analyses`       |
| Complaint drafts    | `complaints`        |
| Knowledge documents | `knowledge_sources` |
| Retrieval text      | `knowledge_chunks`  |
| Embeddings          | FAISS               |

MongoDB remains the primary application database.

FAISS is a retrieval index, not an application database.

---

# 48. Data Model Principle

The data model should remain:

> **Simple enough to understand, structured enough to trust, and flexible enough to evolve with the AI system.**

Do not use MongoDB's flexibility as an excuse for inconsistent documents.

Every important application structure must have a corresponding validated Pydantic model.
