# Module 03: Content Pipeline and Legal Decoupling Strategy
**Document Reference:** MEP-EA-ARCH-03
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. Legal Decoupling & Content Ownership Architecture

To deliver commercial B2C software safely while guaranteeing strict alignment with official national curriculum standards, MEP EA Digital establishes a strict **legal decoupling boundary**.

```
[Official MEP DGEC Exam & Spec PDFs] (Biannual Convocatorias)
                        │
                        ▼ Extraction & Alignment Engine
     ┌──────────────────┴──────────────────┐
     ▼                                     ▼
[Stream A: Public / Freemium Benchmark]   [Stream B: Private Authored Library]
- Digitized official practice tests        - Proprietary item bank (170+ items)
- Exact MEP affirmation & evidence codes   - Step-by-step KaTeX explanations
- Official spec weightings (Points/Block)  - Parametric SVG visual components
- Freemium onboarding & diagnostic         - Decoupled concept knowledge graph
- Historical comparison analytics          - Cross-program curriculum bridges
```

### 1.1 Dual-Stream Content Strategy

1. **Stream A: Public & Freemium Official Reference Material**
   - **Specification Tables (47+ PDFs per convocatoria)**: Extracted and normalized into JSON schemas to determine affirmations, evidences, and score weights.
   - **Sample Practice Tests (47 PDFs per convocatoria, or 94 per year)**: Digitized verbatim to serve as baseline evaluation sets, freemium diagnostic material, and internal QA validation to ensure authored questions mirror official test parameters accurately.
2. **Stream B: Proprietary Authored Knowledge Library & Question Bank**
   - **Original Question Generation**: Content authors synthesize new items assessing identical evidence codes without copying MEP phrasing or problem values.
   - **Authored Knowledge Graph**: Fills structural gaps between programs (e.g. bridging prerequisite geometry knowledge from 9° Año into EDAD Parte 1 and BXM).
   - **Zero Static Images**: Every graphical asset is expressed as a parametric vector payload, eliminating raster copyright ambiguities.

---

## 2. Granular Content Taxonomy & Entity Schemas

The content pipeline enforces a 5-tier normalized taxonomy schema:

```
[Program] (e.g., BXM, EDAD, III Ciclo, CICO)
  └── [Subprogram / Grade] (e.g., 7mo, 8vo, 9no, Parte 1, Parte 2)
        └── [Curricular Domain] (e.g., Geometría, Relaciones y Álgebra, Estadística)
              └── [Affirmation] (e.g., A1, A2, A5)
                    └── [Evidence Skill Target] (e.g., A1.2, A5.3)
                          └── [Atomic Item Registry Entry] (e.g., item-geo-001)
```

### 2.1 Concept Schema (`content/library/math/*_concepts.json`)
```typescript
export interface ConceptRegistryEntry {
  id: string; // Deterministic slug: 'mep-geo-circunferencia-01'
  term: string; // Display name: 'Circunferencia'
  domain: 'geometry' | 'functions' | 'statistics';
  blockName: string; // '1. Geometría - Geometría Analítica'
  subdomain?: string;
  definition: string; // Formal mathematical prose
  programModules: Array<
    'I_II_CICLO' | 'III_CICLO_7' | 'III_CICLO_8' | 'III_CICLO_9' | 'EDAD_PARTE_1' | 'EDAD_PARTE_2' | 'BXM'
  >;
  gradeLevel?: '7mo' | '8vo' | '9no' | '10mo' | '11mo' | 'primaria';
  calculatorAllowed: boolean;
  formulas?: Array<{
    name: string;
    latex: string;
    description: string;
    variables?: Array<{ symbol: string; meaning: string }>;
  }>;
  examples?: string[];
  relatedEvidence?: string[]; // Official criteria: ['A1.1', 'A1.2']
  prerequisiteConcepts?: string[];
}
```

