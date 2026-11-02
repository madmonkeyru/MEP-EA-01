# Human-in-the-Loop (HIL) Pilot Verification Protocol & Audit Checklist
**Target Scope:** BXM Mathematics — Convocatoria 02-2026 Reference Pilot
**Document Reference:** MEP-EA-PILOT-01
**Version:** 1.0.0
**Parent Index:** [INDEX.md](INDEX.md) & [03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md](03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md)
**Status:** Authoritative Pilot Standard

---

## 1. Executive Summary & Context

While the platform prototype contains 170+ BXM question items across Sets 1 to 4, the initial proof of concept only verified the **end-to-end navigational user flow** (enter $\rightarrow$ configure mode $\rightarrow$ take test $\rightarrow$ view results).

To ensure commercial mathematical integrity, legal safety, and graphical accuracy, this document establishes a **bounded, human-reviewed pilot (HIL)** for a single convocatoria (**Convocatoria 02-2026 BXM Mathematics**). Broad automated ingestion must not be implemented until this human-reviewed pilot validates review criteria and catalog failure modes.

---

## 2. Strict Content Separation Framework

The pilot enforces two strictly separated content tracks:

```
[MEP DGEC Convocatoria 02-2026 Examination & Spec PDFs]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[Stream A: Official Reference Benchmark]  [Stream B: Authored Mastery Items]
- Exact 60 items digitized verbatim      - Proprietary original question variants
- Official solucionario keys (1B, 2A...)   - Independent step-by-step solutions
- Freely accessible freemium benchmark    - Decoupled concept knowledge links
- Baseline comparison and audit ground    - Pure SVG parametric visualizations
```

---

## 3. Human-in-the-Loop 5-Stage Verification Workflow

Each item in the Convocatoria 02-2026 batch undergoes five manual review gates:

```
[1. Extraction Audit] ──► [2. Solucionario Verification] ──► [3. Visual Fidelity Review]
                                                                     │
                                                                     ▼
[5. Blueprint QA Signoff] ◄── [4. KaTeX & Mobile Prose Audit] ◄──────┘
```

### Stage 1: Extraction & Alignment Audit
- Verify question stem text against the official MEP PDF source.
- Confirm alignment to the official *Tabla de Especificaciones*:
  - **Bloque** (e.g., `1. Geometría`)
  - **Afirmación** (e.g., `A1`)
  - **Evidencia** (e.g., `A1.2`)
  - **Cognitive Level** (`reproducción`, `conexión`, `reflexión`)

### Stage 2: Solucionario & Key Verification
- Cross-check that the `correct_answer` matches the official MEP answer key.
- Verify that distractor options (`A`, `B`, `C`, `D`) are distinct, mathematically plausible, and contain no typographical errors.
- Confirm that the question stem does not contain ambiguities or missing given conditions.

### Stage 3: Visual Specification & Fidelity Review (Zero Static Bitmaps)
- **Visual Accuracy Check**: Verify that the parametric vector spec (`CartesianCanvas`, `Solid3D`, `BoxPlot`, etc.) reflects the geometric or statistical scenario accurately:
  - Coordinate axes ticks, labels, arrows, and origin points.
  - Sphere/cylinder/cone cross sections, cutting plane overlays, and dashed hidden lines.
  - Right-angle indicators and variable labels.
- **Theme Invariance**: Inspect rendering in both Light Theme and Dark Theme (`.dark`).
- **Contrast Halos**: Ensure SVG text elements have stroke halos preventing illegibility over intersecting lines.

### Stage 4: KaTeX Notation & Mobile Readability Audit
- Verify that mathematical symbols, exponents, fractions, and radicals use valid LaTeX delimiters (`$...$`).
- Verify responsive wrapping on a 375px mobile viewport:
  - No horizontal page blowout.
  - Option card letters remain aligned.
  - Formulas scroll smoothly inside bounded badges (`math-data-badge`).

### Stage 5: Blueprint & Assembly Sign-off
- Verify inclusion in `content/programs/bxm/matematica/convocatorias/2026-c2.json`.
- Execute validation CLI: `node scripts/ingest-validate-content.mjs`.

---

## 4. Item-Level HIL Audit Checklist (Reviewer Sheet)

Reviewers use this checklist to certify each question item before committing:

| Check Item | Acceptance Criteria | Pass / Fail |
| :--- | :--- | :--- |
| **Stem Accuracy** | Question stem matches official PDF prompt with exact values. | [ ] |
| **KaTeX Delimiters** | All math variables ($x, y, r$) and formulas are delimited with `$ ... $`. | [ ] |
| **Key Match** | `correct_answer` exactly matches the official solucionario. | [ ] |
| **Worked Steps** | At least 2 clear, mathematically sound step-by-step solution steps. | [ ] |
| **SVG Visual Spec** | Zero static bitmap images. Parametric composite spec renders correctly. | [ ] |
| **3D Projections** | 3D solid slicing shows correct shape (circle, ellipse, parabola) and labels. | [ ] |
| **Mobile Layout** | Card fits within 375px width without clipping or unreadable tiny text. | [ ] |
| **Dark Mode Contrast** | Stroke colors and fills adapt to dark mode custom variables. | [ ] |
| **Metadata Tags** | `concept_id`, `evidence_id`, and `cognitive_level` are populated. | [ ] |

---

## 5. Catalog of Known Failure Modes & Rejection Rules

Items exhibiting any of the following failure modes must be rejected and returned for authoring correction:

1. **Bare Math Regex Collision**: Using raw symbols (e.g. `(x - 2)^2`) without LaTeX delimiters, resulting in distorted plain-text rendering.
2. **Missing Negative Coordinates in Visual Specs**: Coordinate planes clipping geometric figures because domain boundaries (`x_range`, `y_range`) were specified too narrow.
3. **Ambiguous 3D Solid Labels**: Slicing planes where center $O$ and chord endpoints are misaligned with the pythagorean right-angle symbol.
4. **Calculated Option Mismatch**: Options with rounded decimal values when the official MEP exam uses simplified radical form (e.g., $5\sqrt{2}$ vs. $7.07$).
5. **Mobile Viewport Overflow**: Pre-formatted tables or SVG canvases with hardcoded `width="600"` that fail to scale with `viewBox="0 0 600 ..."` and `w-full`.

---

## 5.1 Certified Pilot Sign-off Report
The formal audit and certification ledger for Convocatoria 02-2026 is published at: **[PILOT_BXM_02_2026_AUDIT_REPORT.md](PILOT_BXM_02_2026_AUDIT_REPORT.md)**.

## 6. Pilot Verification Sign-off Criteria

The Convocatoria 02-2026 pilot is formally complete when:
- All 60 official blueprint items have passed the 5 review stages.
- Automated validation passes: `node scripts/ingest-validate-content.mjs` returns `0 errors` and `0 warnings`.
- End-to-end learner journey tests pass in Vitest and Playwright.
