The goal should be to take the POC codebase and establish the production-oriented application foundation implied by the new architecture, without yet building the full product.
P0 — Production Platform Foundation
Objective: establish the technical skeleton that allows Web + iOS + Android to evolve from the POC without creating another architectural dead end.
1. Establish the monorepo / package boundaries
Create the intended separation between platform-specific applications and shared product logic:
apps/
├── web/                  # React web application
└── mobile/               # Expo / React Native

packages/
├── domain/               # Core business/domain logic
├── content/              # Content schemas + runtime
├── api/                  # API contracts/client
├── validation/           # Shared validation
├── analytics/            # Telemetry contracts
├── design-system/        # Shared design tokens
└── learning-runtime/     # Assessment/progress state

P0 outcome: future development has an explicit place to go.

Don't try to extract every existing component immediately. Establish the boundaries first and migrate deliberately.
2. Define the shared domain contracts
This is probably the highest-value P0 implementation.

Turn the architectural concepts into stable TypeScript contracts:
Program
Subject
CurriculumDomain
Concept
Question
QuestionOption
Assessment
AssessmentBlueprint
Attempt
Answer
Score
Diagnostic
RemediationPlan
LearningProgress
GuidanceEvaluation

The important distinction is:
The UI should consume domain models; the domain models should not be designed around today's UI.

For example:
Question
   │
   ├── Web renderer
   └── Mobile renderer

rather than:
WebQuestionComponent
   └── copied/reimplemented
       MobileQuestionComponent

3. Establish the content contract
Your content architecture is unusually important because MEP EA isn't simply a CRUD application.

The target pipeline is roughly:
Official / authored source
        ↓
Content ingestion
        ↓
Curriculum taxonomy
        ↓
Concept / item registry
        ↓
Blueprint
        ↓
Assessment runtime
        ↓
Scoring
        ↓
Diagnosis
        ↓
Remediation

P0 should therefore establish the canonical schemas and validation around this pipeline.

At minimum:
Question schema
Concept schema
Curriculum taxonomy
Assessment blueprint schema
Program metadata
Visual specification schema

Then make the existing content conform to those contracts where practical, rather than designing new screens around the existing ad-hoc content structures.
4. Build the shared assessment runtime
This should be the first real domain engine.

Not a complete exam product yet.

Build the platform-independent runtime responsible for:
Load assessment
      ↓
Initialize attempt
      ↓
Present item
      ↓
Record answer
      ↓
Navigate
      ↓
Persist state
      ↓
Submit
      ↓
Score
      ↓
Return result

The runtime should be usable by both:
Web
 ↓
Assessment Runtime

Mobile
 ↓
Assessment Runtime

This is where you begin converting the existing POC's useful assessment behavior into actual product architecture.
5. Implement local-first persistence
Because the architecture explicitly anticipates offline/local operation, I would make this part of P0 rather than leaving it until after mobile development.

The basic architecture:
#chatgpt-mermaid-_r_ms_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_ms_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_ms_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_ms_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_ms_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_ms_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_ms_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_ms_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_ms_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_ms_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ms_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ms_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_ms_ p{margin:0;}#chatgpt-mermaid-_r_ms_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_ms_ .label text,#chatgpt-mermaid-_r_ms_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .node rect,#chatgpt-mermaid-_r_ms_ .node circle,#chatgpt-mermaid-_r_ms_ .node ellipse,#chatgpt-mermaid-_r_ms_ .node polygon,#chatgpt-mermaid-_r_ms_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .rough-node .label text,#chatgpt-mermaid-_r_ms_ .node .label text,#chatgpt-mermaid-_r_ms_ .image-shape .label,#chatgpt-mermaid-_r_ms_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_ms_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .rough-node .label,#chatgpt-mermaid-_r_ms_ .node .label,#chatgpt-mermaid-_r_ms_ .image-shape .label,#chatgpt-mermaid-_r_ms_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_ms_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_ms_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ms_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ms_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_ms_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_ms_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ms_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ms_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_ms_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_ms_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ms_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_ms_ .icon-shape,#chatgpt-mermaid-_r_ms_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_ms_ .icon-shape p,#chatgpt-mermaid-_r_ms_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_ms_ .icon-shape .label rect,#chatgpt-mermaid-_r_ms_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ms_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_ms_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_ms_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_ms_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_ms_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_ms_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ms_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_ms_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_ms_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ms_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_ms_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_ms_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ms_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_ms_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ms_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_ms_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_ms_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_ms_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_ms_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .node rect,#chatgpt-mermaid-_r_ms_ .node circle,#chatgpt-mermaid-_r_ms_ .node ellipse,#chatgpt-mermaid-_r_ms_ .node polygon,#chatgpt-mermaid-_r_ms_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_ms_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_ms_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_ms_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_ms_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ms_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Web / Mobile UIShared Learning RuntimeLocal PersistenceSync BoundaryPlatform APIOnlineOffline / unavailable




