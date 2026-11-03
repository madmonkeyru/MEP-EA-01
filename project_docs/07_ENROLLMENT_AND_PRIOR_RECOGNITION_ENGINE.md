# MEP EA Digital — Guidance & Prior Recognition Engine Architecture
**Document Reference:** `project_docs/07_ENROLLMENT_AND_PRIOR_RECOGNITION_ENGINE.md`
**Version:** 3.0.0 (Post-Consolidation & Module Extension)
**Status:** Approved Architecture Specification
**Authority:** MEP Educación Abierta Digital Engineering

---

## 1. Executive Summary & Legal Framework

In Costa Rican Educación Abierta, the transition of students between educational formats is governed by strict administrative and legal guidelines administered by the **Dirección de Gestión y Evaluación de la Calidad (DGEC)** of the **Ministerio de Educación Pública (MEP)**.

Unlike typical learning management platforms where course credits are automatically tracked via API integrations, MEP EA operates under complete **administrative decoupling**:
1. MEP databases (e.g. *Yo Aplico*, padrones oficiales, historial en centros educativos) have **no public or programmatic APIs**.
2. Prior credit recognition (*Equiparación*, *Convalidación*, *Homologación de Estudios Extranjeros*) requires human-in-the-loop administrative evaluation, formal document verification, and regional signature protocols.
3. Postulants face significant friction, risk duplicate registration fees (₡8,000 per test), and frequently enroll in incorrect modules without prior recognition.

The **MEP EA Digital Prior Recognition ("Equiparación") & Enrollment Engine** serves as an intelligent client-side advisory system that models the exact legal-administrative requirements, calculates remaining exam topologies and estimated fees, and provides actionable checklists without handling sensitive PII on servers.

---

## 2. The Three Official Recognition Pathways

MEP DGEC recognizes three primary pathways for educational equivalencies:

```
+---------------------------------------------------------------------------------------------------+
|                                MEP PRIOR RECOGNITION PATHWAYS                                     |
+-----------------------------------+-----------------------------------+---------------------------+
| 1. Formal -> Abierta              | 2. Abierta <-> Abierta            | 3. Foreign Homologation   |
| (Colegio / CINDEA / IPEC)         | (EDAD <-> BXM Transfers)          | (Estudios en el Exterior) |
+-----------------------------------+-----------------------------------+---------------------------+
| - Colegio Académico (Diurno/Noc)  | - Transfer of passed subjects     | - Primary / Secondary     |
| - Colegio Técnico Profesional     |   from EDAD to BXM (1:1)          |   completed outside CR    |
| - CINDEA / IPEC modules           | - Transfer of passed subjects     | - Apostille / Legalization|
| - Requires: Tomo, folio, asiento, |   from BXM to EDAD (clears        | - DGEC Foreign Studies    |
|   firma de director, sello centro |   both Parte 1 & Parte 2)         |   formal Resolution       |
+-----------------------------------+-----------------------------------+---------------------------+
```

### Pathway 1: Formal Education to Educación Abierta (`formal_to_abierta`)
* **Scope:** Learners with partially completed secondary education (Colegio Académico Diurno/Nocturno, Colegio Técnico Profesional, CINDEA, or IPEC) entering III Ciclo, EDAD, or BXM.
* **Rules & Constraints:**
  * **I y II Ciclo (Primaria):** *Zero recognition allowed.* Formal primary school grades cannot be transferred as partial subjects; candidates must either possess the 6° grade certificate or pass the 5 open tests.
  * **III Ciclo (7°, 8°, 9°):** Recognized on a subject-by-subject basis across grade levels.
  * **EDAD (10° & 11°):** A passed 10° grade subject in formal high school convalidates **Parte 1 (10°)** of that subject in EDAD. **Parte 2 (11°)** cannot be enrolled or validated without prior formal accreditation of Parte 1.
  * **BXM (Bachillerato por Madurez):** 10° and 11° in formal education do not automatically exempt unless certified through DGEC convalidation or official MEP equivalency charts.
* **Official Document Requirements:**
  * Original Academic Certification from the educational center stating subject grades.
  * Explicit metadata: *Tomo*, *Folio*, *Asiento*, director signature, institutional stamp.

