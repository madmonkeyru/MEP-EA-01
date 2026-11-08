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

# **1\. Turn BXM Math into a complete learning loop**

The strongest next feature is:

**Official evidence → concept → explanation → example → practice → diagnosis → remediation → retest**

For example:

> **Geometría → Circunferencia → A1.2 → concept explanation → worked example → 5-question drill → “you struggle with radius/center” → targeted practice → mastery check**

This uses the taxonomy already defined in the content architecture rather than creating a second pedagogical model.

The current content schema already supports `concept_id`, `linked_concepts`, `evidence_id`, cognitive level, difficulty, formulas, prerequisites and solutions.

### **2\. Build a real Digital Temario BXM Mathematics**

The existing temario is more of a structured specification/reference layer. The pilot could demonstrate the richer version:

**Bloque**  
→ **Afirmación**  
→ **Evidencia**  
→ **Conceptos**  
→ **Mini lesson**  
→ **Worked examples**  
→ **Interactive visual**  
→ **Quick quiz**  
→ **Practice items**

For example, a Geometry page could contain:

* What you need to know  
* Key formulas  
* Definitions  
* Visual intuition  
* Worked example  
* “Try one”  
* Common mistakes  
* Official evidence being assessed  
* Related practice  
* Mastery status

That would make the **temario itself a product**, rather than simply a PDF replacement.

### **3\. Add micro-quizzes inside the temario**

This is particularly attractive for the freemium model.

Instead of:

> Read 20 pages → go take a test

use:

> Read concept → answer 2 questions → continue → answer another question → finish the topic.

These can be very small:

* **Check your understanding**  
* True/false  
* Select the correct graph  
* Identify an error  
* Calculate a value  
* Match formula ↔ situation

The existing item infrastructure means these don't need to be a completely separate content type.

### **4\. Add a “Why is my answer wrong?” flow**

The current pilot already requires independent step-by-step solutions.

Go one step further.

After an incorrect answer:

**Your answer:** C  
**Correct:** B

Then:

> **What went wrong?**

Possible diagnostic categories:

* Formula selection  
* Algebraic manipulation  
* Arithmetic  
* Reading the graph  
* Misread the question  
* Concept misunderstanding

Then show the relevant explanation.

This is much more valuable than simply displaying the correct answer.

### **5\. Exploit the cognitive-level metadata**

The pilot already distinguishes:

* `reproducción`  
* `conexión`  
* `reflexión`

That can become a visible practice dimension.

For example:

**Practice mode**

* 🟢 Reproducción  
* 🟡 Conexión  
* 🔴 Reflexión

Then a student could discover:

> “I score 82% on reproduction but only 48% on reflection.”

That is substantially more informative than an overall 82%.

### **6\. Add a difficulty progression**

The data already has difficulty tiers.

Turn that into:

**Level 1 → Level 2 → Level 3**

with automatic progression.

For example:

> You have mastered Level 1 Geometry.  
> Try Level 2\.

And eventually:

> **Challenge unlocked:** 3 reflection-level questions.

This could become one of the main Premium differentiators.

### **7\. Create a BXM diagnostic exam**

Separate from the official 60-question benchmark.

For example:

**“Discover what you need to study — 20 questions / \~30 min.”**

The engine selects questions across:

* Geometry  
* Relations & Algebra  
* Statistics & Probability  
* Multiple cognitive levels  
* Multiple difficulty tiers

The result isn't merely:

> 14/20

but:

| Area | Result |
| ----- | ----- |
| Geometry | 75% |
| Algebra | 55% |
| Statistics | 80% |
| Reproduction | 90% |
| Connection | 60% |
| Reflection | 40% |

Then:

**Your recommended study path**

1. Functions  
2. Analytic geometry  
3. Probability  
4. Reflection-level practice

That would make the existing remediation infrastructure much more visible.

### **8\. Add a “Prepare for BXM” dashboard**

For BXM Mathematics specifically:

**My preparation**

* Overall mastery  
* Geometry  
* Algebra  
* Statistics  
* Evidence mastery  
* Questions completed  
* Accuracy  
* Current streak  
* Weakest areas  
* Recommended next activity  
* Last simulation  
* Estimated readiness

And importantly:

> **Readiness is an internal study indicator, not a prediction of official exam results.**

The architecture already anticipates longitudinal diagnostics and predictive passing algorithms, but this can initially be implemented much more simply.

### **9\. Add “Study by evidence”**

This could become one of the best features in the pilot.

Instead of browsing by topic:

> Geometry → Circunferencia

allow:

> **A1.2 — \[official evidence\]**

Then show:

* What this evidence means  
* Related concepts  
* Official benchmark questions  
* Authored questions  
* Worked examples  
* Difficulty distribution  
* Student mastery  
* Practice this evidence

This aligns the product directly with the MEP specification rather than merely organizing content according to conventional textbook chapters.

### **10\. Create isomorphic practice**

This is especially important because the repository already has an Isomorphic Question Generation Framework.

Instead of showing the same question repeatedly:

> Original: radius \= 5

generate an equivalent authored variant:

> radius \= 8

while preserving:

* same mathematical skill  
* same evidence  
* same cognitive level  
* same difficulty  
* different numbers/context  
* independently verified solution

That creates effectively **much more practice from the same pedagogical blueprint** without copying official questions.

### **11\. Add a “Common mistakes” knowledge layer**

For each concept:

**Circunferencia**

> ⚠️ Common mistake: confusing the radius with the diameter.

> ⚠️ Common mistake: sign error when reading the center from standard form.

> ⚠️ Common mistake: using the distance formula incorrectly.

Then connect those mistakes to diagnostic responses.

