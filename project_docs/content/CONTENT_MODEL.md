# MEP-EA Canonical Content & Curriculum Model

**Version:** 1.0.0
**Target Architecture:** `project_docs/architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md`

---

## 1. Relational Entity Diagram

```
Program (e.g., 'bxm')
  └── Subject (e.g., 'estudios-sociales')
        └── Curriculum Version (e.g., 'bxm-estudios-sociales-02-2026')
              ├── Domain (e.g., 'sociedad-global', 'costa-rica-contemporanea')
              │     ├── Concept (e.g., 'c-imperialismo-siglo-xix', 'c-primera-guerra-mundial')
              │     └── Evidence (e.g., 'bxm/soc/02-2026/global/E1.1')
              │           ├── Lesson (Pedagogical guide, formula, worked example, micro-quiz)
              │           └── Questions (Authored practice & diagnostic items)
              └── Blueprints (Diagnostic, Mock Exam, Official 60-item Simulation)
```

---

## 2. Content Lifecycle States

Every content element (concept, evidence, lesson, question, blueprint) transitions through explicit, immutable lifecycle states:

$$\text{Draft} \longrightarrow \text{Validated} \longrightarrow \text{Published} \longrightarrow \text{Active} \longrightarrow \text{Archived}$$

- **Draft:** Work in progress, editable, prohibited from production benchmarks.
- **Validated:** Checked by deterministic validators against Gates A–C.
- **Published:** Gate D passed; verified signoff by pedagogical reviewer.
- **Active:** Available in the canonical catalog registry for learner enrollment.
- **Archived / Deprecated:** Superseded by a newer curriculum version, retained for historical learner attempts.
