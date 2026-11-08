# Project Documentation Index

**Authoritative Architecture Baseline:** Target Architecture v2.0
**Status:** Approved for production target architecture reference

---

## P0 Implementation

- [Current P0 plan](./current_plan_doc.md)
- [P0 execution evidence, workspace decisions, and limitations](./P0_EXECUTION.md)

The implementation evidence records what is executable today; it does not replace the authoritative target architecture below.

## P1 Implementation

- [P1 core product vertical slice plan](./current-implementation-plan/P1_current_plan.md)
- [P1 execution, acceptance evidence, and remaining native validation](./P1_EXECUTION.md)

The Web journey is available at `/learn` (also `/foundation`); Expo uses the same shared journey controller. The three-item content remains an explicit draft development preview. Native device acceptance is pending.

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
