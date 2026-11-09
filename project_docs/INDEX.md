# Project Documentation Index

**Authoritative Architecture Baseline:** Target Architecture v2.0
**Status:** Approved for production target architecture reference

---

## P0 Implementation

- [Current P0 plan](./current-implementation-plan/P0_current_plan.md)
- [P0 execution evidence, workspace decisions, and limitations](./P0_EXECUTION.md)

The implementation evidence records what is executable today; it does not replace the authoritative target architecture below.

## P1 Implementation

- [P1 core product vertical slice plan](./current-implementation-plan/P1_current_plan.md)
- [P1 execution, acceptance evidence, and remaining native validation](./P1_EXECUTION.md)

The Web journey is available at `/learn` (also `/foundation`); Expo uses the same shared journey controller. The three-item content remains an explicit draft development preview. Native device acceptance is pending.

## P2 Implementation

- [P2 content and learning expansion plan](./current-implementation-plan/P2_current_plan.md)
- [P2 execution and acceptance evidence](./P2_EXECUTION.md)

The shared Web/Expo learning surface now exposes 71 canonical evidence nodes, four draft lessons and 30 authored practice items. Scaffolded lessons remain unavailable; official benchmark questions remain isolated. Native device execution and editorial approval remain pending.

## P3 Implementation

- [P3 production service foundation plan](./current-implementation-plan/P3_current_plan.md)
- [P3 service contracts, execution and acceptance evidence](./P3_EXECUTION.md)

The shared API now exposes authenticated attempt submission/retrieval and versioned content packages. Web/Expo share an optional durable synchronization seam while preserving local development journeys. A loopback HTTP service uses server-side validation/scoring and a durable single-process file repository. Production identity-provider integration and database deployment remain downstream work; drafts are not published.

## P4 Implementation

- [P4 durable data foundation and mastery continuity plan](./current-implementation-plan/P4_current_plan.md)
- [P4 execution, PostgreSQL setup and acceptance evidence](./P4_EXECUTION.md)

P4 implements the PostgreSQL system of record, longitudinal mastery snapshots, Plan de Nivelación generation, and multi-device revision rules on top of the P3 service contracts, while preserving offline-first behavior. Both durable adapters pass the shared service contracts; CI now includes a PostgreSQL-backed gate. Production identity-provider productization, database deployment, Redis/object storage, and editorial publication remain out of scope.

## P5 Implementation

- [P5 production identity, entitlement and continuity surface plan](./current-implementation-plan/P5_current_plan.md)

P5 closes the identity and entitlement gap, surfaces durable mastery and Plan de Nivelación in Web/Expo, and hardens multi-device offline recovery. It builds directly on the P4 continuity layer while leaving content publication, payments, Redis, Test Compilation, and deployment topology for later milestones.

## P11 Implementation

- [Current P11 plan](./current-implementation-plan/P11_current_plan.md)
- [P11 frontend readiness audit](./P11_FRONTEND_READINESS_AUDIT.md)
- [P11 execution evidence, product maturation and multi-subject experience](./P11_EXECUTION.md)

P11 matures the learner-facing product surfaces using the P10 architectural foundation. It introduces dynamic multi-subject support (Matemática and Cívica BXM 02-2026), transforms "Mi Progreso" into an actionable decision surface powered by longitudinal study habits, closes the pedagogical remediation loop from assessment results, achieves full Web/Mobile experience parity, and passes all 13 acceptance gates.

## P12 Implementation

- [Current P12 plan](./current-implementation-plan/P12_current_plan.md)
- [P12 content readiness audit](./P12_CONTENT_READINESS_AUDIT.md)
- [P12 execution report, content authoring, ingestion and multi-subject productization](./P12_EXECUTION.md)
- [Subject onboarding developer guide](./content/SUBJECT_ONBOARDING.md)
- [Content authoring guide](./content/AUTHORING_GUIDE.md)
- [Content model specification](./content/CONTENT_MODEL.md)
- [Validation engine specification](./content/VALIDATION.md)
- [Ingestion pipeline specification](./content/INGESTION.md)

