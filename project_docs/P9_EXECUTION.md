# P9 — Educación Abierta Generalization & Coverage Architecture

Implemented on `p9m`, 2026-11-09. Authority: [P9 plan](current-implementation-plan/P9_current_plan.md), [target architecture v2](architecture/), [P8 execution evidence](P8_EXECUTION.md).

P9 marks the transition of the platform from a specialized BXM Matemática prototype into a sovereign, generalized Educación Abierta preparation platform with BXM Matemática as its first reference implementation. P9 generalises the core domain contracts, assessment compiler, continuity engine, and telemetry without changing pedagogical rigor, while introducing the canonical Educación Abierta coverage matrix and demonstrating multi-subject proof using BXM Educación Cívica 02-2026.

---

## 1. Executive Summary & Objective

- **Objective:** Generalize the platform architecture across all Educación Abierta programs (BXM, EDAD, III Ciclo EGBA, I/II Ciclos EGBA) and academic subjects, removing accidental BXM-specific assumptions.
- **Validation Fixture:** BXM Educación Cívica 02-2026 was selected as the second subject fixture because it introduces qualitative, humanities-based curricula (text-based scenario items, 3 non-mathematical domains, different diagnostic/mock quota requirements) to test abstraction boundaries without leaking mathematical assumptions.
- **Scope Boundary:** P9 establishes generalized contracts, blueprint compilation, isolated persistence, telemetry context, and coverage tracking. Mass content production, editorial approvals, and full subject UX rollout are deferred to P10+.

---

## 2. What Was Implemented

### 2.1. Domain & Taxonomy Generalization (`packages/domain`)
- **Curriculum Versioning:** Added `CurriculumVersion` entity tracking `programId`, `subjectId`, `version`, `effectiveFrom`, `effectiveTo`, `sourceReference`, and `status`.
- **Generalized Taxonomy:** Extended `CurriculumTaxonomy` with optional `curriculumVersions` and `curriculumVersionId` on `CurriculumDomain`.
- **Item & Blueprint Portability:** Added `curriculumVersionId` to `Question` and `AssessmentBlueprint`.
- **Parsing & Schema Validation:** Updated `packages/content/src/schemas.ts` with `parseCurriculumVersion` and validated non-mathematical items through Gate A–D parsers.

### 2.2. Blueprint-Driven Assessment Compiler (`packages/content`)
- **Generic Compilation:** Refactored `compileAssessment` in `packages/content/src/compilation.ts` to accept arbitrary `programId` and `subjectId` backed by registered taxonomies.
- **Dynamic Quota Balancing:** Compiles diagnostic, formative mock, and official simulation assessments based on blueprint-specified domain quotas and time limits rather than hardcoded 8/8/4 or 23/25/12 distributions.
- **Service API Generalization:** Updated `/v1/assessments/compile` endpoint in `apps/service/src/service.ts` to validate programs and subjects dynamically against `eligible.registry.taxonomy`.

### 2.3. Learning Loop & Telemetry Generalization (`@mep-ea/learning-runtime`, `@mep-ea/analytics`, `apps/service`)
- **Remediation Filtering:** Generalized `continuityRepository.continuity` in `apps/service/src/service.ts` to filter active recommendation taxonomies from registry questions rather than hardcoded BXM Matemática domain filters.
- **Telemetry Educational Context:** Extended `TelemetryEvent` in `packages/analytics/src/index.ts` and `createTelemetryEvent` with optional `programId`, `subjectId`, and `curriculumVersionId` attributes while maintaining strict PII sanitization.
- **State Isolation:** Verified that learner attempts, mastery evaluations, and longitudinal metrics across different subjects do not collide or overwrite one another.

### 2.4. Educación Abierta Coverage Matrix (`project_docs/architecture/COVERAGE_MATRIX.md`)
- Established canonical coverage matrix categorizing all official DGEC Educación Abierta programs:
  1. *Bachillerato por Madurez Suficiente (BXM):* 9 subjects (Matemática, Cívica, Español, Estudios Sociales, Biología, Física, Química, Inglés, Francés).
  2. *Educación Diversificada a Distancia (EDAD) Parte 1 & 2:* 9 subjects across 10° and 11° grades.
  3. *Tercer Ciclo de la EGBA:* 6 subjects across 7°, 8°, and 9° levels.
  4. *I y II Ciclos de la EGBA:* 5 core subjects.
- Explicitly decoupled official PDF discovery from software readiness and editorial approval.

### 2.5. Second-Subject Architectural Fixture & Validation Suite (`packages/content`)
- **Fixture Definition (`packages/content/src/secondSubjectFixture.ts`):**
  - Program: BXM, Subject: Educación Cívica (`civica`), Convocatoria: `02-2026`.
  - 3 Domains: `regimenes-politicos`, `sistema-democratico`, `sistema-electoral`.
  - 12 Authored Questions with pedagogical rationales and solutions based on official 2026 practice items.
  - 60 Generated Official Reference Questions for benchmark simulations.
  - Blueprints for Diagnostic (12 items / 25 min), Formative Mock (12 items / 30 min), and Official Simulation (60 items / 150 min).
- **Automated Validation (`packages/content/src/p9-generalization.test.ts`):**
  - Taxonomy loading and integrity verification.
  - Deterministic seeded compilation of all three assessment modes.
  - Full learner loop execution: attempt initialization → answer recording → submission → scoring → mastery calculation → Plan de Nivelación generation.
  - Multi-subject learner state isolation: concurrent attempts in Matemática and Cívica without interference.

