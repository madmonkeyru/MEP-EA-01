import React, { useState, useId } from 'react';

export interface InteractiveCircleVisualProps {
  initialH?: number;
  initialK?: number;
  initialR?: number;
  className?: string;
  onStateChange?: (state: { h: number; k: number; r: number; testPoint: { x: number; y: number; position: 'interior' | 'exterior' | 'on_circle' } }) => void;
}

export const InteractiveCircleVisual: React.FC<InteractiveCircleVisualProps> = ({
  initialH = 1,
  initialK = 2,
  initialR = 4,
  className = '',
  onStateChange
}) => {
  const [h, setH] = useState<number>(initialH);
  const [k, setK] = useState<number>(initialK);
  const [r, setR] = useState<number>(initialR);

  // Test point coordinates to evaluate relative position
  const [px, setPx] = useState<number>(3);
  const [py, setPy] = useState<number>(5);

  const sliderHId = useId();
  const sliderKId = useId();
  const sliderRId = useId();
  const sliderPxId = useId();
  const sliderPyId = useId();

  // Mathematical calculations
  const distSq = (px - h) ** 2 + (py - k) ** 2;
  const rSq = r ** 2;
  const dist = Math.sqrt(distSq);

  let pointStatus: 'interior' | 'exterior' | 'on_circle' = 'interior';
  let pointBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
  let pointStatusLabel = 'Interior a la circunferencia';

  if (Math.abs(distSq - rSq) < 1e-6) {
    pointStatus = 'on_circle';
    pointBadgeColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700';
    pointStatusLabel = 'Pertenece a la circunferencia';
  } else if (distSq > rSq) {
    pointStatus = 'exterior';
    pointBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700';
    pointStatusLabel = 'Exterior a la circunferencia';
  }

  // SVG coordinate transform: Viewbox from -10 to 10 on both axes, width/height 360px
  const width = 360;
  const height = 360;
  const scale = width / 20; // 18px per unit
  const toSvgX = (val: number) => (val + 10) * scale;
  const toSvgY = (val: number) => (10 - val) * scale;

  const svgCenterX = toSvgX(h);
  const svgCenterY = toSvgY(k);
  const svgRadius = r * scale;

  const svgPointX = toSvgX(px);
  const svgPointY = toSvgY(py);

  // Sign formatted string for canonical equation: (x - h)^2 + (y - k)^2 = r^2
  const hTerm = h === 0 ? 'x^2' : h > 0 ? `(x - ${h})^2` : `(x + ${Math.abs(h)})^2`;
  const kTerm = k === 0 ? 'y^2' : k > 0 ? `(y - ${k})^2` : `(y + ${Math.abs(k)})^2`;
  const equationText = `${hTerm} + ${kTerm} = ${rSq}`;

  const handleUpdate = (newH: number, newK: number, newR: number, newPx: number, newPy: number) => {
    if (onStateChange) {
      const dsq = (newPx - newH) ** 2 + (newPy - newK) ** 2;
      const r2 = newR ** 2;
      const pos = Math.abs(dsq - r2) < 1e-6 ? 'on_circle' : dsq > r2 ? 'exterior' : 'interior';
      onStateChange({
        h: newH,
        k: newK,
        r: newR,
        testPoint: { x: newPx, y: newPy, position: pos }
      });
    }
  };

  return (
    <div className={`rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800/60">
            Laboratorio Interactivo SVG
          </span>
          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1.5">
            Explorador de la Circunferencia y Posición de Puntos
          </h4>
        </div>
        <div className="px-3 py-1.5 rounded-lg border bg-stone-50 dark:bg-stone-850 font-mono text-sm font-semibold text-stone-800 dark:text-stone-200">
          ${equationText}$
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Canvas */}
        <div className="flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[320px] aspect-square overflow-visible"
            role="img"
            aria-label={`Circunferencia centrada en (${h}, ${k}) con radio ${r}`}
          >
            {/* Grid lines */}
            {[-8, -6, -4, -2, 2, 4, 6, 8].map((g) => (
              <React.Fragment key={g}>
                <line
                  x1={toSvgX(g)}
                  y1={0}
                  x2={toSvgX(g)}
                  y2={height}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeWidth="0.8"
                />
                <line
                  x1={0}
                  y1={toSvgY(g)}
                  x2={width}
                  y2={toSvgY(g)}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeWidth="0.8"
                />
              </React.Fragment>
            ))}

            {/* Axes */}
            <line x1={0} y1={toSvgY(0)} x2={width} y2={toSvgY(0)} stroke="currentColor" className="text-stone-400 dark:text-stone-600" strokeWidth="1.5" />
            <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={height} stroke="currentColor" className="text-stone-400 dark:text-stone-600" strokeWidth="1.5" />

            {/* Circle Disk (interior) */}
            <circle
              cx={svgCenterX}
              cy={svgCenterY}
              r={svgRadius}
              className="fill-amber-500/10 dark:fill-amber-400/15"
            />

            {/* Circle Boundary */}
            <circle
              cx={svgCenterX}
              cy={svgCenterY}
              r={svgRadius}
              fill="none"
              stroke="currentColor"
              className="text-amber-600 dark:text-amber-400"
              strokeWidth="2.5"
            />

            {/* Center point */}
            <circle cx={svgCenterX} cy={svgCenterY} r={4.5} fill="#d97706" />
            <text
              x={svgCenterX + 8}
              y={svgCenterY - 8}
              className="text-[11px] font-bold fill-stone-700 dark:fill-stone-300 font-mono"
            >
              C({h}, {k})
            </text>

            {/* Test point P */}
            <circle
              cx={svgPointX}
              cy={svgPointY}
              r={5.5}
              className={pointStatus === 'interior' ? 'fill-emerald-600' : pointStatus === 'on_circle' ? 'fill-blue-600' : 'fill-rose-600'}
            />
            <text
              x={svgPointX + 8}
              y={svgPointY - 8}
              className="text-[11px] font-bold fill-stone-800 dark:fill-stone-200 font-mono"
            >
              P({px}, {py})
            </text>

            {/* Distance line from Center to P */}
            <line
              x1={svgCenterX}
              y1={svgCenterY}
              x2={svgPointX}
              y2={svgPointY}
              stroke="currentColor"
              className="text-stone-400 dark:text-stone-500"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
          </svg>

          {/* Dynamic Status Pill */}
          <div className="mt-3 w-full text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${pointBadgeColor}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              Punto P({px}, {py}): {pointStatusLabel} (d = {dist.toFixed(2)}, r = {r})
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={sliderHId} className="font-medium text-stone-700 dark:text-stone-300">
                Centro $h$ (abscisa X): <strong className="font-mono text-amber-600">{h}</strong>
              </label>
            </div>
            <input
              id={sliderHId}
              type="range"
              min={-6}
              max={6}
              step={1}
              value={h}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setH(val);
                handleUpdate(val, k, r, px, py);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={sliderKId} className="font-medium text-stone-700 dark:text-stone-300">
                Centro $k$ (ordenada Y): <strong className="font-mono text-amber-600">{k}</strong>
              </label>
            </div>
            <input
              id={sliderKId}
              type="range"
              min={-6}
              max={6}
              step={1}
              value={k}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setK(val);
                handleUpdate(h, val, r, px, py);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={sliderRId} className="font-medium text-stone-700 dark:text-stone-300">
                Radio $r$: <strong className="font-mono text-amber-600">{r}</strong> (diámetro $d = {2 * r}$)
              </label>
            </div>
            <input
              id={sliderRId}
              type="range"
              min={1}
              max={8}
              step={1}
              value={r}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setR(val);
                handleUpdate(h, k, val, px, py);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Probar Punto de Prueba $P(x, y)$
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={sliderPxId} className="text-xs text-stone-600 dark:text-stone-400 block mb-1">
                  Punto $x$: <strong className="font-mono">{px}</strong>
                </label>
                <input
                  id={sliderPxId}
                  type="range"
                  min={-8}
                  max={8}
                  step={1}
                  value={px}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPx(val);
                    handleUpdate(h, k, r, val, py);
                  }}
                  className="w-full accent-stone-700 dark:accent-stone-300"
                />
              </div>
              <div>
                <label htmlFor={sliderPyId} className="text-xs text-stone-600 dark:text-stone-400 block mb-1">
                  Punto $y$: <strong className="font-mono">{py}</strong>
                </label>
                <input
                  id={sliderPyId}
                  type="range"
                  min={-8}
                  max={8}
                  step={1}
                  value={py}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPy(val);
                    handleUpdate(h, k, r, px, val);
                  }}
                  className="w-full accent-stone-700 dark:accent-stone-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
