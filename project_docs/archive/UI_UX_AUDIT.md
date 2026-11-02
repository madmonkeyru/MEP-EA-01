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

# UI/UX opportunity audit

Date: 2026-11-02. Scope: the current main application, all page families, shared controls, optional guide, resource browser, and mathematical renderers.

> Subsequent implementation: [All 82 dispositions](UI_UX_IMPLEMENTATION.md), [current capabilities](CAPABILITY_STATUS.md), and [verification record](UI_UX_VERIFICATION.md). This audit describes the pre-change state.

## Assessment

The highest-value work is to make the learning experience reliable and understandable before adding visual decoration. The application has useful foundations: direct guest access, a skippable guide, explicit preview routes, program/level URLs, mathematical rendering, practice feedback, and answer review. However, several visible promises are not connected to their underlying behavior, navigation can interrupt work, and the interface contains several competing visual and information structures.

This is a source and documentation audit. **C** means a condition confirmed in the current code, **R** means a risk inferred from that implementation that needs a targeted reproduction, and **O** means a design opportunity. No new browser, screenshot, contrast measurement, screen-reader, or student usability verification is claimed. Browser execution permission was declined during the preceding integration task; that decision has not been bypassed or requested again. Responsive risks below are inspection targets, not observed screenshots.

Priorities: **P0** protects answers, results, or fundamental trust; **P1** materially affects completion, accessibility, or understanding; **P2** improves efficiency and consistency; **P3** is a later enhancement. These are product priorities, not release severity labels.

Inventory: **82 findings — 4 P0, 47 P1, 31 P2**. Findings distinguish confirmed conditions, inferred risks and proposed design improvements; they are not 82 reproduced bugs.

## Project status and constraints

- Only **BXM Mathematics, reference convocatoria 02-2026**, currently has functional interactive practice. Other subject/window routes are previews. Official PDF resources are available across all four programs.
- `SRS.md` and the preparation log describe broad implementation and older test totals. `FLOW_VALIDATION.md` gives a narrower, more useful account of actual route availability. Documentation should distinguish architecture support from student-facing content readiness.
- The guide is optional. Improving it must not introduce an entrance gate, automatic popup, required profile, or eligibility restriction on studying.
- Guide answers are session-only; practice answers and history use browser storage. These are different persistence promises and need different explanations.
- This audit proposes improvements; it does not authorize adding a backend, accounts, current examination schedules, or content for unpublished subjects.

## 1. Behavior and trust: address before visual redesign

| ID | Priority / evidence | Finding and student impact | Recommended outcome |
| --- | --- | --- | --- |
| F01 | P0 · C | The widget offers weighted, concept, and random practice, but `TestShell` initializes only simulation, area, and topic specially; other modes fall back to a set. `dataService.assembleSession` and the corresponding engine routines exist but are not called here. Labels can promise a different exercise from the one delivered. | Connect every visible mode to its real assembler. Assert selected concept, exact item IDs, distribution, scope and count at the UI boundary. Hide unsupported modes until connected. |
| F02 | P0 · R | The timer effect depends on items and timer enablement, while its submission callback captures responses and elapsed time at effect setup. Timeout submission can use stale state. | Submit one current session snapshot on timeout, including the latest answer. Make submission idempotent. Test an answer changed immediately before expiration. |
| F03 | P0 · C/R | Restoration checks only that the saved and new item lists have the same length. Different ten-question practices can receive each other's responses, flags, position and time. | Identify the session by configuration, program, subject, window, exact ordered item IDs and storage version. Offer explicit Resume / Start new choices, never silently merge sessions. |
| F04 | P0 · C | `AuthModal` requires a password but never authenticates it; submission creates a local user for any email. The interface says “Crear cuenta” and “Iniciar sesión.” | Present this honestly as an optional local profile and remove the password, or implement actual authentication as a separately scoped feature. Clearly explain device-local storage and guest access. |
| F05 | P1 · C/R | Results persist an attempt in a mount effect, and `saveAttempt` always prepends it. Remounting, including development StrictMode effect replay, can duplicate an attempt and distort history. | Upsert by stable session ID and persist completion once. Reopening a result must not add an attempt. |
| F06 | P1 · C | The blanket calculator statement in `WelcomePage` and program-level badges conflict with the guide's subject/level-specific III Ciclo guidance. A student cannot tell which rule to trust. | Use one rule source keyed by program, subject and level. Say “Depende de la materia y nivel” where context is not yet selected. Use official reference links and avoid a universal permission badge. |
| F07 | P1 · C | A weighted mock is treated as practice for feedback because only `mode === 'simulation'` suppresses explanations. Even after fixing its item assembly, it would reveal answers during an exam-style attempt. | Define shared simulation/practice behavior, covering feedback, timer, reference materials, scoring and completion copy for every mode. |
| F08 | P1 · C | Specifications support “practice these items” through an optional callback, but `App` does not supply it to the subject hub. Those actions are absent in the normal app flow. | Wire curriculum-to-practice links to exact eligible items with a clear count, or explicitly label the view as reference-only. Verify the full temario → practice → results path. |

