# P6 — Test Compilation Engine & Simulation Surfaces

Implemented on `p6m`, 2026-11-08. Authority: [P6 plan](current-implementation-plan/P6_current_plan.md), [target architecture v2](architecture/), [P5 execution evidence](P5_EXECUTION.md).

P6 delivers the deterministic, convocatoria-driven assessment compilation capability and first-class simulation surfaces across Web and Mobile, closing the pedagogical learning loop. The implementation preserves offline-first guarantees, retains strict isolation between the Official Reference Stream and authored question pools, and enforces server-side Free vs Pro entitlement boundaries with no true payment wall.

---

## What was implemented

### P6.1 — Deterministic Test Compilation Engine
- Pure seeded deterministic assessment compilation implemented in `packages/content/src/compilation.ts`:
  - Linear Congruential Generator (LCG) PRNG and Fisher-Yates shuffle guaranteeing identical output for identical request parameters (`seed`).
  - **20-Item Diagnostic:** Balanced sample from authored questions (8 Geometry, 8 Functions, 4 Statistics), 30 minutes time limit.
  - **20-Item Formative Mock:** 20 authored questions (8 Geometry, 8 Functions, 4 Statistics), 45 minutes time limit, feeding Plan de Nivelación and retests.
  - **60-Item Official-Reference Simulation:** 60 authentic items from Convocatoria 2026-c2 (23 Geometry, 25 Functions, 12 Statistics), authentic 150 minutes timed conditions.
- Strict stream isolation: official reference items are strictly isolated and never injected into diagnostic or mock candidate pools.
- Pure domain compilation logic lives entirely in shared packages (`@mep-ea/content` and `@mep-ea/domain`). Clients never perform production compilation themselves.

### P6.2 — Service Assessment Compilation Endpoint & Entitlement Enforcement
- Versioned compilation endpoint in `apps/service/src/service.ts`:
  - `POST /v1/assessments/compile` accepting `{ programId: 'bxm', subjectId: 'matematica', mode: 'diagnostic' | 'mock' | 'simulation', seed?: number }`.
  - Compiled assessments are retained in dynamic in-memory registry, ensuring seamless draft persistence, attempt submission, scoring, and longitudinal continuity projection.
  - Server-side Free vs Pro entitlement boundary: Full 60-item official simulation requires `tier: 'premium'`. Free learners receive HTTP 403 `entitlement_required`. Diagnostic and Formative Mock remain 100% free.

### P6.3 — Multi-Platform Simulation Surfaces (Web & Expo)
- **Web Simulation Surface (`apps/web/src/foundation/SimulationSurface.tsx`):**
  - Mode launcher displaying Diagnostic (Free), Formative Mock (Free), and Official Simulation (Pro).
  - Timed runner with visible countdown timer and automatic submission upon deadline expiry.
  - Free navigation between questions via indexed grid.
  - In-session bookmarking toggle ("Marcar para revisión") with quick filtering (Todas / Sin responder / Marcadas).
  - Direct integration with `PaywallModal` when 403 `entitlement_required` is received.
  - Completion summary displaying answered/unanswered counts and seamless submission to the server attempt repository.
- **Mobile Simulation Surface (`apps/mobile/SimulationSurface.tsx`):**
  - Mirrored in React Native / Expo utilizing native design tokens, accessible components, countdown timer, question filtering, bookmarking, and attempt submission.
- Preserved default unauthenticated `p2-local` journey untouched.

---

## Acceptance Evidence

| Gate | Requirement | Status |
|---|---|---|
| **P6.1 Compilation** | Deterministic, blueprint-driven generation of 20-item and 60-item assessments; domain and cognitive quotas respected | **Passed** (`packages/content/src/compilation.test.ts`) |
| **P6.2 Isolation** | Official reference items never appear in diagnostic or formative-mock pools | **Passed** (`compilation.test.ts` poison defense test) |
| **P6.3 Surfaces** | Web and Expo can start, time, navigate, bookmark, and submit compiled assessments | **Passed** (`SimulationSurface.test.tsx`, Expo Hermes build) |
| **P6.4 Continuity** | Completed compiled attempts correctly update mastery snapshots and Plan de Nivelación through existing P4/P5 projection path | **Passed** (`apps/service/src/p6.test.ts`) |
| **P6.5 Entitlement** | Full 60-item simulations remain Pro-gated server-side; Free learners receive structured 403 denial mapping to PaywallModal | **Passed** (`apps/service/src/p6.test.ts`, `SimulationSurface.test.tsx`) |
| **P6.6 Offline / Migration** | Local-first execution and default `p2-local` database-free journey continue to function without regressions | **Passed** (`npm run test:foundation`, `scripts/verify-foundation.mjs`) |
| **P6.7 Shared architecture** | Pure domain contracts preserved; no framework leaks into domain or compilation logic | **Passed** (`npm run check:boundaries`) |
| **P6.8 Security** | Ownership and role checks enforced on compilation and attempt endpoints; no credentials stored in attempts | **Passed** |
| **P6.9 Validation** | Contract, integration, typecheck, lint, and bundle audit pass cleanly | **Passed** |

---

## Verification Commands & Results

- `npm run test:foundation`: 76 passed across packages and service tests (including all compilation, entitlement, and lifecycle tests).
- `npx vitest run apps/web/src/foundation/SimulationSurface.test.tsx`: 3 passed.
- `npm run typecheck`: clean across app, packages, mobile workspace, and service.
- `npm run lint` (`oxlint`): 0 warnings, 0 errors across 348 files.
- `npm run check:boundaries`: 7 packages passed allowed dependency matrix.
- `npm run build`: Web bundle built cleanly; `audit:bundle` passed within entry delta limits (-11.95 kB).
- `npm run build:service`: Service SSR bundle generated cleanly.
- `npm run build:mobile`: Android and iOS Hermes bundles exported cleanly via Expo.
- Playwright frontend verification (`scripts/verify-foundation.mjs`): clean execution.

---

## Explicitly Preserved Limits

- Commercial payment processing, gateway integration, and billing webhooks (UAD-3) remain unresolved; no true payment wall was introduced.
- 67 scaffolded lessons remain draft; no Gate D signoffs were invented.
- Redis caching layer, managed object storage, and deployment topology (UAD-1) remain downstream.
