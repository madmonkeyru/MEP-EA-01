# MEP EA Digital — Master Architecture & Systems Design Suite
**System Identifier:** MEP-EA-01
**Target Domain:** Costa Rican Educación Abierta (MEP / DGEC)
**Architecture Release:** Version 3.0.0 (Semantic Versioning)
**Lifecycle Status:** Authoritative Master System Specification & Product Blueprint
**Business Model:** B2C Private Educational SaaS

---

## 1. Executive Summary & Purpose

**MEP EA Digital** (`MEP-EA-01`) is a comprehensive digital learning, assessment simulation, diagnostic, and academic guidance platform tailored to the Costa Rican *Educación Abierta* system administered by the *Ministerio de Educación Pública* (MEP) through the *Dirección de Gestión y Evaluación de la Calidad* (DGEC).

The platform serves as an end-to-end B2C hub enabling independent adult learners and non-traditional students to prepare for high-stakes national certification exams across four core educational programs:
1. **I & II Ciclo (CICO)**: Primary school equivalency (grades 1–6) assessed via 5 subject examinations; strictly prohibits calculator usage.
2. **III Ciclo**: Lower secondary equivalency (grades 7–9) assessed via 3 grade-level exams (7°, 8°, and 9° Año).
3. **EDAD (*Educación Diversificada a Distancia*)**: Modular upper secondary distance track (grades 10–11) assessed via two progressive testing modules: Parte 1 (10° Año) and Parte 2 (11° Año).
4. **BXM (*Bachillerato por Madurez Suficiente*)**: Direct adult upper secondary track synthesizing grades 10 and 11 into a unified exit examination per subject.

*(Note: The Naturalización certification program is formally deferred to a subsequent product phase).*

### Scale & Performance Targets
- **Peak Concurrent Active Users (CCU):** 500 – 5,000 concurrent active users during peak hours and pre-exam seasonal testing windows.
- **Peak Daily Active Users (DAU):** 10,000 – 15,000 unique daily active users during convocatoria registration and mock testing spikes.
- **Multi-Year Lifecycle Registered Users:** 10,000 – 25,000+ active learner accounts over a 3-year rolling lifecycle.
- **Service Availability Target:** 99.9% uptime during active convocatoria assessment cycles.

---

## 2. Core Service Pillars

MEP EA Digital operates across **five core service pillars**:

| Service Pillar | Description & Operational Scope | Key System Capabilities |
| :--- | :--- | :--- |
| **1. Practice (Práctica)** | High-fidelity test simulation and adaptive self-paced training. | Timed official blueprint simulations (60 items, 150 min), weighted dynamic mock exams conforming to official DGEC weight matrices, topic/area quizzes, and weak-point remediation. |
| **2. Learn (Aprender)** | Concept mastery and curriculum continuity bridge. | Authored concept taxonomy linking definitions, step-by-step KaTeX solutions, interactive SVG visual manipulatives, and cross-grade concept progressions. |
| **3. Find Info (Información)** | Clear, centralized repository of official DGEC exam parameters. | Official specification tables (Tablas de Especificaciones), passing thresholds (65 vs. 70), authorized materials, calculator constraints, and historical convocatorias. |
| **4. Get Insights (Diagnóstico & Métricas)** | Cognitive diagnostics, skill readiness, and longitudinal analytics. | Real-time scoring, Bloom/cognitive-level breakdown (reproducción, conexión, reflexión), domain mastery indicators, time-per-item metrics, and probability of passing. |
| **5. Guidance (Orientación & Trayectoria)** | Strategic academic decision support and procedural navigation. | Decision engine guiding students through EDAD vs. BXM trade-offs, formal education subject recognition (equiparación), enrollment deadlines, and exam logistics. |

---

## 3. System Boundaries & Legal Decoupling Principle

### 3.1 Strict Administrative Boundary (Non-Integrated Model)
MEP EA Digital operates as an **independent, private B2C SaaS platform**.
- **Zero Live MEP Platform Integration:** The system has **no direct API connectivity or database peering** with internal MEP governmental platforms, specifically the *"Yo aplico"* registration portal or official DGEC student record databases.
- **Client-Side Self-Reported Academic State:** All learner progress, previously passed subjects, formal credit recognitions, and exam enrollment statuses are managed through interactive user wizards, local persistence, and authenticated user profile stores.
- **Procedural Guidance Without Legal Agency:** The platform provides actionable checklists, deadline alerts, prerequisite verification, and pre-filled PDF declaration forms, but students execute final official registration directly on MEP portals.

### 3.2 Dual-Stream Legal Decoupling Strategy
Because official MEP exam criteria derive from the formal national curriculum framework, MEP EA Digital decouples commercial delivery through two parallel content tracks:
1. **Public/Freemium Official Reference Stream**: Digitize and index the 47+ biannual specification PDFs and 47 official practice test PDFs per convocatoria (94 PDFs/year) for benchmark comparison, official parameters, and freemium sample tests.
2. **Proprietary Authored Knowledge Library & Question Bank**: Maintain an internal, decoupled repository of original question items, explanations, step-by-step solutions, and parametric SVG visualizations that map to official criteria without infringing on MEP copyrighted text.

