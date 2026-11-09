P12 — Content Authoring, Ingestion & Multi-Subject Productization

1. Milestone Objective

P12 operationalizes the generalized educational platform established through P9–P11 by introducing a repeatable, validated pipeline for subject-specific educational content, curriculum structures, and content ingestion.

P10 established the frontend architecture capable of consuming generalized educational contracts.

P11 matured the application shell, navigation, learner journeys, learning loop, assessment experience, progress surfaces, Web/Mobile presentation, and product lifecycle states.

P12 now answers the next product question:

«Can a new educational subject be introduced through structured content and curriculum data, ingested through the platform, and delivered through the existing product architecture without creating a parallel frontend implementation?»

The milestone should prove this through additional real subject/content beyond the existing Matemática and Educación Cívica 02-2026 fixtures.

P12 is therefore primarily a content-platform and productization milestone, not a frontend architecture rewrite.

---

2. Strategic Transition

The platform evolution should now follow:

P0–P6
Foundation
    ↓
P7–P8
Learning Runtime + Product Capabilities
    ↓
P9
Generalized Domain / Multi-Subject Architecture
    ↓
P10
Frontend Architecture Consolidation
    ↓
P11
Frontend Product Surface Maturation
    ↓
P12
Content Authoring + Ingestion + Subject Productization
    ↓
P13+
Scale, Content Expansion, Operational Maturity

The central principle is:

New Subject
     ↓
Structured Curriculum / Content
     ↓
Authoring / Validation
     ↓
Ingestion
     ↓
Canonical Domain Contracts
     ↓
Existing Application / Learning Runtime
     ↓
Existing Web + Mobile Product Surfaces

A new subject should consume the platform, not modify its architectural foundations.

---

3. P12 Architectural Principle

P12 must preserve the architectural boundary established in P10/P11:

Content / Curriculum
        ↓
Domain Contracts
        ↓
Repositories / APIs
        ↓
Application Services / Use Cases
        ↓
Feature State
        ↓
Generalized UI Components
        ↓
Web / Mobile Presentation

Subject-specificity should primarily live in:

- content;
- curriculum structure;
- metadata;
- assessment configuration;
- pedagogical configuration;
- subject-specific media;
- subject-specific visualization contracts where genuinely required.

Subject-specificity must not automatically create:

- separate application architectures;
- duplicate navigation;
- duplicate learning flows;
- duplicate assessment infrastructure;
- duplicate telemetry;
- duplicate progress systems;
- subject-specific routing systems;
- subject-specific state architectures.

---

4. P12 Scope

P12 covers:

1. Content model validation
2. Curriculum/content authoring model
3. Content validation rules
4. Content ingestion pipeline
5. Curriculum versioning
6. Subject onboarding workflow
7. Content catalog integration
8. Additional subject/content fixture
9. Learning activity integration
10. Assessment/question ingestion
11. Media/content asset handling
12. Content lifecycle states
13. Content integrity validation
14. Frontend consumption of ingested content
15. Web/Mobile verification
16. Telemetry and observability
17. Automated testing
18. Documentation and operational workflow
19. Subject onboarding acceptance
20. P13 scale-readiness handoff

---

5. Explicit Non-Goals

P12 must not become an uncontrolled expansion of the product.

The following remain outside the core P12 objective unless required by an identified ingestion dependency:

- complete authoring of every future subject;
- mass production of educational content;
- creation of an entirely new frontend architecture;
- replacement of React/Web architecture;
- migration away from Expo/React Native;
- native Kotlin/Swift rewrite;
- redesign of the application shell;
- redesign of the learning loop;
- replacement of the longitudinal metrics engine;
- backend/database rewrite;
- payment implementation;
- creation of unrelated product features;
- arbitrary subject-specific frontend duplication.

The objective is to establish a repeatable system, not to manually populate the entire platform.

---

6. P12.0 — Content & Ingestion Readiness Audit

Before implementation, perform an evidence-based audit of the current state.

Review:

