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

## Local Development

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

The existing POC lives in `apps/web/` and remains the default Web experience. Open `/learn` (also `/foundation`) for the P2 learner journey: program/subject selection, evidence browsing, draft lessons, targeted practice, assessment, scoring, provisional diagnosis and worked remediation. Start Expo with `npm run dev:mobile` and open it on an iOS or Android development device. Both clients consume the same domain, content, validation, and learner journey runtime. The native client persists locally through Expo SQLite; Web uses its local storage adapter. See [P2 execution and pending acceptance](project_docs/P2_EXECUTION.md).

The learning preview contains 71 canonical BXM evidence nodes, four existing lessons and 30 authored items with their original provenance. The other 67 lessons remain explicitly unavailable. Evidence with authored questions can offer draft practice independently of lesson availability. They remain **draft development content**, pending editorial signoff. The 30-item development assessment reuses the entire authored pool; it is not a validated diagnostic or a production content release. Official benchmark content is excluded. P2 uses a separate local learner namespace (`p2-local`), preserving P1 records without migrating them. Its native screen displays plain source math notation; native mathematical typesetting is downstream work.

Workspace layout:

```text
apps/web                 React/Vite POC plus thin foundation preview
apps/mobile              Expo native foundation
packages/domain          Platform-independent product contracts
packages/validation      Runtime validation primitives
packages/content         Canonical schemas, registry, blueprint resolution
packages/learning-runtime Assessment lifecycle and persistence ports
packages/api             Auth/session and injected API transport boundary
packages/analytics       Privacy-conscious event/sink contracts
packages/design-system   Shared semantic tokens
content                  Preserved POC content and ingestion outputs
```

See [P0 execution evidence and limitations](project_docs/P0_EXECUTION.md) before extending the foundation. The P0 plan selects npm workspaces for this repository; backend deployment, account UX, payments, and cloud synchronization remain downstream milestones.

## Quality & Verification Checks

```sh
npm run content:check # Verify bundled learning snapshot matches source packs
npm run content:sync  # Refresh snapshot after source content changes
npm run lint          # oxlint checks across source code
npm test              # Vitest test suite
npm run build         # Production TypeScript compilation & bundling
npm run typecheck     # Web, platform-independent packages, and Expo
npm run check:boundaries # Enforce shared package dependency direction
npm run test:foundation # Shared content, lifecycle, persistence, auth contracts
npm run test:postgres   # Requires MEP_TEST_DATABASE_URL; isolated PostgreSQL schema
npm run build:mobile  # Export both Android and iOS Hermes bundles
npm run test:learning # BXM Learning content integrity validation
```

---

## P4 service and PostgreSQL development

P4 adds a PostgreSQL repository, durable mastery snapshots, prioritized Plan de Nivelación, and revision-aware draft synchronization. Web/Expo keep the default database-free `p2-local` journey. The service uses the file development adapter unless `MEP_DATABASE_URL` is supplied; a configured database failure never silently switches stores.

```powershell
docker compose up -d --wait
$env:MEP_DATABASE_URL = 'postgresql://mep_development:local-development-only@127.0.0.1:54329/mep_development'
npm run db:migrate
$env:MEP_TEST_DATABASE_URL = $env:MEP_DATABASE_URL
npm run test:postgres
$env:MEP_DEV_TOKEN = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
$env:MEP_DEV_LEARNER_ID = 'p4-development'
$env:MEP_ALLOW_DRAFT_PREVIEW = 'true'
npm run dev:service
```

The Compose credential is for loopback local development only. Migrations are explicit and forward-only; existing file records stay in their original store. `docker compose stop` stops the local database while preserving its volume. See [P4 execution](project_docs/P4_EXECUTION.md) for API contracts, first-response qualification, conflict reconciliation, and verification limits.

## Documentation Governance

- **Target Architecture Authority:** The documents in `project_docs/architecture/` represent the approved production design. The current POC code must not be treated as architectural authority.
- **Historical Archives:** Exploratory POC notes, legacy architecture drafts, and historical sprint handoffs are archived under `project_docs/archive/` with explicit deprecation notices.
- **Preserved Source Assets:** Official PDF specification tables, practice booklets, and curriculum dumps are preserved under `project_docs/program_official_pdfs/` and `project_docs/program_official_info/`.
