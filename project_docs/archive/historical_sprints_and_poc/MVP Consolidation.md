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

# BXM Mathematics MVP Consolidation Plan

## 1. Define the MVP as one vertical slice

The BXM MVP should be treated as this single product:

```text
BXM Matemáticas 2026-C2
        │
        ▼
   DIAGNÓSTICO
        │
        ▼
   RESULTADOS
        │
        ▼
 RECOMMENDED NEXT STEP
        │
        ▼
      LEARN
        │
        ├── Concept
        ├── Explanation
        ├── Worked example
        ├── Interactive visual
        └── Micro-quiz
                │
                ▼
            PRACTICE
                │
        ├── Evidence
        ├── Difficulty
        └── Isomorphic
                │
                ▼
           MASTERY CHECK
                │
                ▼
          SIMULATION
                │
                ▼
       REMEDIATION / RETEST
```

The key is that **every arrow should actually work in the live application**, not merely exist in separate modules.

---

# 2. Consolidate the product around 5 student actions

I would reduce the visible BXM experience to five primary actions:

### **1 — Diagnosticarme**

> ¿Qué necesito estudiar?

Free.

Short diagnostic → domain/evidence profile → recommended next activity.

---

### **2 — Aprender**

> Entender el tema.

The Digital Temario becomes the learning surface.

Each lesson should follow:

**Evidence → Concept → Explanation → Example → Visual → Check → Practice**

The existing four lessons are enough for the MVP **if they are treated as reference-quality exemplars**, rather than pretending the entire curriculum is already covered.

---

### **3 — Practicar**

> Mejorar una habilidad.

Practice should be generated from the learner's actual profile:

- weak evidence
- recent errors
- difficulty
- cognitive level
- available reviewed items
- previous exposure

This should become the default destination after learning.

---

### **4 — Simular**

> Prepararme para el examen.

This remains a distinct experience.

The existing official/reference BXM benchmark stays protected and separate:

**60 questions / 150 minutes.**

Do **not** mix official benchmark items into the authored mastery pool. The integration master explicitly confirms that separation. 

---

### **5 — Mi progreso**

> ¿Estoy mejorando?

Show:

- diagnostic baseline
- domain mastery
- evidence progress
- first-response accuracy
- practice activity
- completed lessons
- mastery checks
- recent mistakes
- recommended next activity

Avoid presenting the current narrow content pack as an authoritative prediction of exam success.

---

# 3. Make the content graph the architectural center

This is probably the most important technical consolidation.

There should be **one canonical relationship model**:

```text
Official specification
       │
       ▼
    Evidence
       │
       ▼
    Concept
       │
 ┌─────┼───────────┐
 ▼     ▼           ▼
Lesson Example    Visual
       │
       ▼
   Micro-quiz
       │
       ▼
   Question family
       │
 ┌─────┼─────────┐
 ▼     ▼         ▼
Authored Isomorphic Official
       │
       ▼
   Assessment
       │
       ▼
 Progress event
       │
       ▼
 Mastery
```

This eliminates the danger of having:

- one taxonomy in learning
- another taxonomy in progress
- another in assessment
- another dashboard fixture

The current integration work has already identified exactly this problem. The canonical specification should remain authoritative, with adapters at module boundaries rather than duplicate taxonomies.

**Rule: one source of truth, many views.**

---

# 4. Consolidate the three BXM modules

The current implementation has effectively developed through three streams:

- **A — Learning / Temario**
- **B — Assessment**
- **C — Progress / Recommendations**

Do not merge them into one giant component.

Instead, merge their **contracts**.

### Learning owns

- lessons
- concepts
- evidence relationships
- examples
- visuals
- micro-quiz presentation

### Assessment owns

- question selection
- scoring
- retry rules
- timing
- exam/session state
- answer exposure
- completion

### Progress owns

- response events
- mastery
- recommendations
- analytics
- history

### Integration layer owns

- adapters
- context aliases
- provenance
- capability decisions
- persistence boundaries
- routing

That gives you a clean architecture:

```text
             BXM Host
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
   Learning  Assessment Progress
       \        |        /
        \       |       /
          Integration
              │
         Persistence
```

