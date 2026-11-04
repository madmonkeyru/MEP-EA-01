# MEP EA Digital · System design blueprint

The platform supports Costa Rica’s Educación Abierta learners from program selection and enrollment preparation through study, practice, and progress review. The production diagrams describe a proposed architecture. Program coverage defines the target curriculum scope. Each program, level, subject, and convocatoria requires approved content before it becomes available to learners.

The [source SVG](../Project-Solutions-Development.svg) defines the product scope. The [repository README](../README.md) and the [infrastructure](01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md), [domain](02_CORE_SERVICES_AND_DOMAIN_MODEL.md), [content](03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md), and [guidance](07_ENROLLMENT_AND_PRIOR_RECOGNITION_ENGINE.md) specifications provide implementation context. Each Mermaid block is a standalone view of the same system.

## 1. Academic scope and boundaries

```mermaid
flowchart TB
    EA["Educación Abierta"]
    EA --> CICO["I y II Ciclo · Primary"]
    EA --> III["III Ciclo · Lower secondary"]
    EA --> EDAD["Educación Diversificada a Distancia · EDAD"]
    EA --> BXM["Bachillerato por Madurez Suficiente · BXM"]
    CICO --> PRIMARY["Mathematics · Spanish · Social Studies<br/>Sciences · Formación Ciudadana"]
    III --> S7["Sétimo · 7°"]
    III --> S8["Octavo · 8°"]
    III --> S9["Noveno · 9°"]
    S7 & S8 & S9 --> LOWER["Per grade · Mathematics · Spanish · Social Studies<br/>Sciences · Formación Ciudadana · English"]
    EDAD --> P1["Parte 1 · 10°"]
    EDAD --> P2["Parte 2 · 11°"]
    BXM --> EXIT["Unified subject exams · 10° and 11° content"]
    P1 & P2 & EXIT --> UPPER["Per track or part · Mathematics · Spanish · Social Studies<br/>English · science choice of Biology, Chemistry, or Physics"]
    EA -.-> LIMITS["Current scope exclusions"]
    LIMITS --> MEP["MEP system integration"]
    LIMITS --> VIDEO["Video content"]
    LIMITS --> NAT["Naturalización · possible later extension"]
    LIMITS --> FRENCH["French · English is the supported option where offered"]
```

## 2. Proof of concept

```mermaid
flowchart LR
    REPO["Versioned source and content<br/>React · TypeScript · Vite · JSON · public assets"]
    REPO --> BUILD["Static application build"]
    BUILD --> HOST["Testing host · Vercel as the example"]
    HOST --> BROWSER["Learner browser"]
    subgraph CLIENT["Browser runtime"]
        BROWSER --> HUB["Program and subject navigation<br/>Content availability varies by subject"]
        HUB --> GUIDE["Program information and guidance"]
        HUB --> LEARN["Learning resources<br/>Terms · formulas · specifications"]
        HUB --> PRACTICE["Practice and timed simulation<br/>BXM Mathematics is the documented pilot"]
        LEARN & PRACTICE --> VISUAL["KaTeX and interactive SVG"]
        PRACTICE --> REVIEW["Local scoring · explanations · attempt history"]
        HUB & PRACTICE & REVIEW --> LOCAL[("Browser localStorage<br/>Preferences · active session · history")]
    end
```

## 3. Proposed production architecture

```mermaid
flowchart TB
    LEARNER["Learner · mobile or desktop browser"]
    STAFF["Authorized staff · content, support, operations"]
    LEARNER & STAFF --> EDGE["DNS · CDN · TLS · WAF · rate limits"]
    EDGE -->|Public cacheable assets| PUBLIC[("Static web origin and approved public resources")]
    EDGE -->|API requests| GATE["API ingress · request limits and token validation"]
    LEARNER & STAFF <-->|Sign-in| IDP["Managed identity provider · OIDC · staff MFA"]
    IDP -->|Signing keys| GATE

    subgraph APP["Private application tier · stateless replicas across availability zones"]
        API["Modular application API<br/>Authorization by role, resource ownership, and entitlement"]
        API --> PROFILE["Accounts · roles · learner profiles"]
        API --> CATALOG["Academic catalog · versioned rules"]
        API --> GUIDANCE["Enrollment · forms · recognition guidance"]
        API --> SCHEDULE["Global convocatoria calendar<br/>Personal deadlines and reminders"]
        API --> LEARNING["Learning paths · text · SVG · approved documents"]
        API --> EXAM["Practice · diagnostics · simulation<br/>Compilation · session · scoring · review"]
        API --> PROGRESS["Progress · mastery · reporting"]
        API --> SUPPORT["Support · tutoring tools · staff work queues"]
        API --> CMS["Content operations · QA · publishing"]
        WORK["Independently scaled workers"]
    end

    GATE --> API
    API & WORK --> DB[("Managed PostgreSQL<br/>Multi-zone failover · connection pooling · PITR")]
    API --> CACHE[("Managed cache where load warrants it<br/>Rebuildable indexes and reference data")]
    API & WORK --> STORE[("Private object storage<br/>Versioned content and restricted artifacts")]
    WORK -->|Approved public subset| PUBLIC
    DB -->|Committed outbox records| RELAY["Outbox dispatcher"]
    RELAY --> QUEUE["Durable queues · bounded retries"]
    QUEUE --> WORK
    QUEUE --> DLQ["Dead-letter queue · alert and controlled replay"]
    WORK --> NOTIFY["In-app notifications and email provider"]
    NOTIFY -->|Reminders and support updates| LEARNER
    NOTIFY -->|Delivery status| OPS
    WORK --> ANALYTICS[("Reporting read models<br/>Aggregated learning and operational metrics")]
    PROGRESS --> ANALYTICS
    API & WORK --> AUDIT[("Restricted audit trail")]
    EDGE & GATE & API & WORK & DB & QUEUE --> OPS["Central metrics · logs · traces · alerts"]
    KEY["Managed keys and secrets"] -.-> API
    KEY -.-> WORK
    KEY -.-> DB
    KEY -.-> STORE
```

