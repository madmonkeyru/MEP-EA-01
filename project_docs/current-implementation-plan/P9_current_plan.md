Below is a full P9 Implementation Plan designed as the architectural/product transition after P8. The key objective is to make BXM Matemática a true first implementation of a generalized Educación Abierta platform, rather than allowing BXM-specific assumptions to become permanent architecture.

P9 — Educación Abierta Generalization & Coverage Architecture

Milestone: P9
Name: Educación Abierta Generalization & Coverage Architecture
Objective: Validate and generalize the existing platform architecture so it can support the full Educación Abierta program portfolio, subjects, curricula, evidence, lessons, question banks, assessments, mastery and remediation flows—using BXM Matemática as the first complete implementation.

Primary prerequisite: P8 — Operational Hardening & Telemetry Productization

Architecture authority: project_docs/architecture/


---

1. P9 Objective

P9 is the transition from:

> “A robust BXM Matemática platform”



to:

> “A robust Educación Abierta platform with BXM Matemática as its first implemented subject.”



The purpose is not to populate every subject yet.

The purpose is to prove that the existing architecture, domain model, content model, assessment system, learning loop, persistence model, telemetry, and client architecture can represent the broader Educación Abierta product without requiring BXM-specific forks.

P9 therefore establishes the generalized platform contracts and a coverage model that future content-production milestones can execute against.


---

2. Strategic Goal

The long-term product target is:

Educación Abierta
│
├── Programs
│   ├── Subjects
│   │   ├── Curriculum / Convocatoria
│   │   ├── Domains
│   │   ├── Evidence
│   │   ├── Lessons
│   │   ├── Practice
│   │   ├── Question Pools
│   │   ├── Assessment Blueprints
│   │   ├── Mastery
│   │   └── Remediation
│   │
│   └── ...
│
└── ...

BXM Matemática is the first vertical implementation, not the architectural model for all future content by default.

P9 must determine which concepts are:

- genuinely platform-wide,
- program-specific,
- subject-specific,
- curriculum-version-specific,
- assessment-specific,
- or content-specific.


---

3. P9 Success Definition

P9 is complete when the team can demonstrate:

1. Program portability

A second Educación Abierta program/subject can be represented without introducing a new domain architecture.

2. Subject portability

The learning loop is not hard-coded to Matemática.

3. Curriculum portability

Different curriculum structures and convocatoria/version identifiers can coexist.

4. Assessment portability

Assessment compilation is driven by configurable curriculum/blueprint data rather than BXM-specific assumptions.

5. Content portability

Lessons, evidence, questions and references use generic content contracts.

6. Learning-loop portability

The same:

Evidence
→ Practice
→ Assessment
→ Mastery
→ Remediation
→ Retest

works across subjects.

7. Coverage visibility

The repository has a canonical matrix showing what exists, what is missing, and what is approved for every target program/subject.

8. No BXM forks

Adding another subject does not require duplicating:

- services,
- domain logic,
- assessment engines,
- learner flows,
- telemetry,
- persistence models,
- or client architecture.


---

4. P9 Architectural Principles

4.1 Generalize by abstraction, not configuration sprawl

Do not create dozens of if program === "bxm" branches.

Prefer domain concepts such as:

Program
Subject
CurriculumVersion
Domain
Evidence
Lesson
Question
QuestionPool
AssessmentBlueprint
MasteryModel
RemediationRule


---

4.2 Content is data

Curriculum and subject differences should primarily be represented through content/configuration data.

They should not require new application architecture.


---

4.3 Domain behavior remains centralized

Rules such as:

- scoring,
- mastery,
- assessment compilation,
- attempt handling,
- continuity,
- synchronization,

remain domain/application behavior.

Content should configure those behaviors rather than duplicate them.


---

4.4 BXM-specific behavior must be intentional

A BXM-specific rule is acceptable only when the domain genuinely requires it.

Document every remaining BXM-specific assumption and classify it:

GENERIC
PROGRAM-SPECIFIC
SUBJECT-SPECIFIC
CURRICULUM-SPECIFIC
TEMPORARY / MIGRATION


---

5. P9 Scope

P9 has seven implementation areas:

Area	Objective