Source anchors: [mode configuration](../src/components/practice/EvaluationModulesWidget.tsx), [test initialization, restoration and timer](../src/components/test/TestShell.tsx), [assembly service](../src/services/dataService.ts), [engine](../src/services/testEngine.ts), [local profile](../src/components/auth/AuthModal.tsx), [results persistence](../src/components/results/ResultsPage.tsx), [storage](../src/services/storageService.ts), [rules overview](../src/components/pages/WelcomePage.tsx), [app wiring](../src/App.tsx).

## 2. Global navigation, accessibility and visual system

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| G01 | P1 · C | Test/results are local views inside a subject URL; reload returns to the hub, and route changes clear the in-memory session/result. | Give session and result destinations explicit navigation semantics. Recover valid active work after refresh and support predictable Back/Forward. Provide a safe leave/resume path. |
| G02 | P1 · C | The desktop global header remains available during a test. Home/program actions can leave the attempt without an in-app interruption decision. | Use a focused exam header with clear Exit / Save and leave actions. Require a concrete leave decision when work is in progress; keep normal browsing lightweight. |
| G03 | P1 · C | Auth, practice, formula and submission overlays lack a common dialog contract: dialog name, modal semantics, initial focus, focus containment, focus restoration and background isolation. | Introduce one shared dialog/drawer primitive. Support Escape appropriately and prevent underlying page/answer shortcuts from firing while an overlay is active. |
| G04 | P1 · C | Several visual form labels are not associated with controls; timer toggles and some icon buttons lack accessible names. | Give each input a programmatic label and help/error association. Name icon-only controls independently of a hover tooltip. Associate grouped choices with a legend. |
| G05 | P1 · C | The app has no skip-to-main link or general route focus/title update. Nested `main` landmarks occur in the test shell and standalone resource wrapper. | Use one main landmark, a skip link, logical heading hierarchy, descriptive document titles, and focus movement to the new page's main heading. Preserve intentional in-page focus. |
| G06 | P1 · C | Buttons often communicate selected state only through color. Generic subject tabs have tab roles but no coordinated arrow-key/roving-focus implementation. | Use native radio groups for exclusive choices, `aria-pressed` for toggles, and a complete keyboard tab pattern where genuine tabs are used. Expose selected/expanded/current states. |
| G07 | P1 · R | Fixed sticky offsets (`top-14`, `top-[124px]`) assume header heights even though the header wraps. Overlapping controls are likely at intermediate widths and enlarged text. | Establish one responsive header-height/offset mechanism. Verify at 320, 390, 768, 1024 and 1440 px and at enlarged text/zoom. |
| G08 | P2 · C/O | Stone/slate/indigo pages, zinc exam/results/modals, and rounded-pill guide controls form several visual systems. Repeated nested surfaces and heavy labels compete for attention. | Define shared color, type, spacing, border, radius, elevation and status tokens; common button/field/tab/card patterns; and a clear primary/secondary/tertiary action hierarchy. Preserve an intentionally focused exam mode. |
| G09 | P1 · C/R | Many instructional and metadata labels use 10–12 px text. A global `min-height:44px` rule does not guarantee width, spacing or effective area for every custom control. | Use a readable body scale and reserve small text for genuinely secondary metadata. Measure actual touch targets and spacing, keyboard focus visibility and contrast in both themes. |
| G10 | P2 · C | A system theme exists internally, but the visible toggle only switches light/dark. Reduced-motion CSS does not cover the timer's pulse and all animated elements. | Offer Light / Dark / System explicitly, initialize the theme before first paint where feasible, and apply reduced-motion preferences to attention effects and transitions consistently. |
| G11 | P2 · C | Vocabulary varies: “Hub,” “ítems,” “Drilldown,” “Ponderado,” “ventana,” “topología,” English area IDs and inconsistent Spanish accents/capitalization. | Adopt one student-facing Spanish vocabulary. Prefer “materias,” “preguntas,” “práctica por concepto” and “convocatoria”; explain unfamiliar terms and expand acronyms on first use. |
| G12 | P1 · C | Context-loading failures have no visible recovery path; an empty question pool remains “Cargando preguntas…” indefinitely. | Distinguish loading, unavailable content, empty filters and failed loading. Provide Retry, Change selection and Return actions, with accessible status announcements. |

