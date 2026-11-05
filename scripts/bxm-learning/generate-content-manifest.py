import json

with open('content/bxm-mvp-learning/evidence-catalog.json') as f:
    ev_cat = json.load(f)

with open('content/bxm-mvp-learning/authored-items-pack.json') as f:
    items_pack = json.load(f)

with open('content/bxm-mvp-learning/lessons-pack.json') as f:
    lessons_pack = json.load(f)

with open('content/bxm-mvp-learning/isomorphic-templates.json') as f:
    iso_pack = json.load(f)

manifest = {
    "manifestVersion": "v1.0.0",
    "programId": "bxm",
    "subjectId": "matematica",
    "specId": "02-2026",
    "summary": {
        "officialEvidenceCount": ev_cat["totalEvidences"],
        "completedLessons": lessons_pack["totalLessons"],
        "scaffoldedEvidenceCount": ev_cat["scaffoldedEvidences"],
        "baseAuthoredItems": items_pack["totalItems"],
        "isomorphicTemplateFamilies": iso_pack["totalTemplates"],
        "domains": {
            "geometry": {
                "baseAuthored": items_pack["domainCounts"]["geometry"],
                "completedLessons": 2,
                "isomorphicFamilies": 2
            },
            "functions": {
                "baseAuthored": items_pack["domainCounts"]["functions"],
                "completedLessons": 1,
                "isomorphicFamilies": 1
            },
            "statistics": {
                "baseAuthored": items_pack["domainCounts"]["statistics"],
                "completedLessons": 1,
                "isomorphicFamilies": 1
            }
        }
    },
    "provenanceSummary": {
        "streamA_officialBenchmark": "content/programs/bxm/matematica/convocatorias/2026-c2.json (EXCLUDED from authored learning pool)",
        "streamB_proprietaryAuthored": "content/bxm-mvp-learning/authored-items-pack.json (30 base items, authored_computationally_checked)"
    },
    "artifacts": {
        "evidenceCatalog": "content/bxm-mvp-learning/evidence-catalog.json",
        "authoredPack": "content/bxm-mvp-learning/authored-items-pack.json",
        "lessonsPack": "content/bxm-mvp-learning/lessons-pack.json",
        "isomorphicTemplates": "content/bxm-mvp-learning/isomorphic-templates.json"
    }
}

with open('content/bxm-mvp-learning/content-manifest.json', 'w', encoding='utf-8') as out_f:
    json.dump(manifest, out_f, indent=2, ensure_ascii=False)

print("Generated content-manifest.json successfully.")
