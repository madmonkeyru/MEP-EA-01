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

# Agent C Handoff: Learner Progress, Recommendations, and Product Capabilities

**Program/Subject/Convocatoria:** BXM Mathematics 02-2026 (`bxm` / `matematica` / `02-2026` / `2026-c2`)
**Base main commit SHA:** `75a70a07fb35b6c523ec99ab0959da254e436e16`
**Governing specification:** `Plan MVP Math consolidation.md` & `CONSOLIDATED DECISIONS v1`
**Branch:** `jules-16722539515338701465-72cc0a06` (or `codex/bxm-progress`)
**Status:** Independent Module Delivered & Verified (37/37 tests passing; product activation deferred to integration)

---

## 1. Scope Delivered vs. Deferred

### Delivered in this Pass (P0 + P1 + P2 local):
1. **Core Domain & Measurement Policies (`src/features/bxm-progress/domain/`):**
   - Canonical qualified evidence keys (`bxm/matematica/02-2026/{domain}/{code}`).
   - Qualifying attempt filter: scored, unassisted first responses (responseIndex === 0, hints === 0, no previous explanation seen) within a 30-day window.
   - Template family aggregation: collapses multiple variants to the single most recent observation per family within 30 days.
   - Conservative evidence mastery threshold: minimum 5 distinct qualifying families required. Fewer = `insufficient_data` with visible numerator/denominator (e.g., `3/5 familias para calibrar`).
   - Exact-ratio status evaluation: $\ge 75\%$ `mastered`, $60\% - 74.999\%$ `in_progress`, $< 60\%$ `needs_reinforcement`.
   - Separation of official benchmark items from authored practice mastery.
   - Cognitive level (`reproducción`, `conexión`, `reflexión`) and difficulty tier (1, 2, 3) performance breakdowns with sample sizes.
   - Formative readiness overview featuring the mandatory disclaimer:
     > *"Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP."*
   - Progression recommendations: recommends tier 2 after 5 qualifying tier 1 families with $\ge 75\%$ accuracy on that evidence (and tier 3 from tier 2).

2. **Personal Practice Queue & Remediation Engine (`src/features/bxm-progress/recommendations/`):**
   - Queue prioritization engine: strictly prioritizes calibration of unmeasured/insufficient evidences before weaknesses, followed by lowest accuracy, official spec weights, recent incorrect attempts, and target difficulty tier.
   - Structured study plan generator with ordered steps and focus summaries.
   - Retest recommendation evaluator with threshold criteria.

3. **Analytics, 7-Day Reports & Streaks (`src/features/bxm-progress/analytics/`):**
   - 7-day rolling report covering reference date plus 6 prior calendar dates in `America/Costa_Rica`.
   - Explicit separation of metrics: response events, unique questions, completed sessions, and independent families.
   - Consecutive and longest active streak calculator using Costa Rica calendar days and injectable clocks.
   - Prior-week percentage point comparisons when comparable history exists.

4. **Product Capability Matrix & Injectable Provider (`src/features/bxm-progress/capabilities/`):**
   - Explicit Free vs. Premium capability matrix adhering to the principle: *official benchmark, specifications, diagnostic, basic reference, and sample lessons are 100% free; longitudinal analytics, queues, and advanced remediation are premium presentation gated*.
   - Injectable `CapabilityProvider` returning explicit `{ allowed: boolean, reason?: string }` decisions.

5. **Isolated Persistence Adapter (`src/features/bxm-progress/storage/`):**
   - LocalStorage adapter namespaced under `bxm-mvp-progress:*` (e.g. `bxm-mvp-progress:v1:events`).
   - Event deduplication by `eventId`.
   - Legacy migration adapter importing baseline `mep_ea_attempts` tagged as `provenance: 'legacy_unknown'`, ensuring historical records are visible in history but excluded from mastery indices.

6. **UI Dashboard Component (`src/features/bxm-progress/ui/BxmPreparationDashboard.tsx`):**
   - Tabbed view: Resumen General, Dominio por Evidencia (71 spec evidences), Cola de Práctica, Racha e Informes (7 Días), Historial de Intentos.
   - Presentation gating callout for Free tier users.
   - Empty, partial, and populated preview states.

