# 03. Multi-Platform Client & Shared Application Layer

**Status:** Authoritative Target Architecture Specification
**Version:** 2.0.0 (Target Architecture Baseline)
**Primary Visual References:**
- Diagram Root Cluster 3: [`project_docs/architecture/diagrams/System Diagram & Execute High Level Diagram.svg`](./diagrams/System%20Diagram%20&%20Execute%20High%20Level%20Diagram.svg)

---

## 1. Multi-Platform Architecture Overview

To provide universal, accessible study experiences for Costa Rican learners across diverse socioeconomic backgrounds, the target client architecture spans both responsive Web and native Mobile operating systems (iOS and Android).

Rather than duplicating business logic, validation, scoring algorithms, and content parsing across platforms, the architecture introduces a foundational **Shared Application Layer** shared by the Web SPA and the React Native / Expo mobile codebase.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              LEARNERS (STUDENTS & USERS)                               │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
┌──────────────────────────────────────────┐┌────────────────────────────────────────────┐
│              WEB CLIENT                  ││               MOBILE CLIENT                │
│    Desktop / Tablet / Mobile Browser     ││             iOS & Android Apps             │
│        (React + TypeScript SPA)          ││           (React Native + Expo)            │
└────────────────────┬─────────────────────┘└────────────────────┬───────────────────────┘
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SHARED APPLICATION LAYER                                 │
│                                                                                        │
│   ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────────────────┐   │
│   │ Shared Domain Logic │ │ Shared Types (TS)   │ │ Shared API Client              │   │
│   └─────────────────────┘ └─────────────────────┘ └────────────────────────────────┘   │
│   ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────────────────┐   │
│   │ Shared Validation   │ │ Shared Analytics    │ │ Shared Design Tokens           │   │
│   └─────────────────────┘ └─────────────────────┘ └────────────────────────────────┘   │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Shared Content / Learning Runtime (KaTeX Math, SVG Graphics, Question Parsers) │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼ HTTPS / TLS
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       EDGE, CDN, WAF & API GATEWAY SERVICES                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Platform Surface Targets

### 2.1. Web Application (`Web`)
- **Technology Stack:** React 18+, TypeScript, Vite, Tailwind CSS, Lucide Icons, KaTeX.
- **Form Factors:** Fluid responsive UI supporting small mobile viewports ($320\text{px} - 640\text{px}$), tablets, and high-resolution desktops.
- **Routing & Delivery:** Client-side hash/history routing deployed as static assets behind global CDN/Edge with no mandatory server rewrite dependencies.

### 2.2. Mobile Applications (`Mobile`)
- **Technology Stack:** React Native with Expo cross-platform framework targeting native iOS and Android bundles.
- **Device Capabilities:** Native gestures, local secure storage, push notifications for study reminders, and background telemetry synchronization.
- **Offline First:** Fully autonomous local study sessions enabled by the Shared Content / Learning Runtime and local SQLite/IndexedDB persistence.

---

## 3. The Shared Application Layer (`SHARED`)

The Shared Application Layer is an abstracted, platform-agnostic TypeScript module ecosystem designed for reuse across both Web and Mobile apps:

### 3.1. Shared Domain Logic (`Shared Domain Logic`)
- **Assessment Engine:** Item shuffling, option randomization, timer decrements, section transitions, attempt state machines, and bookmarking.
- **Scoring & Mastery Algorithms:** Pure, test-covered deterministic functions calculating domain scores, cognitive distribution percentages, and mastery tier classifications ($<60\%$, $60-74\%$, $\ge 75\%$).
- **Remediation Priority Calculator:** Determines the canonical next pedagogical action based on past attempt accuracy and evidence catalog weights.

### 3.2. Shared TypeScript Types (`Shared TypeScript Types`)
- Authoritative type contracts for:
  - Canonical questions (`CanonicalIntermediateQuestion`, `LearnerFacingQuestion`).
  - Blueprints and curriculum entities (`ConvocatoriaBlueprint`, `EvidenceNode`).
  - Learner state (`LearnerProfile`, `LearnerAttemptRecord`, `MasterySnapshot`).
  - Entitlements and capabilities (`EntitlementTier`, `DomainCapability`).

### 3.3. Shared API Client (`Shared API Client`)
- Thin, resilient HTTP client utilizing standard `fetch` with automatic retry, exponential backoff, request deduplication, and auth token injection.
- Seamlessly falls back to local cached mocks in offline or unauthenticated modes.

### 3.4. Shared Validation (`Shared Validation`)
- Pure schema verification (e.g., Zod or lightweight validators) enforcing item integrity, four distinct options (A, B, C, D), valid answer keys, and non-empty mathematical stems.

### 3.5. Shared Analytics & Telemetry (`Shared Analytics`)
- Unified event taxonomy across Web and Mobile.
- Features a 2-second client-side deduplication window and non-blocking background queueing.

### 3.6. Shared Design Tokens (`Shared Design Tokens`)
- Brand and educational typography definitions ('Outfit' for display/headings, 'Plus Jakarta Sans' for interface and body copy).
- Semantic color palettes for mastery states (Dominada = Emerald, En Progreso = Amber, Necesita Práctica = Rose), dark/light mode surface tokens, and spacing scales.

### 3.7. Shared Content / Learning Runtime (`Shared Content / Learning Runtime`)
- Mathematical rendering wrappers for KaTeX expressions.
- Parametric SVG visual generators for geometric figures (circumferences, cuts of spheres, conic sections, coordinate systems).
- Micro-quiz and formative feedback evaluation engines.
