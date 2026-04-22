🧠 Clinical Research Study Tracker
Hardened Project Plan & Engineering Rationale
1. Objective

Build a portfolio-grade full-stack application that demonstrates:

relational data modeling
end-to-end CRUD workflows
API design and backend structure
real-world workflow modeling (clinical research)
system-level thinking (constraints, tradeoffs, failure modes)
Primary Goal:

Maximize hireability by demonstrating practical engineering competence, not theoretical complexity.

Optimization Rule:

Adopt high-signal, low-cost improvements that materially increase interviewer confidence, and reject anything that delays finishing the core system.

2. Scope Definition (Strict Boundary Control)
✅ Included (MVP Core System)
Studies (protocol-level)
Sites (location-level)
Participants (enrollment + status)
Visit Templates (protocol schedule)
Participant Visits (actual execution)
Documents (metadata + storage reference)
Tasks (workflow tracking)
Dashboard metrics
Seed data (for demo reliability)
Status enums (for data integrity)
Basic validation (Zod)
❌ Explicitly Excluded
IRB lifecycle / regulatory workflows
Adverse event reporting
eCRF / dynamic forms
Electronic signatures (Part 11)
Billing / finance modules
Full RBAC system
Advanced audit/compliance engines
Any feature that delays completion of the vertical slice
🎯 Rationale
Prevents scope creep
Ensures full system completion
Prioritizes depth over breadth
Aligns with real interview evaluation criteria
3. System Architecture
Stack
Frontend: Next.js (App Router)
Backend: Next.js Route Handlers
ORM: Prisma
Database: PostgreSQL
Language: TypeScript
Styling: Tailwind CSS
Validation: Zod
Architecture Flow

UI (React / Next.js)
↓
API Layer (Route Handlers)
↓
Zod Validation
↓
Prisma ORM
↓
PostgreSQL

Design Principles
Single Prisma schema (simplicity > fragmentation)
Relational-first modeling (data integrity > flexibility)
CRUD-first development
Vertical slice delivery
Readability > cleverness
Store all dates in UTC, convert in UI
Use transactions for multi-step writes
4. Core Data Model (MVP)
Entities
User → id, email, role
Study → protocol container, status
Site → linked to Study
Participant → linked to Study + Site
VisitTemplate → defines expected visits
ParticipantVisit → tracks real execution
Document → metadata + file reference
Task → assigned workflow items
Relationships
Study → Sites (1:N)
Study → Participants (1:N)
Site → Participants (1:N)
Participant → Visits (1:N)
Study → VisitTemplates (1:N)
VisitTemplate → ParticipantVisits (1:N)
Study/Site/Participant → Documents (1:N)
User → Tasks (1:N)
🔥 Key Modeling Decision

Template vs Instance Separation

VisitTemplate = protocol expectation
ParticipantVisit = real-world execution

👉 Prevents duplication and enables scalable scheduling logic
👉 Demonstrates understanding of business rules vs actual state

State Integrity Rules
Use Prisma enums for statuses (no free-form strings)
Keep documents simple (no versioning in MVP)
Avoid premature abstraction
5. Development Strategy
Phase 1 — Foundation
Setup Next.js + Prisma + PostgreSQL
Define schema
Run migrations
Test CRUD via API
Add Zod validation
Use enums for status fields

Deliverable: working backend

Phase 2 — Vertical Slice (Core Workflow)
End-to-End Demo Flow
Create Study
Add Site
Enroll Participant
Assign Visit Templates
Generate Visits (transactional)
Upload Document
Create Task

Deliverable: complete working workflow

Phase 3 — Productization
Dashboard metrics
Filtering/search
Status indicators
Seed data
Improved validation
Optional (only if time allows)
Basic auth (NextAuth / Clerk)
Lightweight audit log
6. UI Structure
Dashboard (metrics)
Studies (CRUD)
Study Detail (sites, participants, visits)
Participants (status tracking)
Visits (schedule + completion)
Documents (upload + categorize)
Tasks (assignment + tracking)
🎯 Demo Path Requirement

Must support a clean 2–3 minute walkthrough:

open dashboard
create study
add site
enroll participant
assign templates
generate visits
mark visit complete
upload document
create task
return to dashboard
7. Key Engineering Signals

This project demonstrates:

relational data modeling
backend API structure
transactional integrity
validation layers (Zod)
state management via enums
real-world workflow design
product-level thinking
scope discipline
8. Interview Talking Points
Why this project?

Aligned with clinical research background but scoped to demonstrate full-stack fundamentals without overengineering.

Why this architecture?

Next.js + Prisma provides fast iteration, strong typing, and clear data flow.

Why not build a full CTMS?

Because:

complexity explodes quickly
does not increase hiring signal proportionally
core workflow modeling is more valuable
High-signal engineering details
transactional visit generation
enum-based state control
UTC date storage
Zod API validation
How would you extend this?
adverse events
RBAC
document versioning
CRF system
9. Risk Management
Risk	Why It Matters	Mitigation
Over-scoping	Project never finishes	Strict scope boundary
Schema creep	Slows development	Keep schema minimal
Unfinished UI	Weak employer signal	Prioritize polish
Poor demo flow	Hard to explain	Build vertical slice first
Partial writes	Data inconsistency	Use transactions
Feature creep	Delays completion	Only add high-signal features
10. Definition of Done

The system is complete when:

Full workflow works end-to-end
Demo < 3 minutes
Seed data exists
Core entities function
Transactional visit generation works
Status enums implemented
Dates stored in UTC
Zod validation in place
UI is clean and usable
Architecture is explainable
Final Positioning

This project should present as:

A practical, full-stack clinical research operations tracker that demonstrates strong data modeling, backend architecture, workflow integrity, and product-focused engineering decisions.

Bottom Line

This is not about building the biggest system.

It is about building the most convincing system per unit effort.