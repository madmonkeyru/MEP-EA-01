# 04. Content Platform & Curriculum Pipeline

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Visual References:**
- Content Subsystem Diagram: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 1. Content Architecture Overview

The Content & Curriculum Platform is the authoritative source of educational truth for all programs (BXM, EDAD, III Ciclo, I/II Ciclos). It governs the lifecycle of questions, specification blueprints, parametric visual diagrams, and curriculum taxonomies.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL MEP SOURCES                                   │
│            Official PDFs, Specification Tables, Sample Practices, Calendars            │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ Offline Extraction & Ingestion
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CONTENT INGESTION & QA PIPELINE                                 │
│          Docx/PDF Extractors ──► Normalization ──► Gate Validation & Review            │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
┌──────────────────────────────────────────┐┌────────────────────────────────────────────┐
│         OFFICIAL REFERENCE STREAM        ││         PROPRIETARY QUESTION BANK          │
│   Official benchmark items (immutable,   ││    Authored items, isomorphic generators,  │
│    isolated from automated practice)     ││    pedagogical distractors & step solutions│
└────────────────────┬─────────────────────┘└────────────────────┬───────────────────────┘
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  CONTENT REGISTRY                                      │
│                                                                                        │
│   ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────────────────┐   │
│   │ Curriculum Taxonomy │ │ Convocatoria        │ │ Concept Registry &             │   │
│   │ (Programs & Domains)│ │ Blueprints (02-2026)│ │ Visual Specifications (SVG)    │   │
│   └─────────────────────┘ └─────────────────────┘ └────────────────────────────────┘   │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼ Published to
┌────────────────────────────────────────────────────────────────────────────────────────┐
│           APPLICATION SERVICES (TEST COMPILATION, KNOWLEDGE, REMEDIATION)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion & Quality Assurance Pipeline

All question content follows a strict, irreversible, audited progression pipeline before reaching learner-facing surfaces:

$$\text{Raw Source} \longrightarrow \text{Ingested} \longrightarrow \text{Parsed} \longrightarrow \text{Mapped} \longrightarrow \text{Validated} \longrightarrow \text{Reviewed} \longrightarrow \text{Approved} \longrightarrow \text{Published}$$

### Strict Pipeline Gates:
1. **Gate A — Mechanical & Schema Integrity:**
   - Valid non-empty stem with properly formatted mathematical KaTeX delimiters (`$...$` or `$$...$$`).
   - Exactly 4 options labeled A, B, C, D with unique, non-degenerate values.
   - Valid, unambiguous answer key matching one of the 4 declared options.
2. **Gate B — Visual & Diagram Completeness:**
   - Any item referencing a figure must have an associated, verified SVG diagram or parametric visual specification. Items with missing figures are strictly blocked.
3. **Gate C — Pedagogical & Evidence Mapping:**
   - Each item is mapped to its official Afirmación and Evidencia (e.g., `bxm/matematica/02-2026/geometry/A1.2`).
   - Cognitive level is recorded: Reproducción, Conexión, or Reflexión.
4. **Gate D — Review & Approval Signoff:**
   - Historical extracted items default to `provenance_status: 'source_unverified'`.
   - Promotion to `published` requires an explicit, recorded reviewer signoff audit record. Blockers completely prevent promotion.

---

## 3. Separation of Content Streams

To preserve psychometric validity and avoid leaking authentic benchmark questions into routine drill sessions, the platform enforces strict isolation between two content streams:

### 3.1. Official Reference Stream (`Official Reference Stream`)
- **Nature:** High-fidelity digital replicas of real historical or sample MEP examination papers (e.g., the official 60-question BXM 02-2026 practice booklet).
- **Usage Policy:** Strictly reserved for **full benchmark timed simulations**.
- **Isolation Rule:** These items are **never** injected into automated diagnostics, exploratory practice, or adaptive drill pools unless explicitly enabled by administrative override.

### 3.2. Proprietary Question Bank (`Proprietary Question Bank`)
- **Authored Items:** Original questions crafted specifically for the platform, each equipped with:
  - Authored distractor rationales explaining the specific misconception behind options A, B, C, or D.
  - Step-by-step worked pedagogical solutions.
  - Core rule / formula key takeaway.
- **Isomorphic Generator Families:** Parametric code templates capable of producing infinite mathematically consistent variations of core test items (e.g., randomizing circle centers, slope/intercept points, or box plot quartiles while guaranteeing exact integer or simple fractional solutions).

---

## 4. Curriculum Taxonomy & Convocatoria Blueprints

### 4.1. Convocatoria Blueprints (`Convocatoria Blueprints`)
The Convocatoria Blueprint is the structural contract defining the exact composition of an examination period:
- Program ID (e.g., `bxm`, `edad`, `tercer-ciclo`).
- Convocatoria identifier (e.g., `02-2026`).
- Total items (e.g., exactly 60 items for BXM Mathematics).
- Time limit (e.g., 150 minutes).
- Subject and domain distributions (e.g., 22 Geometry, 22 Functions, 16 Statistics & Probability).

### 4.2. Concept Registry & Visual Specifications (`Visual Specifications`)
- Geometric and algebraic diagrams are represented as declarative, vector-based SVG specifications rather than rasterized bitmap images (`.png` / `.jpg`).
- Parametric visual components dynamically adjust labels, angle markers, coordinate axes, and shaded regions to match dynamically generated isomorphic problem variables.
