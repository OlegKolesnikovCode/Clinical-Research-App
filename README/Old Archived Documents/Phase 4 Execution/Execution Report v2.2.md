🧠 Clinical Research Study Tracker
Technical Design Document & Execution Plan (v2.2)
1. Executive Summary

A portfolio-grade systems case study modeling clinical research workflows.

This project prioritizes:

relational data integrity
transactional correctness
controlled workflow state transitions
validated API boundaries
failure resistance

over feature breadth.

Primary Goal

Demonstrate senior-level engineering discipline through invariants, enforced constraints, and provable system behavior under failure.

2. Global Governance Layer (Non-Negotiable)
🛑 Daily Stop Rule

At the end of each day, ask:

Did I build something demo-visible?
Did I improve system integrity?
Did I reduce system risk?

If NO → stop and correct direction.

🚫 Hard Anti-Creep Rules
Auth

If auth takes more than 30 minutes:

→ stop
→ use a hardcoded user or simple selector

Documents

Documents are metadata only:

title
type
fileUrl

No:

S3
UploadThing
blobs
base64
file system work
Dashboard

No charts.
Dashboard = simple stat cards only.

Timezones

Store UTC only.
Display UTC or standard local display only.
No site-specific timezone logic.

UI / Styling

Maximum 15 minutes per component.
UI exists only to expose backend logic.

Search / Pagination / Filtering

Do not add unless record volume actually justifies it.

3. Implementation Pro-Tips (Bounded, Not Open-Ended)
💡 Tip A: Toggle-able Failure (Day 10 Demo Only)

In Day 6 transaction logic, include a temporary demo-only failure trigger:

if (participantName.toLowerCase() === "fail") {
  console.log("!!! INJECTING SIMULATED FAILURE FOR DEMO !!!");
  throw new Error("Simulated Transaction Failure");
}
Purpose

This exists only to prove rollback behavior during the demo.

Rule

This is a controlled proof mechanism, not business logic.

💡 Tip B: Type-Safe Sandwich

Use Zod as the primary input contract. Infer types from Zod when helpful so frontend and backend stay aligned.

Preferred order:

Zod-inferred types
Prisma-generated types
Narrow local type assertion if blocked

If a type problem takes more than 10 minutes:

→ simplify the type
→ use a narrow assertion locally
→ move on

Rule

Logic correctness is higher priority than type perfection.

💡 Tip C: Day-0 Rules Engine

In VisitTemplate, store:

offsetDays: Int

Scheduling logic:

scheduledDate = addDays(enrollmentDate, template.offsetDays)
Signal

This proves the system is generating visits from protocol logic, not manually creating random rows.

💡 Tip D: Pure Function State Machine

Keep transition logic in:

src/lib/workflow.ts

Core function:

function canTransition(current, next): boolean
Rule

This function must have:

no database calls
no side effects
no framework dependence
Signal

Deterministic, testable, explainable workflow logic.

4. Invariants and Enforcement Model
Only claim invariants that are actually enforced.
Enforcement layers must stay distinct:
Zod → request shape and required fields
API logic → workflow rules and relational checks
Database constraints → foreign keys, uniqueness
Transactions → atomic multi-step operations
Core Invariants
A participant is uniquely identified within a study
Enrollment is atomic
A participant cannot remain created if visit generation fails
Invalid visit transitions are rejected through the API
Malformed input is rejected before database writes are attempted
Failed operations leave no side effects
5. The 10-Day Execution Plan
Day 1 — Foundation
Goal

Boot the system and establish the base shell.

Tasks
initialize Next.js
initialize Prisma
connect PostgreSQL
create sidebar / basic page shell
Deliverable
app boots
DB connected
navigation visible
Day 2 — Schema (Critical Day)
Goal

Define the relational source of truth.

Tasks

Define:

Study
Site
Participant
VisitTemplate
ParticipantVisit
Document
Task

Add:

enums
foreign keys
timestamps
cascade rules
participant uniqueness:
@@unique([studyId, subjectIdentifier])
Invariant

A participant is uniquely identified only within a specific study.

Deliverable
schema complete
migration succeeds
Day 3 — Seed Data (Speed Multiplier)
Goal