### Deferred Scope (Roadmap & Future Phases):
- **Cross-device synchronization & backend accounts:** Architecture documented below in Section 7; deferred pending user auth & database infrastructure.
- **AI Tutoring Layer:** Architecture documented below in Section 8; deferred until deterministic curriculum graph is integrated.
- **Institutional & Teacher/Tutor Dashboards:** Multi-tenant classroom aggregation deferred.
- **Payment Gateway / Billing Integration:** Client-side presentation gating delivered; server-side token enforcement deferred.
- **Other Programs/Subjects:** Scope restricted to BXM Mathematics 02-2026.

---

## 2. Directory Structure and Files Changed

All files created strictly under the assigned directories:

```
src/features/bxm-progress/
├── domain/
│   ├── types.ts                    # Canonical boundary contracts & attempt envelope
│   ├── qualifyingObservation.ts    # Unassisted first response filter & 30-day window
│   ├── masteryEngine.ts            # Evidence & domain aggregation, cognitive/difficulty summaries
│   └── index.ts
├── recommendations/
│   ├── recommendationsEngine.ts    # Queue ranking, structured study plans, retest rules
│   └── index.ts
├── analytics/
│   ├── analyticsEngine.ts          # 7-day rolling reports, Costa Rica streaks, metrics separation
│   └── index.ts
├── capabilities/
│   ├── capabilityModel.ts          # Free/Premium matrix, capability definitions, injectable provider
│   └── index.ts
├── storage/
│   ├── progressStorage.ts          # Namespaced localStorage, deduplication, legacy import
│   └── index.ts
├── ui/
│   ├── evidenceCatalogFixture.ts   # 71 official BXM evidences fixture
│   ├── BxmPreparationDashboard.tsx # Comprehensive preparation dashboard UI component
│   └── index.ts
└── __tests__/
    ├── masteryEngine.test.ts
    ├── recommendationsEngine.test.ts
    ├── analyticsEngine.test.ts
    ├── capabilityModel.test.ts
    ├── progressStorage.test.ts
    └── BxmPreparationDashboard.test.tsx

scripts/bxm-progress/
└── verify-progress.mjs              # Verification CLI script

project_docs/bxm-mvp/agent-c/
└── HANDOFF.md                       # This document
```

---

## 3. Public Entry Points & Boundary Contracts

### Attempt Envelope Recorded from Sessions:
```typescript
interface AttemptEvent {
  schemaVersion: '1.0.0';
  eventId: string;
  sessionId: string;
  sessionKind: 'diagnostic' | 'practice_topic' | 'practice_evidence' | 'simulation_benchmark' | 'simulation_mock' | 'micro_quiz';
  mode: 'study' | 'exam';
  timestamp: string; // ISO 8601 UTC
  itemId: string;
  familyId?: string; // Stable template family ID
  primaryEvidenceKey: string; // e.g. "bxm/matematica/02-2026/geometry/A1.1"
  secondaryEvidenceKeys?: string[];
  domain: 'geometry' | 'functions' | 'statistics';
  provenance: 'official_reference' | 'authored_mastery' | 'isomorphic_generated' | 'legacy_unknown';
  reviewStatus?: 'computationally_checked' | 'human_reviewed' | 'unreviewed';
  cognitiveLevel: 'reproduccion' | 'conexion' | 'reflexion';
  difficulty: 1 | 2 | 3;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseIndex: number; // 0 = first attempt
  hintsUsedBeforeResponse: number;
  exposureFlags?: {
    isBenchmarkItem: boolean;
    hasSeenExplanationBefore: boolean;
  };
  misconceptionCode?: string;
  learnerReportedReason?: string;
}
```