Sources: [app shell](../src/App.tsx), [navigation](../src/services/navigation.ts), [header](../src/components/layout/Header.tsx), [CSS](../src/index.css), [theme context](../src/context/ThemeContext.tsx), [theme control](../src/components/common/ThemeToggle.tsx), dialog and tab components below.

## 3. Entry and program discovery

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| E01 | P2 · O | Entry and Welcome repeat introduction, BXM entry and program discovery. The path can feel like two homepages. | Make entry answer three intentions: practice now, explore programs, find guidance/resources. Keep one action dominant, and make the next page a clear catalog rather than another introduction. |
| E02 | P1 · C | BXM is labeled “Activo” at program-card level, though only one subject/window is interactive. | Show “Matemáticas · práctica disponible” and distinguish interactive practice, downloadable resources and structural preview separately. |
| E03 | P2 · O | Program cards emphasize acronyms, scores and calculator flags more than educational stage and entry context. | Lead with completed/target education stage, age reference and what the program awards. Offer a concise comparison and optional “No sé cuál elegir” link. |
| E04 | P2 · C/O | Returning students get the same introduction and generic learning journey; there is no visible active-session entry. | Offer Resume if a valid saved attempt exists, then last-used program and a small next-step action. Keep first-time explanations available without repeatedly putting them first. |
| E05 | P2 · C | `ConvocatoriaBadge` calls the reference window an “official evaluation period” in its tooltip, while other pages correctly describe reference curricula. | Label reference windows consistently and keep registration dates in an explicitly external official channel. |
| E06 | P2 · O | `ProgramCard` and breadcrumbs use button-like navigation instead of real destinations; cards use a custom `div role="button"`. | Prefer semantic links for destinations, enabling browser history conventions, copying and opening in another tab. Preserve the existing keyboard access and current-page breadcrumb state. |

Sources: [entry](../src/components/pages/EntryLandingPage.tsx), [welcome](../src/components/pages/WelcomePage.tsx), [program card](../src/components/common/ProgramCard.tsx), [learning journey](../src/components/common/LearningJourney.tsx), [badge](../src/components/common/ConvocatoriaBadge.tsx), [breadcrumbs](../src/components/common/Breadcrumbs.tsx).

## 4. Framework and subject hubs

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| H01 | P1 · C | Framework cards render science and language alternatives as individual entries; their choice relationship is mostly explained in prose. | Group “Elige una ciencia” and “Elige un idioma” visually so students do not interpret all options as additional required subjects. |
| H02 | P1 · C | Generic Resources panels still say “Recursos en preparación” despite linking to available official PDFs. | Show actual relevant PDF resources in that panel. Reserve “En preparación” for unavailable interactive features, with an immediate useful action. |
| H03 | P1 · C/O | Availability becomes clear after several selections and disabled start controls. | Show availability at the catalog, subject card and window selector, before a student invests in the route. Never create a dead-end preview when reference resources exist. |
| H04 | P2 · C | Main hub, widget and badges repeat the program/window, while resource/practice sections and subtabs are local state. | Use one compact context strip. Store meaningful tab/filter state in navigation so refresh and Back restore the student's location. |
| H05 | P1 · C | Quick stats and the performance widget repeat averages; the latter displays 0% when there are no attempts. | Show one concise summary, and a neutral “Aún sin datos” state rather than an apparent zero score. Use the freed space for the next useful learning action. |
| H06 | P1 · C | Recent-history rows are informational only; students cannot reopen a prior result. `Attempt` does not preserve all context needed for a durable result view. | Make history entries actionable and retain item snapshots/IDs, program, subject, window and mode. Offer review, repeat and targeted practice. |
| H07 | P2 · O | EDAD parts and III Ciclo levels are select options, with little visual explanation of the educational sequence. | Show a small stage map or clearly labeled sequence. Explain EDAD prerequisites next to Part 2 while preserving ungated study access. |

