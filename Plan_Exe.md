# Front-end architecture audit and consolidation plan

I read through the code you attached. I haven't seen the running app, so a few items are marked **(verify)**: they follow from the code, but I'd confirm them visually or in the browser.

## Diagnosis

The app grew as **three overlapping products sharing one shell**:

1. A **legacy exam/practice app** (`TestShell`, `ResultsPage`, `storageService`, numeric `Item` ids).
2. A **guided BXM learning app** (`BxmLearningHub`, `SessionRunner`, `BxmLearningStore`, string ids).
3. A **portal/orientation layer** (Entry, Welcome, Framework, Helper, Wizard, Calendar).

Each has its own navigation, session engine, storage, telemetry, gating logic and visual conventions. Most of the "mash-up" feeling comes from this duplication. Fixing styling alone won't resolve it, and the fix starts with decisions about which surface survives.

## Findings by area

Priority: **P0** = fix before wider release or it blocks other work, **P1** = core consolidation, **P2** = polish and scale.

### A. Information architecture and navigation

| ID | Finding | Pri |
|---|---|---|
| A1 | Three stacked navigation systems with overlapping labels: global (`appNavigation`: Práctica/Simulaciones/Progreso), hub tabs (Práctica, Simulaciones, Recursos, Temario Digital, Ruta de estudio, Mi progreso), and learning nav (Inicio, Aprender, Practicar, Simular, Mi preparación, Volver a Matemáticas). | P0 |
| A2 | Four things called "temario": `DigitalTemarioView` (hardcoded lessons), `BxmDigitalTemario` (71 evidences, JSON-driven), `PreparationPathView` (hardcoded A1.2 article plus blocks), and `SpecsTable` (the "Temario" resource tab). | P0 |
| A3 | Three progress surfaces: legacy "Mi progreso" history, "Mi preparación" dashboard, and "Ruta de estudio". In the learning hub, `tab==='progress'` renders both the dashboard (or paywall) and a results list, so free users see both. | P0 |
| A4 | Seven names for similar assessments: Simulaciones / Simular / Simulacro de práctica / Simulación de referencia / Prueba completa de referencia / Ensayar el examen / Examen oficial. Diagnostics differ too: 8 items in legacy, 20 in guided. | P0 |
| A5 | Many entry points into BXM Math (Entry, Welcome featured card, Framework, SubjectHub, "Ver mi preparación") and four pages that orient the learner to a program (Entry, Welcome, Helper, Wizard). | P1 |
| A6 | Wayfinding is inconsistent: breadcrumbs on Framework/SubjectHub, none in the learning hub, and a different `ActivityContext` on test/results. | P1 |
| A7 | The exam player has its own chrome (`TestShell` header plus its own `ThemeToggle`), and the guided assessment hides the global header. The two "focus modes" behave differently. | P2 |

### B. App shell and routing

| ID | Finding | Pri |
|---|---|---|
| B1 | `App.tsx` is a god component: routing, context loading, session lifecycle, resume/discard dialogs, program switching and MVP gating. | P0 |
| B2 | `AppRoute` is one flat bag of optional fields. `tab`/`seccion` means different things per view, with aliases (`diagnostic`↔`inicio`). | P0 |
| B3 | The MVP is hardcoded: `bxm && matematicas && 2026-c2` in `App.tsx`, `program.id !== 'bxm'` in `LandingPage`, `programId === 'bxm'` in `Header`. | P1 |
| B4 | Identifier drift: `matematica`/`matematicas`; spec id `02-2026` vs convocatoria `2026-c2`; `functions`/`algebra`. These are patched with aliases in navigation, dataService and contracts. | P1 |
| B5 | Convocatorias are hardcoded (`2026-c1`/`2026-c2`) in `readRoute` (anything else silently becomes c2), `ContextControls`, `ProgramSchedulesOverview` and `WelcomePage`. This breaks in 2027. | P1 |
| B6 | `curriculumService.getSpecTable` silently falls back to the BXM spec for unknown keys, so another program can show BXM data. | P1 |
| B7 | Components parse `window.location.hash` directly and call `history.replaceState` (`OfficialResources`, `TermsDictionary`, `HelperPage`). Router state can drift because `replaceState` doesn't fire `hashchange`. | P1 |
| B8 | No 404 or invalid-state route: unknown paths become "welcome". | P2 |

