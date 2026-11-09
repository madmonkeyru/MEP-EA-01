P10 — Frontend Architecture Modernization

Status: Completed
Milestone: P10
Report: project_docs/P10_EXECUTION.md
Depends on: P0–P9
Primary scope: Web + Mobile frontend architecture
Architecture baseline: "project_docs/architecture/"
Target outcome: A coherent, scalable frontend architecture aligned with the Educación Abierta target architecture and generalized domain established through P9.

---

1. Objective

P10 modernizes and consolidates the actual Web and Mobile frontend architecture so that implementation matches the architectural direction established through P0–P9.

The objective is not to redesign the product visually or replace the existing frontend technology.

The objective is to establish a clear frontend architecture in which:

- Web and Mobile have intentional platform boundaries.
- Shared product behavior is reusable across platforms.
- Domain/application logic is not embedded in UI components.
- Feature boundaries are explicit.
- Navigation and state management have clear ownership.
- API, persistence, offline/sync, telemetry, authentication, and entitlement concerns have defined boundaries.
- Generalized Educación Abierta concepts are consumed without BXM-specific coupling.
- Legacy frontend architecture is removed or quarantined.
- Architecture rules are enforceable through code and tests.
- A developer can add another Educación Abierta subject without inventing another frontend architecture.

P10 should leave the frontend in a state where future feature development is primarily feature implementation rather than architectural invention.

---

2. Architectural Principle

The frontend should follow a dependency direction similar to:

Screens / Routes
       ↓
Feature Modules
       ↓
Application Services / Use Cases
       ↓
Shared Domain Contracts
       ↓
Repositories / API / Persistence / Platform Adapters

UI should consume application behavior.

Application behavior should consume domain contracts.

Infrastructure details should remain behind adapters.

Platform-specific implementation should exist only where Web and Mobile genuinely differ.

The frontend must not become a second backend domain layer.

---

3. P10 Scope

P10 covers:

1. Current frontend architecture audit
2. Canonical frontend layering
3. Feature/module boundaries
4. Web/Mobile shared architecture
5. Navigation and routing architecture
6. State and data architecture
7. Generalized content/domain consumption
8. Design-system architecture
9. Loading/error/empty/offline/sync state architecture
10. Offline/sync integration boundaries
11. Authentication/access/entitlement boundaries
12. Telemetry integration
13. Accessibility architecture
14. Frontend testing architecture
15. Dependency and architectural-boundary enforcement
16. Legacy architecture cleanup
17. Frontend documentation synchronization
18. Final architecture verification

---

4. Explicit Non-Goals

P10 must not become:

- a visual redesign
- a UX redesign
- a new design language
- a complete frontend rewrite
- a React replacement
- an Expo migration
- a native Kotlin/Swift migration
- a backend rewrite
- a domain-model redesign
- a database redesign
- an infrastructure migration
- a payment implementation
- mass content authoring
- creation of additional educational subjects
- implementation of new product features merely because the architecture could support them

If implementation reveals a problem requiring one of these changes, document it as a downstream decision rather than expanding P10.

---

5. P10.0 — Current Frontend Architecture Audit

Establish the actual architectural baseline before changing structure.

Review both:

apps/web
apps/mobile

and the shared packages consumed by them.

Inventory:

- application entrypoints
- routing/navigation
- screens/pages
- layouts
- feature components
- shared components
- hooks
- state stores
- API clients
- repositories
- persistence
- authentication
- entitlement/access checks
- offline/sync behavior
- telemetry
- domain imports
- content imports
- platform-specific code
- tests
- legacy architecture
- duplicated behavior
- BXM-specific assumptions

Produce an architecture map showing:

Web
 ├── Entry
 ├── Routing
 ├── Screens
 ├── Features
 ├── State
 ├── Application services
 ├── Domain contracts
 └── Platform adapters

Mobile
 ├── Entry
 ├── Navigation
 ├── Screens
 ├── Features
 ├── State
 ├── Application services
 ├── Domain contracts
 └── Platform adapters