Sources: [framework hub and context controls](../src/components/pages/FrameworkHubPage.tsx), [generic subject hub](../src/components/pages/GenericSubjectHubPage.tsx), [BXM hub](../src/components/pages/LandingPage.tsx), [quick stats](../src/components/common/QuickStatsBanner.tsx).

## 5. Practice configuration and starting an attempt

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| P01 | P1 · O | Six modes presented as compact segments demand understanding implementation distinctions before a student starts. | Lead with “Aprender y repasar” versus “Ensayar el examen.” Put topic/concept/random settings under practice and advanced simulation options behind a secondary disclosure. |
| P02 | P1 · C | The configured count can exceed eligible items. Concept choices come from the fallback dictionary rather than the currently available question pool. | Preview the actual eligible count, requested count, expected scope and unavailable concepts. Do not silently promise 20 questions and deliver fewer or an unrelated set. |
| P03 | P1 · C | The widget starts from an external button rather than native form submission; number constraints on the timer are not reliably enforced by that path. | Validate timer/count/scope in the start handler and announce inline errors. Define valid behavior for blank, zero, negative and excessive durations. |
| P04 | P2 · C/O | The widget and `PracticeConfigModal` duplicate configuration experiences. The current hub never sets its modal mode to open. | Choose one configuration flow and remove or explicitly reconnect the unused variant. Avoid maintaining two designs with different defaults, validation and theme support. |
| P05 | P1 · O | Simulation begins immediately, without a single readable summary of rules and recovery behavior. | Add a brief preflight with count, duration, feedback policy, allowed references, selected source/window and what happens on timeout or leaving. Keep the start action clear. |
| P06 | P2 · O | Timed practice is the default even for students using the tool to learn. | Consider an untimed learning default and an explicit timed-exam mode. Preserve deliberate choices and explain estimated effort without implying an official duration for custom practice. |

Sources: [evaluation widget](../src/components/practice/EvaluationModulesWidget.tsx), [configuration modal](../src/components/practice/PracticeConfigModal.tsx), [hub](../src/components/pages/LandingPage.tsx), [test initialization](../src/components/test/TestShell.tsx).

## 6. Test shell and answering experience

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| T01 | P1 · C | Global letter/number/arrow shortcuts are not suspended for the formula overlay or navigator. They ignore inputs/textareas but not every interactive target. | Scope shortcuts to the active question surface, suspend them under overlays, and offer a discoverable shortcut help/disable option. Never change an answer while a student is navigating a dialog. |
| T02 | P1 · C | Answer cards are buttons without radio/selected semantics; navigator buttons expose bare numbers without complete current/answered/flagged descriptions. | Use a labeled answer group and announce selected state. Give each navigator item a meaningful name and current state, including flags and unanswered status. |
| T03 | P1 · C/R | Low-time styling pulses continuously; countdowns use interval ticks rather than a deadline/visibility resynchronization mechanism described in pre-development notes. | Make time trustworthy after tab switching or device sleep. Announce useful thresholds, never every second. Respect reduced motion and explain automatic submission. |
| T04 | P1 · O | Feedback appears before the answer list and stays open after an answer is changed. Students can change to a revealed answer and receive a higher final result. | Decide whether learning mode locks a checked response or records first and revised attempts separately. Place feedback after the choices and distinguish assisted practice from an exam score. |
| T05 | P1 · C/R | Mobile hides progress and shortens action labels. Header/drawer sizing assumes a large fixed control set. | Keep question number, remaining/answered count, timer and accessible submit action usable at narrow widths. Use an intentional mobile action layout rather than only hiding labels. |
| T06 | P2 · C | The last question disables “Siguiente” without an in-place review action; review remains in another header location. | At the end, offer “Revisar y entregar.” In confirmation, link directly to unanswered/flagged questions and describe whether submission is final. |
| T07 | P1 · C | There is no visible saved-state indicator or Resume/Discard affordance, while saving runs with elapsed-state changes and rewrites session identity/start time. | Keep a stable session identity and start time, save on meaningful changes at a defined cadence, and communicate saved/failed status without noisy notifications. |
| T08 | P2 · C | The test's reference formulas are hardcoded separately from the formula library. | Use one verified source and clearly distinguish exam-provided references from extra learning support. Make the presentation mode-specific. |
| T09 | P2 · O | Shared question context is repeated inside individual question cards. | Provide a readable “Contexto para preguntas X–Y” pattern that can remain available while moving within a group, with a mobile disclosure and equivalent accessible description. |

