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

# Consolidation execution record

Date: 2026-11-07 (America/Costa_Rica).
Source: [Plan_Exe.md](../../Plan_Exe.md).

## Phase 0 decisions

- Target engine: SessionRunner, with the official reference content isolated from mastery measurement. Existing legacy sessions must remain readable during the later migration.
- Target navigation: Programas → Materia → Inicio, Aprender, Practicar, Simular, plus Mi progreso. Recursos and Calendario remain available globally. Navigation retirement is still pending.
- Confirmed by the user: guided and legacy practice require Pro; official reference exams remain free. Diagnostics, basic results, official resources and sample lessons retain their existing free access.
- Keep hash routing for static hosting; typed route schemas and invalid-state handling belong to Phase 2.
- Learner-facing glossary: Pro; Diagnóstico; Práctica; Simulacro de práctica (authored items); Prueba de referencia (official reference content); Temario (the canonical learning tree); Mi progreso. Full adoption belongs to Phases 4–5.

## Implemented

| Scope | Changes | Plan IDs |
| --- | --- | --- |
| Production upgrade controls | Development-only tier switch and simulated upgrade; disabled production contracting placeholder | M3 |
| Resilience | Root error boundary with reload/home recovery, including cached lazy-import rejection recovery | K1 |
| CSS foundation fixes | Global helper variables; declared stone tokens; one base font size, page-width rule and control-radius definition; inline links/radios no longer inherit the blanket touch-height rule | E3, E4, E5, H5 (partial) |
| Curriculum lookup | Unknown program/subject/year/module returns no table; preparation path shows an unavailable state; explicit date/Math aliases resolve only within the requested program | B6, B4 (partial) |
| Repository hygiene | Removed unused starter CSS/SVG; renamed npm package; updated README | E9, L3 (partial) |
| Select control | One native, named, keyboard-operable control; old CustomSelect props remain compatible | E7, H2 |
| Assessment accessibility | Answer text participates in its accessible name; stable page heading plus question subheading; contrast fixes in the question rail | H1, H3 (partial), H4 (partial) |
| Access policy | Canonical capability matrix in services; subscription/entitlement APIs share tier reads, writes, subscriptions and cross-tab updates; launch/resume/direct-link gates for legacy and guided Pro practice | C6 (partial), M1 (partial), M2 |
| Shared contracts | Canonical cognitive/difficulty/domain/tier types for guided modules; compatibility exports retained; shared storage-key registry adopted by main repositories | G1 (partial), D1 (partial) |
| Production exports | Preview and assessment fixture exports removed from production barrels | F3 (partial) |
| Resource performance | PDF previews mount only on request; locally bundled fonts replace blocking Google Fonts links | I1, I2 |
| Verification infrastructure | Production browser suite; free/Pro recovery/profile journeys; axe matrix and screenshots; Lighthouse baseline; CI report uploads | H6, L2 (partial) |
| Measured fixes | Entry/Temario/player contrast and 320px calendar filters | H4 (partial) |

The storage registry preserves the existing key strings. No learner history was migrated, deleted, deduplicated or rewritten by this implementation. Full repository consolidation and migration tests remain Phase 3 work. The browser journeys use isolated test contexts and fixture subscriptions; they do not mutate a user's normal browser profile.

## Verification

Reports are generated under `artifacts/consolidation/` and `artifacts/bxm-integration/`. The browser audit covers entry, programs, subject, learning home, Temario, progress, resources, calendar and diagnostic surfaces at 320px/1280px in light/dark themes. Serious/critical violations and page overflow fail the audit. Lower-impact findings remain visible in the JSON report.

Baseline entry Lighthouse: performance 93, accessibility 96 (one local mobile-emulation run). Entry JavaScript chunk: 166,928 bytes / 50,984 gzip bytes. Baseline aggregate JavaScript: 10,100,251 bytes. Lighthouse scores are machine-load dependent; they are diagnostic measurements, not a stable performance guarantee.

Final verification:

- Full Vitest suite: **77 files, 399 tests passed** (`artifacts/consolidation/final-tests.log`).
- Production build and Oxlint: passed. Existing eager/dynamic data-import and large-chunk warnings remain for Phase 6.
- Reference/resource browser journey: passed, including exact answers/deadline recovery, durable result URLs, released I & II Ciclo reference content, other program PDFs, and responsive screenshots.
- Guided production journey: passed, including 20-item diagnostic recovery, free sample lesson, Pro gating, first-response scoring after retries, downgrade/direct-link protection, profile isolation, and real failed-chunk/reload recovery.
- Axe: **36 route/viewport/theme combinations**, **0 serious/critical violations**, **0 horizontal page overflows**, **0 runtime errors**. Motion was reduced for stable theme measurements; fonts were loaded before inspection. Both 320px and 1280px light/dark layouts were checked. Representative mobile Temario and assessment screenshots were visually inspected.
- Entry chunk budget: **165,080 bytes / 50,359 gzip bytes**, down **1,848 / 625 bytes** from baseline. The committed budget is enforced by `npm run audit:bundle` and CI.
- Aggregate emitted JavaScript: **10,102,988 bytes**, up **2,737 bytes** from baseline. Eager data loading and route-chunk consolidation remain outstanding; the entry budget does not stand in for a total-download budget.
- Final entry Lighthouse: **performance 95, accessibility 100**, compared with **93 / 96** at baseline. These are single local mobile-emulation measurements, not a statistical performance comparison.
- Reports and screenshots are local under `artifacts/` and uploaded by CI. No commit, deployment, or learner-data migration was performed.

## Remaining execution

This is the Phase 0 implementation plus the narrowly scoped foundations and fixes listed above. It is **not completion of the multi-phase migration**.

1. **Phase 1:** implement and adopt remaining UI primitives/tokens; unify accents, badges and tabs; remove structural styling hacks; finish heading/accessibility audit.
2. **Phase 2:** typed per-view routes, provider/route decomposition of App, unified navigation and breadcrumbs, URL-state hook, invalid-state/404 handling.
3. **Phase 3:** one repository/storage/telemetry path, versioned copy-and-validate migrations with history fixtures, quota/error handling, subscriptions/hooks, profile-scoped reading lists and clear-data UI. The registry is a prerequisite, not the finished data layer.
4. **Phase 4:** adapt the reference exam and existing learner snapshots to SessionRunner; migrate each golden journey before retiring TestShell/ResultsPage; consolidate Temario/progress/remediation/configuration; split the learning hub/dashboard. Preserve the reference benchmark's isolation.
5. **Phase 5:** adopt the glossary across all copy, derive counts/durations from configuration, centralize convocatoria data and move remaining component-authored lesson content to data.
6. **Phase 6:** consolidate calendar imports, reduce eager data imports/chunks, finish contrast coverage, stabilize visual baselines and test organization. Re-measure bundles and Lighthouse after route/data consolidation.
7. **Phase 7:** generalize program/subject configuration and remaining domain/identity contracts; remove feature-to-common layer inversion and remaining development catalog naming.

Use the existing routes as the strangler boundary. Do not remove a legacy reader or player until its recovery/history fixture tests and production browser journey pass on the replacement.
