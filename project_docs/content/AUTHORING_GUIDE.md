# MEP-EA Content Authoring & Curriculum Specification

**Version:** 1.0.0
**Target Standard:** P12 Canonical Content Architecture

---

## 1. Overview

The Content Authoring Specification defines the deterministic contract for creating educational curriculum, lessons, items, and blueprints for the MEP Educación Abierta digital platform.

Educational subjects are authored as structured, versionable JSON files stored under `content/authored/<program>/<subject>-<convocatoria>/`.

Every subject package is evaluated through a strict multi-gate validation pipeline before compilation and ingestion into the learning runtime.

---

## 2. Directory Structure

A subject authoring package is laid out as follows:

```
content/authored/bxm/estudios-sociales-02-2026/
├── package.json         # Package metadata, curriculum version, domains, concepts, evidences
├── lessons.json         # Authored pedagogical lessons and micro-quizzes
├── questions.json       # Authored practice items and benchmark reference items
└── blueprints.json      # Assessment blueprints (diagnostic, mock, simulation)
```

Alternatively, a subject can be delivered as a single monolithic package file (`subject-package.json`) adhering to `SubjectAuthoringPackage`.

---

## 3. Structural Contracts

### 3.1 Taxonomy Hierarchy
1. **Program:** The educational track (e.g. `bxm`, `edad`, `iii_ciclo`, `i_ii_ciclo`).
2. **Subject:** The specific discipline (e.g. `matematica`, `civica`, `estudios-sociales`).
3. **Curriculum Version:** The official syllabus period (e.g. `bxm-estudios-sociales-02-2026`).
4. **Domain:** Thematic area (e.g. `sociedad-global`, `costa-rica-contemporanea`).
5. **Concept:** Atomic pedagogical knowledge node with prerequisite relationships.
6. **Evidence:** Concrete testable learning outcome mapped to an official affirmation code.

### 3.2 Question Structure
Every question must satisfy Gates A–D:
- **Gate A (Integrity):** Non-empty stem, exactly 4 options (A, B, C, D) with distinct text, valid `correctOptionId`.
- **Gate B (Visuals):** If `requiresVisual: true`, must specify a valid declarative visual specification (`coordinate-plane` or `circle`).
- **Gate C (Pedagogical Mapping):** Valid `domainId`, `evidenceId`, and at least one `conceptId`.
- **Gate D (Review Signoff):** Questions marked `publication.status: 'published'` require verified provenance and reviewer signoff records.

### 3.3 Assessment Blueprints
Assessment blueprints govern how tests are dynamically and deterministically compiled:
- **Diagnostic:** Formative evaluation with domain quotas diagnosing strengths and weaknesses.
- **Practice:** Target drill session focused on specific evidences.
- **Benchmark Simulation:** Full official exam replicating official MEP conditions (e.g. 60 items, 150 minutes).