**Don't collapse the modules. Collapse the semantic boundaries between them.**

---

# 5. Make the Free/Premium boundary explicit

The current implementation already has capability/subscription adapters, so now lock the product contract.

## Free

### Always free

- official MEP resources
- official specification/reference material
- initial diagnostic
- basic diagnostic results
- one complete sample lesson per domain
- basic practice exposure
- official/reference simulation
- basic result review

The free diagnostic and sample lessons are specifically part of the current integration scope. 

## Premium

- complete learning path
- expanded lessons
- larger authored question bank
- evidence practice
- difficulty progression
- isomorphic practice
- mastery dashboard
- personalized queue
- advanced remediation
- multiple authored simulations
- historical analytics
- extended progress

### Critical rule

**Never make Premium the default when capability information is missing.**

The integration review specifically identified this as an issue that had to be corrected.

---

# 6. Fix the remaining P0/P1 technical issues before adding features

This is where I would spend the next engineering cycle.

The integration master identifies several important issues that should not be papered over.

### A. Canonical evidence catalog

The production dashboard must use the verified **71-evidence catalog**, not the older 35-entry fixture.

**Done when:**

- 71 keys present
- descriptions match canonical specification
- no invented official weights
- domain aliases work
- no second taxonomy is used by progress

---

### B. Content QA

The current authored pack should **not yet be considered release-certified**.

One statistics item has a known answer/calculation inconsistency.

Therefore:

> **30 authored items ≠ 30 release-ready items.**

Run mathematical review on:

- every authored item
- every solution
- every correct answer
- every evidence mapping
- every micro-quiz
- every worked example

This is especially important for a mathematics product.

---

### C. Isomorphic generators

Finish the contract around generated practice.

Each generated item needs:

```text
familyId
familyVersion
parameter set
seed
itemId
provenance
review status
difficulty
evidence
```

And:

> different parameters must produce genuinely different valid options.

The current integration review found declared generation families that didn't completely match the executable implementation, including the missing sphere-cut family. That should be resolved before marketing “isomorphic practice” as a finished capability.

---

### D. Assessment owns scoring

This should become an absolute architectural rule:

> **The UI never calculates authoritative assessment results.**

The micro-quiz UI sends the response to the assessment layer.

Assessment decides:

- correct/incorrect
- retry
- response index
- scoring
- exposure
- completion

Progress consumes the resulting immutable event.

This prevents the current kind of divergence where a retry callback could bypass assessment scoring.

---

# 7. Introduce a formal BXM activity model

This will simplify the dashboard and analytics considerably.

Every meaningful learner action should be one of:

```text
diagnostic
lesson
micro_quiz
practice
mastery_check
simulation_mock
simulation_benchmark
retest
remediation
```

Each activity should produce a consistent envelope:

```text
activityId
learnerId
programId
subjectId
convocatoriaId
activityType
evidenceId
conceptId
itemId
familyId
difficulty
cognitiveLevel
provenance
reviewStatus
startedAt
completedAt
responses[]
```

Then the dashboard doesn't need to know whether something came from Agent A, B, or C.

It just consumes activity records.

---

# 8. Make the recommendation engine the "glue"

The recommendation engine should answer exactly one question:

> **What should this student do next?**

For MVP, deterministic logic is preferable.

Something like:

```text
1. Is there an unfinished activity?
       ↓ yes
   Resume it

2. Is there an incomplete lesson?
       ↓ yes
   Continue lesson

3. Is there a recent incorrect evidence?
       ↓ yes
   Practice that evidence

4. Is mastery below threshold?
       ↓ yes
   Remediation

5. Has mastery been demonstrated?
       ↓ yes
   Increase difficulty

6. Diagnostic incomplete?
       ↓ yes
   Continue diagnostic

7. Otherwise
   Recommend next evidence
```

That is enough.

**No AI required.**

---

# 9. Turn the dashboard into a decision surface

Avoid a dashboard that is mostly statistics.

Instead:

### BXM Matemáticas

**Tu preparación**

