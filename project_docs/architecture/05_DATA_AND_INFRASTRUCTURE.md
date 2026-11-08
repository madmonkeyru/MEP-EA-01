# 05. Data Infrastructure & Local Runtime

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Visual References:**
- Data & Infrastructure Diagram: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 1. Storage & Infrastructure Architecture

The target architecture employs a tiered persistence model designed for high availability, low latency, and offline fault tolerance.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE & DELIVERY NETWORK                                   │
│            Global CDN / Edge  │  WAF / DDoS Protection  │  Rate Limiting               │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
┌──────────────────────────────────────────┐┌────────────────────────────────────────────┐
│      STATIC ASSET DELIVERY               ││          API SERVICES & GATEWAY            │
│   HTML / JS / CSS / SVG / JSON Bundles   ││    Reverse Proxy, TLS, Header Inspection   │
└──────────────────────────────────────────┘└────────────────────┬───────────────────────┘
                                                                 │
                                 ┌───────────────────────────────┴───────────────────────┐
                                 │                                                       │
                                 ▼                                                       ▼
┌──────────────────────────────────────────────────────────┐┌────────────────────────────────────────────┐
│               PRIMARY TRANSACTIONAL DATA                 ││           IN-MEMORY CACHE & SESSIONS       │
│                  PostgreSQL Data Store                   ││                  Redis Cache               │
│ • User Profiles & Credentials                            ││ • Session Tokens & Revocation Lists        │
│ • Assessment Submissions & Responses                     ││ • Fast Compilation Caches & Catalog Keys   │
│ • Longitudinal Mastery Snapshots                         ││ • Distributed Rate-Limiting Counters       │
│ • Operational Telemetry & Funnel Events                  ││                                            │
└──────────────────────────────────────────────────────────┘└────────────────────────────────────────────┘
                                 │                                                       │
                                 ▼                                                       ▼
┌──────────────────────────────────────────────────────────┐┌────────────────────────────────────────────┐
│                     OBJECT STORAGE                       ││             OPERATIONAL AUDIT LOGS         │
│ • Official MEP Reference PDFs & Booklets                 ││ • Centralized Immutable Audit Trail        │
│ • High-Resolution Vector & SVG Diagram Assets            ││ • Administrative Action Logs               │
│ • Ingestion Source Archive Packages                      ││ • Authentication Failures & Security Events │
└──────────────────────────────────────────────────────────┘└────────────────────────────────────────────┘
```

---

## 2. Server Infrastructure Specifications

### 2.1. PostgreSQL Primary Data Store (`PostgreSQL Primary Data Store`)
- **Role:** System of record for all persistent relational and document-backed learner entities.
- **Key Schemas & Entities:**
  - `auth_users`: Account identity, hashed credentials, subscription tier (`free` vs `pro`), and registration timestamps.
  - `learner_attempts`: Immutable records of completed assessments, durations, selected options, raw scores, and cognitive breakdown.
  - `mastery_snapshots`: Point-in-time domain and evidence mastery records calculated from qualifying attempt windows.
  - `telemetry_events`: Anonymized funnel, conversion, and usage events for institutional analytics.
  - `content_items` & `blueprints`: Versioned storage for validated question items, distractor rationales, and test blueprints.

### 2.2. Redis Cache (`Redis Cache`)
- **Role:** Low-latency caching, ephemeral state management, and real-time counter storage.
- **Use Cases:**
  - Fast response caching for static curriculum taxonomies and blueprints.
  - Rate limiting (token bucket) protecting public API gateway endpoints.
  - Active session invalidation and token blacklisting.
  - Short-lived test compilation caches for high-concurrency exam generation.

### 2.3. Object Storage (`Object Storage`)
- **Role:** Mass unstructured storage for official documentation and static media.
- **Contents:**
  - Original uncompressed MEP specification table PDFs and official practice booklet scans.
  - Scalable vector graphics (SVG) visual diagram assets.
  - Raw extracted docx/xml source packages archived from the QBE pipeline.

### 2.4. Audit & Operational Logs (`Audit / Operational Logs`)
- **Role:** Append-only, tamper-evident logging facility for security, regulatory compliance, and system health observability.
- **Logged Events:** Content publish approvals, gate overrides, administrative account modifications, rate-limit triggers, and abnormal error rates.

---

## 3. Client Local Runtime & Offline Persistence

A critical pillar of the MEP EA architecture is resilient local runtime execution. Costa Rican adult learners frequently study on constrained mobile networks or during transit with intermittent internet connectivity.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LOCAL RUNTIME ENGINE                               │
│                                                                                        │
│   ┌───────────────────────────────────┐     ┌──────────────────────────────────────┐   │
│   │         Application State         │     │         Service Worker & Cache       │   │
│   │    (Zustand / Redux Store / UI)   │     │    (Offline Asset Pre-Caching API)   │   │
│   └─────────────────┬─────────────────┘     └──────────────────┬───────────────────┘   │
│                     │                                          │                       │
│                     ▼                                          ▼                       │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                   IndexedDB & Secure Local Storage Adapters                    │   │
│   │    • Namespaced offline attempt history (`mep-ea:v1:attempts`)                 │   │
│   │    • Cached evidence catalogs and active lessons                               │   │
│   │    • Debounced in-progress session recovery buffers (150ms debounce)           │   │
│   │    • Pending telemetry queue with automatic background sync                    │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Local Storage Contract & Resilience
- **Isolated Namespaces:** All local data keys are strictly namespaced (e.g. `mep-ea:v1:*` or `bxm-mvp-progress:*`) to prevent cross-app collisions and allow non-destructive version migrations.
- **Debounced Autosaving:** In-progress test session state (current question, selected options, remaining time) is debounced (150ms) to ensure instantaneous UI responsiveness while surviving sudden browser closure via synchronous `pagehide`/`beforeunload` triggers.
- **Offline Cache Pre-population:** Essential reference exam blueprints, sample lessons, and SVG rendering engines are aggressively pre-cached by the Service Worker, enabling end-to-end simulation runs without continuous network connectivity.
- **Bi-directional Synchronization:** When connectivity is restored, queued local attempt events and telemetry are batch-synchronized with the backend API via idempotent background requests.