- architecture documentation;
- P9 generalized-domain work;
- P10 frontend architecture;
- P11 execution results;
- existing content structures;
- Matemática fixture;
- Educación Cívica 02-2026 fixture;
- curriculum contracts;
- question/assessment contracts;
- repository/API boundaries;
- learning runtime;
- frontend catalog consumption;
- existing data fixtures;
- existing seed/import mechanisms;
- validation/testing infrastructure.

Classify existing capabilities as:

Classification| Meaning
Ready| Can be used directly
Mature| Exists but requires hardening
Missing| Required for P12
Legacy| Exists but should not become the new path
Deferred| Valid future capability but unnecessary for P12

Required deliverable

"project_docs/P12_CONTENT_READINESS_AUDIT.md"

The audit must establish the actual baseline before implementation.

---

7. P12.1 — Canonical Content & Curriculum Model

Define and verify the canonical representation of educational content consumed by the platform.

At minimum, establish coherent relationships among:

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
Lesson / Learning Resource
  ↓
Question / Activity
  ↓
Assessment

The model must support subject variation without requiring subject-specific domain objects merely because content differs.

The implementation should establish clear ownership for:

- identity;
- ordering;
- hierarchy;
- versioning;
- prerequisites;
- content type;
- instructional metadata;
- assessment metadata;
- publication state;
- localization where applicable.

---

8. P12.2 — Content Authoring Specification

Define how educational content is created before it enters the runtime.

This does not necessarily require building a complete authoring UI.

The first objective is to establish a canonical authoring contract.

Define:

- source format;
- required fields;
- optional fields;
- identifiers;
- relationships;
- curriculum hierarchy;
- question structure;
- answer structure;
- explanation/feedback;
- evidence references;
- difficulty/configuration;
- assessment metadata;
- media references;
- version metadata;
- publication state.

The authoring specification must be usable by humans and machines.

If structured files are used, they must be deterministic and reviewable.

---

9. P12.3 — Content Validation Pipeline

Implement validation before content reaches the learning runtime.

Validation should identify at least:

Structural errors

- missing identifiers;
- broken references;
- invalid hierarchy;
- duplicate identifiers;
- malformed question structures;
- missing required fields.

Curriculum errors

- orphaned evidence;
- invalid domain references;
- inconsistent curriculum version;
- invalid prerequisite relationships;
- incorrect ordering.

Assessment errors

- invalid answer structures;
- missing correct-answer definitions;
- invalid scoring metadata;
- malformed feedback;
- unsupported question types.

Runtime compatibility errors

- unsupported content type;
- incompatible component contract;
- unsupported lifecycle state;
- invalid media reference;
- unsupported subject configuration.

The goal is:

«Invalid content should fail during validation, not during learner execution.»

---

10. P12.4 — Content Ingestion Pipeline

Implement or consolidate the canonical ingestion path.

Conceptually:

Authoring Source
      ↓
Parse
      ↓
Validate
      ↓
Normalize
      ↓
Resolve References
      ↓
Version
      ↓
Publish / Activate
      ↓
Canonical Catalog
      ↓
Runtime / API
      ↓
Web + Mobile

The ingestion process must be deterministic and repeatable.

A content update should not require manual modification of frontend code.

---

11. P12.5 — Curriculum Versioning & Publication

Establish controlled content lifecycle management.

At minimum:

Draft
  ↓
Validated
  ↓
Published
  ↓
Active
  ↓
Deprecated / Archived

The platform must distinguish:

- content identity;
- content version;
- curriculum version;
- active version;
- historical version.

Existing learners should not unexpectedly lose curricular context because content was updated.

P12 should verify compatibility with the architecture's existing continuity and progress assumptions.

---

12. P12.6 — Subject Onboarding Workflow

Create a repeatable workflow for introducing a subject.

The target workflow should resemble:

1. Define Subject
2. Define Curriculum Version
3. Define Domains
4. Define Evidence
5. Author Content
6. Author Learning Resources
7. Author Questions / Activities
8. Validate
9. Ingest
10. Publish
11. Register Catalog
12. Verify Runtime
13. Verify Web
14. Verify Mobile

The critical acceptance criterion is that the workflow does not require creating a new frontend architecture.

---

13. P12.7 — Additional Subject Fixture

