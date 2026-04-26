# 🏆 DEMO: https://clinical-research-i2p3v8tk4-olegkolesnikovcodes-projects.vercel.app/

# 🧠 Clinical Research Tracker: Correctness Under Failure

**The Objective:** A constraint-driven system engineered to preserve integrity-critical data. This project moves away from "trusting the code" and moves toward **enforceable invariants** through database constraints, atomic transactions, and FSM-controlled workflows.

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
