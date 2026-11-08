---
> **HISTORICAL ARCHIVE & DEPRECATION NOTICE**
>
> **Status:** SUPERSEDED & ARCHIVED
> **Effective Milestone:** Documentation Consolidation Baseline (Target Architecture v2.0)
>
> This document was produced during early Proof-of-Concept (POC) experimentation and historical sprint execution. Its architectural assumptions, single-platform focus, or implementation details **do not represent approved target production architecture**.
>
> For the authoritative target system architecture, refer to:
> - [01. System Overview & Boundaries](../../architecture/01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md)
> - [02. Core Domain Services & Learning Loop](../../architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md)
> - [03. Multi-Platform Client & Shared Application Layer](../../architecture/03_MULTI_PLATFORM_AND_SHARED_CLIENT.md)
> - [04. Content Platform & Curriculum Pipeline](../../architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md)
> - [05. Data Infrastructure & Local Runtime](../../architecture/05_DATA_AND_INFRASTRUCTURE.md)
> - [06. Implementation Alignment & Transition Analysis](../../architecture/06_IMPLEMENTATION_ALIGNMENT_AND_TRANSITION.md)
---

# BXM Mathematics — Consolidated Handoff Review and Integration Master

Review date: 2026-11-05, America/Costa_Rica. Reviewed checkout: `abd8fc8` (merged PRs #62, #63, #64). Agent baseline: `75a70a07fb35b6c523ec99ab0959da254e436e16`.

## Current application-integration status

**The guided-learning slice is now connected and its automated checks pass.** Open Mathematics BXM 2026-c2 and choose **Abrir aprendizaje guiado**. Direct route: `#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje&seccion=diagnostic`. Lesson links include the domain-qualified `evidencia` query; assessment and result links retain `intento`.

This section supersedes the historical repair/review status below. Verification is recorded in [INTEGRATION_VALIDATION.json](INTEGRATION_VALIDATION.json).

| Backlog | Current disposition |
| --- | --- |
| INT-00 | Verified runner is the existing thread pool. Full suite: **48 files / 240 tests passed**; feature suite: **13 files / 89 tests**; latest focused contracts/restore/UI suite: **4 files / 36 tests**. Explicit fork workers fail to access transform temp files in Windows sandboxes; use the direct Node command below rather than relying on npm to forward pool flags |
| INT-01–03 | Canonical specification, corrected authored content, validated generation and family identity are used by the production providers; no developer fixtures enter the learning pool |
| INT-04–05 | Learner-scoped recovery journal plus idempotent progress sink; drafts, shuffled mappings, flags, hints, retries, first responses, event IDs and original deadlines survive refresh. Corrupt data is retained and save failures are visible. Partial selections require explicit acceptance. Answers are recorded before optional learner-reason prompts |
| INT-06 | Live inventory and lesson availability, recent-incorrect queue ranking, and session-completion records are connected. Unanswered completions count as completed sessions, but do not fabricate responses or activity streaks. Lesson checks are activity-only and cannot inflate mastery. Legacy imports remain explicit, scoped, and excluded from mastery |
| INT-07–08 | Real math/emphasis rendering, interactive circle/sphere lessons, assessment-owned quiz scoring, free sample lesson per domain, free diagnostic/results, and reactive prototype capability decisions are connected. Premium dashboards are not rendered for free learners. In-progress sessions may be resumed after a tier change; new paid activity requests are rechecked at preflight acceptance |
| INT-09 | Complete for the approved local slice: live host route, content, assessment policies, generated practice, mastery checks, retests, 20-item authored mocks, persisted result review, lesson recommendations, profile switching, optional legacy import, failure recovery and result download. Existing reference resources/history remain available through the subject hub |
| INT-10 | Automated journey and compatibility checks complete. Human mathematical/provenance review and manual assistive-technology/accessibility review remain before a certified/public release claim |

### Persistence and source-of-truth boundaries

- `src/features/bxm-integration/providers.ts` supplies the reviewed authored pack and deterministic variants. `contracts.ts` normalizes provenance and metadata, applies answer/rationale permutations together, and exports response events from finalized sessions.
- `BxmLearningStore` keeps a learner-scoped versioned recovery journal at `bxm-mvp-progress:v1:learning:<encoded userId>` containing active snapshots, durable results, explanation exposure and lesson activities. This is a session/recovery record, not a second mastery calculator.
- `BxmProgressStorage` remains the canonical new-feature response-event sink. A journaled result can replay into it after a failed event write; stable IDs prevent duplicate scoring. The journal must save before derived progress is committed. No baseline key is cleared or rewritten.
- Profile changes remount the host with that learner's journal. Completed-result review is durable, and prior explanations remain recorded if an active activity is discarded.
- The official benchmark still uses the existing free reference flow. Browser checks verified **60 questions and 150 minutes**, and `git diff` found no changes to the canonical BXM benchmark/specification or baseline atomic items. The new authored learning pool does not sample benchmark items.
- The new host is additive to the established subject hub/reference experiences. Baseline result history and old links continue working; authored mastery is not mixed with old reference-summary averages.

### Verification and reproducibility

1. `node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1`
2. `npm run build` and `npm run lint` — pass; lint is clean, existing bundling warnings remain.
3. `node scripts/bxm-learning/validate-learning-content.mjs` — 71 canonical evidences, 30 marked-answer checks, four lessons, four executable template families, 614 parsed mathematical expressions. Human certification is not implied.
4. `node scripts/bxm-assessment/validate-assessment.cjs` — passes without downloading `tsx`.
5. `node scripts/bxm-integration/validate-learning-journey.mjs --start-server --reference` — starts a temporary local Vite server and closes it afterward. Uses installed Chrome on Windows or `FLOW_CHROME_PATH`; otherwise uses the installed Playwright browser. Local browser/server network access must share the same sandbox boundary.

The browser journey verified: free diagnostic; exact refresh/resume and deadline retention; durable results with unanswered-item exclusion; free complete sample lessons; quiz retry accounting; live tier changes; paid practice gates; explicit shortfall acceptance; preservation of a first wrong response after a correct retry; the 71-evidence dashboard; generated practice, mastery checks, retests and authored mocks; learner isolation; the separate reference exam; 320px circle and sphere lessons; the exterior sphere/plane case; mathematical rendering without raw delimiters or emphasis markers; and no page errors.

The existing browser regression suite also passed PDF access, optional guidance, baseline exam recovery/results, other programs, official/review exams and its responsive/theme layout matrix. Its obsolete “Salir” step was aligned with the current **Finalizar → Guardar y salir** dialog; no baseline exam behavior was changed to accommodate the test.

Local screenshots: `artifacts/bxm-integration/mobile-lesson.png`, `artifacts/bxm-integration/desktop-dashboard.png`, and `artifacts/ui-validation/`. Circle/sphere states, observed readability and horizontal-overflow checks were reviewed; automated screenshots do not constitute accessibility certification.

No commit, push, deployment, payment integration, backend account/sync, AI tutor, new subject or institutional feature was performed. The initial four-lesson / 30-item coverage and its disclosed human-review status remain the release boundary.

## Historical repair-phase status

The initial review below is retained as a historical record. A subsequent repair pass now changes feature implementations and adds tested cross-module adapters. Product activation remains deferred to INT-09; this pass does not register application routes or migrate real learner data.

| Area | Repair delivered | Remaining release/integration work |
| --- | --- | --- |
| R01 / INT-01 | Canonical 71-evidence progress catalog; no invented evidence percentages; explicit subject alias adapter | Connect host context and deep links |
| R02 / INT-02 | Quartile answer/source corrected; item mappings, sphere wording, skewness statement, lesson overclaims, and overescaped math corrected; validator parses KaTeX and checks 30 marked answers | Human mathematical/provenance review; maintain coverage inventory as content expands |
| R03 / INT-03 | Four executable generators, parameter validation, stable parameter/version identities, fixed-item families, exhaustive declared-grid regression checks | Host must choose unseen families and disclose narrow content coverage |
| R04–R05 / INT-05 | Review allowlist and canonical benchmark aliases; global soft marginals; blueprint totals; runtime retries/feedback/deadline enforcement; finalized immutable result snapshots; UI completion callback guard | Production partial-diagnostic acceptance screen, formula-sheet injection, exposure history and deterministic presentation shuffling at host boundary |
| R06 / INT-04 | Explicit learning→assessment→progress adapters retain modes, evidence, family, provenance, hints, retries and item snapshots; unfinished exports cannot become completed progress | Connect finalization sink once; persist/resume active sessions without resetting IDs or prior exposure |
| R07–R08 / INT-04 | Runtime event validation, unknown-metadata exclusion, per-learner storage partitions, conflict detection, visible save errors; scoped non-destructive legacy import with skipped/summary-only counts | Host profile switching and migration preview/acceptance; preserve summary-only records in baseline history |
| R09 / INT-07–08 | Existing math renderer in lesson/quiz/runner UI; B owns quiz scoring; retries retain response indexes; omitted capabilities default free; sample lesson/domain selection; free diagnostic CTA; reactive subscription adapter | Wire adapter into live host; choose approved exam formula resource; micro-quizzes lacking full reviewed metadata remain activity-only |
| R10 / INT-06 | Availability-aware dashboard inputs/actions; deterministic ranking; no implicit practice availability; no empty-plan mastery claims; independent difficulty progression; report completion metadata and separate first-response metrics | Track zero-response session completions in host/session records; improve recent-incorrect ranking from complete history; verify live queue candidates and report semantics end to end |
| INT-00 | Portable progress verifier, local assessment CLI bridge with no downloaded dependency; baseline full suite reproduced | Final repaired suite results recorded below |
| INT-09 / INT-10 | Not started | Production route/provider/session wiring, mobile/accessibility checks, full integrated journey and release acceptance |

Current repair evidence is [REPAIR_RESULTS.json](REPAIR_RESULTS.json); the original [REVIEW_RESULTS.json](REVIEW_RESULTS.json) remains unchanged. `src/features/bxm-integration/repairs.test.tsx` supplies the new regression suite. `scripts/bxm-assessment/validate-assessment.cjs` runs B's existing standalone validator on Node 22 without `npx tsx` downloads. The Node type-stripping bridge is for local non-UI validation only.

### Verification during repairs

- Before edits, the merged baseline completed: **46 test files / 218 tests passed**, using `npm test -- --pool=forks --maxWorkers=2`. It took roughly 258 seconds, dominated by isolated worker startup; the earlier review's bounded runs had stopped too early to establish success or failure.
- Focused repaired suite completed: **12 test files / 81 tests passed**, including 14 cross-module regressions. Subsequent report/UI boundary refinements are covered by the final run below.
- Content validator passed: **71 canonical evidence records, 30 marked-answer checks, four lessons, four templates, 614 parsed math expressions**. Qualitative checks are editorial reference checks; no human certification is claimed.
- Standalone assessment validator passed. Build passed with existing bundling warnings. Lint passed without warnings after validator/selection cleanup.
- Final repaired full-suite result: **47 test files / 232 tests passed** with `npm test -- --pool=forks --maxWorkers=2` (approximately 317 seconds). The latest metadata-hardening regression run also passed independently: **14/14 tests**. Final build, lint, content validator, assessment validator, and `git diff --check` passed; production bundling warnings remain.

The next implementation phase is INT-09: connect the reviewed modules and adapters to production providers/routes, active-session persistence/resume, learner switching, capability decisions, partial-diagnostic acceptance and completion tracking. INT-10 then verifies the actual journey and mobile/accessibility behavior. Report-history ranking refinements and zero-response completion records listed above must be resolved during that host integration; no product release is claimed by this repair pass.

The integration backlog below remains the sequencing reference. Entries described as originally OPEN refer to the review snapshot; this current status table takes precedence for the work already repaired.

## Disposition

All three deliveries are present and their merged changes stay inside the originally assigned directories. The combined application builds. The modules are **not ready for production activation**: expected integration work remains, and review reproduced correctness and contract defects that must be repaired first.

This master supersedes the individual handoffs for integration status and release acceptance. The original handoffs remain historical delivery records; their passing checks and coverage claims are not a combined release certification. This review changes documentation and adds a read-only audit harness; it does not activate routes, rewrite feature code, or migrate learner data.

Sources:

- [Agent A handoff](agent-a/HANDOFF.md): learning content and Temario.
- [Agent B handoff](agent-b/HANDOFF.md): assessment/session mechanics.
- [Agent C handoff](agent-c/HANDOFF.md): progress, recommendations, capabilities.
- Governing scope: the original plan and consolidated decisions v1, retained locally in `BXM-consolidated-agent-answers.md`.
- [Executable audit](../../scripts/bxm-integration/audit-handoffs.cjs) and [captured results](REVIEW_RESULTS.json).

## Delivered inventory, qualified by review

| Area | Present in merged code | Qualification |
| --- | --- | --- |
| Official evidence browsing | A's catalog has 71 entries and matches specification keys and descriptions exactly | Use this or a direct specification adapter as canonical; C's fixture does not match |
| Rich lessons | Four anchor lessons across three domains | Content completion does not establish mastery; validate alignment and mathematical rendering before release |
| Authored practice | 30 fixed items, 10 per domain | Mathematical verification is incomplete; at least one answer is inconsistent with its solution |
| Isomorphic practice | Four declared template families, three executable generator methods | Sphere-cut generator is absent; parameter validation, identity, and option uniqueness need repair |
| Interactive learning | Circle and sphere-section components | UI/geometry/mobile acceptance still required; no live route connects them |
| Assessment | Selection engine, session runner, wrong-answer classifier, micro-quiz engine, preview/UI | Runtime policies, selection review filtering, and export contracts need repair |
| Learner progress | Mastery, recommendations, analytics, capabilities, namespaced persistence, dashboard | Default catalog, runtime validation, profile scope, availability, and session metrics need repair |
| Product wiring | Deferred by all three agents | No new feature route or cross-module production connection was found in App/navigation/existing components |

Diff review against the baseline found only assigned A/B/C paths changed. Existing shared services remain unchanged, as intended. Content pack JSON is nevertheless included by the existing broad content glob during bundling; emitted JSON chunks do not mean the new learning experience is reachable.

## Verification performed on the merged checkout

| Check | Review result |
| --- | --- |
| `npm run build` | Passed TypeScript compilation and Vite production build. Chunk-size and ineffective-dynamic-import warnings remain; baseline attribution was not independently established |
| `npm run lint` | Passed with two warnings: unused `warn` in A's validator and empty fallback spread in B's selector. Historical zero-warning claims do not describe this run |
| `node scripts/bxm-learning/validate-learning-content.mjs` | Reported success; limited structural checks, not mathematical or full KaTeX validation |
| `node scripts/bxm-integration/audit-handoffs.cjs` | Completed; reproduced catalog, generator, policy, validation, and content findings below. JSON contains observed behavior, not release pass/fail assertions |
| Default full Vitest run and single-worker thread retry | Started but produced no completed suites during bounded observation; interrupted. Historical full-suite claims were not reproduced |
| Fork-pool baseline smoke test, `src/utils/coordinateTransform.test.ts` | Passed: 1 file / 2 tests |
| Fork-pool full Vitest run | Started but produced no completed suites during bounded observation; interrupted. Combined test status remains unverified |
| `node scripts/bxm-progress/verify-progress.mjs` | Failed on Windows at its `./node_modules/.bin/oxlint` shell command; independent npm lint/build checks succeeded |
| B standalone validator | Handoff uses `npx tsx`; `tsx` is not installed/declared in this checkout. No dependency was downloaded for review |
| UI journey/mobile/accessibility | Not performed; modules remain unregistered. Do after repairs and wiring |

The audit harness uses Node 22's experimental type stripper with a small CommonJS bridge for the non-UI modules. It is a review tool, not a production build or substitute for the actual Vitest/React suite. Its formula scan is intentionally strict and simplistic: Unicode currency warnings and display-math delimiter parsing need proper classification rather than treating every strict-mode warning as a mathematical error.

## Confirmed pre-activation defects

Priority P1 below means resolve before activating the affected feature. P2 means resolve before representing the associated metric or behavior as delivered.

### R01 — P1: Progress catalog is not the official 71-evidence catalog

Source: `src/features/bxm-progress/ui/evidenceCatalogFixture.ts:7`; dashboard defaults to it in `ui/BxmPreparationDashboard.tsx:32`.

The fixture has **35 entries**, not 71. Five keys are absent from the specification, 41 canonical keys are missing, and the other 30 descriptions differ. Its `weightOfficialPercent` values total 149, with no official evidence-level derivation. For example, geometry A1.2 is described as point-position classification although the canonical specification describes algebraic circle representation. The handoff's 71-evidence fixture claim is incorrect.

Repair: remove this fixture as a production default. Derive records from the canonical specification or adapt A's verified catalog. Preserve descriptions, domain-qualified keys, and the actual level of official weighting. Internal equal-share weights must be identified as heuristics. Test exact key/description equality and all 71 entries, including missing/unknown-key rejection.

### R02 — P1: Authored statistics answer contradicts the stated calculation

Sources: `content/bxm-mvp-learning/authored-items-pack.json:883` and its authoring script.

`bxm-authored-v1-stat-009` gives ages 18,19,20,22,24,25,28,36. Its own median-of-halves calculations produce Q1=19.5, Q3=26.5 and IQR=7; therefore range minus IQR is 18−7=11. The marked answer is 12.5, and 11 is absent from the options. The solution switches to an unspecified interpolation method to justify 5.5 after calculating 7.

Repair/quarantine this item, declare the quartile convention, and update both JSON and generation source. Independently review all 30 items, micro-quizzes, and worked examples. Do not count a structural validator pass as computational verification. Example mapping errors also warrant review: `geo-004` tests point position but is tagged geometry A1.2 instead of the appropriate position evidence; `geo-003` asks for an algebraic equation while tagged to graphical-recognition A1.1. Semantic alignment needs more than checking key existence.

### R03 — P1: Declared generation coverage and executable guarantees disagree

Source: `src/features/bxm-learning/services/bxmIsomorphicGenerator.ts` and `content/bxm-mvp-learning/isomorphic-templates.json`.

Four families are declared; only circle, linear-equation, and RIC methods exist. Sphere-cut generation is not implemented. Public methods do not enforce the declared ranges: origin/radius-one circle and zero-slope/zero-x linear inputs each yield four identical choices; Q1=0 RIC yields only two distinct choices. These examples fall outside some manifest constraints, which demonstrates missing API validation rather than proving all allowed values fail. Different parameter sets with the default seed produce the same item ID.

Repair: enforce finite/range/exclusion constraints at generation, test all allowed edge cases, validate semantically unique options, implement or explicitly withdraw the missing template, and derive stable IDs from family/version/parameters/seed. Add template version metadata. All 30 fixed items currently lack `familyId`; group genuine variants with their template families so superficially distinct copies do not inflate mastery sufficiency.

### R04 — P1: Selection admits unreviewed items and misses blueprint guarantees

Source: `src/features/bxm-assessment/selectionEngine.ts:68`.

`filterPool` accepts authored/generated items without checking `reviewStatus`; an unreviewed authored fixture is admitted. `difficultyTargets` is declared but unused. Cognitive targets are applied within each domain rather than as global marginal quotas; defaults target 8/7/5 rather than the agreed 8/8/4. A custom `totalItems` is reported independently of the domain counts actually selected. Official-past exposure is computed during filtering but discarded by diagnostic assembly; benchmark exclusion also depends on accurate provenance and the caller supplying the manifest ID/code set.

Repair: explicit eligible-review allowlist, manifest-based canonical identity exclusion, global soft cognitive/difficulty balancing, blueprint consistency validation, and an exposure summary based on the actual selected items. Return partial/exposure information through the session boundary and require explicit acceptance before launching a partial diagnostic. Test all selection entry points, not only the main diagnostic. Do not silently downgrade or reclassify official content.

### R05 — P1: Session runner does not enforce all declared policies

Source: `src/features/bxm-assessment/sessionRunner.ts:201` and `:284`.

With `allowRetries=false`, `maxRetriesPerItem=0`, and `allowImmediateFeedback=false`, the runner still accepts a retry and returns correctness. Manual finalization after the deadline returns `completed`, because only some action paths call `checkTimeout`. UI-side suppression is insufficient for the exported policy contract. The formula-sheet/calculator flags currently have no corresponding resource controls in the new runner UI.

Repair policies inside the state machine; preserve the original unassisted wrong response when later explanations/retries occur; apply deadline checks to all finalizing/mutating paths without recursion; make timeout and manual completion emit one stable completion. Add explicit exposure history and permitted study resources. Verify `onFinish` delivery is exactly once as well as result idempotency. Treat pre-submit exam answer edits as drafts.

### R06 — P1: Assessment results cannot be fed directly to progress

Sources: B `types.ts` / `sessionRunner.ts`; C `domain/types.ts`; A `types/index.ts` / `components/BxmMicroQuiz.tsx`.

B exports nested first responses/retries, without item provenance, review status, correct answer, concept IDs, or prior-explanation exposure in each attempt snapshot. C requires a flat `AttemptEvent` with those fields. Session-kind and provenance enums differ across all three modules. A's micro-quiz callback supplies only quiz/evidence/selection/correctness/time; pressing retry resets the component without a response index or exposure record. C cannot safely reconstruct eligibility from these callbacks. The handoff instruction to feed exports “directly” is incorrect.

Repair the boundary through explicit adapters plus sufficient immutable item/session snapshots. Do not fill missing review/provenance/hint/exposure metadata with invented eligible defaults. Preserve stable event IDs across save/retry/reload; keep unanswered entries out of response-event mastery. See contract decisions below.

### R07 — P1: Malformed persisted records can qualify for mastery

Sources: C `storage/progressStorage.ts:62`, `domain/qualifyingObservation.ts:20`.

Storage accepts any object with event ID, evidence key, and timestamp. Qualification checks `responseIndex > 0` and `hintsUsedBeforeResponse > 0`, so missing values pass both checks; unknown provenance/review/exposure are not validated strictly. The audit persisted an incomplete object and obtained `eligible=true`. Some downstream aggregators can then miscount or crash on invalid dimensions.

Repair with runtime validation at ingestion/read and strict qualification: exact first-response index, exact known unassisted state, supported provenance/review state, valid timestamp/dimensions/context, and explicit exposure handling. Unknown imported metadata stays history-only. Quarantine/report invalid records without deleting baseline data; test malformed JSON objects as well as malformed JSON text.

### R08 — P1: Learner/context scoping is missing from the new progress store

Sources: C `domain/types.ts`, `storage/progressStorage.ts`; baseline `src/services/storageService.ts`.

Existing application attempts are scoped by `userId` and context. C's new events/store have no learner identifier or partition despite an unused active-profile key, and legacy import reads all attempts. Connecting the dashboard without adding scope would combine local profiles. This is a prospective integration defect; the new dashboard is not currently live.

Repair profile/context partitions and guest behavior before hooking up persistence. Filter legacy imports by learner/program/subject/convocatoria and report imported/skipped/summary-only counts. Preserve original timestamps and unknown metadata; do not fabricate current activity dates for old summaries. Keep every existing storage key intact.

### R09 — P1: Default capabilities and learning presentation conflict with decisions

Sources: A `components/BxmLessonView.tsx`, `components/BxmMicroQuiz.tsx`; B `components/BxmSessionRunnerView.tsx`; C `ui/BxmPreparationDashboard.tsx:33`.

A and C default to premium when capabilities are omitted; A hides the diagnostic CTA for free learners although initial diagnostic access is free. Math strings are inserted as plain React text across lesson/quiz/runner surfaces rather than rendered with the existing `TextRenderer`. A's retry callback also bypasses B's scoring authority. New resource UIs and review-status disclosure are incomplete.

Repair capability defaults to free/explicit decisions, identify one sample lesson+quiz per domain, preserve free diagnostic/basic results, and route all scoring through the assessment engine. Render math using the established renderer after content/delimiter repair. Strict audit scanning found warnings/errors, but its simple `$...$` extraction is not a substitute for parsing `$$...$$` correctly or checking the actual UI renderer. Test visible mathematical output, formulas/resources, free/premium states, and review disclosures.

### R10 — P2: Recommendations and reports overstate available evidence/activity

Sources: C `recommendations/recommendationsEngine.ts:91`, `analytics/analyticsEngine.ts`, `ui/BxmPreparationDashboard.tsx:54`.

Missing inventory defaults to “available”; the dashboard exposes no inventory input and never passes it. Study plans recommend lessons without checking lesson availability. Empty/insufficient-data plans can recommend full simulations, and copy refers to an internal threshold as “umbral de dominio MEP.” Weighted numeric ranking can reverse the agreed accuracy-before-weight tie policy. Recency and actual candidate-item availability need explicit implementation. Weekly “completed sessions” counts distinct session IDs among response events, with no completion event/status; an unfinished session is counted as completed. Weekly accuracy currently combines first responses and retries and must be labeled separately from first-response performance. Progression aggregates only the latest observation per family across difficulty, so later higher-tier activity can erase lower-tier evidence needed to sustain recommendations.

Repair availability-aware navigation and empty states, deterministic lexicographic ranking, accurate/internal labels, explicit session completion data, and separately defined response/activity metrics. Define progression retention across tiers and test it. Streak completion semantics must follow the same session/activity model. No evidence-wide readiness claim should be inferred from the narrow initial content pack.

## Contract consolidation decisions for the integration change

These apply existing consolidated policies; they do not broaden feature scope.

1. **Canonical taxonomy:** specification JSON is authoritative; A's catalog is the verified derived representation. C consumes an adapter, not a second taxonomy. Domain-qualified evidence keys remain unchanged. Official weights are preserved at their true source level.
2. **Context alias:** existing app routes/storage use `subjectId: matematicas`; the canonical specification/new feature modules use `matematica`. Add an explicit boundary alias and tests; do not globally replace persisted IDs or break saved links. Preserve distinct `specId: 02-2026` and `convocatoriaId: 2026-c2`.
3. **Learning → assessment items:** adapt A `evidenceKey`→B `evidenceId`, `difficulty`→`difficultyTier`, `correctOption`→`correctAnswer`, `conceptId`→canonical concept metadata. Normalize only known provenance/review labels: `authored_proprietary`→`authored`; `authored_isomorphic_variant`→`generated_isomorph`; `authored_computationally_checked`→`computationally_checked`. Such mapping preserves a declared status; it does not establish the truth of the review claim.
4. **Assessment → progress events:** `attemptIndex`→`responseIndex`, `evidenceId`→`primaryEvidenceKey`, `difficultyTier`→`difficulty`. Flatten first response and retries with their original IDs/timestamps. Source missing provenance, review, correct answer, concepts, exposure, family/version, and learner/context from immutable trusted session metadata. Reject unresolved mappings from mastery.
5. **Enum reconciliation:** normalize B `topic_practice/evidence_practice/mock_exam` to C `practice_topic/practice_evidence/simulation_mock`. Extend the canonical model to retain `mastery_check` and `retest` explicitly, plus `simulation_benchmark`; do not silently squeeze these into ordinary practice and lose their meaning. Official-past content needs an explicit provenance category or history-only exclusion; it must not become authored mastery by default.
6. **Micro-quizzes:** B is the sole scoring/attempt authority. A renders selected state and feedback through an adapter. Record hints, answer exposure, retries, item/family identity, and session completion; do not turn every A callback into a fresh first response. Initially metadata-incomplete lesson checks can count as activity only.
7. **Progress storage:** use one namespaced canonical event/session store for new features, partitioned by learner/context. Baseline summaries may coexist as a compatibility/history adapter; do not let two independent stores calculate competing mastery or emit the same response twice. Expose persistence failures to the host UI instead of silently implying a save succeeded.
8. **Capabilities:** C's explicit capability definitions supply a subscription adapter; it subscribes to existing tier changes. Missing providers fail to free/denied for premium features. Client gating remains presentation policy, without billing/backend security claims.
9. **Benchmark:** load all protected IDs from the canonical 60-item manifest; retain the free existing benchmark flow and its 150-minute policy. Keep authored diagnostic/practice separate. Test exposure and canonical aliases through every selection entry point.

## Ordered integration backlog

All entries are **OPEN**. Owner is the integration implementer; A/B/C identify supplying modules, not concurrently authorized agents. Repairs should be independently reviewable before navigation activation.

| ID | Change / high-level files | Dependency | Acceptance |
| --- | --- | --- | --- |
| INT-00 | Establish working merged Vitest invocation; portable verification scripts; required lint/content checks (`scripts/bxm-*`, test config only if justified) | None | Combined suite completes with captured counts; tool failures distinguished from test failures; no unrequested dependency installs |
| INT-01 | Canonical taxonomy/context adapters; retire C fixture as production default (`bxm-progress/ui`, new integration adapter) | None | Exact 71-key/description parity; no invented official weights; subject aliases round-trip |
| INT-02 | Repair content/authoring source and validation (`content/bxm-mvp-learning`, `scripts/bxm-learning`) | INT-01 | Statistics item fixed/quarantined; semantic mappings and all options independently reviewed; validation actually checks asserted properties |
| INT-03 | Harden generator IDs, parameter constraints, family assignment, missing sphere template (`bxm-learning/services`, manifest/types) | INT-02 | Unique valid choices over allowed ranges; invalid inputs rejected; parameter-specific stable IDs; truthful family inventory |
| INT-04 | Runtime contracts, snapshots, enum adapters, scoped event/session storage (`bxm-assessment/types`, runner exports, `bxm-progress/domain/storage`, integration adapter) | INT-01 | Correct/incorrect/assisted/retry/unknown/benchmark/unanswered/profile cases preserve semantics and deduplicate |
| INT-05 | Fix assessment selection and runner policies (`bxm-assessment/selectionEngine`, `sessionRunner`, UI) | INT-02, INT-03, INT-04 | Review filter, protected IDs, deterministic global margins, shortages, retry policy, deadline races, exactly-once completion |
| INT-06 | Correct mastery qualification, progression retention, recommendations, completion/report metrics (`bxm-progress/domain/recommendations/analytics`) | INT-03, INT-04 | Unknown metadata excluded; five-family rules preserved; inventory-aware plans; true completion and first-response/activity denominators |
| INT-07 | Render mathematical content and bridge micro-quizzes (`bxm-learning/components`, `bxm-assessment/components`, `TextRenderer`) | INT-02, INT-04, INT-05 | Real KaTeX output; B owns scoring; retry/exposure preserved; accessible controls and permitted resources |
| INT-08 | Capability/subscription adapters and free sample selection (`subscriptionService`, feature host/capability UI) | INT-04 | Free official resources/diagnostic/basic results and one complete sample/domain; premium default never implicit; tier changes update live |
| INT-09 | Production providers and app routes (`App.tsx`, `navigation.ts`, subject hub, feature host, data/session services) | INT-01–08 | Deep links, back/resume/results, profile/context changes, empty/partial pools, lesson/practice/queue navigation work without fixtures |
| INT-10 | End-to-end release acceptance and master update | INT-09 | Journey below passes; baseline exams/other programs unaffected; remaining content review status disclosed |

Original task reconciliation:

- A INT-A-01 and B route registration and C INT-C01 → INT-09.
- A INT-A-02 and B item-provider wiring → INT-02/03/05/09.
- A INT-A-03/04, B micro-quiz callbacks and progress hookup, C INT-C02 → INT-04/07/09.
- A INT-A-05 (option shuffling) → INT-05/07: 29 of 30 current answers are A. Shuffle deterministically with the answer/distractor mapping preserved, or revise the pack; test correctness after presentation mapping.
- C INT-C03 → INT-01; INT-C04 → INT-08; INT-C05 → INT-06/09. C's dashboard needs a real inventory prop/provider, not only a call-site change to its existing props.
- B shared types reconciliation → INT-04, retaining compatibility with existing baseline item/session types rather than replacing them wholesale.

## Release acceptance and retained deferrals

Required journey: free initial diagnostic (or explicit limited-inventory state) → basic results → available evidence lesson → micro-quiz → authored/isomorphic practice → stored first-response history → premium dashboard/available next activity → mastery check → simulation → remediation/retest. Refresh/back/resume/profile switching and unavailable/disabled storage must have explicit behavior. No developer fixtures may enter production providers.

Preserve canonical 60-item benchmark identity/content, free access, formula/calculator policy, and timer. Test the new slice separately from benchmark validity. Run full tests, build/lint, content/KaTeX/solution validation, existing flow checks, mobile readability, keyboard/accessibility, and the actual integrated journey. Human mathematical review is a separate release status.

The initial scope remains four lessons and 30 authored fixed items after correction; broad lessons for all evidences and 100+ authored items remain content expansion. AI tutor, backend accounts/cross-device sync, billing enforcement, institutional dashboards, and more subjects remain deferred. Roadmap wording such as “append-only events mean no merge conflicts” and guaranteed non-hallucinating AI should be treated as unverified design aspirations, not delivered guarantees.

## Final review verification update

Full-suite runs using configured threads and an explicit fork-pool retry did not complete during this review and were interrupted after no completed suites were reported. One baseline fork-pool smoke file passed (2 tests). Build, lint (two warnings), A's structural validator, and the read-only defect audit completed. No combined-suite pass or integrated UI acceptance is claimed. Restore a reliable full-suite run under INT-00 before implementation acceptance.

Review artifacts added: this master, `REVIEW_RESULTS.json`, and `scripts/bxm-integration/audit-handoffs.cjs`. Original handoffs and feature implementations are unchanged. Existing untracked `BXM-consolidated-agent-answers.md` was preserved. No commits, merges, pushes, or feature activation were performed in this review.