Introduce at least one meaningful additional subject/content fixture beyond the current Matemática and Educación Cívica 02-2026 coverage.

The purpose is not simply to add another label.

The new fixture must exercise the generalized platform sufficiently to prove that:

- curriculum hierarchy works;
- content ingestion works;
- evidence works;
- learning activities work;
- assessment works;
- results work;
- progress works;
- navigation context works;
- Web rendering works;
- Mobile rendering works.

Subject-specific differences should be expressed through content/configuration wherever the domain allows.

---

14. P12.8 — Content-Driven Learning Experience

Connect ingested content to the existing learning loop:

Catalog
  ↓
Subject
  ↓
Domain
  ↓
Evidence
  ↓
Lesson / Resource
  ↓
Practice
  ↓
Assessment
  ↓
Result
  ↓
Mastery / Progress
  ↓
Recommended Next Step

The frontend should consume the canonical content representation rather than hardcoded subject data.

P12 should specifically remove any remaining production paths where educational content is embedded directly in presentation code.

---

15. P12.9 — Assessment & Question Content Generalization

Verify that questions and assessments can be supplied by content rather than frontend implementation.

Support the existing generalized assessment architecture while identifying genuine gaps.

Questions should define data such as:

- question identity;
- prompt;
- answer options;
- correct response;
- explanation;
- evidence association;
- assessment context;
- scoring metadata;
- interaction type.

The UI should render supported question types through generalized components.

If a genuinely new interaction type is required by the new subject, introduce it deliberately as a reusable capability rather than a one-off subject component.

---

16. P12.10 — Content Media & Asset Strategy

Establish a coherent strategy for educational assets.

Define handling for:

- images;
- diagrams;
- mathematical notation;
- audio/video where applicable;
- downloadable resources;
- accessibility metadata;
- asset identity;
- versioning;
- cacheability;
- offline availability.

Subject-specific visualizations should be introduced only when supported by an identified content requirement.

The previous POC's Math-specific visual components should be reviewed here and classified as:

Reusable capability
Subject-specific capability
Prototype only
Deferred

Do not automatically promote POC visualizations into production architecture.

---

17. P12.11 — Offline & Cache Compatibility

Ensure newly ingested content respects the existing offline architecture.

Verify:

- catalog caching;
- evidence caching;
- lesson/resource caching;
- assessment availability;
- cache invalidation;
- version changes;
- offline practice;
- pending attempts;
- synchronization;
- recovery after reconnect.

The addition of content must not silently break the offline learning journey.

---

18. P12.12 — Web & Mobile Verification

Verify the new content through both production clients.

Web

Verify:

- catalog;
- subject selection;
- evidence;
- learning resource;
- practice;
- assessment;
- result;
- progress;
- navigation context;
- lifecycle states.

Mobile

Verify equivalent functionality while respecting:

- React Native conventions;
- Safe Area;
- touch targets;
- native navigation;
- lifecycle;
- offline behavior;
- device constraints.

The requirement is functional/product parity, not pixel-identical presentation.

---

19. P12.13 — Telemetry & Observability

Verify that content-driven journeys generate meaningful telemetry.

Telemetry should preserve relevant context such as:

- program;
- subject;
- curriculum version;
- domain;
- evidence;
- activity;
- assessment;
- outcome;
- platform.

Verify that introducing a new subject does not require new telemetry architecture.

Telemetry should enable analysis of:

Subject
 → Domain
 → Evidence
 → Activity
 → Attempt
 → Outcome
 → Progress

---

20. P12.14 — Automated Verification

Expand automated testing around content ingestion and consumption.

Tests should cover:

Content validation

- valid content;
- malformed content;
- missing references;
- duplicates;
- invalid hierarchy.

Ingestion

- parse;
- normalize;
- resolve;
- publish;
- version.

Runtime

- catalog retrieval;
- subject selection;
- evidence;
- learning activity;
- assessment;
- results.

Cross-platform

- Web rendering;
- Mobile rendering;
- navigation context.

Regression

Existing P0–P11 test suites must remain green.

---

21. P12.15 — Subject Onboarding Acceptance Test

Create one end-to-end acceptance test representing the actual P12 promise:

New Subject Content
        ↓
Validation
        ↓
Ingestion
        ↓
Catalog
        ↓
Subject Selection
        ↓
Evidence
        ↓
Learning Activity
        ↓
Practice
        ↓
Assessment
        ↓
Result
        ↓
Progress
        ↓
Recommended Next Step

The test should demonstrate that the subject was introduced without creating a parallel subject-specific frontend architecture.

This should become a reusable template for future subjects.

---

22. P12.16 — Documentation & Operational Workflow

Update the project documentation to make content onboarding reproducible.

Required documentation should cover:

- content model;
- authoring specification;
- validation;
- ingestion;
- curriculum versioning;
- publication;
- subject onboarding;
- asset management;
- testing;
- troubleshooting;
- rollback/deprecation;
- Web/Mobile verification.

Recommended documentation locations:

project_docs/
    content/
        CONTENT_MODEL.md
        AUTHORING_GUIDE.md
        VALIDATION.md
        INGESTION.md
        VERSIONING.md
        SUBJECT_ONBOARDING.md

Exact structure may be adjusted to match the repository's existing documentation conventions.

---

23. P12.17 — Legacy Content Path Cleanup

After the canonical ingestion path is proven, identify and remove or isolate obsolete content paths.

Examples include:

- hardcoded subject data;
- duplicated catalogs;
- legacy fixtures masquerading as production content;
- frontend-local curriculum definitions;
- duplicated question datasets;
- obsolete POC content loaders.

Cleanup must occur only after the replacement path is verified.

---

24. P12.18 — Final Architecture & Product Verification

P12 must verify that content expansion did not violate the architectural boundaries established in P10/P11.

Check:

Domain

Content remains represented by generalized domain contracts.

Application

Learning workflows remain subject-independent.

Presentation

Components render content rather than embedding curriculum rules.

Infrastructure

Ingestion/API/storage remain behind appropriate boundaries.

Navigation

Canonical navigation remains authoritative.

Telemetry

Existing telemetry architecture is reused.

Mobile

Mobile consumes the same underlying content/domain contracts.

Testing

New subjects increase coverage rather than introduce special-case test silos.

---

25. P12 Acceptance Gates

P12 is complete only when all gates below pass.

Gate 1 — Content Model

A canonical content/curriculum representation is documented and verified.

Gate 2 — Authoring

Content can be produced according to a defined authoring contract.

Gate 3 — Validation

Invalid content is detected before runtime.

Gate 4 — Ingestion

Content can be deterministically ingested.

Gate 5 — Versioning

Curriculum/content versions are controlled and identifiable.

Gate 6 — Subject Onboarding

A new subject can be introduced through the canonical workflow.

Gate 7 — Multi-Subject Runtime

The new subject runs through the existing learning runtime.

Gate 8 — Learning Loop

The complete learning loop works using ingested content.

Gate 9 — Assessment

Assessment content renders through generalized assessment capabilities.

Gate 10 — Progress

Results contribute to the existing progress/mastery model.

Gate 11 — Web

The new subject works through the production Web application.

Gate 12 — Mobile

The new subject works through the production Mobile application.

Gate 13 — Offline

Relevant content and learning journeys remain compatible with offline/sync architecture.

Gate 14 — Telemetry

The new subject produces correctly contextualized telemetry.

Gate 15 — Testing

Automated validation covers the ingestion and runtime path.

Gate 16 — Boundary Preservation

No unauthorized architectural shortcuts or subject-specific parallel systems were introduced.

Gate 17 — Legacy Cleanup

Obsolete content paths are identified and removed or explicitly isolated.

Gate 18 — Documentation

The subject onboarding workflow is reproducible by another developer.

Gate 19 — Regression

P0–P11 regression suites remain passing.

Gate 20 — Productization

The new subject demonstrates that the platform can absorb additional subjects primarily through content and configuration rather than frontend redevelopment.

---

26. Required P12 Deliverables

At minimum:

project_docs/P12_CONTENT_READINESS_AUDIT.md
project_docs/P12_EXECUTION.md

And the appropriate content/authoring documentation, implementation artifacts, tests, fixtures, and ADRs.

