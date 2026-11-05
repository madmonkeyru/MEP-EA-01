# Recommended consolidated reply to Agents A, B, and C

Prepared for the user to review and send identically to all three agents. The agents' proposed answers are recommendations, not prior user approval. Sending the reply below establishes the chosen implementation scope; this document itself does not dispatch instructions to those separate agents.

---

## CONSOLIDATED DECISIONS v1 — applies to all three agents

Read this entire reply, including decisions primarily affecting other agents. It supplements the original three-agent instructions and resolves A1/A2, B1/B2, and C1/C2. Original exclusive file ownership and deferred shared-file integration remain binding.

### 1. Baseline, corrections, and delivery boundary

- Base `main` SHA: `75a70a07fb35b6c523ec99ab0959da254e436e16`. Verify that your branch starts there before changing files.
- Baseline inventory checked directly: 245 atomic items; 234 with `BXM` applicability: 125 geometry, 66 functions, 43 statistics. Agent B's 204/95-geometry figures need correction. Applicability tags and passing structural tests do not prove authorship, licensing, mathematical certification, or eligibility for a particular pool.
- Specification inventory: 71 evidence entries. Evidence codes repeat across domains; `A1.2` alone is not a unique key.
- Deliver this pass as independent, tested modules: P0 across the three agents, Agent A's focused content/visual/isomorphic slice, Agent B's associated assessment mechanics, and Agent C's local P1/P2 analytics/recommendation/reporting features described below.
- Comprehensive rich lessons for all 71 evidences and the 100+ authored-item pack remain future content expansion. All 71 receive navigable curriculum nodes and an honest content-availability status now.
- Cross-device sync, backend accounts, payment enforcement, AI tutoring, additional subjects, and institutional/tutor products are design/roadmap work only in this pass. Do not create pretend working services for them.
- Full route registration, shared-service changes, shared content ingestion, and end-to-end activation occur in a separate integration change after manual merging. A standalone module is not yet a shipped product journey.

### 2. A1 — Focused, measurable content slice

Choose the focused vertical slice, with these acceptance targets:

1. Structured browsing of all 71 official evidence entries with correct domain/affirmation context and canonical descriptions. Nodes without a full lesson must say so; placeholders must not appear complete.
2. At least one complete learning sequence in each of geometry, functions, and statistics. Include explanation, prerequisites/formulas, worked example, common mistakes, micro-quiz, and related practice. Include an alternative solution when pedagogically appropriate; do not force multiple methods onto every problem.
3. A minimum of 30 distinct authored items, with at least 10 per domain. Report base authored items separately from generated variants. Parameter substitutions do not count as new independent authored templates or increase the base-item target.
4. At least one deterministic isomorphic template per domain, with constrained parameter ranges, a stable template/family ID, independent answer verification, and distractor checks. Do not reuse official question wording or label an official-derived item as independently authored.
5. A coverage manifest identifying the exact domain-qualified evidence keys, lesson IDs, authored item IDs, template families, and review status. Record the chosen anchor set in your owned documentation before implementation; changes within your owned scope do not need another permission round.

Select anchors from the actual specification and existing concept links. The suggested clusters in A1 are examples, not authoritative mappings: in particular, functions A2 and A3 have different purposes. Do not attach a linear/quadratic lesson to an evidence merely because its code appeared in the question.

Thirty items is an initial slice, not evidence-wide diagnostic coverage. Identify missing diagnostic coverage explicitly instead of pretending that the new pack represents all 71 evidences.

### 3. A2 — Content verification and interactive visuals

Prioritize:

- Circle: center/radius controls, equation updates, and point-position classification.
- Sphere cross-section: plane distance from center and the resulting circular section, including tangent/outside cases. Use the correct geometric relation and validate parameter boundaries.

An oblique cylinder cutting-plane simulator is an optional extension after the two core activities pass verification. Do not implement arbitrary tilt by distorting an SVG without correct geometry. Reuse baseline renderers through owned wrappers wherever appropriate; shared visual components remain read-only.

Use repository-held specification/formula material as the baseline reference. Trace mathematical claims to source paths and check calculations through independent formulas or enumerated cases rather than only checking that the generator reproduces itself. Test KaTeX, unique correct options, distractor validity, and edge cases. A hypothesis about a common learner error may be authored as instructional guidance; do not call it empirically documented without a source.

