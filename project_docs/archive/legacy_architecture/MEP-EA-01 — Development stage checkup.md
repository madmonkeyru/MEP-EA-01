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

# **MEP-EA-01 — Development stage checkup**

Pre-commercial MVP

Repository reviewed: November 4, 2026

Overall assessment: MEP-EA-01 has a solid educational web prototype and meaningful mathematics/content infrastructure, but it is not yet at the point where the proposed freemium-to-premium business model is implemented.

The roadmap’s stated current phase is Phase 2: MVP hardening and content scaling. That is still the right stage. I would not move the project into a commercial launch milestone yet.

The main distinction is between having data and components that support a feature and having a complete, usable, verified student-facing feature. The latest work has expanded the former considerably; the latter remains concentrated in BXM Mathematics.

## **1\. What is actually built**

| Product area | Verified repository status | Assessment |
| ----- | ----- | ----- |
| Official resources | Official PDFs are included and browsable across programs and subjects. | Implemented |
| Digital temario | BXM Mathematics has specification tables, formulas, dictionary, and a block-based preparation path. | Partial |
| Interactive tests | BXM Mathematics, Convocatoria 02-2026, has the complete 60-question simulation and additional practice sets. | Implemented |
| Other programs’ tests | CICO, III Ciclo and EDAD have initial mathematical content and blueprint files, but not full test banks. Other subjects remain previews. | Partial |
| Helper / orientation | An optional, skippable guide with self-reported information, provisional program suggestions, and procedural checklists exists. | Implemented as guidance |
| Dynamic MEP calendar | The app does not fetch current registration, enrollment, testing, site, or results dates. | Not implemented |
| Premium access / paywall | No subscription, entitlement, checkout, or premium feature gate was found in the current implementation. | Not implemented |
| Progress and analytics | Scoring, history, remediation and funnel telemetry exist, but are stored locally in the browser. | Local-only |
| Cross-platform delivery | The app is a responsive React web application. Native packaging and real-device validation are not established by the repository evidence. | Web prototype |