---

## 3. P9 Acceptance Gates Evaluation

| Gate | Requirement | Status | Evidence |
|---|---|---|---|
| **Gate 1 — Domain Generalization** | No accidental BXM dependency in generic domain/application architecture | **Passed** | Audited `packages/domain`, `packages/content`, `apps/service`; dynamic validation enabled. |
| **Gate 2 — Program Model** | Programs and subjects are first-class platform concepts | **Passed** | Taxonomy schemas support multiple programs (`bxm`, `edad`, `iii_ciclo`, `i_ii_ciclo`) and subjects. |
| **Gate 3 — Curriculum Versioning** | Multiple curriculum versions represented without schema redesign | **Passed** | `CurriculumVersion` contract implemented and verified in `packages/domain` and `packages/content`. |
| **Gate 4 — Content Generalization** | Evidence, lessons, questions and references are subject-independent contracts | **Passed** | Humanities questions, non-math KaTeX handling, and arbitrary domain codes verified. |
| **Gate 5 — Assessment Generalization** | Assessment compiler operates from generalized blueprint/content data | **Passed** | `compileAssessment` driven by blueprint quotas and taxonomy across all modes. |
| **Gate 6 — Learning Loop Generalization** | Mastery and remediation operate independently of Mathematics | **Passed** | `calculateMastery` and `generateNivelacion` verified with Cívica domains in `p9-generalization.test.ts`. |
| **Gate 7 — Multi-Subject Proof** | A second subject successfully traverses the platform | **Passed** | BXM Educación Cívica fixture traverses compiler, session runner, scoring, and analytics. |
| **Gate 8 — Client Generalization** | Web and Mobile do not require BXM-specific architectural forks | **Passed** | Client contracts accept generalized route and blueprint params; Web & Mobile builds clean. |
| **Gate 9 — Analytics Generalization** | Telemetry and analytics distinguish programs, subjects and curricula | **Passed** | `TelemetryEvent` supports `programId`, `subjectId`, `curriculumVersionId`; longitudinal metrics verified. |
| **Gate 10 — Coverage Matrix** | Every target Educación Abierta program/subject has explicit readiness state | **Passed** | Canonical matrix in `project_docs/architecture/COVERAGE_MATRIX.md`. |
| **Gate 11 — Regression** | Existing BXM functionality remains intact | **Passed** | All 416 Web Vitest tests, 99 foundation tests, and existing P6-P8 benchmarks pass with 0 regressions. |
| **Gate 12 — Architecture Lock** | Generalized contracts documented and protected by automated tests/boundary checks | **Passed** | 18 foundation suites pass, package boundaries pass, typecheck passes with 0 errors. |

---

## 4. Verification Evidence & Commands

- `npm run test:foundation`: 18 passed, 1 skipped (Postgres requiring live daemon), 99 tests passed in 7.10s.
- `npx vitest run --config vitest.config.ts`: 82 test files passed, 416 tests passed.
- `npm run typecheck`: 0 errors across web app, packages, mobile workspace, and service.
- `npm run lint`: 0 warnings, 0 errors across 363 files.
- `npm run check:boundaries`: Shared package boundaries passed (7 packages).
- `npm run build`: Web bundle generated cleanly within bundle budget delta (-160,575 bytes entry delta).
- `npm run build:service`: Service SSR bundle generated cleanly.
- `npm run build:mobile`: Android and iOS Hermes bundles exported cleanly via Expo.

---

## 5. Residual BXM Coupling Classification

| Location | Reference | Classification | Disposition |
|---|---|---|---|
| `packages/content/src/expansion-data.json` | `bxm/matematica/...` evidence IDs | **Legitimate content** | Preserved as BXM Matemática authored content. |
| `packages/content/src/official-c2-items.json` | BXM 2026-c2 reference questions | **Legitimate content** | Preserved as authentic benchmark items. |
| `packages/content/src/compilation.ts` | Fallback default to BXM Matemática | **Migration / Compatibility** | Preserved as backwards-compatible default when request does not specify blueprint. |
| `apps/web/src/App.tsx` | Route matching `bxm/matematicas/2026-c2` | **Client Routing POC** | Retained for POC URL compatibility; targeted for P10 frontend modernization. |
| `apps/service/src/service.ts` | Active evidence ID filtering | **Generalized** | Accidental hardcoded coupling removed in P9. |

---

## 6. Deferred Items & P10 Handoff

The following items are explicitly out of P9 and handed off to subsequent milestones:

1. **Mass Content Ingestion & Authoring (P11+):**
   - Authoring complete question banks and digital temarios for the remaining 30+ Educación Abierta subjects.
   - Running human editorial Gate D signoffs on extracted materials.

2. **P10 — Front-End Architecture Modernization & Productionization:**
   During P9, client boundary inspection revealed frontend-specific architectural gaps in `apps/web`:
   - `App.tsx` still carries legacy routing branches (`route.programId === 'bxm' && route.subjectId === 'matematicas'`).
   - `BxmLearningHub.tsx` contains monolithic sub-tabs that should be generalized into modular learner views parameterized by `(programId, subjectId, curriculumVersionId)`.
   - Client navigation store and URL query schemes should dynamically consume the generalized `CurriculumTaxonomy` rather than static routes.
   - P10 will modernize the frontend workspace to render any subject defined in the taxonomy using the generalized contracts proven in P9.
