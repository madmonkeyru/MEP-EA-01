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

# Multi-program flow validation

Current behavior is defined in [Capability status](CAPABILITY_STATUS.md). The [implementation ledger](UI_UX_IMPLEMENTATION.md) tracks all 82 UI/UX audit findings.

## Routes and state

- Entry: `#/`; program catalog: `#/programas`.
- Program: `#/programas/{program}`; subject: `#/programas/{program}/{subject}?convocatoria=2026-c2`.
- Grade/part: `nivel=III_CICLO_9` or `nivel=EDAD_2`.
- Subject sections: `seccion=practice|resources|progress`; resource panel: `recurso=pdf|specs|terms|formulas`.
- Active attempt: subject route plus `pantalla=prueba&intento={sessionId}`.
- Completed result: subject route plus `pantalla=resultado&intento={sessionId}`.
- Optional guide: `#/guia`; resources/orientation: `#/ayuda?programa={program}&materia={subject}`.

Program IDs are `cico`, `iii_ciclo`, `edad`, `bxm`. Invalid program/subject contexts recover to a catalog; invalid or missing attempt IDs show a recoverable unavailable state. Test/result recovery requires a matching profile, curriculum context and saved versioned snapshot.

Only BXM Mathematics 02-2026 has interactive questions. Other hubs offer official PDF resources and honest preview states; they do not silently reuse BXM questions. Science and language alternatives are grouped. Calculator statements derive from subject/grade rules. Convocatorias are curriculum references, not live registration schedules.

## Checks

Run `npm test` and `npm run build`. App regressions cover program/subject navigation, context changes, preview availability, optional-guide skipping, complete simulation/retry, active-answer refresh recovery and result reopening without duplicated history.

Run `npm run test:flows` against an already-running server only where browser execution is permitted. It delegates to `scripts/validate-ui.mjs` (default `http://127.0.0.1:5173`, override with `FLOW_BASE_URL`). The browser script and [manual/pilot checklist](UI_UX_VALIDATION.md) cover resource links, recovery, themes, widths and accessibility.

Browser execution outside the sandbox was declined earlier; the updated browser journey has not been run here. No screenshot, measured contrast, screen-reader result or real-phone performance claim is made.
