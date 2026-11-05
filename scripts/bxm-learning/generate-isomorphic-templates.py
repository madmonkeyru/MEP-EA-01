import json

templates = [
    # 1. GEOMETRY: Family bxm-iso-geo-circ-canon
    {
        "familyId": "bxm-iso-geo-circ-canon",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-geo-circunferencia-01",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "titleTemplate": "Ecuación Canónica de Circunferencia dado Centro y Radio",
        "description": "Genera circunferencias con centro entero en cualquier cuadrante y radios enteros positivos.",
        "parameterRanges": {
            "h": {"min": -8, "max": 8, "step": 1, "exclude": [0]},
            "k": {"min": -8, "max": 8, "step": 1, "exclude": [0]},
            "r": {"min": 2, "max": 12, "step": 1}
        },
        "sampleParameters": [
            {"h": 4, "k": -5, "r": 6},
            {"h": -3, "k": 2, "r": 7},
            {"h": -6, "k": -1, "r": 5}
        ]
    },

    # 2. GEOMETRY: Family bxm-iso-geo-sphere-cut
    {
        "familyId": "bxm-iso-geo-sphere-cut",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.3",
        "evidenceCode": "A5.3",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "titleTemplate": "Radio de Sección Plana en Esfera",
        "description": "Genera ternas pitagóricas para radio de esfera R, distancia d y radio de sección r.",
        "parameterRanges": {
            "tripletIndex": {"min": 0, "max": 4}
        },
        "sampleParameters": [
            {"R": 10, "d": 6, "r": 8},
            {"R": 13, "d": 5, "r": 12},
            {"R": 15, "d": 9, "r": 12},
            {"R": 17, "d": 8, "r": 15},
            {"R": 25, "d": 7, "r": 24}
        ]
    },

    # 3. FUNCTIONS: Family bxm-iso-func-slope-intercept
    {
        "familyId": "bxm-iso-func-slope-intercept",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "titleTemplate": "Ecuación de la Recta con Pendiente y Punto",
        "description": "Genera rectas $y = mx + b$ con pendiente entera no nula y punto entero $(x_1, y_1)$.",
        "parameterRanges": {
            "m": {"min": -5, "max": 5, "exclude": [0]},
            "x1": {"min": -4, "max": 4},
            "y1": {"min": -6, "max": 6}
        },
        "sampleParameters": [
            {"m": 3, "x1": 2, "y1": 1},
            {"m": -2, "x1": -1, "y1": 5},
            {"m": 4, "x1": 1, "y1": -2}
        ]
    },

    # 4. STATISTICS: Family bxm-iso-stat-ric-box
    {
        "familyId": "bxm-iso-stat-ric-box",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "titleTemplate": "Recorrido Intercuartílico en Diagrama de Cajas",
        "description": "Genera valores de Q1 y Q3 para calcular RIC = Q3 - Q1 y distractores estándar.",
        "parameterRanges": {
            "q1": {"min": 20, "max": 60, "step": 5},
            "ric": {"min": 15, "max": 40, "step": 5}
        },
        "sampleParameters": [
            {"q1": 35, "q3": 65, "ric": 30},
            {"q1": 40, "q3": 75, "ric": 35},
            {"q1": 50, "q3": 72, "ric": 22}
        ]
    }
]

output = {
    "version": "v1.0.0",
    "totalTemplates": len(templates),
    "templates": templates
}

with open('content/bxm-mvp-learning/isomorphic-templates.json', 'w', encoding='utf-8') as out_f:
    json.dump(output, out_f, indent=2, ensure_ascii=False)

print(f"Generated {len(templates)} isomorphic templates across Geometry, Functions, and Statistics.")
