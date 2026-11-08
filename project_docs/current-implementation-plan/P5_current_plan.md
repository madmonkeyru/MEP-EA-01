## P4 status — confirmed

**P4 is implementation-complete for the durable data foundation and mastery continuity layer.**

The repository records P4 as implemented on `p4m` (2026-11-08) with:

- PostgreSQL system of record satisfying the existing `AttemptRepository` contract plus `ContinuityRepository`.
- Longitudinal mastery snapshots using first-response provenance, 30-day rolling window, and qualifying volume thresholds.
- Shared Plan de Nivelación generation with the six ordered priority reasons from the target architecture.
- Multi-device draft revision rules, explicit conflict retention (no silent last-write-wins), and immutable completed attempts.
- Offline-first outbox and draft synchronizer preserved; default `p2-local` journey remains database-free.
- Both file and PostgreSQL adapters pass the shared service contracts; CI includes a required PostgreSQL-backed gate.

The remaining limitations explicitly carried forward are:

1. **No production identity-provider integration** — development still uses an environment-supplied opaque token fixture.
2. **No Free / Pro entitlement enforcement** at the service boundary (paywall UI exists; server-side gating does not).
3. **No client continuity surface** — mastery snapshots and Plan de Nivelación are returned by the API but are not yet rendered as first-class decision surfaces in Web or Expo.
4. **No hardened multi-device conflict review UX** — the 409 path and retained conflicts exist, but clients do not yet present an explicit reconciliation flow.
5. **P2 native device smoke acceptance and editorial Gates A–D remain pending** — these are not reopened by P5.
6. **Redis, object storage, Test Compilation Engine, Guidance/Equiparación, and telemetry productization remain downstream.**

So I would mark:

**P4 = IMPLEMENTED / PRODUCTION IDENTITY & CONTINUITY SURFACE PENDING**

Importantly, I would **not reopen P4** merely because those identity and surface items remain outstanding. They are explicit follow-up obligations, not reasons to expand the P4 implementation scope.

---

# P5 — Production Identity, Entitlement & Continuity Surface

This document defines P5. Implementation and verification evidence will be recorded in [P5_EXECUTION.md](../P5_EXECUTION.md) once the milestone is complete.

Based on the authoritative architecture and the boundary explicitly established by P4, the next milestone is:

> **P5: Production Identity, Entitlement & Continuity Surface — close the identity and entitlement gap, make multi-device mastery and Plan de Nivelación usable in the clients, and harden the offline → online continuity experience, without expanding into content publication, payments, Redis, or deployment topology decisions.**

This is the correct architectural transition after P0 → P1 → P2 → P3 → P4:

```text
P0
Production Platform Foundation
        │
        ▼
P1
Core Product Vertical Slice
        │
        ▼
P2
Content & Learning Expansion
        │
        ▼
P3
Production Service Foundation
        │
        ├── API boundary
        ├── authentication contract
        ├── persistence contract (file adapter)
        ├── attempt synchronization boundary
        ├── content delivery boundary
        └── Web/Expo migration seam
        │
        ▼
P4
Durable Data Foundation & Mastery Continuity
        │
        ├── PostgreSQL system of record
        ├── mastery snapshots & evidence tiers
        ├── Plan de Nivelación generation
        ├── multi-device revision / conflict rules
        └── preserved offline-first + outbox semantics
        │
        ▼
P5
Production Identity, Entitlement & Continuity Surface
        │
        ├── real identity / session lifecycle
        ├── Free vs Pro entitlement enforcement
        ├── client continuity surface (mastery + Plan de Nivelación)
        ├── explicit conflict-review / reconciliation UX
        └── hardened offline → online recovery
```

### P5 objective

Move the system from:

```text
Web / Expo
      │
      ▼
Shared Application Layer
      │
      ▼
API / Service Boundary
      │
 ┌────┼──────────────────────────────┐
 ▼    ▼               ▼              ▼
Auth  Attempts      Content     Mastery &
(dev  / Results      / Catalog   Nivelación
token)     │
           ▼
      PostgreSQL
```

