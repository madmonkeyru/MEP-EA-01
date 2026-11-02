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

# UI/UX implementation ledger

Updated: 2026-11-02. All 82 audit IDs have a disposition below. This is not a claim that browser measurements or human studies have been completed.

**Implemented** means the code/design change is present; automated verification is summarized below. **Implemented / validation pending** means the change exists but its empirical acceptance check still needs a browser, assistive technology or real device. **Prepared / external validation pending** means a research/checklist artifact exists, but the actual activity is not complete.

| ID | Disposition | Change / evidence |
| --- | --- | --- |
| F01 | Implemented | Shared assembler drives every visible mode; exact-item and weighting regressions. Concepts without linked questions are disabled. |
| F02 | Implemented | Latest snapshot ref and deadline submission guard; regression changes an answer immediately before timeout. |
| F03 | Implemented | Versioned ordered snapshots, explicit Resume/Discard and per-profile active storage; no count-based restoration. |
| F04 | Implemented | Password/email form replaced with optional local profile and honest device-only copy. |
| F05 | Implemented | Stable session IDs, completed snapshots and upsert persistence; StrictMode regression. |
| F06 | Implemented | Shared subject/level calculatorRule used in curriculum context and test; portal blanket permission removed. |
| F07 | Implemented | Shared isExam predicate covers both simulation modes and suppresses learning feedback. |
| F08 | Implemented | App wires exact eligible IDs from objectives/evidence to practice and results. |
| G01 | Implemented | Test/result URL phases and stored snapshots restore sessions and results across refresh. |
| G02 | Implemented | Global browsing header hidden during tests; explicit save-and-leave dialog and recoverable Back/navigation. |
| G03 | Implemented | Native modal Dialog shared by profile, references, submit, exit, navigator, confirmation and compatibility setup. |
| G04 | Implemented | Rebuilt setup/profile/resource fields use labels; named controls and fieldsets throughout active flows. |
| G05 | Implemented | Spanish document, skip link, one main, route titles and heading focus; tab changes retain tab focus. |
| G06 | Implemented | Shared keyboard Tabs, native answer radios and pressed/current states. |
| G07 | Implemented / validation pending | Measured app/exam header offsets; sticky reference navigation simplified. |
| G08 | Implemented | Shared actions, fields, dialog, tabs, surfaces and exam styling. |
| G09 | Implemented / validation pending | Readable type scale, target spacing and selectable/enlarged mathematics; actual contrast/target measurement awaits browser checks. |
| G10 | Implemented | Compact light/dark theme switch (updated to user preference); follows system initially, persists deliberate choice, prepaint theme and reduced-motion rules. |
| G11 | Implemented | Student-facing practice labels and reference/convocatoria vocabulary standardized in active flows. |
| G12 | Implemented | Content-load errors/retry, empty pools and unavailable/invalid saved URLs have distinct recovery paths. |
| E01 | Implemented | Entry exposes direct practice, program discovery and optional help; next page is a program catalog. |
| E02 | Implemented | Program/subject/window labels distinguish Mathematics practice, PDF availability and preview. |
| E03 | Implemented | Educational goals/prior-stage copy and an expandable comparison table; optional guide link. |
| E04 | Implemented | Resume banner and last-subject link on returning visits. |
| E05 | Implemented | Reference wording in badge and window selector. |
| E06 | Implemented | Program/subject destinations and curriculum breadcrumbs use real anchors. |
| H01 | Implemented | Separate science and language choice groups in the framework catalog. |
| H02 | Implemented | OfficialResources embedded in each subject resources panel. |
| H03 | Implemented | Availability visible in program cards, framework, subject header and window options. |
| H04 | Implemented | Main tabs/subtabs are URL state; shared context controls replace repeated badges. |
| H05 | Implemented | One neutral next-step panel; no apparent zero score for a new student. |
| H06 | Implemented | Contextual history opens stored result snapshots; old summaries are retained without invented detail. |
| H07 | Implemented | Explicit grade/part sequence and EDAD prerequisite explanation; studying remains ungated. |
| P01 | Implemented | Learning versus exam entry with a single subtype control. |
| P02 | Implemented | Actual eligible/attempt count preview; unsupported concepts disabled. |
| P03 | Implemented | Native form and start-handler validation of count/timer/eligible items. |
| P04 | Implemented | Legacy modal is a thin wrapper around the same configuration component. |
| P05 | Implemented | Exam preflight explains count, duration, feedback, references, timeout and leaving. |
| P06 | Implemented | Untimed learning is the default; exam modes use the stated timed configuration. |
| T01 | Implemented | Shortcuts ignore interactive elements, modifiers, open dialogs and navigator; optional checkbox disables them. |
| T02 | Implemented | Native radio options and named navigator status/current state. |
| T03 | Implemented / validation pending | Persistent absolute deadline and visibility resync; threshold-only announcement, no pulse. Independent-clock/device-sleep verification remains pending. |
| T04 | Implemented | Feedback follows options and locks the first verified response; simulation feedback deferred. |
| T05 | Implemented / validation pending | Wrapping mobile exam controls and mobile review dialog; visual verification remains pending. |
| T06 | Implemented | Last-question review action and direct unanswered/flagged review in submission dialog. |
| T07 | Implemented | Stable identity/start, immediate meaningful-change saves, five-second checkpoints and storage error messages. |
| T08 | Implemented | Reference dialog uses shared FormulasSheet with study-support attribution. |
| T09 | Implemented | Shared context appears in a collapsible group block; original group snapshots are retained. |
| R01 | Implemented | Correct/incorrect/unanswered split, filters, session threshold and mode-specific explanation. |
| R02 | Implemented | Profile/context/configuration-scoped history and comparisons; legacy summaries excluded from exact comparisons. |
| R03 | Implemented | Area breakdown, weakest-area next step and exact missed/unanswered practice. |
| R04 | Implemented | Explicit repeat/scope/destination actions. |
| R05 | Implemented | Accessible table/meter values, dates and honest zero baseline replace the visual-only chart. |
| R06 | Implemented | Explanation hidden initially, support attribution, preserved review filter and retry-before-reveal prompt. |
| R07 | Implemented | Plain-text export, printing and selective history deletion with confirmation/undo. |
| K01 | Implemented | One OfficialResources panel shared by helper/subjects; one set of knowledge panels and compatibility wrappers. |
| K02 | Implemented | Parsed subject/type/level metadata and actual PDF file sizes. |
| K03 | Implemented | Subject/level/type/search filters, reset, reading list and explicit open/download actions. |
| K04 | Implemented | Native details/summary curriculum accordions; separate exact-item practice actions. |
| K05 | Implemented | Plain-language study objectives first, weighting meters, evidence progressively disclosed. |
| K06 | Implemented | Labeled normalized search/count/reset, concept index/deep links and available exact-concept practice. |
| K07 | Implemented | Dynamic program labels, formula/symbol search, empty state and study-sheet attribution. |
| K08 | Implemented | Shareable filter URLs, preserved tab history, PDF size/type and on-demand open/download. Heavy inline preview intentionally omitted. |
| O01 | Implemented | Two required profile fields; immediate provisional report and optional scope/document planning. |
| O02 | Implemented | Schooling first; sensitive exceptions only for relevant minors; optional basic-skill confirmation. |
| O03 | Implemented | Two-field requirements, focused step region and explicit hints; optional sections can be bypassed. |
| O04 | Implemented | Upfront purpose, privacy and required/optional effort; visible step count. No invented completion-time estimate. |
| O05 | Implemented | Main suggested action/resources, comparisons and personal recap collapsed. |
| O06 | Implemented | Explicit browse-program versus guide choice; contextual helper links and Orientarme action. |
| O07 | Implemented | Print/save-to-PDF orientation, refresh explanation and confirmed reset; personal profile is not persisted. |
| O08 | Implemented | Provisional headline, unconfirmed inputs and official links; browsing never gated by fit. |
| V01 | Implemented / validation pending | Semantic tables preserved, column scopes added and authored descriptions visible. Task-equivalent description review still needs human verification. |
| V02 | Implemented / validation pending | Enlarge dialog with keyboard-scrollable minimum-size figure. Phone/zoom readability measurements remain pending. |
| V03 | Implemented | Themed group contexts and highlighted equations restored to user preference, including light/dark and selected-answer treatments. |
| V04 | Implemented | Unsupported graphics show an explicit fallback; boundaries keyed to item/spec. |
| V05 | Implemented | Context-prefilled editable report draft with copy action; explicitly unsent. No unsupported backend invented. |
| V06 | Implemented / validation pending | Memoized KaTeX rendering with restored expression highlighting and preserved math tests. Assistive-math/copy review remains pending. |
| Q01 | Implemented | Capability status is canonical; older architecture/status documents link to it. |
| Q02 | Implemented / validation pending | End-to-end component and integrity regressions plus a current browser journey and human accessibility checklist. |
| Q03 | Prepared / external validation pending | Browser matrix/script and evidence checklist prepared. Browser execution permission remains declined; measurements/screenshots are pending. |
| Q04 | Prepared / external validation pending | Consent-aware five-student pilot and observation template prepared; requires actual participants, not simulated results. |
| Q05 | Implemented / validation pending | Production asset sizes recorded, optional pages lazy-loaded, PDFs on demand, math memoized and untimed repaint reduced; real-phone profiling remains pending. |

## Verification and limits

Regression evidence is recorded in the [implementation verification record](UI_UX_VERIFICATION.md). The implementation adds real automated checks rather than marking source changes alone as validation. See [capability status](CAPABILITY_STATUS.md) and [validation/pilot plan](UI_UX_VALIDATION.md).

No account backend, official enrollment workflow, current schedule feed, cross-device sync, report delivery backend or unpublished question bank was added. Local profiles are explicitly not authentication. No user messages were sent, participants contacted, browser permission bypassed or successful usability sessions invented.
