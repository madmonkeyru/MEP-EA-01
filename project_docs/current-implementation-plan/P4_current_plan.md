## P3 status — confirmed

**P3 is implementation-complete for the service foundation, but not production-deployment-complete.**

The repository records P3 as implemented on `p3milestone` with:

- Shared API contracts for authenticated attempt submission/retrieval and versioned content packages.
- Provider-neutral authentication/session boundary with explicit separation of identity, authentication, authorization, and entitlement.
- Durable attempt persistence via a single-process file repository that preserves atomic insert-or-read semantics.
- Offline-first outbox synchronization with idempotency keys and conflict retention.
- Versioned catalog delivery (production channel empty of drafts; development channel gated).
- Web and Expo both consume the same optional service composition while retaining the default local `p2-local` journey.
- Foundation, browser, typecheck, lint, boundaries, content integrity, and service build checks passing.

The remaining P3/production limitations are explicitly:

1. **No production identity-provider integration** — development uses an environment-supplied opaque token fixture.
2. **No PostgreSQL (or other multi-process) system of record** — the file repository is a development adapter only.
3. **No multi-device revision/merge rules for mutable in-progress drafts** — completed attempts are immutable; in-progress recovery stays local.
4. **No longitudinal mastery store or Plan de Nivelación generation** — diagnosis and remediation references are provisional/per-attempt.
5. **P2 native device smoke acceptance and editorial Gates A–D remain pending** — these are not reopened by P3 or P4.

So I would mark:

**P3 = IMPLEMENTED / PRODUCTION DEPLOYMENT PENDING**

Importantly, I would **not reopen P3** merely because those production and acceptance items remain outstanding. They are explicit follow-up obligations, not reasons to expand the P3 implementation scope.

---

# P4 — Durable Data Foundation & Mastery Continuity

This document defines P4. Implementation and verification evidence is recorded in [P4_EXECUTION.md](../P4_EXECUTION.md).

Based on the authoritative architecture and the boundary explicitly established by P3, I would make the next milestone:

> **P4: Durable Data Foundation & Mastery Continuity — establish the production system-of-record (PostgreSQL) and the longitudinal mastery / remediation layer on top of the existing service contracts, without prematurely resolving deployment topology or commercial identity decisions.**

This is the correct architectural transition after P0 → P1 → P2 → P3:

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
```

### P4 objective

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
 ┌────┼───────────────┐
 ▼    ▼               ▼
Auth  Attempts      Content
 │    / Results      / Catalog
 │
 ▼
File repository (dev)
```

toward the target architecture:

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
 │    / Results      / Catalog   Nivelación
 │         │
 ▼         ▼
PostgreSQL (system of record)
```

while **retaining offline-first behavior** and keeping the modular-monolith vs microservices decision (UAD-1) open.

---

## P4 implementation scope

### P4.1 — PostgreSQL system of record

Replace the development file repository with a PostgreSQL adapter that satisfies the existing `AttemptRepository` contract.

Required semantics:

- Unique constraint on `(learner_id, attempt_id)`
- Atomic insert-or-read on duplicate keys (identical to the file adapter)
- Completed attempts remain immutable
- No bearer credentials or tokens stored in attempt rows

The file repository may remain available as a pure local/dev fallback. A future production deployment can still choose modular monolith or microservices; P4 only requires a correct relational adapter and schema.

Development may use Docker Compose (or equivalent) for a local PostgreSQL instance. No claim of production HA, connection pooling policy, or managed-service selection is required in P4.

### P4.2 — Mastery snapshots & evidence tiers

Introduce a durable mastery layer aligned with the architecture:

```text
Attempt results
      │
      ▼
Mastery calculation (shared domain rules)
      │
      ▼
mastery_snapshots (PostgreSQL)
      │
      ├── evidence-level tiers
      └── domain-level aggregates
