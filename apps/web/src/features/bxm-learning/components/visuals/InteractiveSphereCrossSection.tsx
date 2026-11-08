import { LearningText } from '../LearningText';
import React, { useState, useId } from 'react';

export interface InteractiveSphereCrossSectionProps {
  initialSphereRadius?: number;
  initialPlaneDistance?: number;
  className?: string;
  onStateChange?: (state: { R: number; d: number; r: number; state: 'secant' | 'tangent' | 'exterior' }) => void;
}

export const InteractiveSphereCrossSection: React.FC<InteractiveSphereCrossSectionProps> = ({
  initialSphereRadius = 10,
  initialPlaneDistance = 6,
  className = '',
  onStateChange
}) => {
  const [R, setR] = useState<number>(initialSphereRadius);
  const [d, setD] = useState<number>(initialPlaneDistance);

  const sliderRId = useId();
  const sliderDId = useId();

  // Rigorous geometric relationship: R^2 = d^2 + r^2 => r = sqrt(R^2 - d^2)
  let sectionRadius = 0;
  let intersectionState: 'secant' | 'tangent' | 'exterior' = 'secant';
  let statusBadge = '';
  let statusLabel = '';

  if (d > R) {
    intersectionState = 'exterior';
    sectionRadius = 0;
    statusBadge = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700';
    statusLabel = 'Plano Exterior (d > R): No interseca la superficie esférica (r = 0)';
  } else if (d === R) {
    intersectionState = 'tangent';
    sectionRadius = 0;
    statusBadge = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700';
    statusLabel = 'Plano Tangente (d = R): Interseca en un único punto tangencial';
  } else {
    intersectionState = 'secant';
    sectionRadius = Math.sqrt(R * R - d * d);
    statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
    statusLabel = `Plano Secante (d < R): Sección circular de radio r = ${sectionRadius.toFixed(2)}`;
  }

  // SVG representation: Center is (160, 160)
  const cx = 160;
  const cy = 160;
  const svgScale = 11; // 11px per unit
  const sphereSvgR = R * svgScale;
  const planeOffsetY = d * svgScale;
  const sectionSvgR = sectionRadius * svgScale;

  // Plane Y in SVG coordinate system (plane cuts horizontally at distance d above center)
  const planeY = cy - planeOffsetY;

  const handleUpdate = (newR: number, newD: number) => {
    if (onStateChange) {
      let rVal = 0;
      let s: 'secant' | 'tangent' | 'exterior' = 'secant';
      if (newD > newR) {
        s = 'exterior';
        rVal = 0;
      } else if (newD === newR) {
        s = 'tangent';
        rVal = 0;
      } else {
        s = 'secant';
        rVal = Math.sqrt(newR * newR - newD * newD);
      }
      onStateChange({ R: newR, d: newD, r: rVal, state: s });
    }
  };

  return (
    <div className={`rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60">
            Geometría 3D Interactiva
          </span>
          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1.5">
            Sección Plana de una Esfera
          </h4>
        </div>
        <div className="px-3 py-1.5 rounded-lg border bg-stone-50 dark:bg-stone-850 font-mono text-sm font-semibold text-stone-800 dark:text-stone-200">
          {d > R ? 'No existe sección circular' : <LearningText content={String.raw`$R=${R},\ d=${d} \implies r=${sectionRadius.toFixed(2)}$`} inline />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Projection Canvas */}
        <div className="flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[320px] aspect-square overflow-visible"
            role="img"
            aria-label={`Esfera de radio ${R} cortada por plano a distancia ${d}`}
          >
            {/* Sphere Body Gradient Definition */}
            <defs>
              <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Sphere Contour & 3D Shading */}
            <circle cx={cx} cy={cy} r={sphereSvgR} fill="url(#sphereGrad)" stroke="#4f46e5" strokeWidth="2" />

            {/* Equatorial Guide (dashed ellipse) */}
            <ellipse cx={cx} cy={cy} rx={sphereSvgR} ry={sphereSvgR * 0.28} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Sphere Center C */}
            <circle cx={cx} cy={cy} r={4} fill="#1e1b4b" />
            <text x={cx + 6} y={cy + 14} className="text-[11px] font-bold fill-stone-700 dark:fill-stone-300 font-mono">
              O (Centro)
            </text>

            {/* Cutting Plane Representation */}
            <polygon
              points={`20,${planeY + 15} 300,${planeY - 15} 270,${planeY - 45} -10,${planeY - 15}`}
              className={intersectionState === 'exterior' ? 'fill-rose-500/10 stroke-rose-400' : 'fill-indigo-500/15 stroke-indigo-400'}
              strokeWidth="1.2"
              strokeDasharray={intersectionState === 'exterior' ? '4 3' : undefined}
            />

            {/* If secant: render the circular cross section projected as an ellipse */}
            {intersectionState === 'secant' && sectionSvgR > 0 && (
              <>
                <ellipse
                  cx={cx}
                  cy={planeY}
                  rx={sectionSvgR}
                  ry={sectionSvgR * 0.3}
                  className="fill-amber-400/40 stroke-amber-600 dark:stroke-amber-400"
                  strokeWidth="2"
                />
                {/* Distance line d from center (cx, cy) to plane center (cx, planeY) */}
                <line x1={cx} y1={cy} x2={cx} y2={planeY} stroke="#059669" strokeWidth="2" />
                <text x={cx - 16} y={(cy + planeY) / 2 + 4} className="text-[11px] font-bold fill-emerald-700 dark:fill-emerald-400 font-mono">
                  d={d}
                </text>

                {/* Section radius line r from plane center to section edge */}
                <line x1={cx} y1={planeY} x2={cx + sectionSvgR} y2={planeY} stroke="#d97706" strokeWidth="2" />
                <text x={cx + sectionSvgR / 2 - 4} y={planeY - 6} className="text-[11px] font-bold fill-amber-700 dark:fill-amber-400 font-mono">
                  r={sectionRadius.toFixed(1)}
                </text>

                {/* Sphere radius hypotenuse R from Center (cx, cy) to section edge (cx + sectionSvgR, planeY) */}
                <line x1={cx} y1={cy} x2={cx + sectionSvgR} y2={planeY} stroke="#4f46e5" strokeWidth="1.8" strokeDasharray="3 2" />
                <text x={cx + sectionSvgR / 2 + 10} y={(cy + planeY) / 2 + 14} className="text-[11px] font-bold fill-indigo-700 dark:fill-indigo-300 font-mono">
                  R={R}
                </text>

                {/* Right angle indicator at section center */}
                <rect x={cx} y={planeY} width="7" height="7" fill="none" stroke="#059669" strokeWidth="1" />
              </>
            )}

            {/* If tangent */}
            {intersectionState === 'tangent' && (
              <circle cx={cx} cy={planeY} r={5} className="fill-blue-600" />
            )}
          </svg>

          <div className="mt-3 w-full text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Sliders and Formulas */}
        <div className="space-y-4 text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={sliderRId} className="font-medium text-stone-700 dark:text-stone-300">
                Radio de la esfera (R): <strong className="font-mono text-indigo-600">{R} cm</strong>
              </label>
            </div>
            <input
              id={sliderRId}
              type="range"
              min={6}
              max={15}
              step={1}
              value={R}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setR(val);
                handleUpdate(val, d);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={sliderDId} className="font-medium text-stone-700 dark:text-stone-300">
                Distancia del plano al centro (d): <strong className="font-mono text-emerald-600">{d} cm</strong>
              </label>
            </div>
            <input
              id={sliderDId}
              type="range"
              min={0}
              max={18}
              step={1}
              value={d}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setD(val);
                handleUpdate(R, val);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Mathematical Pitágoras Card */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850/60 text-xs text-stone-700 dark:text-stone-300 space-y-1.5 font-mono">
            <div className="font-sans font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
              Ecuación Pitagórica en la Esfera:
            </div>
            <LearningText content="$R^2 = d^2 + r^2$" />
            <LearningText content={String.raw`$${R}^2 = ${d}^2 + r^2 \implies ${R * R} = ${d * d} + r^2$`} />
            {intersectionState === 'secant' ? (
              <div className="text-amber-700 dark:text-amber-400 font-bold">
                <LearningText content={String.raw`$r^2 = ${R * R} - ${d * d} = ${R * R - d * d} \implies r = \sqrt{${R * R - d * d}} \approx ${sectionRadius.toFixed(2)}$`} />
              </div>
            ) : intersectionState === 'tangent' ? (
              <div className="text-blue-700 dark:text-blue-400 font-bold">
                <LearningText content="$d = R \implies r = 0$" inline /> (Plano tangente en un punto)
              </div>
            ) : (
              <div className="text-rose-700 dark:text-rose-400 font-bold">
                <LearningText content="$d > R$" inline />: el plano no interseca a la esfera
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
