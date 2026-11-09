P11 — Frontend Product Surface Maturation & Generalized Experience

Status: Proposed
Depends on: P0–P10
Primary scope: Web + Mobile product experience built on the P10 frontend architecture
Architecture baseline: "project_docs/architecture/"
P10 evidence: "project_docs/P10_EXECUTION.md"

---

1. Objective

P11 transitions the project from frontend architecture consolidation into frontend product maturation.

P10 established and verified the frontend architecture:

Presentation
    ↓
Feature / Application
    ↓
Domain Contracts
    ↓
Infrastructure / Platform Adapters

P11 must now demonstrate that this architecture can support meaningful product development without introducing parallel state systems, API patterns, platform duplication, or subject-specific architecture.

The primary objective is:

«Build and mature the learner-facing product surfaces using the architecture established in P10, while validating generalized Educación Abierta support through additional subject content and improving the quality of the Web and Mobile experiences.»

P11 is therefore not another frontend restructuring milestone.

---

2. P11 Architectural Principle

P11 follows this rule:

P10
Establish the architecture
        ↓
P11
Build the product with the architecture
        ↓
P12+
Scale content, subjects, platform capabilities,
and production readiness

Architectural changes during P11 are permitted only when implementation evidence demonstrates that a P10 boundary is insufficient.

Do not introduce abstractions merely because another structure appears cleaner.

---

3. P11 Scope

P11 covers:

1. Frontend product-surface maturation
2. Longitudinal progress UX
3. Generalized multi-subject experience
4. Learning → Practice → Assessment → Results → Remediation UX
5. Web/Mobile experience parity
6. Responsive and native interaction quality
7. Accessibility implementation
8. Standardized loading/error/offline/sync states
9. Content-driven frontend rendering
10. Subject-context preservation
11. Frontend telemetry validation
12. UX-level testing
13. Platform-specific frontend improvements
14. Remaining P10 technical debt
15. Documentation synchronization

---

4. Explicit Non-Goals

P11 must not become:

- another frontend architecture rewrite
- a replacement for the P10 layering model
- a React replacement
- a new Expo migration
- a native Kotlin/Swift rewrite
- a backend redesign
- a database redesign
- a payment implementation
- mass curriculum authoring without appropriate content governance
- a new telemetry architecture
- a new state-management architecture
- a new API-access pattern
- a visual redesign of the entire product solely for aesthetic reasons

If an architectural deficiency is discovered, first determine whether it is:

1. a genuine P10 architectural defect,
2. a product implementation gap,
3. technical debt,
4. or a future architectural decision.

Do not automatically expand P11.

---

5. P11.0 — Architecture-to-Product Readiness Audit

Before implementing new product surfaces, audit the P10 architecture from the perspective of feature development.

Verify that a developer can implement a new feature using:

Screen
  ↓
Feature
  ↓
Application action
  ↓
Shared contract
  ↓
Repository / API / platform adapter

Verify that the following do not require new architectural patterns:

- new lesson
- new evidence
- new practice activity
- new assessment
- new result surface
- new remediation action
- new subject
- new progress metric

Deliverable

Produce:

"project_docs/P11_FRONTEND_READINESS_AUDIT.md"

Classify findings:

- Ready
- Minor gap
- Technical debt
- Architecture defect
- Deferred

Do not refactor automatically as part of the audit.

---

6. P11.1 — Generalized Educational Context

Make the generalized educational hierarchy a first-class frontend experience:

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

The frontend must preserve this context throughout navigation.

Subject-specific content should come from data/configuration.

Generic components must not become subject-specific.

Validate at minimum:

- BXM Matemática
- BXM Educación Cívica 02-2026

The purpose is architectural coexistence, not equivalent content volume.

---

7. P11.2 — Learner Home / Progress Experience

Mature Mi Progreso into an actionable longitudinal learner surface.

Use the longitudinal data established in P8.

The experience should communicate:

- current progression status
- diagnostic completion
- practice activity
- mock performance
- simulation performance
- domain/evidence mastery
- historical performance
- remediation priorities
- recommended next action

The dashboard should remain a decision surface, not merely an analytics dashboard.

Preferred conceptual model:

Current State
      ↓
What needs attention?
      ↓
Why?
      ↓
What should I do?
      ↓
Practice / Learn / Retest
      ↓
Updated State

Avoid exposing raw analytics merely because the backend provides them.

---

8. P11.3 — Complete Learning Loop UX

Verify and mature the complete learner loop:

Diagnose
   ↓
Learn
   ↓
Practice
   ↓
Simulate
   ↓
Results
   ↓
Mastery
   ↓
Remediation
   ↓
Retest
   ↓
Updated Mastery

Each transition should preserve educational context.

Examples:

- diagnostic weakness → relevant evidence
- evidence → lesson
- lesson → practice
- practice → mastery
- mock weakness → remediation
- remediation → targeted learning
- retest → updated mastery
- mastery → next recommended action

The objective is to eliminate dead-end learning states.

---

9. P11.4 — Standard UI Lifecycle Implementation

P10 established the lifecycle architecture.

P11 should apply it consistently to real product surfaces.

Standardize handling for:

Loading
Empty
Error
Retry
Success
Unauthorized
Forbidden
Expired
Offline
Syncing
Sync Failed
Conflict
Partial Data
Unavailable

Screens should not invent incompatible lifecycle behavior.

Particular attention should be given to:

- slow network conditions
- offline startup
- restored sessions
- failed submissions
- interrupted assessments
- pending synchronization
- stale data
- authentication expiry

---

10. P11.5 — Assessment Experience Maturation

Mature the assessment UI without changing the assessment domain rules.

Cover:

- diagnostic
- formative mock
- official simulation
- question navigation
- answer persistence
- bookmarking
- unanswered filtering
- timer behavior
- submission
- expiration
- results
- remediation routing

The frontend must consume the existing assessment contracts rather than recreate scoring or compilation logic.

Assessment behavior should remain shared between Web and Mobile wherever appropriate.

---

11. P11.6 — Web/Mobile Experience Parity

Establish semantic parity without forcing identical UI implementations.

Both platforms should support equivalent:

- learning context
- lesson progression
- practice
- assessment
- results
- mastery
- remediation
- entitlement behavior
- offline semantics
- sync semantics

Platform-specific interaction should be preserved where it improves the experience.

Examples:

Shared
- workflow
- domain behavior
- application actions
- validation
- telemetry semantics

Web
- browser navigation
- keyboard interaction
- desktop layouts

Mobile
- native navigation
- touch interaction
- device APIs
- native accessibility

---

12. P11.7 — Accessibility Implementation

P10 established accessibility architecture.

P11 applies it systematically to product surfaces.

Verify:

- semantic navigation
- keyboard navigation
- focus management
- screen-reader labels
- accessible forms
- validation announcements
- assessment controls
- touch target sizing
- contrast
- reduced motion
- loading announcements
- error announcements
- modal focus behavior

Accessibility acceptance must be based on actual interaction behavior rather than token existence alone.

---

13. P11.8 — Responsive and Native Interaction Quality

Improve interaction quality across:

Web

- mobile viewport
- tablet
- desktop
- keyboard navigation
- browser refresh/deep links
- long content
- assessment layouts

Mobile

- Android
- iOS
- small screens
- large screens
- touch targets
- safe areas
- keyboard/input behavior
- navigation gestures
- offline transitions

Avoid platform-specific redesign unless the interaction model requires it.

---

14. P11.9 — Content-Driven Frontend Rendering

Strengthen the distinction between:

Content/Data
        vs.
Frontend Architecture

Valid:

BXM Matemática
BXM Educación Cívica
specific lesson content
specific evidence
specific domain
specific assessment blueprint

Invalid:

if subject === "matematica"
    use MatemáticaScreen()