> **Siguiente paso**
>
> Practica funciones — evidencia A2.x  
> Tu última sesión: 48%
>
> **[Practicar ahora]**

Then:

**Tu progreso**

| Área | Dominio |
|---|---:|
| Geometría | 72% |
| Álgebra y relaciones | 54% |
| Estadística | 81% |

Then:

**Esta semana**

- 24 preguntas
- 76% primera respuesta correcta
- 3 evidencias practicadas
- 1 dominio mejorado

Then:

**Simulación**

> Última simulación: 68%

**[Ver resultados]**

The dashboard should constantly answer:

> **What should I do now?**

---

# 10. Treat the Digital Temario as the premium learning engine

This is where I would make the largest UX investment.

Don't make it look like:

> PDF converted into HTML.

Instead:

### Example

**Geometría**

**A1.2 — Circunferencia**

> **Qué debes saber**

Short explanation.

> **Fórmulas**

Formula cards.

> **Visual**

Interactive circle.

> **Ejemplo**

Worked problem.

> **Ahora inténtalo**

Micro-question.

> **Error frecuente**

Common mistake.

> **Practica esta evidencia**

Button.

> **Tu progreso**

72%.

That creates a continuous loop between content and assessment.

---

# 11. Use the four existing lessons as the UX benchmark

This is important.

Do **not** immediately create dozens of lessons.

Take the existing four lessons and make them excellent.

They should establish the standard for:

- typography
- mathematical rendering
- interaction
- accessibility
- mobile layout
- examples
- quizzes
- feedback
- progress
- navigation
- evidence linking

Then future content authors follow that template.

This is much more efficient than expanding content before the template is stable.

---

# 12. Formalize the MVP content boundary

For release, I would explicitly state:

### BXM MVP Content Pack

**Canonical**

- 71 evidence records
- official 60-item benchmark
- official specification
- official resources

**Learning**

- 4 reviewed exemplar lessons
- 30 reviewed authored items
- 4 executable isomorphic families
- interactive circle/sphere learning

**Assessment**

- diagnostic
- practice
- mastery check
- retest
- authored mock
- official reference simulation

**Progress**

- learner-scoped history
- first-response performance
- mastery
- recommendations
- activity history

Anything beyond that is **expansion**, not MVP.

That distinction prevents the project from endlessly moving the definition of "done."

---

# 13. Release gates

I would establish four gates.

## Gate 1 — Technical

Must pass:

- full automated suite
- build
- lint
- content validation
- assessment validation
- integration validation
- no production fixtures
- persistence/recovery

The latest integration master reports the core integrated checks passing, but the remaining full-suite/release-verification distinction should be kept explicit rather than treating all historical test claims as equivalent. 

---

## Gate 2 — Mathematical

Human review required.

100% of release-visible mathematics reviewed for:

- answer
- calculation
- distractors
- wording
- evidence alignment
- difficulty
- solution
- notation
- visual correctness

This is a **hard gate**.

---

## Gate 3 — UX

Run the complete journey:

```text
New learner
 ↓
Diagnostic
 ↓
Results
 ↓
Recommendation
 ↓
Lesson
 ↓
Micro-quiz
 ↓
Practice
 ↓
Mastery
 ↓
Simulation
 ↓
Results
 ↓
Remediation
 ↓
Retest
```

Test:

- refresh
- browser back
- resume
- profile switching
- mobile
- 320px layouts
- keyboard
- screen reader/accessibility basics
- save failure
- unavailable content

---

## Gate 4 — Product

A real student should understand:

**What am I doing?**

**Why am I doing it?**

**What should I do next?**

**What do I get with Premium?**

If any of those are unclear, the MVP isn't consolidated yet.

---

# 14. What should be removed/deprecated?

I would aggressively retire **duplicate or misleading surfaces**, rather than adding more navigation.

### Deprecate

- duplicate evidence fixtures
- duplicate progress calculators
- feature-specific scoring logic
- ambiguous "mastery" calculations
- internal terminology exposed to students
- generic dashboard statistics without action
- placeholder content presented as complete exams
- old standalone learning paths that bypass the new learning loop