---

## 4. Authoritative Architecture Suite Structure

The technical specifications and architectural blueprints of MEP EA Digital are modularized into domain documents:

```
project_docs/
├── INDEX.md                                       # This Master Architecture Index (v3.0.0)
│
├── 01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md   # Cloud topology, client SPA, API services, caching & 5k CCU scalability
├── 02_CORE_SERVICES_AND_DOMAIN_MODEL.md          # Domain entities, practice engine, and guidance decision algorithms
├── 03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md    # Ingestion pipelines for 47+ PDFs, taxonomy, freemium & QA validation
├── 04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md    # Parametric SVG composites, zero static bitmaps, KaTeX LaTeX pipeline
├── 05_UI_UX_DESIGN_SYSTEM.md                     # Visual identity, warm beige palette, accessible tokens & custom components
├── 06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md     # Engineering phases, video content deferral, SLA & operational runbook
├── 07_ENROLLMENT_AND_PRIOR_RECOGNITION_ENGINE.md  # Prior recognition (equiparación) engine, 3 MEP pathways & administrative flows
├── PILOT_HIL_VERIFICATION_PROTOCOL_BXM_02_2026.md # Human-in-the-Loop review protocol & checklist for Convocatoria 02-2026
└── PILOT_BXM_02_2026_AUDIT_REPORT.md              # Certified audit sign-off report for BXM 02-2026 (60/60 items certified)
```

### Document Directory & Reading Matrix

| Document | Primary Audience | Key Topics Covered |
| :--- | :--- | :--- |
| **[01. System & Infrastructure](01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md)** | Cloud Engineers, Tech Leads, DevOps | Architecture tiers, 5,000 CCU load capacity, Redis caching, edge CDN, client-side React 19 architecture, security, and offline support. |
| **[02. Core Services & Domain](02_CORE_SERVICES_AND_DOMAIN_MODEL.md)** | Full-stack Engineers, Product Managers | Domain entities across 4 programs (CICO, III Ciclo, EDAD, BXM), Dynamic Test Assembly Engine, Scoring Engine, and Guidance Decision Engine (EDAD vs. BXM trade-offs). |
| **[03. Content Pipeline & Decoupling](03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md)** | Content Engineers, Curriculum Specialists | Semi-annual processing of 47+ specification PDFs and sample tests, freemium boundaries, proprietary item authoring, and schema validation CLI. |
| **[04. Visualizations & Math Engine](04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md)** | Frontend Engineers, Graphic/Math Authors | Zero-bitmap parametric SVG architecture, composite visual catalog (CartesianCanvas, Solid3D, BoxPlot, etc.), and KaTeX delimited math rendering. |
| **[05. UI/UX Design System](05_UI_UX_DESIGN_SYSTEM.md)** | UI/UX Designers, Frontend Developers | Soft warm beige palette, typography (`Outfit` + `Plus Jakarta Sans`), accessible custom widgets (`CustomSelect`, `ThemeToggle`), WCAG 2.1 AA standards. |
| **[06. Roadmap & Operations](06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md)** | Engineering Leadership, Project Stakeholders | Phased milestone roadmap (Prototype → MVP → Commercial Scale), video deferral rationale, monitoring, rollback, and disaster recovery. |
| **[07. Prior Recognition & Enrollment](07_ENROLLMENT_AND_PRIOR_RECOGNITION_ENGINE.md)** | System Architects, Guidance Counselors | Detailed legal-administrative specifications for the 3 equiparación pathways, document checklists, and interactive calculation engine. |

---

## 5. Superseded Historical Documentation & Archive

All preliminary draft documents, early prototyping work plans, and fragmented logs have been retired to `project_docs/archive/` with explicit deprecation headers:
- `project_docs/archive/SRS.md`
- `project_docs/archive/SRS Pre-Dev.md`
- `project_docs/archive/PROJECT MEP-EA-01_ SYSTEM TECHNICAL SPECIFICATION & FRAMEWORK MATRIX.md`
- `project_docs/archive/UNIFIED_CONTENT_REGISTRY_ARCHITECTURE.md`
- `project_docs/archive/Strategy_for_Developing_Reusable_Visualisation_Components.md`
- `project_docs/archive/Visual Components needed in the Sample Test.md`
- `project_docs/archive/UI_UX_AUDIT.md`
- `project_docs/archive/UI_UX_IMPLEMENTATION.md`
- `project_docs/archive/UI_UX_VALIDATION.md`
- `project_docs/archive/UI_UX_VERIFICATION.md`
- `project_docs/archive/CAPABILITY_STATUS.md`
- `project_docs/archive/FLOW_VALIDATION.md`
- `project_docs/archive/ONBOARDING_HELPER.md`
- `project_docs/archive/Preparation List.md`

*(Refer to `project_docs/archive/README.md` for historical change logs).*
