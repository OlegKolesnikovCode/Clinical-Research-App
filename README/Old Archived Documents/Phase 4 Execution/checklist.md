Clinical Research Study Tracker — Day-by-Day Build Checklist

Based on the v2.2 Technical Design Document & Execution Plan.

Day 1 — Foundation
Objective

Get the app running, connect the database, and create the base shell. This day is about establishing a working environment, not building logic yet.

Checklist
 Create the Next.js app
 Install required dependencies
 Prisma
 @prisma/client
 Zod
 date-fns
 Initialize Prisma
 Set up PostgreSQL connection string in .env
 Confirm Prisma can connect to the database
 Create the initial app shell
 layout
 sidebar or nav
 placeholder pages
 Start the dev server successfully
 Confirm the app boots with no blocking errors
 Confirm DB connection works
Done means
 App runs locally
 Database is connected
 Basic navigation is visible
Do not do
 No business logic
 No auth rabbit hole
 No styling polish beyond basic layout
Day 2 — Schema (Critical Day)
Objective

Define the relational source of truth. This is one of the highest-signal days in the whole project because it proves you understand system structure, not just UI flow.

Checklist
 Open schema.prisma
 Define all core models
 Study
 Site
 Participant
 VisitTemplate
 ParticipantVisit
 Document
 Task
 Add key enums where needed
 visit status enum
 task status enum
 document type enum if useful
 Add timestamps to each major entity
 createdAt
 updatedAt
 Define foreign key relationships
 Study → Site
 Study → Participant
 Study → VisitTemplate
 Participant → ParticipantVisit
 Site → Participant
 Add cascade / delete behavior intentionally
 Add participant uniqueness constraint
 @@unique([studyId, subjectIdentifier])
 Ensure required fields are NOT NULL where appropriate
 Run migration
 Inspect generated SQL if possible
 Open Prisma Studio and verify schema shape
Done means
 Migration succeeds
 All relations are valid
 Participant uniqueness is enforced within a study
Do not do
 No extra entities unless they prove a core invariant
 No premature optimization
 No optional analytics tables
Day 3 — Seed Data
Objective

Create realistic seed data so the system is easier to test, demo, and stabilize. This is not filler work. Good seed data makes every later day faster.

Checklist
 Create a seed script
 Insert 1 study
 Insert at least 1–2 sites under that study
 Insert 3 visit templates
 Screening
 Baseline
 Follow-up
 Use offsetDays in each template
 Insert sample participants
 Ensure all foreign keys line up correctly
 Make the script rerunnable
 clear or upsert safely
 Run seed successfully
 Verify data in Prisma Studio
Done means
 Non-empty database
 Valid relationships
 Stable demo data exists
Do not do
 No random garbage data
 No manual DB editing unless debugging
 No over-seeding dozens of records
Day 4 — Study & Site APIs
Objective

Build the first validated vertical slice. This proves the app can receive input, validate it, store it, and read it back correctly.

Checklist
 Create GET /api/studies
 Create POST /api/studies
 Create GET /api/sites
 Create POST /api/sites
 Write Zod schemas for study input
 Write Zod schemas for site input
 Reject malformed requests before DB write
 Add basic error responses
 Add simple forms in UI
 create study form
 create site form
 Add list display for studies
 Add list display for sites
 Confirm create + read works end-to-end
Done means
 Studies can be created and listed
 Sites can be created and listed
 Invalid payloads are rejected cleanly
Do not do
 No edit/delete yet unless trivial
 No complex UI tables
 No logic in the frontend that belongs in the API
Day 5 — Enrollment Entry Point
Objective

Prepare the canonical enrollment route, but do not generate visits yet. This day is about domain validation before atomicity is added on Day 6.

Checklist
 Create POST /api/participants
 Write Zod schema for participant enrollment request
 Validate required fields
 studyId
 siteId
 subjectIdentifier
 participant name / basic metadata
 Check that studyId exists
 Check that siteId exists
 Check that site belongs to study
 Check subject identifier uniqueness within the study
 Return clear error responses for each failure mode
 Build minimal enrollment form
 Test valid enrollment
 Test invalid site-study pairing
 Test duplicate subject identifier
Done means
 Canonical participant enrollment route exists
 Domain validation works
 Enrollment does not yet generate visits
Do not do
 Do not split logic into multiple competing routes
 Do not add visit creation yet
 Do not weaken validation just to “make progress”
Day 6 — Transactional Engine
Objective

This is the strongest engineering-signal day in the project. Upgrade participant enrollment into a single atomic operation: create participant, fetch visit templates, generate visits, and commit or roll back everything together.