P9.1 Domain Generalization Audit	Identify and eliminate accidental BXM coupling
P9.2 Program/Curriculum Model	Establish generalized hierarchy and versioning
P9.3 Content Model Generalization	Make evidence, lessons, questions and references portable
P9.4 Assessment Generalization	Make compilation blueprint/curriculum-driven
P9.5 Learning Loop Generalization	Generalize mastery/remediation across subjects
P9.6 Coverage & Content Readiness Matrix	Establish complete Educación Abierta coverage model
P9.7 Multi-Subject Validation	Prove the generalized architecture with a second subject/program fixture



---

6. P9.1 — Domain Generalization Audit

Objective

Audit the current implementation for assumptions that implicitly make BXM Matemática the platform's architecture.

Search for hard-coded assumptions involving:

bxm
matematica
02-2026
mathematics-specific domains
mathematics-specific evidence
mathematics-specific scoring
BXM-specific routes
BXM-specific telemetry
BXM-specific mastery logic
BXM-specific assessment sizes

Also inspect:

- shared packages,
- service APIs,
- database schema,
- seed data,
- Web routes,
- Mobile navigation,
- assessment compilation,
- telemetry,
- tests,
- fixtures,
- configuration,
- content ingestion.


---

6.1 Classify every BXM dependency

Create a table:

Dependency	Classification	Action

programId = bxm	domain data	generalize
Mathematics subject	content	generalize
Mathematics scoring rule	possibly subject-specific	validate
Official simulation blueprint	curriculum/config	generalize
Evidence taxonomy	platform/content	generalize
Lesson structure	platform/content	generalize
Mastery algorithm	domain	generalize
Exam-specific constraint	subject/program	preserve if justified


Acceptance criteria

Every material BXM assumption is classified.

No unexplained BXM-specific architectural dependency remains.


---

7. P9.2 — General Program & Curriculum Model

Objective

Establish the canonical hierarchy for representing Educación Abierta.

The minimum conceptual model should support:

Program
  ↓
Subject
  ↓
CurriculumVersion
  ↓
Domain
  ↓
Evidence

with content and assessment relationships attached appropriately.


---

7.2 Program

A Program represents a major Educación Abierta pathway.

Conceptually:

Program {
  id
  code
  name
  description
  status
}

Do not encode subject behavior into the Program entity.


---

7.3 Subject

Subject {
  id
  programId
  code
  name
  status
}

A subject belongs to a program but remains independently addressable.


---

7.4 CurriculumVersion

Curriculum must be versioned.

Conceptually:

CurriculumVersion {
  id
  subjectId
  version
  effectiveFrom
  effectiveTo?
  sourceReference
  status
}

This is critical because official educational material can change.

Learner progress should remain attributable to the curriculum/version under which it was generated.


---

7.5 Domain

Domains provide subject-specific organization without forcing the domain model to understand the subject itself.

CurriculumVersion
       ↓
Domain
       ↓
Evidence


---

Acceptance criteria

The system can represent:

- multiple programs,
- multiple subjects,
- multiple curriculum versions,
- domains/evidence under each curriculum.

No BXM-specific hierarchy is required.


---

8. P9.3 — Generalized Content Model

Objective

Generalize the content platform so future subjects can use the same content lifecycle.

Content must support:

Official Reference
        ↓
Curriculum
        ↓
Evidence
        ↓
Lesson
        ↓
Practice
        ↓
Question


---

8.1 Evidence

Evidence must be addressable independently of Mathematics.

It should carry enough information to determine:

- what knowledge is represented,
- which curriculum it belongs to,
- its domain,
- its official source/reference.


---

8.2 Lessons

Lessons should reference generalized evidence.

Avoid:

MathLesson
MathEvidence
MathPractice

unless there is a legitimate subject-specific domain reason.

Prefer:

Lesson
Evidence
Question
PracticeItem

with subject-specific content represented as data.


---

8.3 Official references

Official artifacts must retain provenance.

At minimum track:

source
document
page/section where applicable
curriculum version
ingestion status
validation status

This preserves the platform's sovereign/offline ingestion model.


---

8.4 Question bank

Generalize question structure to support:

- subject,
- curriculum version,
- evidence,
- difficulty,
- question type,
- source/provenance,
- editorial state,
- assessment eligibility.

Avoid making the question model inherently mathematical.


---

9. P9.4 — Assessment Generalization

Objective

Turn assessment compilation into a platform capability rather than a BXM capability.

