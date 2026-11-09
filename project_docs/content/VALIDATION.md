# MEP-EA Content Validation Rules

**Standard:** P12 Content Validation Engine (`packages/content/src/authoring/validator.ts`)

---

## 1. Validation Architecture

Validation strictly precedes runtime ingestion. Invalid content is blocked before reaching the catalog or learner devices.

$$\text{Authored Content} \xrightarrow{\text{validateSubjectPackage}} \begin{cases} \textbf{PASS:} & \text{Safe for ingestion} \\ \textbf{FAIL:} & \text{Blocked with explicit error path \& message} \end{cases}$$

---

## 2. Gate Verification Rules

### Gate A: Schema & Structural Integrity
- Stem must be non-empty and properly formatted.
- Options array must contain exactly 4 unique choices (A, B, C, D).
- Option text must be distinct (no duplicate choices).
- `correctOptionId` must match one of the 4 valid options.

### Gate B: Visual Completeness
- Questions with `requiresVisual: true` must specify a valid `visual` specification (`coordinate-plane` or `circle`).
- Visual boundaries and point labels are validated.

### Gate C: Pedagogical & Curriculum Mapping
- Every question must specify a `domainId`, `evidenceId`, and non-empty `conceptIds`.
- The referenced `domainId`, `evidenceId`, and `conceptIds` must exist in the subject's taxonomy.
- Prerequisite cycles in concepts are strictly forbidden.

### Gate D: Provenance & Publication Signoff
- Questions marked with `publication.status: 'published'` require:
  - Provenance status different from `source_unverified`.
  - An explicit reviewer signoff record verifying all 4 gates (A, B, C, D).
