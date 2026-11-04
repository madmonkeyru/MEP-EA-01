#!/usr/bin/env python3
"""Project the 1950 Costa Rica plate from geographic source data.

Reads Natural Earth + geoBoundaries + OSM waterways already staged under
/tmp/geodata and writes src/components/map-geometry.ts. Not used at runtime.
"""

from __future__ import annotations

import json
import math
import os

WEST, EAST = -86.12, -82.42
SOUTH, NORTH = 7.88, 11.58
MAP_W = MAP_H = 1000.0
SNAP = 0.0007  # degrees; tight enough that gulfs don't collapse, loose enough to seal shared borders
RIVER_KM = 18.0
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "components", "map-geometry.ts")

NUMERAL = {
    "Guanacaste": "1",
    "Alajuela": "2",
    "Heredia": "3",
    "Limón": "4",
    "Puntarenas": "5",
    "San José": "6",
    "Cartago": "7",
}
SLUG = {
    "Guanacaste": "guanacaste",
    "Alajuela": "alajuela",
    "Heredia": "heredia",
    "Limón": "limon",
    "Puntarenas": "puntarenas",
    "San José": "sanjose",
    "Cartago": "cartago",
}


def load(path):
    print("load", path, flush=True)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def polygons_of(geometry):
    if not geometry:
        return
    t = geometry["type"]
    c = geometry["coordinates"]
    if t == "Polygon":
        yield c
    elif t == "MultiPolygon":
        yield from c
    elif t == "GeometryCollection":
        for g in geometry.get("geometries") or []:
            yield from polygons_of(g)


def lines_of(geometry):
    if not geometry:
        return
    t = geometry["type"]
    c = geometry["coordinates"]
    if t == "LineString":
        yield c
    elif t == "MultiLineString":
        yield from c


def dedupe(pts):
    out = []
    for p in pts:
        if not out or p != out[-1]:
            out.append(p)
    if len(out) >= 2 and out[0] == out[-1]:
        out.pop()
    return out


def snap_ring(ring):
    pts = []
    for x, y in ring:
        pts.append((round(x / SNAP) * SNAP, round(y / SNAP) * SNAP))
    return dedupe(pts)


def rdp(points, eps):
    n = len(points)
    if n < 3:
        return points
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = points[a]
        bx, by = points[b]
        dx, dy = bx - ax, by - ay
        den = dx * dx + dy * dy
        best = -1
        bestd = 0.0
        for i in range(a + 1, b):
            px, py = points[i]
            if den == 0:
                dist = math.hypot(px - ax, py - ay)
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / den
                if t < 0:
                    t = 0.0
                elif t > 1:
                    t = 1.0
                dist = math.hypot(px - (ax + t * dx), py - (ay + t * dy))
            if dist > bestd:
                bestd = dist
                best = i
        if best != -1 and bestd > eps:
            keep[best] = True
            stack.append((a, best))
            stack.append((best, b))
    return [p for p, k in zip(points, keep) if k]


def proj(lon, lat):
    x = (lon - WEST) / (EAST - WEST) * MAP_W
    y = (NORTH - lat) / (NORTH - SOUTH) * MAP_H
    return (round(x, 2), round(y, 2))


def path_of_rings(rings):
    parts = []
    for ring in rings:
        if len(ring) < 3:
            continue
        pts = []
        for lon, lat in ring:
            p = proj(lon, lat)
            if not pts or p != pts[-1]:
                pts.append(p)
        if len(pts) >= 2 and pts[0] == pts[-1]:
            pts.pop()
        if len(pts) < 3:
            continue
        # close
        cmds = [f"M{pts[0][0]} {pts[0][1]}"]
        cmds.extend(f"L{x} {y}" for x, y in pts[1:])
        cmds.append("Z")
        parts.append("".join(cmds))
    return "".join(parts)


def path_of_lines(lines):
    parts = []
    for line in lines:
        if len(line) < 2:
            continue
        pts = []
        for lon, lat in line:
            p = proj(lon, lat)
            if not pts or p != pts[-1]:
                pts.append(p)
        if len(pts) < 2:
            continue
        cmds = [f"M{pts[0][0]} {pts[0][1]}"]
        cmds.extend(f"L{x} {y}" for x, y in pts[1:])
        parts.append("".join(cmds))
    return "".join(parts)