### C. Parallel implementations to retire

| ID | Duplicate | Pri |
|---|---|---|
| C1 | Session engines: `TestShell`/`TestSession` vs `SessionRunner`. | P0 |
| C2 | Result pages: `ResultsPage` vs `BxmSessionResultBreakdownView` plus the launchpad in the hub. | P0 |
| C3 | Practice configuration: `EvaluationModulesWidget` vs the guided `LearningConfiguration` flow. | P1 |
| C4 | Remediation: `remediationEngine` (hashes string ids to numbers to adapt) vs the `recommendationsEngine` plan. | P1 |
| C5 | Telemetry: `storageService.logTelemetryEvent` vs `telemetryService`, using different keys. | P1 |
| C6 | Entitlements: `subscriptionService`, `entitlementService` and `capabilityModel`, all reading `mep_ea_subscription_tier`. | P0 |
| C7 | Persistence: `persistenceService` (appears write-only; verify) vs `storageService`, `BxmLearningStore` and `BxmProgressStorage`. | P0 |
| C8 | Calendar data: the same `import.meta.glob` repeated in four modules. | P2 |
| C9 | Dead or compat code: `ResourceLibraryPage`, `PracticeConfigModal`, the `LandingPage` alias, `QuickStatsBanner` (verify), `TelemetryFunnelDashboard`, and `hubPanel`/`hubButton`. | P2 |

### D. State, persistence and data flow

| ID | Finding | Pri |
|---|---|---|
| D1 | More than 15 localStorage key families with no registry, versioning policy, quota handling or "delete my data" UI: `mep_ea_*`, `bxm-mvp-progress:*`, `mep_local_profiles`, `mep_reading_list` (shared across profiles), two telemetry keys, and others. | P0 |
| D2 | Storage is read during render (`getContextAttempts`, `store.getActive()`, `progress.getEvents()` JSON-parsed every render). Re-render is forced via a `revision` counter. | P1 |
| D3 | `BxmLearningHub` recomputes mastery several times per render (inline IIFEs and multiple `useMemo`s with `new Date()`), and runs `selectActivity` on every render. | P1 |
| D4 | Learner identity is threaded inconsistently: `userId` is a prop for the hub, but legacy pages call `storageService.getCurrentUser()` internally. The telemetry anon id isn't linked to profiles. | P1 |
| D5 | No shared data hooks or store (`useLearner`, `useAttempts`, `useCapabilities`), so every screen hand-rolls reads and subscriptions. | P1 |

### E. Design system and styling

| ID | Finding | Pri |
|---|---|---|
| E1 | No primitives: Button, Surface/Card, Badge, Field, PageHeader and EmptyState are missing. CSS classes (`.primary-button`) coexist with hand-written Tailwind buttons (indigo, and amber in the learning module). | P0 |
| E2 | Two accent colours (indigo across the app, amber in the learning module) and three neutral palettes (stone, slate, zinc). | P1 |
| E3 | Missing tokens: `stone-850`/`stone-750` aren't in Tailwind's palette and are patched with `.dark .bg-stone-850` overrides. | P1 |
| E4 | `helper.css` defines `bg-paper`/`border-line` via `@theme inline` as `var(--helper-*)`, but those vars exist only under `.helper-page`/`.helper-guide`. `PlanDeNivelacionView`, `WizardDates` and `TelemetryFunnelDashboard` likely render without background or border **(verify)**. | P0 |
| E5 | CSS conflicts: `html` font-size is 90% in `index.css` vs 100% in `ui-quality.css`; `--control-radius` is 12px vs 8px; `.page-width` is defined twice with different widths; button radius is overridden under `.app-shell`. | P1 |
| E6 | Hacks that bypass the type scale: `.app-shell [class*="text-[10px]"]` overrides arbitrary sizes, and structural selectors like `.progress-workspace > div > section.grid > div` and `.learning-nav > button:not(...)` are fragile. | P1 |
| E7 | Two select strategies: `CustomSelect` vs native styled `<select>` (`LearningConfiguration`, `OfficialCalendar`). | P1 |
| E8 | Dozens of ad hoc badge/pill patterns alongside `StatusBadge`, `ScheduleBadge`, `StudentMasteryBadge` and `status-badge`. | P2 |
| E9 | Dead template CSS and assets: `App.css`, `react.svg`, `vite.svg`. | P2 |