For P0, the important thing is not necessarily implementing the complete cloud synchronization system.

Instead establish the abstraction:
PersistenceAdapter
        │
        ├── LocalAdapter
        └── RemoteSyncAdapter

That prevents the assessment engine from becoming coupled to localStorage, IndexedDB, React state, or a future backend.
6. Establish authentication boundary
Don't build the entire account system yet.

Establish the contract:
Client
  ↓
Auth abstraction
  ↓
Authenticated session
  ↓
API client

with clear separation between:
- anonymous/free user
- authenticated learner
- premium learner
- content/admin role
The architecture should allow authentication to change later without rewriting the domain/application layer.
7. Create the mobile foundation
At this point I would create the Expo application, but I would not immediately port the entire web application.

The first mobile milestone should prove:
Expo app
   ↓
Shared packages
   ↓
Shared domain
   ↓
Shared content
   ↓
Shared assessment runtime
   ↓
Local persistence

A simple diagnostic/assessment screen is enough to prove the architecture.

The objective is architectural validation, not feature completeness.
8. Keep the POC running during migration
This is important.

Don't turn P0 into a giant rewrite.

Use the existing application as the reference/validation environment while extracting production foundations:
                 P0
                  │
       ┌──────────┴──────────┐
       │                     │
 Existing POC          New Architecture
       │                     │
 visual reference       shared contracts
 functional reference  domain runtime
                       mobile foundation
                       persistence

Then progressively move capabilities from the POC into the new architecture.
P0 acceptance gates
I would make the milestone pass/fail, not a vague "architecture setup" milestone.
Gate 1 — Repository
[ ] Web application isolated
[ ] Mobile/Expo application exists
[ ] Shared package boundaries established
[ ] Build/test tooling works across packages

Gate 2 — Domain
[ ] Canonical domain types exist
[ ] No platform UI dependency in domain layer
[ ] Assessment lifecycle represented
[ ] Program/content concepts represented

Gate 3 — Content
[ ] Canonical content schemas exist
[ ] Existing representative content can be loaded
[ ] Blueprint can resolve to questions
[ ] Schema validation works

Gate 4 — Assessment
[ ] Assessment can initialize
[ ] Questions can be answered
[ ] State persists locally
[ ] Assessment can resume
[ ] Assessment can submit
[ ] Scoring is deterministic

Gate 5 — Cross-platform
[ ] Same assessment/domain package runs on Web
[ ] Same assessment/domain package runs on Expo
[ ] Platform-specific UI remains thin

Gate 6 — Architecture integrity
[ ] No new dependency from domain → React
[ ] No new dependency from domain → Expo
[ ] Content is not hardcoded into UI components
[ ] Assessment logic is not duplicated per platform
[ ] POC-specific architecture is not silently promoted to target architecture

What I would explicitly not do in P0
This is just as important.

Don't make the first milestone:
- full mobile app
- App Store / Play Store release
- complete backend
- payment integration
- complete authentication UX
- migration of every existing screen
- complete analytics dashboard
- complete notification system
- production cloud deployment
- redesign of every POC page
Those are downstream milestones.

The first objective is to establish the load-bearing architecture.
The resulting development sequence
I would therefore structure the next phase approximately as:
P0  Production Platform Foundation
 │
 ├── Monorepo / package boundaries
 ├── Shared domain contracts
 ├── Content contracts
 ├── Assessment runtime
 ├── Local-first persistence
 ├── Auth/API boundaries
 └── Expo mobile foundation
          │
          ▼
P1  Core Product Vertical Slice
 │
 ├── Program selection
 ├── Assessment
 ├── Scoring
 ├── Diagnostic
 ├── Remediation
 └── Web + Mobile end-to-end flow
          │
          ▼
P2  Content & Learning Expansion
          │
          ▼
P3  Production Backend / Accounts / Sync
          │
          ▼
P4  Guidance + Analytics + Premium
          │
          ▼
P5  Release Hardening

The key is that P0 should produce something executable, not another architecture document. By the end of it, you should have the beginnings of the real platform—Web and Expo clients consuming the same domain/content/assessment foundation—while the existing POC remains available as a reference and migration target.