The most useful source for understanding current student-facing functionality is the [capability status document](https://github.com/madmonkeyru/MEP-EA-01/blob/main/project_docs/archive/CAPABILITY_STATUS.md?utm_source=chatgpt.com). The [master architecture index](https://github.com/madmonkeyru/MEP-EA-01/blob/main/project_docs/INDEX.md?utm_source=chatgpt.com) and [roadmap](https://github.com/madmonkeyru/MEP-EA-01/blob/main/project_docs/06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md?utm_source=chatgpt.com) describe the broader target system; they should not be interpreted as evidence that those future services are already operational.

## **2\. Latest development milestone: important progress, but not full coverage**

The latest substantive change is [PR \#53 — Milestone 4: Complete MVP Multi-Program Content Expansion](https://github.com/madmonkeyru/MEP-EA-01/pull/53?utm_source=chatgpt.com), merged into `main` on November 4\.

It adds 36 mathematical concepts, 13 cross-program atomic question items, 14 convocatoria blueprint files, official specification data for additional programs, and an expanded content-validation/authoring workflow.

However, inspecting the blueprint files individually reveals this:

| Program / level | Items per blueprint |
| ----- | ----- |
| BXM Mathematics | 60 |
| EDAD, Part 1 | 2 |
| EDAD, Part 2 | 2 |
| I & II Ciclo | 5 |
| III Ciclo, 7° | 2 |
| III Ciclo, 8° | 2 |
| III Ciclo, 9° | 2 |

The counts apply to each of the corresponding 2026-C1 and 2026-C2 blueprint files. In other words, only the two BXM Mathematics blueprints are full 60-item exams. The remaining 12 are small samples, not complete exam banks.

That distinction matters commercially: a program should not appear to offer a full exam simulator merely because a blueprint and a few questions exist.

There is also a validation gap. `scripts/ingest-validate-content.mjs` checks that blueprint references resolve to existing items, but it does not enforce that a blueprint's item count matches its expected full exam length or that all required sections are complete. A small sample can therefore pass the current structural checks.

I would make this a first-class engineering task before expanding interactive access to the other programs.

## **3\. Comparison with your intended freemium and premium model**

### **Freemium**

A. Digital temarios — partially implemented

There is already a useful foundation:

* Official MEP PDFs are stored and accessible through the resource library.  
* BXM Mathematics includes official specification tables, a terms dictionary, formula sheets, and a preparation path.  
* The preparation path connects curricular blocks and evidence criteria with available questions.

What is missing is a complete digital reading experience across the programs and subjects. The current temario is primarily a structured specification/reference view, not yet the textbook-like learning environment you described.

Recommendation: keep official reference materials accessible for free. Build the premium value around additional explanations, original worked examples, expanded reading, interactive visualizations, and contextual practice—not simply access to an official document.

B. Dynamic MEP information — not implemented

The helper can ask whether students know enrollment dates and identify items they need to verify. It does not maintain a current calendar.

I would avoid trying to integrate directly with MEP systems, consistent with the architecture's stated independence from government platforms. Instead, implement a curated information service with:

* Event type: registration, document submission, enrollment, examination, exam site publication, results.  
* Program and convocatoria.  
* Opening and closing dates.  
* Official source URL.  
* Last verified date and responsible editor.  
* Status: upcoming, open, closed, or awaiting confirmation.

Every date should display its official source and last verification. Expired information should be clearly marked rather than silently presented as current.

C. One free test per subject — only partially implemented

BXM Mathematics already has a full official-reference simulation and additional practice sets. Other subjects are mainly previews, not interactive tests.

Also, no paywall currently separates the BXM official test from its additional question sets.

Your intended arrangement is commercially sensible:

* Free: one complete, verified official reference test per subject.  
* Premium: additional authored questions, combinations, drills, difficulty levels, expanded simulations, and analytics.

One important distinction: the length and structure of the official test must be derived from the relevant MEP source. Do not assume every subject or program uses the BXM 60-question structure.

D. Helper — more than a basic POC now

The existing guide is optional and skippable. It can collect self-reported academic information, generate provisional program suggestions, offer checklists, and help users explore their routes.

I would retain this foundation. Its next improvement should be to connect recommendations to verified procedural information, with clear source references and reminders that final eligibility and administrative decisions belong to the official authorities.

### **Premium**

Some of the functionality you intend to monetize already exists in BXM Mathematics:

| Premium capability | Existing foundation |
| ----- | ----- |
| Area and topic practice | Implemented |
| Concept drilldown | Implemented where question links exist |
| Dynamic mock simulations | Implemented |
| Progress and results | Implemented locally |
| Remediation and weak-area practice | Implemented locally |
| Interactive math visualizations | Implemented |
| Difficulty-based selection | Data has difficulty tiers; user-facing selection remains missing |
| Expanded textbook-style reading | Not yet established |
| Reading sessions with embedded quizzes | Not yet established |
| Large multi-subject question bank | Not yet established |

The important engineering decision is not to rebuild everything. It is to separate existing capabilities into clearly defined Free and Premium access levels, then expand the content and persistence infrastructure around them.

## **4\. Recommended next development milestones**

I would sequence the next work as follows.

Milestone 5 — Freemium and Premium Product Contract

Do first

Define the actual feature boundary before implementing payment.

Establish the access model for guest, free student, premium student, and content administrator.

Acceptance criteria:

* One official reference test is free per released subject/program combination.  
* Premium-only features are identified centrally.  
* User entitlements are checked by the application services, not only hidden in the interface.  
* Official and proprietary content are distinguishable.  
* Upgrade prompts appear at appropriate feature boundaries, without obstructing free official resources.  
  Milestone 6 — Complete and Verify the Freemium Test Catalogue  
  High priority  
  Turn the new content scaffolding into usable examination experiences.

Start with Mathematics across the four programs, then expand to the remaining subjects in planned releases.

Acceptance criteria:

* Each released test matches its official source and examination structure.  
* Every question has verified answer keys and relevant curriculum mappings.  
* Every blueprint distinguishes a sample from a complete examination.  
* Automated validation checks expected item counts, section totals, missing references, and content completeness.  
* Human pedagogical review is recorded before release.  
  Milestone 7 — Digital Temario and Premium Learning Experience

Separate the free official reference layer from the proprietary learning layer.

Free: searchable official specifications, curriculum structure, source PDFs, and basic navigation.

Premium: expanded concept explanations, textbook-like reading sessions, worked examples, visualizations, embedded quizzes, and links into modular practice.

Acceptance criteria: a concept can be followed from official evidence criterion → explanation → example → quiz → related practice, with progress tracked.

Milestone 8 — Official Information Calendar and Helper Upgrade

Build a source-backed MEP information calendar, then connect the helper to it.

Acceptance criteria:

* Events have official source links and verification timestamps.  
* Students can filter by program and convocatoria.  
* Expired and unconfirmed information is visibly distinguished.  
* Guidance produces relevant procedural checklists and links.  
* No automated integration or official eligibility determination is implied.  
  Milestone 9 — Accounts, Entitlements, Billing and Cloud Persistence

This is the real transition from prototype to commercial SaaS.

Introduce authenticated accounts, secure subscription entitlements, payment processing, purchase restoration, server-side attempt/history persistence, and synchronized progress.

Acceptance criteria: premium access is enforced independently of client-side UI state; a user retains entitlements and progress across supported devices.

Milestone 10 — Cross-platform Product Hardening

Consolidate the responsive web application, then establish the native mobile delivery path.

I recommend starting with PWA/offline capabilities before committing to a native wrapper or separate mobile client.

Acceptance criteria:

* Verified mobile and desktop journeys.  
* Reliable exam recovery and storage behavior.  
* Accessibility and performance testing on real devices.  
* Tested layouts at narrow phone, tablet, laptop, and desktop sizes.  
* A documented native-mobile implementation decision.

## **5\. Architecture and engineering risks to address**

There are four areas I would pay particular attention to.

1\. Avoid building the commercial system too early.

The architecture documents describe JWT, PostgreSQL, Redis, microservices, and subscription billing. Those are target capabilities, not the current architecture. The current application stores profiles, attempts, and telemetry in browser storage. Keep the transition deliberate: define the entitlements and persistence contracts first, then introduce the backend.

2\. Strengthen content QA.

A blueprint containing two questions should not pass as a completed examination merely because its two references exist. Improve the validator before the catalogue grows further.

I would also add semantic human review of concept mappings, not just automated checks that a referenced concept ID exists.

3\. Resolve commercial rights and provenance.

The repository contains official MEP materials, and those are valuable as reference sources. However, public availability should not be treated as automatic permission for commercial redistribution or derivative publication. Verify the applicable terms before reproducing official questions or documents in a paid product. Store source, attribution, extraction, review, and permission information alongside each content asset.

4\. Turn test reports into reproducible evidence.

PR \#53 reports 130/130 tests passing, along with TypeScript, lint, and Playwright checks. However, the repository returned no GitHub Actions workflow runs, and the existing UI validation documentation still describes real-device, accessibility, and student-pilot work as pending. I would consolidate these into a single current QA report and continuous integration workflow before declaring release readiness.

There are currently no open GitHub issues or pull requests, so this is a good opportunity to establish the next milestones as properly scoped engineering work.

## **6\. My recommended product strategy**

I would make one strategic decision now:

Build the best free official-information and baseline-testing product first; monetize the deeper learning and practice experience.

That gives MEP EA Digital a clear value proposition:

## **Free — Understand and get started**

Official temarios and documents, verified MEP dates, program orientation, and one official reference test per released subject.

## **Premium — Learn, practice and improve**

Expanded learning material, large modular question banks, advanced testing, personalized drills, detailed analytics, progress tracking, and enhanced interactive learning.

This also makes the subscription proposition easier to explain: students pay for a sustained learning and preparation system, not for access to information that should remain freely available from official sources.

Bottom line: continue Phase 2, but shift its focus from simply adding more content files to building a verified free catalogue and an explicit commercial feature boundary. Once those are in place, Phase 3 becomes a much more credible investment.

Useful repository references: [Milestone 4](https://github.com/madmonkeyru/MEP-EA-01/pull/53?utm_source=chatgpt.com) · [Content manifest](https://github.com/madmonkeyru/MEP-EA-01/blob/main/content/manifest.json?utm_source=chatgpt.com) · [Content validator](https://github.com/madmonkeyru/MEP-EA-01/blob/main/scripts/ingest-validate-content.mjs?utm_source=chatgpt.com) · [Application routing](https://github.com/madmonkeyru/MEP-EA-01/blob/main/src/App.tsx?utm_source=chatgpt.com) · [Roadmap](https://github.com/madmonkeyru/MEP-EA-01/blob/main/project_docs/06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md?utm_source=chatgpt.com).

Weekly MEP-EA-01 development check  
