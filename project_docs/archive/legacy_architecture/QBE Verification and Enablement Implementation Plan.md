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

# QBE verification and enablement implementation plan

Date: 2026-11-06  
Scope: the 27 cleaned source sets in `content/qbe/cleaned`, with evidence from `project_docs/Raw questions ASSETS`.

Enable every verified, usable question and withhold only questions with substantive defects. Deliver repaired content, independently verified answers and explanations, faithful rendered visuals, and working access through the existing BXM practice flow. Release eligible questions incrementally; an unresolved question must not hold back the rest of its set.

This document is an implementation plan. It does not approve questions or authorize a claim that their mathematics or visuals have already been fully verified.

## Starting evidence

The existing [readiness report](../content/qbe/manifests/CONTENT_QA_REVIEW.md) establishes the following baseline:

| Finding | Baseline | Implementation consequence |
|---|---:|---|
| Cleaned files | 27 | Reconcile and review every source set |
| Extracted records | 564 | Account for every occurrence before and after repairs |
| Unique IDs | 541 | Do not treat record count as genuine question count |
| Missing answer keys | 564 | Independently solve questions and populate verified keys |
| Missing explanations | 564 | Supply concise, checked solutions using existing fields |
| Records with no structured options | 38 | Restore question boundaries and alternatives |
| Duplicated IDs | 8, affecting 31 records | Reattach fragments and resolve identity using source numbering |
| Three-option records | 181 | Preserve legitimate A–C questions; correct incompatible four-option assumptions |
| Distinct linked images | 168 | Inspect semantic correctness; existing file/hash checks are insufficient |

The previous review established release blockers and checked asset integrity. It did **not** complete mathematical, distractor, diagram or rendered-layout certification. That work remains part of this implementation.

The cleaned records are staging data. Changing `quality.status` alone does not enable them in the application: `src/services/dataService.ts` currently loads the atomic bank and registered legacy sets, without converting cleaned QBE records into playable questions.

## Implementation boundaries

- Preserve raw DOCX files, extracted source evidence, genuine source IDs, source option ordering and provenance.
- Use existing canonical fields, transformation history, review notes, lifecycle services, item format, manifest and renderer.
- Correct content only from source evidence or independently established mathematics. Record semantic and answer-key changes explicitly.
- Keep `source_unverified` unless independent evidence supports a stronger provenance designation. Content verification is not proof of official origin.
- Do not add a QA dashboard, admin queue, reporting feature, new review system or schema redesign.
- Use small extensions to existing validation and loading paths only where necessary to publish this content correctly.
- Cosmetic issues and nonessential metadata do not prevent release. Unknown or incorrect mathematics, missing scoring data and essential visual defects do.

## 1. Reconcile source questions and repair extraction defects

Work one source DOCX and its cleaned file at a time. Begin with the 2025-c1 geometry set to exercise three-option support and diagram review, then the 2025-c1 statistics set to address the confirmed missing table. Process the remaining sets in a stable order by convocatoria and area. This is a review order, not a claim that either pilot is already safe.

1. Compare source question numbering, paragraphs, tables, numbered statements, shared instructions and images against every cleaned record. Inspect source page layout wherever placement establishes context or option association.
2. Restore statement fragments to their parent questions. A statement numbered `1` or `2` inside a question must not become a new question merely because it matches the extractor's start pattern.
3. Preserve each genuine source question ID. For duplicate occurrences, identify the genuine parent and retain an occurrence-level reconciliation in the existing review report: source file, old array location, destination ID and reason. Do not rename fragments into invented questions or delete evidence.
4. Restore missing tables, options and shared context. Specifically restore the three component rows in `bxm-raw-2025-c1-statistics-1-q43` before solving it.
5. Associate each diagram with its actual question or option. The current lack of per-option asset links requires source inspection; do not assume image order proves option order.
6. Update cleaned counts to the reconciled genuine question count. Keep raw/extracted evidence intact and document why counts changed. Neither 564 nor 541 is a target number of playable questions.

If extraction code is changed, limit it to demonstrated defects in `src/services/qbe/docxExtractor.ts`. Add regression cases to the existing extractor tests for numbered statements, table rows, shared-context ranges and image alternatives. Do not regenerate the whole cleaned bank over reviewed answers: the current cleaning runner recreates canonical records from extraction and can erase manual review work.

**Exit condition:** every original record is reconciled to a genuine question, a documented fragment or an unresolved blocked occurrence; every release candidate has a stable unique identity and its essential source content.

## 2. Verify mathematics, answers and explanations

For every reconciled question, work through the entire chain: prompt → supplied data → independent solution → all alternatives → designated answer → explanation.

1. Solve independently before consulting any source answer annotation. Check units, signs, restrictions, endpoints, rounding, graph relationships and the exact requested quantity.
2. Evaluate every alternative. Exactly one must satisfy a single-answer question. Investigate apparent ambiguities against the complete source and visual before blocking.
3. Populate `content.detected_answer` with the verified existing option letter. Preserve option order. No guessed keys, first-option defaults or confidence-based automatic approval.
4. Write a concise solution in `content.explanation_cleaned`. Preserve `explanation_raw`; where the source has no explanation, distinguish the authored reasoning in history/reviewer notes.
5. Record any prompt correction, restored data or key addition in existing transformation history. Explain the mathematical basis of substantive corrections.
6. Use calculation tools for arithmetic, roots, probabilities, statistics and geometric measurements when useful. Computation supplements inspection of the premise and distractors.

