# 01. System Overview & Platform Boundaries

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Visual References:**
- Interactive Diagram: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.html`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.html)
- High-Resolution Vector Diagram: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 1. Executive Summary & Purpose

The **MEP Educación Abierta Digital Platform (MEP EA)** is an independent, sovereign digital preparation and mastery ecosystem engineered for students preparing for Costa Rica's open education national examinations administered by the Dirección de Gestión y Evaluación de la Calidad (DGEC / MEP).

The system architecture defined herein establishes the **production target architecture**. It decouples pedagogical preparation, interactive diagnosis, adaptive practice, and high-fidelity simulation from external ministerial IT infrastructure, while strictly honoring official ministerial examination tables, convocatorias, and curriculum specifications.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               EXTERNAL ACTORS & BOUNDARIES                              │
│                                                                                         │
│   ┌───────────────────────────┐                        ┌────────────────────────────┐   │
│   │   MEP / DGEC Authorities  │                        │     Learners / Students    │   │
│   │   (Official Regulations)  │                        │     (Web, iOS, Android)    │   │
│   └─────────────┬─────────────┘                        └─────────────┬──────────────┘   │
└─────────────────┼────────────────────────────────────────────────────┼──────────────────┘
                  │ Offline Ingestion                                  │ HTTPS / TLS (Edge)
                  ▼ (No Live API)                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              MEP EA DIGITAL PLATFORM (TARGET)                           │
│                                                                                         │
│   ┌───────────────────────────┐                        ┌────────────────────────────┐   │
│   │   Content Platform &      │                        │  Multi-Platform Client &   │   │
│   │   Curriculum Taxonomy     │                        │  Shared Application Layer  │   │
│   └─────────────┬─────────────┘                        └─────────────┬──────────────┘   │
│                 │                                                    │                  │
│                 ▼                                                    ▼                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                   API Gateway & Core Domain Services Engine                     │   │
│   │  (Assessment, Scoring, Diagnosis, Nivelación, Guidance, Telemetry, Persistence) │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Context & Actor Model

The system identifies three primary external actor categories with distinct access patterns, operational authorities, and trust boundaries:

### 2.1. Learners / Students (`Learner / Student`)
- **Primary Goal:** Master exam criteria, diagnose knowledge gaps, complete official simulations, track mastery trajectory, and review actionable remediation recommendations.
- **Entry Points:** Multi-platform clients (Desktop/Tablet Web SPA, iOS native mobile app, Android native mobile app).
- **Communication Protocol:** Encrypted TLS (`HTTPS/TLS`) terminated at Edge / CDN / WAF layers.
- **Identity & State:** Accesses both offline-first cached experiences and authenticated cloud synchronization (attempt records, mastery analytics, telemetry).

### 2.2. Platform & Content Administrators (`Content / Platform Admin`)
- **Primary Goal:** Ingest official convocatoria tables, manage question banks, review item quality gates, monitor platform telemetry, and publish approved content revisions.
- **Entry Points:** Authenticated Administrative Portal / Internal CLI Pipelines.
- **Trust Boundary:** Role-based access control (RBAC), multi-factor authentication, audited via centralized immutable operational logs.

### 2.3. Ministry of Public Education / DGEC (`MEP / DGEC Boundary`)
- **Relationship:** **Strictly Decoupled External Regulatory Reference.**
- **Operational Reality:** The platform possesses **NO live API integration, NO automated data exchange, and NO direct network coupling** with MEP or DGEC ministerial databases.
- **Boundary Contract:** MEP/DGEC publishes official static artifacts (PDF specification tables, institutional calendars, sample practice booklets, administrative guidelines). These artifacts are ingested offline through human-in-the-loop content pipelines.

---

## 3. Strict External Boundary Guarantees

A fundamental architectural mandate of the MEP EA platform is absolute decoupling from ministerial IT infrastructure:

| Dimension | Architectural Mandate | Rationale |
|---|---|---|
| **Student Registration** | Handled exclusively via official MEP/DGEC procedures outside this system. | Avoids legal liability, PII exposure, and ministerial credential dependency. |
| **Official Certification & Grading** | Real credentialing is awarded only by DGEC during physical examination sessions. | The platform provides diagnostic and simulation readiness, not legal certification. |
| **API Integration** | **None.** No SOAP/REST/GraphQL dependencies on government servers. | Eliminates government server downtime, unannounced API deprecations, and network latency. |
| **Curriculum Ingestion** | Asynchronous, manual or assisted offline extraction into versioned blueprints. | Ensures deterministic, auditable, and immutable curriculum versioning (`02-2026`, etc.). |

---

## 4. Top-Level Platform Domains

As formalized in the system diagrams, the MEP EA Digital Platform is structured into six discrete, bounded domains:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE & DELIVERY LAYER (WAF / CDN)                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-PLATFORM CLIENT RUNTIME LAYER                            │
│    Web (React+TS SPA)  │  Mobile (React Native+Expo)  │  Shared Application Layer     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY & REVERSE PROXY LAYER                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌──────────────────────────────────┐┌──────────────────────────────────────────────────┐
│   CORE DOMAIN SERVICES           ││  CONTENT & CURRICULUM PLATFORM                   │
│   • Auth & Identity              ││  • Official Reference Stream                     │
│   • Test Compilation Engine      ││  • Proprietary Question Bank                     │
│   • Scoring & Analytics Engine   ││  • Concept Registry & Visual Specifications      │
│   • Knowledge / Concept Service  ││  • Convocatoria Blueprints & Curriculum Taxonomy │
│   • Remediation Engine           ││  • Ingestion & Gate QA Pipeline                  │
│   • Guidance & Equiparación      ││                                                  │
│   • Telemetry & Funnel Analytics ││                                                  │
└──────────────────────────────────┘└──────────────────────────────────────────────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       DATA, PERSISTENCE & INFRASTRUCTURE                               │
│      PostgreSQL (Primary Data) │ Redis (Cache) │ Object Storage │ Audit Logs           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Edge & Delivery Layer:** High-availability global edge caching, DDoS mitigation, web application firewall (WAF), rate limiting, and static asset distribution.
2. **Multi-Platform Client Layer:** Cross-surface unified client architecture comprising Desktop/Tablet Web and iOS/Android mobile clients powered by a cohesive Shared Application Layer.
3. **Application & Domain Services:** Microservices/domain services responsible for authentication, exam generation, real-time scoring, pedagogical diagnostics, personalized remediation, academic guidance, and product telemetry.
4. **Content & Curriculum Platform:** Centralized repository of official blueprints, validated question pools, parametric visualizations, concept mappings, and automated content quality gates.
5. **Data & Infrastructure Layer:** Resilient data storage consisting of PostgreSQL for transactional entities, Redis for caching/sessions, Object Storage for official documents/visuals, and immutable audit logs.
