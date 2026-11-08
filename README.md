# MEP Educación Abierta Digital

A sovereign, digital preparation and mastery platform engineered for Costa Rica’s adult learners preparing for open education national examinations (Bachillerato por Madurez Suficiente — BXM, EDAD, and Tercer Ciclo).

> **Architectural Status:** The current codebase represents an exploratory Proof of Concept (POC) built to validate end-user pedagogical journeys, mathematical typography (KaTeX), and interactive visual geometry. For the authoritative, approved target system design, see the [Consolidated Target Architecture](#target-architecture-documentation).

---

## Target Architecture Documentation

The production architecture has been consolidated from approved system design specifications into a modular, authoritative documentation suite located under [`project_docs/architecture/`](./project_docs/architecture/):

1. **[01. System Overview & Platform Boundaries](./project_docs/architecture/01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md)** — Core platform context, actor trust models, and the strictly decoupled external MEP/DGEC boundary (no live API dependency).
2. **[02. Core Domain Services & Pedagogical Learning Loop](./project_docs/architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md)** — Assessment, scoring, diagnosis, remediation engine (Plan de Nivelación), guidance, and telemetry.
3. **[03. Multi-Platform Client & Shared Application Layer](./project_docs/architecture/03_MULTI_PLATFORM_AND_SHARED_CLIENT.md)** — Cross-platform client architecture: Web SPA (React/TypeScript) and native Mobile (iOS/Android via React Native & Expo) sharing pure domain logic, types, validation, and analytics.
4. **[04. Content Platform & Curriculum Pipeline](./project_docs/architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md)** — Convocatoria blueprints, isolated official reference stream, proprietary question banks, parametric SVG specs, and Gates A–D quality review pipeline.
5. **[05. Data Infrastructure & Local Runtime](./project_docs/architecture/05_DATA_AND_INFRASTRUCTURE.md)** — PostgreSQL primary data store, Redis caching, Object storage, CDN/WAF edge network, and client offline-first runtime persistence.
6. **[06. Implementation Alignment & Transition Analysis](./project_docs/architecture/06_IMPLEMENTATION_ALIGNMENT_AND_TRANSITION.md)** — Explicit divergence analysis between current POC implementation and target architecture, plus unresolved decisions.

### Architectural Diagrams
- **Interactive Diagram Viewer (mxGraph/HTML):** [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.html`](./project_docs/architecture/diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.html)
- **High-Resolution Vector Diagram (SVG):** [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./project_docs/architecture/diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

For the master documentation index, refer to [`project_docs/INDEX.md`](./project_docs/INDEX.md).

---

## Local Development (Current POC)

Use Node.js 22 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The production output is built to `dist/`. Hash routing supports static hosting without server rewrite rules. Fonts and assets are bundled locally.

## Quality & Verification Checks

```sh
npm run lint          # oxlint checks across source code
npm test              # Vitest test suite
npm run build         # Production TypeScript compilation & bundling
npm run test:learning # BXM Learning content integrity validation
```

---

## Documentation Governance

- **Target Architecture Authority:** The documents in `project_docs/architecture/` represent the approved production design. The current POC code must not be treated as architectural authority.
- **Historical Archives:** Exploratory POC notes, legacy architecture drafts, and historical sprint handoffs are archived under `project_docs/archive/` with explicit deprecation notices.
- **Preserved Source Assets:** Official PDF specification tables, practice booklets, and curriculum dumps are preserved under `project_docs/program_official_pdfs/` and `project_docs/program_official_info/`.
