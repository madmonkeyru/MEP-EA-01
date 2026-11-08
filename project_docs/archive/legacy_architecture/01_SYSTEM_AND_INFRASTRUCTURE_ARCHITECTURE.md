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

# Module 01: System and Infrastructure Architecture
**Document Reference:** MEP-EA-ARCH-01
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. High-Level Architecture Overview

MEP EA Digital is designed as an edge-accelerated, cloud-native Single Page Application (SPA) backed by scalable serverless/microservice APIs and low-latency cached data layers. The system is engineered to absorb extreme seasonal traffic spikes coinciding with the Costa Rican Ministerio de Educación Pública (MEP) testing calendar.

```
                              [ End-User Clients ]
             Desktop Browsers | Mobile Browsers | Tablet Devices
                                       │
                                       ▼ HTTPS (TLS 1.3)
                       [ Global Edge CDN / Cloudflare ]
                ├── Static Asset Distribution (HTML, JS, CSS, SVG)
                ├── Edge SSL Termination & DDoS Shield (Rate Limiting)
                └── Edge Cache Layer (Manifests, Blueprints, Public Library)
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
              [ Client-Side Engine ]       [ API Gateway / Reverse Proxy ]
              - React 19 + TypeScript      - JWT Auth Validation & Throttling
              - Local State & IndexedDB    - Route Routing & SSL Termination
              - KaTeX Math Render Engine                 │
              - Pure SVG Visual Composites               ▼
                                            [ Microservice Application Tier ]
                                            ├── Session & Auth Service
                                            ├── Test Compilation Engine
                                            ├── Scoring & Analytics Service
                                            ├── Guidance & Equivalency Engine
                                            └── Content Registry Service
                                                         │
                                  ┌──────────────────────┴──────────────────────┐
                                  ▼                                             ▼
                      [ High-Performance Cache ]                    [ Primary Data Persistence ]
                      Redis Cluster (In-Memory)                     PostgreSQL / Multi-Tenant DB
                      - Active Test Session States                  - User Credentials & Profiles
                      - Convocatoria Blueprint Cache                - Longitudinal Attempt Records
                      - Dynamic Question Pools                      - Audit Logs & Equivalency Files
                      - Real-time Leaderboard/Metrics               - Content Catalog & Ingestion Blueprints
```

---

## 2. Capacity Model & Scalability Specifications

### 2.1 Load Envelope & Spike Dynamics
The application experiences a distinct dual-spike pattern annually, aligned with the two national convocatoria testing windows (typically March–April and September–October):

| Metric | Baseline (Off-Season) | Convocatoria Spike Window | Peak Minute Load (Exam Day / Deadline) |
| :--- | :--- | :--- | :--- |
| **Concurrent Active Users (CCU)** | 50 – 200 | 1,000 – 3,000 | **5,000 CCU** |
| **Daily Active Users (DAU)** | 500 – 1,200 | 5,000 – 10,000 | **15,000 DAU** |
| **Requests Per Second (RPS)** | 10 – 30 RPS | 250 – 750 RPS | **1,500 – 2,500 RPS** |
| **Total Registered Base** | — | — | **10,000 – 25,000 users** (multi-year) |

### 2.2 Scalability Strategies for 5,000 Concurrent Users

1. **Static Pre-Rendering & Aggressive Edge Caching**:
   - The entire question catalog, concept taxonomy (`geometry_concepts.json`, etc.), blueprints (`2026-c1.json`), and SVG visual components are bundled as immutable static JSON and code assets.
   - Cloudflare CDN caches public assets at edge PoPs (Point of Presence) with `stale-while-revalidate=86400`, absorbing 85–90% of all client read queries without hitting application origin servers.

2. **Client-Side Heavy Architecture (Zero-Latency Simulation)**:
   - When a student initiates a 60-question timed exam simulation, the test bundle (items, formula sheet, visual specs) is hydrated to the client runtime in a single payload (<250 KB compressed).
   - Test navigation, option selection, bookmarking, formula sheet referencing, and KaTeX rendering happen **100% on the client runtime**, completely isolating the server from per-question click traffic.

3. **Batched Asynchronous Telemetry & Submission**:
   - During active test sessions, answers are buffered locally (`localStorage` / `IndexedDB`).
   - Telemetry heartbeat pings are debounced (every 60 seconds or upon explicit question flagging).
   - Final test scoring and attempt record persistence are handled in a single atomic `POST /api/v1/exams/submit` payload, keeping origin write IOPS strictly within bounded limits.

