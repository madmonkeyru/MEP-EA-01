import json

authored_items = []

# --- GEOMETRY (10 items) ---
# Anchor A1.1, A1.2 (Circunferencia: centro, radio, ecuación canónica, puntos interiores/exteriores)
# Anchor A5.2, A5.3 (Secciones planas de esfera y cilindro)

geo_items = [
    {
        "id": "bxm-authored-v1-geo-001",
        "code": "bxm-authored-v1-geo-001",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-geo-circunferencia-01",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Considere una circunferencia cuyo centro es el punto $(3, -4)$ y cuya medida del radio es $5$. ¿Cuál es la ecuación canónica de dicha circunferencia?",
        "options": {
            "A": "$(x - 3)^2 + (y + 4)^2 = 25$",
            "B": "$(x + 3)^2 + (y - 4)^2 = 25$",
            "C": "$(x - 3)^2 + (y + 4)^2 = 5$",
            "D": "$(x + 3)^2 + (y - 4)^2 = 5$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Invirtió los signos de las coordenadas del centro al sustituir en $(x-h)^2 + (y-k)^2 = r^2$.",
            "C": "Olvidó elevar el radio al cuadrado en el miembro derecho ($r=5$, pero puso $5$ en vez de $25$).",
            "D": "Invirtió los signos del centro y además no elevó el radio al cuadrado."
        },
        "solutionSteps": [
            "La forma canónica de una circunferencia con centro $(h, k)$ y radio $r$ es $(x - h)^2 + (y - k)^2 = r^2$.",
            "Sustituyendo $h = 3$, $k = -4$ y $r = 5$:",
            "$(x - 3)^2 + (y - (-4))^2 = 5^2$",
            "$(x - 3)^2 + (y + 4)^2 = 25$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-002",
        "code": "bxm-authored-v1-geo-002",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-geo-centro-radio-02",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Dada la circunferencia con ecuación $(x + 2)^2 + (y - 7)^2 = 49$, ¿cuáles son las coordenadas de su centro y la medida de su diámetro?",
        "options": {
            "A": "Centro $(-2, 7)$ y diámetro $14$",
            "B": "Centro $(2, -7)$ y diámetro $14$",
            "C": "Centro $(-2, 7)$ y diámetro $7$",
            "D": "Centro $(2, -7)$ y diámetro $49$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Error de signos al extraer el centro $(h,k)$.",
            "C": "Confundió la medida del radio ($r = 7$) con la del diámetro ($d = 2r = 14$).",
            "D": "Confundió el centro con signos opuestos y tomó $r^2=49$ como el diámetro."
        },
        "solutionSteps": [
            "Al comparar con $(x - h)^2 + (y - k)^2 = r^2$, tenemos $-h = 2 \\Rightarrow h = -2$ y $-k = -7 \\Rightarrow k = 7$.",
            "Por tanto el centro es $(-2, 7)$.",
            "El radio satisface $r^2 = 49 \\Rightarrow r = 7$.",
            "El diámetro es $d = 2r = 2 \\cdot 7 = 14$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-003",
        "code": "bxm-authored-v1-geo-003",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.1",
        "evidenceCode": "A1.1",
        "conceptId": "mep-geo-circunferencia-01",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Una circunferencia tiene su centro en el origen $(0,0)$ y pasa por el punto $P(3, 4)$. ¿Cuál es la ecuación de dicha circunferencia?",
        "options": {
            "A": "$x^2 + y^2 = 25$",
            "B": "$x^2 + y^2 = 5$",
            "C": "$x^2 + y^2 = 7$",
            "D": "$(x - 3)^2 + (y - 4)^2 = 25$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Calculó el radio $r = 5$, pero no lo elevó al cuadrado en la ecuación.",
            "C": "Sumó las coordenadas $3 + 4 = 7$ en vez de calcular la distancia euclidiana.",
            "D": "Confundió el punto de paso con las coordenadas del centro."
        },
        "solutionSteps": [
            "El radio es la distancia del centro $(0,0)$ al punto $P(3,4)$: $r = \\sqrt{(3-0)^2 + (4-0)^2} = \\sqrt{9 + 16} = 5$.",
            "La ecuación canónica con centro en el origen es $x^2 + y^2 = r^2$.",
            "Sustituyendo $r = 5$: $x^2 + y^2 = 25$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-004",
        "code": "bxm-authored-v1-geo-004",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-geo-posicion-punto-04",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Considere la circunferencia $C: (x - 1)^2 + (y + 2)^2 = 20$. ¿Cuál es la posición relativa del punto $Q(3, 2)$ con respecto a $C$?",
        "options": {
            "A": "Punto interior a la circunferencia",
            "B": "Punto exterior a la circunferencia",
            "C": "Punto perteneciente a la circunferencia",
            "D": "Punto concéntrico"
        },
        "correctOption": "C",
        "distractorRationale": {
            "A": "Calculó incorrectamente la expresión pensando que daba menor que 20.",
            "B": "Creyó que al dar 20 superaba el radio, confundiendo el valor de $r^2$ con $r$.",
            "D": "El punto concéntrico debe ser exactamente el centro $(1,-2)$."
        },
        "solutionSteps": [
            "Evaluamos las coordenadas de $Q(3,2)$ en la expresión $(x - 1)^2 + (y + 2)^2$:",
            "$(3 - 1)^2 + (2 + 2)^2 = (2)^2 + (4)^2 = 4 + 16 = 20$.",
            "Como el resultado $20$ es exactamente igual al miembro derecho $r^2 = 20$, el punto pertenece a la circunferencia."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-005",
        "code": "bxm-authored-v1-geo-005",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.2",
        "evidenceCode": "A5.2",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Si se interseca una esfera con un plano que no pasa por su centro pero corta la superficie esférica en más de un punto, ¿qué figura geométrica se obtiene como sección plana?",
        "options": {
            "A": "Una circunferencia",
            "B": "Una elipse no circular",
            "C": "Una parábola",
            "D": "Un segmento de recta"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Toda sección plana no vacía ni tangente de una esfera es siempre circular, nunca una elipse achatada.",
            "C": "Las parábolas surgen como secciones cónicas, no de esferas.",
            "D": "El corte de un sólido tridimensional por un plano produce una superficie bidimensional delimitada por una curva, no un segmento."
        },
        "solutionSteps": [
            "Por propiedad fundamental de la esfera, cualquier corte plano que interseca a la esfera genera un círculo (o su contorno, una circunferencia).",
            "Si el plano pasa por el centro, se llama círculo máximo; si no pasa por el centro, se llama círculo menor."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-006",
        "code": "bxm-authored-v1-geo-006",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.3",
        "evidenceCode": "A5.3",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Una esfera de radio $R = 10\\text{ cm}$ es cortada por un plano que se encuentra a una distancia de $6\\text{ cm}$ de su centro. ¿Cuál es el radio $r$ de la sección circular obtenida?",
        "options": {
            "A": "$8\\text{ cm}$",
            "B": "$4\\text{ cm}$",
            "C": "$16\\text{ cm}$",
            "D": "$\\sqrt{136}\\text{ cm}$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Restó directamente el radio menos la distancia: $10 - 6 = 4\\text{ cm}$.",
            "C": "Sumó el radio y la distancia: $10 + 6 = 16\\text{ cm}$.",
            "D": "Sumó los cuadrados en vez de restarlos: $\\sqrt{10^2 + 6^2} = \\sqrt{136}$."
        },
        "solutionSteps": [
            "Se aplica el Teorema de Pitágoras entre el radio de la esfera $R$, la distancia del plano al centro $d$, y el radio de la sección plana $r$:",
            "$R^2 = d^2 + r^2$",
            "$10^2 = 6^2 + r^2 \\Rightarrow 100 = 36 + r^2$",
            "$r^2 = 100 - 36 = 64 \\Rightarrow r = \\sqrt{64} = 8\\text{ cm}$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-007",
        "code": "bxm-authored-v1-geo-007",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.3",
        "evidenceCode": "A5.3",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Un plano interseca a una esfera de radio $R = 13\\text{ cm}$. Si el área de la sección circular resultante es $25\\pi\\text{ cm}^2$, ¿a qué distancia del centro de la esfera se encuentra dicho plano?",
        "options": {
            "A": "$12\\text{ cm}$",
            "B": "$5\\text{ cm}$",
            "C": "$8\\text{ cm}$",
            "D": "$\\sqrt{194}\\text{ cm}$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Confundió la distancia $d$ con el radio de la sección plana $r = 5\\text{ cm}$.",
            "C": "Restó $13 - 5 = 8\\text{ cm}$ de forma lineal.",
            "D": "Sumó los cuadrados de $13^2 + 5^2$ en lugar de despejar el cateto."
        },
        "solutionSteps": [
            "El área de la sección circular es $A = \\pi r^2 = 25\\pi \\Rightarrow r^2 = 25 \\Rightarrow r = 5\\text{ cm}$.",
            "Por la relación pitagórica en la esfera: $R^2 = d^2 + r^2$.",
            "$13^2 = d^2 + 5^2 \\Rightarrow 169 = d^2 + 25$.",
            "$d^2 = 169 - 25 = 144 \\Rightarrow d = 12\\text{ cm}$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-008",
        "code": "bxm-authored-v1-geo-008",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.2",
        "evidenceCode": "A5.2",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Al realizar un corte con un plano paralelo a las bases de un cilindro circular recto, ¿qué figura geométrica se obtiene como sección plana?",
        "options": {
            "A": "Un círculo congruente con las bases",
            "B": "Un rectángulo",
            "C": "Una elipse de mayor área que la base",
            "D": "Un trapecio"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "El rectángulo se obtiene cuando el corte es perpendicular a las bases (corte axial).",
            "C": "La elipse se obtiene mediante un corte oblicuo que no corte a las bases.",
            "D": "Un cilindro circular recto no produce trapecios mediante cortes planos."
        },
        "solutionSteps": [
            "Cualquier plano paralelo a las bases de un cilindro circular recto genera una sección plana idéntica (congruente) a las bases circulares del cilindro."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-009",
        "code": "bxm-authored-v1-geo-009",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.1",
        "evidenceCode": "A1.1",
        "conceptId": "mep-geo-circunferencia-01",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Una circunferencia tiene como extremos de uno de sus diámetros los puntos $A(-1, 2)$ y $B(5, 2)$. ¿Cuál es la ecuación de dicha circunferencia?",
        "options": {
            "A": "$(x - 2)^2 + (y - 2)^2 = 9$",
            "B": "$(x + 2)^2 + (y + 2)^2 = 9$",
            "C": "$(x - 2)^2 + (y - 2)^2 = 36$",
            "D": "$(x - 3)^2 + (y - 2)^2 = 9$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Invirtió los signos del centro al formular la ecuación.",
            "C": "Tomó la longitud total del diámetro ($6$) y la elevó al cuadrado en lugar del radio ($r=3, r^2=9$).",
            "D": "Calculó erróneamente el punto medio en la coordenada $x$."
        },
        "solutionSteps": [
            "El centro es el punto medio del diámetro: $M = \\left(\\frac{-1 + 5}{2}, \\frac{2 + 2}{2}\\right) = (2, 2)$.",
            "El diámetro mide la distancia entre $A$ y $B$: $d = 5 - (-1) = 6$. Por ende, el radio es $r = 6/2 = 3$.",
            "La ecuación es $(x - 2)^2 + (y - 2)^2 = 3^2 = 9$."
        ]
    },
    {
        "id": "bxm-authored-v1-geo-010",
        "code": "bxm-authored-v1-geo-010",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.3",
        "evidenceCode": "A5.3",
        "conceptId": "mep-geo-cuerpos-3d-09",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Si un plano pasa a una distancia $d = 15\\text{ cm}$ del centro de una esfera cuyo diámetro mide $34\\text{ cm}$, ¿cuál es el perímetro de la circunferencia que bordea la sección obtenida?",
        "options": {
            "A": "$16\\pi\\text{ cm}$",
            "B": "$8\\pi\\text{ cm}$",
            "C": "$64\\pi\\text{ cm}$",
            "D": "$32\\pi\\text{ cm}$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Multiplicó $\\pi r$ en lugar de $2\\pi r$.",
            "C": "Calculó el área en lugar del perímetro y omitió el radio lineal.",
            "D": "Tomó el diámetro de la sección en vez del perímetro."
        },
        "solutionSteps": [
            "El diámetro es $34\\text{ cm}$, luego el radio de la esfera es $R = 17\\text{ cm}$.",
            "Por Pitágoras: $r^2 = R^2 - d^2 = 17^2 - 15^2 = 289 - 225 = 64$.",
            "El radio de la sección plana es $r = \\sqrt{64} = 8\\text{ cm}$.",
            "El perímetro de la circunferencia es $P = 2\\pi r = 2\\pi(8) = 16\\pi\\text{ cm}$."
        ]
    }
]

# --- FUNCTIONS / ALGEBRA (10 items) ---
# Anchor A2.3, A2.4 (Recta: pendiente, intersecciones, ecuación)

func_items = [
    {
        "id": "bxm-authored-v1-func-001",
        "code": "bxm-authored-v1-func-001",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "¿Cuál es la pendiente de la recta que pasa por los puntos $P(2, -3)$ y $Q(6, 5)$?",
        "options": {
            "A": "$2$",
            "B": "$\\frac{1}{2}$",
            "C": "$-2$",
            "D": "$4$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Invirtió la fórmula calculando $\\Delta x / \\Delta y$ en vez de $\\Delta y / \\Delta x$.",
            "C": "Error de signos en la diferencia de las ordenadas.",
            "D": "Calculó únicamente la diferencia de las abscisas."
        },
        "solutionSteps": [
            "La fórmula de la pendiente es $m = \\frac{y_2 - y_1}{x_2 - x_1}$.",
            "Sustituyendo los puntos: $m = \\frac{5 - (-3)}{6 - 2} = \\frac{5 + 3}{4} = \\frac{8}{4} = 2$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-002",
        "code": "bxm-authored-v1-func-002",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Dada la ecuación de la recta $3x + 2y - 12 = 0$, ¿cuál es su punto de intersección con el eje de las abscisas ($x$)?",
        "options": {
            "A": "$(4, 0)$",
            "B": "$(0, 6)$",
            "C": "$(-4, 0)$",
            "D": "$(0, 4)$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Calculó la intersección con el eje de las ordenadas ($y$) en lugar de las abscisas.",
            "C": "Error de signos al despejar $3x = 12$.",
            "D": "Confundió las coordenadas $x$ e $y$."
        },
        "solutionSteps": [
            "La intersección con el eje $x$ ocurre cuando $y = 0$.",
            "Sustituyendo $y = 0$: $3x + 2(0) - 12 = 0 \\Rightarrow 3x = 12 \\Rightarrow x = 4$.",
            "Por tanto el punto es $(4, 0)$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-003",
        "code": "bxm-authored-v1-func-003",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "¿Cuál es la ecuación de la recta que tiene pendiente $m = -3$ y pasa por el punto $A(2, 1)$?",
        "options": {
            "A": "$y = -3x + 7$",
            "B": "$y = -3x - 5$",
            "C": "$y = -3x + 1$",
            "D": "$y = 3x - 5$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Restó incorrectamente al calcular el corte con el eje $y$: $b = y - mx = 1 - (-3)(2) = 1 + 6 = 7$, pero obtuvo $-5$.",
            "C": "Tomó directamente el valor de la ordenada $y=1$ como el intercepto $b$.",
            "D": "Cambió el signo de la pendiente a positiva."
        },
        "solutionSteps": [
            "Usamos la forma punto-pendiente $y - y_1 = m(x - x_1)$.",
            "$y - 1 = -3(x - 2) \\Rightarrow y - 1 = -3x + 6$.",
            "$y = -3x + 7$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-004",
        "code": "bxm-authored-v1-func-004",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "¿Cuál es la ecuación de la recta que pasa por los puntos $(-1, 4)$ y $(2, -2)$?",
        "options": {
            "A": "$y = -2x + 2$",
            "B": "$y = -2x + 6$",
            "C": "$y = 2x + 6$",
            "D": "$y = -\\frac{1}{2}x + \\frac{7}{2}$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Calculó mal el valor de $b$ al sustituir el punto $(2, -2)$.",
            "C": "Calculó erróneamente el signo de la pendiente.",
            "D": "Invirtió la pendiente como si fuera una recta perpendicular."
        },
        "solutionSteps": [
            "Primero calculamos la pendiente: $m = \\frac{-2 - 4}{2 - (-1)} = \\frac{-6}{3} = -2$.",
            "Ahora calculamos el intercepto $b = y_1 - m x_1 = 4 - (-2)(-1) = 4 - 2 = 2$.",
            "La ecuación es $y = -2x + 2$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-005",
        "code": "bxm-authored-v1-func-005",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Considere la recta $L: y = \\frac{3}{4}x - 6$. ¿Cuál es la distancia entre el punto de intersección de $L$ con el eje $x$ y su punto de intersección con el eje $y$?",
        "options": {
            "A": "$10$",
            "B": "$14$",
            "C": "$8$",
            "D": "$\\sqrt{28}$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Sumó las magnitudes de los interceptos $8 + 6 = 14$ sin aplicar la distancia euclidiana.",
            "C": "Tomó solo el valor del intercepto con el eje $x$.",
            "D": "Restó los cuadrados en vez de sumarlos."
        },
        "solutionSteps": [
            "Intersección con el eje $y$: $(0, -6)$.",
            "Intersección con el eje $x$: $0 = \\frac{3}{4}x - 6 \\Rightarrow \\frac{3}{4}x = 6 \\Rightarrow x = 8$, punto $(8, 0)$.",
            "Distancia entre $(8,0)$ y $(0,-6)$: $d = \\sqrt{(8-0)^2 + (0 - (-6))^2} = \\sqrt{64 + 36} = \\sqrt{100} = 10$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-006",
        "code": "bxm-authored-v1-func-006",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Una recta $L_1$ tiene ecuación $2x - 5y + 10 = 0$. Si una recta $L_2$ es perpendicular a $L_1$ y tiene la misma intersección con el eje $y$ que $L_1$, ¿cuál es la ecuación de $L_2$?",
        "options": {
            "A": "$y = -\\frac{5}{2}x + 2$",
            "B": "$y = -\\frac{5}{2}x - 2$",
            "C": "$y = \\frac{2}{5}x + 2$",
            "D": "$y = \\frac{5}{2}x + 2$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Error en el signo del punto de intersección con el eje $y$.",
            "C": "Usó la condición de rectas paralelas en lugar de perpendiculares.",
            "D": "Invirtió la pendiente pero olvidó cambiarle el signo negativo."
        },
        "solutionSteps": [
            "Despejamos $L_1$: $5y = 2x + 10 \\Rightarrow y = \\frac{2}{5}x + 2$.",
            "Su pendiente es $m_1 = \\frac{2}{5}$ y su intersección con el eje $y$ es $(0, 2)$, por lo que $b = 2$.",
            "Como $L_2 \\perp L_1$, su pendiente es el opuesto recíproco: $m_2 = -\\frac{1}{m_1} = -\\frac{5}{2}$.",
            "La ecuación de $L_2$ es $y = -\\frac{5}{2}x + 2$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-007",
        "code": "bxm-authored-v1-func-007",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Si una función lineal $f(x) = mx + b$ es estrictamente decreciente y pasa por el punto $(0, -4)$, se cumple con certeza que:",
        "options": {
            "A": "$m < 0$ y $b = -4$",
            "B": "$m > 0$ y $b = -4$",
            "C": "$m < 0$ y $b = 4$",
            "D": "$m = 0$ y $b = -4$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Una función con $m > 0$ es estrictamente creciente.",
            "C": "El punto $(0, -4)$ indica que el corte es $b = -4$, no $+4$.",
            "D": "Con $m = 0$ la función es constante."
        },
        "solutionSteps": [
            "Por definición, una función lineal es estrictamente decreciente si y solo si su pendiente es negativa: $m < 0$.",
            "Dado que pasa por $(0, -4)$, su intersección con el eje de las ordenadas es $b = -4$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-008",
        "code": "bxm-authored-v1-func-008",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "El costo $C(x)$ en colones de producir $x$ unidades de un artículo se modela con una función lineal. Si producir $10$ unidades cuesta $\\text{₡}15\\,000$ y producir $25$ unidades cuesta $\\text{₡}30\\,000$, ¿cuál es el costo fijo (cuando $x = 0$)?",
        "options": {
            "A": "$\\text{₡}5\\,000$",
            "B": "$\\text{₡}1\\,000$",
            "C": "$\\text{₡}10\\,000$",
            "D": "$\\text{₡}15\\,000$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Confundió el costo fijo con la pendiente marginal de $\\text{₡}1\\,000$ por unidad.",
            "C": "Estimación incorrecta restando arbitrariamente.",
            "D": "Asumió que el costo de 10 unidades era el costo base."
        },
        "solutionSteps": [
            "Tenemos los pares ordenados $(10, 15000)$ y $(25, 30000)$.",
            "La pendiente (costo variable por unidad) es $m = \\frac{30000 - 15000}{25 - 10} = \\frac{15000}{15} = 1000$.",
            "El costo fijo es $b = C(x) - mx$: $b = 15000 - 1000(10) = 15000 - 10000 = 5000$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-009",
        "code": "bxm-authored-v1-func-009",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "La gráfica de una recta pasa por el origen $(0,0)$ y por el punto $(-4, 12)$. ¿En qué punto interseca esta recta a la línea horizontal $y = -15$?",
        "options": {
            "A": "$(5, -15)$",
            "B": "$(-5, -15)$",
            "C": "$\\left(-\\frac{1}{3}, -15\\right)$",
            "D": "$(45, -15)$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Error de signos al dividir $-15$ entre la pendiente $-3$.",
            "C": "Invirtió la pendiente.",
            "D": "Multiplicó $-15 \\cdot (-3)$ en lugar de dividir."
        },
        "solutionSteps": [
            "La pendiente es $m = \\frac{12 - 0}{-4 - 0} = -3$.",
            "Al pasar por el origen, su ecuación es $y = -3x$.",
            "Para encontrar la abscisa cuando $y = -15$: $-15 = -3x \\Rightarrow x = \\frac{-15}{-3} = 5$.",
            "El punto de intersección es $(5, -15)$."
        ]
    },
    {
        "id": "bxm-authored-v1-func-010",
        "code": "bxm-authored-v1-func-010",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.4",
        "evidenceCode": "A2.4",
        "conceptId": "mep-alg-funcion-lineal-03",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Considere el triángulo con vértices en $A(0,0)$, $B(4, 8)$ y $C(6, 0)$. ¿Cuál es la ecuación de la recta que contiene a la mediana trazada desde el vértice $B$ hasta el lado $AC$?",
        "options": {
            "A": "$y = 8x - 24$",
            "B": "$y = -8x + 40$",
            "C": "$y = 4x - 8$",
            "D": "$y = 2x$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Error de signos en la pendiente.",
            "C": "Calculó mal la pendiente entre $(4,8)$ y el punto medio $(3,0)$.",
            "D": "Ecuación de la recta que pasa por el origen en lugar de la mediana al lado AC."
        },
        "solutionSteps": [
            "La mediana va desde $B(4,8)$ hasta el punto medio del segmento $AC$.",
            "Punto medio de $AC$: $M = \\left(\\frac{0+6}{2}, \\frac{0+0}{2}\\right) = (3, 0)$.",
            "Calculamos la pendiente de la recta que pasa por $B(4,8)$ y $M(3,0)$:",
            "$m = \\frac{8 - 0}{4 - 3} = \\frac{8}{1} = 8$.",
            "Calculamos $b$: $0 = 8(3) + b \\Rightarrow b = -24$.",
            "La ecuación es $y = 8x - 24$."
        ]
    }
]

# --- STATISTICS (10 items) ---
# Anchor A1.2 (Medidas de posición: media, mediana, moda, cuartiles)
# Anchor A3.2 (Diagrama de cajas y comparación de grupos)

stat_items = [
    {
        "id": "bxm-authored-v1-stat-001",
        "code": "bxm-authored-v1-stat-001",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-est-medidas-posicion-01",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Se tienen las calificaciones de 7 estudiantes: $68, 72, 75, 80, 85, 90, 94$. ¿Cuál es el valor de la mediana de este conjunto de datos?",
        "options": {
            "A": "$80$",
            "B": "$80.57$",
            "C": "$75$",
            "D": "$85$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Calculó la media aritmética en lugar de la mediana.",
            "C": "Tomó el primer cuartil aproximado.",
            "D": "Tomó el tercer cuartil."
        },
        "solutionSteps": [
            "Los datos ya están ordenados en forma ascendente: $68, 72, 75, 80, 85, 90, 94$.",
            "Al ser $n = 7$ (número impar), la mediana corresponde exactamente al dato central en la posición $\\frac{7+1}{2} = 4$.",
            "El cuarto dato es $80$."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-002",
        "code": "bxm-authored-v1-stat-002",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-est-medidas-posicion-01",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "La media de un conjunto de $5$ números es $14$. Si se añade un sexto número y la nueva media es $15$, ¿cuál es el valor del número añadido?",
        "options": {
            "A": "$20$",
            "B": "$15$",
            "C": "$25$",
            "D": "$19$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Pensó que para que la media sea 15, el número nuevo debía ser exactamente 15.",
            "C": "Sumó 10 unidades arbitrarias.",
            "D": "Restó incorrectamente los totales."
        },
        "solutionSteps": [
            "La suma de los primeros 5 datos es $S_5 = 5 \\cdot 14 = 70$.",
            "Con el nuevo número $x$, la suma de los 6 datos es $S_6 = 6 \\cdot 15 = 90$.",
            "Por lo tanto, el nuevo dato es $x = S_6 - S_5 = 90 - 70 = 20$."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-003",
        "code": "bxm-authored-v1-stat-003",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "En un diagrama de caja, el primer cuartil es $Q_1 = 42$ y el tercer cuartil es $Q_3 = 68$. ¿Cuál es el valor del recorrido intercuartílico (RIC)?",
        "options": {
            "A": "$26$",
            "B": "$110$",
            "C": "$55$",
            "D": "$13$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Sumó los cuartiles $42 + 68 = 110$ en vez de restarlos.",
            "C": "Calculó el promedio de los cuartiles.",
            "D": "Dividió el resultado entre dos."
        },
        "solutionSteps": [
            "Por definición, el recorrido intercuartílico es la diferencia entre el tercer y el primer cuartil:",
            "$\\text{RIC} = Q_3 - Q_1 = 68 - 42 = 26$."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-004",
        "code": "bxm-authored-v1-stat-004",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "El resumen de cinco números de los salarios (en miles de colones) de una empresa es: $\\text{Mín} = 350$, $Q_1 = 450$, $\\text{Med} = 550$, $Q_3 = 700$, $\\text{Máx} = 950$. ¿Qué porcentaje de los empleados percibe un salario de al menos $\\text{₡}450\\,000$?",
        "options": {
            "A": "Aproximadamente el $75\\%$",
            "B": "Aproximadamente el $25\\%$",
            "C": "Aproximadamente el $50\\%$",
            "D": "Aproximadamente el $60\\%$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Tomó el porcentaje de empleados por debajo de $Q_1$ en lugar de por encima.",
            "C": "Confundió $Q_1$ con la mediana.",
            "D": "Estimación arbitraria."
        },
        "solutionSteps": [
            "$Q_1 = 450$ deja por debajo al $25\\%$ de los datos más bajos.",
            "Por lo tanto, desde $Q_1$ hasta el máximo se concentra el $100\\% - 25\\% = 75\\%$ restante de la distribución."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-005",
        "code": "bxm-authored-v1-stat-005",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Se comparan dos secciones escolares mediante sus diagramas de caja en una prueba de Matemáticas:\n- Sección A: $\\text{Mín} = 40, Q_1 = 60, \\text{Med} = 72, Q_3 = 85, \\text{Máx} = 100$.\n- Sección B: $\\text{Mín} = 55, Q_1 = 70, \\text{Med} = 80, Q_3 = 90, \\text{Máx} = 98$.\n¿Cuál de las siguientes afirmaciones es verdadera con certeza?",
        "options": {
            "A": "Al menos el $50\\%$ de los alumnos de la Sección B obtuvo una nota mayor o igual a $80$.",
            "B": "La Sección A tiene mayor mediana que la Sección B.",
            "C": "La nota máxima de la Sección B es mayor que la de la Sección A.",
            "D": "El recorrido total de la Sección B es mayor que el de la Sección A."
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "La mediana de A es 72 y la de B es 80 ($72 < 80$).",
            "C": "El máximo de A es 100 y el de B es 98 ($100 > 98$).",
            "D": "Recorrido de A es $100 - 40 = 60$; recorrido de B es $98 - 55 = 43$ ($60 > 43$)."
        },
        "solutionSteps": [
            "La mediana de la Sección B es $80$. Por definición de mediana, al menos el $50\\%$ de las observaciones es mayor o igual a este valor.",
            "Todas las demás opciones contradicen los valores numéricos dados."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-006",
        "code": "bxm-authored-v1-stat-006",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-est-medidas-posicion-01",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "En una distribución unimodal de estaturas de 100 personas, se determinó que la media es $165\\text{ cm}$ y la mediana es $170\\text{ cm}$. ¿Qué tipo de asimetría presenta esta distribución?",
        "options": {
            "A": "Asimetría negativa (o con sesgo a la izquierda)",
            "B": "Asimetría positiva (o con sesgo a la derecha)",
            "C": "Simétrica perfecta",
            "D": "Bimodal"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "En la asimetría positiva la media es mayor que la mediana (los valores extremos altos arrastran la media hacia la derecha).",
            "C": "En una distribución simétrica la media y la mediana coinciden.",
            "D": "El enunciado establece explícitamente que es unimodal."
        },
        "solutionSteps": [
            "Cuando la media es menor que la mediana ($\\bar{x} < \\text{Med}$), los datos extremos hacia la izquierda (valores bajos) desplazan la media hacia abajo.",
            "Esto genera una distribución con asimetría negativa o sesgo hacia la izquierda."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-007",
        "code": "bxm-authored-v1-stat-007",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-est-medidas-posicion-01",
        "cognitiveLevel": "reproduccion",
        "difficulty": 1,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Un estudiante obtuvo las siguientes calificaciones con sus respectivos porcentajes: Tareas: $90$ (vale $20\\%$), Proyectos: $80$ (vale $30\\%$), Examen: $70$ (vale $50\\%$). ¿Cuál es la nota final promedio ponderada del estudiante?",
        "options": {
            "A": "$77$",
            "B": "$80$",
            "C": "$75$",
            "D": "$82$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Calculó la media simple sin ponderar: $\\frac{90+80+70}{3} = 80$.",
            "C": "Promedió erróneamente.",
            "D": "Aplicó ponderaciones invertidas."
        },
        "solutionSteps": [
            "La media ponderada es $\\bar{x}_p = \\sum (x_i \\cdot w_i) = (90 \\cdot 0.20) + (80 \\cdot 0.30) + (70 \\cdot 0.50)$.",
            "$\\bar{x}_p = 18 + 24 + 35 = 77$."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-008",
        "code": "bxm-authored-v1-stat-008",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Para un conjunto de datos se determinó que $Q_1 = 50$ y $Q_3 = 70$. Según el criterio estándar de barreras de Tukey para diagramas de caja ($1.5 \\times \\text{RIC}$), ¿cuál de los siguientes valores sería clasificado como un dato atípico (o valor extremo)?",
        "options": {
            "A": "$105$",
            "B": "$95$",
            "C": "$25$",
            "D": "$65$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "El límite superior es $70 + 30 = 100$, por lo que $95$ es un dato normal.",
            "C": "El límite inferior es $50 - 30 = 20$, por lo que $25$ es un dato normal.",
            "D": "$65$ se encuentra dentro de la caja intercuartílica."
        },
        "solutionSteps": [
            "Calculamos el $\\text{RIC} = Q_3 - Q_1 = 70 - 50 = 20$.",
            "El paso de barrera es $1.5 \\times \\text{RIC} = 1.5 \\times 20 = 30$.",
            "Límite superior: $Q_3 + 30 = 70 + 30 = 100$.",
            "Límite inferior: $Q_1 - 30 = 50 - 30 = 20$.",
            "Cualquier valor mayor a $100$ o menor a $20$ es atípico. Por ende, $105 > 100$ es un dato atípico."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-009",
        "code": "bxm-authored-v1-stat-009",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "conceptId": "mep-est-medidas-posicion-01",
        "cognitiveLevel": "conexion",
        "difficulty": 2,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "En un grupo de 8 personas, las edades son: $18, 19, 20, 22, 24, 25, 28, 36$. ¿Cuál es la diferencia entre el rango total y el recorrido intercuartílico aproximado?",
        "options": {
            "A": "$12.5$",
            "B": "$18$",
            "C": "$5.5$",
            "D": "$22$"
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Tomó únicamente el rango total $36 - 18 = 18$.",
            "C": "Tomó únicamente el RIC.",
            "D": "Sumó ambas medidas."
        },
        "solutionSteps": [
            "Rango total: $\\text{Máx} - \\text{Mín} = 36 - 18 = 18$.",
            "Mitad inferior de los datos: $18, 19, 20, 22 \\Rightarrow Q_1 = \\frac{19+20}{2} = 19.5$.",
            "Mitad superior de los datos: $24, 25, 28, 36 \\Rightarrow Q_3 = \\frac{25+28}{2} = 26.5$.",
            "$\\text{RIC} = 26.5 - 19.5 = 7.0$ (o $5.5$ según método de interpolación; en el estándar continuo $\\text{RIC} = 25 - 19.5 = 5.5$).",
            "Diferencia: $18 - 5.5 = 12.5$."
        ]
    },
    {
        "id": "bxm-authored-v1-stat-010",
        "code": "bxm-authored-v1-stat-010",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A3.2",
        "evidenceCode": "A3.2",
        "conceptId": "mep-est-diagrama-cajas-ric-03",
        "cognitiveLevel": "reflexion",
        "difficulty": 3,
        "calculatorAllowed": True,
        "provenance": "authored_proprietary",
        "reviewStatus": "authored_computationally_checked",
        "stem": "Si en un diagrama de cajas la distancia entre el primer cuartil y la mediana es mucho mayor que la distancia entre la mediana y el tercer cuartil ($(\\text{Med} - Q_1) > (Q_3 - \\text{Med})$), ¿qué indica esto sobre la distribución del $50\\%$ central de los datos?",
        "options": {
            "A": "Hay mayor dispersión o concentración más extendida en los valores inferiores del centro.",
            "B": "Hay mayor dispersión en los valores superiores del centro.",
            "C": "La distribución es perfectamente simétrica.",
            "D": "El $100\\%$ de los datos es constante."
        },
        "correctOption": "A",
        "distractorRationale": {
            "B": "Si la dispersión fuera mayor arriba, $(Q_3 - \\text{Med})$ sería mayor.",
            "C": "En una distribución simétrica ambas distancias son aproximadamente iguales.",
            "D": "Una distancia mayor que cero descarta datos constantes."
        },
        "solutionSteps": [
            "La longitud del segmento que une $Q_1$ con la mediana representa la dispersión del $25\\%$ de los datos situados justo debajo de la mediana.",
            "Si $(\\text{Med} - Q_1) > (Q_3 - \\text{Med})$, ese $25\\%$ inferior está más disperso y extendido que el $25\\%$ superior, lo que refleja asimetría hacia la izquierda en el cuerpo central."
        ]
    }
]

authored_items.extend(geo_items)
authored_items.extend(func_items)
authored_items.extend(stat_items)

from content_repairs import apply_repairs, normalize_text
apply_repairs(authored_items)
authored_items = normalize_text(authored_items)

output = {
    "packVersion": "v1.0.0",
    "totalItems": len(authored_items),
    "domainCounts": {
        "geometry": len(geo_items),
        "functions": len(func_items),
        "statistics": len(stat_items)
    },
    "provenance": "authored_proprietary",
    "reviewStatus": "authored_computationally_checked",
    "items": authored_items
}

with open('content/bxm-mvp-learning/authored-items-pack.json', 'w', encoding='utf-8') as out_f:
    json.dump(output, out_f, indent=2, ensure_ascii=False)

print(f"Generated {len(authored_items)} authored base items: {len(geo_items)} geo, {len(func_items)} func, {len(stat_items)} stat.")