### Preserve

- existing official benchmark
- existing baseline exam flow
- official resources
- existing route compatibility
- legacy history through an explicit compatibility adapter

The goal is **consolidation without breaking existing functionality**.

---

# 15. Recommended implementation sequence

### Sprint 1 — Contract cleanup

**No new UX.**

- canonical 71-evidence adapter
- subject/context aliases
- activity model
- provenance model
- assessment → progress adapter
- learner scoping
- capability defaults

**Deliverable:** one coherent data contract.

---

### Sprint 2 — Content certification

- fix/quarantine known statistics item
- review all 30 authored items
- review four lessons
- verify evidence mappings
- verify generators
- implement/withdraw missing generator families
- stable generated IDs
- answer/distractor validation

**Deliverable:** BXM Content Pack v1 certified.

---

### Sprint 3 — MVP host experience

Connect:

**Diagnostic → Results → Learn → Practice → Mastery**

This is the most important product sprint.

**Deliverable:** a new learner can complete the core loop.

---

### Sprint 4 — Simulation loop

Connect:

**Practice → Simulation → Results → Remediation → Retest**

Keep the official 60-item benchmark isolated from authored mastery.

**Deliverable:** exam-preparation loop.

---

### Sprint 5 — Product boundary

- Free/Premium matrix
- capability adapter
- upgrade surfaces
- free sample lessons
- premium practice
- premium dashboard
- no billing yet

**Deliverable:** product can be demonstrated commercially without pretending payment infrastructure exists.

---

### Sprint 6 — Release hardening

- full journey
- mobile
- accessibility
- persistence failures
- performance
- recovery
- QA
- mathematical certification

**Deliverable:** BXM Mathematics MVP release candidate.

---

# 16. The most important architectural decision

I would formally declare this:

> **BXM Mathematics is the reference implementation of MEP-EA-01's learning architecture.**

Not merely the first subject.

That changes how you make decisions.

If a feature works beautifully for BXM Math but requires a BXM-specific implementation, **don't generalize it yet**.

Instead ask:

> Can this become a reusable contract that another subject can implement later?

For example:

```text
BXM Mathematics
       │
       ▼
Canonical Learning Contract
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
Cívica Sociales Español
```

This keeps the MVP small while making the architecture scalable.

---

# 17. What I would call "BXM MVP Done"

I would freeze the scope when this statement becomes true:

> **A Costa Rican BXM Mathematics student can enter the application, take a free diagnostic, understand their weaknesses, study an available concept through the Digital Temario, practice it, receive meaningful feedback, demonstrate mastery, take a realistic simulation, review mistakes, receive a targeted remediation path, and retest—while the system reliably preserves their progress.**

And technically:

> **Every student-facing learning/assessment event flows through one canonical evidence/content/assessment/progress model, with official benchmark content kept separate from proprietary mastery content.**

At that point, **stop adding BXM features**.

The next investment should be content coverage and commercial infrastructure—not another architectural rewrite.

### Suggested immediate backlog

| Priority | Task | Outcome |
|---|---|---|
| **P0** | Canonical 71-evidence integration | One taxonomy |
| **P0** | Certify/quarantine 30 authored items | Safe content |
| **P0** | Harden isomorphic families | Reliable generated practice |
| **P0** | Unified activity/event contract | One learning history |
| **P0** | Diagnostic → lesson → practice → mastery host | Core MVP |
| **P1** | Simulation → remediation → retest | Complete preparation loop |
| **P1** | Free/Premium capability boundary | Commercial-ready UX |
| **P1** | Dashboard as "next action" engine | Better student experience |
| **P1** | Mobile/accessibility release QA | Usable MVP |
| **P2** | Expand lessons/content | Scale BXM coverage |
| **P2** | Billing/accounts/cloud sync | SaaS transition |
| **Deferred** | AI tutor, gamification, other subjects | After reference MVP |

**In short:** don't build *more* BXM MVP. **Finish and consolidate the BXM MVP that is already there.** The repository is now sufficiently mature that the highest-value work is making the existing learning, assessment, and progress systems behave as one product.