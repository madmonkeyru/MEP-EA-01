# P3 — Production Service Foundation

Implemented on `p3milestone`, 2026-11-08. Authority: [index](INDEX.md), [architecture v2](architecture/), [P3 plan](current-implementation-plan/P3_current_plan.md).

P3 establishes executable service boundaries and a development persistence host. It does not claim production deployment or release readiness. P2's editorial and real-device acceptance remain pending.

## Service contracts and execution

`packages/api` owns the common Web/Expo contracts, authenticated client, injected HTTPS fetch transport, validated content package source and optional connected-journey composition. `apps/service` implements the service using the existing shared compiler, attempt restoration, scoring, diagnosis and remediation. Domain rules remain in pure shared TypeScript.

| Endpoint | Contract |
| --- | --- |
| `PUT /v1/attempts/{encodedId}` | Authenticated learner, matching owner/path ID, submitted schema-v1 attempt and exact `Idempotency-Key: {learnerId}:{attemptId}` required. Returns schema-v1 `AttemptRecord`. |
| `GET /v1/attempts/{encodedId}` | Owner-scoped immutable attempt, server receipt timestamp, revision 1, recomputed score, provisional diagnostic evidence and remediation references. Another owner's record is not visible. |
| `GET /v1/catalog/production` | Versioned validated taxonomy/question/blueprint package. Only published signed-off questions and compilable blueprints. Currently no eligible questions or assessments. |
| `GET /v1/catalog/development` | Draft preview package, available only when explicitly enabled at the service. No official benchmark pack is imported. |

The server does not trust client score totals, diagnosis or remediation. It resolves exact assessment/question revisions against its catalog, restores/validates the submitted state, checks timing, and derives results using the shared runtime. Unknown revisions fail with 422. Malformed identity/idempotency/status requests fail with 400/403; unverified or expired sessions fail with 401; missing roles fail with 403; changed completed records fail with 409; persistence/unexpected service failures fail with 503.

Completed records are immutable. A repeated normalized payload returns the original record and receipt timestamp. A changed final submission never silently overwrites it. In-progress recovery stays local in P3. Revision checks and merge rules for mutable, multi-device drafts are deferred; no last-write-wins behavior is implied.

## Authentication and credential boundary

Identity (`learnerId`), authentication (`AuthProvider` / server `SessionVerifier`), authorization (roles) and entitlement (`tier`) are separate contract fields/responsibilities. A premium entitlement does not grant an administrative role or bypass ownership. Both free and premium learners may synchronize their own attempts.

The server's verifier receives an opaque bearer credential and must verify the selected provider's signature, issuer, audience, expiry and revocation before returning an authenticated session. The service independently checks expiry and roles. No JWT/Paseto decoding without verification is implemented. Commercial provider selection remains open.

Credentials are obtained from the injected provider for each request and passed in the Authorization header. They are never added to attempt payloads or the outbox. Web and Expo components do not store service credentials. A future Web adapter can use a BFF/session design; a native adapter must own secure token storage. Existing legacy POC mock identity remains outside the new foundation.

The development entrypoint uses an environment-supplied opaque token mapped to a single configured learner. It is a local verifier fixture, not production account authentication. It binds to `127.0.0.1`, logs no credentials or bodies, sends `Cache-Control: no-store`, restricts methods and limits request bodies to 1 MiB. The shared fetch adapter requires HTTPS except explicitly enabled loopback development. Cross-origin browser hosting, production TLS, provider integration, throttling and operational security remain deployment work.

## Persistence and offline synchronization

`AttemptRepository` is the server persistence port. Its atomic `insert` must return an existing owner/attempt record on duplicate keys. The development file implementation hashes the owner/id tuple into filenames, flushes temporary JSON before atomic rename and serializes writes across repository instances within one process. Recreating the service/repository reads the persisted record. Files never contain bearer credentials. This adapter is not a multi-process or production database implementation. A future PostgreSQL adapter must enforce a unique `(learner_id, attempt_id)` key and atomic insert-or-read semantics, preserving this same contract. No database credentials or infrastructure were provisioned.

`AttemptOutbox` stores immutable completed snapshots under `mep-ea:v1:outbox:{encodedLearnerId}` using the same platform-injected storage interface as local recovery. Enqueue and flush operations are serialized. An offline/auth/conflict failure retains the entry and stops that flush; explicit later synchronization retries with fresh provider credentials. Successful entries are removed only after remote acknowledgement and local queue persistence. A lost response safely retries the same idempotency key. Conflicts require explicit future reconciliation; they are not discarded or merged.