This is an excellent bridge between the question bank and the learning content.

### **12\. Make the SVG visuals interactive**

The current pilot has already invested heavily in parametric SVG, including `CartesianCanvas`, `Solid3D`, `BoxPlot`, `TableVisual` and `DistributionCurve`.

Don't stop at rendering them.

For example:

**Circle**

* drag the center  
* change radius  
* observe equation update  
* identify point as interior/exterior/on circle

**3D sphere**

* manipulate cutting plane  
* observe resulting cross-section  
* change radius/distance  
* see relationship update

This converts the existing visualization infrastructure into an actual **learning component**.

### **13\. Add “Show me another way”**

For mathematical solutions:

> **Solution**

Then:

* Algebraic method  
* Graphical method  
* Formula method  
* Reasoning method

Not every question needs all four, but where appropriate this is powerful pedagogically.

### **14\. Add exam-mode vs study-mode**

The same item engine can support two very different experiences.

**Study mode**

* Formula access  
* Hints  
* Retry  
* Explanation  
* Visual manipulation  
* Immediate feedback

**Exam mode**

* No hints  
* No feedback  
* Fixed timer  
* Official-like navigation  
* Question flagging  
* Final submission  
* Results afterward

This distinction would make the BXM simulator substantially more credible.

### **15\. Add a question review / flagging workflow**

During a simulation:

> 🔖 Mark for review

At the end:

**Unanswered: 2**  
**Marked: 5**

Then:

> Review marked questions

This is a small feature but important for reproducing the examination experience.

### **16\. Build a personal question queue**

After every session:

> **Practice next**

Automatically select questions based on:

1. Weak evidence  
2. Low accuracy  
3. High importance/weight  
4. Recently incorrect  
5. Appropriate difficulty

That produces a personalized queue without requiring a complicated AI tutor.

### **17\. Add a “Last 7 days” learning report**

For example:

> **This week**

> 46 questions answered  
> 78% accuracy  
> \+9% Geometry  
> 3 evidence areas improved  
> 2 areas need attention

This can initially remain local and later migrate to server-side accounts.

---

## **18\. A particularly valuable BXM-specific flow**

I'd implement this end-to-end:

**Landing**

→ **“¿Cómo estás para Matemáticas BXM?”**

→ 10–20 question diagnostic

→ **Results**

→ identify weak evidence

→ **Recommended study plan**

→ Digital Temario

→ concept lesson

→ embedded micro-quiz

→ worked example

→ targeted practice

→ isomorphic practice

→ mastery check

→ full simulation

→ post-exam remediation

→ repeat diagnostic

That's a **complete educational product loop**, not just an exam simulator.

---

## **19\. Use the official 60-item pilot as the benchmark, not the whole Premium product**

This distinction is important given the project's legal/content architecture.

The pilot already deliberately separates:

**Stream A — Official Reference Benchmark**

from

**Stream B — Proprietary Authored Mastery Items**.

I'd exploit that separation directly:

| Free | Premium |
| ----- | ----- |
| Official BXM reference test | Large authored bank |
| Official specification | Expanded explanations |
| Basic temario/reference | Full learning paths |
| Basic formulas | Guided examples |
| Basic results | Longitudinal analytics |
| Limited practice | Evidence-based drills |
| Official resources | Isomorphic practice |
| Basic diagnosis | Personalized remediation |
| Basic simulation | Advanced simulations |
| — | Mastery tracking |

That makes the commercial proposition much cleaner: **the student doesn't pay to access official information; they pay for the learning system built around it.**

---

## **20\. One thing I would add specifically for this pilot: BXM Math Content Pack v1**

Rather than implementing all of these features simultaneously, I'd turn the pilot into a self-contained vertical slice:

**BXM Mathematics 02-2026**

**Content**

* 60 official benchmark items  
* 100+ authored mastery items  
* All 3 domains  
* Evidence mappings  
* Concept registry  
* Worked solutions  
* Common mistakes  
* Isomorphic variants

**Experiences**

* Official reference exam  
* Diagnostic  
* Topic practice  
* Evidence practice  
* Concept learning  
* Micro-quizzes  
* Remediation  
* Difficulty progression  
* Exam mode  
* Study mode

**Analytics**

* Domain mastery  
* Evidence mastery  
* Cognitive-level performance  
* Difficulty performance  
* Historical attempts  
* Recommended next activity

**Visual**

* Interactive SVG geometry  
* Interactive graphs  
* Statistical visualizations  
* Formula interactions

That would make BXM Mathematics the **reference implementation of the entire MEP-EA product architecture**.

The repository's own pilot standard already gives you an excellent quality boundary: all 60 items verified, zero QA errors/warnings, mobile readability, KaTeX validation, visual fidelity and end-to-end journey testing.

### **My priority order**

**P0 — Do next**

1. Digital Temario → Concept → Evidence → Practice flow  
2. BXM diagnostic  
3. Domain/evidence mastery dashboard  
4. Study vs Exam mode  
5. Premium/free capability boundary

**P1**  
6\. Isomorphic practice generation  
7\. Common-mistake remediation  
8\. Difficulty progression  
9\. Personalized practice queue  
10\. Interactive SVG learning

**P2**  
11\. Learning plans  
12\. Weekly progress reports  
13\. Advanced analytics  
14\. Gamification/streaks  
15\. Cross-device persistence

**P3**  
16\. AI tutor/chat layer  
17\. More subjects  
18\. Institutional/tutor features

I would **not start with an AI tutor**. The repository already has unusually good structured mathematical metadata; extracting more value from that deterministic content graph should come first. The AI layer can eventually sit on top of it rather than becoming the source of truth.

