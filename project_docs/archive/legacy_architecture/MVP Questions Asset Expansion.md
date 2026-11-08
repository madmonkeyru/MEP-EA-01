---
> **HISTORICAL ARCHIVE & DEPRECATION NOTICE**
>
> **Status:** SUPERSEDED & ARCHIVED
> **Effective Milestone:** Documentation Consolidation Baseline (Target Architecture v2.0)
>
> This document was produced during early Proof-of-Concept (POC) experimentation and historical sprint execution. Its architectural assumptions, single-platform focus, or implementation details **do not represent approved target production architecture**.
>
> For the authoritative target system architecture, refer to:
> - [01. System Overview & Boundaries](../../architecture/01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md)
> - [02. Core Domain Services & Learning Loop](../../architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md)
> - [03. Multi-Platform Client & Shared Application Layer](../../architecture/03_MULTI_PLATFORM_AND_SHARED_CLIENT.md)
> - [04. Content Platform & Curriculum Pipeline](../../architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md)
> - [05. Data Infrastructure & Local Runtime](../../architecture/05_DATA_AND_INFRASTRUCTURE.md)
> - [06. Implementation Alignment & Transition Analysis](../../architecture/06_IMPLEMENTATION_ALIGNMENT_AND_TRANSITION.md)
---


---
> **HISTORICAL ARCHIVE & DEPRECATION NOTICE**
>
> **Status:** SUPERSEDED & ARCHIVED
> **Effective Milestone:** Documentation Consolidation Baseline (Target Architecture v2.0)
>
> This document was produced during early Proof-of-Concept (POC) experimentation and historical sprint execution. Its architectural assumptions, single-platform focus, or implementation details **do not represent approved target production architecture**.
>
> For the authoritative target system architecture, refer to:
> - [](../../architecture/01_SYSTEM_OVERVIEW_AND_BOUNDARIES.md)
> - [](../../architecture/02_CORE_DOMAIN_AND_LEARNING_LOOP.md)
> - [](../../architecture/03_MULTI_PLATFORM_AND_SHARED_CLIENT.md)
> - [](../../architecture/04_CONTENT_AND_CURRICULUM_PLATFORM.md)
> - [](../../architecture/05_DATA_AND_INFRASTRUCTURE.md)
> - [](../../architecture/06_IMPLEMENTATION_ALIGNMENT_AND_TRANSITION.md)
---

Questions Assets Expansion - Raw Questions ASSETS

1. Define the target state first

The pipeline should produce three different things:

A. Raw asset

- Original DOCX.
- Immutable.
- Never edited in place.
- Preserves the source exactly as received.

B. Cleaned question

- Extracted question stem.
- Options.
- Correct answer, if determinable.
- Explanation/rationale, if available.
- Extracted visual asset.
- Normalized typography.
- Corrected obvious transcription/OCR errors.
- Explicitly records what was changed.

C. Internalized question-bank item

- Structured domain/question metadata.
- Curriculum/evaluation mapping.
- Difficulty/cognitive characteristics.
- Provenance.
- Verification status.
- Quality status.
- Version/history.
- Ready for the MVP's practice/simulation/remediation systems.

That separation is important because cleaning is not verification.


---

2. Establish provenance states

I recommend making provenance a first-class field rather than relying on filenames or documentation.

For example:

Status	Meaning

source_unverified	Asset claims/believes it derives from an official exam, but not independently verified
source_partially_verified	Some relationship to the official source has been established
official_verified	Corresponding official source has been independently confirmed
derived	Question has been materially transformed/paraphrased from a source
internal_generated	Created internally rather than derived from an external exam
rejected	Failed quality/provenance checks


For the current collection, I would initially classify essentially everything as:

derived + source_unverified

unless you have evidence that allows something stronger.

This prevents a future UI from accidentally saying something like “Pregunta oficial de convocatoria X” when what you actually know is “paráfrasis basada en material atribuido a convocatoria X.”


---

3. Build a source manifest before touching the questions

First pass should be inventory, not editing.

Create a manifest for every DOCX:

asset_id
filename
convocatoria
area
subject
program
version
source_type
claimed_origin
file_hash
created_at
page_count
question_count_estimate
image_count
extraction_status
provenance_status
quality_status
notes

And separately model the expected official asset set:

convocatoria
├── tabla_especificaciones_1
├── tabla_especificaciones_2
├── practica_oficial
└── examen_oficial

Then compare that expected matrix against what actually exists.

This gives you a coverage map:

- assets present
- assets missing
- assets duplicated
- assets with ambiguous convocatoria
- assets without matching Tabla
- assets whose claimed source cannot currently be confirmed

That missing-asset information is itself valuable.


---

4. Do not map questions directly to the current evaluation model

This is one of the most important safeguards.

You have an older/paraphrased question and a current evaluation framework containing Afirmación / Evidencia.

