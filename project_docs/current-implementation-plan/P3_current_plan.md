## P2 status — confirmed

**P2 is implementation-complete, but not release-complete.**

The repository records P2 as implemented on `p2milestone` with:

- **71** canonical evidence nodes exposed.
- **4** existing draft lessons.
- **30** authored practice items.
- Evidence → concept → lesson → practice relationships working.
- Evidence-scoped practice enforced by the shared compiler.
- Official benchmark questions isolated from practice/diagnostic pools.
- Web learning journey validated.
- Expo/native bundles validated for Android and iOS.
- Content integrity, typecheck, lint, boundaries, build and foundation tests passing.

The remaining P2 acceptance items are explicitly:

1. **Real Android/iOS device or emulator smoke validation**
   - browse evidence
   - open completed/scaffolded lessons
   - practice
   - close/reopen
   - verify persistence/recovery
   - submit
   - verify weak-evidence navigation

2. **Editorial approval / Gates A–D**
   - All lessons/items remain drafts.
   - No production publication approval has been claimed.

So I would mark:

**P2 = IMPLEMENTED / ACCEPTANCE PENDING**

Importantly, I would **not reopen P2** merely because those validations remain outstanding. They are explicit acceptance/release obligations, not reasons to expand the implementation scope.

---

# P3 — Production Service Foundation

This document defines P3. Implementation and verification evidence are recorded in [P3_EXECUTION.md](../P3_EXECUTION.md).

Based on the authoritative architecture and the boundary explicitly established by P2, I would make the next milestone:

> **P3: Production Service Foundation — establish the backend/API boundary and persistent-service contracts without prematurely implementing the full production platform.**

This is the correct architectural transition after P0 → P1 → P2:

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
        ├── persistence contract
        ├── attempt synchronization boundary
        ├── content delivery boundary
        └── Web/Expo migration seam
```

### P3 objective

Move the system from:

```text
Web / Expo
    │
    ▼
Shared Runtime
    │
    ▼
Local persistence
    │
    ▼
Bundled content
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
 ┌────┼───────────────┐
 ▼    ▼               ▼
Auth  Attempts      Content
 │    / Results      / Catalog
 │
 ▼
PostgreSQL
```

while **retaining offline-first behavior**.

---

## P3 implementation scope

### P3.1 — Backend boundary

Introduce the first production-facing service boundary.

Define stable contracts for:

- learner identity
- assessment attempts
- submissions
- results
- diagnostic evidence
- remediation references
- content/catalog retrieval

The Web and Expo clients should consume these through a shared API contract rather than knowing infrastructure details.

### P3.2 — Authentication boundary

Replace the current conceptual local/mock identity boundary with a production-oriented authentication contract.

The important P3 deliverable is **not** choosing a commercial auth provider yet.

It is establishing:

```text
Identity
   │
   ▼
Auth Service
   │
   ▼
Authenticated Session
   │
   ▼
Shared Application Runtime
```

with explicit separation between:

- identity
- authentication
- authorization/RBAC
- entitlement

The architecture already identifies JWT/Paseto-style session tokens and RBAC as the target direction.

### P3.3 — Attempt persistence API

Define the server-side representation of:

```text
Learner
   │
   ▼
Assessment Attempt
   │
   ├── responses
   ├── timing
   ├── status
   └── evidence
          │
          ▼
       Result
          │
          ├── score
          ├── diagnosis
          └── remediation
```

The existing shared runtime remains the behavioral authority.

P3 should create the **persistence seam**, not rewrite the runtime.

### P3.4 — Local ↔ server synchronization

Preserve the architecture's offline-first requirement.

The client should be able to operate locally and eventually synchronize:

```text
Local Attempt
     │
     ├── offline → local durable state
     │
     └── online
           │
           ▼
      Sync Queue
           │
           ▼
       API Service
           │
           ▼
       Persistent DB
```

Idempotency and conflict semantics should be defined before implementing multi-device synchronization.

### P3.5 — Content delivery boundary

Separate:

```text
Content authoring/source
        ↓
Validated content package
        ↓
Content service/API
        ↓
Client catalog
```

from the current repository-bundled development catalog.

This **does not** mean publishing the current drafts.

P2's rule remains intact:

> Draft content is not production content.

### P3.6 — Architecture integrity

Keep the existing shared packages framework-independent.

New production-domain logic must remain in the shared/application layer where appropriate rather than leaking into React or Expo components.

The target architecture explicitly requires this separation.

---

# P3 acceptance gates

| Gate | Requirement |
|---|---|
| **P3.1 API** | Canonical service contracts exist and are consumed through a defined API boundary |
| **P3.2 Auth** | Identity/session/authz boundaries are explicit and testable |
| **P3.3 Attempts** | Assessment attempts have a persistent server representation |
| **P3.4 Sync** | Local-first → server synchronization contract exists and is idempotency-aware |
| **P3.5 Content** | Client content access has a production-service boundary |
| **P3.6 Shared architecture** | Web/Expo continue using the same domain/application contracts |
| **P3.7 Offline** | Existing local execution remains functional when the service is unavailable |
| **P3.8 Security** | Credentials/tokens are never persisted or transmitted through UI-specific mechanisms |
| **P3.9 Migration** | Existing P2 local development journey continues to function during transition |
| **P3.10 Validation** | Service contracts have automated integration/contract tests |

---

## Explicitly out of P3

I would **not** let P3 become a giant production rewrite.

Exclude:

- full microservice decomposition
- Kubernetes/ECS infrastructure
- production payments
- subscription billing
- full adaptive engine
- complete content editorial platform
- publishing the 67 scaffolded lessons
- migrating every POC screen
- all programs/subjects
- full analytics infrastructure
- official benchmark publication
- commercial authentication-provider commitment

That keeps P3 aligned with the architecture's unresolved decisions instead of prematurely resolving them through implementation.

---

## One important distinction

The architecture says the eventual system has PostgreSQL, Redis, object storage, API services, authentication, etc. It **does not yet mandate that all of those must be fully deployed in P3**.

In particular, the architecture still marks the **microservices vs. modular-monolith** decision as unresolved.

Therefore P3 should establish **service boundaries and contracts first**, while leaving deployment topology open.

That is a much safer next step than immediately introducing Kubernetes or a collection of independently deployed microservices.

---

### Execution status

Implemented on `p3milestone`, 2026-11-08. See [P3 execution evidence](../P3_EXECUTION.md) for the executable service, shared contracts, acceptance checks and production limitations.

P3 establishes a provider-neutral service foundation with a loopback development host and durable file repository. It does not claim production authentication, PostgreSQL deployment, native device acceptance or editorial publication.