Deploy one modular API initially, with workers scaled separately. The component boxes represent domain responsibilities within that API. Keep production and test environments isolated. Cache only public responses at the CDN and serve authenticated content through authorized requests or short-lived scoped URLs. Treat the database as the source of truth for attempts, guidance state, and publication records.

## 4. Academic and learner data model

```mermaid
erDiagram
    PROGRAM ||--|{ STAGE : contains
    STAGE ||--o{ OFFERING : defines
    SUBJECT ||--o{ OFFERING : labels
    PROGRAM ||--o{ CONVOCATORIA : schedules
    OFFERING ||--o{ BLUEPRINT_VERSION : governs
    CONVOCATORIA ||--o{ BLUEPRINT_VERSION : contextualizes
    CONVOCATORIA ||--o{ CALENDAR_EVENT : includes
    CONTENT_RELEASE ||--|{ BLUEPRINT_VERSION : packages
    CONTENT_RELEASE ||--o{ LEARNING_RESOURCE_VERSION : publishes
    OFFERING ||--o{ LEARNING_RESOURCE_VERSION : scopes
    BLUEPRINT_VERSION ||--|{ BLUEPRINT_ITEM : selects
    ITEM_VERSION ||--o{ BLUEPRINT_ITEM : references
    LEARNER ||--o{ STUDY_PLAN : maintains
    OFFERING ||--o{ STUDY_PLAN : targets
    STUDY_PLAN ||--o{ GUIDANCE_CASE : tracks
    GUIDANCE_CASE ||--o{ CHECKLIST_ITEM : contains
    FORM_VERSION o|--o{ CHECKLIST_ITEM : informs
    STUDY_PLAN ||--o{ REMINDER : schedules
    CALENDAR_EVENT o|--o{ REMINDER : triggers
    STUDY_PLAN ||--o{ ATTEMPT : records
    BLUEPRINT_VERSION ||--o{ ATTEMPT : anchors
    ATTEMPT ||--|{ ATTEMPT_ITEM : snapshots
    ITEM_VERSION ||--o{ ATTEMPT_ITEM : identifies
    ATTEMPT_ITEM ||--o| RESPONSE : receives
    ATTEMPT ||--o| SCORE : produces
    STUDY_PLAN ||--o{ MASTERY_SNAPSHOT : aggregates
```

An offering identifies a subject in a particular stage. A stage can be an entire track, a grade, or an EDAD part. Version source references, prerequisite and recognition rules, forms, calendar dates, assessment policies, and content. Preserve the item versions and ordering selected for each attempt so scores and reviews remain reproducible after later releases.

## 5. Enrollment, forms, calendar, and recognition

```mermaid
flowchart TD
    START["Learner selects program, stage, subjects, and convocatoria"]
    START --> RULES["Load reviewed rules, form versions, and dates<br/>Record source and effective version"]
    RULES --> SELF["Learner supplies relevant prior study and eligibility details"]
    SELF --> CHECK{"Applicable guidance pathway?"}
    CHECK -->|Standard entry| NORMAL["Enrollment checklist and prerequisites"]
    CHECK -->|Prior study or equivalency| RECOG["Evaluate formal study, cross-program credits,<br/>or foreign-study pathway where applicable"]
    CHECK -->|Unclear or incomplete| HELP["Flag uncertainty · route to support or official guidance"]
    RECOG --> NORMAL
    HELP --> NORMAL
    NORMAL --> FORMS["Identify applicable forms, evidence, and submission instructions"]
    NORMAL --> DATES["Combine global calendar with relevant personal dates<br/>Enrollment windows · exams · optional reminders"]
    FORMS --> HANDOFF["Learner completes and submits through the official channel"]
    HANDOFF --> STATUS["Learner records submission or outcome manually"]
    DATES --> ALERT["Reschedule reminders when reviewed dates change<br/>Honor preferences · deduplicate deliveries"]
    STATUS --> PLAN["Update the learner’s study plan and next actions"]
```

