# 02. Core Domain Services & Pedagogical Learning Loop

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Visual References:**
- Diagram Root Cluster 1 & Cluster 2: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 1. Domain Services Architecture

The Core Domain layer encapsulates the pedagogical intelligence, diagnostic evaluation rules, and business capabilities of the platform. These services operate behind the API Gateway / Reverse Proxy and interact with Data Infrastructure and the Content Platform.

```
                                  ┌────────────────────────┐
                                  │  API Gateway / Proxy   │
                                  └───────────┬────────────┘
                                              │
         ┌───────────────────┬────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐ ┌───────────────────┐
│ Authentication  │ │ Test            │ │ Scoring & │ │ Knowledge &     │ │ Guidance &        │
│ & Authorization │ │ Compilation     │ │ Analytics │ │ Concept Service │ │ Equiparación      │
└────────┬────────┘ └────────┬────────┘ └─────┬─────┘ └────────┬────────┘ └─────────┬─────────┘
         │                   │                │                │                    │
         │                   │                ▼                │                    │
         │                   │      ┌───────────────────┐      │                    │
         │                   │      │ Remediation /     │◄─────┘                    │
         │                   │      │ Nivelación Engine │                           │
         │                   │      └─────────┬─────────┘                           │
         │                   │                │                                     │
         └───────────────────┼────────────────┼─────────────────────────────────────┘
                             ▼                ▼
                 ┌───────────────────────────────────────┐
                 │ Data Infrastructure (Postgres, Redis) │
                 └───────────────────────────────────────┘
```

### 1.1. Service Catalog

#### 1. Authentication & Authorization (`Auth`)
- **Responsibility:** Manages learner identities, session tokens (JWT/Paseto), role-based permissions (Learner vs Admin), and subscription entitlement verification (Free vs Pro).
- **Persistence:** Interacts with PostgreSQL for credentials and profile contracts; uses Redis for fast session invalidation and rate-limiting counters.

#### 1.2. Test Compilation Engine (`Test`)
- **Responsibility:** Generates deterministic, scientifically balanced assessments according to official Convocatoria blueprints (e.g., exactly 60 items for reference simulations, 20 items for diagnostic tests, or focused practice blocks).
- **Rules:**
  - Evaluates domain quotas (e.g., Geometry, Functions, Statistics).
  - Respects cognitive demand distributions (Reproducción, Conexión, Reflexión).
  - Strictly isolates official reference items from automated practice pools unless explicitly configured.
- **Dependencies:** Consumes Convocatoria Blueprints, Question Bank, and Curriculum Taxonomy from the Content Platform.

#### 1.3. Scoring & Diagnostic Analytics Engine (`Scoring`)
- **Responsibility:** Ingests attempt submission payloads, calculates raw scores, classifies cognitive accuracy, evaluates domain mastery levels, and produces diagnostic profiles.
- **Pedagogical Evaluation Rules:**
  - Categorizes evidence mastery using three canonical tiers:
    - **Dominada (Mastered):** First-response accuracy $\ge 75\%$.
    - **En progreso (In Progress):** Accuracy $\ge 60\%$ and $< 75\%$.
    - **Necesita refuerzo (Needs Practice):** Accuracy $< 60\%$.
  - Demands qualifying volume thresholds (e.g., minimum 5 distinct item families within 30 days) to prevent superficial mastery inflation.
- **Persistence:** Commits granular attempt events and mastery snapshots to PostgreSQL.

#### 1.4. Knowledge & Concept Service (`Knowledge`)
- **Responsibility:** Maintains the formal semantic network of mathematical and curricular concepts, prerequisite graphs, and micro-learning objectives.
- **Mapping:** Binds each assessment item to its canonical Evidence ID (`bxm/matematica/02-2026/{domain}/{code}`) and associated concept nodes.

#### 1.5. Remediation & Nivelación Engine (`Remediation`)
- **Responsibility:** Transforms diagnostic failure signals into a concrete, prioritized remediation roadmap ("Plan de Nivelación").
- **Priority Hierarchy:**
  1. Uncovered diagnostic baseline (`no_diagnostic_yet`).
  2. Critical prerequisite deficiencies (`remediation_pending`).
  3. Formative diagnostic weaknesses (`diagnostic_weakness`).
  4. Simulation benchmark weaknesses (`simulation_weakness`).
  5. Recovery retesting availability (`retest_available`).
  6. Targeted exploratory practice (`general_practice`).

#### 1.6. Guidance & Equiparación Engine (`GuidanceEngine`)
- **Responsibility:** Guides adult learners through the administrative equivalence, subject requirements, and graduation pathways across Costa Rica's open education modalities:
  - *Bachillerato por Madurez Suficiente (BXM)*
  - *Educación Diversificada a Distancia (EDAD)*
  - *Tercer Ciclo de la EGBA*
  - *I y II Ciclos de la EGBA*
- **Decoupling Guarantee:** Analyzes student academic history locally to recommend study tracks without ministerial registration coupling.

#### 1.7. Telemetry & Funnel Analytics (`Telemetry`)
- **Responsibility:** Collects anonymized user journey telemetry across four product funnel stages: Activation, Learning, Assessment, and Commercial/Entitlement.
- **Privacy & Performance:** Employs client-side idempotency windows (deduplicating rapid repeated events) and asynchronous background dispatch to ensure zero UI thread latency.

---

## 2. The Canonical Pedagogical Learning Loop

The platform’s user experience is anchored around a closed-loop pedagogical journey designed to guide adult learners from initial uncertainty to certified examination readiness:

```
    ┌─────────────────┐
    │ 1. DIAGNÓSTICO  │ ◄────────────────────────┐
    └────────┬────────┘                          │
             │ Weakness signals identified       │ Retest & Validation
             ▼                                   │
    ┌─────────────────┐                          │
    │  2. APRENDER    │                          │
    │ (Temario / Hub) │                          │
    └────────┬────────┘                          │
             │ Concept mastered via micro-quiz   │
             ▼                                   │
    ┌─────────────────┐                          │
    │  3. PRACTICAR   │                          │
    │  (Generadores)  │                          │
    └────────┬────────┘                          │
             │ Qualifying consistency achieved   │
             ▼                                   │
    ┌─────────────────┐                          │
    │  4. SIMULAR     │ ─────────────────────────┘
    │ (Mocks/Exams)   │ (Formative mock failures trigger Plan de Nivelación;
    └────────┬────────┘  Official simulation measures benchmark readiness)
             │
             ▼
    ┌─────────────────┐
    │  5. PROGRESO    │
    │  & DECISIÓN     │
    └─────────────────┘
```

### Detailed Loop Phases:
1. **Diagnóstico (Assess Baseline):** A timed 20-question diagnostic sample across all examination domains reveals initial strengths and vulnerabilities without high stakes.
2. **Aprender (Master Concepts):** The learner navigates the Digital Temario. Lessons present core definitions, KaTeX formulas, interactive visual geometric representations, pitfalls to avoid, worked solutions, and an unblocking micro-quiz.
3. **Practicar (Targeted Drills):** The learner engages in parameter-randomized isomorphic question drills. Authored distractor rationales provide immediate, pedagogical feedback explaining *why* a distractor was wrong.
4. **Simular (Realistic Simulation):**
   - **Formative Mock Exam (20 items):** Low-friction simulation that feeds the Plan de Nivelación and unlocks remediation retests.
   - **Official Reference Simulation (60 items, 150 min):** Strict timed test under authentic examination conditions; isolated from the authored practice pool.
5. **Progreso & Decisión (Actionable Next Steps):** Rather than passive analytics, the dashboard functions as a decision engine, displaying the single most impactful next action.