Label content as authored and computationally checked where accurate. Human mathematical review remains a distinct status; automated tests cannot establish certification or guarantee zero errors. Unreviewed content must carry its actual status in the manifest and release handoff.

### 4. B1 — Diagnostic blueprint and pool separation

- Diagnostic target: 20 questions, approximately 30 minutes. The standard diagnostic uses an exam-style 30-minute limit; short practice sessions may use a separate configurable policy.
- Domain targets: 8 geometry / 8 functions / 4 statistics, approximating the 23/25/12 benchmark distribution.
- Soft marginal targets, subject to verified availability: cognitive levels 8 reproducción / 8 conexión / 4 reflexión; difficulty tiers 8 basic / 8 intermediate / 4 advanced. These are product heuristics, not official MEP diagnostic requirements. They are not a demand to fill every crossed evidence × cognitive × difficulty cell.
- Selection must be deterministic for the same seed, normalized pool, blueprint, and selection-policy version. Sort the pool stably and record the policy version.
- Exclude every item listed in the `2026-c2` official benchmark manifest from automated diagnostic, targeted practice, micro-quiz, and generated mock pools. Official-reference exam/review remains available separately and free.
- Default automated learning pools use items with explicit authored provenance and an appropriate review state. A BXM applicability tag alone is insufficient. Do not silently treat other official convocatorias as proprietary content.
- `allowOfficialFallback` defaults to false. Do not enable it automatically to fill shortages. If supported by the module, only a caller explicitly setting it may include permitted official material, and the resulting session must disclose exposure and cannot be labeled benchmark-unexposed. Normal integrated diagnostic/practice flows leave it false.
- Do not duplicate an item to fill a quota. Avoid repeating a template family within a diagnostic when sufficient families exist. Avoid previously seen families for retests when possible, and disclose unavoidable exposure.
- On shortage: relax soft cognitive/difficulty targets first; then return an explicit shortfall report with actual domain counts and missing coverage. Do not silently replace missing domains with an overrepresented domain. A partial set may run only as a clearly labeled limited diagnostic after the caller accepts that outcome. If no eligible items exist, return an actionable empty-pool state.
- Results must distinguish measured evidence from unmeasured evidence. A 20-item diagnostic cannot establish complete coverage or mastery across 71 evidences.

Agent B implements this against injected baseline-compatible providers and owned fixtures. Agent A supplies authored content later through integration. There must be no compile-time import from A's unmerged directory.

### 5. B2 — Study/exam policy and learner reasons

Study mode: no enforced countdown by default; hints, formula access, immediate feedback, explanations, and retries are available under explicit policy. Micro-quizzes use these mechanics through injected callbacks.

Exam mode: no hints, explanations, answer correctness, or interactive learning aids before final submission. Permit formula-sheet/calculator access only according to the configured exam policy; absence of hints does not mean an allowed formula sheet must be removed. Permit question navigation, answer changes, and review flags before submission. The official-reference exam reads its existing 150-minute limit and policy from the baseline manifest; it does not inherit the diagnostic's 30-minute limit.

Use a deadline and injected clock for timing, not countdown ticks as the source of truth. Timeout finalizes once; explicit submit and timeout cannot emit duplicate results. Unanswered final questions count as incorrect in the final assessment score, but are not submitted responses for evidence mastery. Export them separately as unanswered. An exam answer edited before final submission is a draft change, not a study retry; the final submitted answer is the first scored response.

For an incorrect response, use a supplied distractor/misconception mapping if available. Otherwise optionally invite one of these learner-reported reasons: formula selection, algebraic manipulation, arithmetic, graph reading, misread question, concept misunderstanding. Allow skip/unknown. Label learner reports as self-reported and authored mappings as authored interpretations, not certain diagnoses.

Export all first responses, including incorrect ones. Export retries and assisted learning as activity without overwriting the first response. A learner who answers wrong, reads an explanation, then retries must still have that original wrong response counted in the unassisted baseline if it was unassisted when submitted.

### 6. C1 — Transparent formative mastery, not a validated readiness model