def km_of(coords):
    total = 0.0
    for (x1, y1), (x2, y2) in zip(coords, coords[1:]):
        mlat = math.radians((y1 + y2) / 2)
        dx = math.radians(x2 - x1) * math.cos(mlat) * 6371.0
        dy = math.radians(y2 - y1) * 6371.0
        total += math.hypot(dx, dy)
    return total


def bbox_hit(coords):
    for x, y, *_ in coords:
        if WEST - 0.05 <= x <= EAST + 0.05 and SOUTH - 0.05 <= y <= NORTH + 0.05:
            return True
    return False


def pip(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi):
            inside = not inside
        j = i
    return inside


def qkey(p, tol=SNAP):
    return (int(round(p[0] / tol)), int(round(p[1] / tol)))


def chain(segments, tol=SNAP):
    """Join segments that share a snapped endpoint into long strokes."""
    from collections import defaultdict

    adj = defaultdict(list)
    keyed = []
    for i, (a, b) in enumerate(segments):
        ka, kb = qkey(a, tol), qkey(b, tol)
        keyed.append((ka, kb))
        adj[ka].append(i)
        adj[kb].append(i)
    used = set()
    paths = []
    for i in range(len(segments)):
        if i in used:
            continue
        used.add(i)
        ka, kb = keyed[i]
        path = [segments[i][0], segments[i][1]]
        ends = [ka, kb]

        def extend(at_end):
            while True:
                node = ends[1] if at_end else ends[0]
                nxt = [j for j in adj[node] if j not in used]
                if not nxt:
                    return
                j = nxt[0]
                used.add(j)
                c, d = segments[j]
                kc, kd = keyed[j]
                if at_end:
                    if kc == node:
                        path.append(d)
                        ends[1] = kd
                    else:
                        path.append(c)
                        ends[1] = kc
                else:
                    if kd == node:
                        path.insert(0, c)
                        ends[0] = kc
                    else:
                        path.insert(0, d)
                        ends[0] = kd

        extend(True)
        extend(False)
        if len(path) >= 2:
            paths.append(path)
    return paths


def collect_waterways(path, into):
    data = load(path)
    feats = data["features"]
    print("  features", len(feats), flush=True)
    groups = {}
    order = []
    for idx, f in enumerate(feats):
        props = f.get("properties") or {}
        if props.get("waterway") != "river":
            continue
        if props.get("tunnel") in ("yes", "culvert"):
            continue
        geom = f.get("geometry")
        if not geom:
            continue
        name = " ".join((props.get("name") or "").split())
        key = name.casefold() if name else f"__{idx}"
        for line in lines_of(geom):
            if len(line) < 2:
                continue
            if key not in groups:
                groups[key] = {"name": name, "km": 0.0, "lines": []}
                order.append(key)
            groups[key]["km"] += km_of(line)
            groups[key]["lines"].append(line)
    del data
    kept_names = 0
    kept_lines = 0
    for key in order:
        g = groups[key]
        if g["km"] < RIVER_KM:
            continue
        if not any(bbox_hit(line) for line in g["lines"]):
            continue
        kept_names += 1
        for line in g["lines"]:
            if bbox_hit(line):
                into.append(line)
                kept_lines += 1
    print(f"  kept {kept_names} rivers / {kept_lines} ways from {os.path.basename(path)}", flush=True)