MEP remains the authority for enrollment and recognition decisions. The platform provides sourced guidance and tracks learner-reported status. The blueprint assumes official form submission and handling of sensitive evidence remain in the official channel.

## 6. Assessment, offline recovery, and progress

```mermaid
sequenceDiagram
    actor Student as Learner
    participant Web as Web app and local draft store
    participant API as Assessment API
    participant DB as PostgreSQL
    participant Jobs as Progress worker
    Student->>Web: Select study activity or assessment mode
    Web->>API: Start simulation, weighted mock, drill, or quick practice
    API->>DB: Persist attempt, ordered item versions, policy, and timing
    API-->>Web: Return attempt ID, timing policy, and learner-safe bundle
    Student->>Web: Answer, flag, and review before submission
    Web->>Web: Checkpoint answers and preserve pending submission locally
    Note over Web,API: An already loaded attempt can continue offline
    Student->>Web: Finish or reach the configured time limit
    Web->>API: Submit final answers with stable idempotency key when connected
    API->>DB: Validate ownership and timing policy, score, and commit result plus outbox
    alt Response lost or duplicate request
        Web->>API: Retry with the same key
        API-->>Web: Return the original committed result
    else First successful submission
        API-->>Web: Return committed score and permitted review material
    end
    DB-->>Jobs: Deliver attempt-completed event through outbox and queue
    Jobs->>DB: Deduplicate and update progress and mastery read models
    Student->>Web: Review explanations, mastery, and recommended practice
```

Keep answer keys on the server until review is authorized. Enforce one final score per attempt, and reject reuse of a submission key with a different payload. Before launch, define how each mode handles a timed attempt whose submission reaches the server after an offline period. Until the server accepts it, show the result as pending.

## 7. Content governance and release

```mermaid
flowchart LR
    SRC["Published MEP or DGEC materials<br/>Specifications · schedules · forms · reference exams"]
    SRC --> IN["Staff capture · provenance · usage rights · effective dates"]
    IN --> DRAFT["Author independent lessons, items, explanations,<br/>formula sheets, SVG visuals, and blueprints"]
    DRAFT --> VALIDATE["Automated checks<br/>Schemas · references · blueprint coverage · item scoring"]
    VALIDATE --> REVIEW["Human review<br/>Academic accuracy · accessibility · rights · source alignment"]
    REVIEW -->|Changes needed| DRAFT
    REVIEW -->|Approved| STAGE["Stage immutable release<br/>Validate learner routes and catalog availability"]
    STAGE --> PUBLISH["Promote release pointer atomically"]
    PUBLISH --> CATALOG["Serve approved program, stage, subject, and convocatoria"]
    PUBLISH --> HISTORY["Audit release, approvals, and source versions"]
    HISTORY -->|Recovery| ROLLBACK["Repoint to prior approved release"]
    ROLLBACK --> CATALOG
    CATALOG --> PIN["Existing attempts keep their pinned versions"]
```

## 8. Operations, security, and recovery

```mermaid
flowchart TB
    CODE["Application and infrastructure changes"] --> CI["CI · tests · accessibility checks · security scans"]
    CI --> STAGE["Isolated staging · seasonal load and failure tests"]
    STAGE --> DEPLOY["Controlled production rollout<br/>Health gates · rollback · compatible migrations"]
    DEPLOY --> RUNTIME["Multi-zone application · durable data and queues"]
    RUNTIME --> SIGNALS["Availability · latency · submit success<br/>Queue age · reminder lag · backup freshness"]
    SIGNALS --> RESPOND["Alerts · on-call runbooks · incident response"]
    RESPOND --> MITIGATE["Scale API or workers · replay jobs<br/>Rollback release or fail over datastore"]
    RUNTIME --> BACKUP["Encrypted backups and point-in-time recovery"]
    BACKUP --> DRILL["Restore drills · verify data and application recovery"]
    DRILL --> RESPOND
    DATA["Data classification and retention policy"] --> CONTROL["Least privilege · staff MFA · scoped document access<br/>Audit trails · retention and deletion workflows"]
    CONTROL --> RUNTIME
    CONTROL --> REPORT["Role-scoped reporting · aggregated exports"]
```

Use the repository’s planning envelope of 5,000 concurrent users and 1,500–2,500 peak requests per second as a load-test hypothesis. Exercise convocatoria traffic with a cold cache, bursts of final submissions, worker backlogs, and database failover. Set service-level objectives and recovery targets after measuring demand and confirming operational constraints. Provider, region, runtime sizing, retention periods, and recovery objectives remain design decisions. The production topology assumes managed infrastructure with multi-zone availability and independent scaling for public delivery, API traffic, and background work.