Use configurable product heuristics with these initial defaults:

- A qualifying observation is a scored, unassisted first response to an item presentation: no hint, answer reveal, or solution exposure before that response. Correct and incorrect qualifying responses both count. Hint/explanation use after the response does not retroactively erase it.
- For each evidence, aggregate the most recent qualifying observation per independent item/template family within the preceding 30 days. Repeated versions from one template family contribute at most one observation to that evidence's window. For fixed items with no family, use their stable item ID. Missing hint/provenance metadata in imported legacy records means eligibility unknown, not automatically unassisted/authored.
- Require at least five distinct qualifying item families before assigning a mastery status to an evidence. Fewer means `insufficient_data`, with the actual numerator and denominator visible. The focused content slice may leave many evidences in this state; that is expected and must be represented honestly.
- At sufficient sample size: accuracy ≥75% = `mastered`; ≥60% and <75% = `in_progress`; <60% = `needs_reinforcement`. Compare exact ratios, not rounded display percentages. These labels describe observed practice performance, not statistical certainty. Five families is a conservative product floor relative to the suggested three, not scientific validation.
- Assisted/retried responses count toward learning activity and completion reports; report their accuracy separately. Do not blend eventual retry success into first-response accuracy.
- Benchmark responses may appear in a separate reference-exam history/breakdown. Keep official-reference performance separate from authored-practice mastery and label repeat exposure; do not imply that a practiced benchmark measures unseen exam readiness.
- Cognitive/difficulty/domain breakdowns include sample sizes. Distinguish item-level overall accuracy from evidence coverage and from averages across evidence. Do not equate an unmeasured evidence with zero accuracy or mastery.

Do not implement the proposed 40%/35%/25% readiness percentage in this pass. Its weights are unvalidated and its components are insufficiently defined. Instead show observed accuracy, measured evidence count/71, sufficiently sampled evidence count/71, and mastery-status distribution. An overall readiness state can say insufficient coverage; do not manufacture a numerical prediction.

Display: “Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP.” Avoid “official mastery index,” “statistically sound,” and “cheat-resistant” claims.

Progression: allow ordinary study at every difficulty. Recommend tier 2 after at least five independent qualifying families at tier 1 for the same evidence with ≥75% accuracy; similarly recommend tier 3 from tier 2. This is a recommendation, not a hard lock. Insufficient inventory must not trap a learner at a level. Use injected eligibility policies in Agent B's session engine.

### 7. C2 — Local delivery, queue, reports, and capabilities

Implement the dashboard, mastery policies, cognitive/difficulty breakdowns, queue, retest recommendations, a simple ordered study plan, seven-day report, streaks, capability model, and versioned local persistence. Advanced predictive analytics and backend-dependent functionality remain deferred.

Queue policy, in deterministic priority order:

1. Evidences with insufficient data receive an explicit calibration recommendation, separate from demonstrated weaknesses.
2. Among sufficiently measured evidences, prioritize weakest first-response accuracy, then known curricular weight, recent incorrect performance, and appropriate recommended difficulty.
3. Break ties with stable evidence/item keys. Prefer unseen families and avoid recently served items when alternatives exist. Return useful shortfall/empty states when none exist.

Official weights exist at specific levels in the specification; do not invent evidence-level weights or present a divided affirmation weight as an official evidence allocation. Document any internal equal-share approximation. Plans should point to available lessons/practice and identify content gaps rather than recommend nonexistent activities.

Seven-day report: current local calendar date plus six prior local dates. Compare with the preceding seven dates only when there is comparable data; use percentage points for accuracy changes. Streaks use `America/Costa_Rica`, with an injected timezone/clock for tests, and reflect completed learning activity. Label metrics consistently: response events, unique questions, sessions, and independent families are different counts.

Capability defaults:

| Capability | Free | Premium |
| --- | --- | --- |
| Official-reference benchmark and its review/results | Yes | Yes |
| Official specifications/resources, basic temario/reference/formulas | Yes | Yes |
| Initial diagnostic and basic domain/evidence results, including shortfalls | Yes | Yes |
| One sample complete lesson and sample micro-quiz per domain | Yes | Yes |
| Full authored lesson pack, interactive lessons, extended micro-quizzes | Sample access above | Yes |
| Extended authored practice, isomorphic practice, configurable mock sessions | Sample access above | Yes |
| Current-session correction/explanation for accessible activities | Yes | Yes |
| Longitudinal dashboards, personalized queue/plans, advanced remediation, weekly reports/streaks | No | Yes |

