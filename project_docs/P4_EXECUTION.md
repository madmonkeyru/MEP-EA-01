# P4 — Durable Data Foundation & Mastery Continuity

Implemented on `p4m`, 2026-11-08. Authority: [P4 plan](current-implementation-plan/P4_current_plan.md), [domain architecture](architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md), [data architecture](architecture/05_DATA_AND_INFRASTRUCTURE.md).

P4 establishes an executable PostgreSQL system of record and shared longitudinal learning policies. Production deployment, commercial identity integration, native device acceptance, and editorial Gates A–D remain pending. No content or signoffs were changed.

## Durable repositories

`apps/service/src/postgres.ts` implements the original `AttemptRepository` contract plus the optional `ContinuityRepository` port. PostgreSQL enforces the primary key `(learner_id, attempt_id)`. Completed insertion uses `ON CONFLICT DO NOTHING` followed by a separate READ COMMITTED read; it never updates the completed row. Database triggers reject UPDATE and DELETE of completed attempts, independently of service validation.

An owner-scoped transaction advisory lock serializes attempt insertion, draft revisions and snapshot calculation across connections/processes. These are [PostgreSQL transaction-level locks](https://www.postgresql.org/docs/16/explicit-locking.html), released when the transaction ends. SQL is parameterized; learner and attempt IDs never become SQL identifiers. Test schemas use generated identifiers only.

The explicit, transactional v1 migration creates:

| Table | Responsibility |
| --- | --- |
| `schema_migrations` | Applied forward migration versions |
| `attempts` | Immutable normalized attempt, recomputed result, server-derived evidence and receipt |
| `mastery_snapshots` | Point-in-time evidence/domain measures and generated nivelación plan |
| `attempt_drafts` | Current owner-scoped mutable state and positive server revision |
| `draft_conflicts` | Stable conflict ID and retained normalized candidate, base revision and device ID |

Snapshot derivation reads all committed owner attempts under the same learner lock and stores the snapshot and plan together. An accepted attempt is durable before projection calculation. If projection storage fails, the submission returns 503; the existing completed outbox retries the same immutable payload and repairs the projection. Reading continuity also recalculates and persists the current rolling window, so inactivity cannot leave an old mastery tier falsely current.

`MEP_DATABASE_URL` selects PostgreSQL. The existing single-process file adapter remains the default for local development and preserves P3 filenames/records. It now implements durable snapshots and draft/conflict state with the same serialized service contracts. A configured PostgreSQL outage returns 503; it never falls back into a second data store. No automatic import of existing file records or anonymous local histories is implied.

Migration command: `npm run db:migrate`. Migration runs before the host, not implicitly on every request. It does not require the development auth token. The service closes its pool on SIGINT/SIGTERM and uses bounded connection/statement waits. Pool sizing, HA, backup policy, managed hosting and runtime database-role provisioning remain deployment decisions.

## Shared mastery and first-response provenance

`packages/learning-runtime/src/continuity.ts` owns the pure policies. `Attempt.firstAnswers` preserves the earliest response even if the learner changes the current answer. Recovery validates the first-response identities, options, timestamps and complete correspondence to answered questions. Final scoring and provisional diagnosis still use the existing runtime behavior; longitudinal mastery uses first responses separately.

The service resolves exact assessment revisions and derives `LearningEvidence`; it never accepts a client-provided correctness flag, score, mastery tier or plan. Metadata includes the assessment mode and canonical evidence/domain/family IDs, so future catalog changes do not erase already recorded mastery evidence.

P4 policy v1 uses:

- A rolling 30-day window, inclusive at its lower boundary and excluding future submissions.
- The earliest exposure per `(evidenceId, familyId)` within that window. Repeated family attempts cannot inflate qualifying volume or replace a failed first exposure with a later success. Ties are deterministic by attempt ID.
- At least five distinct families for each qualified evidence/domain measure. Lower volume is `insufficient_evidence`, with descriptive accuracy retained but no qualified tier.
- `mastered` at accuracy ≥75%; `in_progress` at ≥60% and <75%; `needs_practice` below 60%. Domain aggregates count the contributing first-family observations and independently require five distinct families.
- Unanswered assessed items count as incorrect. No mastery is manufactured for absent evidence.

P3 records without first-response metadata remain readable and usable for provisional diagnostic planning. When exact server content remains available, their saved responses can be reconstructed as legacy evidence, explicitly marked `firstResponseKnown: false`; they do not qualify longitudinal mastery. Continuing a legacy mutable attempt does not retroactively assert known first responses. Unknown content revisions contribute no fabricated evidence.

## Plan de Nivelación

The service calls shared `generateNivelacion` after mastery calculation. Each activity supplies its evidence, target concepts, reason, next action and available authored question IDs. Prerequisite deficiencies traverse the concept graph, including transitive prerequisites. Official-reference items never become practice recommendations; production recommendations use only the production-eligible question surface.

Priority is deterministic:

1. `no_diagnostic_yet`: evidence missing a diagnostic baseline → diagnose.
2. `remediation_pending`: a prerequisite has qualified `needs_practice` evidence → learn its concepts.
3. `diagnostic_weakness`: latest diagnostic first-response accuracy for that evidence is below 75% → practice.
4. `simulation_weakness`: latest benchmark evidence is below 75% → practice.
5. `retest_available`: qualified mastery recovered after a diagnostic/benchmark weakness → retest. Recovery makes that old weakness eligible for retesting rather than leaving it permanently in the weakness queue.
6. `general_practice`: other eligible evidence → practice.

For each evidence, the highest applicable unresolved reason is selected, then activities are ordered by that hierarchy and evidence ID. Recovery clears the active historical weakness only through the explicit retest path; a later successful diagnostic replaces the prior diagnostic weakness. The current service scopes recommendations to eligible BXM Mathematics domains. With no published items, production does not expose draft question recommendations.

## Versioned API and mutable draft rules

P3 attempt/catalog paths and immutable idempotency keys are preserved. New contracts are schema-v1 additions:

| Endpoint | Response / behavior |
| --- | --- |
| `GET /v1/learning-continuity` | `{ schemaVersion: 1, mastery, plan }` for the authenticated owner; recomputed and durably stored |
| `GET /v1/drafts/{encodedId}` | `{ schemaVersion: 1, draft, conflicts, completed }`; another owner's draft/conflicts are invisible |
| `PUT /v1/drafts/{encodedId}` | `{ schemaVersion: 1, attempt, baseRevision, deviceId }` → normalized `DraftRecord`, or 409 with retained `DraftState` |

All endpoints use the existing verified session/learner role boundary. Body ownership must match the session and path. Draft state uses the existing exact-content restoration and timing validation; revisions are nonnegative integers and device IDs are bounded nonempty labels. Unknown payload fields are discarded before persistence.

New drafts require `baseRevision: 0`; updates require the current revision. Accepted changes increment the server revision. Exact state retries return the current record without incrementing it, including after response loss. Assessment identity, start/deadline and previously committed first answers cannot be rewritten through a draft update. Ancestry violations or divergent stale writes return 409 and durably retain the candidate. Repeating the same conflict does not duplicate it.

Explicit reconciliation reads the current revision and submits the chosen/combined state against that revision while preserving committed first responses. Prior conflicts remain retained for review. There is no automatic merge or last-write-wins behavior. Completion freezes the separate immutable attempt record; existing draft state remains available, and later mutable writes become retained conflicts. Completed submissions continue using P3's stable `{learnerId}:{attemptId}` idempotency key.

`packages/api` exposes `getLearningContinuity`, `getDraft`, `saveDraft` and optional `DraftSynchronizer`. The synchronizer commits platform local recovery before remote work, persists pending revision state, retries after outages and stores 409 details separately without replacing the learner's local version. Web and Expo can consume the same helper with their existing storage adapters. Account/device UX and a conflict-review screen are not added; the plan allows clients to surface continuity without requiring UI work.

The existing completed outbox and default `p2-local` journey remain intact. No UI component owns mastery, prioritization or conflict policy.

## Local setup and CI

See [README setup](../README.md#p4-service-and-postgresql-development). `compose.yaml` supplies PostgreSQL 16 on loopback port 54329 and a named durable volume. Its credential is deliberately local-development-only. `docker compose stop` preserves data.

`MEP_TEST_DATABASE_URL` selects the test database. `npm run test:postgres` refuses to run without it; each execution creates a random isolated schema and drops only that schema afterward. Ordinary foundation runs skip the PostgreSQL suite when no URL is supplied, preserving database-free development. CI provisions PostgreSQL 16 and runs the required database-backed gate explicitly before the existing quality checks. Remote CI execution has not been claimed from this local session.

## Acceptance evidence

| Gate | Evidence |
| --- | --- |
| P4.1 Persistence | Shared file/PostgreSQL service contract; eight concurrent completed retries, immutable conflict, repository/service recreation; SQL UPDATE/DELETE trigger rejection |
| P4.2 Mastery | Threshold-boundary, family deduplication, first-response correction/recovery, legacy provenance, window boundary/expiry, domain aggregation and qualifying 20-family service tests |
| P4.3 Nivelación | All six ordered reasons, prerequisite traversal, recovery retest and official-item exclusion; persisted plan returned through shared API |
| P4.4 Conflicts | Concurrent devices, exact retry, stale divergence, ancestry rewrite, explicit reconciliation, retained conflicts across recreation and completion freeze |
| P4.5 Offline | Local draft saved before network; queue recreation after outage; completed outbox repairs projection failure; existing local journey outage tests |
| P4.6 Shared | Pure runtime policies and shared API synchronization; boundary/type checks; Web browser acceptance and Expo bundles |
| P4.7 Migration | P3 immutable retries and persistence tests pass; legacy records retain provisional value without invented first-response history; database-free P2 journey passes |
| P4.8 Security | Session ownership/roles preserved; malformed/cross-owner drafts rejected; repository rows and local queues checked for token/credential leakage |
| P4.9 Validation | PostgreSQL 16 suite run locally; dedicated required CI gate configured; verification results below |

Verification completed:

- `npm run test:foundation` with PostgreSQL enabled: **72 tests across nine files passed**, including nine real PostgreSQL cases and the same eight service contracts against the file fallback. Independent pools exercise separate database connections. The suite ran outside the Windows sandbox because its filesystem rename and loopback restrictions interfere with real persistence/HTTP tests.
- `npm run test:postgres` passed against local PostgreSQL 16; the final full foundation run includes the additional ancestry-conflict case added afterward. The dedicated CI command requires a database URL and cannot quietly skip the gate.
- `npm run db:migrate` passed through the actual built entrypoint. Repeated migration execution is covered against separate pools.
- Built PostgreSQL host smoke passed over real HTTP: owner-scoped continuity, empty draft state, unauthenticated 401 and zero draft questions in the production catalog. Its ephemeral verifier token was neither printed nor stored.
- `npm run typecheck`, `npm run lint`, `npm run check:boundaries`, `npm run content:check`, `npm run build`, `npm run build:service`, `npm run audit:bundle` and `git diff --check` passed. Existing legacy dynamic/static-import warnings remain in the Web build.
- `npm run test:foundation:browser` passed on the production Web build: 71 evidence nodes, four lessons, exact-evidence practice, answer/reload/resume, scoring, remediation navigation, 30-item development diagnostic and responsive layouts.
- `npm run build:mobile` exported Android and iOS Hermes bundles with workspace-local TEMP/TMP. This verifies bundling, not native device acceptance.
- The full legacy `npm run test:poc` did not complete and is **not recorded as passing**. Its sandbox run reported a timing-sensitive App case and then stalled; that exact case passed alone outside the sandbox (one passed, 17 intentionally filtered). A full rerun outside the sandbox also stalled after startup and was stopped. P3 already records this full-suite limitation; no unrelated POC source was modified.

The temporary Web preview and Compose test database were stopped after verification. The named PostgreSQL development volume is preserved; `docker compose up -d --wait` starts it again.

Changes remain local and uncommitted. UAD-1 stays open; this implementation does not select a deployment topology or publish scaffolded lessons/benchmark content.
