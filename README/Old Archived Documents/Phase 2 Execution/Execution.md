🧠 Clinical Research Study Tracker
Phase-Based Execution Plan (Hardened)
Phase 1 — Foundation (Days 1–2)
Goal

Establish a correct, stable backend foundation:

working app
connected database
complete schema
enforced relationships
clean migrations
Tasks
create Next.js app
initialize git repo
install dependencies:
Prisma
@prisma/client
Zod
date-fns
configure PostgreSQL (DATABASE_URL)
initialize Prisma
write full schema.prisma
define:
all models
relationships
enums
add:
onDelete: Cascade where needed
unique constraints (participant identifiers)
run:
prisma migrate dev
prisma generate
create basic layout and navigation shell
Deliverable
application runs locally
database is connected
schema is migrated
Prisma Client is usable
Checklist
 Next.js app running
 Prisma configured
 PostgreSQL connected
 schema complete
 enums implemented
 cascade rules added
 unique constraints added
 migration successful
 Prisma Client generated
 base layout exists
Pitfalls
overthinking schema (keep it minimal)
skipping enums → leads to messy state later
forgetting cascade rules → breaks seed script
Validation
run npx prisma studio
manually create:
Study
Site
confirm relationships work
no DB errors
Phase 2 — Seed Data (Day 3)
Goal

Create realistic data early to:

eliminate empty UI
accelerate frontend work
stabilize demo
Tasks
create prisma/seed.ts
seed:
roles
users
2–3 studies
sites per study
visit templates
participants
participant visits
tasks
documents
ensure correct creation order (FK dependencies)
run seed script
Deliverable
database populated with realistic data
UI can render meaningful content immediately
Checklist
 seed script created
 seed script runs without errors
 studies exist
 sites exist
 participants exist
 visit templates exist
 visits exist
 tasks exist
 documents exist
Pitfalls
incorrect creation order → FK errors
incomplete seed data → poor demo
not re-runnable → slows iteration
Validation
run seed multiple times without breaking
verify data visually in Prisma Studio
confirm all relationships populated
Phase 3 — API + Validation Layer (Days 4–5)
Goal

Build a validated backend layer that:

enforces data integrity
supports CRUD workflows
prevents invalid input
Tasks
API routes
/api/studies
/api/sites
/api/participants
Implement
GET and POST routes
filtering by study/site where useful
Validation
define Zod schemas for:
Study
Site
Participant
validate request bodies before DB access
UI (minimal)
Studies list
Create Study form
Study detail page
Add Site form
Participant list
Enroll Participant form
Deliverable
working CRUD for studies, sites, participants
API validation prevents invalid data
Checklist
 study routes working
 site routes working
 participant routes working
 Zod validation implemented
 validation errors handled
 UI forms connected to API
 participant status enum used
Pitfalls
skipping validation → bad data enters DB
overbuilding UI → delays backend completion
not handling API errors
Validation
send invalid request → fails safely
valid request → creates correct DB record
UI reflects DB state
Phase 4 — Transactional Workflow Engine (Day 6)
Goal

Implement atomic participant enrollment with visit generation.

This is the highest-value engineering component.

Tasks
fetch visit templates for study
generate participant visits using templates
calculate visit dates using date-fns (addDays)
implement:
prisma.$transaction()

Inside transaction:

create participant
generate visit data
insert visits
Deliverable
participant enrollment automatically generates visits
operation is atomic
Checklist
 visit templates fetched correctly
 visits generated correctly
 date logic works (using date-fns)
 transaction implemented
 no partial writes on failure
Pitfalls
incorrect date math
partial DB writes
missing template linkage
timezone bugs
Validation
force failure → participant not created
success → participant + visits created
verify all visit dates correct
verify UTC storage
Phase 5 — Visit Execution Workflow (Day 7)
Goal

Make visits operational and interactive.

Tasks
build participant visit list
implement status updates:
scheduled
completed
missed
cancelled
add route to update visit
set actual completion date
format dates for UI
Deliverable
visits can be viewed and updated
system reflects real workflow state
Checklist
 visit list renders
 status update works
 completion action works
 status enums used
 date display correct
Pitfalls
inconsistent status handling
mixing UTC/local incorrectly
overbuilding UI (keep simple list)
Validation
update visit → reflected in DB
correct status transitions
correct timestamps stored
Phase 6 — Documents & Tasks (Day 8)
Goal

Complete operational features without adding complexity.

Tasks
Documents
create document metadata flow
allow linking to study or participant
use simple fileUrl (mock)
Tasks
create task
list tasks
update status
Deliverable
documents and tasks fully functional
Checklist
 document creation works
 document list works
 task creation works
 task list works
 task update works
Pitfalls
attempting real file uploads
overcomplicating task logic
Validation
create document → appears in UI
create task → appears and updates
Phase 7 — Dashboard & Polish (Day 9)
Goal

Make system presentable and demo-ready.

Tasks
build dashboard metrics:
total studies
active participants
upcoming visits
overdue tasks
add:
loading states
empty states
error handling
improve layout and readability
Deliverable
polished UI
clean dashboard
smooth navigation
Checklist
 dashboard metrics correct
 UI readable
 empty states handled
 loading states handled
 navigation works
Pitfalls
over-polishing UI
adding unnecessary features
ignoring demo flow
Validation
dashboard reflects DB correctly
UI is easy to navigate
demo flow is smooth
Phase 8 — Hardening & Interview Prep (Day 10)
Goal

Make system reliable, explainable, and interview-ready.

Tasks
run demo path 5 times
fix bugs
verify:
transactions
date handling
validation
clean UI labels
finalize documentation
Prepare answers
transactional logic
relational design
UTC handling
enum usage
why scope is limited
Deliverable
stable demo-ready system
strong interview narrative
Checklist
 demo path runs cleanly
 no major bugs
 transaction verified
 UTC verified
 validation verified
 documentation complete
 talking points ready
Pitfalls
skipping testing
weak explanations
demo breaking under pressure
Validation
run demo multiple times without failure
explain system without hesitation
Final Rule

If a feature does NOT improve:

workflow integrity
data correctness
demo clarity
interviewer confidence

→ Do not build it