### Main Exported Services:
- `computeEvidenceMasteryRecords(evidenceCatalog, events, nowUtc)`: Computes evidence-level mastery.
- `computeDomainMasterySummaries(evidenceRecords)`: Computes domain-level summaries.
- `computeCognitivePerformance(events, nowUtc)`: Computes cognitive level breakdowns.
- `computeDifficultyPerformance(events, nowUtc)`: Computes difficulty tier breakdowns.
- `computeReadinessOverview(evidenceRecords, events, nowUtc)`: Returns formative readiness summary and disclaimer.
- `generatePersonalPracticeQueue(evidenceRecords, evidenceCatalog, options)`: Returns prioritized queue.
- `generateStructuredStudyPlan(evidenceRecords, evidenceCatalog)`: Returns ordered study plan.
- `evaluateRetestRecommendation(evidenceRecords, totalAuthoredResponses)`: Returns retest advisement.
- `generateSevenDayReport(events, referenceDateUtc, timeZone)`: Generates 7-day rolling report.
- `calculateActivityStreak(events, referenceDateUtc, timeZone)`: Computes Costa Rica streaks.
- `createCapabilityProvider(initialTier)`: Creates capability provider for Free/Premium.
- `BxmProgressStorage`: Namespaced storage adapter.
- `BxmPreparationDashboard`: Main UI component.

---

## 4. Test Verification Results

All tests run via `./node_modules/.bin/vitest run src/features/bxm-progress/`:

| Test Suite | Tests Passed | Status |
| :--- | :---: | :---: |
| `masteryEngine.test.ts` | 15 / 15 | ✓ PASS |
| `recommendationsEngine.test.ts` | 6 / 6 | ✓ PASS |
| `analyticsEngine.test.ts` | 7 / 7 | ✓ PASS |
| `capabilityModel.test.ts` | 3 / 3 | ✓ PASS |
| `progressStorage.test.ts` | 3 / 3 | ✓ PASS |
| `BxmPreparationDashboard.test.tsx` | 3 / 3 | ✓ PASS |
| **Total Agent C Tests** | **37 / 37** | **✓ 100% PASS** |
| **Repository-wide Vitest** | **188 / 188** | **✓ 100% PASS** |
| **Linter (`oxlint`)** | 0 errors, 0 warnings | **✓ CLEAN** |
| **Compiler (`tsc -b`)** | 0 errors | **✓ CLEAN** |

---

## 5. Persistence Decisions & Migration Proposal

1. **Namespace Separation:** All new progress events and profile metadata are stored under `bxm-mvp-progress:*`, specifically `bxm-mvp-progress:v1:events`.
2. **Non-Destructive Coexistence:** Existing keys `mep_ea_attempts`, `mep_ea_user`, `mep_ea_telemetry_events`, and `mep_ea_subscription_tier` are never overwritten or cleared.
3. **Legacy Migration Adapter:**
   - The method `storage.importLegacyBaselineAttempts()` reads baseline `mep_ea_attempts` and transforms existing session responses into `AttemptEvent` objects.
   - Critically, imported events are assigned `provenance: 'legacy_unknown'`. Under the measurement policy, these events appear in history but are ignored during mastery calculations to prevent uncalibrated, unassisted-assumption contamination.
4. **Integrator Recommendation:** During integration, the shared `storageService.saveResult()` can be updated to emit an `AttemptEvent` for each response into the canonical store.

---

## 6. Concrete Deferred Integration Tasks

When the manual branch merge occurs, the later integrator should execute the following tasks:

| Task ID | Component | Affected Files | Proposed Action | Acceptance Check |
| :--- | :--- | :--- | :--- | :--- |
| **INT-C01** | Routing & Navigation | `src/services/navigation.ts`, `src/App.tsx` | Add route parameter `tab: 'progreso'` or subview in `SubjectHubPage` / `LandingPage` rendering `<BxmPreparationDashboard />`. | Clicking "Mi Progreso" or visiting `#progreso` opens the dashboard. |
| **INT-C02** | Session Event Sink | `src/services/learningSession.ts`, Agent B's session engine | Hook session completion and response events to call `BxmProgressStorage.recordEvents()`. | Responses in practice or exam sessions immediately appear in dashboard history and update mastery. |
| **INT-C03** | Live Catalog Provider | `src/services/dataService.ts`, `content/programs/bxm/` | Replace `evidenceCatalogFixture.ts` with live evidence catalog loaded from `content/programs/bxm/matematica/specs/02-2026.json`. | All 71 official evidences resolve directly from the specification JSON. |
| **INT-C04** | Subscription Hookup | `src/services/subscriptionService.ts` | Wire `subscriptionService.getTier()` to the `CapabilityProvider` in the dashboard. | Toggling between Free and Premium via the existing app header updates dashboard gating live. |
| **INT-C05** | Inventory Availability Provider | Agent A's authored content manifest | Pass live authored item counts into `generatePersonalPracticeQueue(..., { availableInventoryByEvidence })`. | Queue accurately labels whether an authored exercise is currently in the bank or planned. |

