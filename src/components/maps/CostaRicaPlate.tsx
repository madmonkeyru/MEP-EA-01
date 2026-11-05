import { useId, useState } from "react";
import {
  GEO,
  coast,
  international,
  lakeNicaragua,
  nicaragua,
  nicaraguaIslands,
  panama,
  provinceBorders,
  provinces,
  rivers,
} from "./map-geometry";

export type PlateFraming = "sheet" | "bleed";

const MAP_X = 46;
const MAP_Y = 34;
const SHEET_W = 1092;
const SHEET_H = 1116;

function xy(lon: number, lat: number): [number, number] {
  const x = ((lon - GEO.west) / (GEO.east - GEO.west)) * GEO.mapW;
  const y = ((GEO.north - lat) / (GEO.north - GEO.south)) * GEO.mapH;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

function ring(points: ReadonlyArray<readonly [number, number]>) {
  return (
    points
      .map((p, i) => {
        const [x, y] = xy(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x} ${y}`;
      })
      .join("") + "Z"
  );
}

const ARENAL: ReadonlyArray<readonly [number, number]> = [
  [-84.905, 10.498],
  [-84.855, 10.518],
  [-84.808, 10.492],
  [-84.828, 10.458],
  [-84.888, 10.45],
  [-84.918, 10.474],
];

const TORTUGAL: ReadonlyArray<readonly [number, number]> = [
  [-85.255, 10.292],
  [-85.175, 10.308],
  [-85.155, 10.276],
  [-85.21, 10.258],
  [-85.262, 10.272],
];

const NUMERALS: ReadonlyArray<readonly [string, number, number]> = [
  ["1", -85.62, 10.78],
  ["1", -85.45, 9.95],
  ["2", -84.72, 10.48],
  ["3", -84.02, 10.72],
  ["4", -83.42, 10.22],
  ["4", -83.15, 9.55],
  ["5", -84.78, 10.08],
  ["5", -83.05, 8.48],
  ["6", -84.22, 9.62],
  ["6", -83.62, 9.22],
  ["7", -83.78, 9.72],
  ["7", -83.55, 9.38],
];

type City = {
  name: string;
  lon: number;
  lat: number;
  kind: "capital" | "province" | "town";
  dx: number;
  dy: number;
  lines?: readonly string[];
};

const CITIES: readonly City[] = [
  { name: "SAN JOSÉ", lon: -84.09, lat: 9.933, kind: "capital", dx: 8, dy: -7 },
  { name: "Liberia", lon: -85.438, lat: 10.635, kind: "province", dx: 6, dy: 3 },
  { name: "Nicoya", lon: -85.452, lat: 10.148, kind: "town", dx: -6, dy: 12 },
  { name: "Puntarenas", lon: -84.834, lat: 9.977, kind: "province", dx: -62, dy: -10 },
  { name: "Alajuela", lon: -84.212, lat: 10.016, kind: "province", dx: -52, dy: 3 },
  { name: "Heredia", lon: -84.117, lat: 9.998, kind: "province", dx: 6, dy: 3 },
  { name: "Cartago", lon: -83.921, lat: 9.864, kind: "province", dx: 6, dy: 4 },
  { name: "Turrialba", lon: -83.684, lat: 9.905, kind: "town", dx: 6, dy: 3 },
  { name: "Limón", lon: -83.036, lat: 9.991, kind: "province", dx: 6, dy: -8 },
  { name: "Guápiles", lon: -83.788, lat: 10.217, kind: "town", dx: 6, dy: -8 },
  { name: "Puerto Quepos", lon: -84.155, lat: 9.445, kind: "town", dx: -8, dy: 14 },
  {
    name: "San Isidro del General",
    lon: -83.704,
    lat: 9.375,
    kind: "town",
    dx: 6,
    dy: -2,
    lines: ["San Isidro", "del General"],
  },
  { name: "Golfito", lon: -83.114, lat: 8.62, kind: "town", dx: 6, dy: -6 },
  { name: "Palmar Sur", lon: -83.47, lat: 8.96, kind: "town", dx: 6, dy: 11 },
];

const RIVER_NAMES: ReadonlyArray<readonly [string, number, number, number]> = [
  ["Río Tempisque", -85.28, 10.42, -68],
  ["Río Tenorio", -85.02, 10.58, -62],
  ["Río Frío", -84.78, 10.95, 78],
  ["Río Grande", -84.48, 9.95, -18],
  ["Río Pirrís", -84.22, 9.52, -48],
  ["Río Reventazón", -83.62, 9.98, 58],
  ["Río Pacuare", -83.42, 9.92, 62],
  ["Río Tortuguero", -83.55, 10.42, 70],
  ["Río Chirripó", -83.72, 10.28, 55],
  ["Río Sixaola", -82.95, 9.57, -8],
  ["Río Diquís", -83.55, 9.02, -12],
  ["Río San Juan", -84.15, 10.95, -6],
];

function Star({ x, y }: { x: number; y: number }) {
  const outer = 4.4;
  const inner = 1.7;
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 6;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push(`${(x + Math.cos(ang) * rad).toFixed(2)},${(y + Math.sin(ang) * rad).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} className="fill-current" />;
}

function Stacked({
  x,
  y,
  lines,
  className,
  leading = 15,
}: {
  x: number;
  y: number;
  lines: readonly string[];
  className: string;
  leading?: number;
}) {
  return (
    <text x={x} y={y} textAnchor="middle" className={className}>
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : leading}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function ScaleBar({
  x,
  y,
  kilometers,
  ticks,
  label,
}: {
  x: number;
  y: number;
  kilometers: number;
  ticks: readonly number[];
  label: string;
}) {
  const pxPerKm = GEO.mapH / (GEO.north - GEO.south) / 110.574;
  const width = kilometers * pxPerKm;
  const parts = ticks.length - 1;
  const step = width / parts;
  return (
    <g className="text-[8.5px] tracking-[0.08em] font-medium fill-current">
      {Array.from({ length: parts }, (_, i) => (
        <rect
          key={i}
          x={x + i * step}
          y={y}
          width={step}
          height={5.5}
          fill={i % 2 === 0 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={0.6}
        />
      ))}
      {ticks.map((tick, i) => (
        <text key={tick} x={x + i * step} y={y - 3} textAnchor="middle">
          {tick}
        </text>
      ))}
      <text x={x + width / 2} y={y + 15} textAnchor="middle" letterSpacing="0.18em">
        {label}
      </text>
    </g>
  );
}

export interface CostaRicaPlateProps {
  framing?: PlateFraming;
  className?: string;
  interactive?: boolean;
  onSelectProvince?: (provinceId: string, name: string) => void;
  selectedProvinceId?: string | null;
  minimalWatermark?: boolean;
}

export function CostaRicaPlate({
  framing = "bleed",
  className = "",
  interactive = true,
  onSelectProvince,
  selectedProvinceId,
  minimalWatermark = false,
}: CostaRicaPlateProps) {
  const uid = useId().replace(/:/g, "");
  const clipId = `${uid}-frame`;
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const view =
    framing === "bleed"
      ? `${MAP_X} ${MAP_Y} ${GEO.mapW} ${GEO.mapH}`
      : `0 0 ${SHEET_W} ${SHEET_H}`;

  const panelTop = xy(0, 9)[1];
  const panelRight = xy(-84.58, 0)[0];

  return (
    <svg
      className={`costa-rica-map-svg block ${className}`}
      viewBox={view}
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
    >
      <title id={`${uid}-title`}>Mapa de Costa Rica (División Territorial)</title>
      <desc id={`${uid}-desc`}>
        Mapa vectorial de Costa Rica con sus 7 provincias, costas, ríos y división territorial.
      </desc>

      {/* Sheet background if framed as sheet and not minimal */}
      {framing === "sheet" && !minimalWatermark && (
        <rect width={SHEET_W} height={SHEET_H} className="fill-stone-100 dark:fill-stone-900" />
      )}

      <g transform={`translate(${MAP_X} ${MAP_Y})`}>
        <clipPath id={clipId}>
          <rect width={GEO.mapW} height={GEO.mapH} />
        </clipPath>

        <g clipPath={`url(#${clipId})`}>
          {/* Water background */}
          {!minimalWatermark && (
            <rect className="fill-sky-100/60 dark:fill-sky-950/20" width={GEO.mapW} height={GEO.mapH} />
          )}

          {/* Foreign Land (Nicaragua & Panama) */}
          <path className="fill-stone-200/50 dark:fill-stone-800/40" d={nicaragua} />
          <path className="fill-stone-200/50 dark:fill-stone-800/40" d={panama} />
          <path
            className="fill-sky-100/60 dark:fill-sky-950/20 stroke-stone-400 dark:stroke-stone-600 stroke-[1.15]"
            d={lakeNicaragua}
          />
          {nicaraguaIslands ? <path className="fill-stone-200/50 dark:fill-stone-800/40" d={nicaraguaIslands} /> : null}

          {/* Costa Rica Provinces */}
          {provinces.map((province) => {
            const isHovered = hoveredProvince === province.id;
            const isSelected = selectedProvinceId === province.id;
            return (
              <path
                key={province.id}
                d={province.d}
                className={`transition-colors duration-150 ${
                  minimalWatermark
                    ? "fill-stone-400/20 stroke-stone-400/40 stroke-[0.8]"
                    : isSelected
                    ? "fill-indigo-500/30 stroke-indigo-600 stroke-[1.5]"
                    : isHovered
                    ? "fill-amber-200/60 dark:fill-amber-900/40 stroke-stone-600 dark:stroke-stone-400 stroke-1 cursor-pointer"
                    : "fill-stone-50 dark:fill-stone-800/80 stroke-stone-300 dark:stroke-stone-700 stroke-[0.75] hover:fill-amber-100/50 dark:hover:fill-amber-950/30 cursor-pointer"
                }`}
                onMouseEnter={() => interactive && setHoveredProvince(province.id)}
                onMouseLeave={() => interactive && setHoveredProvince(null)}
                onClick={() => {
                  if (interactive && onSelectProvince) {
                    onSelectProvince(province.id, province.name);
                  }
                }}
              >
                <title>{`${province.numeral}. ${province.name}`}</title>
              </path>
            );
          })}

          {!minimalWatermark && (
            <>
              <path className="fill-sky-200/70 dark:fill-sky-900/50 stroke-sky-400/70 stroke-[0.7]" d={ring(ARENAL)} />
              <path className="fill-sky-200/70 dark:fill-sky-900/50 stroke-sky-400/70 stroke-[0.7]" d={ring(TORTUGAL)} />
              <path className="fill-none stroke-sky-500/60 dark:stroke-sky-400/40 stroke-[0.85] stroke-linecap-round stroke-linejoin-round" d={rivers} />
            </>
          )}

          {/* Provincial Borders */}
          <path
            className="fill-none stroke-amber-600/70 dark:stroke-amber-400/60 stroke-[1.3] stroke-linecap-round stroke-dasharray-[0.4_3]"
            d={provinceBorders}
          />

          {/* Coast & International Borders */}
          <path className="fill-none stroke-stone-600 dark:stroke-stone-400 stroke-[1.05] stroke-linejoin-round stroke-linecap-round" d={coast} />
          <path className="fill-none stroke-stone-400 dark:stroke-stone-600 stroke-[0.8] stroke-linejoin-round stroke-linecap-round" d={nicaragua} />
          <path className="fill-none stroke-stone-400 dark:stroke-stone-600 stroke-[0.8] stroke-linejoin-round stroke-linecap-round" d={panama} />
          <path className="fill-none stroke-stone-700 dark:stroke-stone-300 stroke-[2] stroke-linejoin-round stroke-linecap-round stroke-dasharray-[6_3]" d={international} />
        </g>

        {!minimalWatermark && (
          <>
            {/* Numerals for provinces */}
            {NUMERALS.map(([n, lon, lat], i) => {
              const [x, y] = xy(lon, lat);
              return (
                <text
                  key={`${n}-${i}`}
                  className="text-[13px] italic font-semibold fill-stone-700 dark:fill-stone-300 pointer-events-none select-none"
                  x={x}
                  y={y}
                  textAnchor="middle"
                >
                  {n}
                </text>
              );
            })}

            {/* Major cities */}
            {CITIES.map((city) => {
              const [x, y] = xy(city.lon, city.lat);
              const lines = city.lines ?? [city.name];
              return (
                <g key={city.name} className="pointer-events-none select-none fill-stone-800 dark:fill-stone-200">
                  {city.kind === "capital" ? (
                    <Star x={x} y={y} />
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r={city.kind === "province" ? 2.5 : 1.3}
                      className={
                        city.kind === "province"
                          ? "fill-stone-100 stroke-stone-900 dark:stroke-stone-100 stroke-[0.85]"
                          : "fill-stone-800 dark:fill-stone-200"
                      }
                    />
                  )}
                  <text
                    className={
                      city.kind === "capital"
                        ? "text-[12px] font-bold tracking-[0.14em]"
                        : "text-[10px] font-medium"
                    }
                    x={x + city.dx}
                    y={y + city.dy}
                    textAnchor={city.dx < 0 ? "end" : "start"}
                  >
                    {lines.map((line, i) => (
                      <tspan key={line} x={x + city.dx} dy={i === 0 ? 0 : 11}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {/* River names */}
            {RIVER_NAMES.map(([name, lon, lat, rotate]) => {
              const [x, y] = xy(lon, lat);
              return (
                <text
                  key={name}
                  className="text-[9.5px] italic font-medium fill-sky-800/80 dark:fill-sky-300/80 pointer-events-none select-none"
                  x={x}
                  y={y}
                  textAnchor="middle"
                  transform={`rotate(${rotate} ${x} ${y})`}
                >
                  {name}
                </text>
              );
            })}

            <Stacked
              className="text-[14px] font-semibold tracking-[0.3em] fill-stone-600 dark:fill-stone-400 pointer-events-none select-none"
              x={xy(-83.15, 10.35)[0]}
              y={xy(-83.15, 10.35)[1]}
              lines={["MAR", "CARIBE"]}
              leading={22}
            />
            <text
              className="text-[14px] font-semibold tracking-[0.3em] fill-stone-600 dark:fill-stone-400 pointer-events-none select-none"
              x={xy(-85, 0)[0]}
              y={xy(0, 9.34)[1]}
              textAnchor="middle"
            >
              OCÉANO PACÍFICO
            </text>
          </>
        )}

        {/* Minimal Sheet Panel Details if framed as sheet */}
        {framing === "sheet" && !minimalWatermark && (
          <>
            <rect
              className="fill-stone-50/90 dark:fill-stone-900/90 stroke-stone-700 dark:stroke-stone-300 stroke-[1.15]"
              x={6}
              y={panelTop}
              width={panelRight - 6}
              height={GEO.mapH - panelTop - 8}
            />
            <text
              className="text-[28px] font-bold tracking-[0.3em] fill-stone-900 dark:fill-stone-100"
              x={(6 + panelRight) / 2}
              y={panelTop + 46}
              textAnchor="middle"
            >
              COSTA RICA
            </text>

            <text
              className="text-[9px] font-semibold tracking-[0.1em] fill-stone-600 dark:fill-stone-400"
              x={168}
              y={panelTop + 140}
              textAnchor="middle"
            >
              ESCALA 1:1,350,000
            </text>
            <ScaleBar x={64} y={panelTop + 160} kilometers={75} ticks={[0, 25, 50, 75]} label="KILÓMETROS" />
          </>
        )}
      </g>
    </svg>
  );
}

export { provinces } from "./map-geometry";
