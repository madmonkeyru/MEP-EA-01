# P12.0 Content & Ingestion Readiness Audit

**Milestone:** P12
**Phase:** P12.0 Baseline Readiness Assessment
**Date:** 2026-11-09
**Status:** Complete

---

## 1. Executive Summary

Milestone P12 operationalizes the generalized educational platform established in P9–P11 by introducing a repeatable, validated pipeline for subject-specific educational content, curriculum structures, and content ingestion.

The central product question for P12 is:
> *«Can a new educational subject be introduced through structured content and curriculum data, ingested through the platform, and delivered through the existing product architecture without creating a parallel frontend implementation?»*

This audit establishes an evidence-based assessment of the current codebase across domain contracts, content packaging, validation tooling, learning runtimes, service APIs, and frontend presentation surfaces (Web and Mobile).

---

## 2. Capability Audit & Classification

Capabilities are audited and categorized into five definitive states:
- **Ready:** Can be used directly without modification.
- **Mature:** Exists and functions but requires hardening or extension for multi-subject production.
- **Missing:** Required for P12 and must be designed and implemented.
- **Legacy:** Exists in historical POC or older directories; must not become the production path.
- **Deferred:** Valid future capability but strictly out of scope for P12.

| Subsystem / Capability | Current Implementation Status | Classification | Evidence & Observations |
|---|---|---|---|
| **Domain Contracts (`@mep-ea/domain`)** | `CurriculumTaxonomy`, `CurriculumVersion`, `CurriculumDomain`, `Question`, `AssessmentBlueprint`, `MasterySnapshot` generalized in P9. | **Ready** | `packages/domain/src/index.ts` contains versioned, subject-neutral interfaces with complete support for programs, subjects, domains, concepts, and evidences. |
| **Assessment Compilation Engine** | Seeded deterministic blueprint compiler in `packages/content/src/compilation.ts`. | **Mature** | Compiles Diagnostic, Mock, and Simulation based on `domainQuotas` and `stream`. Needs to support dynamic subject selection from an open registry. |
| **Learning Catalog Registry** | `createMultiSubjectCatalog()` in `packages/content/src/multiSubjectCatalog.ts`. | **Mature** | Currently hardcodes combining Matemática + Cívica. Must be generalized to consume an open, validated registry of ingested subjects. |
| **Validation Package (`@mep-ea/validation`)** | Primitive schema assertion helpers (`ensure`, `object`, `text`, `list`, `oneOf`, `integer`). | **Mature** | Clean assertions exist in `packages/validation/src/index.ts`, but higher-level curriculum, question, and blueprint validators must be codified. |
| **Content Ingestion Pipeline** | Historical QBE docx extraction scripts in `scripts/qbe/` for legacy POC math items. | **Legacy** | Built specifically for docx extraction of historical math items. Not a declarative, repeatable ingestion pipeline for generalized multi-subject curriculum data. |
| **Declarative Authoring Specification** | No standardized, reviewable multi-subject JSON schema contract for curriculum + items + blueprints. | **Missing** | P12 requires an explicit authoring schema and directory structure that can be reviewed via git diffs. |
| **Deterministic Content Validator CLI** | No pre-runtime validation command for entire subject packages. | **Missing** | Required: validator identifying broken evidence links, invalid keys, missing options, quota discrepancies before runtime. |
| **Subject Ingestion Engine** | No automated compiler transforming structured authored content into canonical catalog registries. | **Missing** | Required: pipeline transforming authored source files into canonical catalog fixtures. |
| **Estudios Sociales BXM 02-2026 Curriculum** | Official PDF specification exists in `project_docs/program_official_pdfs/`. | **Ready (Source)** / **Missing (Model)** | Official PDF verified: 2 thematic blocks (Bloque 1 Global, Bloque 2 Costa Rica), 60 total items. Needs structured modeling. |
| **Web Presentation Runtime (`apps/web`)** | `FoundationApp.tsx`, `SimulationSurface.tsx`, `ContinuitySurface.tsx`, `LearningBrowser.tsx`. | **Ready** | Fully decoupled from math specifics in P10/P11. Renders subjects dynamically from catalog taxonomy. |
| **Mobile Presentation Runtime (`apps/mobile`)** | `App.tsx`, `SimulationSurface.tsx`, `ContinuitySurface.tsx`, `LearningBrowser.tsx`. | **Ready** | Parity with Web established in P11; consumes `createMultiSubjectCatalog()`. |
| **Longitudinal Habits & Analytics** | `deriveLongitudinalMetrics` in `apps/service/src/longitudinal.ts` & `ClientTelemetryService`. | **Ready** | Aggregates attempts and streaks dynamically per program and subject without hardcoding. |
| **Offline Storage & Continuity** | `localPlatformApi` polymorphic storage adapter in `@mep-ea/api`. | **Ready** | Stores attempts, drafts, and continuity locally; subject-neutral. |

---

## 3. Gap Analysis for P12

1. **Authoring & Ingestion Gap:**
   Currently, Cívica was hardcoded into a TypeScript fixture (`secondSubjectFixture.ts`). For P12 to succeed, the onboarding of a new subject (Estudios Sociales) must be driven by **declarative structured data files** (JSON) passing through an automated validator and ingestion step, rather than manual TypeScript code writing.

2. **Catalog Dynamic Discovery Gap:**
   `createMultiSubjectCatalog()` currently explicitly imports `secondSubjectFixture.ts`. It must be refactored into a registry-driven loader that dynamically mounts all validated, ingested subjects that are registered for publication.

3. **Curriculum Representation Gap:**
   Estudios Sociales BXM 02-2026 has a 2-block structure with 60 official items:
   - Bloque 1: *La sociedad contemporánea: procesos históricos, geopolíticos y poblacionales a escala global desde el siglo XIX hasta el presente.*
   - Bloque 2: *La sociedad contemporánea: la interdependencia e interconexión global y los procesos históricos que definen la Costa Rica actual.*
   These must be mapped to official evidences and concepts under `curriculumVersion: 'bxm-estudios-sociales-02-2026'`.

4. **Zero Frontend Modifications Proof:**
   The ultimate proof of P12 is that neither `apps/web` nor `apps/mobile` presentation components require modification when Estudios Sociales is added to the catalog registry.

---

## 4. Architectural Baseline Verdict

The foundation established across P9–P11 is solid. The domain contracts, client runtimes, service endpoints, and presentation surfaces are already decoupled. P12 will successfully establish the content authoring and ingestion pipeline on top of this foundation.
