# 🧠 Clinical Research Tracker: High-Integrity Systems Design

**The High Signal:** This is not a CRUD app. It is a **constraint-driven system** designed to guarantee data integrity under concurrency, partial failures, and distributed race conditions.

---

### ⚡ Executive Summary (60-Second Read)

* **Problem:** Clinical data corruption due to race conditions or partial writes is a multi-million dollar risk.
* **Solution:** A backend architecture where **invalid states are mathematically impossible.**
* **Primary Signals:** Atomic Transactions, Finite State Machines (FSM), Database-level Enforcement, and Deterministic Scheduling.

---

### 🏗️ Architectural Core (The "How")

| Feature | Engineering Implementation | Failure Mitigation |
| :--- | :--- | :--- |
| **Integrity** | **Database-as-Authority** | Eliminates "split-brain" states where API and DB disagree. |
| **Concurrency** | **Strict Unique Constraints** | Guarantees 1 -> 201 and 1 -> 409 results during race conditions. |
| **Atomicity** | **Single-Transaction Units** | Prevents "Zombie Participants" (orphaned records after partial failure). |
| **Logic** | **Strict FSM** | Rejects invalid transitions (e.g., MISSED -> COMPLETED) at the service layer. |
| **Time** | **UTC Normalization** | Prevents scheduling drift across distributed time zones. |

---

### 🔬 Proof of Correctness (Failure-Driven)

#### 1. The Race Condition Test
**Scenario:** Two identical POST requests hit the API at the exact same millisecond.
* **Result:** Request A: `201 Created` | Request B: `409 Conflict`.
* **Signal:** Validation happens at the edge, but **enforcement** is locked at the commit level.

#### 2. The Partial Failure (Rollback) Test
**Scenario:** A system crash or network timeout occurs after creating a Participant but *before* generating their 12 monthly visits.
* **Result:** `ROLLBACK`. Zero records are persisted.
* **Signal:** System maintains a "Clean or Nothing" state; no manual data cleanup required.

---

### 🛠️ Technical Stack & Patterns
* **Pattern:** Service-Layer Orchestration with Transactional Boundaries.
* **Logic:** Finite State Machine (Scheduled -> Completed/Missed/Cancelled).
* **Storage:** Relational DB with composite keys and check constraints.

---

### 📂 Deep Dive & Documentation
* [**Technical Design Doc**](./docs/TDD.md): Reasoning on trade-offs and opportunity costs.
* [**Architecture Decisions (ADR)**](./docs/ADR.md): Why I chose DB enforcement over application-level locks.
* [**Proof of Failure Plan**](./docs/ProofOfFailure.md): Comprehensive edge-case testing suite.

---

**One-Line Positioning:** *An engineering-first system demonstrating how to build software that remains correct even when the environment fails.*