### F. Component structure and code organisation

| ID | Finding | Pri |
|---|---|---|
| F1 | `BxmLearningHub` (~600 lines) mixes tabs, telemetry, persistence, recommendation routing and result analysis, with inline IIFEs in JSX. `BxmPreparationDashboard` is ~500 lines of repeated tab-button markup. | P1 |
| F2 | Layer inversion: `components/common/StudentMasteryBadge` imports from `features/`, `features/bxm-progress` imports from `components/common`, and `services/remediationEngine` imports feature types. | P1 |
| F3 | Dev artifacts leak into production barrels: `BxmLearningPreview` ("Agent A"), `BxmAssessmentPreview` and `sampleItems` fixtures are exported from feature `index.ts`. The catalog is still exported as `BXM_OFFICIAL_EVIDENCES_FIXTURE`. | P1 |
| F4 | Naming tied to the build process rather than the product (agent names, `bxm-` prefixes everywhere), although BXM Math is meant to be the reference architecture for other subjects. | P2 |
| F5 | File naming doesn't match contents: `LandingPage.tsx` exports `SubjectHubPage`; `LearningText` is imported as `TextRenderer` in `BxmLessonView`. | P2 |

### G. Types and domain model

| ID | Finding | Pri |
|---|---|---|
| G1 | `CognitiveLevel`, `DifficultyTier`, `Domain` and `Tier` are each defined 3–4 times across `types/`, learning, assessment and progress. | P1 |
| G2 | Item identity is `number` (legacy) vs `string` (guided), bridged by hashing and adapter functions. | P1 |
| G3 | Heavy `any` usage in visuals and specs (`VisualRenderer`, `CartesianPlane`, `Solid3D`). `noUnusedLocals` is off. | P2 |

### H. Accessibility and responsiveness

Several things are already done well: focus-managed dialogs, skip link, reduced motion, 44px targets, tabs with keyboard support. The gaps:

| ID | Finding | Pri |
|---|---|---|
| H1 | Guided answer options are `aria-pressed` buttons with `aria-label="Opción A"`, which hides the option text from the accessible name. The legacy player uses real radios, so the two behave differently. | P0 |
| H2 | `CustomSelect` shows the label only on a hidden native select, so the visible button's name is its current value **(verify per usage)**. | P1 |
| H3 | Heading levels are inconsistent: guided runner uses the question stem as `h1`, cards jump `h2→h4`, and `RouteFocus` moves focus to the first `h1` generically. | P1 |
| H4 | Contrast needs an audit: `text-stone-400` and `text-[11px]` on light surfaces in several components. | P1 |
| H5 | Global `min-height:44px` on every `a`/`button`/`input` also hits inline prose links. The `<640px` font-size rules conflict (E5). | P2 |
| H6 | No automated a11y checks (axe) in tests or Playwright scripts. | P1 |

### I. Performance and bundling

| ID | Finding | Pri |
|---|---|---|
| I1 | `OfficialResources` renders a PDF `<iframe>` preview per card, which is heavy on mobile. Previews should load on demand. | P1 |
| I2 | Fonts load blocking from Google Fonts (privacy and offline concerns). | P2 |
| I3 | Code splitting exists only at `App` level. `dataService` eagerly globs all items and QBE bundles, plus the 4× calendar globs. `chunkSizeWarningLimit` was raised to 600. | P2 |
| I4 | The same Costa Rica map SVG is duplicated in `EntryLandingPage` and `WelcomePage`. | P2 |

