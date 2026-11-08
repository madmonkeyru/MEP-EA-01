# P2 — Content & Learning Expansion

Status: implemented on `p2milestone`, 2026-11-08; native device execution and editorial approval pending. See [execution evidence](../P2_EXECUTION.md).

## Authority and starting point

Read [INDEX](../INDEX.md) and the six [architecture documents](../architecture/) first. P1 implemented the three-item shared Web/Expo learner journey; its remaining native and editorial acceptance obligations carry forward. P2 activates existing content through shared TypeScript contracts rather than adding backend infrastructure or another architecture refactor.

## Scope

- Load 71 canonical BXM Matemática 02-2026 evidence nodes.
- Load all 30 proprietary authored development items and four existing lessons.
- Resolve evidence → concepts → lesson → authored practice relationships.
- Preserve source coverage, draft status and provenance without invented reviewer signoff.
- Navigate learning by evidence in both Web and Expo.
- Expand the assessment beyond the three-item fixture and support evidence-scoped practice.
- Preserve 67 scaffolded lessons as explicitly unavailable; show practice availability independently.
- Exclude official benchmark questions from diagnostic and practice pools.

## Acceptance gates

| Gate | Requirement | Implementation evidence |
| --- | --- | --- |
| P2.1 | Load all 71 canonical evidence nodes | Shared catalog and exact-source tests |
| P2.2 | Load 30 authored items | Canonical registry with retained source fields |
| P2.3 | Resolve evidence → lesson → practice | Catalog joins and targeted assessment tests |
| P2.4 | Preserve draft/provenance | Draft-only preview; normal publication rules unchanged |
| P2.5 | Isolate official benchmarks | Source packaging excludes them; compiler isolation tests |
| P2.6 | Evidence-driven learning navigation | Web/Expo browsers and result links |
| P2.7 | Expand beyond three items | 30-item development diagnostic and evidence practice |
| P2.8 | Explicit incomplete-content states | Missing lesson and no-practice states |
| P2.9 | Shared Web/Expo contracts | Shared catalog/compiler/runtime, typechecks and native exports |

Web execution is verified. Device execution remains pending. The full evidence and validation limits are recorded in [P2_EXECUTION](../P2_EXECUTION.md).

## Boundaries

Do not author the remaining 67 lessons, promote drafts to published, mix the official 60-item benchmark into practice, or add backend accounts, payments, sync or the full adaptive engine in this milestone. Source completion does not mean editorial approval. Reusing the authored pool does not establish independent mastery.
