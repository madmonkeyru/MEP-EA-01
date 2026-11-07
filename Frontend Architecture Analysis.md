> **The project has reached the point where content expansion is exposing an architectural boundary problem: the application does not yet have a strong enough distinction between public product/content surfaces, learner-private state, and premium capabilities.**

This is more fundamental than individual UI regressions. The front end currently has several overlapping concepts of **"what the learner can see", "what the learner owns", and "what the learner is allowed to do."** Those need to become separate architectural dimensions.

---

# 1. Current status

The project is considerably further along than a conventional MVP.

The current frontend already contains:

- public/orientation surfaces:
  - Entry
  - Programs
  - Framework
  - Calendar
  - Help
  - About/FAQ
  - official resources
- learner surfaces:
  - subject hub
  - guided learning
  - practice
  - simulations
  - results
  - progress/preparation
  - remediation
- content systems:
  - official MEP material
  - question bank
  - authored learning content
  - lessons
  - evidence catalog
  - interactive visuals
- entitlement concepts:
  - Free
  - Pro
  - capability matrix
  - paywall
- local learner state:
  - profile
  - attempts
  - active sessions
  - results
  - progress events
  - telemetry
  - preferences

The repo's own consolidation work has already identified many of the underlying problems: `App.tsx` is overloaded, routing is a flat structure, multiple assessment/progress/storage systems coexist, and the capability model is being consolidated. The execution documentation also indicates that several of these areas have already been partially addressed. 

So I **would not recommend another feature-development phase yet**.

The next phase should be an **Access + UX Architecture Consolidation**.

---

# 2. The central problem: three different meanings of "access"

I think this distinction should become foundational:

| Dimension | Question | Example |
|---|---|---|
| **Visibility** | Can I see this? | Official MEP temario |
| **Ownership** | Is this my private data? | My attempts / progress |
| **Capability** | Can I perform this action? | Start Pro practice |
| **Provenance** | Who/what does this content belong to? | Official vs authored |
| **Persistence** | Where is this state stored? | Browser profile / account |

These are currently too intertwined.

For example, a learner can encounter something that looks like:

> "My preparation"

but that screen may contain a mixture of:

- public curriculum information,
- official evidence definitions,
- learner-specific mastery,
- recommendation state,
- historical attempts,
- premium functionality.

That is precisely where the UX starts feeling inconsistent.

---

# 3. Public/private separation should be explicit

I would introduce a first-class **content/access classification model**.

Not:

```ts
if (user)
if (premium)
if (lesson.preview)
if (sampleId !== lesson.id)
```

but conceptually:

```ts
visibility
ownership
capability
provenance
```

For example:

```ts
type Visibility =
  | 'public'
  | 'learner';

type Ownership =
  | 'shared'
  | 'learner';

type Capability =
  | 'view'
  | 'practice'
  | 'save'
  | 'track'
  | 'analyze';

type Provenance =
  | 'official'
  | 'authored'
  | 'generated';
```

Then a content object could conceptually declare:

```ts
{
  provenance: 'official',
  visibility: 'public',
  ownership: 'shared',
  capabilities: ['view']
}
```

whereas a learner attempt becomes:

```ts
{
  provenance: 'learner-generated',
  visibility: 'learner',
  ownership: 'learner',
  capabilities: ['view', 'resume', 'delete']
}
```

And a Pro activity might be:

```ts
{
  provenance: 'authored',
  visibility: 'public',
  ownership: 'shared',
  capabilities: ['view', 'practice'],
  requiredCapability: 'extended_authored_practice'
}
```

That is a much cleaner mental model.

---

# 4. The biggest UX regression: private state is being treated like navigation

The current app shell makes this particularly visible.

`App.tsx` owns:

- current user
- route
- program context
- sessions
- resume state
- results
- paywall state
- context loading
- navigation
- program switching
- capability checks.

That is already documented as a P0 architectural issue. 

The problem becomes worse when private state is introduced because navigation begins carrying state that should really belong to a learner context.

For example:

```text
/programas/bxm/matematicas
/programas/bxm/matematicas?tab=progress
/programas/bxm/matematicas?tab=review
/programas/bxm/matematicas?pantalla=aprendizaje
```

The URL is increasingly becoming a mixture of:

**location + application state + learner state + workflow state.**

Those should not all have the same status.

---

# 5. Recommended information architecture

I would simplify the product around this structure:

```text
PUBLIC
│
├── Inicio
├── Programas
│   └── Programa
│       └── Materia
│
├── Recursos oficiales
├── Calendario
├── Guía / Ayuda
└── Acerca de
```

Then, once the learner enters a subject:

```text
LEARNER SPACE
│
└── Matemáticas
    │
    ├── Inicio
    │
    ├── Aprender
    │
    ├── Practicar
    │
    ├── Simular
    │
    └── Mi progreso
```

And the important distinction is:

### Public subject page

Can contain:

- curriculum
- official evidence
- official resources
- sample lesson
- benchmark explanation
- available learning material
- exam calendar

It should **not need a profile** merely to browse.

### Learner workspace

Contains:

- attempts
- mastery
- recommendations
- saved items
- active sessions
- history
- personalized route
- private results.

This should visibly feel like **"your workspace."**

---

# 6. Profile should not be the gate to public content

This is especially important given the current prototype.

The README explicitly describes the current system as browser-local: official reference exams, diagnostics/basic results and official resources are free; learner state is stored locally; billing/server authorization aren't implemented yet. 

That means the frontend should **not visually imply a production account/security boundary that does not yet exist**.

Instead:

```text
Anonymous visitor
      │
      ├── browse official content
      ├── read resources
      ├── inspect curriculum
      ├── try permitted free experiences
      │
      └── optional learner profile
              │
              ├── saved progress
              ├── attempts
              ├── results
              └── personalized preparation
```

That is much more coherent.

---

# 7. The profile UI should become a workspace switcher

This also connects to the UX issue you identified earlier around **"perfil opcional"**.

I would not make the header say something like:

> Perfil opcional

Instead, the header should communicate the current state.

For example:

```text
[ MEP-EA ]  Matemáticas    Aprender  Practicar  Simular
                                           [👤 Jim ▾]
```

Anonymous:

```text
[ MEP-EA ]  Matemáticas    Aprender  Practicar  Simular
                                      [👤 Entrar]
```

Opening it:

```text
Tu espacio
────────────────
Nombre / perfil
Progreso
Historial
Configuración
Cambiar perfil
Cerrar
```

The profile becomes a **private workspace affordance**, not another navigation system.

---

# 8. Public content needs a visual language

This is currently missing.

Official/public content should have a consistent visual treatment:

```text
┌───────────────────────────────┐
│ MEP · Recurso oficial        │
│                               │
│ Programa de estudio           │
│ Matemáticas                   │
│                               │
│ Disponible para todos        │
│                               │
│ [Explorar]                    │
└───────────────────────────────┘
```

Learner-owned content:

```text
┌───────────────────────────────┐
│ Tu progreso                   │
│                               │
│ Matemáticas                   │
│ 63% dominio                   │
│ 4 sesiones                    │
│                               │
│ [Continuar]                   │
└───────────────────────────────┘
```

Premium capability:

```text
┌───────────────────────────────┐
│ Práctica guiada               │
│                               │
│ Personalizada para tu ruta   │
│                               │
│ PRO                           │
│                               │
│ [Ver qué incluye]             │
└───────────────────────────────┘
```

The user should understand the distinction **without reading a paragraph of copy**.

---

# 9. Separate "content access" from "feature access"

This is probably the most important architectural correction.

An official MEP document can be:

> **Free to read**

while the following can still be premium:

> **Personalized practice based on that document**

Those are different things.

So:

```text
Official evidence
      │
      ├── Read ─────────────── FREE
      │
      ├── View source ──────── FREE
      │
      ├── Practice manually ── policy-dependent
      │
      ├── Personalized route ─ PRO
      │
      └── Analytics/mastery ── PRO
```

This is much better than treating the underlying content itself as premium.

