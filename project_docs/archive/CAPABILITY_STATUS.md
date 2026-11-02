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

# Current student-facing capabilities

Updated: 2026-11-02. This supersedes broad “Implemented” labels in earlier architecture documents. Structural support does not mean that interactive content has been published.

| Program / context | Interactive questions | Official PDFs | Navigation and educational structure |
| --- | --- | --- | --- |
| BXM Mathematics · reference 02-2026 | Complete reference simulation; weighted simulation; area/topic/varied practice; concept practice only where actual links exist; exact-item practice from the temario | Available | Available |
| BXM Mathematics · 01-2026 | Preview | Reference 02-2026 PDFs, explicitly labeled | Available |
| Other BXM subjects | Preview | Available | Available; science and language alternatives grouped |
| I y II Ciclo | Preview | Available | Available |
| III Ciclo · 7°, 8°, 9° | Preview | Available by level | Available; calculator rules depend on subject/level |
| EDAD · Parts 1 and 2 | Preview | Available by part | Available; prerequisite explanation does not block studying |

The application is independent of the MEP and does not register students, check eligibility, validate documents, predict examination performance or fetch current registration schedules. Students are directed to official channels for those matters. Reference fees and windows are labeled accordingly.

The guide remains optional and skippable. Age band and schooling are sufficient for a provisional suggestion; additional planning and documentation questions can be omitted. Sensitive age-exception questions are limited to relevant schooling/age situations. Guide answers are kept in page memory only and are cleared by refresh or deliberate reset. Printing/saving the resulting orientation is a student action.

Profiles are **local browser profiles**, not authenticated accounts. No password or email is required. Local profile selection is not a security boundary: another person with access to the same browser can select it. Profiles separate histories and active attempts. Guest mode remains available. The history, saved questions and reading list do not synchronize across devices and are lost when browser storage is cleared.

Tests and results have durable curriculum URLs referencing saved session IDs. Recovery uses versioned, exact ordered question snapshots belonging to the selected profile. Starting a different practice offers Resume or Discard. A timed attempt continues counting while away; untimed practice can be resumed without a deadline. Legacy records without item snapshots can remain summary records; they cannot be reconstructed as exact results. Invalid/obsolete active-session formats are not silently restored into new questions.

Learning practice retains the first verified response and reveals explanations only on request. Both simulation modes defer feedback until submission. Submitting and revisiting results is idempotent. Results separate unanswered questions, compare only matching contexts/modes/configurations, provide domain summaries, targeted follow-up and student-controlled export/print/history deletion.

See [implementation ledger](UI_UX_IMPLEMENTATION.md) for all 82 audit IDs, and [validation plan](UI_UX_VALIDATION.md) for automated evidence and the browser/student work that is still pending. No accessibility certification, actual phone latency measurement, browser screenshot verification or student-pilot outcome is claimed without corresponding evidence.
