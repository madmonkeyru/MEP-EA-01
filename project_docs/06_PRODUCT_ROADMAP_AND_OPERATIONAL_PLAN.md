# Module 06: Product Roadmap, Video Deferral, and Operational Plan
**Document Reference:** MEP-EA-ARCH-06
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. Product Evolution Roadmap

MEP EA Digital transitions from the current high-fidelity proof-of-concept into a full-scale commercial B2C platform across four defined execution phases.

```
       [ Phase 1: Prototype / PoC ] (COMPLETED)
       - Skeleton architecture & multi-program router
       - Decoupled concept library & atomic item schemas
       - 170+ items in BXM Mathematics (Sets 1–4)
       - Pure SVG composite visual components & KaTeX
                               │
                               ▼
       [ Phase 2: MVP Hardening & Content Scaling ] (CURRENT)
       - Authoritative architecture suite consolidation
       - Freemium official practice sets ingestion (Convocatorias 2026-C1 & C2)
       - Expansion of item banks to EDAD, III Ciclo, and CICO
       - Guidance & Prior Recognition (Equiparación) Wizard
                               │
                               ▼
       [ Phase 3: Commercial SaaS Launch ]
       - B2C User authentication (JWT + Cloudflare Turnstile)
       - Subscription billing integration (Stripe / Local Costa Rican Gateways)
       - Cloud-native backend deployment (AWS Fargate + Redis Cluster + PostgreSQL)
       - Longitudinal diagnostic dashboard & predictive passing algorithms
                               │
                               ▼
       [ Phase 4: Full Multi-Subject Framework ]
       - Addition of remaining Educación Abierta subjects (Ciencias, Español, Cívica, etc.)
       - Institutional/Tutor cohort management portals
       - Expansion to deferred Naturalización track
```

---

## 2. Content Constraints & Video Content Deferral Rationale

### 2.1 Video Content Explicitly Deferred
In accordance with strategic product decisions, **video-based educational content is formally deferred**:
- **Operational Justification**:
  1. *High Bandwidth & Infrastructure Cost*: Streaming high-definition video during peak 5,000 CCU windows introduces substantial CDN egress expenses.
  2. *Maintenance Friction Against Curricular Revisions*: When MEP adjusts evaluation criteria or notation, updating recorded video lessons requires complete re-recording, editing, and re-rendering. In contrast, text and KaTeX step-by-step solutions can be corrected or enhanced in seconds.
  3. *Student Latency & Mobile Data Caps*: A significant portion of adult Educación Abierta students access practice sessions via prepaid mobile data packages in Costa Rica. Lightweight KaTeX text explanations and vector SVG diagrams consume less than 1% of the bandwidth of equivalent video clips.
- **Alternative High-Fidelity Deliverables**: Detailed step-by-step algorithmic solutions, interactive parametric SVG diagrams, and dynamic formula reference drawers provide equivalent or superior pedagogical clarity without video overhead.

---

## 3. Operational Maintenance & Biannual Convocatoria Playbook

Every six months, the operational team executes the Convocatoria Renewal Playbook:

| Stage | Timeline Relative to Convocatoria | Key Actions & Protocols |
| :--- | :--- | :--- |
| **T-90 Days** | 3 months before exam date | Download newly published MEP *Tablas de Especificaciones*. Run ingestion scripts to verify any adjustments to affirmations, evidence weights, or formula rules. |
| **T-60 Days** | 2 months before exam date | Ingest official practice sample exam PDFs into freemium reference track. Author proprietary items to balance any shifted evidence weights. |
| **T-30 Days** | 1 month before exam date | Run automated QA test suite (`scripts/ingest-validate-content.mjs`). Release Convocatoria Blueprint (e.g. `2026-c2.json`) to staging for tutor review. |
| **T-14 Days** | 2 weeks before exam date | Deploy Convocatoria Blueprint to production. Warm edge CDN caches. Scale up Redis and database read replicas in anticipation of peak 5,000 CCU traffic. |
| **T+0 Days** | Examination Weekend | Real-time monitoring of application performance, error rates, and load spikes. Maintain active support channels. |
| **T+7 Days** | 1 week post-examination | Ingest student feedback, archive convocatoria results, and transition active default UI context to the next testing window. |

---

## 4. Monitoring, SLA & Disaster Recovery

- **Target Service Level Agreement (SLA)**: 99.9% uptime during active convocatoria registration and examination months.
- **Observability Stack**:
  - Application Performance Monitoring (APM): Datadog / OpenTelemetry tracking p95 API latencies (<150ms).
  - Error Tracking: Sentry capturing unhandled client-side runtime errors and KaTeX rendering exceptions.
  - Healthcheck Endpoints: `/healthz` verifying database connectivity, Redis ping, and storage bucket reachability.
- **Disaster Recovery**:
  - Point-in-time recovery (PITR) for PostgreSQL database with 5-minute RPO (Recovery Point Objective).
  - Automated database daily snapshots replicated to a secondary cloud region.
  - Client-side offline resilience: Students can continue an active test session even during temporary backend disconnections.