Identify architectural violations rather than merely describing the existing code.

---

6. P10.1 — Canonical Frontend Layering

Establish the canonical frontend dependency model.

Presentation

Responsible for:

- rendering
- interaction
- accessibility
- visual state
- navigation presentation

Presentation must not directly own:

- API request construction
- persistence
- database access
- synchronization
- telemetry implementation
- business-rule orchestration

Feature/Application Layer

Responsible for:

- user-facing workflows
- orchestration
- application state transitions
- invoking repositories/services
- coordinating domain behavior

Domain Contracts

Responsible for generalized concepts such as:

- Program
- Subject
- CurriculumVersion
- Domain
- Evidence
- Lesson
- Question
- Assessment
- Attempt
- Score
- Mastery
- Remediation
- Plan de Nivelación
- Entitlement
- Telemetry context

These contracts must remain subject-independent.

Infrastructure / Platform Adapters

Responsible for:

- HTTP/API
- authentication transport
- storage
- device capabilities
- offline persistence
- synchronization
- telemetry transport
- Web-specific services
- Mobile-specific services

---

7. P10.2 — Feature and Module Boundaries

Organize frontend functionality around product capabilities rather than arbitrary component collections.

Expected feature areas should be evaluated against actual implementation, including:

auth
access / entitlement
learning
content
practice
assessment
simulation
results
progress
mastery
remediation
continuity
sync
telemetry

Do not create empty abstractions solely to satisfy this list.

Existing functionality should be reorganized where useful.

A feature must have a clear responsibility and dependency direction.

Avoid:

component → random API call
component → persistence
component → telemetry implementation
component → domain mutation

Prefer:

component
   ↓
feature/application action
   ↓
repository/service
   ↓
API/persistence adapter

---

8. P10.3 — Web and Mobile Shared Architecture

Define what is shared and what is intentionally platform-specific.

Shared

Where practical, share:

- domain contracts
- application behavior
- use cases
- assessment behavior
- learning-loop behavior
- content interpretation
- telemetry contracts
- validation
- entitlement rules
- data transformation
- synchronization semantics

Platform-specific

Allow platform differences for:

- routing/navigation implementation
- rendering
- device APIs
- storage implementation
- gestures
- platform accessibility APIs
- native capabilities
- platform-specific interaction patterns

The architecture must avoid both extremes:

Bad model A

Duplicate the entire application independently in Web and Mobile.

Bad model B

Force Web and Mobile into identical UI/platform abstractions.

The target is:

                 Shared
        ┌─────────────────────┐
        │ Domain              │
        │ Application         │
        │ Use Cases           │
        │ Contracts           │
        │ Learning Logic      │
        │ Assessment Logic    │
        │ Telemetry Contracts │
        └─────────┬───────────┘
                  │
          ┌───────┴────────┐
          │                │
         Web            Mobile
          │                │
     Web adapters     Native adapters
     Web navigation   Mobile navigation
     Web UI           Mobile UI

---

9. P10.4 — Navigation Architecture

Define and enforce a coherent navigation model.

The conceptual learning journey should support a structure similar to:

Program
  ↓
Subject
  ↓
Curriculum Version
  ↓
Domain
  ↓
Evidence
  ↓
Lesson / Practice
  ↓
Assessment
  ↓
Results
  ↓
Mastery
  ↓
Remediation

Navigation must correctly preserve educational context.

A route should not depend on hidden BXM assumptions.

Deep links, restoration, authenticated routing, protected routes, and navigation state should have explicit ownership.

Web and Mobile may implement navigation differently while preserving equivalent product semantics.

---

10. P10.5 — State Architecture

Classify frontend state explicitly.

At minimum distinguish:

UI State

Examples:

- modal visibility
- selected tab
- expanded section
- local form state

Session State

Examples:

- authenticated user
- current session
- active identity

Application State

Examples:

- active learning context
- current workflow
- assessment session

Server State

Examples:

