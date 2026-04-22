# 🧠 Clinical Research Study Tracker (v2.4 Hardened)

## 🚀 Core Objective

Build the smallest complete system that ensures data integrity by enforcing relationships, controlling workflow state transitions, preventing partial writes, validating all inputs, and demonstrating safe failure in a clean 2–3 minute demo.

---

## ⚙️ What This Project Demonstrates

This is not a feature-heavy app. It is a **systems engineering proof**.

It demonstrates:

* **Relational integrity** (DB-enforced constraints)
* **Validated API boundaries** (Zod + domain checks)
* **Atomic multi-step operations** (Prisma transactions)
* **Workflow state control** (finite state machine)
* **Failure resistance** (rollback, constraint enforcement)
* **Deterministic scheduling** (UTC-safe dates)

---

## 🔒 System Invariants

| Invariant                                | Enforcement                                 |
| ---------------------------------------- | ------------------------------------------- |
| Participant unique within study          | DB `@@unique([studyId, subjectIdentifier])` |
| No destructive parent deletion           | DB `onDelete: Restrict`                     |
| Enrollment is atomic                     | Prisma `$transaction`                       |
| No partial writes                        | Transaction rollback                        |
| Visit generation from protocol templates | Server-side logic                           |
| Malformed input rejected before DB       | Zod validation                              |
| Study-site relationship enforced         | API domain validation                       |
| DB constraint → API error                | Prisma error → HTTP 409                     |
| Visit dates timezone-stable              | UTC fixed-hour normalization                |
| Invalid transitions rejected             | `workflow.ts`                               |
| Terminal states irreversible             | FSM rules                                   |
| State updates idempotent                 | API logic                                   |
| Transaction steps visible                | API response `steps[]`                      |

---

## 🏗️ Architecture Overview

### Core Entities

* Study
* Site
* Participant
* VisitTemplate (protocol definition)
* ParticipantVisit (generated instances)
* Document (optional)
* Task (optional)

### Core Flow

1. Create Study
2. Create Site (linked to Study)
3. Define Visit Templates
4. Enroll Participant
5. Generate Visits (transactionally)
6. Update Visit Status (via state machine)
7. Prove failure safety

---

## 🧱 Tech Stack

* **Next.js (App Router)**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **Zod (validation)**
* **date-fns (date logic)**

---

## 📦 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clinical_tracker?schema=public"
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed Database

```bash
npx prisma db seed
```

### 5. Start App

```bash
npm run dev
```

---

## 🔁 Core System Components

---

### 🧾 Schema (Key Constraint)

```prisma
@@unique([studyId, subjectIdentifier])
```

Ensures participant identity is scoped **within a study**, not globally.

---

### 🔐 Delete Protection

```prisma
@relation(..., onDelete: Restrict)
```

Prevents destructive deletes of parent entities.

---

### ⚡ Atomic Enrollment (Transaction)

```ts
const result = await prisma.$transaction(async (tx) => {
  const participant = await tx.participant.create({ ... });

  const templates = await tx.visitTemplate.findMany({ ... });

  const visits = templates.map(...);

  await tx.participantVisit.createMany({ data: visits });

  return { participant };
});
```

Guarantee:

* All succeed → commit
* Any fail → rollback

---

### 🕒 UTC-Safe Date Handling

```ts
function createUTCDateWithFixedHour(baseDate, offsetDays) {
  const d = addDays(baseDate, offsetDays);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    9, 0, 0, 0
  ));
}
```

Prevents timezone drift.

---

### 🔁 State Machine (Workflow Control)

```ts
const TERMINAL_STATES = ["COMPLETED", "MISSED", "CANCELLED"];

function canTransition(current, next) {
  if (current === next) return true;
  if (TERMINAL_STATES.includes(current)) return false;

  const allowed = {
    SCHEDULED: ["COMPLETED", "MISSED", "CANCELLED"],
    COMPLETED: [],
    MISSED: [],
    CANCELLED: [],
  };

  return allowed[current].includes(next);
}
```

Guarantee:

* No invalid transitions
* Terminal states cannot be reversed

---

### 🚫 Error Mapping (DB → API)

```ts
if (error.code === "P2002") {
  return {
    status: 409,
    error: "Subject ID already exists in this study"
  };
}
```

Transforms low-level DB errors into meaningful API responses.

---

### 📊 Transaction Logging (Demo Visibility)

```ts
const steps = [];

steps.push("TRANSACTION START");

...

steps.push("PARTICIPANT CREATED");
steps.push("VISITS GENERATED");
steps.push("TRANSACTION SUCCESS");

return { result, steps };
```

Makes invisible system behavior **visible in demo**.

---

## 🔬 Demo Script (2–3 Minutes)

### 1. Happy Path

* Create study
* Create site
* Enroll participant
* Show generated visits

---

### 2. Atomicity Proof

Use:

```json
{
  "demoFailAfterParticipant": true
}
```

Show:

* transaction fails
* no participant exists
* no visits exist

---

### 3. Constraint Proof

* Attempt duplicate `subjectIdentifier`
* Show `409 Conflict`

---

### 4. State Machine Proof

* Try invalid transition:

  * COMPLETED → SCHEDULED
* Show rejection
* State unchanged

---

### 5. Validation Proof

* Send malformed payload
* Show rejection BEFORE DB write

---

### 6. Delete Protection Proof

* Attempt to delete study with participants
* Show DB rejection

---

## 📡 API Overview

| Route                    | Method   | Purpose                  |
| ------------------------ | -------- | ------------------------ |
| `/api/studies`           | GET/POST | Manage studies           |
| `/api/sites`             | GET/POST | Manage sites             |
| `/api/participants`      | POST     | Atomic enrollment        |
| `/api/visits`            | GET      | List visits              |
| `/api/visits/:id/status` | PATCH    | Controlled status update |

---

## ⚠️ Pitfalls Avoided

* ❌ Cascade deletes (data loss risk)
* ❌ Partial writes (broken state)
* ❌ Frontend business logic
* ❌ Timezone drift bugs
* ❌ Generic 500 errors for domain issues
* ❌ Feature creep over system integrity

---

## 🧠 Key Engineering Decisions

* **Restrict deletes instead of cascade** → preserves audit integrity
* **DB constraints as final authority** → safe under concurrency
* **Transactions for multi-step writes** → no inconsistent state
* **State machine for workflow** → prevents invalid lifecycle transitions
* **UTC normalization** → prevents temporal bugs
* **Error mapping** → clean API boundary

---

## ✅ What “Success” Means

You can prove (not claim):

* Enrollment is atomic
* No partial writes occur
* Duplicate participants are impossible within a study
* Invalid state transitions are blocked
* System rejects malformed input before writes
* Failed operations leave no side effects
* Data relationships are enforced at the database level

---

## 🧠 Interview Framing

> “This project is intentionally minimal. Its purpose is to demonstrate that the system enforces data integrity at the database level, executes multi-step operations atomically, controls workflow through a state machine, and fails safely under invalid conditions.”

---

## 🔥 Final Note

This is not a CRUD app.

This is a **constraint-driven system** designed to prove:

* correctness
* safety
* and engineering discipline

---