### 2.2 Atomic Question Schema (`content/items/math/{domain}/item-*.json`)
```typescript
export interface Item {
  id: number; // Unique numeric ID for backwards compatibility
  code: string; // Deterministic slug: 'item-geo-bxm-001'
  area: string; // Display area: 'Geometría'
  area_id: 'geometry' | 'functions' | 'statistics';
  topic: string; // 'Circunferencia'
  spec: {
    block: string;
    affirmation: string; // 'A1'
    affirmation_desc?: string | null;
    evidence: string; // 'A1.2'
    evidence_desc: string; // Official MEP wording
  };
  evidence_id?: string;
  concept_id?: string; // Primary linked concept
  linked_concepts?: string[];
  program_applicability: Array<
    'I_II_CICLO' | 'III_CICLO_7' | 'III_CICLO_8' | 'III_CICLO_9' | 'EDAD_PARTE_1' | 'EDAD_PARTE_2' | 'BXM'
  >;
  calculator_allowed: boolean;
  cognitive_level: 'reproduccion' | 'conexion' | 'reflexion';
  difficulty_tier: 1 | 2 | 3;
  historical_convocatoria?: string[];
  stem: string; // KaTeX formatted Markdown ($...$)
  options: Record<'A' | 'B' | 'C' | 'D', string>;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  solution_steps: string[];
  group_id?: string | null;
  visual_spec?: VisualSpec | null;
}
```

### 2.3 Convocatoria Blueprint Schema (`content/programs/{program}/{subject}/convocatorias/{id}.json`)
```typescript
export interface ConvocatoriaManifest {
  schemaVersion: '1.0' | '2.0';
  convocatoriaId: string; // e.g. '2026-c1', '2026-c2'
  year: number;
  cycle: 1 | 2;
  programId: 'bxm' | 'edad' | 'iii_ciclo' | 'cico';
  subprogramId?: string;
  subjectId: string;
  title: string;
  description: string;
  passingScore: 65 | 70;
  calculatorAllowed: boolean;
  timeLimitMinutes: number; // 150 standard
  totalItems: number; // 60
  sections: Array<{
    id: string;
    name: string;
    itemRange: [number, number]; // e.g. [1, 23]
    totalItems: number;
    itemIds: string[]; // Ordered list of item codes
  }>;
  itemPool: string[]; // Master pool for dynamic simulation sampling
}
```

---

## 3. Ingestion Pipeline & Quality Assurance CLI

### 3.1 Semi-Annual Ingestion Workflow
Every 6 months upon release of official MEP materials:
1. **Raw PDF Intake**: Store official specification tables and sample exam PDFs in `project_docs/program_official_pdfs/`.
2. **Text & Table Extraction**: Parse PDF tables into raw JSON using pdf extraction scripts.
3. **Curriculum Alignment**: Map each question to official Bloque $\rightarrow$ Afirmación $\rightarrow$ Evidencia.
4. **Visual Translation**: Convert all raster diagrams into parametric SVG specs (`visual_spec`).
5. **Item Decoupling**: Assign deterministic slugs (`item-{domain}-{index}`) and persist to `content/items/math/{domain}/`.
6. **Blueprint Compilation**: Generate the convocatoria manifest (`2026-c1.json`, etc.) referencing atomic item slugs.

### 3.2 Automated QA CLI (`scripts/ingest-validate-content.mjs`)
The repository includes an automated validation CLI executed via:
```bash
node scripts/ingest-validate-content.mjs
```
The validator enforces:
- **JSON Schema Conformance**: Validates all items against `content/item.schema.json`.
- **Taxonomy Integrity**: Confirms every `concept_id` exists in the corresponding concept registry.
- **Blueprint 100% Item Resolution**: Verifies that every item code in every convocatoria blueprint exists in the item bank.
- **Zero Static Image Artifacts**: Verifies that no PNG/JPG/WebP files are referenced in question stems, options, or solutions.
- **KaTeX Delimiter Formatting**: Ensures valid LaTeX syntax without bare-math parser collisions.
