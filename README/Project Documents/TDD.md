# 🧠 Technical Design Document (v1.5 Hardened)

**Project Name:** Clinical Research Study Tracker
**Author:** Oleg Kolesnikov
**Status:** Hardened + Refined (Interview-Grade Complete)
**Last Updated:** April 2026

---

# 1. Executive Summary

A full-stack systems case study modeling clinical research workflows.

This system prioritizes:

* relational data integrity
* transactional correctness
* workflow control
* failure resistance
* deterministic scheduling

over feature breadth.

### Core Objective

Build the smallest complete system that ensures data integrity by enforcing relationships, controlling workflow transitions, preventing partial writes, validating inputs, and proving safe failure.

---

# 2. Problem Statement

Clinical systems frequently fail due to:

* duplicate participant identities (especially under concurrency)
* inconsistent scheduling from timezone drift
* invalid workflow transitions
* partial writes ("zombie data")
* silent data loss via destructive deletes

### Solution

A constraint-driven system that enforces:

* DB-level identity guarantees
* API-level validation
* atomic multi-step operations
* deterministic scheduling
* centralized workflow rules
* safe rejection of invalid operations

---

# 3. Design Philosophy

This system is defined by **invariants, not features**.

### Principles

1. Database is the **final authority**
2. API validation provides **early feedback, not final correctness**
3. Multi-step operations must be **atomic**
4. Workflow is **state-controlled**
5. Failure must be **safe and observable**
6. Frontend is a **visibility layer only**

---

# 4. System Invariants (Hardened Contract)

| Invariant                                                      | Enforcement                                 |
| -------------------------------------------------------------- | ------------------------------------------- |
| Participant unique within study                                | DB `@@unique([studyId, subjectIdentifier])` |
| Concurrency-safe uniqueness                                    | DB constraint (commit-time enforcement)     |
| No destructive parent deletion in integrity-critical relations | `onDelete: Restrict`                        |
| Enrollment is atomic                                           | Prisma `$transaction`                       |
| No partial writes                                              | rollback                                    |
| Visits derived from templates                                  | server logic                                |
| Input shape validated before DB                                | Zod                                         |
| Domain relationships validated                                 | API logic                                   |
| DB constraint violations mapped to domain errors               | Prisma → HTTP 409                           |
| Visit dates timezone-stable                                    | UTC fixed-hour normalization                |
| Invalid transitions rejected                                   | FSM                                         |
| Terminal states irreversible                                   | FSM                                         |
| Status updates idempotent                                      | API logic                                   |
| Transaction behavior observable                                | `steps[]` response                          |

---

# 5. Scope

## ✅ In Scope

* Studies, Sites, Participants
* Visit Templates
* Participant Visits
* Atomic enrollment
* FSM workflow
* Validation (Zod)
* Transaction logging
* Failure proof

## ⚠️ Optional

* Documents (metadata only)
* Tasks

## ❌ Out of Scope

* file storage systems
* full RBAC
* analytics dashboards
* billing / IRB / eCRF

---

# 6. Functional Requirements

---

## 6.1 Enrollment Engine (Atomic + Concurrency-Safe)

Steps:

1. Validate study exists
2. Validate site exists
3. Validate site belongs to study
4. Create participant
5. Fetch templates
6. Generate visits
7. Insert visits
8. Commit OR rollback

### Guarantees

* No partial success possible
* Concurrent duplicate enrollment attempts cannot create duplicates

### Concurrency Model (NEW)

* API validation may allow simultaneous requests
* DB unique constraint is the **final gatekeeper**
* If two requests race:

  * one succeeds
  * one fails at commit with constraint violation

### Behavior

* DB constraint failure → mapped to **409 Conflict**
* No silent deduplication

---

## 6.2 Idempotency Model (NEW)

### Supported

* **PATCH /status**

  * Same status → no-op
  * Safe retry behavior

### Not Supported

* **POST /participants**

  * Duplicate → **409 Conflict**

### Rationale

Silent success on duplicate create can:

* hide partial failures
* create ambiguity in audit trails

Explicit conflict is safer.

---

## 6.3 Workflow State Machine

### States

* SCHEDULED
* COMPLETED
* MISSED
* CANCELLED

### Terminal States

* COMPLETED
* MISSED
* CANCELLED

