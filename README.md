# 🧠 Clinical Research Tracker: Correctness Under Failure

**The High Signal:** A backend system engineered to maintain absolute data integrity under concurrency, partial failure, and invalid input. This project moves enforcement from the volatile application layer to the **immutable database layer.**

---

### ⚡ System Guarantees
* **Atomic Operations:** All-or-nothing writes via single-transaction boundaries.
* **Deterministic Concurrency:** Race conditions resolved by DB-level unique constraints.
* **Workflow Integrity:** Finite State Machine (FSM) rejects invalid state transitions.
* **Temporal Accuracy:** Strict UTC normalization eliminates timezone drift.

---

### 🏗️ Engineering Enforcement Layer

| Concern | Mechanism | Engineering Result |
| :--- | :--- | :--- |
| **Integrity** | Foreign Keys & Unique Constraints | Prevents orphaned visits or duplicate enrollments. |
| **Concurrency** | Composite Unique Indexes | Forces a deterministic "Winner/Loser" outcome in race conditions. |
| **Atomicity** | ACID Transactions | Guarantees zero "Zombie" records on partial system failure. |
| **Workflow** | Service-Layer FSM | Rejects logical violations (e.g., `MISSED` -> `COMPLETED`). |
| **Time** | UTC Normalization | Consistent scheduling across distributed environments. |

---

### 🔬 Failure-Driven Proofs (The Evidence)

#### 1. Concurrency: The Race Condition Test
**Scenario:** Two identical POST requests hit the API simultaneously for the same `study_id` and `participant_email`.
* **Observed Result:** * Thread A: `201 Created`
    * Thread B: `409 Conflict` (Error: *Unique violation*)
* **The Proof:** Both threads passed application-level validation. Only the **Database Constraint** prevented the duplicate entry.

#### 2. Atomicity: The "Kill Switch" Test
**Scenario:** A `throw new Error()` is triggered after the Participant record is created but *before* the 12 Visit records are generated.
* **Observed Result:** `500 Internal Server Error`.
* **The Proof:** Querying the DB shows **0 records**. The `ROLLBACK` prevented a "Partial Participant" (a record with no scheduled visits).

---

### 🛠️ Implementation Detail: The "Source of Truth"

**Schema-Level Enforcement:**
```sql
-- Example: Preventing double-enrollment and invalid status transitions
CREATE TABLE participants (
    id UUID PRIMARY KEY,
    study_id UUID REFERENCES studies(id),
    email TEXT NOT NULL,
    status TEXT CHECK (status IN ('ENROLLED', 'WITHDRAWN', 'COMPLETED')),
    UNIQUE(study_id, email) -- The Concurrency Guard
);