Checklist
 Upgrade existing POST /api/participants
 Start a prisma.$transaction
 Inside the transaction:
 create participant
 fetch visit templates for the study
 compute visit dates using offsetDays
 generate participant visits
 insert participant visits
 Use UTC-safe date handling
 Use date-fns for adding days
 Add transaction lifecycle logging
 TRANSACTION START
 CREATING PARTICIPANT
 CREATING VISITS
 TRANSACTION SUCCESS
 ROLLBACK TRIGGERED
 Add controlled failure trigger for proof
 temporary demo-only failure path
 Test success case
 Test failure case
 Verify rollback leaves DB unchanged
 Confirm no zombie participant exists after failure
 Confirm no participant visits exist after failure
Done means
 Enrollment is atomic
 Visit generation is protocol-driven from templates
 Rollback proof exists
Do not do
 No partial writes
 No multi-request enrollment flow
 No “I’ll clean up bad rows later” logic
Day 7 — State Machine Enforcement
Objective

Control visit lifecycle transitions through a centralized rule system. This is where workflow integrity becomes explicit and interview-defensible.

Checklist
 Create src/lib/workflow.ts
 Define ALLOWED_TRANSITIONS
 Implement canTransition(current, next)
 Keep it pure
 no DB calls
 no side effects
 no framework dependence
 Create GET /api/visits
 Create PATCH /api/visits/:id/status
 Fetch current visit status before update
 Reject invalid transitions
 Allow only valid transitions
 Return clear API error message on rejection
 Test allowed transitions
 Test invalid transitions
 e.g. completed → scheduled
 Verify state remains unchanged on rejection
Done means
 Visit status updates are centrally controlled
 Invalid transitions are blocked
 Terminal or irreversible states behave correctly
Do not do
 No UI-only transition logic
 No duplicated transition rules across files
 No ad hoc status mutation
Day 8 — Minimal UI
Objective

Expose the backend logic clearly in the browser. The UI is just a visibility layer. It should make the system understandable, not fancy.

Checklist
 Build enrollment form
 Build participant list
 Build visit list
 Add visit status update controls
 Show success messages
 Show validation errors
 Show API rejection errors
 Make sure UI reflects backend truth
 Confirm full workflow works from browser
 create supporting records
 enroll participant
 show generated visits
 update valid status
 reject invalid status
Done means
 Full workflow is usable visually
 UI makes invariants observable
 Errors are understandable
Do not do
 No over-styling
 No charts
 No frontend-owned business rules
Day 9 — Optional Buffer
Objective

Only add lightweight operational features if Days 6 and 7 are already solid. If atomicity or state control is shaky, this day gets sacrificed immediately.

Checklist
 Ask: is Day 6 truly solid?
 Ask: is Day 7 truly solid?
 If no, use this day to harden core logic instead
 If yes, optionally add Document
 title
 type
 fileUrl
 Optionally add Task
 title
 status
 dueDate
 Add simple GET route(s)
 Add simple POST route(s)
 Add minimal forms/list views
 Keep scope light
Done means
 Optional operational layer exists, or
 Core system is stronger because you skipped optional work
Do not do
 No uploads
 No S3
 No complex task workflows
 No secondary feature sprawl
Day 10 — Proof Layer and Interview Readiness
Objective

This day is for proof, not building. You now try to break the system on purpose and document that it fails safely. This is where the project becomes interview-grade.

Checklist
 Prove transaction rollback
 trigger controlled failure
 show rollback occurred
 verify DB unchanged
 Prove state machine rejection
 attempt invalid transition
 show API rejection
 show state unchanged
 Prove domain constraint rejection
 duplicate subjectIdentifier
 show unique constraint failure
 map to 409 Conflict
 Prove malformed input rejection
 submit bad payload
 show schema validation rejects before write
 Clean up logs and demo flow
 Update README
 Write interview notes using invariant language
 Rehearse 2–3 minute demo
 Rehearse explanation of:
 relational integrity
 transaction boundaries
 state machine enforcement
 validation layers
 failure resistance
Done means
 You can prove safe failure live
 You can explain why the system is small but strong
 The demo is tight and credible
Do not do
 No last-minute major features
 No rewrites
 No styling detour
 No expanding scope because “there’s still time”
Daily End-of-Day Control Checklist

Use this every day. It comes directly from the governance layer.

 Did I build something demo-visible?
 Did I improve system integrity?
 Did I reduce system risk?
 If not, stop and correct direction.
Sacrifice Order Checklist

If time gets tight, cut in this order:

 advanced styling
 auth complexity
 dashboards/analytics extras
 search/filter polish
 secondary CRUD screens
 optional entities

Never cut:

 relational integrity
 input validation
 atomic multi-step writes
 state transition enforcement
 clean demo path

This is the real control law of the project.

What “Success” Actually Looks Like

By the end, you should be able to say and prove:

 participant uniqueness is enforced within study scope
 enrollment is atomic
 visit generation is derived from protocol templates
 invalid status transitions are rejected
 malformed inputs are rejected before writes
 failed operations leave no side effects

Those are the core invariants in v2.2.