Persist the activity required for coherent local history for both tiers; gate premium presentation/features rather than deleting history or suppressing basic corrections. No billing integration, new prices, or server authorization is included. Client-side capability checks control presentation only.

Use namespaced keys under `bxm-mvp-progress:*`, schema versions, non-destructive reads, and defensive handling for malformed/unavailable storage. Preserve all baseline keys. Document legacy import/migration; imported records missing required eligibility metadata remain visible in history without silently entering mastery calculations. The integrator decides the single canonical production store.

### 8. Shared boundary semantics — no shared editable contract file

Keep equivalent boundary definitions inside each agent's own directories. No cross-branch imports. The integrator reconciles types and wires adapters later.

- Context: `programId: bxm`, `subjectId: matematica`, `specId: 02-2026`, `convocatoriaId: 2026-c2` when applicable. Spec and convocatoria IDs are distinct; do not normalize them into the same string.
- Domains: `geometry`, `functions`, `statistics`.
- Evidence identity: context + domain + raw code. Example stable key: `bxm/matematica/02-2026/geometry/A1.2`. Preserve raw official codes/descriptions alongside the key; never rewrite canonical baseline IDs. Affirmations require the same domain context.
- Items: preserve baseline identity and source mapping; new authored IDs use an A-owned namespace such as `bxm-authored-v1-*`. A numeric source ID and filename/code ID are not automatically interchangeable; providers must normalize them explicitly. Generated variants include a stable `familyId`, template version, parameter values, and seed.
- Attempt envelope: schema version, attempt/event ID, session ID, session kind, mode, UTC timestamp, item ID/family, domain-qualified evidence links, concept IDs, provenance/review state, cognitive level, difficulty, selected/correct option, correctness, response index, hint counts before response, exposure flags, and optional sourced misconception/learner-reason fields. Unknown metadata stays unknown.
- Session result: status (`completed`, `timed_out`, or `abandoned` as applicable), configured/actual counts, deadline/submission time, selected item IDs, answered/unanswered totals, first-response score, provenance/exposure summary, blueprint shortfalls, and attempt records.
- Progress storage deduplicates exact event IDs. Family aggregation limits repeated variants separately; it must not discard raw history. Multi-evidence links must not multiply a single item's contribution to domain/overall accuracy. Treat secondary links as contextual; where no defensible primary assessment target exists, report the mapping ambiguity and withhold definitive evidence mastery.
- Capability boundary: resolve symbolic capability names to explicit allowed/denied decisions and a reason. No implicit grants when a provider or metadata is absent.
- Navigation boundary: typed callbacks for opening a domain-qualified evidence/concept and requesting a session with explicit policy/item-provider inputs. A renders learning UI; B scores/runs sessions; C aggregates and recommends. None directly calls another unmerged module.

Record concrete interface examples in your owned handoff. Resolve ambiguities in owned adapters; shared changes remain deferred and documented.

### 9. Implementation authorization and handoff

When this consolidated reply is sent by the user, begin the approved work within your original owned paths. Do not seek repeated permission for routine choices already covered here. Report a genuine unresolved policy/ownership blocker and continue unaffected work.

Remain on your assigned branch from the agreed baseline. No agent modifies shared routes, services, types, registries, schemas, package files, lockfiles, or the coordination master. No importing sibling-agent modules or merging another branch. Existing files outside your ownership remain read-only.

Each owned `HANDOFF.md` must include scope delivered/deferred, changed paths, public entry points and boundary examples, exact test results, baseline failures, mathematical/content review status where applicable, fixtures versus production inputs, and concrete shared-file integration tasks with dependencies and acceptance checks. Do not claim a guarantee of mathematical correctness, conflict-free integration, or end-to-end product completion.

The user merges all three branches manually in any order. A later integration change applies the handoffs, reconciles canonical types/services/persistence, connects production content and routes, and verifies the complete learning journey.
