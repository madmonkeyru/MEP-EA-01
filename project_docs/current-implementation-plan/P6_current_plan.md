## P5 status — confirmed

**P5 is implementation-complete for production identity, entitlement enforcement, and the client continuity surface.**

The repository records P5 as implemented on `p5m` (2026-11-08) with:

- Provider-neutral signed token lifecycle (HMAC-SHA256) satisfying the existing `SessionVerifier` / `AuthSession` contracts.
- Forward-only PostgreSQL `v2` migration for `auth_users` plus mirrored file-backed user persistence for database-free development.
- Public auth endpoints: `POST /v1/auth/register`, `POST /v1/auth/login`, `GET /v1/auth/session`.
- Server-side Free vs Pro entitlement enforcement at the service boundary (full-length simulations and Pro blueprints require `tier: 'premium'`; Free learners receive structured `entitlement_required` responses that map to the existing `PaywallModal`).
- First-class ContinuitySurface (Web + Expo) rendering server-derived mastery snapshots and prioritized Plan de Nivelación.
- Explicit multi-device ConflictReviewModal with non-destructive reconciliation choices (accept server, keep local, or item-by-item combine) while preserving first-response provenance.
- Hardened offline → online synchronization (local commits before remote work, atomic conflict clearing, idempotent retry).

The remaining limitations explicitly carried forward are:

1. **No commercial payment processing or subscription billing** — Free/Pro is enforced server-side, but there is still no real payment gateway, webhook handling, or billing lifecycle (UAD-3 remains open). No true payment wall is introduced in subsequent milestones until UAD-3 is resolved.
2. **No full Test Compilation Engine** — assessments still rely on the development/authored pool rather than deterministic convocatoria-driven compilation.
3. **No content publication** — 67 scaffolded lessons remain draft; no Gate D signoffs have been invented; official benchmark items remain isolated.
4. **P2 native device smoke acceptance and editorial Gates A–D remain pending** — these are not reopened by P6.
5. **Redis, object storage, Guidance & Equiparación, and telemetry productization remain downstream.**
6. **UAD-1 (modular monolith vs microservices) remains open.**

So I would mark:

**P5 = IMPLEMENTED / TEST COMPILATION & SIMULATION SURFACES PENDING**

Importantly, I would **not reopen P5** merely because Test Compilation, content publication, or payments remain outstanding. They are explicit follow-up obligations, not reasons to expand the P5 implementation scope.

---

# P6 — Test Compilation Engine & Simulation Surfaces

This document defines P6. Implementation and verification evidence will be recorded in [P6_EXECUTION.md](../P6_EXECUTION.md) once the milestone is complete.

Based on the authoritative architecture and the boundary explicitly established by P5, the next milestone is:

> **P6: Test Compilation Engine & Simulation Surfaces — implement deterministic, convocatoria-driven assessment generation and expose proper diagnostic and simulation surfaces, closing the pedagogical learning loop, without introducing real payment processing, content publication, Redis, or deployment topology decisions.**

This is the correct architectural transition after P0 → P1 → P2 → P3 → P4 → P5:

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
        ├── Free vs Pro entitlement enforcement (server-side)
        ├── client continuity surface (mastery + Plan de Nivelación)
        ├── explicit conflict-review / reconciliation UX
        └── hardened offline → online recovery
        │
        ▼
P6
Test Compilation Engine & Simulation Surfaces
        │
        ├── deterministic blueprint-driven compilation
        ├── 20-item diagnostic & formative mock
        ├── 60-item official-reference simulation
        ├── strict official-stream isolation
        └── simulation surfaces in Web + Expo
```

### P6 objective

Move the system from:

```text
Web / Expo
      │
      ├── Continuity Surface
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
```

toward the target architecture’s complete pedagogical loop with a real Test Compilation capability:

```text
Web / Expo
      │
      ├── Continuity Surface
      ├── Simulation Surfaces (diagnostic / mock / official)
      │
      ▼