Source: [TestShell](../src/components/test/TestShell.tsx), [GroupVisual](../src/components/visuals/GroupVisual.tsx), [storage](../src/services/storageService.ts), [pre-development UX and timer expectations](SRS%20Pre-Dev.md).

## 7. Results, review and progress

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| R01 | P1 · C | Unanswered questions are counted and labeled “Incorrectas”; a fixed 70 threshold controls encouragement. | Separate correct, incorrect and unanswered, with distinct review filters. Derive reference thresholds from the session, and avoid suggesting that a short assisted practice establishes examination readiness. |
| R02 | P1 · C | History and averages are read across users and modes; result records omit even the optional program ID. Scores from different scopes are presented as a single performance trend. | Scope history by local profile and curriculum, separate practice from simulation, and compare comparable attempts. Explain sample size and what the average represents. |
| R03 | P1 · O | The main next steps are generic retry/new practice; domain and concept weaknesses are not translated into an action. | Show a small breakdown and one useful recommendation, such as “Repasar funciones: 3 de 8 correctas,” linked to relevant concepts and missed-question practice. |
| R04 | P2 · C | “Nueva Práctica” returns to the hub, “Inicio” also means the hub, and “Reintentar” does not say whether questions repeat. | Name destinations precisely: “Elegir otra práctica,” “Volver a Matemáticas,” “Repetir estas preguntas.” Offer a distinct new-question action only when supported. |
| R05 | P1 · C | The bar chart uses a visual-only div structure, relative attempt labels, hardcoded color bands and a minimum bar height even at zero. | Provide dates, mode and actual values in an accessible table/list, meaningful chart labels and a clearly described scale. Use color as reinforcement and render zero honestly. |
| R06 | P1 · C/O | Detail view opens solutions by default and calls them “Explicación Oficial,” although provenance is not exposed alongside the explanation. | Attribute original questions, adaptations and authored explanations separately. Offer a “Try again before revealing” path, and retain the review filter when navigating details. |
| R07 | P2 · O | No export/print summary or student-controlled local-history management is visible. | Provide a readable study summary, selective history deletion with undo/confirmation, and a clear explanation of what clearing browser data removes. Keep cross-device sync a separate decision. |

Sources: [results](../src/components/results/ResultsPage.tsx), [hub history](../src/components/pages/LandingPage.tsx), [storage](../src/services/storageService.ts), [attempt types](../src/types/index.ts).