Current behavior must be reviewed for assumptions such as:

bxm
matematica
20 questions
60 questions
specific official simulation
specific domain counts


---

9.1 Generic assessment definition

Conceptually:

AssessmentBlueprint {
  id
  programId
  subjectId
  curriculumVersionId
  mode
  itemRules
  eligibility
  scoringRules
}


---

9.2 Assessment modes

Retain the existing conceptual modes:

diagnostic
mock
simulation

but ensure the mode is not intrinsically coupled to BXM.


---

9.3 Blueprint-driven compilation

Compilation should become:

Subject
   ↓
CurriculumVersion
   ↓
AssessmentBlueprint
   ↓
QuestionPool
   ↓
Eligibility rules
   ↓
Deterministic compilation
   ↓
Assessment

The compiler should not need subject-specific code to select items.


---

9.4 Assessment validation

Validate:

- item counts,
- evidence coverage,
- domain coverage,
- difficulty distribution,
- question eligibility,
- official/proprietary isolation,
- deterministic seed behavior.


---

Acceptance criteria

A second subject can produce a valid assessment using the same compiler and service boundary.

No assessment engine fork is permitted.


---

10. P9.5 — Learning Loop Generalization

Objective

Verify that the learning loop is subject-independent.

The canonical loop remains:

Evidence
   ↓
Practice
   ↓
Assessment
   ↓
Score
   ↓
Mastery
   ↓
Remediation
   ↓
Practice
   ↓
Retest


---

10.1 Mastery

Mastery state must be associated with the appropriate educational identity:

learner
+
program
+
subject
+
curriculum version
+
evidence/domain

Do not store mastery as an inherently BXM-level concept.


---

10.2 Remediation

Remediation should consume generalized signals:

low mastery
incorrect evidence
assessment weakness
insufficient coverage

and return actions associated with generalized content.


---

10.3 Plan de Nivelación

The existing Plan de Nivelación concept should operate across subjects.

The plan may contain subject-specific recommendations, but its underlying orchestration should be generic.


---

10.4 Cross-subject learner state

Verify that a learner can eventually have:

Learner
├── Program A
│   ├── Subject A
│   └── Subject B
└── Program B
    ├── Subject C
    └── Subject D

without overwriting or conflating mastery state.


---

11. P9.6 — Educación Abierta Coverage Matrix

This is a major P9 deliverable.

Objective

Create the canonical implementation roadmap for full Educación Abierta coverage.

The matrix should track every target program and subject.

Recommended structure:

Program	Subject	Curriculum	Official Source	Evidence	Lessons	Questions	Blueprint	Mastery	Editorial	Implementation

BXM	Matemática	✓	✓	✓	partial	partial	✓	✓	partial	POC
BXM	…	…	…	…	…	…	…	…	…	planned
EGBA	…	…	…	…	…	…	…	…	…	planned
…	…	…	…	…	…	…	…	…	…	…


Statuses should be standardized:

NOT_STARTED
DISCOVERED
INGESTED
MODELED
AUTHORED
QA
EDITORIAL_APPROVED
IMPLEMENTED
VERIFIED
RELEASED


---

11.1 Separate content readiness from software readiness

A subject can have:

software support = READY
content = NOT_READY

That is not an architectural failure.

Similarly:

content = available
editorial approval = pending

must remain distinguishable.


---

12. P9.7 — Multi-Subject Validation

This is the critical proof gate.

Do not declare generalization complete based only on refactoring.

Introduce a second subject/program fixture.

The second subject should be representative enough to expose assumptions in:

- curriculum structure,
- evidence hierarchy,
- question types,
- assessment composition,
- mastery,
- remediation,
- content retrieval.

It does not need to be fully authored.


---

12.1 Minimum validation fixture

The second subject should contain enough data to demonstrate:

Program
  ↓
Subject
  ↓
Curriculum
  ↓
2–3 domains
  ↓
multiple evidence nodes
  ↓
sample lessons
  ↓
sample questions
  ↓
assessment blueprint
  ↓
assessment compilation
  ↓
submission
  ↓
mastery
  ↓
remediation


---

12.2 Required result

The same:

- Web architecture,
- Mobile architecture,
- domain packages,
- assessment compiler,
- API,
- persistence model,
- telemetry,
- analytics,
- learning loop,

must support both BXM Matemática and the validation subject.