- curriculum data
- lessons
- assessment data
- progress

Persistent / Offline State

Examples:

- locally cached content
- pending actions
- sync queue
- offline progress

Derived State

Examples:

- mastery percentage
- completion status
- eligibility
- recommendation state

Avoid maintaining multiple competing sources of truth.

Document which state belongs where and how it moves between layers.

---

11. P10.6 — Data Fetching and Service Boundaries

Establish a consistent data-access path.

Preferred model:

UI
 ↓
Application action / use case
 ↓
Repository / client interface
 ↓
API adapter
 ↓
Service

UI components should not scatter:

- fetch calls
- authentication headers
- request construction
- retry logic
- persistence details
- synchronization behavior

The exact implementation may vary by platform, but responsibility must remain consistent.

---

12. P10.7 — Generalized Content and Domain Consumption

P9 established generalized program/subject/curriculum architecture.

P10 must ensure the frontend actually consumes that generalized architecture.

Frontend code must not assume:

BXM Matemática

where the underlying contract is:

Program
Subject
CurriculumVersion
Domain
Evidence

Remove accidental frontend assumptions such as:

- BXM-specific route structures
- BXM-specific labels embedded in generic components
- BXM-specific feature names
- hardcoded subject identifiers
- hardcoded evidence identifiers
- subject-specific assessment UI logic

BXM-specific content may remain in actual content/configuration.

The distinction is:

Valid:
BXM Matemática is content/data.

Invalid:
The frontend architecture assumes BXM Matemática is the only subject.

---

13. P10.8 — Design System Architecture

Establish structural design-system boundaries without redesigning the visual language.

Define a hierarchy such as:

Design Tokens
    ↓
Primitives
    ↓
Patterns
    ↓
Feature Components
    ↓
Screens

Clarify ownership of:

- typography
- spacing
- sizing
- controls
- feedback states
- cards
- navigation elements
- forms
- assessment controls
- progress indicators

Avoid feature-specific duplication of foundational UI.

This milestone does not require changing visual styling unless required to consolidate architecture.

---

14. P10.9 — Standard UI State Architecture

Define reusable handling for:

- loading
- empty
- error
- retry
- success
- unauthorized
- forbidden
- expired
- offline
- syncing
- sync failed
- conflict
- unavailable
- partial data

These states should be represented consistently across features.

Avoid each screen inventing its own lifecycle/state model.

---

15. P10.10 — Offline and Sync Architecture

Align frontend implementation with the hardened synchronization architecture established in P8.

Define the boundary between:

UI
 ↓
Application action
 ↓
Local durable state / action queue
 ↓
Sync engine
 ↓
Server acknowledgement
 ↓
Reconciliation
 ↓
Updated application state

Frontend components must not directly implement synchronization protocols.

Verify that offline-capable flows have clear semantics for:

- local writes
- pending actions
- acknowledgement
- retries
- reconciliation
- failure
- conflict
- restored connectivity

Do not redesign the backend sync system during P10.

---

16. P10.11 — Access and Entitlement Architecture

Establish one canonical frontend access boundary.

Avoid scattered logic such as:

if (isPro)
if (user?.subscription)
if (hasAccess)
if (plan === ...)

unless these checks resolve through the canonical access/entitlement abstraction.

The architecture should distinguish:

Identity
    ↓
Authentication
    ↓
Entitlement / Capability
    ↓
Feature Access

UI should consume capability decisions rather than recreate entitlement rules.

---

17. P10.12 — Telemetry Integration

Align frontend telemetry with the canonical telemetry model from P8/P9.

Telemetry should have:

- stable event naming
- contextual metadata
- program context
- subject context
- curriculum version context
- user/session context where appropriate
- consistent failure handling

Feature code should emit telemetry through a defined application-facing interface rather than importing transport details.

Telemetry must never become a dependency that prevents core learning functionality from operating.

---

18. P10.13 — Accessibility Architecture

Accessibility should be treated as an architectural concern rather than a final visual QA task.

Define reusable conventions for:

- semantic controls
- keyboard navigation
- focus management
- screen-reader labels
- touch targets
- contrast
- error announcements
- form validation
- loading announcements
- reduced motion
- accessible navigation
- accessible assessment controls

Web and Mobile should each follow platform-appropriate accessibility semantics.

---

19. P10.14 — Frontend Testing Architecture

Define testing responsibility by layer.

Unit

For:

- domain transformations
- application logic
- state transitions
- utilities

Feature

For:

- learning workflows
- assessment workflows
- remediation
- access
- sync behavior

Contract

For:

- API contracts
- generalized content structures
- telemetry structures
- shared domain interfaces

Integration

For:

- application → repository
- application → persistence
- application → API
- application → telemetry

End-to-End

For critical user journeys.

At minimum verify the generalized learning path:

Program
 → Subject
 → Curriculum
 → Evidence
 → Learning
 → Assessment
 → Result
 → Mastery
 → Remediation

Include both BXM Matemática and the P9 second-subject architectural fixture where appropriate.

---

20. P10.15 — Architectural Boundary Enforcement

Architecture must be enforceable rather than merely documented.

Review and establish:

- package dependency rules
- import restrictions
- UI → infrastructure restrictions
- domain → UI restrictions
- platform boundary restrictions
- feature dependency rules
- shared package boundaries
- forbidden legacy imports

Use existing tooling where possible:

typecheck
lint
boundary checks
tests
build

Add lightweight architectural tests where current tooling cannot enforce important boundaries.

The goal is to prevent architecture regression after P10.

---

21. P10.16 — Legacy Architecture Cleanup

Identify and remove or quarantine obsolete frontend architecture.

This includes:

- deprecated entrypoints
- unused routing systems
- obsolete component trees
- duplicate state systems
- abandoned API clients
- legacy architecture documentation
- stale comments
- dead feature modules
- obsolete BXM-specific abstractions
- temporary POC structures still presented as production architecture

Do not delete uncertain code solely because it looks old.

Classify it first as:

Active
Required compatibility
Migration support
Deprecated
Dead

Remove only where confidence is sufficient.

---

22. P10.17 — Documentation Synchronization

Update frontend architectural documentation so it reflects the implementation that actually exists after P10.

Documentation must clearly identify:

- Web entrypoint
- Mobile entrypoint
- shared frontend packages
- frontend layers
- feature boundaries
- navigation architecture
- state architecture
- API/repository boundaries
- offline/sync boundaries
- telemetry boundaries
- entitlement boundaries
- testing architecture
- architectural constraints

Resolve contradictions between current documentation and the P7–P9 implementation.

Documentation should not describe the frontend as an early React/Vite proof of concept if that is no longer the production architecture.

Where previous frontend architecture documents are obsolete, explicitly mark them as historical rather than allowing competing “current” architectures.

---

23. P10.18 — Architecture Decision Records

Record significant decisions made during P10.

ADRs should be concise and cover decisions such as:

- canonical frontend layering
- shared Web/Mobile responsibilities
- state ownership
- data-access boundary
- navigation architecture
- offline/sync boundary
- entitlement boundary
- design-system structure
- architectural enforcement

Do not create ADRs for trivial implementation details.

---

24. Verification Requirements

P10 is complete only after the resulting architecture passes the full verification suite.

At minimum:

npm run build
npm run typecheck
npm run lint
npm run check:boundaries
npm test

plus all platform-specific Web/Mobile validation currently required by the repository.

Verification must include:

Web

- production build
- typecheck
- lint
- routing/navigation
- critical learning flows
- generalized subject context

Mobile

- build/typecheck
- navigation
- critical learning flows
- offline/sync boundaries
- generalized subject context

Shared

- package tests
- domain contracts
- assessment
- learning loop
- telemetry
- state isolation
- boundary checks

---

25. P10 Acceptance Gates

P10 is accepted only when all of the following are satisfied.

Gate 1 — Architecture Baseline