## 8. Resources, specifications, dictionary and formulas

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| K01 | P1 · C | PDFs live in the helper, knowledge tools in BXM subtabs, and a separate `ResourceLibraryPage` is not used by the main app. | Establish one discoverable resource destination with context filters and direct links from subject hubs, guide results and question review. Reuse the same resource navigation. |
| K02 | P2 · C | PDF titles are filename transformations; abbreviations, raw English level folders and long names remain visible. | Use student-friendly metadata: subject, program, level/part, type, window, source and file size. Make matching resources easy to compare. |
| K03 | P2 · O | PDF discovery supports program and text search but no explicit subject/level/type filters, reset action, shortlist or print/download distinction. | Add relevant facets and a clear “Limpiar filtros.” Offer clear open/download actions and new-tab behavior; optionally let students keep a small reading list. |
| K04 | P1 · C | The specification hierarchy has clickable div headers and unnamed icon toggles without expanded/control semantics. | Use labeled accordion buttons with expanded state and controlled regions. Keep nested practice actions separate from expansion targets. |
| K05 | P2 · C/O | Three nested curricular levels, codes and points create a dense reference-first experience. | Lead with a plain-language “Qué debo estudiar,” show weighting visually, and progressively disclose evidence codes and linked questions. Provide sticky section orientation without hiding content. |
| K06 | P1 · C/O | Dictionary inputs have placeholder-only identification; results are full cards without a concise index, result-count announcement or direct practice action. | Add visible/programmatic labels, count and clear filters; normalize student search terms; support concept links, related formulas and relevant practice where items exist. |
| K07 | P2 · C/O | Formulas have area filtering but no text search or explicit no-results state. Their introduction and dictionary/specification titles hardcode BXM context. | Share dynamic context labels, add formula/symbol search and empty-state recovery, and distinguish the actual exam reference sheet from an expanded study sheet. |
| K08 | P2 · O | Resource filters and selection are lost on route changes; opening an external PDF transfers the student into a different reading experience. | Preserve resource state and provide stable resource links. Give file type/size and accessible alternatives where possible. Consider a lightweight preview only if it adds value on mobile and low bandwidth. |

Sources: [helper resource browser](../src/components/onboarding/HelperPage.tsx), [standalone library](../src/components/knowledge/ResourceLibraryPage.tsx), [specifications](../src/components/knowledge/SpecsTable.tsx), [dictionary](../src/components/knowledge/TermsDictionary.tsx), [formulas](../src/components/knowledge/FormulasSheet.tsx), [integrated resource tabs](../src/components/pages/LandingPage.tsx).

## 9. Optional guide and recommendation report

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| O01 | P1 · C | Whole-guide skipping is available, but completing the route requires every profile and situation answer, including confidence and hours that do not determine educational-stage fit. | Separate “Find my program” from optional planning/tramite questions. Allow a useful partial result and explicit “No sé / Prefiero no responder” where appropriate. Preserve all existing skip routes. |
| O02 | P1 · C | Age-exception questions are shown to every minor before prior schooling is known. Literacy, numeracy and certificate questions are also broadly required regardless of relevance. | Ask schooling first, then branch only into relevant questions. Ask sensitive exception questions optionally and only when an early-BXM route is relevant, with a brief purpose explanation. |
| O03 | P2 · C | Validation is a single hint near a disabled Continue button; long steps require scanning to find missing fields. | Mark the relevant unanswered group, associate the hint, and move focus to the first actionable field after validation. Split long steps by meaningful task and show progress with clear labels. |
| O04 | P2 · O | A student cannot preview how much the guide asks before starting, or easily see remaining effort in long steps. | Explain its purpose, approximate effort only after measurement, optional sections and privacy before starting. Keep progress visible without turning guidance into a completion score. |
| O05 | P1 · C | The recommendation report gives equal visual weight to four programs, a full plan, checklist, rules and profile recap. Its resource action is at the top of the guide. | Lead with the suggested next step and a short reason, then a direct program/resource action and top pending tasks. Collapse comparisons, detailed rules and personal recap. |
| O06 | P2 · C/O | Switching the resource-browser program does not select the guide's program; existing answers can also make the helper default to a different program than the current curriculum. | Keep “program I am browsing” separate from “my guide answers” in the UI, with explicit “Orientarme sobre este programa.” Preserve origin/context and clarify where Skip returns. |
| O07 | P2 · C/O | Refresh clears the guide; restarting is immediate. There is no reusable checklist/export or completion-specific return action. | Explain refresh behavior before effort is invested. Offer print/copy/download of the resulting plan and a clear return to study. Consider opt-in saving of non-sensitive preferences only; do not silently persist the personal profile. Confirm reset when meaningful answers would be lost. |
| O08 | P1 · O | Program recommendations and requirements are reference-based; the report can still read like a definitive determination. | Make the recommendation provisional in the main result copy, distinguish missing information from an unmet condition, explain alternatives, and expose official confirmation links next to relevant tasks. Do not block resources based on the result. |

