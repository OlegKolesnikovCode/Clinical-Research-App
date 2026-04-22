Project Name: Clinical Research Study Tracker
Version: v1.2 (Execution-Aligned)
Author: Oleg Kolesnikov
Last Updated: April 2026
2. Executive Summary

A full-stack application modeling clinical research workflows with:

relational data modeling
controlled state transitions
transactional integrity
validated API boundaries

Primary Objective:
Demonstrate correctness, system design discipline, and execution reliability, not feature breadth.

3. Problem Statement & Context

Clinical study operations often rely on:

spreadsheets
manual scheduling
loosely enforced workflows

This creates:

inconsistent participant tracking
missed protocol events
poor operational visibility

Solution:
A structured system that enforces:

relational consistency
workflow state rules
deterministic execution paths
4. Goals and Objectives
Goals
Build a realistic workflow system
Demonstrate backend + system design competence
Objectives
Demo completes in < 3 minutes
All core workflows execute end-to-end
Invalid state transitions are prevented via API rules
Multi-step operations execute atomically
5. Scope Definition
✅ In Scope (MVP)
Studies, Sites, Participants
Visit Templates + Participant Visits
Documents (metadata only)
Tasks
Dashboard
Seed data
Validation (Zod)
Status enums
❌ Out of Scope
IRB workflows
eCRF systems
Electronic signatures
Billing systems
Full RBAC
🔹 Role Handling (Explicit Boundary)
Basic roles (Admin/User) included
UI demonstrates conditional rendering
Example: Admin-only actions
Backend authorization is intentionally simplified

Clarification:
This demonstrates authorization awareness but does not represent production-grade security enforcement.

6. Stakeholders
Clinical Research Coordinator (end user)
Developer (system builder)
Hiring Manager (evaluator)
7. User Stories
Enroll participant → track study involvement
Generate visits → enforce protocol schedule
Update visit → reflect execution state
Track tasks and documents → maintain workflow visibility
8. Functional Requirements

System shall:

Create and manage Studies, Sites, Participants
Generate ParticipantVisits from VisitTemplates
Track Documents and Tasks
Provide dashboard-level summaries
🔥 State Transition Rules (Central Integrity Layer)

ParticipantVisit status transitions are controlled.

Allowed:
scheduled → completed
scheduled → missed
scheduled → cancelled
Disallowed:
completed → scheduled
missed → completed
Enforcement Mechanism:
All status updates pass through API route handlers
Centralized validation logic enforces allowed transitions
Enum-backed states prevent invalid values

Outcome:
System prevents invalid workflow states at the API boundary.

9. Non-Functional Requirements
Data Integrity

Enforced through:

foreign key relationships
enum constraints
API validation (Zod)
transactional writes
Reliability
Multi-step operations executed within database transactions
Prevents partial writes
Performance
Designed for responsive local usage
Avoids unnecessary full-table scans in common queries
🔹 Scalability (Realistic Framing)
Indexes applied to:
foreign keys
status fields
Query patterns structured for efficient filtering

Positioning:
System is designed to scale beyond trivial datasets, with:

pagination
indexing
as primary next steps

(No specific record-scale guarantees claimed)

10. Data Model / Domain Model
Core Entities
User
Study
Site
Participant
VisitTemplate
ParticipantVisit
Document
Task
🔥 Key Modeling Decision
Template vs Instance Separation
VisitTemplate → expected schedule
ParticipantVisit → actual execution

Impact:

Separates plan vs reality
Enables scalable scheduling logic
Prevents duplication
🔹 Data Integrity Rules
Foreign keys enforce relationships
Enum fields enforce valid states
Participant uniqueness enforced at study level
(e.g., screening number, subject identifier where applicable)
🔹 Auditability Foundation

All entities include:

createdAt
updatedAt

Optional (if implemented without complexity risk):

createdBy

Purpose:

Establish baseline for audit tracking
Enable future regulatory expansion
11. System Architecture
Stack
Next.js (UI + API)
Prisma ORM
PostgreSQL
Zod validation
date-fns (date logic)
Data Flow

UI → API → Validation → ORM → Database

Design Principles
Relational-first modeling
CRUD-first development
Transactional integrity for multi-step writes
UTC date storage
12. Technology Stack
Layer	Technology
Frontend	Next.js
Backend	Route Handlers
ORM	Prisma
Database	PostgreSQL
Validation	Zod
Dates	date-fns
13. Constraints
Time-boxed (~10 days)
Portfolio-focused
Demo-driven
Avoid overengineering
14. Assumptions
Moderate dataset size
Single-user demo context
File storage simulated via URLs
15. Risk Analysis & Mitigation
Risk	Impact	Mitigation
Over-scoping	High	Strict scope boundaries
Schema complexity	Medium	Minimal relational model
Partial writes	High	Transactions
Timezone errors	Medium	UTC storage
Demo instability	High	Repeatable demo flow
16. Success Criteria (Definition of Done)
Full workflow executes end-to-end
Demo completes in < 3 minutes
API prevents invalid state transitions
Transactions verified (no partial writes)
Validation enforced across inputs
UI is clean and navigable
17. Milestones & Timeline
Foundation
Seed Data
API + Validation
Transactional Workflow Engine
Visit Execution
Documents & Tasks
Dashboard
Hardening
18. Development Plan
Key Phases
Phase 1 — Foundation
Schema + DB setup
Migrations
Phase 2 — Seed Data
Realistic dataset for UI
Phase 3 — API + Validation
CRUD endpoints
Zod validation
Phase 4 — Transactional Enrollment (Critical)

Mechanism:

Create participant
Generate visits from templates
Insert all within a single transaction

Guarantee:

Enrollment cannot partially succeed
Phase 5–7
UI workflows
Visit updates
Task/document features
Phase 8 — Hardening
Testing
Demo validation
Bug fixes
19. Testing Strategy
API validation testing (valid vs invalid input)
Transaction failure testing
Manual DB inspection (Prisma Studio)
Demo path execution ≥ 5 times
20. Deployment Plan
Local environment (primary)
Optional deployment (e.g., Vercel)
21. Maintenance
Bug fixes during hardening phase
No long-term production support required
22. Documentation Plan
README
Code comments
Interview talking points
23. Demo Workflow (UAT Path)
Create Study
Add Site
Enroll Participant
Assign Templates
Generate Visits
Complete Visit
Upload Document
Create Task
Return to Dashboard
24. Key Engineering Signals

This system demonstrates:

relational data modeling
API-layer validation
centralized state transition enforcement
transactional integrity
audit-aware schema design
constrained system scope
🧠 Final Positioning

This is a bounded, correctness-first system designed to:

enforce valid state transitions
prevent partial system writes
model real-world workflows
demonstrate disciplined engineering decisions