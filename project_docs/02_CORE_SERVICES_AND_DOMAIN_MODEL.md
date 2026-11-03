# Module 02: Core Services and Domain Model
**Document Reference:** MEP-EA-ARCH-02
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. Domain Entities & Academic Framework

MEP EA Digital structures the Costa Rican *Educación Abierta* system into four primary programs, each governed by official MEP / DGEC evaluation topologies, passing thresholds, subject compositions, and calculator permissions.

```
                      ┌───────────────────────────────────────┐
                      │            MEP EA Digital             │
                      │         (Educación Abierta)           │
                      └──────────────────┬────────────────────┘
                                         │
        ┌──────────────────┬─────────────┴────────────┬──────────────────┐
        ▼                  ▼                          ▼                  ▼
  [ I & II Ciclo ]   [ III Ciclo ]                 [ EDAD ]            [ BXM ]
  (CICO / Primaria)  (7°, 8°, 9° Año)          (10° & 11° Distancia)  (Madurez)
  - 5 Subjects       - 3 Grade Levels           - 2 Modular Halves    - Unified 10°/11°
  - Passing: 65      - Passing: 65              - Passing: 70         - Passing: 70
  - Calc: PROHIBITED - Calc: Allowed            - Calc: Allowed       - Calc: Allowed
  - Monolithic       - Recognizes Formal Ed     - Prereq: Parte 1     - Unified Form
```

### 1.1 Technical Matrix by Program

| Attribute | I & II Ciclo (CICO) | III Ciclo | EDAD (Educación Diversificada a Distancia) | BXM (Bachillerato por Madurez) |
| :--- | :--- | :--- | :--- | :--- |
| **Academic Level** | Primary (Grades 1–6) | Lower Secondary (Grades 7–9) | Upper Secondary (Grades 10–11) | Upper Secondary (Exit Exam) |
| **Minimum Age** | 14 years | 14 years | >16 years (age cap lifted 2024) | 18 years (exceptions for teen parents) |
| **Prerequisites** | Literacy & basic numeracy | Approved Primary (I&II Ciclo) | Approved III Ciclo (9° Año) | Approved III Ciclo (9° Año) |
| **Passing Score** | **65** | **65** | **70** | **70** |
| **Calculator Policy** | **Strictly Prohibited** (`calculatorAllowed: false`) | Permitted (non-programmable) | Permitted (non-programmable) | Permitted (non-programmable) |
| **Examination Format** | 5 monolithic subject tests | 1 test per subject per grade (e.g. 7°, 8°, 9°) | 2 tests per subject (Parte 1: 10°, Parte 2: 11°) | 1 unified test per subject (10° + 11°) |
| **Formal Recognition** | None (must take all 5 tests) | Accepts passed formal school grades | Accepts passed 10° formal school grades | Accepts formal 10°/11° credits & EDAD P1+P2 |

---

## 2. Core Service Architectures

MEP EA Digital implements five dedicated domain services powering the student experience.

### 2.1 Service 1: Practice (Práctica) & Dynamic Test Engine

The test compilation engine (`src/services/testEngine.ts`) satisfies diverse evaluation needs through five operating modes:

```
[Student Request] ──► [Test Compilation Engine]
                             │
       ┌─────────────────────┼─────────────────────┬─────────────────────┐
       ▼                     ▼                     ▼                     ▼
[1. Blueprint Sim]   [2. Weighted Mock]    [3. Concept Drill]    [4. Topic/Area]
(60 items, 150 min,  (Official 23/25/12    (Diagnostic targeting (Configurable count:
 strict sequential)   proportional matrix)  by concept ID)        5, 10, 20 items)
```

1. **Full Convocatoria Blueprint Simulation**:
   - Reconstitutes the official examination manifest (e.g., `2026-c1.json`, `2026-c2.json`).
   - Exact sequential distribution: Items 1–23 (Geometría), 24–48 (Relaciones y Álgebra), 49–60 (Estadística y Probabilidad).
   - Enforces time limits (150 minutes standard, 180 minutes accommodated) and automated submission upon timer expiry.
