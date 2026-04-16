# 🔥 Proof of Failure Plan

**Clinical Research Study Tracker (v2.4 / TDD v1.5 Aligned)**

---

# 1. Objective

This document defines how the system is **intentionally broken** to prove:

* invariants are enforced
* invalid states are rejected
* failures leave no side effects
* the system remains correct under stress

This is not testing for success.
This is testing that the system **fails safely and predictably**.

---

# 2. Scope of Proof

The following system guarantees must be **demonstrated live**:

1. Atomic enrollment (no partial writes)
2. Concurrency-safe uniqueness
3. Workflow state enforcement (FSM)
4. Delete protection (no cascade loss)
5. Input validation before persistence
6. Temporal stability (UTC correctness)

---

# 3. Test Environment Setup

* Local PostgreSQL instance
* Prisma connected and migrated
* Seed data loaded
* App running (`npm run dev`)
* Prisma Studio open (recommended)

---

# 4. Failure Test Matrix

| Test ID | Invariant         | Failure Type       | Expected Outcome  |
| ------- | ----------------- | ------------------ | ----------------- |
| F1      | Atomic Enrollment | Forced exception   | Full rollback     |
| F2      | Uniqueness        | Duplicate insert   | 409 Conflict      |
| F3      | Concurrency       | Parallel requests  | 1 success, 1 fail |
| F4      | FSM Integrity     | Invalid transition | 400 rejection     |
| F5      | Terminal State    | Reversal attempt   | Blocked           |
| F6      | Delete Protection | Parent delete      | DB rejection      |
| F7      | Validation        | Malformed payload  | 400 before DB     |
| F8      | Time Stability    | Edge scheduling    | No drift          |

---

# 5. Detailed Failure Scenarios

---

## F1 — Atomic Enrollment Rollback

### Goal

Prove no partial writes occur.

### Input

```json
{
  "studyId": "...",
  "siteId": "...",
  "subjectIdentifier": "FAIL-001",
  "fullName": "Rollback Test",
  "enrolledAtUtc": "2026-04-15T09:00:00.000Z",
  "demoFailAfterParticipant": true
}
```

### Expected Behavior

* API returns error
* `steps[]` shows rollback triggered
* NO participant exists
* NO participant visits exist

### Verification

* Check Prisma Studio
* Confirm database unchanged

---

## F2 — Duplicate Participant (Uniqueness)

### Goal

Prove DB-level uniqueness enforcement.

### Steps

1. Create participant with ID `ABC-001`
2. Submit same request again

### Expected Behavior

* Second request returns:

```json
{ "error": "...", "status": 409 }
```

### Key Proof

* API pre-check may pass
* DB rejects at commit

---

## F3 — Concurrency Race Condition

### Goal

Prove DB is final authority under concurrency

### Method

Trigger two simultaneous POST requests:

```bash
# Example (run quickly or via script)
curl ... &
curl ...
```

### Expected Behavior

* One request succeeds
* One fails with 409

### Key Insight

* Both requests may pass API validation
* Only DB constraint resolves conflict

---

## F4 — Invalid State Transition

### Goal

Prove FSM enforcement

### Steps

1. Set visit → COMPLETED
2. Attempt:

```json
{ "status": "SCHEDULED" }
```

### Expected Behavior

* API returns 400
* State unchanged

---

## F5 — Terminal State Protection

### Goal

Prove finality of terminal states

### Steps

1. Visit = COMPLETED
2. Attempt any further transition

### Expected Behavior

* Request rejected
* State remains terminal

---

## F6 — Delete Protection

### Goal

Prove no cascade deletion

### Steps

Attempt to delete Study with existing Participants

### Expected Behavior

* DB rejects operation
* No child records removed

### Key Proof

* Referential integrity enforced

---

## F7 — Validation Before Persistence

### Goal

Prove malformed input never reaches DB

### Input

```json
{
  "studyId": "",
  "siteId": null
}
```

### Expected Behavior

* API returns 400
* No DB query executed

---

## F8 — Temporal Stability

### Goal

Prove UTC normalization

### Steps

1. Enroll participant near boundary time
2. Inspect generated visits

### Expected Behavior

* All visits occur at fixed UTC hour (09:00)
* No day shifting

---

# 6. Observability (Critical)

All failure tests must produce visible signals:

### API Response

* HTTP status code
* error message
* `steps[]` (for transactions)

### Database State

* verified via Prisma Studio

### Logs

* console logs for transaction lifecycle

---

# 7. Pass Criteria

The system passes if:

* no partial writes occur
* duplicates are impossible under concurrency
* invalid transitions are blocked
* terminal states remain final
* delete operations do not cascade
* invalid inputs never persist
* timestamps remain stable

---

# 8. Failure Criteria

System fails if:

* any partial record remains after rollback
* duplicate participant exists in same study
* invalid state transition succeeds
* terminal state is reversible
* parent deletion removes children
* malformed input reaches DB
* visit dates drift across environments

---

# 9. Demo Script (2–3 Minutes)

1. Happy path enrollment
2. Trigger rollback → show empty DB
3. Duplicate ID → show 409
4. Invalid transition → show rejection
5. Attempt delete → show DB block

---

# 10. Final Positioning

> This system is not proven by success cases.
> It is proven by how it behaves under failure.

This document demonstrates:

* integrity under stress
* correctness under concurrency
* explicit enforcement of invariants

---

# 11. Summary

This Proof of Failure Plan transforms the system from:

> “It works”

into:

> **“It cannot break in invalid ways.”**

---