If implementing the second subject exposes a fundamental BXM dependency, fix the abstraction rather than adding another exception.


---

13. P9.8 — Content Ingestion & Authoring Contract

P9 should establish the contract future content teams/agents will follow.

Document the path:

Official artifact
      ↓
Ingestion
      ↓
Normalization
      ↓
Curriculum mapping
      ↓
Evidence mapping
      ↓
Content authoring
      ↓
Question authoring
      ↓
QA
      ↓
Editorial Gate A–D
      ↓
Publication

The contract should identify which stages are:

- automated,
- human-authored,
- human-reviewed,
- program-specific,
- platform-wide.

This prevents every new subject from inventing its own content pipeline.


---

14. P9.9 — API & Client Generalization

Review service/API contracts for BXM assumptions.

Endpoints should conceptually operate against:

programId
subjectId
curriculumVersionId

rather than implicit BXM context.

Web and Mobile should obtain context from the selected educational scope.

For example:

Program
  ↓
Subject
  ↓
Curriculum
  ↓
Learning

rather than:

/open/bxm/matematica/...

unless such routing is purely a presentation-level concern.


---

15. P9.10 — Telemetry & Analytics Generalization

P8 introduced telemetry.

P9 ensures that telemetry itself understands the broader platform.

Events must be attributable to:

program
subject
curriculum
domain
evidence
lesson
assessment

where relevant.

Analytics must therefore support comparisons such as:

BXM Matemática
vs.
Other Subject

without changing the event model.


---

16. P9.11 — Repository & Package Boundary Review

Review package boundaries after generalization.

Expected conceptual separation:

content
domain
application
service
client
infrastructure
analytics

Subject-specific content should not leak into generic domain packages.

For example:

packages/domain

should not become a repository for Mathematics business rules.

Similarly:

packages/content

may contain BXM data without making BXM the package architecture.


---

17. P9.12 — Migration Strategy

Do not perform a destructive rewrite.

Use an incremental migration.

Phase 1

Introduce generalized identifiers/contracts.

Phase 2

Migrate BXM Matemática onto those contracts.

Phase 3

Remove redundant BXM-specific interfaces.

Phase 4

Add second-subject validation fixture.

Phase 5

Lock generalized architecture with tests.

The system should remain functional throughout the migration.


---

18. P9 Implementation Sequence

Execute in this order.

P9.0 — Repository Baseline

Review:

- P0–P8 execution evidence,
- architecture documents,
- current package boundaries,
- BXM dependencies,
- current content schema,
- assessment compiler,
- persistence,
- telemetry.

Deliverable: Generalization baseline.


---

P9.1 — BXM Coupling Audit

Search and classify every BXM-specific assumption.

Deliverable: BXM Dependency Register.


---

P9.2 — Generalized Domain Model

Implement/adjust:

Program
Subject
CurriculumVersion
Domain
Evidence

Deliverable: generalized educational hierarchy.


---

P9.3 — Generalized Content Contracts

Generalize:

- lessons,
- evidence,
- questions,
- question pools,
- references,
- content metadata,
- editorial state.

Deliverable: portable content model.


---

P9.4 — Generalized Assessment

Generalize:

- blueprints,
- compilation,
- eligibility,
- coverage,
- scoring configuration.

Migrate BXM to the generalized path.

Deliverable: subject-independent assessment engine.


---

P9.5 — Generalized Learning Loop

Generalize:

- mastery,
- remediation,
- continuity,
- Plan de Nivelación,
- retest behavior.

Deliverable: subject-independent learning loop.


---

P9.6 — Coverage Matrix

Create the canonical Educación Abierta coverage inventory.

Deliverable: complete coverage roadmap.


---

P9.7 — Second-Subject Fixture

Implement enough of a second subject to exercise the entire generalized path.

Deliverable: multi-subject architectural proof.


---

P9.8 — API/Web/Mobile Validation

Verify:

- service,
- Web,
- Mobile,
- navigation,
- telemetry,
- analytics,

all operate through generalized contracts.

Deliverable: multi-platform generalization proof.


---

P9.9 — Regression & Architecture Gates

Run:

- existing P0–P8 tests,
- new generalization tests,
- boundary checks,
- typecheck,
- lint,
- Web build,
- Mobile/Expo build,
- service tests,
- assessment determinism,
- persistence tests.

