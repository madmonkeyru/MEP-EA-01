import { useId } from "react";
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
} from "@/components/map-geometry";

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
  return <polygon points={pts.join(" ")} className="plate-star" />;
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
    <g className="plate-scale">
      {Array.from({ length: parts }, (_, i) => (
        <rect
          key={i}
          x={x + i * step}
          y={y}
          width={step}
          height={5.5}
          fill={i % 2 === 0 ? "var(--color-ink)" : "var(--color-panel)"}
          stroke="var(--color-ink)"
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

export function CostaRicaPlate({ framing = "sheet" }: { framing?: PlateFraming }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `${uid}-frame`;
  const view =
    framing === "bleed"
      ? `${MAP_X} ${MAP_Y} ${GEO.mapW} ${GEO.mapH}`
      : `0 0 ${SHEET_W} ${SHEET_H}`;

  const panelTop = xy(0, 9)[1];
  const panelRight = xy(-84.58, 0)[0];

  const degreesX = [-86, -85, -84, -83];
  const degreesY = [11, 10, 9, 8];

  return (
    <svg
      className="plate-svg"
      viewBox={view}
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
    >
      <title id={`${uid}-title`}>Administrative map of Costa Rica, 1950</title>
      <desc id={`${uid}-desc`}>
        Vector plate in the manner of the 1950 Map Division sheet: seven provinces,
        rivers, and the neighboring coasts of Nicaragua and Panama.
      </desc>

      <rect width={SHEET_W} height={SHEET_H} fill="var(--color-paper)" />

      <g transform={`translate(${MAP_X} ${MAP_Y})`}>
        <clipPath id={clipId}>
          <rect width={GEO.mapW} height={GEO.mapH} />
        </clipPath>

        <g clipPath={`url(#${clipId})`}>
          <rect className="plate-water" width={GEO.mapW} height={GEO.mapH} />
          <path className="plate-foreign" d={nicaragua} />
          <path className="plate-foreign" d={panama} />
          <path className="plate-lake" d={lakeNicaragua} />
          {nicaraguaIslands ? <path className="plate-foreign" d={nicaraguaIslands} /> : null}
          {provinces.map((province) => (
            <path key={province.id} className="plate-land" d={province.d}>
              <title>{`${province.numeral}. ${province.name}`}</title>
            </path>
          ))}
          <path className="plate-lake-minor" d={ring(ARENAL)} />
          <path className="plate-lake-minor" d={ring(TORTUGAL)} />
          <path className="plate-river" d={rivers} />
          <g className="plate-grid">
            {degreesX.map((lon) => {
              const x = xy(lon, 0)[0];
              return <line key={`v${lon}`} x1={x} x2={x} y1={0} y2={GEO.mapH} />;
            })}
            {degreesY.map((lat) => {
              const y = xy(0, lat)[1];
              return <line key={`h${lat}`} y1={y} y2={y} x1={0} x2={GEO.mapW} />;
            })}
          </g>
          <path className="plate-gold" d={provinceBorders} />
          <path className="plate-coast" d={coast} />
          <path className="plate-coast" d={nicaragua} />
          <path className="plate-coast" d={panama} />
          <path className="plate-intl" d={international} />
        </g>

        <g className="plate-degree">
          {degreesX.map((lon) => {
            const x = xy(lon, 0)[0];
            if (x < 28 || x > GEO.mapW - 18) return null;
            return (
              <text key={`top${lon}`} x={x} y={14} textAnchor="middle">
                {Math.abs(lon)}
              </text>
            );
          })}
          {degreesY.map((lat) => {
            const y = xy(0, lat)[1];
            return (
              <g key={`lat${lat}`}>
                {y < panelTop - 8 ? (
                  <text x={12} y={y + 3} textAnchor="middle">
                    {lat}
                  </text>
                ) : null}
                <text x={GEO.mapW - 12} y={y + 3} textAnchor="middle">
                  {lat}
                </text>
              </g>
            );
          })}
        </g>

        {NUMERALS.map(([n, lon, lat], i) => {
          const [x, y] = xy(lon, lat);
          return (
            <text key={`${n}-${i}`} className="plate-numeral" x={x} y={y} textAnchor="middle">
              {n}
            </text>
          );
        })}

        {CITIES.map((city) => {
          const [x, y] = xy(city.lon, city.lat);
          const lines = city.lines ?? [city.name];
          return (
            <g key={city.name}>
              {city.kind === "capital" ? (
                <Star x={x} y={y} />
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={city.kind === "province" ? 2.5 : 1.25}
                  className={city.kind === "province" ? "plate-capital" : "plate-town"}
                />
              )}
              <text
                className={city.kind === "capital" ? "plate-city-capital" : "plate-city"}
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

        {RIVER_NAMES.map(([name, lon, lat, rotate]) => {
          const [x, y] = xy(lon, lat);
          return (
            <text
              key={name}
              className="plate-river-name"
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
          className="plate-water-name"
          x={xy(-85.45, 11.38)[0]}
          y={xy(-85.45, 11.38)[1]}
          lines={["LAGO DE NICARAGUA"]}
          leading={14}
        />
        <text className="plate-country" x={xy(-84.35, 11.45)[0]} y={xy(-84.35, 11.45)[1]} textAnchor="middle">
          NICARAGUA
        </text>
        <Stacked
          className="plate-water-name"
          x={xy(-83.35, 11.28)[0]}
          y={xy(-83.35, 11.28)[1]}
          lines={["BAHÍA DE", "SAN JUAN", "DEL NORTE"]}
        />
        <Stacked
          className="plate-water-name"
          x={xy(-85.95, 10.55)[0]}
          y={xy(-85.95, 10.55)[1]}
          lines={["GOLFO DEL", "PAPAGAYO"]}
        />
        <Stacked
          className="plate-sea"
          x={xy(-83.15, 10.35)[0]}
          y={xy(-83.15, 10.35)[1]}
          lines={["CARIBBEAN", "SEA"]}
          leading={26}
        />
        <text className="plate-sea" x={xy(-85, 0)[0] - 16} y={xy(0, 9.34)[1]} textAnchor="end">
          PACIFIC
        </text>
        <text className="plate-sea" x={xy(-85, 0)[0] + 16} y={xy(0, 9.34)[1]} textAnchor="start">
          OCEAN
        </text>
        <Stacked
          className="plate-water-name"
          x={xy(-84.95, 9.78)[0]}
          y={xy(-84.95, 9.78)[1]}
          lines={["GOLFO", "DE", "NICOYA"]}
          leading={14}
        />
        <text className="plate-water-name" x={xy(-84.95, 10.22)[0]} y={xy(-84.95, 10.22)[1]} textAnchor="middle">
          LAGO ARENAL
        </text>
        <text className="plate-water-name" x={xy(-85.28, 10.34)[0]} y={xy(-85.28, 10.34)[1]} textAnchor="start">
          LAGO TORTUGAL
        </text>
        <text className="plate-country" x={xy(-82.72, 8.95)[0]} y={xy(-82.72, 8.95)[1]} textAnchor="middle">
          PANAMA
        </text>
        <Stacked
          className="plate-water-name"
          x={xy(-84.05, 8.72)[0]}
          y={xy(-84.05, 8.72)[1]}
          lines={["BAHÍA DE", "CORONADO"]}
        />
        <Stacked
          className="plate-water-name"
          x={xy(-83.28, 8.52)[0]}
          y={xy(-83.28, 8.52)[1]}
          lines={["GOLFO", "DULCE"]}
          leading={14}
        />
        <Stacked
          className="plate-water-name"
          x={xy(-82.62, 8.12)[0]}
          y={xy(-82.62, 8.12)[1]}
          lines={["BAHÍA", "CHARCO AZUL"]}
          leading={13}
        />

        <g className="plate-index-item">
          <text className="plate-index-title" x={760} y={78}>
            INDEX TO PROVINCES
          </text>
          {provinces.map((province, i) => (
            <text key={province.id} x={772} y={100 + i * 16.5}>
              {`${province.numeral}.  ${province.name}`}
            </text>
          ))}
        </g>

        <rect className="plate-panel" x={6} y={panelTop} width={panelRight - 6} height={GEO.mapH - panelTop - 8} />
        <text className="plate-sheet-title" x={(6 + panelRight) / 2} y={panelTop + 46} textAnchor="middle">
          COSTA RICA
        </text>

        <g className="plate-legend">
          <line
            x1={36}
            x2={78}
            y1={panelTop + 150}
            y2={panelTop + 150}
            stroke="var(--color-ink)"
            strokeWidth={2}
            strokeDasharray="7 3.5"
          />
          <text x={86} y={panelTop + 154}>
            International Boundary
          </text>
          <line
            x1={36}
            x2={78}
            y1={panelTop + 170}
            y2={panelTop + 170}
            stroke="var(--color-ochre)"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="0.4 3.2"
          />
          <text x={86} y={panelTop + 174}>
            Province Boundary
          </text>
          <g transform={`translate(${panelRight - 168} ${panelTop + 138})`}>
            <Star x={4} y={4} />
            <text x={16} y={8}>
              Capital of Country
            </text>
            <circle cx={4} cy={24} r={2.6} className="plate-capital" />
            <text x={16} y={28}>
              Capital of Province
            </text>
            <circle cx={4} cy={44} r={1.4} className="plate-town" />
            <text x={16} y={48}>
              Other City
            </text>
          </g>
        </g>

        <text className="plate-scale" x={168} y={panelTop + 208} textAnchor="middle" letterSpacing="0.12em">
          SCALE 1:1,350,000
        </text>
        <ScaleBar x={36} y={panelTop + 222} kilometers={120.701} ticks={[0, 25, 50, 75]} label="MILES" />
        <ScaleBar x={64} y={panelTop + 252} kilometers={75} ticks={[0, 25, 50, 75]} label="KILOMETERS" />
        <text className="plate-degree" x={xy(-85, 0)[0]} y={panelTop + 12} textAnchor="middle">
          85
        </text>
      </g>

      <text className="plate-credit" x={SHEET_W - 58} y={24} textAnchor="end">
        11215
      </text>
      <text className="plate-credit" x={MAP_X} y={SHEET_H - 16}>
        11215  Map Division, CIA, 4-50
      </text>

      <rect className="plate-frame" x={MAP_X - 5} y={MAP_Y - 5} width={GEO.mapW + 10} height={GEO.mapH + 10} strokeWidth={3.4} />
      <rect className="plate-frame" x={MAP_X} y={MAP_Y} width={GEO.mapW} height={GEO.mapH} strokeWidth={0.7} />
    </svg>
  );
}