---

## 7. Extension Architecture: Cross-Device Accounts & Cloud Synchronization (Roadmap)

### Motivation
Currently, progress is persisted in the browser's `localStorage` under `bxm-mvp-progress:v1:events`. For students switching between desktop, tablet, and mobile, a cloud-backed sync protocol is required.

### Proposed Architecture
1. **Event Sourcing Protocol:**
   - The client models attempts as immutable, append-only `AttemptEvent` records with deterministic UUIDs (`eventId`).
   - Sync endpoint: `POST /api/v1/progress/sync` accepting `{ lastSyncedEventId?: string, events: AttemptEvent[] }`.
   - The server deduplicates incoming events by `eventId` (idempotent upsert).
   - The server returns `{ serverEvents: AttemptEvent[], latestSyncCursor: string }`.
2. **Conflict-Free Merge:**
   - Because events are strictly timestamped and append-only, there are no merge conflicts.
   - Client merges `serverEvents` into local storage and recalculates mastery deterministically using `computeEvidenceMasteryRecords`.
3. **Offline-First Support:**
   - Client queues pending events locally in IndexedDB / LocalStorage if offline.
   - A background sync worker flushes the queue upon reconnection.

---

## 8. Extension Architecture: AI Tutoring & Misconception Diagnosis Layer (Roadmap)

### Motivation
Plan MVP Section 16/17 mentions an eventual AI tutor. As agreed in CONSOLIDATED DECISIONS v1, the deterministic mathematical content graph must remain the source of truth, and the AI layer must sit strictly on top of it.

### Proposed Architecture
1. **Deterministic Context Injection (Grounding):**
   - The AI agent must never hallucinate answers or generate unverified math problems.
   - Input context to LLM:
     ```json
     {
       "evidence": "bxm/matematica/02-2026/geometry/A1.1",
       "itemQuestion": "...",
       "studentChoice": "C",
       "correctAnswer": "B",
       "misconceptionCode": "MIS-CIRC-SIGN-ERROR",
       "officialFormulas": ["(x-h)^2 + (y-k)^2 = r^2"],
       "studentMasteryStatus": "needs_reinforcement"
     }
     ```
2. **Socratic Guidance Prompting:**
   - Prompt instructions: *"Act as an encouraging Costa Rican math tutor. The student chose C because they confused the sign in $(x-h)$. Do not reveal the final answer immediately; ask them to inspect the coordinates of the center $(h, k)$."*
3. **Guardrails & Boundaries:**
   - Prohibit out-of-syllabus topics.
   - Strictly anchor explanations to official MEP formulas from `content/library/math/`.

---

## 9. Extension Architecture: Institutional & Teacher Dashboards (Roadmap)

### Proposed Architecture
1. **Group/Classroom Hierarchy:**
   - `Organization` (e.g., CTP / Liceo Nocturno) $\to$ `Cohort` (e.g., BXM 2026-II Sección 11-1) $\to$ `Learner`.
2. **Aggregated Group Analytics:**
   - Anonymized aggregate mastery: `% of students mastering each of the 71 evidences`.
   - Cohort Heatmap: identifies systemic class-wide weaknesses (e.g., "78% of students struggle with A4.2 sphere sections").
   - Targeted Assignment Generator: allows teachers to push a curated practice queue to all students in a group.