Sources: [wizard](../src/components/onboarding/ReadinessWizard.tsx), [guide state](../src/components/onboarding/wizardStore.tsx), [helper](../src/components/onboarding/HelperPage.tsx), [assessment and copy](../src/services/onboarding/evaluate.ts), [guide requirements](ONBOARDING_HELPER.md).

## 10. Mathematical content and visual components

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| V01 | P1 · C/O | The visual wrapper supplies an image label, but generic fallback text does not convey the graph/table's actual relationships. Wrapping tabular content as one image may hide useful table structure from assistive technology. | Author task-equivalent descriptions and accessible data tables where appropriate. Preserve semantic tables; avoid descriptions that reveal the answer. Validate each visual family, not just the wrapper. |
| V02 | P1 · R | SVGs use small labels and responsive shrinking, with overflow containers but no explicit enlarge action. Readability can deteriorate on phones and enlarged-text layouts. | Provide an accessible enlarge view with a minimum readable graph size. Test axes, tick labels, units, projections, legends and solid cross-sections at target widths and zoom. |
| V03 | P2 · C | `GroupVisual` forces a light surface/text treatment without dark variants, while SVG colors can respond to dark mode. Inline equations are styled as colored badges even within selected answer cards. | Apply consistent theme tokens to the complete question context. Reduce equation decoration so prose and mathematics read continuously, and verify selected-answer contrast separately. |
| V04 | P1 · C/R | Unknown visual types silently fall back to a Cartesian plane. A wrong graphic can look plausible; the error boundary also needs to recover when a different question replaces a failed visual. | Show an explicit unavailable/unsupported state rather than a misleading graph. Reset failure state per item, provide a useful fallback and allow reporting a content issue. |
| V05 | P2 · O | Students have no visible way to flag an unclear diagram, malformed equation or questionable explanation. | Add contextual “Reportar un problema” with item/context prefilled and a preview of what will be shared. Sending reports requires a real supported destination and explicit user action. |
| V06 | P2 · R | Auto-detection and normalization of mathematical expressions can change reading flow; formula cards nest several visual treatments. | Review representative prose/equation cases, line height, horizontal overflow, selection/copy behavior and assistive math output. Keep full mathematical equivalence and avoid automatic typography that changes meaning. |

Sources: [visual dispatcher and fallback](../src/components/visuals/VisualRenderer.tsx), [group context](../src/components/visuals/GroupVisual.tsx), [text and math](../src/components/common/TextRenderer.tsx), [Cartesian plots](../src/components/visuals/composites/CartesianPlane.tsx), [function composites](../src/components/visuals/composites/FunctionsComposites.tsx), [statistics](../src/components/visuals/composites/StatisticsComposites.tsx), [solids](../src/components/visuals/composites/Solid3D.tsx), [primitive geometry](../src/components/visuals/primitives/Primitives.tsx), [points](../src/components/visuals/primitives/Point.tsx), [projections](../src/components/visuals/primitives/DashedProjection.tsx).

## 11. Quality, maintenance and validation opportunities

| ID | Priority / evidence | Opportunity | Recommended outcome |
| --- | --- | --- | --- |
| Q01 | P1 · C | Architecture-oriented documents say broadly “Implemented,” while availability and verification notes are narrower and test counts differ. | Maintain a single student-facing capability matrix: interactive content, PDF resources, previews, persistence, account behavior and verification status. Link implementation claims to route-level evidence. |
| Q02 | P1 · O | Automated rendering tests do not establish usable keyboard navigation, readable mobile visuals or student comprehension. | Test the complete tasks: locate a program, find a PDF, skip the guide, resume an attempt, finish a timed test, and interpret/review results. Include keyboard-only and screen-reader checks. |
| Q03 | P1 · O | Actual responsive and theme quality remains unverified in the current review. | Run a matrix of desktop/phone, light/dark, enlarged text, reduced motion, long labels, long equations, empty/full history and failed loading. Record screenshots and measured defects once browser execution is available. |
| Q04 | P2 · O | There is no recorded student pilot outcome against the earlier proposed five-student usability tasks. | Conduct a small pilot with varied digital confidence and educational stages. Measure completion, abandonment, wrong-path selection, understanding of score/reference status and ability to find help. Treat findings as design evidence rather than adding tracking by default. |
| Q05 | P2 · C/O | Large question/content imports and synchronous browser-storage writes share the learning surface; PDF resources are correctly opened on demand. | Profile first useful interaction and answer/navigation latency on a modest phone. Lazy-load heavy optional views where beneficial, retain on-demand PDFs, and surface storage failure without interrupting an answer. Do not claim offline support unless implemented and tested. |

