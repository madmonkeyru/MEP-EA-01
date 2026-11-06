# QBE-04: Question Cleaning & Normalization Audit Report

**Generated:** 2026-11-06T00:31:46.721Z
**Total Extracted Questions:** 564
**Total Cleaned Questions:** 564
**Total Recorded Transformations:** 1235
**Questions Unchanged:** 9
**Questions Requiring Review:** 564

## Transformations by Category
| Category | Count |
|---|---|
| Formatting | 524 |
| Whitespace | 282 |
| Unicode Normalization | 227 |
| Mathematical Notation | 202 |
| Orthography | 0 |
| Punctuation | 0 |
| Semantic Correction | 0 |
| Answer Key Correction | 0 |

## Review Flags Distribution
| Review Flag | Affected Questions | Notes |
|---|---|---|
| `missing_answer_key` | 564 | Pending official human answer verification |
| `incomplete_options` | 219 | Less than 4 multiple-choice options extracted |
| `ambiguous_math` | 75 | Preserved unverified combining symbols (e.g. overlines) |
| `missing_visual` | 5 | Stem references diagram without attached image |
| `semantic_change_candidate` | 0 | Automated check flagged potential meaning change |

## Core Architectural Invariants
- **Non-destructive:** Original stem (`stem_raw`) and options (`text_raw`) remain 100% recoverable in every item JSON.
- **Audit Trail:** Every single modification is preserved under `history.transformations[]`.
- **Provenance Invariance:** `provenance_status: source_unverified` is preserved across all items regardless of cleaning score.