if subject === "civica"
    use CívicaScreen()

unless the difference represents a genuine content-driven rendering requirement.

The frontend should primarily respond to generalized content structures.

---

15. P11.10 — Telemetry Validation

P8/P9/P10 already established the telemetry architecture.

P11 validates that real product interactions produce useful telemetry.

Verify events for:

- session
- lesson
- evidence practice
- diagnostic
- mock
- simulation
- question interaction
- remediation
- progress
- sync
- entitlement
- errors

Telemetry must remain:

- asynchronous
- sanitized
- non-blocking
- generalized
- contextual

Telemetry failures must never prevent learning functionality.

---

16. P11.11 — Frontend Testing Maturation

Expand testing around actual product journeys.

Unit

Application transformations and state transitions.

Feature

Learning, assessment, progress, remediation, entitlement.

Integration

Application → repository → API/persistence.

Contract

Generalized educational structures and API contracts.

E2E

Critical learner journeys.

At minimum:

Program
 ↓
Subject
 ↓
Curriculum
 ↓
Domain
 ↓
Evidence
 ↓
Lesson
 ↓
Practice
 ↓
Assessment
 ↓
Results
 ↓
Mastery
 ↓
Remediation

Validate both Matemática and Cívica where the generalized behavior is relevant.

---

17. P11.12 — Remaining P10 Technical Debt

Review the P10 execution report and repository for genuine residual work.

Each item must be classified:

A — Fix in P11

Blocks product development or violates established architecture.

B — Defer

Does not materially affect current product development.

C — Architectural decision

Requires a separate architectural decision or milestone.

D — Accept

Intentional and no action required.

Do not create work merely to make the repository appear cleaner.

---

18. P11.13 — Documentation Synchronization

Update frontend documentation to reflect the actual post-P11 product architecture.

Documentation should explain:

- frontend entrypoints
- feature boundaries
- application layer
- domain consumption
- platform adapters
- navigation
- state ownership
- lifecycle states
- generalized educational context
- offline behavior
- telemetry
- accessibility
- testing
- subject extensibility

Historical POC architecture must remain clearly identified as historical.

---

19. Acceptance Gates

Gate 1 — Architecture Reuse

New frontend features use the P10 architecture without introducing parallel patterns.

Required: Verified

Gate 2 — Generalized Context

Matemática and Cívica can coexist through the same frontend architecture.

Required: Verified

Gate 3 — Learning Loop

The complete learner loop is navigable without architectural workarounds.

Required: Verified

Gate 4 — Progress Experience

Longitudinal progress data produces an actionable learner experience.

Required: Verified

Gate 5 — Assessment UX

Assessment flows are coherent across Web and Mobile.

Required: Verified

Gate 6 — Lifecycle States

Loading, empty, error, offline, syncing, conflict, and recovery states are implemented consistently.

Required: Verified

Gate 7 — Accessibility

Major learner interactions satisfy platform-appropriate accessibility requirements.

Required: Verified

Gate 8 — Responsive / Native Quality

Web and Mobile interactions remain usable across supported environments.

Required: Verified

Gate 9 — Telemetry

Major learner interactions emit correct generalized telemetry without blocking functionality.

Required: Verified

Gate 10 — Testing

Critical generalized learning journeys have automated coverage.

Required: Verified

Gate 11 — Boundary Preservation

P10 architectural boundaries remain intact.

Required: Verified

Gate 12 — Regression

P0–P10 behavior remains operational.

Required: Verified

Gate 13 — Product Readiness

A developer can implement another subject/content surface primarily by providing generalized content/configuration rather than creating new frontend architecture.

Required: Verified

---

20. Verification

At minimum:

npm run build
npm run typecheck
npm run lint
npm run check:boundaries
npm test

Additionally:

Web
- production build
- responsive validation
- navigation/deep-link validation
- critical learning journeys
- accessibility validation

Mobile
- Android build
- iOS build
- navigation
- assessment
- offline behavior
- accessibility
- platform interaction validation

