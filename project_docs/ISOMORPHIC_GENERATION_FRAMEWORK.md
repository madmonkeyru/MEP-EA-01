# Isomorphic Question Generation Framework & Specification Prompts
**System Identifier:** MEP-EA-01 / BXM Mathematics & Multi-Subject Engine
**Document Reference:** MEP-EA-ARCH-08
**Version:** 1.0.0
**Parent Index:** [INDEX.md](INDEX.md) & [03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md](03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md)
**Status:** Authoritative Standard for Manual, IDE, and AI Isomorph Generation

---

## 1. Executive Summary & Purpose

To sustainably scale the proprietary question bank (Stream B) across BXM Mathematics and future subjects without infringing on MEP copyright or causing item fatigue, this framework defines the **Isomorphic Generation System**.

An **isomorphic item** is mathematically, pedagogically, and taxonomically equivalent to an official benchmark item:
1. **Identical Competency Target**: Assesses the exact same **Bloque**, **Afirmación**, and **Evidencia** code (e.g. `A1.2`).
2. **Equivalent Cognitive Demand**: Preserves the cognitive level (`reproduccion`, `conexion`, or `reflexion`) and difficulty tier (1, 2, or 3).
3. **Novel Mathematical Parameters & Distractor Logic**: Generates distinct numerical values, algebraic forms, and context narratives while retaining standard Costa Rican curriculum distractor patterns.
4. **Zero Static Images**: Every graphic question must specify a pure parametric SVG composite (`cartesian_2d`, `solid_3d`, `box_plot`, `table`, `distribution_curve`).
5. **Schema Conformance**: Every generated item strictly validates against `content/item.schema.json`.

---

## 2. Structured LLM / IDE Prompt Template

Authors or automated generation pipelines must use the following system and user prompt format when requesting isomorphs:

### 2.1 System Prompt
```markdown
You are an expert Costa Rican curriculum developer and mathematical psychometrician specializing in MEP Educación Abierta (Bachillerato por Madurez Suficiente - BXM).
Your task is to generate high-fidelity, isomorphic multiple-choice question items adhering strictly to the official MEP Table of Specifications and the MEP-EA-01 JSON schema.

Rules:
1. Output ONLY a valid JSON object matching the MEP-EA-01 Item Schema (content/item.schema.json).
2. Exactly four options ('A', 'B', 'C', 'D') with exactly one correct answer.
3. Distractors must reflect plausible student errors (e.g., sign inversion, omitting square root, confusing radius with diameter).
4. All mathematical variables, equations, and coordinates MUST be enclosed in LaTeX delimiters: `$ ... $`.
5. For geometry or statistics items requiring visuals, provide a parametric `visual_spec` using composite types ('cartesian_2d', 'solid_3d', 'box_plot', 'table'). Do NOT reference any static image files (.png, .jpg).
6. Provide at least two clear, pedagogical step-by-step solution steps.
```

### 2.2 User / Generator Prompt Format
```json
{
  "request": "generate_isomorph",
  "target_program": "BXM",
  "subject": "Matemáticas",
  "spec_alignment": {
    "block": "1. Geometría",
    "affirmation": "A1",
    "evidence": "A1.2",
    "evidence_desc": "Reconoce la representación algebraica de una circunferencia dado su centro y su radio, en diversos contextos."
  },
  "concept_id": "mep-geo-circunferencia-01",
  "cognitive_level": "reproduccion",
  "difficulty_tier": 1,
  "parameter_constraints": {
    "center_h_range": [-8, 8],
    "center_k_range": [-8, 8],
    "radius_range": [2, 12],
    "allow_radical_radius": true
  },
  "seed_reference_item": "item-geo-001"
}
```

---

## 3. Automated Validation CLI (`scripts/generate-isomorphs.mjs`)

The framework is supported by a dedicated CLI tool:
```bash
node scripts/generate-isomorphs.mjs --evidence A1.2 --dry-run
```
The tool validates:
- Target evidence existence in `content/programs/bxm/matematica/specs/02-2026.json`.
- Concept linkage in `content/library/math/`.
- Schema conformance via `content/item.schema.json`.
- Unique deterministic item code assignment (`item-geo-iso-XXX`).