Those are not necessarily equivalent.

Instead, allow:

question
   ↓
candidate mapping
   ↓
mapping confidence
   ↓
human/system validation
   ↓
accepted mapping

A question should be able to exist without a mapping.

For example:

evaluation_mapping:
  status: "candidate"
  framework_version: "current"
  afirmacion: "A2"
  evidencia: "E2.3"
  confidence: 0.71
  rationale: "..."

Possible statuses:

- unmapped
- candidate
- validated
- conflict
- not_applicable

This solves your specific problem that some historical questions may genuinely have no direct Afirmación/Evidencia equivalent.

Don't force them into one.


---

5. DOCX extraction should preserve the visual question

Because the DOCX contains static visualization images, the extraction process should treat text and images as two linked streams.

For every question:

Question
├── stem
├── options
├── answer
├── explanation
├── images[]
│   ├── original image
│   ├── extracted image
│   └── image relationship/location
└── source location

The image should not merely become:

> [IMAGE]



because that destroys useful information.

Instead, preserve:

- original image
- image position
- question association
- image dimensions
- image hash
- optional generated accessibility description
- whether the image contains text
- whether the image is required to answer the question

That last field is particularly useful.

A question with a graph that is essential to solving it should behave differently from a question containing a decorative image.


---

6. Use a two-stage text cleanup process

Stage 1 — mechanical normalization

Automate things such as:

- whitespace normalization
- broken line joins
- Unicode normalization
- obvious DOCX artifacts
- duplicated paragraphs
- malformed numbering
- option-label normalization
- inconsistent punctuation
- extraction of embedded images
- removal of headers/footers
- page-number artifacts

Do not automatically rewrite mathematical content aggressively.

For example, distinguish:

2x + 3 = 7

from:

2x + 3 = ?

A cleanup engine should never silently alter semantic content.

Stage 2 — semantic review

Flag suspicious items for review:

- ambiguous stem
- contradictory options
- missing option
- duplicate option
- impossible answer
- no answer
- multiple plausible answers
- malformed mathematical expression
- suspicious image
- typo affecting interpretation
- question that depends on missing context
- mapping uncertainty

This creates a review queue rather than trying to automate judgment.


---

7. Corrections need an audit trail

Never simply replace a typo.

Store:

original_text
normalized_text
correction_type
correction_reason
confidence
review_status

For example:

original:
"Calcule el area del triangulo..."

normalized:
"Calcule el área del triángulo..."

change:
accentuation

semantic_change:
false

But if you change:

> 12 cm → 21 cm



that's fundamentally different.

It should become a high-severity change requiring explicit validation.

I would categorize corrections approximately as:

- formatting
- orthography
- punctuation
- transcription
- mathematical_notation
- semantic
- answer_key
- content_reconstruction

Only the first few should be candidates for automatic acceptance.


---

8. Build an intermediate canonical format

Do not make the application depend directly on DOCX structure.

Create a canonical question representation.

Something along these lines:

id:
source:
  asset_id:
  convocatoria:
  area:
  subject:
  program:
  version:
  source_type:
  provenance_status:

content:
  stem:
  options:
    - id:
      text:
  answer:
  explanation:

visuals:
  - id:
    asset:
    role:
    required_for_answer:

classification:
  topic:
  subtopic:
  difficulty:
  cognitive_level:

evaluation:
  framework_version:
  afirmacion:
  evidencia:
  mapping_status:
  mapping_confidence:

quality:
  status:
  issues: []

review:
  extraction:
  content:
  answer:
  mapping:

history:
  transformations: []

The important part is that source/provenance/history are part of the question, not external notes.


---

9. Separate "clean" from "approved"

I would introduce at least three quality gates:

Gate A — Extraction

> Did we correctly extract the source?



No semantic judgment yet.

Gate B — Question quality

> Is this a coherent, solvable question?



Checks:

- complete stem
- valid options
- answer exists
- visual available
- mathematical content intact
- no unresolved ambiguity

Gate C — Pedagogical/internalization

> Is it safe and useful to put into the learner-facing question bank?



Checks:

- valid answer
- appropriate explanation
- curriculum mapping
- difficulty classification
- provenance disclosure
- no unresolved quality issues

Only Gate C questions should enter the normal learner-facing pool.


---

10. Handle provenance in the actual product

This isn't merely metadata for developers.

It should influence the learner experience.

For example, internally:

provenance_status = source_unverified

could correspond to a UI label such as:

> Pregunta derivada de material histórico — fuente no verificada



Whereas:

official_verified

could say:

> Pregunta basada en material oficial verificado



This gives you a very important product distinction:

“official” ≠ “derived from an official-looking asset.”


---

11. Create a confidence model

I would give every internalized question several independent confidence dimensions rather than one global score.

For example:

