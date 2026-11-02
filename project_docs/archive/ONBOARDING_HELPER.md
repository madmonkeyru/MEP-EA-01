---
> **DEPRECATED & SUPERSEDED HISTORICAL ARCHIVE**
> This document is part of the historical pre-development and prototyping logs.
> It has been superseded by the authoritative **MEP EA Digital System Architecture Suite (v3.0.0)**.
> Please refer to:
> - Master Architecture Index: [INDEX.md](../INDEX.md)
> - System & Infrastructure Architecture: [01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md](../01_SYSTEM_AND_INFRASTRUCTURE_ARCHITECTURE.md)
> - Core Services & Domain Model: [02_CORE_SERVICES_AND_DOMAIN_MODEL.md](../02_CORE_SERVICES_AND_DOMAIN_MODEL.md)
> - Content Pipeline & Legal Decoupling: [03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md](../03_CONTENT_PIPELINE_AND_LEGAL_DECOUPLING.md)
> - Vector Visualizations & Math Engine: [04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md](../04_VECTOR_VISUALIZATIONS_AND_MATH_ENGINE.md)
> - UI/UX Design System: [05_UI_UX_DESIGN_SYSTEM.md](../05_UI_UX_DESIGN_SYSTEM.md)
> - Product Roadmap & Operations: [06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md](../06_PRODUCT_ROADMAP_AND_OPERATIONAL_PLAN.md)
---

# Optional guide and resource discovery

> Current behavior and availability: [Capability status](CAPABILITY_STATUS.md). UI changes and remaining validation: [Implementation ledger](UI_UX_IMPLEMENTATION.md). Older verification totals below are historical.

The existing landing, program and practice flows remain directly accessible. Nothing opens automatically or requires guide completion. The landing invitation and the header's **Guía y recursos** button open `#/ayuda`; **Comenzar guía opcional** opens `#/guia`. Every guide step offers **Omitir guía** and direct resource browsing.

The integrated Brújula Abierta flow adapts the prototype in `Component Test/src/lib/ea` and its readiness wizard to the main React application without importing the prototype's router, authentication or Zustand dependencies. The prototype directory is not needed at runtime.

Answers stay in a React provider while the app is open, so students can leave and return. Refreshing clears them; **Empezar de nuevo** clears the current answers. The guide never stores the personal profile in localStorage or sends it to a server.

The four INFO dump attachments supply the program summaries, requirements and checklist. The guide requires only age band and schooling for a provisional suggestion. Planning, documents, basic-skill confirmation and relevant BXM exceptions can be omitted. Additional details cover chosen subjects and levels, one science and language for upper secondary programs, registration and recognition. EDAD's full-program estimate is a study plan across both parts, not permission to enroll in both at once. Approval of part 1 is required before enrolling in part 2 of that subject. Students can explore any program regardless of the suggestion.

The prototype's weighted readiness score was removed: a self-reported checklist cannot establish admission or predict academic performance. Fee estimates are labeled as reference values from the supplied documents. Payment accounts and telephone numbers are not copied into the app; students are directed to confirm current payment details with the official service. The resources page also explains educational supports and recognition, linking to DGEC and Yo Aplico.

The resource browser exposes the supplied official PDFs for all four programs, including level/part labels, search and document type. `scripts/officialResources.ts` serves them in development and emits stable PDF assets during production builds, including builds under a non-root base path. No PDF contents are downloaded until opened. Only Matemáticas BXM, 02-2026 is presented as interactive practice; other app hubs retain their preview state.

Validation: `npm run build`, `npm test`, `npm run lint`. The test configuration targets main-app tests under `src` rather than the separate proof of concept. `node scripts/validate-helper.mjs` provides browser checks against `FLOW_BASE_URL` (default `http://127.0.0.1:5173`) where browser execution is permitted.