The previously solved examples are useful cross-checks, not substitutes for review: 2021-c1 geometry q01 gives D; 2022-c1 geometry q01 gives C; 2025-c1 geometry q02 gives B; and the restored 2025-c1 statistics q43 gives C (83).

**Exit condition:** each candidate has a uniquely verified answer and a materially correct explanation. Unrecoverable missing data, multiple valid answers or unresolved correctness questions remain explicit blockers.

## 3. Verify visuals and actual presentation

Inspect every essential diagram, including option diagrams and visuals whose necessity was missed by keyword flags. The existing `missing_visual` and `ambiguous_math` flags are leads, not final judgments.

1. Read coordinates, intercepts, slopes, scales, tick labels, inequalities, curve endpoints, dimensions, angles, shading and legends against the prompt and independently solved answer.
2. Reconstruct required production visuals with the existing SVG composites and `visual_spec` conventions. Use source raster assets as review evidence; preserve the current architecture's vector presentation convention.
3. Use existing labelled `multi_view_grid` views for graphical alternatives, preserving A–C or A–D association. A visually unlabelled collection of images is insufficient when the student must select a letter.
4. Preserve shared context with the existing group format where appropriate. Verify that every dependent question receives the intended context without leaking unrelated instructions.
5. Render each release candidate using the actual `TextRenderer` and `VisualRenderer` in its question and answer-review contexts. Check formulas, fractions, radicals, exponents, tables, clipping, labels and scrolling at desktop and narrow mobile widths. Inspect diagrams in supported light and dark themes.
6. Correct material defects; record cosmetic imperfections without withholding the question. Do not substitute an approximate redraw that changes the problem.

**Exit condition:** every required production visual faithfully represents the mathematics and all candidate questions are readable in the actual application. Asset existence or a passing component test alone does not satisfy this condition.

## 4. Make narrow compatibility changes

Apply these changes before publishing the pilot, without weakening correctness gates:

| Existing location | Required change | Verification |
|---|---|---|
| `src/services/qbe/qualityReview.ts` | Accept legitimate three- or four-option questions; retain nonempty stem and substantive visual checks | Existing evaluation-review tests cover both counts |
| `src/services/qbe/cleaners/reviewFlagger.ts` | Stop classifying A–C as incomplete solely because D is absent | Existing cleaning tests retain warnings for genuinely missing alternatives |
| `src/services/qbe/contentLifecycle.ts` | Align parsed-stage option prerequisites with verified A–C/A–D content | Lifecycle tests reject missing options and preserve review/approval requirements |
| `src/services/qbe/publicationValidator.ts` | Require a supported, unique set of option keys, nonempty option content and an answer that exists among those options | Existing publication tests cover three/four options, absent answer target and duplicate labels |
| `src/types/index.ts`, `content/item.schema.json`, applicable legacy schema | Make D optional for general BXM items while requiring A, B and C and forbidding unknown labels | Both three- and four-option release items type-check and validate |
| `scripts/ingest-validate-content.mjs` | Align general item checks with legitimate A–C content | Existing four-option authored-pack constraints remain where that pack requires them |

Inspect consumers before editing them. `TestShell` and results rendering already normalize existing options; verify keyboard selection, scoring and feedback for A–C. Avoid routing imported questions through the proprietary authored-item adapter in `src/features/bxm-integration/contracts.ts`, whose provenance and four-option assumptions belong to a different content path.

Unmapped evaluation metadata remains a warning for general practice. Do not force invented evidence links to obtain a pass. A session explicitly filtered by evidence must include only items whose mappings support that filter.

**Exit condition:** valid A–C questions can pass the existing publication and runtime contracts; malformed questions and missing/incorrect keys still fail.

## 5. Approve and publish eligible questions into existing sets

Use one named practice set per source asset, preserving its convocatoria and area. Partial source sets must be labelled as practice material; do not present an area subset as a complete historical exam.