source_confidence:     0.40
extraction_confidence: 0.98
answer_confidence:     0.92
mapping_confidence:    0.71
content_confidence:    0.94

Then you can make decisions programmatically.

For example:

source_confidence < threshold
    → don't call official

answer_confidence < threshold
    → don't publish

mapping_confidence < threshold
    → don't use for targeted remediation

content_confidence < threshold
    → human review

This is considerably safer than a single verified=true.


---

12. Treat missing Tablas as a separate research problem

Don't block extraction because a corresponding Tabla is missing.

Instead:

Question
   ↓
historical source metadata
   ↓
current framework mapping
   ↓
mapping confidence
   ↓
"no direct mapping" is valid

Then maintain a separate Source Recovery Backlog:

Convocatoria X
├── Practice PDF      ✓
├── Exam PDF          ?
├── Tabla A           ?
└── Tabla B           ?

When a missing Tabla is eventually found, you can re-run the mapping process against already-internalized questions.

That is another reason the pipeline must preserve raw provenance and versioned mappings.


---

13. Recommended implementation phases

Phase 1 — Asset inventory

Goal: know exactly what you have.

Deliver:

- manifest
- convocatoria matrix
- duplicate detection
- missing-source matrix
- asset hashes
- basic DOCX statistics

Do not modify questions yet.


---

Phase 2 — DOCX extraction

Goal: convert every DOCX into canonical structured data.

Deliver:

- question extraction
- options extraction
- image extraction
- question/image association
- source locations
- extraction diagnostics

Keep the original DOCX untouched.


---

Phase 3 — Automated cleaning

Goal: produce candidate clean questions.

Deliver:

- normalization
- obvious typo detection
- formatting correction
- mathematical notation checks
- duplicate detection
- suspicious-item flags

Everything changed is recorded.


---

Phase 4 — Quality review

Goal: establish question-level trust.

Review:

1. stem
2. options
3. answer
4. visual
5. explanation
6. semantic integrity

Result:

approved
needs_review
rejected


---

Phase 5 — Evaluation mapping

Goal: connect historical questions to the current framework.

For each question:

candidate Afirmación
candidate Evidencia
confidence
rationale
mapping status

Allow unmapped.


---

Phase 6 — Internalization

Only now convert approved questions into the application's operational question bank.

Connect them to:

- practice
- topic practice
- simulation
- remediation
- leveling plans
- retest
- analytics

But preserve the provenance metadata all the way through.


---

Phase 7 — Regression and deduplication

This becomes especially important once multiple convocatorias overlap.

Detect:

- exact duplicates
- near duplicates
- same question with changed numbers
- same question with changed wording
- same visual
- same underlying competency
- paraphrases of an existing internal question

You don't necessarily want to remove them all. Some are valuable as independent practice items. But they should be related, not accidentally treated as unrelated questions.


---

14. I would add a "Question Lineage" concept

This could become one of the strongest parts of your architecture.

Example:

Historical Asset
      │
      ├── Q-001
      │     └── cleaned version
      │
      ├── Q-002
      │     ├── cleaned version
      │     └── current-framework mapping
      │
      └── Q-003
            └── rejected

And later:

Q-001 historical
   ↓
Q-001 cleaned
   ↓
Q-001 internal
   ↓
Q-001 remediation usage
   ↓
learner analytics

This means you can always answer:

> Where did this question come from, what changed, why was it accepted, and where is it being used?



That's extremely valuable for an educational product.


---

15. Recommended repository organization

I would avoid mixing raw assets with processed content.

Something conceptually like:

project_docs/
  Raw question ASSETS/
      convocatoria/
          *.docx

question_bank/
  manifests/
  extracted/
  cleaned/
  reviewed/
  mappings/
  internalized/

question_assets/
  images/
      ...

question_lineage/
  ...

quality/
  review_queue/
  reports/

The exact structure can follow your existing architecture, but the raw → extracted → cleaned → reviewed → internalized lifecycle should remain explicit.


---

16. The most important rule

I would make this an explicit project invariant:

> Never increase provenance certainty as a side effect of cleaning.



Cleaning can establish:

> “This question is internally clean.”



It cannot establish:

> “This question was officially administered.”



Likewise, mapping can establish:

> “This question appears to assess Evidence E2.3.”



It cannot establish:

> “The historical exam used Evidence E2.3.”



Those are different claims.


---

Suggested MVP implementation order

Given that the six MVP sprints are already complete, I would make this the next development stream:

QBE-01 — Asset Inventory & Provenance
→ QBE-02 — DOCX/Visual Extraction Pipeline
→ QBE-03 — Canonical Question Schema
→ QBE-04 — Cleaning + Error Detection
→ QBE-05 — Human Review Workflow
→ QBE-06 — Evaluation Mapping
→ QBE-07 — Question Internalization
→ QBE-08 — Deduplication + Lineage
→ QBE-09 — Product Integration