def main():
    root = "/tmp/geodata"
    countries = load(os.path.join(root, "countries10.geojson"))
    land = {}
    for f in countries["features"]:
        name = f["properties"].get("ADMIN")
        if name in ("Costa Rica", "Nicaragua", "Panama"):
            land[name] = f["geometry"]
    del countries

    lakes = load(os.path.join(root, "lakes10.geojson"))
    lake_geom = None
    for f in lakes["features"]:
        if (f["properties"].get("name") or "") == "Lago de Nicaragua":
            lake_geom = f["geometry"]
            break
    del lakes
    if lake_geom is None:
        raise SystemExit("Lago de Nicaragua missing")

    lake_rings = []
    largest = []
    for poly in polygons_of(lake_geom):
        for ring_i, ring in enumerate(poly):
            simp = rdp(snap_ring([(p[0], p[1]) for p in ring]), 0.004)
            if ring_i == 0 and len(simp) > len(largest):
                largest = simp
            lake_rings.append(simp)
    lake_d = path_of_rings(lake_rings)

    def in_lake(lon, lat):
        return pip(lon, lat, largest) if largest else False

    def split_country(geometry):
        main, islands = [], []
        for poly in polygons_of(geometry):
            exter = rdp(snap_ring([(p[0], p[1]) for p in poly[0]]), 0.0035)
            if len(exter) < 3:
                continue
            holes = []
            for hole in poly[1:]:
                h = rdp(snap_ring([(p[0], p[1]) for p in hole]), 0.0035)
                if len(h) >= 3:
                    holes.append(h)
            cx = sum(p[0] for p in exter) / len(exter)
            cy = sum(p[1] for p in exter) / len(exter)
            # skip pieces entirely outside the sheet
            if not bbox_hit(exter) and not any(bbox_hit(h) for h in holes):
                continue
            target = islands if in_lake(cx, cy) else main
            target.append(exter)
            target.extend(holes)
        return path_of_rings(main), path_of_rings(islands)

    nic_d, nic_islands = split_country(land["Nicaragua"])
    pan_d, pan_islands = split_country(land["Panama"])
    if pan_islands:
        pan_d += pan_islands

    # Provinces — same snap as the border network so coasts meet.
    admin = load(os.path.join(root, "cr_adm1.geojson"))
    provinces = []
    border_segments = []  # internal
    coast_segments = []
    # undirected edge -> list of (province, a, b) with a,b snapped exact tuples
    undirected = {}

    prepared = []
    for f in admin["features"]:
        name = f["properties"]["shapeName"].replace("Provincia ", "")
        rings = []
        exteriors = []
        for poly in polygons_of(f["geometry"]):
            exter = dedupe(snap_ring([(p[0], p[1]) for p in poly[0]]))
            if len(exter) < 3:
                continue
            exteriors.append(exter)
            holes = []
            for hole in poly[1:]:
                h = dedupe(snap_ring([(p[0], p[1]) for p in hole]))
                if len(h) >= 3:
                    holes.append(h)
            rings.append((exter, holes))
        prepared.append((name, rings, exteriors))

    for name, _rings, exteriors in prepared:
        for exter in exteriors:
            closed = exter + [exter[0]]
            for a, b in zip(closed, closed[1:]):
                if a == b:
                    continue
                ka, kb = qkey(a), qkey(b)
                if ka == kb:
                    continue
                key = (ka, kb) if ka < kb else (kb, ka)
                undirected.setdefault(key, []).append((name, a, b))

    for key, owners in undirected.items():
        names = {o[0] for o in owners}
        a, b = owners[0][1], owners[0][2]
        if len(names) >= 2:
            border_segments.append((a, b))
        else:
            coast_segments.append((a, b))

    def simplify_paths(segments, eps):
        lines = []
        for path in chain(segments):
            simp = rdp(path, eps)
            if len(simp) >= 2:
                lines.append(simp)
        return lines

    # Distinguish the international land border from the sea coast: an exterior
    # edge whose midpoint sits on Nicaragua or Panama.
    neighbor_pts = set()
    for geometry in (land["Nicaragua"], land["Panama"]):
        for poly in polygons_of(geometry):
            ring = [(p[0], p[1]) for p in poly[0]]
            for p in ring:
                neighbor_pts.add(qkey(p, 0.006))

    def near_neighbor(a, b):
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        k = qkey((mx, my), 0.006)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if (k[0] + dx, k[1] + dy) in neighbor_pts:
                    return True
        return False

    intl_segments = []
    sea_segments = []
    for a, b in coast_segments:
        if near_neighbor(a, b):
            intl_segments.append((a, b))
        else:
            sea_segments.append((a, b))

    # Fills from lightly simplified snapped rings.
    for name, rings, _exteriors in prepared:
        fill_rings = []
        for exter, holes in rings:
            e = rdp(exter, 0.0032)
            if len(e) < 3:
                continue
            fill_rings.append(e)
            for h in holes:
                hs = rdp(h, 0.0032)
                if len(hs) >= 3:
                    fill_rings.append(hs)
        provinces.append(
            {
                "id": SLUG[name],
                "name": name,
                "numeral": NUMERAL[name],
                "d": path_of_rings(fill_rings),
            }
        )

    # Stable order follows the 1950 index, not the source file.
    order = ["guanacaste", "alajuela", "heredia", "limon", "puntarenas", "sanjose", "cartago"]
    provinces.sort(key=lambda p: order.index(p["id"]))

    coast_lines = simplify_paths(sea_segments, 0.0024)
    intl_lines = simplify_paths(intl_segments, 0.0022)
    border_lines = simplify_paths(border_segments, 0.0018)
    print(
        "chains sea", len(sea_segments), "->", len(coast_lines),
        "intl", len(intl_segments), "->", len(intl_lines),
        "gold", len(border_segments), "->", len(border_lines),
        flush=True,
    )
    coast_d = path_of_lines(coast_lines)
    intl_d = path_of_lines(intl_lines)
    borders_d = path_of_lines(border_lines)

    river_lines = []
    collect_waterways(os.path.join(root, "cri_water", "waterways.geojson"), river_lines)
    collect_waterways(os.path.join(root, "pan_water", "waterways.geojson"), river_lines)

    # The San Juan is the northern border river; Natural Earth has its centerline
    # where the national extracts stop.
    ne = load(os.path.join(root, "rivers10.geojson"))
    sanjuan = 0
    for f in ne["features"]:
        props = f.get("properties") or {}
        if (props.get("name") or "") != "San Juan":
            continue
        if props.get("featurecla") not in ("River", "Lake Centerline"):
            continue
        for line in lines_of(f.get("geometry")):
            if bbox_hit(line):
                river_lines.append([(p[0], p[1]) for p in line])
                sanjuan += 1
    del ne
    print("san juan segments", sanjuan, flush=True)

    segs = []
    for line in river_lines:
        pts = [(p[0], p[1]) for p in line]
        for a, b in zip(pts, pts[1:]):
            if abs(a[0] - b[0]) + abs(a[1] - b[1]) < 1e-8:
                continue
            segs.append((a, b))
    print("river segments", len(segs), flush=True)
    simple_rivers = []
    for path in chain(segs, tol=0.0004):
        if km_of(path) < 9:
            continue
        simp = rdp(path, 0.01)
        if len(simp) >= 2 and bbox_hit(simp):
            simple_rivers.append(simp)
    print("river strokes", len(simple_rivers), flush=True)
    rivers_d = path_of_lines(simple_rivers)

    print(
        "sizes",
        {k: len(v) for k, v in {
            "nic": nic_d,
            "nicIslands": nic_islands,
            "pan": pan_d,
            "lake": lake_d,
            "coast": coast_d,
            "intl": intl_d,
            "borders": borders_d,
            "rivers": rivers_d,
        }.items()},
        "provinces",
        sum(len(p["d"]) for p in provinces),
        flush=True,
    )

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    parts = []
    parts.append("/* Generated by scripts/build-costa-rica-plate.py. Do not edit by hand. */\n")
    parts.append(
        "export const GEO = {\n"
        f"  west: {WEST},\n  east: {EAST},\n  south: {SOUTH},\n  north: {NORTH},\n"
        f"  mapW: {int(MAP_W)},\n  mapH: {int(MAP_H)},\n"
        "} as const;\n\n"
    )
    parts.append(
        "export type PlateProvince = {\n"
        "  id: string;\n  name: string;\n  numeral: string;\n  d: string;\n};\n\n"
    )
    parts.append("export const provinces: PlateProvince[] = ")
    parts.append(json.dumps(provinces, ensure_ascii=False, indent=2))
    parts.append(";\n\n")

    def const(name, value):
        parts.append(f"export const {name} = {json.dumps(value)} as const;\n\n")

    const("nicaragua", nic_d)
    const("nicaraguaIslands", nic_islands)
    const("panama", pan_d)
    const("lakeNicaragua", lake_d)
    const("coast", coast_d)
    const("international", intl_d)
    const("provinceBorders", borders_d)
    const("rivers", rivers_d)

    text = "".join(parts)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote", OUT, "bytes", len(text), flush=True)


if __name__ == "__main__":
    main()