The repo already has a capability model intended to make this distinction, and the consolidation work describes explicit Free/Premium capabilities and presentation-tier decisions. 

---

# 10. Fix the current entitlement architecture before adding more monetization

The repository audit identified several historical gating mechanisms:

- hub `allow()`
- lesson preview checks
- sample IDs
- evaluation widget tier checks
- feature-access checks
- subscription service
- entitlement service
- capability model.

That is exactly the type of fragmentation that produces inconsistent UI. 

The target should be:

```text
                 ┌─────────────────────┐
                 │ CapabilityProvider  │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
       Content           Practice          Progress
       rendering         launcher          analytics
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                       same decision
```

No component should independently decide:

> "I think this is premium."

It should ask the canonical capability service.

---

# 11. There is another critical distinction: official vs authored content

With the recent ingestion work, this becomes even more important.

The application now has a much richer content ecosystem:

```text
Official MEP
    │
    ├── curriculum
    ├── evidence
    ├── resources
    ├── benchmark
    └── source material

Platform-authored
    │
    ├── lessons
    ├── explanations
    ├── examples
    ├── practice
    └── remediation

Learner-generated
    │
    ├── attempts
    ├── answers
    ├── results
    ├── mastery
    └── history
```

These should **never look like one undifferentiated content pool**.

The recent integration work already recognizes provenance concerns—for example, official-past content should not silently become authored mastery. 

That principle should now be reflected in the UI.

---

# 12. I would establish three top-level UI modes

This would eliminate a lot of the current ambiguity.

### Mode 1 — Explore

Anonymous/public.

```text
Explore
│
├── Programs
├── Subjects
├── Official resources
├── Digital temario
├── Calendar
└── About
```

### Mode 2 — Study

Learner context.

```text
Study
│
├── Learn
├── Practice
├── Simulate
├── Progress
└── Study route
```

### Mode 3 — Account

Private.

```text
Account
│
├── Profile
├── Preferences
├── History
├── Saved items
└── Data
```

The key is:

**Account is not another academic navigation layer.**

---

# 13. What I would remove from the current architecture

This is where consolidation should be aggressive.

### Retire/merge

| Current concept | Direction |
|---|---|
| Entry / Welcome / Framework overlap | Consolidate |
| Helper as secondary orientation system | Reduce to Help |
| multiple "Temario" implementations | One |
| multiple Progress surfaces | One |
| multiple assessment launchers | One |
| legacy + guided session engines | One |
| multiple capability checks | One |
| multiple telemetry systems | One |
| multiple storage systems | One canonical repository |
| hub tabs + learning nav + global nav | One coherent IA |
| profile as generic optional UI | Workspace/account |
| premium labels scattered through components | Capability-driven |

The existing architecture audit already reaches essentially the same conclusion on the duplicated navigation, Temario, progress, assessment, entitlement and persistence layers. 

---

# 14. Proposed architecture

I would move toward this frontend structure:

```text
src/
│
├── app/
│   ├── AppShell
│   ├── Router
│   ├── routeTable
│   └── providers
│
├── domain/
│   ├── learner/
│   ├── content/
│   ├── assessment/
│   ├── progress/
│   └── capabilities/
│
├── features/
│   ├── explore/
│   ├── learning/
│   ├── practice/
│   ├── simulation/
│   ├── progress/
│   └── account/
│
├── content/
│   ├── official/
│   ├── authored/
│   └── generated/
│
├── services/
│   ├── contentRepository
│   ├── learnerRepository
│   ├── assessmentRepository
│   ├── progressRepository
│   └── capabilityProvider
│
└── ui/
    ├── Button
    ├── Card
    ├── Badge
    ├── PageHeader
    ├── Tabs
    ├── EmptyState
    └── AccessBadge
```

The crucial architectural boundary is:

```text
PUBLIC CONTENT
       │
       │ consumes
       ↓
CONTENT REPOSITORY
       │
       ├───────────────┐
       ↓               ↓
LEARNER ACTIONS     OFFICIAL DATA
       │
       ↓
LEARNER REPOSITORY
       │
       ├── attempts
       ├── progress
       ├── history
       └── preferences
```