toward the target architecture’s identity and decision-engine layer:

```text
Web / Expo
      │
      ├── Continuity Surface (mastery + Plan de Nivelación + conflict review)
      │
      ▼
Shared Application Layer
      │
      ▼
API / Service Boundary
      │
 ┌────┼──────────────────────────────┐
 ▼    ▼               ▼              ▼
Auth  Attempts      Content     Mastery &
&     / Results      / Catalog   Nivelación
Entitlement
 │         │
 ▼         ▼
PostgreSQL (system of record)
(+ optional Redis session cache later)
```

while **retaining offline-first behavior**, keeping the modular-monolith vs microservices decision (UAD-1) open, and leaving commercial payment integration (UAD-3) unresolved.

---

## P5 implementation scope

### P5.1 — Production-grade identity & session lifecycle

Replace the opaque `MEP_DEV_TOKEN` development fixture with a real, provider-neutral identity and session path that satisfies the existing P3/P4 authentication contracts.

Required semantics:

- Session issuance, verification, and ownership checks remain behind the current service boundary.
- Learner identity is stable across devices and survives service restarts.
- Explicit separation of identity, authentication, authorization, and entitlement is preserved.
- Development and test environments may continue to use a controlled fixture or local issuer; production path must be ready for an external identity provider without rewriting client or domain contracts.
- No bearer credentials or tokens are stored in attempt, mastery, or draft rows (P4 rule remains absolute).

The exact commercial identity provider (OIDC, Auth0, Cognito, custom JWT issuer, etc.) may remain an open decision if necessary; P5 requires a correct, testable session lifecycle and ownership model, not a final vendor selection.

### P5.2 — Free vs Pro entitlement enforcement

Make the Free / Pro tier already implied by the architecture and the existing paywall UI enforceable at the service boundary.

Required semantics:

- Entitlement state is associated with the authenticated learner and is readable by the service.
- Premium surfaces (full-length simulations, extended history, advanced diagnostics, or any other surfaces marked as Pro) are gated server-side; UI alone is insufficient.
- Free learners receive clear, consistent denial responses that clients can map to the existing paywall experience.
- Entitlement checks do not leak into pure domain scoring, mastery, or nivelación calculation logic.

P5 does **not** implement payment processing, subscription billing, or webhook handling (UAD-3 remains open).

### P5.3 — Client continuity surface

Expose the durable continuity data already produced by P4 as first-class decision surfaces in both Web and Expo.

Required surfaces:

- Current mastery snapshot (evidence-level and domain-level tiers, qualifying volume, first-response provenance summary).
- Prioritized Plan de Nivelación (the six ordered reasons from the architecture, with next-action guidance).
- Clear indication when evidence is `insufficient_evidence` versus a qualified tier.

Clients must only *display* and *act on* the plan returned by the service. They must not re-implement prioritization, mastery thresholds, or prerequisite traversal.

The default `p2-local` / unauthenticated journey continues to function without requiring continuity data.

### P5.4 — Explicit conflict-review and reconciliation UX

Close the usability gap on the multi-device draft conflict path introduced in P4.

Required behavior:

- When a `PUT /v1/drafts/...` returns 409 with retained conflict state, the client surfaces an explicit review/reconciliation flow.
- The learner can inspect the retained candidate, the current server revision, and choose or combine state while preserving committed first-response provenance.
- There is still no automatic merge or last-write-wins behavior.
- Completed attempts remain immutable; conflict review applies only to mutable drafts.

Account/device management UX beyond the conflict path is out of scope.

### P5.5 — Offline → online recovery hardening

Strengthen the existing outbox + draft synchronizer path under realistic intermittent connectivity.

Required guarantees:

- Local draft and completed outbox commits still occur before remote acknowledgement.
- After reconnection, mastery and Plan de Nivelación remain coherent with the durable server state.
- Conflict retention and exact-retry semantics continue to hold across outages and multi-device use.
- The default local journey and database-free development path remain intact.

