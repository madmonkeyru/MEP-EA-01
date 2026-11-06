# UX/UI Quality Pass — post-M8

Date: 2026-11-06
Source: `D:/Users/amado/Desktop/Plan Doc.md` (30 review areas).

The plan is review input. Its examples are illustrative: no sample learner name, percentage, authentication state, or account capability was fabricated. This work follows the existing learning and entitlement contracts.

## Outcome and scope

The main learning home now answers “¿Qué hago ahora?” first. One canonical recommendation precedes a quiet progress summary, recent activity, and secondary study choices. Navigation is compact, the account control opens working preferences, and the curriculum uses accessible rows instead of a grid of clickable cards. Existing lesson, practice, remediation, simulation, and recheck contracts remain in place.

Tracks: UX-01 visual hierarchy; UX-02 interaction architecture; UX-03 shared design contracts; UX-04 learner journey.

“Applied” below means a concrete implementation in the relevant shared component or main learner journey. It does not mean every historical screen has been independently certified. “Reviewed” means the existing behavior was inspected and retained where it already met the plan.

## Coverage of all 30 areas

| # | Area | Track | Change / disposition |
|---|---|---|---|
| 1 | Global hierarchy | UX-01 | Applied: compact page/section/card type scale, flat supporting sections, one recommendation card. |
| 2 | Header/navigation | UX-01/02 | Applied: restrained global links and underline learning navigation; mobile four-column learning navigation and modal resource menu. Fixed simulation URL round-trip. |
| 3 | Account affordance | UX-02 | Applied: labelled person icon replaces “Perfil local opcional”; plan promotion moved into account preferences. |
| 4 | Profile/settings | UX-02 | Applied: real profile name or guest state, actual program selector, system/light/dark preferences, profile switching, progress link in BXM learning, existing plans. No fabricated cloud account/sign-out. |
| 5 | Preparation home | UX-01/04 | Applied: next action → preparation summary → recent activity → secondary choices. Removed the repeated results-history panel from home and lessons. |
| 6 | Recommendations | UX-01/04 | Applied: one heading, readable title/reason, quiet domain/time metadata, primary action and quiet secondary action. Removed codes and priority/status duplication. Recommendation decisions remain in the engine. |
| 7 | Card proliferation | UX-01 | Applied: home sections/dividers, inline mastery counts, curriculum rows, quiet study choices, flattened progress metrics. |
| 8 | Typography | UX-03 | Applied: `--type-page`, `--type-section`, `--type-card`, `--type-meta`; readable question type distinct from compact controls; restored 16px mobile root. |
| 9 | Button hierarchy | UX-03 | Applied: shared primary/secondary/tertiary/text contracts. Secondary no longer uses a filled background; recommendation has one dominant action. |
| 10 | Icons | UX-03 | Applied/reviewed: Lucide account/menu/close/book icons; informative text labels retained; decorative icons hidden from assistive technology. |
| 11 | Implementation language | UX-04 | Applied: curriculum taxonomy/codes, practice metadata, recommendation titles, recheck copy, history provenance and session identifiers translated/removed on main learner surfaces. Internal identifiers remain in contracts. |
| 12 | Temario | UX-01/02 | Applied: grouped curriculum rows, keyboard activation, real filter counts, named search field, explicit selected filters, useful no-match recovery; legacy lesson list uses a book icon instead of an evidence code. |
| 13 | Practice | UX-01/04 | Applied: readable focused question heading, translated area, quiet count and controls; removed evidence/cognitive/tier metadata from question chrome. |
| 14 | Simulation | UX-01/04 | Applied: distinct practice versus reference headings; factual reference briefing; quiet timer, higher contrast at critical time; fixed Simular navigation. |
| 15 | Results | UX-01/04 | Applied: score, strengths and reinforcement, canonical next step; cognitive/difficulty details collapsed. Removed learner-visible funnel dashboard; retained telemetry collection. |
| 16 | Mastery | UX-01 | Applied/reviewed: compact labelled counts; existing labelled mastery badges retained. Color supplements text; no invented overall readiness percentage. |
| 17 | Progress/analytics | UX-01/04 | Applied: recommendation before metrics, optional breakdowns, translated learner history, internal funnel removed from results. |
| 18 | Empty states | UX-02 | Applied: home next action, actionable missing-result recovery, no-match reset. Reviewed session/profile/progress fallbacks; existing guarded actions retained. |
| 19 | Loading | UX-02/03 | Applied: reusable contextual `FeedbackState`, lightweight static skeletons for lazy and program loading; no new artificial asynchronous loading. |
| 20 | Errors | UX-02/03 | Reviewed/applied: existing retry/resource and persistence recovery retained, shared feedback styling; missing result now has a useful return action. No promise that unsaved progress is safe. |
| 21 | Notifications | UX-02 | Reviewed/applied: retained inline completion/error feedback; removed pulsing recommendation signal and redundant reason/status badges. No new success toasts. |
| 22 | Mobile | UX-02/03 | Applied: intentionally different navigation, single-column next-action-first home, wrapping filters, 44px controls, readable text and contained math. Browser checks cover 390px and 1280px. |
| 23 | Accessibility | UX-03 | Applied: real curriculum buttons, labels/pressed/current states, semantic question heading with focus on question changes, shared modal for answer feedback, native dialog close before focus restore, timer role. Existing skip link/focus styles retained. |
| 24 | Dark mode | UX-03 | Applied: muted text and unsupported stone surface tokens corrected, quiet surfaces and active indicator contrast. Theme preferences support system. Screenshots cover both real theme states. |
| 25 | Consistency | UX-03 | Applied/reviewed: shared recommendation, dialog, feedback, mastery badge, select/theme and button contracts reused. Removed the custom answer-feedback overlay. Legacy curriculum content models were retained. |
| 26 | Design enforcement | UX-03 | Applied: `src/ui-quality.css` imported after legacy styles; common control/type/density contracts and documented ownership. Future UI should use these contracts instead of independent CTA styles. |
| 27 | Motion | UX-03 | Applied/reviewed: removed recommendation pulse; static loading skeleton; existing global reduced-motion override retained. No new entrance/card animations. |
| 28 | Density | UX-01/03 | Applied: low profile/lesson density, medium-low home, row-based curriculum, compact assessment chrome, optional results detail. See density contract below. |
| 29 | One screen/one question | UX-04 | Applied: home = next step; Temario = what to learn; lesson = understand; practice = apply; simulation = rehearse; results = improve; profile = identity/preferences. |
| 30 | Quality workstream | All | Applied: this post-M8 audit and shared design documentation track the quality pass separately from feature milestones. |

