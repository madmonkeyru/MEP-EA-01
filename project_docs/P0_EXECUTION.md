# P0 — Production Platform Foundation

Implemented on `p0milestone`, 2026-11-08. Authority: [INDEX](INDEX.md), [target architecture v2](architecture/), and [current P0 plan](current_plan_doc.md). This is an executable foundation and migration boundary, not a claim that the POC is production architecture.

## What is executable

- `apps/web` contains the existing React POC, including its assets and tests. Root development/build/preview commands retain the POC as the default experience. `/foundation` opens the thin assessment preview.
- `apps/mobile` is an Expo SDK 58 / React Native foundation using the same content and runtime. Both Android and iOS Hermes exports are verified. Expo's compatibility check passes with React 19.3.0 and a mobile-local TypeScript 6 toolchain; the existing root TypeScript 7 toolchain remains in place.
- Seven private npm workspaces establish the shared boundaries requested by the plan. Packages export TypeScript source for Vite/Metro consumption; they are not independently published libraries.
- `domain` defines Program, Subject, CurriculumDomain, Concept, Question/Option, Assessment/Blueprint, Attempt/Answer, Score, Diagnostic, RemediationPlan, LearningProgress, and GuidanceEvaluation.
- `validation` and `content` provide runtime parsers for programs, concepts, taxonomy, questions, visual specifications, and blueprints. They reject malformed structures, invalid references, prerequisite cycles, insufficient quotas, missing required visuals, and published content without review signoff. The math check verifies balanced delimiters; it is not a complete mathematical/editorial review.
- Blueprint resolution deterministically selects eligible items by domain and stable item ID. Official reference items cannot enter diagnostic/practice blueprints. Resolved assessment identity includes item revisions and order. Seeded randomization and cognitive-quota balancing are downstream capabilities.
- `learning-runtime` implements initialize, answer, navigate, save, resume, submit, and deterministic scoring. Submission locks answers; deadlines reject late answers. Persisted data is validated against version, learner identity, assessment identity, answer options, and timestamps. Results are recomputed when restored.
- A serialized session controller persists each command before exposing its resulting state. Failed writes leave the in-memory state unchanged and surface an error; malformed or obsolete stored state is not silently overwritten.
- Persistence is injected through an asynchronous port. Web supplies browser local storage, native supplies Expo SQLite KV storage, and tests supply memory storage. `RemoteSyncAdapter` defines the later synchronization boundary; no sync service is implemented or called.
- `api` separates anonymous/free sessions from authenticated learner, premium, content-admin, and platform-admin sessions. Its injected transport checks token expiry and attempt ownership and supplies an idempotency key. It is a contract/client boundary, not a backend or authentication provider.
- `analytics` defines event/sink contracts; `design-system` defines framework-independent semantic tokens.

## Representative content and review status

The preview uses three existing authored questions from `content/bxm-mvp-learning/authored-items-pack.json`: `bxm-authored-v1-geo-001`, `bxm-authored-v1-func-001`, and `bxm-authored-v1-stat-001`. Their canonical snapshot and matching taxonomy live in `packages/content/src/representative.json`. Tests compare the snapshot with the preserved source. These are nonvisual examples and do not require missing POC diagram renderers.

Original computationally-checked provenance is preserved. All three items remain **draft**, with no invented reviewer or Gate D approval. The explicitly named `createFoundationAssessment` preview opts into drafts; ordinary blueprint resolution refuses them. The three-item preview is not the official 20-item diagnostic or 60-item benchmark. Both foundation clients are development reference surfaces, not approved content releases.

The rest of the content corpus and the POC's services remain in their existing formats. Future migration should add adapters and validated content incrementally, rather than import Web features into shared packages. New taxonomy IDs should be globally unique within their entity collection when additional programs/subjects are added.

## Acceptance evidence

| Gate | Evidence | Status |
| --- | --- | --- |
| 1 — Repository | Web isolated; Expo workspace; seven shared packages; root build/typecheck/test tooling and CI cover the foundation | Implemented and checked |
| 2 — Domain | Named domain contracts and lifecycle; shared TypeScript compilation without DOM libraries or platform types | Passed |
| 3 — Content | Canonical runtime schemas; existing representative content; deterministic resolution; rejection tests for invalid schemas, mapping, publication, quotas, and stream mixing | Passed |
| 4 — Assessment | Lifecycle, local persistence, resumption, immutable submission, and deterministic results tested; production Web browser reload journey passes | Passed |
| 5 — Cross-platform | Same package imports in Web and Expo; Web browser execution; Android/iOS Metro + Hermes exports; sync and async persistence-port tests | Automated checks passed; native device smoke pending |
| 6 — Integrity | Dependency-boundary script plus platform-independent typecheck; no new domain dependency on React/Expo; content outside UI; shared lifecycle used by both clients | Passed |

`scripts/check-boundaries.mjs` enforces the allowed shared dependency graph, forbids imports outside package boundaries, and excludes dynamic imports/require in foundation source. The package typecheck has no DOM libraries or ambient platform types. This is a practical CI guardrail, not a general security analyzer.

Verification commands:

```sh
npm ci
npm run typecheck
npm run check:boundaries
npm run lint
npm test
node scripts/ingest-validate-content.mjs
npm run build
npm run audit:bundle
npm run build:mobile
```

With a Web production preview running, use `FLOW_BASE_URL` to point `npm run test:foundation:browser` and `npm run test:flows` at it (default foundation browser URL: `http://127.0.0.1:4173`). `npm run dev:mobile` starts Expo; close/reopen the native app after answering to perform the remaining device persistence smoke check.

Local command logs and browser screenshots are in ignored `artifacts/p0*` paths. CI now runs foundation boundaries, all three TypeScript checks, both native exports, shared tests, and the foundation browser journey alongside existing quality checks. The bundle-budget script now reads its preserved budget from the documentation archive.

Final local results: **413 POC tests across 81 files and 27 foundation tests across 3 files passed**. The content ingestion check reports **821 items, 14 blueprints, 0 errors, 0 warnings**. Foundation and POC browser journeys passed, including the existing accessibility/layout checks (no serious violations, overflow, or page errors). Lint, all TypeScript checks, dependency boundaries, Web build, bundle budget, Expo dependency compatibility, and both native exports passed. Existing POC bundler/KaTeX warnings remain nonfatal.

## Limits and next work

- No Android/iOS device or emulator execution was performed here. Bundles and the native SQLite adapter's types are checked, while the actual native storage lifecycle still needs a device smoke test.
- Native math currently displays plain source notation. Native math/visual rendering, larger content migration, and full product flows belong to subsequent slices.
- Multiple simultaneous clients writing the same attempt are not coordinated. Server-authoritative grading, verified entitlements, remote sync/conflict policy, schema migration, account UX, payments, deployment, and production telemetry are outside P0.
- Existing POC auth/storage/content decisions remain POC-only. The new API layer does not upgrade the POC's simulated accounts into verified sessions.
- No live MEP/DGEC dependency was introduced. Backend topology and payment-provider decisions remain unresolved; the P0 plan resolves the monorepo decision only.