### P5.6 — Architecture integrity

Keep the existing shared packages framework-independent.

New identity, entitlement, and continuity-surface logic must live in the shared/application layer or service packages that depend only on shared domain contracts. React and Expo components continue to consume the same journey/composition seams introduced in P3/P4.

No domain logic (mastery thresholds, nivelación priority, ownership rules) may leak into UI components.

### P5.7 — Content and publication boundary (unchanged)

P2’s rule remains intact:

> Draft content is not production content.

P5 does **not** publish the 67 scaffolded lessons, does not invent Gate D signoffs, and does not move official benchmark items into practice pools. Catalog channels stay as defined in P3/P4.

---

# P5 acceptance gates

| Gate | Requirement |
|---|---|
| **P5.1 Identity** | Real session lifecycle works; ownership and role checks are preserved across devices and service restarts |
| **P5.2 Entitlement** | Free/Pro enforcement is server-side, tested, and mappable to the existing paywall experience |
| **P5.3 Continuity surface** | Mastery snapshot and Plan de Nivelación are visible and actionable in Web and Expo; clients do not own prioritization rules |
| **P5.4 Conflict UX** | 409 conflict state is presented for explicit review/reconciliation; first-response provenance is preserved |
| **P5.5 Offline** | Local-first execution, outbox repair, and conflict retention remain correct under intermittent connectivity |
| **P5.6 Shared architecture** | Web/Expo continue using the same domain/application contracts; no domain logic leaks into UI components |
| **P5.7 Migration** | Existing P2/P3/P4 local development journeys continue to function; `p2-local` remains database-free |
| **P5.8 Security** | No credentials or bearer tokens stored in learner rows; cross-owner isolation holds |
| **P5.9 Validation** | Contract, integration, and existing quality gates (including PostgreSQL) pass; identity/entitlement paths are covered by tests |

---

## Explicitly out of P5

I would **not** let P5 become a content-release, payments, or infrastructure milestone.

Exclude:

- full Test Compilation Engine (blueprint-driven 20/60-item generation) — better as a subsequent milestone
- Guidance & Equiparación service
- Redis session/cache layer, object storage, CDN/WAF, or HA topology
- commercial identity-provider vendor lock-in UI beyond the required session lifecycle
- production payments, subscription billing, or payment-provider webhooks (UAD-3)
- complete content editorial platform or Gates A–D automation
- publishing the 67 scaffolded lessons or any production content release
- official 60-item benchmark delivery
- native device smoke acceptance (still parallel debt from P2)
- all programs/subjects beyond the current BXM Matemática development surface
- full analytics / telemetry infrastructure productization
- resolving UAD-1 (microservices vs modular monolith) by implementation fiat

That keeps P5 aligned with the architecture’s unresolved decisions and with the explicit acceptance debt still carried by P2 (native device smoke) and the content publication boundary.

---

## One important distinction

The architecture specifies a full Authentication & Authorization service, Redis for sessions, and distinct domain services. It **does not mandate that Redis, a final commercial IdP, object storage, or independent microservices must be fully deployed in P5**.

P5 should establish the **identity/session lifecycle, entitlement enforcement, and client continuity surface** first. Caching infrastructure, payment integration, Test Compilation, Guidance, and deployment topology remain open for later milestones once learners can authenticate for real, see their durable mastery and Plan de Nivelación, and resolve multi-device conflicts explicitly.

---

### Execution status

Plan defined 2026-11-08. This document is the scope baseline. Implementation and verification evidence will be recorded in [P5_EXECUTION.md](../P5_EXECUTION.md) when the milestone is complete.

P5 establishes production-ready identity and entitlement, surfaces the longitudinal continuity already produced by P4, and hardens the multi-device offline experience, while preserving offline-first behavior, the provider-neutral service contracts, and the draft-content isolation rules. It does not claim content publication, payments, Redis, native device acceptance, or final deployment topology.
