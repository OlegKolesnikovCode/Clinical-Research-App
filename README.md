# 🧠 Clinical Research Study Tracker  
### Constraint-Driven System with Proven Correctness Under Failure

---

## 🎯 What this is

This is not a CRUD app.

This is a **constraint-driven system** designed so that:

> **invalid states are impossible by design**

The system guarantees correctness under:

- concurrency
- partial failures
- invalid input
- workflow violations
- timezone inconsistencies

---

## ⚙️ Core Guarantees

- **Atomic operations** → no partial writes  
- **Concurrency-safe uniqueness** → DB-enforced at commit time  
- **Controlled workflow (FSM)** → invalid transitions rejected  
- **Deterministic scheduling** → UTC normalized (no drift)  
- **Safe failure behavior** → rollback or rejection, never corruption  

---

## 🏗️ Architecture


Client
↓
API (validation + orchestration)
↓
Service (transactions + FSM)
↓
Database (final authority)


**Key rules:**
- All multi-step operations run in a **single transaction**
- The database is the **final authority at commit time**

---

## 🔁 Atomic Enrollment (Proof)

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB

    Client->>API: POST /api/participants
    API->>Service: validate + call service
    Service->>DB: BEGIN TRANSACTION

    Service->>DB: create participant
    Service->>DB: generate + insert visits

    alt failure
        Service->>DB: ROLLBACK
        API-->>Client: error (400 / 409)
    else success
        Service->>DB: COMMIT
        API-->>Client: 201 Created
    end
🔬 Proof of Correctness (Failure-Driven)
⚡ Concurrency Test

Two identical requests sent simultaneously:

curl -X POST http://localhost:3000/api/participants ... &
curl -X POST http://localhost:3000/api/participants ...

Result:

1 → 201 Created
1 → 409 Conflict

Why it matters:

Both pass validation
Only the database constraint resolves the race
🔁 Rollback Test

Force failure mid-transaction:

Result:

API returns error
No data persisted

Guarantee: no partial system state can exist

🔄 Workflow Control (FSM)

States:

SCHEDULED → COMPLETED | MISSED | CANCELLED

Rules:

Invalid transitions → rejected
Terminal states → irreversible
Same-state updates → no-op (idempotent)
🕒 Time Handling
All timestamps stored in UTC
Visits normalized to fixed hour (09:00 UTC)

Result:

No timezone drift
Deterministic scheduling across environments
🎬 Demo (2–3 minutes)
Create participant → success
Trigger failure → verify rollback
Duplicate request → 409 conflict
Invalid status change → rejected
Attempt delete → blocked
🧠 Engineering Signals
Database as final authority
Validation vs enforcement separation
Atomic transaction boundaries
FSM-controlled workflow
Constraint-driven design
Failure-first verification
📚 Deep Dive
Technical Design Document → /docs/TDD.md
Proof of Failure Plan → /docs/ProofOfFailure.md
Architecture Decisions → /docs/ADR.md
Schema → /docs/schema.md
📌 One-line Positioning

Constraint-driven system that guarantees correctness under concurrency, failure, and invalid input through database enforcement, atomic transactions, and controlled state transitions.
