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

# Module 05: UI/UX Design System and Accessibility Specification
**Document Reference:** MEP-EA-ARCH-05
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. Visual Language & Brand Philosophy

MEP EA Digital avoids generic, stark corporate SaaS styling (cold blue gradients and sterile white surfaces). Instead, it adopts a **warm educational aesthetic** tailored for adult students studying during late evenings after work.

### 1.1 Color Palette & Semantic Tokens
The color palette combines soft warm beige and cream background surfaces (`stone` neutrals) with subtle indigo and amber accents that maintain optimal contrast across both Light and Dark modes.

| Token | Light Theme Value | Dark Theme Value | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--color-surface-bg` | `#fdfbf7` (Soft Cream) | `#121110` (Warm Dark Carbon) | Global application background |
| `--color-surface-card` | `#ffffff` (Pure White) | `#1c1a18` (Elevated Charcoal) | Card containers, question cards, modal panels |
| `--color-surface-muted` | `#f6f3ed` (Warm Sand) | `#252320` (Subtle Dark Slate) | Table headers, secondary toolbars, callouts |
| `--color-border-subtle` | `#e7e2d7` (Muted Sandstone) | `#35322d` (Dark Border) | Card borders, dividers, option card outlines |
| `--color-brand-primary` | `#4f46e5` (Indigo 600) | `#6366f1` (Indigo 500) | Primary call-to-actions, active indicators, brand badges |
| `--color-brand-accent` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | Convocatoria badges, warnings, time-critical alerts |
| `--color-text-main` | `#1c1917` (Stone 900) | `#f5f5f4` (Stone 100) | Primary text, question stems, mathematical formulas |
| `--color-text-muted` | `#78716c` (Stone 500) | `#a8a29e` (Stone 400) | Metadata labels, evidence codes, secondary notes |

### 1.2 Dark Mode Architecture in Tailwind CSS v4
Theme switching is managed through `ThemeContext.tsx` toggling the `.dark` class on `document.documentElement`. Tailwind CSS v4 class-based variant compatibility is guaranteed via the custom directive in `src/index.css`:
```css
@variant dark (&:where(.dark, .dark *));
```
This ensures all `dark:*` utility classes evaluate correctly on dynamically loaded components.

---

## 2. Typography & Text Hierarchy

Typography is loaded via Google Fonts in `index.html`:
- **Display & Headings**: `'Outfit', sans-serif` — Modern, geometric, accessible letterforms providing visual confidence on program hubs and test shell titles.
- **Body & Mathematical Prose**: `'Plus Jakarta Sans', sans-serif` — Highly readable humanist grotesque with open apertures, optimized for reading long question stems and explanations on mobile screens.

---

## 3. Custom Accessible UI Components

To ensure uniform behavior across Safari, Chrome, Firefox, and mobile browsers, the application relies on purpose-built custom accessible components rather than unstyled native controls.

### 3.1 CustomSelect (`src/components/common/CustomSelect.tsx`)
- **Problem Solved**: Native HTML `<select>` elements render inconsistently across operating systems and cannot display custom icons or multi-line metadata.
- **Architecture**:
  - Accessible button trigger displaying currently selected option label and Chevron icon.
  - Animated popover dropdown list with active focus indicators (`indigo-500` outline).
  - Synchronized hidden native `<select>` element to ensure full support for assistive technologies (screen readers) and automated integration tests (Playwright / Testing Library).
  - Keyboard navigation: Full ArrowUp / ArrowDown navigation and Escape key dismissal.
  - Outside click listener automatically collapsing the menu when clicking elsewhere.

### 3.2 ThemeToggle (`src/components/common/ThemeToggle.tsx`)
- **Single Interactive Control**: Renders a dedicated button cycling seamlessly between Light and Dark mode without jarring dropdown submenus.
- **Visual Feedback**: Dynamic Lucide `Sun` and `Moon` icons with smooth SVG rotation transitions.

### 3.3 OptionCard (`src/components/test/OptionCard.tsx`)
- High-contrast letter badge (`A`, `B`, `C`, `D`) with distinct selected and hover states.
- Hotkey integration: Pressing keys `1`–`4` or `A`–`D` instantly selects the corresponding card.
- Clean KaTeX math rendering within option cards without clipping or overflow.

---

## 4. Accessibility & Layout Patterns (WCAG 2.1 AA Compliance)

1. **Color Contrast Ratios**: All text tokens meet or exceed the $4.5:1$ contrast ratio against their respective card backgrounds in both Light and Dark themes.
2. **Keyboard Navigation & Focus Management**: All interactive elements (practice tabs, calculator switches, navigation buttons) have visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
3. **Screen Reader Support**: All SVG visualizations provide meaningful `aria-label` or `alt` descriptions summarizing the mathematical figure (e.g., "Circunferencia con centro en el origen y radio 5").
4. **Responsive Grid & Mobile Ergonomics**:
   - Touch targets are minimum $44 \times 44$ pixels.
   - Test shell features a sticky bottom or top navigation bar on mobile viewports for quick Next / Previous and Review Grid jumping.

## 5. Post-M8 UX quality contracts (2026-11-06)

The implemented refinement and all 30 plan areas are tracked in [UX/UI Quality Pass](UX_UI_QUALITY_PASS.md). Application chrome uses the shared type, control and density contracts in `src/ui-quality.css`, loaded after existing styles by `src/main.tsx`.

Use one dominant next-action recommendation and quiet supporting sections. Reuse `RecommendationCard`, `Dialog`, `FeedbackState` and `StudentMasteryBadge`. Buttons have primary, secondary, tertiary and text treatments with a 44px minimum touch target. Page/section/card/metadata type sizes are explicit tokens; learning questions retain comfortable reading size.

Profile preferences use real local profile state and system/light/dark theme choices. They do not imply cloud authentication or synchronization. Mobile learning navigation has a four-column structure; resource navigation uses the shared modal. Modal cleanup closes the native dialog before restoring focus.

Dark-mode and accessibility assertions above are design targets, not a certification. See the quality-pass verification record for the checks actually performed and remaining manual acceptance checks.