2. **Weighted Dynamic Mock Test (Proportional Sampling)**:
   - Assembles an unreleased, randomized test complying with official DGEC point weighting:
     - Geometría: 23 items ($38.3\%$)
     - Relaciones y Álgebra: 25 items ($41.7\%$)
     - Estadística y Probabilidad: 12 items ($20.0\%$)
   - Cognitive tier balancing: Reproducción ($\approx 30\%$), Conexión ($\approx 50\%$), Reflexión ($\approx 20\%$).
3. **Targeted Concept Drilldown**:
   - Compiles targeted question sequences matching `concept_id === requestedConceptId` or `linked_concepts.includes(id)`.
4. **Practice by Area & Topic**:
   - Filters item pools by curricular area (`geometry`, `functions`, `statistics`) or granular topic (e.g., *Función Cuadrática*).
5. **Quick Random Practice**:
   - Low-friction randomized quizzes (5–20 questions) for mobile on-the-go study.

### 2.2 Service 2: Learn (Aprender) & Authored Knowledge Library

Provides structured mastery content decoupled from official test papers:
- **Concept Registry**: 26+ core mathematical concepts with formal definitions, interactive diagrams, and KaTeX equations (`src/services/knowledgeService.ts`).
- **Dynamic Formula Sheets**: Automatically filters formulas based on the active program (e.g., hiding trigonometric identities for lower levels and hiding advanced formulas for I & II Ciclo where calculators are prohibited).
- **Terms Dictionary**: Instant alphabetical and domain-filtered glossary for quick recall during study sessions.

### 2.3 Service 3: Find Info (Información)

Maintains the authoritative database of official MEP examination rules:
- **Tablas de Especificaciones**: Granular mapping of Bloque $\rightarrow$ Conocimiento $\rightarrow$ Afirmación $\rightarrow$ Evidencia, displaying official point weightings.
- **Logistical Rules**: Approved examination tools (calculators allowed vs. prohibited, blue/black pen requirements, late entry cut-offs).
- **Official Convocatoria Windows**: Registration dates, fee payment protocols (₡8,000 via BNCR/Banco Nacional), and testing dates.

### 2.4 Service 4: Get Insights (Diagnóstico, Nivelación & Métricas)

Longitudinal student performance tracking, diagnostic analytics, and adaptive remediation:
- **Instant Attempt Scoring**: Immediate computation of percentage score, passing status ($\ge 70$ for BXM/EDAD, $\ge 65$ for CICO/III Ciclo), and score delta from baseline.
- **Cognitive & Domain Breakdown**:
  - Score by Curricular Area (Geometría vs. Álgebra vs. Estadística).
  - Score by Cognitive Level (Reproducción, Conexión, Reflexión).
- **Time Analysis**: Seconds spent per question, highlighting pacing bottlenecks (e.g., spending $>4$ minutes on 3D solid spatial problems).
- **Diagnostic-Driven "Plan de Nivelación" (Remediation Plan Engine)**:
  - Dynamically synthesizes diagnostic performance into actionable learning roadmaps (`src/services/remediationEngine.ts`).
  - Pinpoints granular weak concepts (accuracy $<75\%$) prioritized by urgency (`high`, `medium`, `low`).
  - Correlates each deficient concept with official KaTeX formula references and direct one-click practice launch buttons.
- **Telemetry Funnel Analytics Dashboard**:
  - Transparent client-side funnel tracking for learners and tutors: `goal_selected` $\rightarrow$ `diagnostic_started` $\rightarrow$ `diagnostic_completed` $\rightarrow$ `remediation_started` $\rightarrow$ `session_completed`.
  - Exposes activation ratios, conversion rates, and recent local session event streams (`src/components/results/TelemetryFunnelDashboard.tsx`).