4. **Stateless API Tier & Redis Session Offloading**:
   - Application microservices run on containerized nodes (Node.js/Fastify or Go) managed by auto-scaling container groups.
   - Active user session tokens, rate-limiting tokens, and dynamic test seeds are cached in a managed Redis Cluster with automatic read replicas.

---

## 3. Technology Stack & Component Architecture

### 3.1 Client-Side Runtime
- **Core Framework**: React 19 + TypeScript (Strict typing enabled).
- **Build Engine**: Vite with optimized Rollup code-splitting chunks.
- **Styling**: Tailwind CSS v4 with custom semantic color variables (`--color-surface-cream`, `--color-brand-sand`, `--visual-*` tokens).
- **Typography**: Google Fonts CDN (`Outfit` for display headings; `Plus Jakarta Sans` for educational body prose).
- **Mathematics Rendering**: KaTeX (v0.16.x) with custom regex pre-processors preventing bare math collisions.
- **Visuals Engine**: Pure SVG Parametric Composites (`CartesianCanvas`, `Solid3D`, `BoxPlot`, `TableVisual`, `FunctionPlotter`).
- **Icons**: Lucide React.
- **Testing**: Vitest + Testing Library (React & Jest DOM) + Playwright for end-to-end and visual regression.

### 3.2 Server-Side & Service Tier (Target Production Setup)
- **API Architecture**: RESTful JSON API with OpenAPI 3.1 specifications.
- **Runtime Environment**: Containerized microservices (Node.js LTS / Docker) orchestrated via AWS ECS Fargate or Kubernetes.
- **API Gateway**: Traefik / AWS API Gateway with rate-limiting, JWT signature verification, and CORS isolation.
- **Primary Database**: PostgreSQL 16 with read-replicas; connection pooling managed via PgBouncer.
- **In-Memory Cache**: Redis Cluster (ElastiCache) with sub-millisecond latencies for active sessions and item index caches.
- **Object Storage**: S3-compatible bucket (Cloudflare R2 / AWS S3) for official specification PDFs, digitized sample tests, and user-generated recognition claim documents.

---

## 4. Network, Security & Privacy Architecture

### 4.1 Boundary Security & DDoS Mitigation
- **Cloudflare Edge Shield**: WAF rules filtering malicious crawler traffic, SQL injection, and automated scraping of private question banks.
- **Rate Limiting**:
  - Public anonymous endpoints: 60 requests/minute per IP.
  - Authenticated user endpoints: 300 requests/minute per user token.
  - Exam submission endpoint: Max 1 submit per active exam session.

### 4.2 Authentication & Authorization (B2C Model)
- **Identity Provider**: Stateless JWT with asymmetric RSA/ECDSA token signing.
- **Role-Based Access Control (RBAC)**:
  - `anonymous`: Access to welcome hub, program information, specification tables, and Freemium sample tests (Set 1).
  - `student_free`: Track progress across basic sets; access diagnostic baseline evaluations.
  - `student_premium`: Full access to 170+ items across 4 programs, dynamic weighted mock exams, step-by-step solutions, longitudinal analytics, and personalized guidance wizards.
  - `content_admin`: Ingestion pipelines, item authoring workbench, and specification mapping.

### 4.3 Data Protection & Privacy Compliance
- **Zero Sensitive MEP Government Data**: The system does not store or process MEP official student passwords, cedula credentials for "Yo aplico", or government portal credentials.
- **Data Minimization**: Learner profile records store only necessary identification (Email, Display Name, Target Program, Self-Reported Academic Progress).
- **Encryption**: TLS 1.3 in transit with HSTS enforced; AES-256 for persistent database storage and document backups.

---

## 5. Offline Capabilities & Local Persistence

To accommodate Costa Rican students with intermittent residential or mobile connectivity:
- **Service Worker Caching**: Core application shells and active question bundles are cached via Cache API.
- **Offline Attempt Resilience**: If network connectivity drops during a 150-minute exam simulation, the test interface continues uninterrupted. Answers are saved locally to IndexedDB and automatically synchronized when connectivity is restored.
- **State Hydration Architecture**:
  ```
  [User Action] ──► [Local App State (React)]
                          │
                          ├──► [Synchronous LocalStorage / IndexedDB Backup]
                          │
                          └──► [Debounced Network Dispatcher]
                                      │ (If online)
                                      ▼
                                [REST API Backend]
  ```