The UI shouldn't need to know where the data physically lives.

---

# 15. Routing needs a similar cleanup

Instead of:

```ts
interface AppRoute {
  view?: ...
  tab?: string
  resourceTab?: string
  programId?: string
  subjectId?: string
  moduleId?: string
  ...
}
```

I would move toward discriminated route types:

```ts
type Route =
  | { kind: 'home' }
  | { kind: 'program'; programId: string }
  | { kind: 'subject'; programId: string; subjectId: string }
  | { kind: 'learning'; programId: string; subjectId: string; lessonId: string }
  | { kind: 'practice'; sessionId: string }
  | { kind: 'results'; sessionId: string }
  | { kind: 'progress'; programId: string; subjectId: string }
  | { kind: 'account'; section?: AccountSection };
```

Then invalid combinations become impossible rather than something every screen has to interpret.

This directly addresses the existing `AppRoute` problem identified in the repo audit. 

---

# 16. Proposed implementation plan

I would organize the next milestone as **Access & UX Consolidation**, with six sequential workstreams.

## P0 — Access model

**Goal:** establish what is public, learner-private and capability-gated.

Create:

```text
ContentVisibility
Ownership
Provenance
Capability
AccessDecision
```

Then document a matrix like:

| Surface | Anonymous | Free learner | Pro |
|---|---:|---:|---:|
| Official resources | ✓ | ✓ | ✓ |
| Official curriculum | ✓ | ✓ | ✓ |
| Official benchmark | ✓ | ✓ | ✓ |
| Sample lessons | ✓ | ✓ | ✓ |
| Basic results | — | ✓ | ✓ |
| Personal history | — | ✓ | ✓ |
| Personalized remediation | — | — | ✓ |
| Extended authored practice | — | — | ✓ |
| Advanced analytics | — | — | ✓ |

This becomes the source of truth.

---

# P0 — Separate public shell from learner shell

Refactor:

```text
App
```

into roughly:

```text
AppShell
│
├── PublicShell
│   ├── PublicHeader
│   └── PublicNavigation
│
└── LearnerShell
    ├── LearnerHeader
    ├── SubjectNavigation
    └── LearnerWorkspace
```

Do **not** build a separate authenticated SPA.

They share the same application, but the UX model becomes explicit.

---

# P0 — Canonical capability gate

Every gated operation goes through:

```ts
capabilities.can('extended_authored_practice')
```

not:

```ts
lesson.preview
```

or:

```ts
tier === 'pro'
```

or a component-specific condition.

The capability model already exists; the task is to make it the **only UI authorization abstraction**. 

---

# P1 — Canonical learner context

Create a single hook/provider:

```ts
useLearner()
```

that owns:

- current learner
- profile
- attempts
- progress
- active session
- history
- preferences.

Then eliminate components independently calling:

```ts
storageService.getCurrentUser()
```

or reading arbitrary localStorage.

The existing audit specifically identified inconsistent learner identity and render-time storage reads as problems. 

---

# P1 — Consolidate the navigation

Target:

```text
Inicio
Programas
Recursos
Calendario
```

publicly.

Within a subject:

```text
Inicio
Aprender
Practicar
Simular
Mi progreso
```

And:

```text
👤 Mi espacio
```

for private/account functionality.

No more competing:

- Práctica
- Simulaciones
- Progreso
- Ruta
- Mi preparación
- Temario
- Recursos
- Aprender
- etc.

as separate parallel navigation systems.

---

# P1 — Content identity system

Introduce visible but subtle metadata:

```text
OFICIAL
AUTORÍA MEP-EA
```

or:

```text
RECURSO OFICIAL
```

and:

```text
CONTENIDO DE ESTUDIO
```

and:

```text
TU PROGRESO
```

and:

```text
PRO
```

These should be semantic components, not ad-hoc badges.

For example:

```tsx
<ContentBadge provenance="official" />
<AccessBadge capability="extended_authored_practice" />
<OwnershipBadge ownership="learner" />
```

That will make the public/private distinction much more understandable.