### Rules

* Terminal states cannot transition
* Same state update → no-op
* Invalid transitions → rejected (400)

---

## 6.4 API Contract

### POST `/api/participants`

**Success (201)**

```json
{
  "result": { "participantId": "..." },
  "steps": ["TRANS_START", "PARTICIPANT_CREATED", "VISITS_GENERATED", "TRANS_COMMIT"]
}
```

**Errors**

* 400 → invalid payload
* 404 → study/site not found
* 409 → duplicate subjectIdentifier

---

### PATCH `/api/visits/:id/status`

**Success**

```json
{ "status": "COMPLETED" }
```

**Errors**

* 400 → invalid transition
* 404 → visit not found

---

### GET `/api/visits`

Returns participant visits

---

# 7. Data Model

### Core Entities

* Study
* Site
* Participant
* VisitTemplate
* ParticipantVisit

---

## Key Design: Template vs Instance

| Layer            | Role                |
| ---------------- | ------------------- |
| VisitTemplate    | protocol definition |
| ParticipantVisit | execution instance  |

---

## Key Constraints

* study-scoped uniqueness
* foreign key enforcement
* restrict delete on critical relations
* UTC timestamps

---

# 8. Delete Strategy (Refined)

### Rule

`onDelete: Restrict` is applied to **integrity-critical parent-child relationships**

### Behavior

* Delete blocked if dependent records exist
* No cascade deletion of critical data

### Rationale

* prevents silent data loss
* preserves auditability
* forces explicit cleanup decisions

---

# 9. Date/Time Strategy

### Storage

* all timestamps stored in UTC

### Generation

* base date + offsetDays
* normalized to fixed hour (09:00 UTC)

### UI

* may render local time
* DB remains canonical UTC

---

# 10. Error Handling Strategy

| Type              | Response |
| ----------------- | -------- |
| Invalid payload   | 400      |
| Not found         | 404      |
| Domain violation  | 400      |
| Unique constraint | 409      |
| Unknown error     | 500      |

### Key Mechanism

* Prisma `P2002` → HTTP 409

---

# 11. System Architecture

### Flow

UI → API → Validation → Domain Checks → Transaction → DB

### Responsibilities

| Layer    | Responsibility             |
| -------- | -------------------------- |
| UI       | display only               |
| API      | validation + orchestration |
| Workflow | state rules                |
| DB       | final integrity            |

---

# 12. Risks & Mitigation

| Risk                   | Mitigation        |
| ---------------------- | ----------------- |
| partial writes         | transaction       |
| concurrency duplicates | DB constraint     |
| timezone drift         | UTC normalization |
| invalid workflow       | FSM               |
| data loss              | restrict delete   |

---

# 13. Testing Strategy

## Invariant Test Matrix

| Invariant              | Test                            |
| ---------------------- | ------------------------------- |
| Atomic enrollment      | force failure → no rows         |
| Participant uniqueness | duplicate insert → 409          |
| Concurrency safety     | parallel requests → one success |
| State control          | invalid transition → 400        |
| Terminal state         | cannot reopen                   |
| Idempotency            | same state → no change          |
| Time stability         | consistent across environments  |
| Delete protection      | delete parent → blocked         |
| Domain validation      | wrong site-study → 400          |

---

# 14. Development Plan

1. Foundation
2. Schema
3. Seed data
4. API + validation
5. Enrollment validation
6. Transaction engine
7. FSM
8. UI
9. Optional features
10. Proof layer

---

# 15. Demo Proof Plan

### Required Proofs

* rollback leaves DB unchanged
* duplicate ID rejected
* concurrent duplicate prevented
* invalid transition rejected
* malformed input rejected
* delete blocked
* timestamps stable

---

# 16. Success Criteria

System must prove:

* atomicity
* uniqueness under concurrency
* no partial writes
* deterministic scheduling
* valid workflow only
* safe failure

---

# 17. Engineering Signals

* DB as final authority
* separation of validation vs enforcement
* transaction boundaries
* FSM-driven workflow
* explicit failure handling
* constraint-driven design

---

# 18. Final Positioning

This is not a CRUD system.

This is a **constraint-driven, failure-aware system** designed to demonstrate:

* correctness under concurrency
* integrity under failure
* explicit enforcement of invariants
* observable system behavior

---