Shared
- generalized domain contracts
- assessment behavior
- learning loop
- telemetry
- state isolation
- boundary checks

Where physical-device verification is unavailable, clearly distinguish:

Automated / emulator evidence
vs.
Physical-device evidence

Do not mark physical-device acceptance based solely on bundle generation.

---

21. Implementation Order

Recommended sequence:

P11.0 Readiness Audit
        ↓
P11.1 Generalized Educational Context
        ↓
P11.2 Progress / Longitudinal UX
        ↓
P11.3 Complete Learning Loop
        ↓
P11.4 UI Lifecycle Implementation
        ↓
P11.5 Assessment UX
        ↓
P11.6 Web/Mobile Parity
        ↓
P11.7 Accessibility
        ↓
P11.8 Responsive / Native Quality
        ↓
P11.9 Content-Driven Rendering
        ↓
P11.10 Telemetry Validation
        ↓
P11.11 Testing Maturation
        ↓
P11.12 Technical Debt
        ↓
P11.13 Documentation
        ↓
Final Verification

The order may change based on repository dependencies, but P11 scope must remain controlled.

---

22. Change Discipline

Every significant P11 change should answer:

1. Does this use the P10 architecture?
2. Does it improve the learner experience?
3. Does it preserve generalized Program/Subject/Curriculum behavior?
4. Does it avoid duplicating Web/Mobile application logic?
5. Does it preserve offline/sync semantics?
6. Does it preserve telemetry and entitlement boundaries?
7. Can the behavior be tested?
8. Does this belong in P11 rather than a future milestone?

If the answer to #8 is unclear, defer rather than expand scope.

---

23. P11 Deliverables

Code

- matured learner-facing frontend surfaces
- generalized subject-aware rendering
- progress experience
- complete learning-loop navigation
- standardized lifecycle states
- mature assessment UX
- accessibility implementation
- responsive/native interaction improvements
- telemetry validation
- expanded product-level tests

Documentation

project_docs/P11_EXECUTION.md
project_docs/P11_FRONTEND_READINESS_AUDIT.md

Update relevant architecture documentation only when implementation changes the established architecture.

Do not rewrite architecture documentation merely to describe ordinary feature implementation.

---

24. P11 Execution Report

"P11_EXECUTION.md" must document:

- initial P10 architectural baseline
- readiness audit
- product gaps discovered
- features implemented
- generalized subject validation
- Web/Mobile behavior
- accessibility work
- lifecycle state implementation
- telemetry validation
- testing
- technical debt classification
- verification results
- unresolved issues
- deferred work
- P12 recommendations

For every acceptance gate record:

Implemented
Verified
Deferred
Blocked

Never mark Verified solely because code exists.

---

25. P12 Handoff

P11 should leave the project ready to transition from frontend maturation toward broader product scale.

Potential P12 areas include:

- additional subject/content rollout
- content ingestion and publication workflows
- production infrastructure
- native platform capabilities
- commercial/entitlement implementation
- advanced analytics
- notifications
- broader offline optimization
- production deployment
- operational scaling

P12 should be selected based on the evidence produced by P11 rather than predetermined assumptions.

---

26. Definition of Done

P11 is complete when:

«The P10 frontend architecture is being successfully used as the foundation for a coherent, accessible, generalized learner experience across Web and Mobile, with the complete learning loop operational, longitudinal progress actionable, subject context preserved, and additional subject experiences implementable without introducing parallel frontend architecture.»

The desired development pattern is:

New Subject
     ↓
Register generalized content
     ↓
Existing application architecture
     ↓
Existing learning / assessment flows
     ↓
Existing frontend components
     ↓
Subject-specific content rendered

not:

New Subject
     ↓
New screens
     ↓
New state
     ↓
New API client
     ↓
New assessment logic
     ↓
New telemetry
     ↓
New architecture

This is the primary architectural and product success criterion for P11.