P12 operationalizes the generalized educational platform established across P9–P11 by introducing a repeatable, validated pipeline for subject-specific educational content, curriculum structures, and content ingestion. It proves that a new subject (Estudios Sociales BXM 02-2026) can be authored, validated, ingested, versioned, and delivered through existing Web and Mobile product surfaces with zero frontend presentation code modifications.

## 1. Authoritative Target Architecture (Authoritative)

The target architecture defines the forward-looking production design of the MEP EA digital platform, based directly on the approved system architecture diagrams. It serves as the single source of architectural truth for future development.

| Document | Focus & Scope | Primary Diagram Reference |
|---|---|---|
| **[01. System Overview & Platform Boundaries](./architecture/01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md)** | System context, actor model, decoupled MEP/DGEC boundary (no live API), and domain topology. | Root Cluster 1 & 2 |
| **[02. Core Domain Services & Learning Loop](./architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md)** | Core domain services (Auth, Test, Scoring, Knowledge, Remediation, Guidance, Telemetry) and the closed pedagogical loop. | Root Cluster 1 |
| **[03. Multi-Platform Client & Shared Application Layer](./architecture/03_MULTI_PLATFORM_AND_SHARED_CLIENT.md)** | Web SPA (React/TS) + Native Mobile (iOS/Android via React Native/Expo) sharing pure TypeScript application layer. | Root Cluster 3 |
| **[04. Content Platform & Curriculum Pipeline](./architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md)** | Blueprints, question banks, parametric SVG visual specs, taxonomy, and Gates A–D quality review pipeline. | Root Cluster 1 |
| **[05. Data Infrastructure & Local Runtime](./architecture/05_DATA_AND_INFRASTRUCTURE.md)** | PostgreSQL primary data store, Redis cache, Object storage, CDN/WAF edge, and client offline persistence runtime. | Root Cluster 1 & 3 |
| **[06. Implementation Alignment & Transition Analysis](./architecture/06_IMPLEMENTATION_ALIGNMENT_AND_TRANSITION.md)** | Explicit divergence analysis between current exploratory POC implementation and target architecture, plus unresolved decisions. | All Clusters |

### Architecture Diagrams
- **Interactive Architecture Viewer (HTML / mxGraph):** [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.html`](./architecture/diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.html)
- **High-Resolution Vector Diagram (SVG):** [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./architecture/diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 2. Official Curriculum & External Reference Dumps (Preserved Source Assets)

Official ministerial examination tables, reference content dumps, and administrative procedures:

- **[Bachillerato por Madurez Suficiente (BXM) Info Dump](./program_official_info/Bachillerato%20por%20Madurez%20Suficiente%20BXM%20INFO%20dump.md)**
- **[Educación Diversificada a Distancia (EDAD) Info Dump](./program_official_info/Educación%20Diversificada%20a%20Distancia%20EDAD%20INFO%20dump.md)**
- **[Tercer Ciclo de la EGBA Info Dump](./program_official_info/III%20Ciclo%20INFO%20dump.md)**
- **[I y II Ciclos de la EGBA Info Dump](./program_official_info/I%20y%20II%20Ciclo%20INFO%20dump.md)**
- **Official Specification Tables & Practice Booklets (PDFs):** Located under `project_docs/program_official_pdfs/`
- **Official Administrative Procedures & Calendars:** Located under `project_docs/program_official_process_pdfs/`
- **Raw Question Bank Source Assets:** Located under `project_docs/Raw questions ASSETS/`

---

## 3. Historical Archives (Deprecated / Historical Reference)

Early Proof-of-Concept (POC) exploratory documents, sprint roadmaps, and initial research that served to validate early UI concepts are preserved for historical auditability in the archive. **They do not represent approved target architecture.**

- **[Historical Sprints & POC Experiments Archive](./archive/historical_sprints_and_poc/)**
  - Includes early BXM MVP sprint handoffs, consolidated answers, POC architecture notes, and initial milestone plans.
- **[Legacy Architecture Documents Archive](./archive/legacy_architecture/)**
  - Includes the preliminary `01` through `07` architecture drafts that preceded the approved target architecture diagram baseline.
- **[Early Pre-Development & SRS Archive](./archive/)**
  - Contains early SRS drafts, UI/UX audit notes, and exploratory visual component specifications.