## Coverage map

| Surface / component family | Audit coverage |
| --- | --- |
| App shell, URL state, loading and history | F03, F08, G01–G07, G12 |
| Header, program switcher, account control | F04, F06, G02–G04, G07–G11 |
| Entry landing, learning journey | E01, E04, G08–G11 |
| Program portal, program cards, badges | F06, E02–E06 |
| Framework hub, context selectors | H01, H03, H04, H07 |
| Generic subject hub, preview/empty states | H02, H03, G06, G12 |
| BXM subject hub, quick stats and recent attempts | H04–H06, R02 |
| Evaluation widget and practice modal | F01, F07, P01–P06, G03, G04 |
| Test header, answer cards, navigator and overlays | F01–F03, F07, G01–G07, T01–T09 |
| Results, chart, question review and history | F05, R01–R07 |
| Resource browser and standalone resource wrapper | K01–K03, K08, O06 |
| Specifications, dictionary and formula sheet | F08, K04–K07 |
| Guide steps, progress, controls, report and state | O01–O08, G08, G11 |
| Breadcrumbs and theme controls | E06, G05, G10 |
| TextRenderer, GroupVisual, VisualRenderer | V01–V06 |
| Cartesian, function, statistics, solids and primitive renderers | V01–V04, V06; family-level review, not individual pixel certification |
| Shared styling, motion, touch, focus and feedback states | G03–G12, Q03 |
| Documentation and verification | Q01–Q05 |

## Recommended delivery sequence

1. **Reliable learning behavior:** F01–F08, G01–G04, G12, T01–T04, R01–R02. Connect promised behavior, protect work and scores, and correct account/rule language. Add regression cases around actual student actions.
2. **One understandable navigation and resource structure:** E01–E06, H01–H07, P01–P05, K01–K04, O01–O03. Make available resources and next actions easy to find without completing the guide.
3. **Consistent accessible presentation:** finish G05–G11, T05–T09, R04–R06, K05–K08, O04–O08, V01–V06. Apply shared patterns after agreeing on the information architecture; include mobile and mathematical readability.
4. **Learning follow-through and evidence:** R03, R07, P06, Q01–Q05. Improve targeted next steps and student control, then validate with a small pilot and measured performance checks.

Some accessibility and content fixes can proceed alongside behavior work; these waves indicate dependencies, not a reason to postpone a straightforward improvement. A full visual rebrand, new authentication backend, notification subscriptions and cross-device synchronization are separate scope decisions.

## Acceptance checks for the first improvement cycle

- Each visible practice mode produces the promised item scope and feedback policy; a mode's label, selected settings, test header and saved result agree.
- An answer changed just before timeout appears in the submitted result. Submission and reopening do not duplicate attempts.
- Two equal-length practices cannot restore each other's answers. Refresh, Back and deliberate exit have documented recovery behavior.
- Account/profile copy matches actual storage and identity behavior; studying stays available as a guest.
- Calculator statements agree across discovery, program, subject, guide and test for the same context.
- A student can locate an available PDF from its subject without entering the guide or seeing a misleading “no resources” state.
- All main tasks work by keyboard; modal focus returns correctly; opening references does not trigger answer shortcuts.
- Selected answers, flags, expansion and current-page state are available without relying on color alone.
- On a narrow screen and with enlarged text, essential controls remain reachable, long equations/graphs remain readable, and sticky surfaces do not obscure the task.
- Empty, loading, failure, unavailable and first-attempt states are distinct and offer useful recovery.
- Results separate unanswered from wrong answers, identify the exact practice context, and offer a concrete next study action.
- Guide skipping, partial guidance and direct resource access remain first-class choices; privacy and refresh behavior stay explicit.

No application behavior was changed as part of this audit.