---

# 17. P2 — Visual consolidation

Only after the above architecture is settled should you finish the visual cleanup.

The existing audit found:

- multiple button styles,
- multiple neutral palettes,
- multiple accent colors,
- duplicate page-width definitions,
- competing select implementations,
- ad-hoc badge systems,
- inconsistent typography,
- oversized/fragile component styling. 

So create a small real design system:

```text
Button
Card
Surface
Badge
PageHeader
Section
Tabs
Select
EmptyState
LoadingState
ErrorState
AccessBadge
```

This will also make the UI considerably easier to maintain as content grows.

---

# 18. The migration strategy matters

I would **not rewrite the entire frontend**.

Use a strangler migration:

```text
Existing App
     │
     ├── Public shell ───────────► New
     │
     ├── Subject hub ────────────► New
     │
     ├── Learning ───────────────► Existing → New
     │
     ├── Practice ───────────────► SessionRunner
     │
     ├── Results ────────────────► New
     │
     └── Progress ───────────────► New
```

The old implementation remains until the new journey passes regression tests.

Then delete it.

This is particularly appropriate because the project already has substantial regression coverage and multiple existing architectural layers.

---

# 19. What I would *not* do

I would **not** respond to the current problem by:

- adding more authentication screens;
- adding more profile menus;
- adding more "Premium" badges;
- hiding more content behind paywalls;
- creating another dashboard;
- adding another navigation bar;
- adding another route abstraction;
- introducing a backend account system before the frontend model is clear.

That would make the underlying problem worse.

---

# 20. Recommended milestone

I'd define the next milestone as:

## **UX-ACCESS-01 — Public / Learner / Capability Consolidation**

### Definition of done

**Architecture**

- [ ] Public and learner shell are explicit
- [ ] Learner context is centralized
- [ ] Capability decisions have one provider
- [ ] Content provenance is explicit
- [ ] Ownership is explicit
- [ ] Route types are discriminated
- [ ] `App.tsx` no longer owns the majority of application concerns

**UX**

- [ ] Anonymous users can browse official content naturally
- [ ] Private learner state is clearly identified as such
- [ ] Profile/account is separate from academic navigation
- [ ] Premium capability is distinguished from content ownership
- [ ] Official vs authored content is visually clear
- [ ] No duplicate Temario/Progress/Practice concepts
- [ ] One navigation hierarchy exists

**Regression**

- [ ] Existing active sessions survive
- [ ] Existing results survive
- [ ] Existing local learner history survives
- [ ] Free benchmark remains available
- [ ] Official resources remain publicly accessible
- [ ] No premium capability can be reached through a legacy route
- [ ] Deep links continue working
- [ ] Mobile navigation remains coherent

---

## My priority assessment

If I were directing the next development cycle, I'd rank the problem like this:

| Priority | Area | Why |
|---|---|---|
| **P0** | Public/private/capability model | Foundation for everything else |
| **P0** | Navigation consolidation | Current UX regression source |
| **P0** | Capability centralization | Prevents inconsistent paywalls/access |
| **P0** | Learner context/storage boundary | Prevents private state leaking into generic UI |
| **P1** | App/router decomposition | Makes the above maintainable |
| **P1** | Official/authored/learner provenance | Increasingly important as ingestion grows |
| **P1** | One progress/Temario/practice experience | Removes duplicated concepts |
| **P2** | Design-system polish | Should follow structural consolidation |
| **P2** | Performance/a11y refinement | Important, but downstream |

### The strategic shift

The project has moved beyond:

> **"How do we add more educational content?"**

The next question should be:

> **"How do we make a growing educational platform feel like one coherent product, where users always understand what is public, what belongs to them, what they can do, and why?"**

That is the architectural problem I would solve **before adding another major content/feature layer**.

And importantly, this isn't a theoretical redesign: much of the required groundwork is already present in `capabilityModel`, the BXM integration, the learner/progress systems, the storage registry work, and the existing consolidation effort. The job now is to **make those boundaries the actual product architecture rather than parallel foundations underneath a still-converging UI.** 