Shared Application Layer
      │
      ▼
API / Service Boundary
      │
 ┌────┼──────────────────┬──────────────────────────────┐
 ▼    ▼                  ▼                              ▼
Auth  Attempts         Test Compilation              Mastery &
&     / Results        Engine                        Nivelación
Entitlement            (blueprints → balanced
 │                     20/60-item assessments)
 ▼
PostgreSQL (system of record)
(+ optional Redis session/compilation cache later)
```

while **retaining offline-first behavior**, keeping the modular-monolith vs microservices decision (UAD-1) open, leaving commercial payment integration (UAD-3) unresolved, and introducing **no true payment wall**.

---

## P6 implementation scope

### P6.1 — Deterministic Test Compilation Engine

Implement the core Test Compilation capability described in the target architecture (Core Domain Services §1.2).

Required semantics:

- Compilation is driven by Convocatoria Blueprints (program, convocatoria identifier, total items, time limit, domain quotas, cognitive-demand distribution).
- Supported assessment modes:
  - 20-item diagnostic (balanced sample across domains).
  - 20-item formative mock (feeds Plan de Nivelación).
  - 60-item official-reference simulation (strictly from the Official Reference Stream, authentic timing).
- Compilation is deterministic for a given blueprint + seed (or equivalent stable selection policy) so that the same request parameters produce the same assessment package.
- The engine evaluates domain quotas and cognitive levels (Reproducción, Conexión, Reflexión) and respects the strict isolation rule between Official Reference Stream and Proprietary Question Bank.
- Pure compilation logic lives in shared packages; the service exposes a versioned compilation endpoint that returns a sealed assessment package (items, metadata, timing, blueprint identity).
- Clients never perform production compilation themselves.

Development/draft assessments used by the existing `p2-local` journey remain available and are not replaced.

### P6.2 — Official Reference Stream isolation

Preserve the architectural isolation rule:

- Official benchmark / reference items are reserved for full 60-item simulations.
- They are never injected into automated diagnostics, exploratory practice, or adaptive drill pools.
- Compilation requests for diagnostic or formative modes must reject or ignore official-reference items.
- Any future administrative override capability is out of scope for P6.

### P6.3 — Simulation surfaces (Web & Expo)

Expose first-class client surfaces for the newly compilable assessment modes.

Required surfaces:

- Start a compiled diagnostic or formative mock.
- Start a compiled 60-item official-reference simulation (subject to existing P5 Free/Pro entitlement gate).
- Timed execution, answer selection, bookmarking, and submission using the existing attempt lifecycle, first-response provenance, and scoring contracts.
- Clear indication of assessment mode, blueprint identity, and remaining time.
- Results feed the existing mastery snapshot and Plan de Nivelación projection paths without client-side re-implementation of mastery rules.

The default unauthenticated / `p2-local` journey continues to function with development content and does not require compilation.

### P6.4 — Entitlement boundary (unchanged from P5)

Reuse the server-side Free vs Pro enforcement already delivered in P5:

- Full-length (60-item) official-reference simulations require `tier: 'premium'`.
- Free learners receive the existing structured `entitlement_required` response that maps to the current `PaywallModal`.
- **No true payment wall, payment gateway, subscription billing, or webhook handling is introduced in P6** (UAD-3 remains open).

Pure domain scoring, mastery calculation, and nivelación generation remain free of entitlement checks.

### P6.5 — Architecture integrity & offline behavior

- New compilation logic must live in the shared/application layer or service packages that depend only on shared domain contracts.
- React and Expo components continue to consume the same journey/composition seams introduced in P3–P5.
- No domain logic (quota evaluation, isolation rules, selection policy) may leak into UI components.
- Offline-first guarantees remain intact: local draft and completed outbox commits still occur before remote acknowledgement; the default database-free development path is preserved.
- Existing P4/P5 contracts (mastery snapshots, Plan de Nivelación, conflict review, outbox) are not altered.

### P6.6 — Content and publication boundary (unchanged)

P2’s rule remains intact:

> Draft content is not production content.

P6 does **not** publish the 67 scaffolded lessons, does not invent Gate D signoffs, and does not move official benchmark items into practice pools. Catalog channels stay as defined in P3–P5. Compilation works with the currently available authored surface and the Official Reference Stream as already present in the repository.

---

# P6 acceptance gates

| Gate | Requirement |
|---|---|
| **P6.1 Compilation** | Deterministic, blueprint-driven generation of 20-item (diagnostic / formative) and 60-item (official-reference) assessments; domain and cognitive quotas are respected |
| **P6.2 Isolation** | Official reference items never appear in diagnostic or formative-mock pools |
| **P6.3 Surfaces** | Web and Expo can start, time, and submit compiled diagnostics, formative mocks, and (when entitled) official-reference simulations |
| **P6.4 Continuity** | Completed compiled attempts correctly update mastery snapshots and Plan de Nivelación through the existing P4 projection path |
| **P6.5 Entitlement** | Full 60-item simulations remain Pro-gated server-side using the existing P5 mechanism; Free learners receive the structured denial already defined |
| **P6.6 Offline / Migration** | Local-first execution, outbox repair, and the default `p2-local` database-free journey continue to function; no regression on P4/P5 contracts |
| **P6.7 Shared architecture** | Web/Expo continue using the same domain/application contracts; compilation logic does not leak into UI components |
| **P6.8 Security** | Cross-owner isolation holds; no credentials or bearer tokens stored in learner or assessment rows |
| **P6.9 Validation** | Contract, integration, and existing quality gates (including PostgreSQL) pass; compilation paths are covered by tests |

---

## Explicitly out of P6

I would **not** let P6 become a content-release, payments, or infrastructure milestone.

Exclude:

- commercial payment processing, subscription billing, or payment-provider webhooks (UAD-3) — **no true payment wall**
- publishing the 67 scaffolded lessons or any production content release
- inventing Gate D signoffs or building a full editorial admin portal / Gates A–D automation
- moving official benchmark items into practice pools
- Redis session/compilation cache layer, object storage, CDN/WAF, or HA topology
- Guidance & Equiparación service
- full analytics / telemetry infrastructure productization
- native device smoke acceptance (still parallel debt from P2)
- all programs/subjects beyond the current BXM Matemática development surface
- resolving UAD-1 (microservices vs modular monolith) by implementation fiat
- changing the existing Free/Pro entitlement model or the structure of the current `PaywallModal`

That keeps P6 aligned with the architecture’s unresolved decisions and with the explicit acceptance debt still carried by P2 (native device smoke) and the content publication boundary.

---

## One important distinction

The architecture specifies a full Test Compilation Engine, Redis for sessions and compilation caches, and distinct domain services. It **does not mandate that Redis, object storage, independent microservices, or a commercial payment gateway must be fully deployed in P6**.

P6 should establish the **deterministic compilation capability and the corresponding simulation surfaces** first. Caching infrastructure, payment integration (UAD-3), content publication, Guidance, and deployment topology remain open for later milestones once learners can take properly balanced diagnostics and official-reference simulations that correctly feed mastery and Plan de Nivelación.

---

### Execution status

Plan defined 2026-11-08. This document is the scope baseline. Implementation and verification evidence will be recorded in [P6_EXECUTION.md](../P6_EXECUTION.md) when the milestone is complete.

P6 closes the pedagogical learning loop by delivering blueprint-driven Test Compilation and first-class simulation surfaces, while preserving offline-first behavior, the existing Free/Pro entitlement gate (with no true payment wall), the provider-neutral service contracts, and the draft-content isolation rules. It does not claim content publication, payments, Redis, native device acceptance, or final deployment topology.