1. Update existing review fields only for work actually performed. Set content and answer review flags after semantic verification. Record mapping review separately without converting a candidate mapping into validated by default.
2. Record reviewed and approved signoffs using the existing lifecycle types and manager, with truthful reviewer identity, timestamp and scope. `gate_b_quality_passed` is structural coherence; `gate_c_internalization_passed` requires successful verification and playable conversion. Do not set all flags in bulk before their prerequisites pass.
3. Convert only approved, blocker-free canonical questions into the existing `Item` representation. Map stem, options, answer, explanation, visual specification, groups and source metadata explicitly. Canonical approval is necessary but is not runtime publication.
4. Keep canonical IDs unchanged. Allocate stable collision-free numeric runtime IDs and unique `item-qbe-...` codes once, using the current maximum across existing runtime content. Persist the canonical-to-runtime correspondence in the existing review report and item source metadata. Never derive IDs from array indexes or regenerate them on each load.
5. Write released set bundles under `content/bxm/matematicas/` with their actual enabled counts and register them in the BXM subject's existing `content/manifest.json` sets. Extend `dataService.ts` to load those registered bundles through its existing set-loading facilities, including the synchronous default initialization path where needed.
6. Include the released QBE items in the existing BXM practice pool exactly once. Verify `getAllItems`, `getItemsBySet`, `getItemById` and the decoupled index. Registering a set alone is insufficient because the current BXM all-items getter prefers atomic items.
7. Keep unapproved questions exclusively in staging. Do not copy them into eagerly loaded atomic directories or registered release bundles. A partial set contains only enabled questions and reports the available count honestly.
8. Move a question to published only after the release bundle is registered and runtime checks pass. Do not change existing official simulation blueprints as a side effect of practice publication.

An optional complete historical simulation is a later release unit within this work: assemble it only when all source areas and expected questions are recovered and verified. Apply `ExamCompletenessValidator` before declaring completeness. Missing areas, blocked questions or unverified required coverage prevent a complete-exam claim, while eligible questions remain available in practice.

**Exit condition:** approved questions are selectable, answerable, scored correctly and reviewable in the app; blocked questions are unreachable through practice, lookup, assembly and registered sets.

## 6. Validate each release and reconcile coverage

Run the relevant existing checks after each meaningful batch:

```powershell
node --experimental-strip-types scripts/qbe/run-publication-validation.ts
npm test -- src/tests/qbe
node scripts/ingest-validate-content.mjs
npm test -- src/services/dataService.test.ts src/services/testEngine.test.ts src/components/test/TestShell.test.tsx
npm run build
```

The publication runner is diagnostic: its current successful process exit does not mean all questions are eligible. Read per-item verdicts and compare eligible IDs to the release bundles. The whole staging corpus may legitimately remain partly ineligible.

Extend existing tests for actual behavioral risks: exclusion of blocked QBE items, collision-free stable identities, set and all-pool membership without duplication, correct A–C scoring, restored shared context, graphical option association, and persisted answer-review behavior. Run the full existing suite once for the final integrated release; repeat checks only for changes or unresolved failures.

For each source set, update the existing QA report with genuine recovered questions, enabled questions, clean/non-blocking/blocker counts, merged fragments and unresolved occurrences. Reconcile these categories back to all 564 original record occurrences. Do not silently count removed fragments as reviewed playable questions.

Retain exact issue, mathematical impact and required correction for each blocked question. Keep the original readiness result as historical baseline and append the new review disposition; do not erase the evidence that prompted repairs.

## Release units and completion criteria

| Release unit | Concrete result | Gate |
|---|---|---|
| Pilot geometry set | Source reconciliation, verified answers/explanations, vector diagrams, working three-option practice | Full item verification and actual UI inspection |
| Pilot statistics set | Restored table/context, independently checked statistics, correct rendering and scoring | Same item-level gate |
| Remaining 25 source sets | Incremental publication of every eligible question | Each question passes independently; blockers do not hold back peers |
| Final reconciliation | Every original occurrence accounted for; all eligible questions reachable; exact exceptions documented | Existing validation, final tests and build pass |

Completion requires all reconciled genuine questions to have a final disposition, full logical-chain and visual review for every enabled question, no known material defects in the released pool, stable identities, accurate set counts and no omitted source occurrences. No number of enabled questions is promised before that verification.

Report **GREEN-LIT FOR USE** when all genuine reviewed questions are usable and enabled, **GREEN-LIT WITH BLOCKED EXCEPTIONS** when the playable release is safe and exact exceptions remain withheld, or **NOT READY** if no safe playable release is available.

For rollback, remove the affected question from its released bundle and update counts; preserve its canonical record, runtime ID allocation and review history for correction. If an entire release must be reverted, revert that content/registration change together so all-pool selection cannot continue serving withdrawn items. Existing attempts retain their original identities.

## Implementation completion — 2026-11-06

Completed the pilot sets and all remaining supplied sets. The reconciled bank contains 536 genuine questions: 516 enabled across 27 registered practice sets and 20 withheld for documented substantive defects. Dispositions are 469 clean, 47 with non-blocking findings, and 20 blockers. All 564 original extracted occurrences are accounted for (535 retained questions and 29 merged fragments), with one additional implicit source question recovered. The 27 raw DOCX assets remain unchanged.

The final question-level record, exact blocked exceptions and required corrections are in `content/qbe/manifests/CONTENT_QA_REVIEW.md` and its JSON companion. The initial assessment is preserved separately. Existing validation reports 821 runtime items, 14 blueprints and zero errors or warnings. The full suite passed 355 tests; all 16 affected tests passed again after the final content addition. Build, all-question desktop/mobile rendering, practice scoring, reload persistence, results submission, source hashes and recovery idempotence passed.

Final disposition: **GREEN-LIT WITH BLOCKED EXCEPTIONS**. These are attributed historical practice sets; incomplete source coverage and unverified official provenance are not represented as complete official examinations.
