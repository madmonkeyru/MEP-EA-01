# Module 04: Vector Visualizations and Math Engine
**Document Reference:** MEP-EA-ARCH-04
**Version:** 3.0.0
**Parent Index:** [INDEX.md](INDEX.md)
**Status:** Authoritative Specification

---

## 1. Architectural Philosophy: Zero Static Bitmaps

Traditional digital testing software embeds static raster images (PNG, JPEG, WebP) or static SVG exports for mathematical and geometric questions. In an enterprise educational platform, this introduces severe flaws:
- Pixelation and blurriness on high-DPI (Retina / OLED) mobile and tablet screens.
- Inability to dynamically adapt stroke colors and fill contrasts between Light and Dark theme modes.
- Impossibility of updating labels, variable names, or coordinate ticks without re-drawing the graphic in external software.
- High network payload overhead for mobile users on cellular networks.

**Core Architectural Mandate**:
**Zero static image assets are permitted for test questions or visual manipulatives.** Every mathematical visualization is represented as a JSON parameter payload interpreted at runtime by pure SVG and Canvas composite components.

---

## 2. Component Layering Architecture

The visualization engine implements a strict three-layer hierarchy:

```
                  ┌─────────────────────────────────────┐
                  │       Layer 2: Visual Registry      │
                  │        (Dynamic Component Map)      │
                  └──────────────────┬──────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  [ CartesianCanvas ]           [ Solid3D ]               [ Statistical ]
  - 2D Planes                  - Spheres, Cylinders       - BoxPlotComposite
  - Function Plots             - Cones & Frustums         - TableVisual
  - Geometric Polygons         - Cross Sections & Cuts    - VennDiagram
  - Rigid Transformations      - Parametric Projection    - DistributionCurve
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │          Layer 0: Primitives        │
                  │ Pure SVG Elements with Halos & KaTeX │
                  │ (Point, Line, Arc, Arrow, Label, etc│
                  └─────────────────────────────────────┘
```

### 2.1 Layer 0 — Primitives
Pure SVG sub-components that receive mathematically computed pixel coordinates:
- `Point`: Center dot with configurable radius, selection ring, and accessibility text.
- `Label`: Rendered via KaTeX or high-legibility SVG `<text>` with CSS `paint-order: stroke fill` halos ensuring readability over intersecting lines or grids.
- `DashedProjection`: Orthogonal projections from a point to axes ($x$-axis, $y$-axis).
- `LineSegment` & `Ray`: With optional endpoint arrows and tick markers.
- `AngleArc`: Angle indicators with right-angle squares or circular arcs.

### 2.2 Layer 1 — Composite Components
Higher-order components managing coordinate space transformations, domain clipping, and aspect ratio locking:

| Composite Component | Visual Type Identifier | Primary Educational Use Case | Key Configurable Parameters |
| :--- | :--- | :--- | :--- |
| `CartesianCanvas` / `CartesianPlane` | `cartesian_2d` | Coordinate geometry, line equations, circles in the plane, translations, rotations, homotheties. | `domain: { x: [min, max], y: [min, max] }`, `grid: boolean`, `show_ticks`, `show_tick_labels`, `children: []`. |
| `FunctionPlotter` | `function_plot` | Quadratic vertices, linear functions, piecewise functions, exponential & logarithmic curves. | `form: 'linear' \| 'quadratic' \| 'sqrt' \| 'exp'`, `params: { a, b, c }`, `domain`, `points_of_interest`. |
| `Solid3D` | `solid_3d` | 3D spatial solids (esfera, cilindro, cono, prisma, pirámide) and 2D planar slicing. | `shape: 'sphere' \| 'cylinder' \| 'cone' \| 'frustum' \| 'prism'`, `parameters: { radius, height, distance, cutAngle }`, `labels`, `referenceBox`. |
| `BoxPlotComposite` | `box_plot` | 5-number statistical summaries, single and dual comparative box-and-whisker plots. | `groups: Array<{ name, min, q1, med, q3, max }>`, `scale: [min, max]`, `step`. |
| `TableVisual` | `table` | Frequency distributions, 2x2 contingency tables, relative frequencies. | `variant: 'frequency' \| 'contingency' \| 'stats'`, `headers: []`, `rows: [][]`. |
| `VennDiagram` | `venn_diagram` | Set theory, probability intersections, unions, and sample space complements. | `sets: ['A', 'B']`, `region_values: { onlyA, onlyB, intersection, outside }`. |
| `DistributionCurve` | `distribution_curve` | Standard normal distribution, positive/negative skewness, and standardized $Z$-score regions. | `skewness: 'symmetric' \| 'positive' \| 'negative'`, `markers: []`, `shadedInterval: [a, b]`. |

---

## 3. Parametric Solid3D Engine (Pure SVG Isometric/Orthographic Projection)

3D geometry in Educación Abierta tests (sphere cross sections, cylinder axial sections, cone conical frustums) is rendered without bulky WebGL libraries. The `Solid3D` engine computes pure 2D SVG paths using parametric equations:

```json
{
  "alt": "Sección plana circular en una esfera cortada por un plano",
  "visual": {
    "type": "solid_3d",
    "shape": "sphere",
    "width": 380,
    "height": 280,
    "parameters": {
      "radius": 85,
      "distance": 35,
      "showCenter": true,
      "showAxis": true,
      "showRightAngle": true
    },
    "labels": {
      "center": "M",
      "sectionCenter": "O",
      "sectionLeft": "P",
      "sectionRight": "N"
    },
    "referenceBox": {
      "lines": [
        "P — O — N",
        "M: centro de la esfera",
        "O: centro de la sección plana"
      ]
    },
    "showCrossSection": true,
    "showAxes": true
  }
}
```

### Key Mathematical Rendering Rules for 3D:
1. **Hidden Contour Dashes**: Back-facing contours and axes utilize `stroke-dasharray="4,4"` with `--visual-hidden-line` token.
2. **Cutting Plane Overlays**: Translucent quadrilateral polygons (`opacity: 0.15`) with accent borders highlight planar slices.
3. **Cross-Section Hatching**: Diagonal parametric hatch lines (`<pattern id="hatch">`) visually distinguish sliced interior surfaces.
4. **Pythagorean Callout Indicators**: Right-angle squares ($90^\circ$) connecting sphere center, slice center, and chord radius to aid students in applying $r^2 = d^2 + r_s^2$.

---

## 4. KaTeX Math Pipeline & Safe Rendering Architecture

Mathematical expressions across question stems, options, and solutions are formatted with standard LaTeX delimiters:
- **Inline Math**: `$ ... $` (e.g., `$(x - 2)^2 + (y + 3)^2 = 25$`)
- **Display Block Math**: `$$ ... $$` (e.g., `$$\bar{x} = \frac{\sum x_i}{n}$$`)

### 4.1 Parser Collision Mitigation (`TextRenderer.tsx`)
In Spanish educational text, parenthesized clauses (e.g., `(media $\bar{x} = 75$, varianza $\sigma^2 = 4$)`) can trigger greedy regex capture if bare math matching is active. The `TextRenderer` implements strict boundary rules:
- **`isBareMath` Guard**: Expressions containing explicit LaTeX delimiters (`$`, `\`) or natural language Spanish phrase tokens are excluded from bare math parsing and routed directly to the delimited KaTeX parser.
- **Error Boundary Fallback**: If a KaTeX expression contains syntax anomalies, the engine falls back to a clean monospaced representation without crashing the component tree.
