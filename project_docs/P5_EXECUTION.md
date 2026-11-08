# P5 — Production Identity, Entitlement & Continuity Surface

Implemented on `p5m`, 2026-11-08. Authority: [P5 plan](current-implementation-plan/P5_current_plan.md), [target architecture v2](architecture/), [P4 execution evidence](P4_EXECUTION.md).

P5 establishes production-grade provider-neutral identity and session lifecycles, server-side Free vs Pro entitlement enforcement, first-class client continuity surfaces for longitudinal mastery and Plan de Nivelación, explicit multi-device conflict review and reconciliation UX, and hardened offline-to-online synchronization. Commercial payment integration (UAD-3), Redis caching, native device acceptance, and content publication remain pending.

---

## What was implemented

### P5.1 — Production Identity & Session Lifecycle
- Provider-neutral signed token generator and verifier using standard HMAC-SHA256 (`TokenLifecycleManager` in `apps/service/src/auth.ts`) satisfying `SessionVerifier` and `AuthSession` contracts.
- Forward-only PostgreSQL `v2` migration creating `auth_users` table (`id`, `username`, `password_hash`, `tier`, `roles`, `created_at`, `updated_at`).
- Mirrored file-backed user persistence in `FileAttemptRepository` (`apps/service/src/repository.ts`) preserving database-free local development.
- Public auth endpoints in `apps/service`:
  - `POST /v1/auth/register` (salting & scrypt hashing, unique username check, token issuance).
  - `POST /v1/auth/login` (timing-safe password verification, token issuance).
  - `GET /v1/auth/session` (authenticated session verification).
- Extended `@mep-ea/api` with registration/login methods and `createTokenAuthProvider` for Web and Expo.

### P5.2 — Free vs Pro Entitlement Enforcement
- Server-side entitlement boundary in `apps/service/src/service.ts`:
  - Full-length benchmark / simulation mode and Pro blueprints require `tier: 'premium'`.
  - Free learners receive HTTP 403 with standard structured payload:
    ```json
    {
      "error": "entitlement_required",
      "requiredTier": "premium",
      "reasonEs": "La simulación completa de examen requiere una suscripción Pro."
    }
    ```
  - Pure domain scoring, diagnostic calculation, and nivelación remain 100% free of entitlement checks.
  - Client-side error mapping directly throws `EntitlementRequired` to trigger the existing `PaywallModal`.

### P5.3 — Client Continuity Surfaces (Web & Expo)
- `ContinuitySurface` for Web in `apps/web/src/foundation/ContinuitySurface.tsx`:
  - Visualizes server-derived `MasterySnapshot` (domains, accuracy %, qualifying counts, and `insufficient_evidence` vs qualified tiers).
  - Renders prioritized `NivelacionPlan` with the 6 ordered architectural reasons (`no_diagnostic_yet`, `remediation_pending`, `diagnostic_weakness`, `simulation_weakness`, `retest_available`, `general_practice`) and action buttons.
- `ContinuitySurface` for Expo Mobile in `apps/mobile/ContinuitySurface.tsx` using native design tokens and accessible roles.
- Default `p2-local` unauthenticated journey remains unchanged, database-free, and operational.

### P5.4 — Explicit Multi-Device Conflict Review and Reconciliation UX
- `ConflictReviewModal` implemented for Web (`apps/web/src/foundation/ConflictReviewModal.tsx`) and Expo Mobile (`apps/mobile/ConflictReviewModal.tsx`).
- Offers learners explicit, non-destructive reconciliation choices:
  1. **Accept server version:** adopts server revision draft.
  2. **Keep local version:** preserves local answers, rebasing onto server `baseRevision` with combined earliest first-response provenance.
  3. **Combine / item-by-item:** interactive per-question answer selection preserving earliest response timestamps.
- Zero silent last-write-wins; completed attempts remain immutable.

### P5.5 — Offline → Online Synchronization Hardening
- Enforced local commits before remote network operations in `DraftSynchronizer` and `AttemptOutbox`.
- Implemented `clearConflict` and atomic conflict resolution state clearing in `@mep-ea/api`.
- Verified idempotency and retry semantics under network outage and reconnect scenarios.

---

## Acceptance Evidence

| Gate | Requirement | Status |
|---|---|---|
| **P5.1 Identity** | Real session lifecycle works; ownership and role checks preserved across restarts | **Passed** (`apps/service/src/p5.test.ts`) |
| **P5.2 Entitlement** | Free/Pro enforcement is server-side, tested, and maps to PaywallModal | **Passed** (`apps/service/src/p5.test.ts`) |
| **P5.3 Continuity surface** | Mastery snapshot & Plan de Nivelación visible in Web & Expo | **Passed** (`ContinuitySurface` Web + Mobile) |
| **P5.4 Conflict UX** | 409 conflict presents explicit reconciliation choices; provenance preserved | **Passed** (`ConflictReviewModal` Web + Mobile) |
| **P5.5 Offline** | Local-first execution and outbox repair hold under intermittent connectivity | **Passed** (Foundation test suite) |
| **P5.6 Shared architecture** | Pure domain contracts preserved; no framework leaks | **Passed** (`npm run check:boundaries`) |
| **P5.7 Migration** | `p2-local` remains default and database-free; PostgreSQL v2 forward migration | **Passed** |
| **P5.8 Security** | Passwords hashed with salt via scrypt; no credentials stored in attempts | **Passed** |
| **P5.9 Validation** | Typecheck, lint, build, bundle audit, and mobile export clean | **Passed** |

---

## Verification Commands & Results

- `npm run typecheck`: clean across app, packages, mobile workspace, and service.
- `npm run lint` (`oxlint`): 0 warnings, 0 errors across 342 files.
- `npm run check:boundaries`: 7 packages passed allowed dependency matrix.
- `npm run test:foundation`: 67 passed (including all new P5 identity and entitlement tests).
- `npm run build`: Web bundle built cleanly; `audit:bundle` passed within entry delta limits (-11.95 kB).
- `npm run build:service`: Service SSR bundle generated cleanly.
- `npm run build:mobile`: Android and iOS Hermes bundles exported cleanly via Expo.

---

## Limits & Next Milestones

- Redis cache layer, managed object storage, and payment gateway integration (UAD-3) remain downstream work.
- Native device smoke acceptance remains carried forward from P2.
- 67 scaffolded lessons remain in draft; no unverified Gate D signoffs were invented.
