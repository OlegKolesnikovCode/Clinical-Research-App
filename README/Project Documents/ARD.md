# 🧠 Architecture Decision Records (ADR Set)

**Project:** Clinical Research Study Tracker
**Version:** v1.1 (Hardened + Refined)
**Last Updated:** April 2026

---

# ADR-001: Database as Final Integrity Authority

**Status:** Accepted

## Context

Application-layer validation cannot guarantee correctness under concurrency. Multiple requests may pass validation simultaneously.

## Decision

The database is the **final authority** for enforcing:

* uniqueness constraints
* foreign key relationships
* delete behavior (`onDelete: Restrict`)

## Rationale

Only the database can enforce correctness at commit time under concurrent access.

## Consequences

### Positive

* prevents race-condition duplicates
* enforces referential integrity
* ensures correctness under concurrency

### Negative

* requires API-level error mapping
* schema design becomes critical early

### Constraint (NEW)

Schema migrations must preserve all integrity constraints (uniqueness, foreign keys, delete behavior).
Any migration that weakens these invariants must be treated as a **breaking change** and explicitly reviewed.

### Risk (NEW)

Accidental relaxation of constraints (e.g., removing a unique index) can introduce **silent data corruption** that is difficult to detect after the fact.

## Alternatives Considered

* API-only validation → rejected (not concurrency-safe)
* cascade deletes → rejected (data loss risk)

---

# ADR-002: Study-Scoped Participant Identity

**Status:** Accepted

## Decision

```prisma
@@unique([studyId, subjectIdentifier])
```

## Rationale

Participant identity is scoped to study, not globally.

## Behavior

* duplicate insert → DB rejection
* API maps to `409 Conflict`

## Consequences

### Positive

* correct under concurrency
* matches domain expectations

### Negative

* duplicate retries must handle conflict

## Alternatives

* global uniqueness → rejected
* silent idempotent create → rejected

---

# ADR-003: Atomic Enrollment Transaction

**Status:** Accepted

## Context

Enrollment consists of multiple dependent steps:

* create participant
* generate visits
* insert visit records

## Decision

Use a single transaction (`prisma.$transaction`) for enrollment.

## Rationale

Prevent partial writes and inconsistent system state.

## Consequences

### Positive

* guarantees all-or-nothing behavior
* prevents zombie data

### Negative

* increased complexity in route logic

## Alternatives

* multi-step API flow → rejected

---

# ADR-004: Template-to-Instance Visit Generation

**Status:** Accepted

## Decision

Separate:

* VisitTemplate (protocol plan)
* ParticipantVisit (execution instance)

## Rationale

Separates **definition vs execution**, enabling deterministic generation.

## Consequences

### Positive

* avoids duplication
* supports scalable scheduling logic

### Negative

* requires transformation during enrollment

## Alternatives

* direct participant visit creation → rejected

---

# ADR-005: Centralized Workflow State Machine

**Status:** Accepted

## Decision

Use a centralized FSM for visit status transitions.

## States

* SCHEDULED
* COMPLETED
* MISSED
* CANCELLED

## Terminal States

* COMPLETED
* MISSED
* CANCELLED

## Rules

* terminal states cannot transition
* invalid transitions are rejected
* same-state update = no-op (idempotent)

## Rationale

Prevents invalid workflow mutations and enforces lifecycle correctness.

## Consequences

### Positive

* strong workflow integrity
* predictable state transitions

### Negative

* FSM must be updated when adding new states

### Observation (NEW)

The FSM is implemented as a **pure function**, independent of the database and framework.
This makes transition logic directly **unit testable** without requiring integration tests.

## Alternatives

* free-form updates → rejected
* frontend-only enforcement → rejected

---

# ADR-006: UTC Fixed-Hour Scheduling

**Status:** Accepted

## Decision

* store all timestamps in UTC
* normalize generated visits to fixed hour (09:00 UTC)

## Rationale

Prevents timezone drift and ensures deterministic scheduling.

## Consequences

### Positive

* consistent scheduling across environments
* eliminates day-boundary drift

### Negative

* requires explicit normalization logic

## Alternatives

* raw `Date()` usage → rejected

---

# ADR-007: Constraint Violations Mapped to Domain Errors

**Status:** Accepted

## Decision

Map database constraint errors to meaningful HTTP responses.

Example:

* Prisma `P2002` → HTTP `409 Conflict`

## Rationale

Separates:

* DB as truth enforcement
* API as domain communication layer

## Consequences

### Positive

* clear error semantics
* improved client handling

### Negative

* requires error-mapping layer

## Alternatives

* return generic 500 → rejected

---

# ADR-008: Duplicate Enrollment Returns Conflict

**Status:** Accepted

## Decision

Duplicate participant creation returns `409 Conflict`.

## Rationale

Explicit failure is safer than silent success.

## Consequences

### Positive

* avoids ambiguity in system state
* improves audit clarity

### Negative

* clients must handle retry conflicts

## Alternatives

* silent idempotent create → rejected
* idempotency keys → out of scope

---

# 📌 Summary

This ADR set defines the system’s core architectural stance:

* **Integrity-first design**
* **Database-enforced correctness**
* **Atomic multi-step operations**
* **Deterministic time handling**
* **Explicit workflow control**
* **Failure is visible and safe**

This is not a CRUD system.
It is a **constraint-driven system designed for correctness under failure and concurrency**.

---
