# 06. Implementation Alignment & Transition Analysis

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Context:** Bridge between experimental Proof-of-Concept (POC) and target production architecture.

---

## 1. Architectural Authority Statement

The current repository codebase was constructed rapidly as an exploratory Proof of Concept (POC) to validate end-user pedagogical flows, KaTeX mathematical typography, SVG geometric rendering, and mobile browser usability.

> **Crucial Rule:** The current POC codebase reflects what was built for early validation, **NOT approved target architectural decisions**. When evaluating future system design, the authoritative target architecture defined in `01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md` through `05_DATA_AND_INFRASTRUCTURE.md` takes absolute precedence over current implementation patterns.

---

## 2. Divergence Analysis: Current POC vs. Target Architecture

P0 now adds shared package boundaries and an executable Expo foundation while preserving the POC. See [P0 execution evidence](../P0_EXECUTION.md) for the current implementation and its validation limits. The matrix below describes the original POC behavior, which remains isolated from the new foundation.

The following matrix documents the key divergences between current experimental code and the approved target architecture, outlining the required evolution roadmap:

| Domain | Current POC Implementation | Approved Target Architecture | Gap / Evolution Path |
|---|---|---|---|
| **Client Platforms** | Single React + TypeScript Web SPA (`apps/web/src/`). Responsive down to mobile, but entirely browser-based. | Multi-platform client architecture: Web SPA + native iOS & Android applications via React Native & Expo. | Extract platform-agnostic business logic into the `Shared Application Layer`; bootstrap Expo native mobile clients sharing common domain modules. |
| **Backend & Services** | Zero-backend / Mock Client. All scoring, compilation, progress, and persistence run entirely in browser `localStorage`. | Dedicated API Gateway and Core Domain Services (Auth, Test Compilation, Scoring, Remediation, Knowledge, Guidance). | Implement standalone domain services behind API Gateway; migrate from pure client-side simulation to authenticated cloud sync with offline fallback. |
| **Data Infrastructure** | Browser `localStorage` and bundled static JSON files (`content/`). No databases. | PostgreSQL (Primary Data), Redis (Cache), Object Storage (PDFs/Visuals), and Centralized Audit Logs. | Provision PostgreSQL schemas for users, attempts, snapshots; introduce Redis for session/catalog caching; move raw documents to object storage. |
| **Shared Application Layer** | Domain types, scoring logic, and state management co-located within Web UI features (`src/features/bxm-*`). | Explicitly partitioned Shared Application Layer (`SHARED`) with domain logic, TS types, API client, validation, design tokens, and runtime. | Decompose monolithic UI features; lift pure assessment, scoring, validation, and analytics engines into standalone shared packages/workspaces. |
| **Authentication & Identity** | Simulated local user (`mep_ea_user` in `localStorage`), mocked subscription tiers (`free` / `pro`) without cryptographic verification. | Centralized Auth service with JWT/Paseto session tokens, RBAC permissions, and verified entitlement state. | Replace simulated auth store with OAuth2/OIDC or secure token-based authentication service. |
| **Question Ingestion & Pipeline** | Hybrid local scripts (`scripts/qbe/*`, `scripts/bxm-*`) generating static JSON files into repository git tree. | Automated Content Ingestion & Gate QA Pipeline with administrative review portal and database persistence. | Decouple content publishing from git commits; establish formal editorial review UI with strict Gate A-D validation pipelines. |

---

## 3. Unresolved Architectural Decisions

In accordance with strict architectural governance, items that cannot be definitively determined from the supplied target system diagrams and existing documentation are explicitly cataloged below as **Unresolved Architectural Decisions (UADs)**, rather than invented arbitrarily:

### UAD-1: Microservices vs. Modular Monolith for Core Domain Services
- **Context:** The target architecture diagram specifies distinct functional blocks for Auth, Test Compilation, Scoring & Analytics, Knowledge, Remediation, and Guidance.
- **Decision to be made:** Should these services be deployed initially as independent containerized microservices (e.g., Kubernetes / ECS), or as a well-partitioned modular monolith (e.g., NestJS / Go / FastAPI) sharing a single deployment pipeline during early production stages?
- **Current Status:** *Pending infrastructure and scaling trade-off review by engineering leadership.*

### UAD-2: Mobile Codebase Strategy (Resolved for P0)
- **Context:** The diagram specifies React Native + Expo for iOS/Android and React + Vite for Web, sharing a unified Shared Application Layer.
- **Decision to be made:** Should the repository transition to a Turborepo/Nx workspace monorepo hosting `@mep-ea/shared`, `@mep-ea/web`, and `@mep-ea/mobile`, or should mobile be maintained in a separate repository consuming `@mep-ea/shared` as an internal private npm package?
- **Current Status:** *Resolved by the current P0 plan: npm workspaces with `apps/web`, `apps/mobile`, and seven explicit shared packages. No additional Nx/Turborepo orchestration is required for this foundation. See [P0 execution evidence](../P0_EXECUTION.md).*

### UAD-3: Commercial Payment Gateway & Billing Integration
- **Context:** The platform includes Free and Pro entitlement tiers and paywall modals, but deliberately avoids any financial transaction dependencies in the current codebase.
- **Decision to be made:** Which regional or global payment gateway (e.g., Stripe, BAC Credomatic, Sinpe Móvil) will be integrated to manage subscription lifecycles, and how will webhook events synchronize with the Auth & Entitlement service?
- **Current Status:** *Pending business and legal partnership agreements.*

---

## 4. Architectural Guardrails for Future Sprints

Before writing new production code or expanding existing features, developers and agents must adhere to the following guardrails:

1. **Do not deepen Web-only coupling:** New domain calculations, scoring rules, or validation logic must be written as pure, framework-agnostic TypeScript functions free from DOM or browser-specific dependencies, ensuring direct portability to React Native.
2. **Preserve ministerial decoupling:** Under no circumstances should any feature assume or attempt a live network connection to MEP or DGEC servers.
3. **Strict separation between official benchmarks and practice items:** Never mix official 60-item convocatoria reference questions into routine drill or diagnostic item generation.
4. **All content must satisfy Gate A through Gate D:** No question or lesson may be released to production without satisfying stem, option, diagram, and evidence mapping quality gates.