- **Longitudinal Trend Chart**: Interactive historical progress visualization across consecutive practice sessions with visual indicator thresholds.

### 2.5 Service 5: Guidance (Orientación & Trayectoria Académica)

A specialized decision engine addressing the high procedural complexity of the *Educación Abierta* framework.

---

## 3. Guidance Engine: Enrollment & Scheduling Decision Framework

### 3.1 The Problem Context
Due to the absence of API integration with the MEP "Yo aplico" platform, students navigate a complex administrative landscape:
- Multiple deadlines, banking voucher verifications, and physical sedes.
- **Curriculum dilemma**: Adult learners frequently default to BXM because it is perceived as simpler (one test per subject), unaware that its syllabus covers both 10° and 11° grade simultaneously in a rigorous 60-item test. For many working students, EDAD's split structure (taking 10° first, then 11°) offers significantly higher pass rates.
- **Prior Recognition (*Equiparación*)**: Many students waste time and exam fees taking subjects they already passed in formal high schools (Colegios Académicos, Vocacionales, or CINDEA/IPEC).

### 3.2 Decision Tree: EDAD vs. BXM Strategy

```
                                [ Student Onboarding ]
                                          │
                        Is learner ≥ 18 years old?
                                ├── No ──► Must enroll in EDAD (or III Ciclo if 9° missing)
                                │
                               Yes
                                │
                    Has student approved 10° Año subjects
                           in formal high school?
                                ├── Yes ──► Recommended: EDAD (Recognize 10°, test only 11°)
                                │
                                No
                                │
                 How much study time per week is available?
                     ├── < 10 hrs/week ──► Recommended: EDAD (Split burden: 10° then 11°)
                     │
                     └── ≥ 10 hrs/week ──► Recommended: BXM (Single unified exit exam)
```

### 3.3 Prior Recognition (Equiparación) Engine
The platform provides a guided wizard for subject recognition:
1. **Input**: Student inputs previous academic transcripts (public high school, technical school, CICO, or EDAD).
2. **Rule Matrix**:
   - If 10° Mathematics is approved in Formal Education $\rightarrow$ Eligible for EDAD Parte 2 exemption; can enroll directly in Parte 2.
   - If both EDAD Parte 1 and Parte 2 are approved $\rightarrow$ Automatically recognized as BXM certified upon formal MEP filing.
   - For I & II Ciclo: Zero recognition accepted; learner must take all 5 examinations.
3. **Output**:
   - Personalized Graduation Path (e.g., "You only need 2 tests to graduate instead of 6").
   - Pre-filled MEP Subject Recognition Request Checklist and document submission guide.
   - Important calendar reminders for DGEC recognition submission windows (which precede standard exam enrollment).

---

## 4. Domain Data Models (TypeScript Schemas)

```typescript
export type ProgramId = 'cico' | 'iii_ciclo' | 'edad' | 'bxm';

export interface ProgramMetadata {
  id: ProgramId;
  name: string;
  level: 'primaria' | 'secundaria_baja' | 'secundaria_alta';
  passingScore: 65 | 70;
  calculatorAllowed: boolean;
  minAge: number;
  subprograms?: Array<{
    id: string;
    name: string;
    gradeLevel: string;
  }>;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  programId: ProgramId;
  convocatoriaId: string;
  mode: 'simulation' | 'weighted_mock' | 'concept' | 'area' | 'random';
  startTime: string;
  endTime: string;
  totalQuestions: number;
  score: number; // 0 - 100
  passed: boolean;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>; // itemId -> answer
  itemTimes: Record<string, number>; // itemId -> seconds spent
  domainScores: {
    geometry: { correct: number; total: number };
    algebra: { correct: number; total: number };
    statistics: { correct: number; total: number };
  };
  cognitiveScores: {
    reproduccion: { correct: number; total: number };
    conexion: { correct: number; total: number };
    reflexion: { correct: number; total: number };
  };
}
```