Additional ADRs should be created when P12 introduces durable architectural decisions, particularly around:

- content format;
- ingestion;
- versioning;
- asset handling;
- publication;
- authoring workflow.

---

27. Verification Requirements

P12 should preserve and extend the established verification baseline.

At minimum:

npm run test:foundation
npx vitest run --config vitest.config.ts
npm run typecheck
npm run lint
npm run check:boundaries
npm run build
npm run audit:bundle
npm run build:mobile

Add P12-specific validation commands for content parsing, validation, ingestion, and subject onboarding as appropriate.

The final execution report must record actual results rather than merely stating that checks were performed.

---

28. Implementation Order

The recommended execution sequence is:

P12.0
Content & Ingestion Readiness Audit
        ↓
P12.1
Canonical Content / Curriculum Model
        ↓
P12.2
Authoring Specification
        ↓
P12.3
Validation
        ↓
P12.4
Ingestion
        ↓
P12.5
Versioning / Publication
        ↓
P12.6
Subject Onboarding Workflow
        ↓
P12.7
Additional Subject Fixture
        ↓
P12.8
Content-Driven Learning
        ↓
P12.9
Assessment Content
        ↓
P12.10
Assets / Visual Content
        ↓
P12.11
Offline Compatibility
        ↓
P12.12
Web / Mobile Verification
        ↓
P12.13
Telemetry
        ↓
P12.14
Automated Verification
        ↓
P12.15
End-to-End Subject Acceptance
        ↓
P12.16
Documentation
        ↓
P12.17
Legacy Cleanup
        ↓
P12.18
Final Verification

Do not begin mass content production before the authoring, validation, and ingestion contracts are stable.

---

29. Change Discipline

Every P12 implementation decision should be classified as one of:

1. Content
2. Configuration
3. Generalized capability
4. Infrastructure
5. Subject-specific capability
6. Legacy cleanup
7. Deferred

The preferred order is:

Content
  >
Configuration
  >
Existing generalized capability
  >
New reusable capability
  >
Subject-specific capability

A subject-specific implementation should require justification demonstrating why the generalized architecture cannot adequately represent the requirement.

---

30. Definition of Done

P12 is complete when:

«A new educational subject can be authored, validated, ingested, versioned, published, discovered through the canonical catalog, and experienced through the existing Web and Mobile learning journeys — including learning, practice, assessment, results, progress, offline behavior and telemetry — without requiring a parallel frontend or learning architecture.»

The strongest evidence is not the number of content items created.

The strongest evidence is:

«How little application code must change when a genuinely new subject is introduced.»

---

31. P12 Success Metric

P12 should establish a practical Subject Onboarding Cost baseline.

Measure:

- number of frontend files modified;
- number of application/domain files modified;
- number of infrastructure changes;
- number of subject-specific components required;
- number of new routes required;
- number of new telemetry definitions required;
- number of new tests required;
- content/configuration changes;
- total implementation effort.

The target should be:

New Subject
    ↓
Mostly content + configuration
    ↓
Minimal platform changes
    ↓
Existing learning experience

If introducing the new subject requires widespread frontend modifications, that is an architectural signal that should be documented rather than hidden.

---

32. P13 Handoff

P12 should leave P13 with a stable content/productization foundation.

Potential P13 directions should be determined by P12 evidence, rather than predetermined.

Areas likely to become relevant include:

- additional subject onboarding;
- larger-scale content operations;
- authoring tooling;
- content administration;
- content QA workflows;
- analytics and learning effectiveness;
- notification/engagement systems;
- production hardening;
- operational observability;
- learner personalization;
- broader assessment capabilities.

P13 should not automatically begin mass content creation until P12 demonstrates that the content pipeline is reliable enough to support it.

---

33. P12 Milestone Statement

P12 — Content Authoring, Ingestion & Multi-Subject Productization

«Establish and prove a repeatable content-to-product pipeline in which educational curriculum and learning content can be authored, validated, ingested, versioned and consumed by the existing generalized learning architecture, demonstrating successful onboarding of an additional subject across Web and Mobile without introducing parallel subject-specific frontend or application architectures.»
