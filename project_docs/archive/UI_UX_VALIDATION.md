---
> **DEPRECATED & SUPERSEDED HISTORICAL ARCHIVE**
> This document is part of the historical pre-development and prototyping logs.
> It has been superseded by the authoritative **MEP EA Digital System Architecture Suite (v3.0.0)**.
> Please refer to:
> - Master Architecture Index: [INDEX.md](../INDEX.md)
> - System & Infrastructure Architecture: [01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md](../01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md)
> - Core Services & Domain Model: [02_CORE_SERVICES_AND_DOMAIN_MODEL.md](../02_CORE_SERVICES_AND_DOMAIN_MODEL.md)
> - Content Pipeline & Legal Decoupling: [03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md](../03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md)
> - Vector Visualizations & Math Engine: [04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md](../04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md)
> - UI/UX Design System: [05_UI_UX_DESIGN_SYSTEM.md](../05_UI_UX_DESIGN_SYSTEM.md)
> - Product Roadmap & Operations: [06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md](../06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md)
---

# UI/UX validation and student pilot

Prepared: 2026-11-02. This is an executable checklist and research plan, not a record of completed browser or participant sessions.

## Automated evidence

Run `npm run build`, `npm run lint` and `npm test`. Focused regression coverage includes actual item assembly, a response changed immediately before timeout, submission idempotency, saved-snapshot order/ownership, corrupted/full storage, profile isolation, verified-answer locking, modal shortcut isolation, keyboard tabs, available PDF navigation and provisional guide output.

`npm run test:flows` runs `scripts/validate-ui.mjs` against an already-running app (`http://127.0.0.1:5173`, override with `FLOW_BASE_URL`). It uses installed Edge through Playwright. The old helper/flow script names delegate to this same current journey. It checks the PDF signatures for all four programs, guide skipping, leaving/resuming a practice, refresh recovery, reopening results without duplication, and captures 320/390/768/1024/1440 px light/dark screenshots.

Browser execution outside the sandbox was declined earlier. That decision is respected. The updated script has **not** been executed in a browser in this implementation pass; screenshots, measured contrast and mobile usability are not claimed.

## Manual browser and accessibility matrix

For each principal surface (entry, catalog, framework, subject, resources, guide, setup, test, overlays, results and history), record browser/version, viewport, theme, input method and pass/fail evidence.

| Check | Expected evidence |
| --- | --- |
| Keyboard start | Skip-to-content works; page has one main landmark and the new page's heading is focused without stealing focus on tab changes. |
| Tabs and controls | Arrow keys/Home/End move through tabs; answer radios expose selection; toggles and current-question status have names. |
| Dialogs | Focus enters the dialog, Tab stays inside it, Escape closes it, focus returns to the trigger, background controls and answer shortcuts do not operate. |
| Narrow layouts | 320/390 px pages have no page-wide horizontal overflow. Long equation/figure scrolling is confined to named regions. Essential actions remain reachable. |
| Enlarged content | Repeat at 200% text sizing and browser zoom. Measured header offsets keep content and focus visible; dialogs remain scrollable. |
| Theme and contrast | Measure text, focus indicators, selected/disabled controls, diagram annotations and status cues in both themes. Record actual foreground/background pairs; do not infer compliance from token names. |
| Reduced motion | Timer thresholds remain legible without animation. All major transitions and attention effects respect the preference. |
| Screen reader | Check Spanish page pronunciation, dialog names, radio groups, summaries, result counts, table headers and complete mathematical descriptions using an available screen reader. |
| Mathematics | Check each visual family, long fractions, units, tick labels, cross-sections, multiple views and grouped contexts. Enlarge and horizontal scrolling must work by keyboard. Check copy/select and mathematical equivalence. |
| Recovery | Refresh a timed and untimed session; reopen a saved result; attempt another practice while one is saved; switch local profiles. Answers and histories must remain separate. |
| Timer | Compare a timed session with an independent clock, including backgrounding, visibility changes and device sleep. Check threshold announcements and final-answer submission. |
| Failure states | Deny browser storage or fill quota; interrupt content loading; select an empty concept; visit invalid and expired session URLs. Confirm honest status and useful recovery. |
| PDFs | Check open/download behavior, file sizes, subject/level labels, empty searches, reading-list persistence and whether each source PDF itself is accessible. |

Record failures as concrete issues: page, action, expected/actual behavior, environment, relevant audit ID and evidence. Re-run only the affected cases after a fix, then the principal end-to-end journey.

## Five-student pilot

Recruit and obtain consent through the project's normal human process. Include different educational stages, phone/desktop use and levels of digital confidence; include assistive-technology experience where participants volunteer it. Do not collect exact age, identification, passwords, motherhood status or study documents for the research. No participants have been recruited or contacted by the agent.

Use a clean or participant-approved local profile. Explain that the platform is an independent prototype, registration is external, the guide is optional, and the participant may stop at any point. Do not coach during a task; ask the participant to describe what they expect to happen.

1. Find the program and level appropriate to a **fictional** educational scenario. Explain what is available now versus in preparation.
2. Find and open an official practice PDF for one subject. Return to it after another page.
3. Open the guide, skip it, and access resources without answering personal questions. In another fictional scenario, obtain a provisional suggestion using only age band and schooling.
4. Start a short untimed practice, answer a question, inspect feedback, and explain why that first verified answer is retained.
5. Save and leave; re-open the practice. Explain what would happen to time in an exam-style attempt.
6. Finish the practice. Distinguish correct, incorrect and unanswered questions. Locate a solution and choose the next study action.
7. Re-open the result from history and explain where it is stored and whether it is an official examination result.

Measure task completion (independent / assisted / not completed), time-on-task, wrong turns, abandonment, terminology misunderstandings and confidence after each task. Ask a simple ease rating (1–5) and one short explanation. Record quotations only with consent and omit personal identifiers.

| Participant code | Task | Completion | Time | Wrong turns | Ease 1–5 | Observation | Audit IDs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01–P05 | 1–7 | Pending | — | — | — | No participant evidence collected | — |

After the pilot, rank observed barriers by impact and frequency. Revisit the highest barriers with participants where feasible. Do not fabricate results or install analytics to replace this study.

## Performance record

The production build reports raw and gzip asset sizes. Optional guide/helper views are lazy-loaded, PDFs remain on demand, mathematical rendering is memoized, and untimed practice does not repaint its content every second. Storage failures are surfaced. These are implemented optimizations, not evidence of acceptable latency on a particular phone.

Measure first useful interaction, answer-selection delay, question-navigation delay, formula opening and saved-state delay on a representative modest phone, with normal and constrained network/CPU conditions. Record medians and slow cases with environment details. Avoid adding performance budgets that have not been agreed or measured. Offline access and cross-device synchronization remain unsupported.
