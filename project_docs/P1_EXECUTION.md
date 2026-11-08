# P1 — Core Product Vertical Slice

Implemented on `p1milestone`, 2026-11-08. Authority: [documentation index](INDEX.md), [architecture v2](architecture/), and [P1 plan](current-implementation-plan/P1_current_plan.md).

Status: implementation complete for the three-item development slice; native device acceptance and editorial approval pending.

## Executable journey

Web: run `npm run dev` and open `/learn`. `/foundation` aliases the same journey. The existing POC remains at `/`. Mobile: `npm run dev:mobile` starts the Expo client.

1. Choose BXM and Matemática from the canonical Program/Subject taxonomy.
2. Start the available three-item diagnostic blueprint.
3. Answer, navigate, leave and reopen to recover saved answers and position.
4. Submit to see deterministic totals, unanswered items and domain performance.
5. Read the provisional domain diagnosis and concept-specific worked remediation.
6. Start a new evaluation after reviewing the examples. Prior attempts remain stored.

`LearnerJourney` in `packages/learning-runtime` compiles canonical content, persists an active-attempt pointer and delegates commands to `AssessmentSession`. Both clients inject their storage adapters into the same controller. Attempt mutations are persisted before UI state advances. Submitted results, diagnosis and remediation are reconstructed from validated attempt evidence on reopen. Expired attempts submit automatically on resume or the active client timer; late answers are rejected by the runtime.

Scoring now includes per-item evidence and concept IDs. Diagnosis uses 75% / 60% thresholds and explicitly remains provisional: three items cannot establish sustained mastery or meet distinct-family volume requirements. Missed or unanswered evidence produces concept-specific examples and worked solutions; a perfect result recommends reassessment. Retests reuse the small authored pool and do not establish independent mastery.

## Content and scope

The slice reuses P0's three nonvisual authored questions, canonical taxonomy and blueprint. They remain drafts with preserved computational provenance. `createJourneyPreviewCatalog` explicitly opts into draft preview; normal production resolution still requires publication/signoff. No editorial reviewer or Gate D approval was invented. This is a development surface, not a released curriculum product or official diagnostic.

One program/subject is supported. No 60-question expansion, backend, authentication, payments, adaptive engine, native math renderer or POC migration was added. Native math remains source notation as allowed by P1 scope. Persistence is local per platform/device, without cross-device synchronization or concurrent-writer coordination. The new active pointer does not migrate old P0 preview attempts.

## Acceptance evidence

| Gate | Evidence | Status |
| --- | --- | --- |
| P1.1 Program | Canonical BXM/Matemática selection in both clients; browser selection checked | Passed |
| P1.2 Assessment | Same parsed registry, authored stream and deterministic blueprint resolution | Passed for draft development slice |
| P1.3 Runtime | Shared answer/navigation/save/resume/submit; deadline and failure checks | Passed |
| P1.4 Scoring | Deterministic totals, domains and per-item evidence; restored score recomputed | Passed |
| P1.5 Diagnostic | Shared provisional domain tiers and weak evidence | Passed |
| P1.6 Remediation | Shared concept-specific worked examples and next assessment action | Passed |
| P1.7 Web | Browser journey, reload, page reopen, new attempt and 375px overflow check | Passed |
| P1.8 Mobile | Same journey/controller; TypeScript and both native Hermes exports | Device execution pending |
| P1.9 Architecture | Seven-package dependency check; framework-free shared logic | Passed |
| P1.10 Persistence | Shared sync/async adapter tests and Web browser reopen | Native close/reopen pending |

Verification:

- `npm run typecheck`, `npm run lint`, `npm run check:boundaries` passed.
- `npm run test:foundation`: 32 tests across four files passed, including five new vertical-slice tests.
- The pre-existing POC regression suite stalled at Vitest startup without executing test files in this session, including retries with bounded workers, an unsandboxed run, and workspace-local temporary storage. These runs were stopped; the 413 POC tests recorded under P0 are historical evidence, not a P1 regression pass.
- `npm run build` and `npm run audit:bundle` passed.
- `npm run test:foundation:browser`: complete P1 journey passed against the production Web build. Existing CI already runs this script.
- `npm run build:mobile`: Android and iOS Hermes bundles passed. The sandbox temp directory initially denied Hermes writes; using workspace-local TEMP/TMP resolved it.
- Screenshots: ignored `artifacts/p1/learner-result.png` and `artifacts/p1/learner-mobile-web.png`. Result screenshot visually inspected.

## Remaining acceptance work

No Android SDK/device/emulator was available in PATH or the standard local SDK location. On an attached Android/iOS device, start Expo, choose BXM/Matemática, answer two items, navigate, close and reopen the app, confirm answers/position, submit, and reopen again to confirm score/diagnosis/remediation. Test a new evaluation afterward. This also closes the outstanding P0 native persistence smoke test. Native exports and async adapter tests do not substitute for that execution.

P1 must retain validation-pending status until native smoke evidence is recorded. Editorial review/signoff is additionally required before making this draft content a released product.