### J. Content, copy and i18n

| ID | Finding | Pri |
|---|---|---|
| J1 | Spanish copy is hardcoded across components (`copy.ts` only covers onboarding). The tone for "Pro" varies: Premium / Pro / Plan Pro / PRO. | P1 |
| J2 | Magic numbers repeated in UI: "71", "60 preguntas", "150 min", "23/25/12", "20 preguntas · 30 min". They should derive from data or config. | P1 |
| J3 | Internal jargon reaches learners ("evidencia", "familias", "Habilidad formativa oficial"). | P2 |
| J4 | Hardcoded lesson and article content lives inside components (`DigitalTemarioView`, `PreparationPathView`). | P1 |

### K. Resilience

| ID | Finding | Pri |
|---|---|---|
| K1 | No app-level error boundary (only `VisualErrorBoundary`), so a render error white-screens. Lazy chunk failures aren't handled. | P0 |
| K2 | `FeedbackState` exists but loading, empty and error states are written ad hoc per screen. | P1 |

### L. Testing, tooling and hygiene

| ID | Finding | Pri |
|---|---|---|
| L1 | Tests are coupled to Spanish strings and to localStorage keys. They are spread across `src/tests/`, `__tests__/` and colocated files. | P1 |
| L2 | About 10 ad hoc Playwright scripts (different ports, `test:flows` just re-imports one), no CI config in view, no visual-regression baseline. `vitest` runs with `maxWorkers: 1`. | P1 |
| L3 | Repo hygiene: package name `temp-app`, README out of date (set_1–4, "170+ items"), stray root files, ts config scopes. | P2 |

### M. Gating and monetisation UX

| ID | Finding | Pri |
|---|---|---|
| M1 | Gating is enforced in at least five ad hoc ways: hub `allow()`, `lesson.preview`, `sampleId !== lesson.id`, `EvaluationModulesWidget` tier checks, and `checkFeatureAccess`. | P0 |
| M2 | **Free-tier bypass:** legacy area/topic/random practice is free, while guided evidence practice is premium. Free users can get unlimited practice via the legacy hub. | P0 |
| M3 | `PaywallModal` exposes a "Modo pruebas" tier toggle and a "choose plan" button that grants premium with no payment. This is acceptable only behind a dev flag. | P0 |
| M4 | The "1 Practica Oficial Gratis" label is inaccurate (the reference exam is unlimited), and free users see a paywall instead of the "basic results" the capability matrix promises. | P1 |

## Plan

### Decisions needed first (Phase 0)

These are product/architecture decisions, not engineering tasks, and the later phases depend on them:

1. **One assessment engine:** I recommend `SessionRunner` for everything, with an adapter so the official 60-item reference exam runs on it and `TestShell` is retired. The benchmark stays isolated.
2. **One IA:** I recommend Programas → Materia → four pillars (Inicio, Aprender, Practicar, Simular) plus "Mi progreso", with Recursos and Calendario global. Remove hub tabs and `path`.
3. **Free vs Premium:** decide whether legacy practice is free (then guided practice should match) or gated (then close the bypass).
4. **Routing:** keep hash routing (static hosting) but behind a typed route table, or move to history routing.
5. **Naming:** pick one name per concept and write a glossary (see J1/A4).

### Phases

