# P2 — Content & Learning Expansion

Implemented on `p2milestone`, 2026-11-08. Authority: [index](INDEX.md), [architecture v2](architecture/), and [P2 plan](current-implementation-plan/P2_current_plan.md).

Status: implementation complete for the development learning catalog; native device execution and editorial release approval remain pending.

## Executable learning surface

Web: `npm run dev`, then `/learn` (also `/foundation`). Mobile: `npm run dev:mobile`. Choose BXM and Matemática. Both clients use `createLearningPreviewCatalog` from `packages/content/expansion` and the existing shared `LearnerJourney` assessment runtime.

The catalog exposes all 71 canonical evidence keys with their descriptions and domains, four existing lessons and all 30 authored items. Select an evidence to read its lesson, concepts, prerequisites, formulas, common mistakes, worked methods and review questions. Lessons retain source assets, including visual-type metadata. Interactive lesson widgets are not implemented on this new surface; native math remains plain source notation. Web uses the existing mathematical text renderer.

Source coverage status is preserved: four nodes are `complete`, 67 are `scaffolded_available_soon`. Completion describes available source assets, not editorial approval or learner mastery. Missing lessons are explicitly unavailable. Some scaffolded nodes have authored questions, so lesson availability and practice availability are shown separately. No replacement lessons or items were fabricated.

Practice uses only the selected evidence's authored questions. The optional `AssessmentBlueprint.evidenceIds` contract is validated and enforced by the shared compiler, before domain quotas are filled. Insufficient eligible content fails rather than borrowing items from neighboring evidence. Result links return to the specific weak evidence, including its unavailable state where applicable. Learners can then practice or start a new assessment.

The expanded development diagnostic contains the entire 30-item authored pool, with ten questions per domain and a 90-minute limit. This is a reproducible development assessment, not a psychometrically validated diagnostic. Scoring and diagnosis remain provisional. Retests reuse existing families and do not establish sustained mastery.

## Content integrity and architecture

`scripts/sync-learning-catalog.mjs` packages only the preserved evidence, lesson, authored-item and concept sources into `packages/content/src/expansion-data.json`. `npm run content:sync` regenerates it; `npm run content:check` rejects drift and runs in CI. The package-local snapshot keeps Web/Expo imports static and shared package boundaries intact, without filesystem or platform APIs in the shared runtime.

All questions and lessons remain drafts. Question stems, options, answer keys, rationales, solutions, family/version IDs and computational provenance are retained. The catalog enriches empty evidence concept lists using existing lesson/item mappings and resolves concept names from the preserved concept library. No reviewer, Gate D signoff or publication approval was invented. No official question pack is imported into this catalog. Shared stream filtering also rejects official questions injected into diagnostic/practice registries, even under draft preview.

The P0/P1 three-item fixture remains available for its original tests. P2 clients use the `p2-local` learner namespace, preserving P1 saved data without migration. Attempt persistence, resume, deadlines and deterministic scoring use the existing runtime. Storage remains local to the platform/device; backend accounts, payments, cloud sync and full adaptive generation remain downstream work.

## Acceptance evidence

| Gate | Evidence | Result |
| --- | --- | --- |
| P2.1 | Exact source ordering and keys; all 71 nodes loaded | Passed |
| P2.2 | All 30 authored items loaded, ten per domain | Passed |
| P2.3 | Evidence/lesson/concept/item joins; every practice compiled and resumed | Passed |
| P2.4 | Draft status, retained assets and provenance; production draft rejection | Passed |
| P2.5 | Authored-only catalog; injected official item excluded; invalid stream rejected | Passed |
| P2.6 | Evidence browsing, lessons, practice and weakness-to-evidence navigation | Passed on Web; native device pending |
| P2.7 | Expanded 30-item assessment plus targeted practice | Passed |
| P2.8 | 67 scaffolded lessons remain unavailable; no-item practice disabled | Passed |
| P2.9 | Same content/compiler/runtime used by Web and Expo | Typecheck and native exports passed; device pending |

Verification:

- `npm run content:check`, `npm run lint`, `npm run check:boundaries`, `npm run typecheck` passed.
- `npm run test:foundation`: 37 tests across five files passed, including five P2 integrity, isolation, compiler and persistence tests.
- `npm run build` and `npm run audit:bundle` passed. Existing POC dynamic/static import warnings remain.
- Production browser journey passed: all 71 options, four lessons, unavailable handling, exact-evidence practice, answer/reload/resume, deterministic result, result reopen, weak-evidence lesson link, 30-item assessment, new attempt, `/foundation` alias and 375px overflow checks. No browser page errors occurred. The sandbox denied Chrome localhost access, so the same check was run with the local server and browser together outside the sandbox.
- `npm run build:mobile` passed for Android and iOS Hermes, using workspace-local TEMP/TMP.
- The legacy `npm run test:poc` suite stalled at Vitest startup without executing tests and was stopped. It is not recorded as a regression pass. The same limitation was previously recorded under P1.
- Screenshots: ignored `artifacts/p2/lesson.png`, `learner-result.png`, `learner-mobile-web.png`, `lesson-mobile-web.png`. The mobile-width lesson screenshot was visually inspected.

## Remaining acceptance

On a real or emulated Android/iOS device, browse all domains, open completed and scaffolded evidence, read a lesson, start targeted practice, answer/navigate, close/reopen, confirm recovery, submit and follow a weak-evidence link. Native export and async storage tests do not substitute for this smoke test. Editorial review and Gates A–D approval are still required before any production content release.
