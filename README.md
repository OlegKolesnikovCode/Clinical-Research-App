# 🧠 Clinical Research Tracker: Correctness Under Failure

**The High Signal:** A constraint-driven system engineered to preserve integrity-critical data. This project moves away from "trusting the code" and moves toward **enforceable invariants** through database constraints, atomic transactions, and FSM-controlled workflows.

---

### ⚡ System Guarantees
* **Atomic Enrollment:** Participant creation and visit generation commit or rollback as a single unit.
* **Concurrency-Safe Identity:** Duplicate participants are rejected at the DB level, preventing race-condition duplicates.
* **Workflow Integrity:** A centralized Finite State Machine (FSM) rejects invalid visit transitions.
* **Temporal Stability:** UTC fixed-hour normalization prevents timezone drift and scheduling errors.
* **Safe Failure:** All errors (validation or constraint violations) result in a clean state with zero "zombie" records.

---

### 🏗️ Engineering Enforcement Layer

| Concern | Mechanism | Engineering Result |
| :--- | :--- | :--- |
| **Integrity** | Foreign Keys + `onDelete: Restrict` | Prevents orphaned records and silent destructive deletes. |
| **Concurrency** | `@@unique([studyId, subjectId])` | Forces deterministic Success/Conflict behavior. |
| **Atomicity** | Prisma `$transaction` | Prevents partial enrollment where visits aren't generated. |
| **Workflow** | Centralized FSM | Rejects invalid lifecycle transitions (e.g., Scheduled -> Completed). |
| **Time** | UTC Normalization | Keeps visit dates stable across distributed environments. |

---

### 🔬 Failure-Driven Proofs

#### 1. Duplicate Enrollment (Race Condition)
**Scenario:** Two requests attempt to enroll the same `subjectIdentifier` in the same study simultaneously.
* **Observed Result:** One request returns `201`, the duplicate returns `409 Conflict`.
* **The Proof:** The database uniqueness constraint acts as the final gatekeeper, ensuring application-level race conditions cannot corrupt the data.

#### 2. Atomic Rollback (Partial Failure)
**Scenario:** A forced failure occurs after participant creation but *before* visit generation completes.
* **Observed Result:** Transaction rolls back; API returns an error.
* **The Proof:** Querying the DB shows **zero records**. No "Partial Participant" exists, eliminating the need for manual data cleanup.

---

### 🛠️ Source-of-Truth Constraint (Prisma)

```prisma
model Participant {
  id                String   @id @default(cuid())
  studyId           String
  subjectIdentifier String
  // ... other fields
  
  // The Concurrency Guard:
  @@unique([studyId, subjectIdentifier])
  
  // The Integrity Guard:
  study Study @relation(fields: [studyId], references: [id], onDelete: Restrict)
}
🎯 Core Competencies Demonstrated
Defensive Schema Design: Utilizing Prisma attributes to enforce business logic at the data layer.

Transactional Rigor: Using ACID transactions to handle complex, multi-step operations.

Clinical Domain Awareness: Solving for "uniqueness" and "time-drift," which are high-stakes issues in research data.

One-Line Positioning: A clinical workflow system where correctness is enforced by constraints and transactions—not by trusting application code alone.


### Why this version lands:
1. **Prisma Specifics:** Using `@@unique` and `onDelete: Restrict` shows you know how to use your tools to their full potential.
2. **Clarity:** It replaces general "DB constraints" with your actual implementation, which is much more credible to a Technical Lead.
3. **Scannability:** The bold headers and table allow a hiring manager to see your "Engineering Enforcement Layer" in about 5 seconds.