Deliverable: P9 verification report.


---

19. P9 Acceptance Gates

P9 is complete only when all gates pass.

Gate 1 — Domain Generalization

No accidental BXM dependency remains in generic domain/application architecture.


---

Gate 2 — Program Model

Programs and subjects are first-class platform concepts.


---

Gate 3 — Curriculum Versioning

Multiple curriculum versions can be represented without schema redesign.


---

Gate 4 — Content Generalization

Evidence, lessons, questions and references are subject-independent contracts.


---

Gate 5 — Assessment Generalization

The assessment compiler operates from generalized blueprint/content data.


---

Gate 6 — Learning Loop Generalization

Mastery/remediation operates independently of Mathematics.


---

Gate 7 — Multi-Subject Proof

A second subject successfully traverses the platform.


---

Gate 8 — Client Generalization

Web and Mobile do not require BXM-specific architectural forks.


---

Gate 9 — Analytics Generalization

P8 telemetry and analytics can distinguish programs, subjects and curricula.


---

Gate 10 — Coverage Matrix

Every target Educación Abierta program/subject has an explicit readiness state.


---

Gate 11 — Regression

Existing BXM functionality remains intact.


---

Gate 12 — Architecture Lock

The generalized contracts are documented and protected by automated tests/boundary checks.


---

20. P9 Out of Scope

P9 must not turn into mass curriculum production.

Explicitly defer:

- authoring every remaining subject,
- writing all lessons,
- producing all questions,
- completing all editorial gates,
- production launch of every program,
- payment gateway,
- commercial billing,
- full deployment topology,
- Redis adoption,
- object-storage migration,
- microservices decomposition,
- major UX redesign.

P9 creates the system capable of supporting those activities.

It does not execute all of them.


---

21. P9 Deliverables

At completion, produce:

project_docs/P9_EXECUTION.md

and update the appropriate architecture/current-plan documentation.

The execution report must contain:

1. objective,
2. scope,
3. BXM dependency audit,
4. generalized domain changes,
5. curriculum model,
6. content model,
7. assessment changes,
8. learning-loop changes,
9. API/client changes,
10. telemetry/analytics changes,
11. second-subject validation,
12. coverage matrix,
13. tests and verification,
14. migration notes,
15. deferred items,
16. known risks,
17. P10 handoff.


---

22. P9 Coverage Matrix as a Permanent Product Artifact

The coverage matrix should not be discarded after P9.

It becomes the operational roadmap for the remainder of the project.

Future milestones can consume it:

P9
 ↓
Coverage Matrix
 ↓
P10 — BXM Matemática completion
 ↓
P11 — Subject expansion
 ↓
P12 — Program expansion
 ↓
...
 ↓
Full Educación Abierta coverage

Each future subject should move through the same lifecycle rather than becoming a custom project.


---

23. P9 Exit State

The desired end state is:

EDUCACIÓN ABIERTA
                        │
                  General Platform
                        │
          ┌─────────────┼─────────────┐
          │             │             │
       Program A     Program B     Program C
          │             │             │
       Subjects       Subjects      Subjects
          │             │             │
      Curriculum     Curriculum    Curriculum
          │             │             │
       Evidence      Evidence      Evidence
          │             │             │
       Content       Content       Content
          │             │             │
      Assessment    Assessment    Assessment
          │             │             │
       Mastery       Mastery       Mastery
          │             │             │
      Remediation   Remediation   Remediation

with:

BXM Matemática = first complete reference implementation

rather than:

BXM Matemática = special architecture


---

24. P9 Handoff to P10

The immediate milestone after P9 should be content completion and productionization of BXM Matemática, not another architecture rewrite.

P10 should use the generalized contracts established by P9 to take BXM Matemática from:

Proof of Concept

to:

Complete, editorially validated, production-ready subject

including the remaining content, questions, lessons, official references, QA, editorial gates, assessment coverage and learner journeys.

Then subsequent milestones can replicate the proven content-production pipeline across the remaining Educación Abierta subjects/programs.

Strategic sequence:

P0–P7  → Build the platform foundation
P8     → Make it operationally observable/reliable
P9     → Generalize it for Educación Abierta
P10    → Complete BXM Matemática
P11+   → Expand subjects/programs
         ↓
       Full Educación Abierta Coverage