## Design contracts

- `src/ui-quality.css` owns application typography, button levels, recommendation, account, feedback, learning navigation and density styling. It is loaded after existing styles in `src/main.tsx`.
- Use `RecommendationCard` for the engine's next action. Do not add parallel recommendation decision logic in a screen.
- Use `Dialog` for modal interactions: labelled title, Escape dismissal, scroll lock, focus containment and focus restoration. Dismissal must preserve the underlying learner data.
- Use `FeedbackState` for contextual loading and recoverable empty states. Error copy must describe only what persistence actually guarantees.
- Keep codes/provenance/source/taxonomy in domain data or internal tooling. Learner copy names skills, topics, practice and progress.
- Every compact interactive control remains at least 44px tall. Reducing font size is not a substitute for responsive structure.

| Surface | Density | Primary question |
|---|---|---|
| Landing / profile / preferences | Low | Where do I start / who am I? |
| Preparation home | Medium-low | What should I do now? |
| Temario | Medium | What can I learn? |
| Lesson | Low | How do I understand this? |
| Practice / simulation | Medium-high / high | Can I apply it / rehearse the exam? |
| Results / progress | Medium | What improved and what should I reinforce? |
| Content QA | High | Is this content correct? |

## Verification record

Verification results and limitations are recorded below after the final checks. Reproduce browser checks with `UX_BASE_URL` pointing to a running Vite server and `node scripts/verify-ux.mjs` (Microsoft Edge is required by the current local harness). Screenshots and the machine-readable report are written to ignored `artifacts/ux-quality/`.

A manual screen-reader review and testing on real iOS/Android devices remain release acceptance checks. This pass does not claim WCAG certification or exhaustive visual review of all archived/administrative screens.

### Final check results

- Production build (`npm run build`): passed. Existing duplicated static/dynamic content-import warnings remain; no TypeScript errors.
- Lint (`npm run lint`): passed without warnings.
- Whitespace validation (`git diff --check`): passed.
- Full regression run: 69 files / 349 tests exercised; 348 passed. The only failure was the pre-change expectation that learner results include the internal funnel dashboard. That assertion was corrected to require the funnel to be absent, and its results suite passed on rerun.
- Final targeted rerun after the last UI changes: 3 files / 10 tests passed (results, profile/preferences and assessment runner). Earlier focused checks also verified curriculum, entitlement, remediation, simulation and route behavior.
- Browser matrix: 16 combinations = 390px/1280px × light/dark × Inicio/Temario/Practicar/Simular, without page-level horizontal overflow.
- Browser interactions: profile Escape and focus restoration, system-theme selection, mobile menu, empty search recovery, keyboard lesson activation, diagnostic answer → submission → results/recommendation all passed; no page errors. Final assessment shortcuts meet 44×44px checks.
- Visual review: light mobile home, dark desktop home, mobile question and results inspected. The final short journey was rerun after assessment toolbar and shortcut refinements.
- Dark primary-action white-text contrast is approximately 5.21:1 (`#595ce0`), compared with 4.47:1 for the previous `#6366f1` treatment.

The existing package declarations included missing local dependencies; these were restored without changing package versions. `tsconfig.app.json` now includes Node types because the existing content tools/tests import Node modules. Logs, screenshots and browser reports are under `artifacts/ux-quality/` (ignored generated output).
