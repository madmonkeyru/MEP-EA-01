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

# Phase 2 implementation and QA

## Access during the pilot

The Free catalogue includes the official PDFs, curriculum references, DGEC calendar, helper, and one designated reference test per released program, subject, and applicable level or part. BXM Mathematics 02-2026 is the first designated reference. The BXM 01-2026 review simulation has a separate question pool and uses the 02-2026 specification to validate its section distribution.

The planned Premium tier includes original lessons and worked examples, deeper item banks, drills, and advanced analytics. The pilot exposes these features without payment or access checks. The BXM lesson on circumference equations connects evidence A1.2 to a worked example, a checkpoint, related practice, and browser-local results under Mi progreso.

## Calendar publication

The calendar is curated in one `content/calendar/YYYY.json` file per year. New convocatoria IDs become available in the calendar filters when their records are added. The newest available convocatoria is the default. Start with the local Dates INFO dump and reconcile each date against the DGEC revision before editing. Keep the official notice URL and actual verification date on the event. Use the revised annual calendar for the first convocatoria and the program notices for the second. When sources conflict, check the latest applicable notice. Use an undated entry when a date still needs confirmation. Costa Rica calendar days determine whether a date is past, in progress, or upcoming.

For a revision, update the existing event and verification date rather than adding a second copy. Before sharing, run `node scripts/ingest-validate-content.mjs` and open the calendar for the changed program and convocatoria. Check the linked official source, both EDAD parts where applicable, and the treatment of pending results dates. The validator checks dates, time ranges, official source hosts, program and convocatoria IDs, and duplicate events.

## BXM digital temario and practice

Students can search by curriculum terms or evidence code, narrow results by area, and open the original circumference lesson directly from Geometría A1.2. The practice builder can filter area, topic, concept, and varied practice by difficulty tier. The displayed question count reflects the same filter used to build the attempt. Questions without a difficulty label are available when all levels are selected.

For device QA, check that a keyboard user can search for A1.2, open the lesson, and navigate difficulty options. Confirm that a screen reader announces the changed question count and that the count matches the saved attempt. Run these checks on a phone and a desktop and record the browser, input method, and any findings before signoff.

## I & II Ciclo Mathematics release

I & II Ciclo 02-2026 has a local 31-page reference practice with a 60-entry answer key. Its specification allocates 20 points to Números, 17 to Geometría, 5 to Medidas, 11 to Relaciones y Álgebra, and 7 to Estadística y Probabilidad. The five-item sample remains available under 01-2026. The 02-2026 catalogue now offers the 60-question free reference simulation.

The 60-item [released question bank](../content/programs/i_ii_ciclo/matematica/drafts/2026-c2.json) contains newly authored prompts and distractors, an answer and worked solution for each item, and evidence codes grouped by specification block. The public blueprint registers these items only for the I & II Ciclo reference simulation. Its item IDs are separate from prior review attempts. The validator checks the draft against the official block and affirmation counts and checks that every listed evidence has an item.

Open the unlisted review route at `/#/programas/i_ii_ciclo/matematicas?convocatoria=2026-c2&seccion=review` in the running app. The draft is available to anyone with the route. Review attempts are browser-local and appear in a separate review history. The timer uses 180 minutes from the [DGEC convocatoria notice](https://dgec.mep.go.cr/wp-content/uploads/2026/08/V.2-CALENDARIO-I-y-II-Ciclo-EGBAconv.-02-2026.pdf), which lists the 08:30–11:30 Mathematics sitting and prohibits calculators. Results show five domains, and question review shows the draft ID and evidence code.

### Content provenance and review record

| Candidate | Question provenance | Structure source | Review status |
| --- | --- | --- | --- |
| I & II Ciclo Mathematics 02-2026 | Original draft questions, answer key, and explanations | I & II Ciclo 02-2026 specification and schedule notice | Independent review confirmed by the project owner. Reviewer name and review date were not supplied. |
| BXM Mathematics 02-2026 | Repository transcription of the MEP reference practice with app-authored explanations and visuals | [Local reference practice](../pdf%20docs/Practica-BxM-Matematicas-02-2026.pdf) and [structured specification](../content/programs/bxm/matematica/specs/02-2026.json) | Existing pilot reference. Record publication clearance before commercial use. |

For new item findings, record the item ID, reviewer, date, and disposition. The pilot still needs real-device keyboard and screen-reader checks for exam recovery and table review, plus student feedback.

## Next full Mathematics candidate

Start with EDAD Prueba 1, 02-2026. Its [specification](../content/programs/edad/matematica/specs/02-2026-p1.json) allocates 25 questions to Geometría, 24 to Relaciones y Álgebra, and 11 to Estadística y Probabilidad. The source inventory already includes the practice and specification PDFs. The [25-item Geometry draft](../content/programs/edad/matematica/parte-1-10mo/drafts/2026-c2-geometry.json) has original questions, distractors, an answer key, worked solutions, and evidence mappings. It remains outside the playable catalogue. Author the remaining 24 Algebra and 11 Statistics items, review all three blocks, confirm the timer and calculator rule against the Prueba 1 notice, and verify the public flow at the correct EDAD level before designating it as a reference simulation. The existing two-question EDAD sample remains the public entry until then.

## Verification

From a clean checkout run npm ci, node scripts/ingest-validate-content.mjs, npm run lint, npm run build, and npm test. Install Chromium with npx playwright install chromium. Start the built preview and run npm run test:flows with FLOW_BASE_URL pointing to it. FLOW_CHROME_PATH can select an installed Chromium-based browser. The MVP quality workflow runs these checks on pushes and pull requests.

The browser flow checks public I & II Ciclo exam preflight, answer recovery and keyboard access to a named table at 320 px. It also covers calendar filters, official PDF access, helper skip, attempt recovery, persisted results, and responsive layout. Real-device and student-pilot signoff remain pending. Record device and browser, keyboard and screen-reader findings, recovery and remediation outcomes, and resulting fixes here before release.