| Phase | Scope | Findings addressed | Size |
|---|---|---|---|
| **0. Baseline and quick wins** (week 1) | Decisions above; golden-path Playwright journeys as the safety net; axe plus bundle/Lighthouse baselines; quick wins (below). | M3, K1, E4, E9, B6 | S |
| **1. Design foundation** (wk 2–3) | Tokens in Tailwind `@theme`; primitives (Button, Surface, Badge, Field/Select, PageHeader, EmptyState, Tabs, Dialog); one select; one accent; delete the CSS hacks and duplicate rules; a11y fixes for H1/H2/H3. | E1–E8, H1–H3, H5 | M |
| **2. Shell and routing** (wk 3–5) | Typed route table with per-view param schemas; split `App.tsx` into providers (Learner, Capabilities, ProgramContext) and route modules; single nav model with breadcrumbs; `useUrlState` hook; 404; error boundaries and standard loading/empty/error states. | A1, A6, B1–B8, K1, K2 | M–L |
| **3. Data layer** (wk 4–6, parallel to 2) | Storage registry (keys, versions, migrations, quota handling, clear-data UI); repositories plus `useSyncExternalStore` hooks; remove render-time reads; one telemetry service; one capability provider; one persistence path. | C5–C7, D1–D5, M1 | L |
| **4. Feature consolidation** (wk 6–9) | Unify practice/assessment on `SessionRunner`; one results/launchpad; one Temario (retire `DigitalTemarioView` and the `PreparationPathView` article, keep the 71-evidence tree); one progress surface; one simulation hub with the clarified names; close the free-tier bypass; split `BxmLearningHub` and the dashboard into smaller components. | A2–A5, C1–C4, C9, F1, M2, M4 | L |
| **5. Content and copy** (wk 8–10) | Glossary; centralise copy; derive counts from data; data-driven convocatoria registry; move hardcoded lesson content to JSON. | J1–J4, B5 | M |
| **6. Quality and performance** (wk 9–11) | Axe in CI; contrast fixes; on-demand PDF previews; self-hosted fonts; route-level code splitting and unified calendar module; test reorganisation (shared render helpers, fewer copy-coupled assertions, CI pipeline, visual baselines). | H4, H6, I1–I4, L1–L3 | M |
| **7. Generalise** (post-MVP) | Rename to subject-agnostic modules (`learning`, `assessment`, `progress`) driven by a program/subject config; fix layer direction (F2); shared domain types (G1, G2); remove preview/fixture exports (F3). | F2–F5, G1–G3, B3, B4 | M–L |

Sizes are rough for 1–2 front-end developers: S ≈ days, M ≈ 1–2 weeks, L ≈ 2–4 weeks. Phases 2 and 3 can run in parallel, and 4 depends on both plus the Phase 0 decisions. Calendar time is about 10–12 weeks.

### Method

- **Strangler pattern.** Build the new surface behind the existing routes, migrate journeys one at a time, delete the old code when its Playwright journey passes on the new path.
- **Contracts first.** Don't touch UI before the shared types (G1/G2) and storage registry exist.
- **No new features** during Phases 1–4 other than what the decisions require.
- **Data migration.** Phase 3 must read old keys, write new ones, and never destroy learners' existing history.

### Quick wins (this week, mostly independent)

1. Gate the paywall's tier toggle and "simulate upgrade" behind `import.meta.env.DEV` (M3).
2. Define the missing CSS variables, or move the `@theme` tokens out of `helper.css` (E4).
3. Add a root `ErrorBoundary` with a retry action, and handle lazy-chunk failures (K1).
4. Fix the `html` font-size and `.page-width` conflicts (E5).
5. Make `getSpecTable` return `undefined` instead of falling back to BXM (B6).
6. Delete the template leftovers (`App.css`, `react.svg`, `vite.svg`), rename the package, and update the README (E9, L3).
7. Give `CustomSelect` a real accessible name (H2).

### Success metrics

- One session engine, one storage layer, one capability provider, one telemetry service in the codebase.
- At most two levels of navigation, with one label per concept (glossary adopted).
- Zero axe violations on the core journeys (serious or critical), and no horizontal overflow at 320px.
- Initial JS and route chunks measured and not growing from the Phase 0 baseline; reference-exam and Temario routes lazy-loaded.
- A learner's existing history survives the storage migration (tested with fixture data).
- No free-tier path to premium-only features, verified by a test matrix.

## Next steps

The Phase 0 decisions come first, especially #1 (engine), #2 (IA) and #3 (free vs premium), because they change the scope of Phase 4. If you tell me your answers, I can turn this into a ticket backlog (IDs, acceptance criteria, dependencies) or a published document. I can also run a Playwright screenshot and axe pass over the live app to confirm the **(verify)** items and add visual evidence.