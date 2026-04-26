# 🧠 Clinical Research Study Tracker  
### Constraint-Driven System with Proven Correctness Under Failure

---

## 🔗 What this project demonstrates

This is not a CRUD app.

This is a **constraint-driven system** designed to guarantee:

- atomic multi-step operations (no partial writes)
- correctness under concurrency (DB-enforced uniqueness)
- controlled workflow transitions (FSM)
- deterministic scheduling (UTC normalization)
- safe failure behavior (rollback, rejection, no corruption)

> The system is validated by how it behaves under failure, not success.

---

## 🎯 Core Idea

A clinical research workflow system where **invalid states are impossible by design**.

Every operation passes through:

- explicit constraints
- atomic transactions
- state-controlled transitions

Result: the system remains correct under concurrency, bad input, and forced failure.

---

## ⚙️ Architecture


UI (read-only visibility)
↓
API (validation + orchestration)
↓
Service Layer (transactions, FSM, invariants)
↓
Database (final authority)


### Key Principle

**The database is the final authority under concurrency.**

---

## 🔁 Sequence Diagram (Atomic Enrollment)


Client
│
│ POST /api/participants
▼
API Layer
│ validate input (Zod)
▼
Service Layer
│ BEGIN TRANSACTION
│
├─ check study + site
├─ create participant
├─ fetch visit templates
├─ generate visits (UTC normalized)
├─ insert participant visits
│
├─ IF failure → ROLLBACK
│
└─ ELSE → COMMIT
▼
Database
│ enforce constraints (uniqueness, FK)
▼
Response (201 or 409 / 400)


### Guarantee

- no partial writes  
- DB resolves concurrency conflicts at commit time  

---

## 🧩 Core Guarantees (Invariants)

| Guarantee | Enforcement |
|----------|------------|
| No duplicate participants | DB `@@unique([studyId, subjectIdentifier])` |
| No partial enrollment | Transaction (`$transaction`) |
| Correct under concurrency | DB constraint at commit |
| Valid workflow only | FSM |
| Terminal states irreversible | FSM rules |
| No silent data loss | `onDelete: Restrict` |
| Valid input only | Zod validation |
| Time consistency | UTC fixed-hour normalization |

---

## 🔍 Invariant → Enforcement → Test Traceability

| Invariant | Enforcement Layer | Test |
|----------|------------------|------|
| Atomic enrollment | Transaction | Forced failure → rollback |
| Uniqueness | DB constraint | Duplicate insert → 409 |
| Concurrency safety | DB commit-time check | Parallel requests → 1 success |
| FSM integrity | Service layer | Invalid transition → 400 |
| Terminal states | FSM rules | Reversal attempt blocked |
| Delete protection | DB FK (`Restrict`) | Delete parent → rejected |
| Input validation | API (Zod) | Invalid payload → 400 |
| Time stability | UTC normalization | Edge scheduling → no drift |

---

## 🔥 Proof of Correctness (Failure-Driven Testing)

This system includes **intentional failure testing**.

> It is proven by how it fails safely.

---

## ⚡ Concurrency Test (Reproducible)

### Goal

Prove DB is final authority under race conditions.

### Method

Run two requests simultaneously:

```bash
curl -X POST http://localhost:3000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"studyId":"1","siteId":"1","subjectIdentifier":"RACE-001"}' &

curl -X POST http://localhost:3000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"studyId":"1","siteId":"1","subjectIdentifier":"RACE-001"}'
Expected Result
one request → 201 Created
one request → 409 Conflict
Key Insight
both requests pass API validation
only DB constraint resolves the conflict
🔁 Critical Flow: Atomic Enrollment
Validate study + site
Create participant
Fetch templates
Generate visits
Insert visits
Commit OR rollback
Guarantee
all-or-nothing execution
no intermediate state
🔄 Workflow Control (FSM)
SCHEDULED → COMPLETED
           → MISSED
           → CANCELLED

Rules:

invalid transitions rejected
terminal states locked
same-state updates = no-op
🕒 Time Handling (Deterministic)
stored in UTC
normalized to fixed hour (09:00 UTC)

Result:

no timezone drift
consistent across environments
🗄️ Data Model
Study
 ├── Sites
 ├── Participants (unique per study)
 │     └── ParticipantVisits
 ├── VisitTemplates
🧪 Running the Project
npm install
npx prisma migrate dev
npm run dev

Optional:

npx prisma studio
🎬 Demo (2–3 minutes)
Create participant (success)
Trigger failure → rollback
Duplicate request → 409
Invalid transition → rejected
Delete attempt → blocked
🚫 What this project intentionally excludes
authentication
analytics dashboards
file storage
microservices
Why

To focus entirely on correctness and integrity

🧠 Engineering Signals
DB as final authority
validation vs enforcement separation
atomic transactions
FSM-controlled workflow
explicit failure handling
constraint-driven design
📌 One-line Positioning

Constraint-driven system that guarantees correctness under concurrency, failure, and invalid input through DB enforcement, atomic transactions, and controlled state transitions.