Populate realistic data for UI testing and demo stability.

Tasks

Seed:

1 study
sites
3 visit templates
participants
Requirements
valid FK relationships
rerunnable script
Deliverable
realistic non-empty dataset
Day 4 — Study & Site APIs
Goal

First validated vertical slice.

Required Routes
GET /api/studies
POST /api/studies
GET /api/sites
POST /api/sites
Tasks
add Zod schemas
validate inputs
reject malformed requests
build basic forms
Rule

Any UI list/table requires a matching GET route.

Deliverable
create + read studies/sites through UI
Day 5 — Enrollment Entry Point
Goal

Prepare the canonical enrollment route.

Canonical Route
POST /api/participants
Tasks

Validate:

studyId exists
siteId exists
site belongs to study
subject identifier is unique within study
Important

Do not generate visits yet.
This same route is upgraded on Day 6.

Deliverable
validated enrollment entry point
Day 6 — Transactional Engine (The Senior Signal)
Goal

Atomic participant + visit generation

Mechanism

Upgrade the same POST /api/participants route:

create participant
fetch visit templates
generate visits from offsetDays
insert all in one transaction

Use:

prisma.$transaction
date-fns
UTC storage
Logging

Log transaction lifecycle:

console.log("TRANSACTION START");
console.log("CREATING PARTICIPANT");
console.log("CREATING VISITS");
console.log("TRANSACTION SUCCESS");

On failure:

console.error("ROLLBACK TRIGGERED");
Deliverable
fully atomic enrollment engine
Proof Requirement

Inject failure and verify:

no participant created
no visits created
DB unchanged
Day 7 — State Machine Enforcement
Goal

Controlled visit status updates

Tasks

Implement in src/lib/workflow.ts:

ALLOWED_TRANSITIONS
canTransition()

Required routes:

GET /api/visits
PATCH /api/visits/:id/status
Invariant

A completed visit cannot revert to scheduled.

Deliverable
enforced workflow lifecycle
Day 8 — Minimal UI
Goal

Expose the system, not embellish it

Tasks

Build:

enrollment form
participant list
visit list
status update controls
clear success/error messages
Rule

UI is a visibility layer, not a logic layer.

Deliverable
full workflow is usable in browser
Day 9 — Optional Buffer (Sacrifice Rule Applies)
Goal

Documents + Tasks only if core is already stable

Only proceed if:
Day 6 complete
Day 7 complete
Minimal scope

Document:

title
type
fileUrl

Task:

title
status
dueDate

Required routes:

GET
POST
Rule

If Days 6 or 7 are shaky → skip this day entirely.

Deliverable
lightweight operational layer, if time allows
Day 10 — Proof Layer & Narrative
Goal

Make the project defensible

Required Proofs
1. Transaction Rollback
trigger failure
show rollback
show DB unchanged
2. State Machine Rejection
attempt invalid transition
show API rejection
3. Domain Constraint Proof
duplicate subjectIdentifier
DB throws unique error
API maps to 409 Conflict
Documentation Task

Update README/interview notes using invariant language

6. Success Criteria & Demo Path
🎤 Interview Narrative (Required Language)

Use phrases like:

“An invariant of the system is that a participant cannot exist without a generated visit schedule.”
“I enforced atomicity during enrollment to prevent zombie records.”
“The state machine ensures irreversible lifecycle transitions where appropriate.”
“I separated request validation, workflow rules, database constraints, and transaction boundaries.”
🧪 Required Demo Path (3 Minutes)
Dashboard → show baseline counts
Create Study
Add Site
Enroll participant named John Doe → success
Show auto-generated visits
Mark a visit Completed
Attempt to move it back to Scheduled → reject
Enroll participant named Fail
Show terminal rollback log
Verify no record was created
7. Final Control Law

If Day 6 or Day 7 is incomplete:

all non-core work is automatically deprioritized or removed

8. Bottom Line

This is not a feature-heavy project.

It is a bounded, correctness-first systems case study designed to demonstrate:

relational integrity
transactional safety
controlled state transitions
failure correctness
disciplined execution

It is intentionally minimal.
It is built to be maximally defensible in an interview.