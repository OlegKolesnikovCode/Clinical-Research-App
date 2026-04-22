# 🧠 Clinical Research Study Tracker

## Day-by-Day Build Checklist (Hardened Execution Version)

---

# Day 1 — Foundation and Runtime

## Goal

Get the project running locally with the database connected and the app booting cleanly.

## Checklist

* [ ] Next.js app created
* [ ] Dependencies installed (Prisma, @prisma/client, Zod, date-fns)
* [ ] Prisma initialized
* [ ] PostgreSQL running
* [ ] `.env` configured
* [ ] Prisma client helper created
* [ ] Dev server starts
* [ ] Basic layout visible

## Do not do

* No business logic
* No auth rabbit hole
* No styling detour

---

# Day 2 — Schema and Integrity Model

## Goal

Define relational source of truth with DB-level constraints.

## Checklist

* [ ] Core models defined (Study, Site, Participant, VisitTemplate, ParticipantVisit)
* [ ] Enums added
* [ ] Timestamps added
* [ ] Foreign keys wired
* [ ] `@@unique([studyId, subjectIdentifier])` added
* [ ] `onDelete: Restrict` applied
* [ ] Migration runs successfully
* [ ] Prisma Studio verified

## Do not do

* No extra entities
* No premature optimization

---

# Day 3 — Seed Data

## Goal

Create deterministic demo dataset.

## Checklist

* [ ] Seed script created
* [ ] Study inserted
* [ ] Sites inserted
* [ ] Visit templates inserted
* [ ] Offsets correct (0, 7, 30)
* [ ] Seed rerunnable
* [ ] Data verified

---

# Day 4 — Study and Site APIs

## Goal

First validated vertical slice.

## Checklist

* [ ] Study Zod schema created
* [ ] Site Zod schema created
* [ ] Study GET/POST works
* [ ] Site GET/POST works
* [ ] Invalid payload rejected
* [ ] Basic forms render
* [ ] Data lists visible

## Do not do

* No frontend business logic

---

# Day 5 — Enrollment Entry Validation

## Goal

Domain validation before transactions.

## Checklist

* [ ] Enrollment route created
* [ ] Zod schema added
* [ ] Study existence validated
* [ ] Site existence validated
* [ ] Site-study relationship validated
* [ ] Clear error responses

## Note

DB remains final authority under concurrency.

---

# Day 6 — Atomic Enrollment Transaction

## Goal

All-or-nothing enrollment.

## Checklist

* [ ] Transaction wrapper added
* [ ] Participant created inside transaction
* [ ] Templates fetched
* [ ] Visits generated
* [ ] Visits inserted
* [ ] `steps[]` logging added
* [ ] Failure trigger added
* [ ] Prisma error mapped to 409
* [ ] Rollback verified

## Do not do

* No partial-write cleanup hacks

---

# Day 7 — UTC-Safe Scheduling

## Goal

Deterministic time handling.

## Checklist

* [ ] Date utility created
* [ ] UTC normalization implemented (fixed hour)
* [ ] Scheduling uses utility
* [ ] No timezone drift observed

---

# Day 8 — Workflow State Machine

## Goal

Controlled lifecycle transitions.

## Checklist

* [ ] FSM states defined
* [ ] Terminal states defined
* [ ] `canTransition` implemented
* [ ] FSM is pure function
* [ ] Visit GET route created
* [ ] Visit PATCH route created
* [ ] Invalid transitions rejected
* [ ] Same-state updates are no-op
* [ ] Terminal states irreversible

---

# Day 9 — Minimal UI

## Goal

Expose backend truth clearly.

## Checklist

* [ ] Enrollment form built
* [ ] Participant list built
* [ ] Visit list built
* [ ] Status controls built
* [ ] Error messages visible
* [ ] Full workflow works
* [ ] Invalid actions visible

## Do not do

* No styling polish spree
* No frontend business logic

---

# Day 10 — Proof of Failure

## Goal

Prove system fails safely.

## Checklist

* [ ] Rollback test passes
* [ ] Duplicate returns 409
* [ ] Concurrency test passes (1 success, 1 fail)
* [ ] Invalid transition rejected
* [ ] Terminal state locked
* [ ] Delete blocked
* [ ] Invalid payload rejected
* [ ] UTC stability verified

---

# Day 11 — Documentation Hardening

## Goal

Make system look intentional.

## Checklist

* [ ] README complete
* [ ] TDD finalized
* [ ] ADR added
* [ ] ERD added
* [ ] Proof of Failure Plan added
* [ ] Terminology consistent
* [ ] Code matches docs

---

# Day 12 — Interview Readiness

## Goal

Make system defensible.

## Checklist

* [ ] Demo rehearsed (happy path)
* [ ] Failure demo rehearsed
* [ ] Can explain DB as final authority
* [ ] Can explain transactions
* [ ] Can explain FSM
* [ ] Can explain UTC handling
* [ ] Can explain concurrency behavior
* [ ] Can explain 409 vs idempotency

---

# Daily Control Checklist

* [ ] Built something demo-visible
* [ ] Improved system integrity
* [ ] Reduced system risk

If not → correct direction.

---

# Sacrifice Order

Cut:

1. Styling
2. Optional features
3. UI polish

Never cut:

* DB constraints
* Transactions
* FSM
* UTC handling
* Failure proof

---

# Definition of Success

You can prove:

* [ ] No partial writes
* [ ] No duplicate participants
* [ ] Concurrency-safe behavior
* [ ] Deterministic scheduling
* [ ] Valid workflow only
* [ ] Safe failure

---

# Final Statement

This is not a CRUD app.

This is a **constraint-driven system** that proves correctness under failure, concurrency, and invalid input.