```

Apply the canonical pedagogical tiers already specified in the target architecture:

- **Dominada (Mastered):** first-response accuracy ≥ 75%
- **En progreso (In Progress):** accuracy ≥ 60% and < 75%
- **Necesita refuerzo (Needs Practice):** accuracy < 60%

Respect qualifying-volume thresholds (e.g., minimum distinct item families within a rolling window) so that superficial one-shot scores do not inflate mastery. The shared scoring/diagnosis logic remains the behavioral authority; P4 persists and exposes the resulting longitudinal state.

### P4.3 — Plan de Nivelación (Remediation engine v1)

Turn existing per-attempt diagnosis and remediation references into a concrete, prioritized Plan de Nivelación.

Priority hierarchy (from architecture):

1. Uncovered diagnostic baseline (`no_diagnostic_yet`)
2. Critical prerequisite deficiencies (`remediation_pending`)
3. Formative diagnostic weaknesses (`diagnostic_weakness`)
4. Simulation benchmark weaknesses (`simulation_weakness`)
5. Recovery retesting availability (`retest_available`)
6. Targeted exploratory practice (`general_practice`)

The engine must be pure/shared TypeScript where possible, invoked by the service after mastery updates, and returned through versioned service contracts. Client UI may surface the plan; it must not own the prioritization rules.

### P4.4 — Multi-device revision and conflict rules

Close the explicit P3 deferral on mutable in-progress drafts.

Define and test:

- Ownership and revision checks for in-progress attempts
- Conflict detection when two devices submit divergent mutable state
- Explicit non-destructive retention of conflicts (no silent last-write-wins)
- Safe retry of completed submissions via the existing idempotency key

Completed records stay immutable. Local outbox semantics and “commit local before remote acknowledgement” remain mandatory.

### P4.5 — Architecture integrity

Keep the existing shared packages framework-independent.

New mastery and nivelación logic must live in the shared/application layer (or service packages that depend only on shared domain contracts). React and Expo components continue to consume the same journey/composition seams introduced in P3.

The default `p2-local` / unauthenticated local journey must continue to function without a database or service.

### P4.6 — Content and publication boundary (unchanged)

P2’s rule remains intact:

> Draft content is not production content.

P4 does **not** publish the 67 scaffolded lessons, does not invent Gate D signoffs, and does not move official benchmark items into practice pools. Catalog channels stay as defined in P3.

---

# P4 acceptance gates

| Gate | Requirement |
|---|---|
| **P4.1 Persistence** | PostgreSQL adapter satisfies the existing `AttemptRepository` contract; atomic insert-or-read and immutability of completed attempts are tested |
| **P4.2 Mastery** | Mastery snapshots are computed, stored, and retrieved; evidence/domain tiers match architecture rules and volume thresholds |
| **P4.3 Nivelación** | Plan de Nivelación is generated from diagnosis + mastery and returned through the service boundary |
| **P4.4 Conflicts** | Multi-device / revision rules for in-progress attempts are defined and tested; completed attempts remain immutable |
| **P4.5 Offline** | Local-first execution and outbox behavior remain functional when the service or database is unavailable |
| **P4.6 Shared architecture** | Web/Expo continue using the same domain/application contracts; no domain logic leaks into UI components |
| **P4.7 Migration** | Existing P2/P3 local development journeys continue to function during transition |
| **P4.8 Security** | No credentials or bearer tokens are stored in attempt or mastery rows; ownership enforcement is preserved |
| **P4.9 Validation** | Contract, integration, and PostgreSQL-backed tests pass in CI; file adapter may remain for pure local runs |

---

## Explicitly out of P4

I would **not** let P4 become a giant production platform or content-release milestone.

Exclude:

- full microservice decomposition or Kubernetes/ECS infrastructure
- commercial identity-provider productization / OAuth UI
- production payments or subscription billing
- full adaptive item-generation engine
- complete content editorial platform or Gates A–D automation
- publishing the 67 scaffolded lessons or any production content release
- official 60-item benchmark delivery
- migrating every remaining POC screen
- all programs/subjects beyond the current BXM Matemática development surface
- full analytics / telemetry infrastructure productization
- resolving UAD-1 (microservices vs modular monolith) by implementation fiat

That keeps P4 aligned with the architecture’s unresolved decisions and with the explicit acceptance debt still carried by P2 (native device smoke) and P3 (production IdP and deployment).

---

## One important distinction

The architecture specifies PostgreSQL, Redis, object storage, and distinct domain services. It **does not mandate that Redis, object storage, edge/WAF, or independent microservices must be fully deployed in P4**.

P4 should establish the **system of record and the longitudinal mastery/remediation layer** first. Caching, session stores, object storage, and deployment topology remain open for later milestones once the relational contracts and pedagogical continuity are proven.

---

### Execution status

Implemented on `p4m`, 2026-11-08. This document remains the scope baseline. See [P4_EXECUTION.md](../P4_EXECUTION.md) for acceptance evidence, local PostgreSQL setup, revision semantics and verification limits.

P4 establishes durable learner continuity (attempts → mastery → Plan de Nivelación) on a PostgreSQL foundation while preserving offline-first behavior and the provider-neutral service contracts from P3. It does not claim production authentication, multi-region deployment, native device acceptance, or editorial publication.