`LearnerJourney` commits local results before attempting the outbox. Resume and explicit synchronization repair an interrupted enqueue. Starting another assessment queues the previous completed snapshot before replacing its recovery pointer. A local outbox-storage failure cannot erase the submitted local result, although starting a replacement can fail until storage recovers.

Both Web and Expo now use `createOfflineJourney`. Their default `p2-local` namespace remains unchanged, with no service configured and no learner data sent. Inject `{ auth, transport }` and a matching authenticated learner namespace to opt into synchronization. Call the returned `synchronize()` after connectivity/session recovery; P3 supplies the shared boundary rather than platform background schedulers or an account-linking UI. Local anonymous history is not silently attributed to a new account.

`createCatalogSource` retrieves validated versioned service packages with explicit same-channel cached fallback. Production requests cannot fall back to development drafts. `createServiceJourney` resolves that content before constructing the shared journey, so service packages feed the existing compiler/runtime without swapping active assessment revisions. The P2 lesson browser still uses its bundled four draft lessons and 71 evidence nodes. Remote lesson/media delivery, persistent package refresh and editorial publication are deferred. Current packages include answer keys because offline scoring remains supported; these are not secure high-stakes examination delivery contracts.

## Running locally

Build/check: `npm run typecheck`, `npm run build:service`, `npm run test:foundation`.

PowerShell development host:

```powershell
$env:MEP_DEV_TOKEN = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
$env:MEP_DEV_LEARNER_ID = 'p3-development'
$env:MEP_ALLOW_DRAFT_PREVIEW = 'true'
npm run dev:service
```

The host defaults to port 8787 and `artifacts/p3-service-data` (ignored by Git). `MEP_SERVICE_PORT` and `MEP_DATA_DIR` override these. Keep the token in the provider/environment; do not paste it into source, browser storage or logs. Omit `MEP_ALLOW_DRAFT_PREVIEW` to deny draft assessment submissions and draft catalog retrieval. No production content is manufactured to make this mode appear populated.

## Acceptance evidence

| Gate | Evidence |
| --- | --- |
| P3.1 API | Shared request/response contracts; service/client integration and real HTTP round trip. |
| P3.2 Auth | Anonymous/invalid/expired sessions, missing roles, owner mismatches and cross-owner reads tested. |
| P3.3 Attempts | Durable record recovery across repository/service recreation; shared server scoring defeats forged totals. |
| P3.4 Sync | Concurrent duplicate requests, immutable conflicts, offline queue recreation, refreshed auth and lost-response retry tested. |
| P3.5 Content | Validated versioned package delivery; production excludes drafts and incomplete blueprints; cached fallback respects channel. |
| P3.6 Shared | Both clients consume the same optional service composition and shared learning runtime; boundary checker enforces dependencies. |
| P3.7 Offline | Local submission/resume during outage and interrupted outbox enqueue recovery tested. |
| P3.8 Security | Provider injection, ownership enforcement, HTTPS transport restriction and absence of bearer token in durable outbox tested. |
| P3.9 Migration | Default P2 local journey and storage namespace retained; browser/native validation recorded below. |
| P3.10 Validation | Foundation suite includes service contract, filesystem persistence and loopback HTTP tests; CI builds the service. |

Verification completed:

- `npm run test:foundation`: 47 tests across six files passed, including ten P3 service/integration cases. Loopback tests ran outside the sandbox because its network policy rejects localhost connections.
- Built service entrypoint smoke passed against the actual P2 catalog: 30 development items, zero production draft items and 401 for unauthenticated requests. The ephemeral verifier token was not printed or persisted.
- `npm run typecheck`, `npm run lint`, `npm run check:boundaries`, `npm run content:check`, `npm run build`, `npm run build:service`, `npm run audit:bundle` and `git diff --check` passed. Existing legacy POC dynamic/static-import build warnings remain.
- `npm run test:foundation:browser` passed on the production Web build: 71 evidence nodes, four lessons, unavailable handling, exact-evidence practice, answer/reload/resume, deterministic scoring, result reopen, weak-evidence navigation, 30-item diagnostic, new attempt and responsive layouts.
- `npm run build:mobile` exported Android and iOS Hermes bundles successfully with workspace-local TEMP/TMP. This is bundle verification, not real-device acceptance.
- The legacy `npm run test:poc` again stalled after Vitest startup without executing tests and was stopped. It is not recorded as passing. The existing foundation and browser suites passed separately.

The content-integrity script now normalizes CRLF for its snapshot comparison, preserving its content-drift check on Windows checkouts. No content item, signoff or publication status was changed. The lockfile changes contain workspace dependency metadata only; no new third-party dependency was introduced.

Changes remain local and uncommitted. Production provider/database adapters, native device smoke acceptance and editorial approval remain explicit follow-up work rather than claimed P3 deployment results.