Actual Web and Mobile architecture is documented and understood.

Status: Implemented / Verified

---

Gate 2 — Canonical Layering

Frontend dependencies follow the canonical presentation → application → domain → infrastructure direction.

Status: Implemented / Verified

---

Gate 3 — Feature Boundaries

Major product capabilities have intentional feature/module boundaries.

Status: Implemented / Verified

---

Gate 4 — Web/Mobile Architecture

Shared behavior and platform-specific behavior have explicit boundaries.

Status: Implemented / Verified

---

Gate 5 — Navigation

Web and Mobile provide coherent navigation through generalized educational context.

Status: Implemented / Verified

---

Gate 6 — State

State ownership is explicit and competing sources of truth have been reduced/eliminated.

Status: Implemented / Verified

---

Gate 7 — Data Access

API, repository, persistence, and application boundaries are explicit.

Status: Implemented / Verified

---

Gate 8 — Generalized Content

Frontend consumes generalized Program/Subject/CurriculumVersion/etc. contracts without accidental BXM coupling.

Status: Implemented / Verified

---

Gate 9 — Offline/Sync

Offline and synchronization behavior has clear frontend boundaries aligned with P8.

Status: Implemented / Verified

---

Gate 10 — Access/Entitlement

Authentication, capability, and feature-access concerns have canonical boundaries.

Status: Implemented / Verified

---

Gate 11 — Telemetry

Frontend telemetry follows the generalized P8/P9 telemetry architecture.

Status: Implemented / Verified

---

Gate 12 — Accessibility

Reusable accessibility architecture exists for major interaction patterns.

Status: Implemented / Verified

---

Gate 13 — Testing

Frontend architecture has appropriate unit, feature, integration, contract, and E2E coverage.

Status: Implemented / Verified

---

Gate 14 — Boundary Enforcement

Architectural dependency rules are enforced automatically where practical.

Status: Implemented / Verified

---

Gate 15 — Legacy Cleanup

Obsolete frontend architecture is removed or explicitly quarantined.

Status: Implemented / Verified

---

Gate 16 — Documentation

Current frontend architecture documentation matches implementation.

Status: Implemented / Verified

---

Gate 17 — Regression

Existing P0–P9 functionality remains operational.

Status: Implemented / Verified

---

Gate 18 — Architecture Acceptance

A developer can implement a new Educación Abierta subject feature without:

- understanding BXM-specific implementation assumptions
- bypassing application/domain boundaries
- duplicating Web/Mobile business logic
- inventing a new state architecture
- inventing a new API-access pattern
- inventing a new telemetry pattern
- creating a parallel frontend architecture

Status: Implemented / Verified

---

26. Required BXM Compatibility

P10 must preserve existing BXM Matemática functionality.

Refactoring must not:

- change curriculum semantics
- invalidate existing assessments
- change mastery calculations
- break remediation
- break continuity
- break offline synchronization
- remove existing learning flows

Where architectural changes require migration adapters, those adapters should be explicit and temporary.

---

27. Required Generalization Validation

P9 established Educación Cívica as the second-subject architectural fixture.

P10 should use that existing fixture to validate frontend architecture.

The requirement is not to create a complete Cívica frontend product.

Instead verify that the frontend architecture can consume:

BXM Matemática
+
BXM Educación Cívica

through the same generalized architecture.

The important test is architectural coexistence, not content volume.

---

28. Required BXM Coupling Audit

Perform a final frontend-specific search for:

BXM
Matemática
specific subject IDs
specific evidence IDs
hardcoded curriculum assumptions
subject-specific route assumptions
subject-specific UI assumptions

Classify every remaining reference as:

1. legitimate content/data
2. legitimate fixture/test
3. compatibility/migration
4. documentation
5. accidental architectural coupling

Remove accidental coupling.

Do not remove legitimate BXM content merely because the architecture is generalized.

---

29. Implementation Strategy

P10 should be executed incrementally.

Do not perform a blind repository-wide rewrite.

Recommended order:

P10.0 Audit
   ↓
P10.1 Layering
   ↓
P10.2 Feature boundaries
   ↓
P10.3 Shared Web/Mobile boundaries
   ↓
P10.4 Navigation
   ↓
P10.5 State
   ↓
P10.6 Data access
   ↓
P10.7 Domain/content consumption
   ↓
P10.8 Design system
   ↓
P10.9 UI states
   ↓
P10.10 Offline/sync
   ↓
P10.11 Access/entitlement
   ↓
P10.12 Telemetry
   ↓
P10.13 Accessibility
   ↓
P10.14 Testing
   ↓
P10.15 Enforcement
   ↓
P10.16 Legacy cleanup
   ↓
P10.17 Documentation
   ↓
P10.18 ADRs
   ↓
Verification

The order may be adjusted when repository dependencies require it, but scope should remain unchanged.

---

30. Change Discipline

Every architectural change should answer:

1. What problem does this solve?
2. Which architectural boundary does it establish or improve?
3. Does it reduce duplication or coupling?
4. Does it preserve current behavior?
5. Does it improve Web/Mobile scalability?
6. Does it preserve generalized Educación Abierta support?
7. Can the architecture be enforced after the change?

Avoid refactoring merely because another structure appears cleaner.

---

31. Deliverables

P10 should produce:

Code

- consolidated frontend architecture
- intentional feature boundaries
- shared application/domain boundaries
- platform adapters
- canonical state/data boundaries
- generalized content consumption
- standardized UI lifecycle states
- offline/sync integration
- access/entitlement boundary
- telemetry integration
- accessibility foundations
- architectural enforcement

Documentation

At minimum:

project_docs/P10_EXECUTION.md

and the current frontend architecture documentation required by the repository.

Include ADRs for major architectural decisions.

---

32. P10 Execution Report

"P10_EXECUTION.md" must document:

- starting frontend architecture
- architectural problems discovered
- changes implemented
- files/packages affected
- new boundaries
- shared Web/Mobile responsibilities
- generalized-content validation
- offline/sync integration
- telemetry integration
- testing architecture
- boundary enforcement
- legacy code removed/quarantined
- documentation changes
- verification results
- unresolved issues
- deferred work
- P11 recommendations

For every acceptance gate, explicitly record:

Implemented
Verified
Deferred
Blocked

Do not mark an item Verified merely because code exists.

---

33. Deferred Work

Potentially valid downstream work includes:

- visual redesign
- complete design-system refinement
- additional subjects
- mass content authoring
- payment implementation
- infrastructure evolution
- production deployment topology
- deeper offline conflict resolution
- native platform optimization
- advanced analytics UX

These should not expand P10 unless an existing architecture requirement cannot be satisfied without them.

---

34. P11 Handoff

P10 should leave P11 with a stable frontend architecture rather than another frontend restructuring milestone.

The P11 handoff should identify:

- remaining frontend product work
- content implementation needs
- UX improvements
- platform-specific work
- technical debt that genuinely remains
- architecture decisions that should now be considered stable

P11 should build on the P10 architecture rather than replace it.

---

35. Definition of Done

P10 is complete when:

«The Web and Mobile frontends share a coherent application/domain architecture, use intentional platform boundaries, consume generalized Educación Abierta concepts, maintain explicit state/data/navigation/offline/telemetry/access boundaries, enforce dependency direction, and no longer require BXM-specific assumptions to implement future subject features.»

The final architecture should make the following development pattern natural:

Add new Subject
      ↓
Register Program/Subject/Curriculum
      ↓
Provide generalized content
      ↓
Reuse existing frontend architecture
      ↓
Reuse learning/assessment/application flows
      ↓
Render subject-specific content through existing features

rather than:

Add new Subject
      ↓
Create new screens
      ↓
Create new state
      ↓
Create new API calls
      ↓
Create new assessment logic
      ↓
Create new telemetry
      ↓
Create another frontend architecture

That distinction is the primary architectural success criterion for P10.
