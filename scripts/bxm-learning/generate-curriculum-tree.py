import json

with open('content/programs/bxm/matematica/specs/02-2026.json') as f:
    specs = json.load(f)

# Anchor evidences that have full lesson coverage in this pass:
# Geometry:
#   A1.2 (Reconoce representación algebraica de circunferencia) -> lesson-geometry-a1-1
#   A5.3 (Determina características métricas de secciones planas en esfera/cilindro) -> lesson-geometry-a5-2
# Functions:
#   A2.3 (Determina pendiente, intersecciones de recta) -> lesson-functions-a2-3
# Statistics:
#   A1.2 (Interpreta medidas de posición) -> lesson-statistics-a1-2

ANCHOR_LESSONS = {
    'bxm/matematica/02-2026/geometry/A1.2': 'lesson-geometry-a1-1',
    'bxm/matematica/02-2026/geometry/A5.3': 'lesson-geometry-a5-2',
    'bxm/matematica/02-2026/functions/A2.3': 'lesson-functions-a2-3',
    'bxm/matematica/02-2026/statistics/A1.2': 'lesson-statistics-a1-2'
}

evidence_catalog = []
total_count = 0

for block in specs['blocks']:
    domain = block['areaId']
    for aff in block['affirmations']:
        for ev in aff['evidences']:
            code = ev['code']
            stable_key = f"bxm/matematica/02-2026/{domain}/{code}"
            lesson_id = ANCHOR_LESSONS.get(stable_key)
            is_anchor = lesson_id is not None
            status = "complete" if is_anchor else "scaffolded_available_soon"

            entry = {
                "key": stable_key,
                "domain": domain,
                "blockCode": block['blockCode'],
                "blockName": block['name'],
                "affirmationCode": aff['code'],
                "affirmationDesc": aff['desc'],
                "evidenceCode": code,
                "evidenceDesc": ev['desc'],
                "conceptIds": [],
                "status": status,
                "lessonId": lesson_id,
                "hasInteractiveVisual": stable_key in {'bxm/matematica/02-2026/geometry/A1.2', 'bxm/matematica/02-2026/geometry/A5.3'},
                "reviewStatus": "authored_computationally_checked" if is_anchor else "canonical_scaffolded"
            }
            evidence_catalog.append(entry)
            total_count += 1

output = {
    "programId": "bxm",
    "subjectId": "matematica",
    "specId": "02-2026",
    "totalEvidences": total_count,
    "completedEvidences": sum(1 for e in evidence_catalog if e["status"] == "complete"),
    "scaffoldedEvidences": sum(1 for e in evidence_catalog if e["status"] == "scaffolded_available_soon"),
    "evidences": evidence_catalog
}

with open('content/bxm-mvp-learning/evidence-catalog.json', 'w', encoding='utf-8') as out_f:
    json.dump(output, out_f, indent=2, ensure_ascii=False)

print(f"Updated evidence-catalog with {output['completedEvidences']} complete lessons matching lessons-pack.json.")