### Pathway 2: Between Educación Abierta Programs (`abierta_to_abierta`)
* **Scope:** Learners transferring between EDAD and BXM.
* **Rules & Constraints:**
  * A subject fully passed in BXM directly satisfies that subject in EDAD (both Parte 1 and Parte 2).
  * A subject passed in both Parte 1 (10°) and Parte 2 (11°) in EDAD directly transfers to satisfy the BXM subject test.
  * If only Parte 1 (10°) is passed in EDAD, it does not exempt the candidate from the comprehensive BXM exam, as BXM combines 10° and 11° into a single evaluation.
* **Official Submission Channel:**
  * Submissions via `plataformadgec@mep.go.cr` or the DGEC consultation portal (`dgec.mep.go.cr/consultas`).

### Pathway 3: Foreign Education Homologation (`foreign_homologation`)
* **Scope:** Costa Rican citizens or foreign residents who completed primary, intermediate, or secondary education abroad.
* **Rules & Constraints:**
  * Academic transcripts and diplomas must be apostilled (Hague Convention) or consularized/authenticated via the Ministry of Foreign Affairs (Casa Amarilla).
  * Candidate must obtain an official Resolution of Equivalency from the **Departamento de Estudios Extranjeros de la DGEC** before registering on *Yo Aplico*.
  * Lead time: **Minimum 6 weeks** prior to the exam registration window.
* **Official Submission Channel:**
  * `dgec.reconocimientos@mep.go.cr` and `dgec.mep.go.cr/certificacion-extranjera`.

---

## 3. Domain Model & Mathematical Evaluation Architecture

The domain logic is modeled in `src/services/onboarding/equiparacion.ts` and integrated into the wizard state engine:

```
[User Input Profile & Selections]
                 |
                 v
   +---------------------------+
   |   evaluateEquiparacion    |
   +---------------------------+
                 |
  +--------------+--------------+
  |                             |
  v                             v
[Recognized Subjects]   [Remaining Subjects]
  |                             |
  |                             +--> Total Remaining Tests (N)
  |                             +--> Estimated Fee (N * ₡8,000)
  |                             +--> Sequence & Prerequisite Gates
  v
[Administrative Submission Guidelines]
  +--> Official Channel (Email / Portal / Regional)
  +--> Estimated Lead Time (3 to 6 weeks)
  +--> Document Verification Checklist (DOC-FA-*, DOC-AA-*, DOC-EXT-*)
  +--> Legal & Admissibility Warnings
```

### Key Data Structures

```typescript
export interface EquiparacionAnalysis {
  pathway: EquiparacionPathway;
  targetProgram: ProgramId;
  recognizedItems: {
    label: string;
    subject: SubjectId;
    level?: LevelId;
    science?: ScienceId;
  }[];
  remainingItems: {
    label: string;
    subject: SubjectId;
    level?: LevelId;
    tests: number;
  }[];
  totalRemainingTests: number;
  estimatedFee: number;
  guidelines: EquiparacionSubmissionGuideline;
  warnings: string[];
}
```

---

## 4. UI/UX Interaction Design & Flow

1. **Activation:** In `PerfilStep`, the user is prompted whether they hold previously approved subjects they wish to equiparate. Selecting "Sí" dynamically appends the `EquiparacionStep` (`"equiparacion"`) into the linear navigation sequence.
2. **Pathway & Origin Selection:** The user specifies the legal pathway (`formal_to_abierta`, `abierta_to_abierta`, or `foreign_homologation`) and original educational institution type.
3. **Interactive Subject Matrix:**
   - **III Ciclo:** Structured across 7°, 8°, and 9° grids.
   - **EDAD:** Structured across Parte 1 (10°) and Parte 2 (11°), including targeted Science selection (Biología, Física, Química).
   - **BXM:** Structured across the 6 unified Bachillerato subjects.
4. **Instant Calculation & Feedback:**
   - Real-time tally of recognized credits vs. pending tests.
   - Immediate calculation of official reference fees (₡8,000 per test).
   - Dynamic admissibility warnings (e.g., EDAD Parte 2 gatekeeper, Foreign resolution notice).
   - Clear documental checklist with required stamps and signatures.

---

## 5. Security, Privacy & Decoupling Assurance

- **100% Client-Side Evaluation:** No personal educational records, migration status, or contact details are transmitted or stored on remote servers. All evaluations execute locally in browser memory (`wizardStore.tsx`).
- **Legal Decoupling:** All advice is strictly labeled as advisory and provisional. Direct links and official emails (`plataformadgec@mep.go.cr`, `dgec.reconocimientos@mep.go.cr`) are provided for formal administrative execution.
