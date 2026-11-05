import json

lessons = [
    # 1. GEOMETRY: Circunferencia (A1.1, A1.2)
    {
        "id": "lesson-geometry-a1-1",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A1.2",
        "evidenceCode": "A1.2",
        "title": "Ecuación Canónica y Elementos de la Circunferencia",
        "subtitle": "Representación algebraica, centro $(h,k)$, radio $r$ y posición de puntos",
        "conceptIds": ["mep-geo-circunferencia-01", "mep-geo-centro-radio-02"],
        "prerequisites": [
            "Plano cartesiano y coordenadas rectangulares $(x, y)$.",
            "Fórmula de distancia entre dos puntos: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.",
            "Propiedades de potencias y productos notables básicos."
        ],
        "formulas": [
            {
                "name": "Ecuación canónica (centro $(h, k)$)",
                "latex": "(x - h)^2 + (y - k)^2 = r^2",
                "notes": "El radio $r$ siempre debe ser un número real positivo ($r > 0$)."
            },
            {
                "name": "Ecuación con centro en el origen $(0, 0)$",
                "latex": "x^2 + y^2 = r^2",
                "notes": "Caso particular cuando $h = 0$ y $k = 0$."
            },
            {
                "name": "Relación diámetro y radio",
                "latex": "d = 2r \\iff r = \\frac{d}{2}",
                "notes": "En los exámenes de BXM comúnmente proporcionan el diámetro para evaluar si el estudiante recuerda dividir entre dos."
            }
        ],
        "coreExplanation": (
            "Una **circunferencia** es el lugar geométrico de todos los puntos del plano cartesiano que equidistan de un punto fijo llamado **centro** $(h,k)$. "
            "A la distancia constante entre el centro y cualquier punto de la curva se le denomina **radio** ($r$).\n\n"
            "Al aplicar la fórmula de distancia euclidiana entre el centro $C(h,k)$ y un punto genérico $P(x,y)$, obtenemos "
            "$\\sqrt{(x-h)^2 + (y-k)^2} = r$. Elevando ambos miembros al cuadrado resulta la **forma canónica**: "
            "$$(x - h)^2 + (y - k)^2 = r^2$$\n"
            "**Cuidado crucial con los signos:** El signo negativo dentro de los paréntesis es parte intrínseca de la fórmula. "
            "Por ejemplo, si el centro es $(-3, 4)$, la ecuación queda $(x - (-3))^2 + (y - 4)^2 = (x + 3)^2 + (y - 4)^2 = r^2$."
        ),
        "commonMistakes": [
            {
                "mistake": "Inversión de signos en el centro",
                "description": "Pensar que en $(x + 5)^2 + (y - 2)^2 = 16$ el centro es $(5, -2)$, cuando en realidad es $(-5, 2)$.",
                "correction": "Recuerde siempre igualar cada binomio a cero para despejar la coordenada: $x + 5 = 0 \\Rightarrow x = -5$ y $y - 2 = 0 \\Rightarrow y = 2$."
            },
            {
                "mistake": "Confundir el radio $r$ con el término constante $r^2$",
                "description": "Asumir que si la ecuación termina en $= 36$, el radio mide 36 en lugar de $\\sqrt{36} = 6$.",
                "correction": "El término independiente en el miembro derecho representa $r^2$; para hallar el radio siempre se debe extraer la raíz cuadrada principal."
            },
            {
                "mistake": "Usar el diámetro directamente como radio",
                "description": "Si el problema dice 'diámetro mide 10', escribir $(x-h)^2 + (y-k)^2 = 100$ en vez de $r = 5 \\Rightarrow r^2 = 25$.",
                "correction": "Subraye la palabra 'diámetro' y anote inmediatamente $r = d / 2$."
            }
        ],
        "workedExample": {
            "statement": "Determine la ecuación de la circunferencia cuyo centro es $C(2, -5)$ y cuyo diámetro mide $8$ unidades. Verifique además si el punto $P(2, -1)$ es interior, exterior o perteneciente a dicha circunferencia.",
            "primaryMethod": {
                "name": "Método Canónico Analítico",
                "steps": [
                    "1. Determinar el radio: Como el diámetro mide $8$, el radio es $r = \\frac{8}{2} = 4$.",
                    "2. Calcular el término derecho $r^2$: $r^2 = 4^2 = 16$.",
                    "3. Plantear la ecuación con $h = 2$ y $k = -5$:\n   $$(x - 2)^2 + (y - (-5))^2 = 16 \\iff (x - 2)^2 + (y + 5)^2 = 16$$",
                    "4. Comprobar la posición del punto $P(2, -1)$ sustituyendo en el miembro izquierdo:\n   $$(2 - 2)^2 + (-1 + 5)^2 = 0^2 + 4^2 = 16$$",
                    "5. Conclusión: Como el valor evaluado ($16$) es exactamente igual a $r^2$ ($16$), el punto $P(2,-1)$ **pertenece** a la circunferencia."
                ]
            },
            "alternativeMethod": {
                "name": "Método de Distancia Euclidiana Directa",
                "steps": [
                    "1. Calcular directamente la distancia del centro $C(2, -5)$ al punto $P(2, -1)$:",
                    "   $$d(C, P) = \\sqrt{(2 - 2)^2 + (-1 - (-5))^2} = \\sqrt{0^2 + 4^2} = \\sqrt{16} = 4$$",
                    "2. Comparar la distancia $d(C,P)$ con el radio $r = 4$:",
                    "   Como $d(C, P) = r = 4$, el punto se encuentra exactamente sobre la circunferencia."
                ]
            }
        },
        "interactiveVisualType": "circle_inspector",
        "microQuiz": [
            {
                "id": "quiz-geo-01",
                "question": "¿Cuáles son las coordenadas del centro y el radio de la circunferencia $(x - 4)^2 + (y + 1)^2 = 9$?",
                "options": {
                    "A": "Centro $(4, -1)$ y radio $3$",
                    "B": "Centro $(-4, 1)$ y radio $3$",
                    "C": "Centro $(4, -1)$ y radio $9$",
                    "D": "Centro $(-4, 1)$ y radio $9$"
                },
                "correctOption": "A",
                "explanation": "El centro es $(h,k) = (4, -1)$ y el radio es $r = \\sqrt{9} = 3$."
            },
            {
                "id": "quiz-geo-02",
                "question": "Si una circunferencia tiene centro en $(0,0)$ y pasa por el punto $(0, -6)$, ¿cuál es su ecuación?",
                "options": {
                    "A": "$x^2 + y^2 = 36$",
                    "B": "$x^2 + y^2 = 6$",
                    "C": "$x^2 + (y + 6)^2 = 36$",
                    "D": "$x^2 + y^2 = 12$"
                },
                "correctOption": "A",
                "explanation": "La distancia del origen $(0,0)$ a $(0,-6)$ es $6$. Luego $r = 6$ y $r^2 = 36$, dando $x^2 + y^2 = 36$."
            }
        ]
    },

    # 2. GEOMETRY: Secciones planas de esfera y cilindro (A5.2, A5.3)
    {
        "id": "lesson-geometry-a5-2",
        "domain": "geometry",
        "evidenceKey": "bxm/matematica/02-2026/geometry/A5.3",
        "evidenceCode": "A5.3",
        "title": "Secciones Planas en Cuerpos Tridimensionales: Esfera y Cilindro",
        "subtitle": "Relación métrica pitagórica en la esfera ($R^2 = d^2 + r^2$) y secciones de cilindros",
        "conceptIds": ["mep-geo-cuerpos-3d-09"],
        "prerequisites": [
            "Teorema de Pitágoras en triángulos rectángulos: $a^2 + b^2 = c^2$.",
            "Fórmulas de área ($A = \\pi r^2$) y perímetro ($P = 2\\pi r$) del círculo.",
            "Concepto de plano secante, tangente y exterior."
        ],
        "formulas": [
            {
                "name": "Relación métrica fundamental en la esfera",
                "latex": "R^2 = d^2 + r^2 \\iff r = \\sqrt{R^2 - d^2}",
                "notes": "$R$ = radio de la esfera, $d$ = distancia del plano al centro, $r$ = radio de la sección circular cortada."
            },
            {
                "name": "Condición de intersección esférica",
                "latex": "0 \\le d < R \\text{ (secante)}, \\quad d = R \\text{ (tangente)}, \\quad d > R \\text{ (exterior)}",
                "notes": "Si $d = 0$, el plano pasa por el centro y genera el círculo máximo de radio $r = R$."
            }
        ],
        "coreExplanation": (
            "Cuando un plano interseca una **esfera** de radio $R$, la sección plana resultante es **siempre una circunferencia** (o círculo). "
            "Si trazamos un segmento perpendicular desde el centro de la esfera hasta el plano de corte, este segmento tiene longitud $d$ "
            "y cae exactamente en el centro de la sección circular pequeña.\n\n"
            "Uniendo el centro de la esfera con cualquier punto de la circunferencia de corte, se forma un triángulo rectángulo perfecto "
            "donde la hipotenusa es el radio esférico $R$, un cateto es la distancia $d$, y el otro cateto es el radio de la sección $r$. "
            "Por ende, se cumple rigurosamente: "
            "$$R^2 = d^2 + r^2$$\n"
            "En el caso del **cilindro circular recto**:\n"
            "- Plano paralelo a las bases: genera un círculo congruente con las bases.\n"
            "- Plano perpendicular a las bases (axial): genera un rectángulo de lados $2r$ y altura $h$.\n"
            "- Plano oblicuo que no corte las bases: genera una elipse."
        ),
        "commonMistakes": [
            {
                "mistake": "Restar linealmente el radio y la distancia",
                "description": "Calcular $r = R - d$ (por ejemplo, si $R=5$ y $d=3$, decir erróneamente que $r = 2$).",
                "correction": "La relación es pitagórica: $r = \\sqrt{R^2 - d^2} = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4$."
            },
            {
                "mistake": "Confundir el radio de la sección con el radio de la esfera",
                "description": "Utilizar $r$ en lugar de $R$ al calcular el volumen de la esfera o viceversa.",
                "correction": "Identifique con claridad las dos letras: mayúscula $R$ para la esfera global y minúscula $r$ para el disco cortado."
            }
        ],
        "workedExample": {
            "statement": "Una esfera cuyo diámetro mide $26\\text{ cm}$ es cortada por un plano situado a $5\\text{ cm}$ de su centro. Determine el área de la sección circular obtenida.",
            "primaryMethod": {
                "name": "Método Pitagórico",
                "steps": [
                    "1. Obtener el radio de la esfera: $R = \\frac{26}{2} = 13\\text{ cm}$.",
                    "2. Identificar la distancia del centro al plano: $d = 5\\text{ cm}$.",
                    "3. Aplicar la relación pitagórica para hallar $r^2$:\n   $$r^2 = R^2 - d^2 = 13^2 - 5^2 = 169 - 25 = 144$$",
                    "4. Calcular el radio de la sección: $r = \\sqrt{144} = 12\\text{ cm}$.",
                    "5. Calcular el área del círculo seccionado:\n   $$A = \\pi r^2 = \\pi (12)^2 = 144\\pi\\text{ cm}^2$$"
                ]
            }
        },
        "interactiveVisualType": "sphere_cross_section",
        "microQuiz": [
            {
                "id": "quiz-geo-03",
                "question": "Si una esfera de radio $R = 10$ es cortada por un plano a distancia $d = 8$ del centro, ¿cuál es el radio $r$ de la sección?",
                "options": {
                    "A": "$6$",
                    "B": "$2$",
                    "C": "$\\sqrt{164}$",
                    "D": "$8$"
                },
                "correctOption": "A",
                "explanation": "$r = \\sqrt{10^2 - 8^2} = \\sqrt{100 - 64} = \\sqrt{36} = 6$."
            }
        ]
    },

    # 3. FUNCTIONS: Recta, pendiente, intersecciones y ecuación (A2.3, A2.4)
    {
        "id": "lesson-functions-a2-3",
        "domain": "functions",
        "evidenceKey": "bxm/matematica/02-2026/functions/A2.3",
        "evidenceCode": "A2.3",
        "title": "Función Lineal: Pendiente, Intersecciones y Ecuación de la Recta",
        "subtitle": "Cálculo de $m = \\frac{\\Delta y}{\\Delta x}$, intersecciones $(-\\frac{b}{m}, 0)$ y $(0, b)$, y rectas paralelas / perpendiculares",
        "conceptIds": ["mep-alg-funcion-lineal-03"],
        "prerequisites": [
            "Despeje de ecuaciones lineales de primer grado.",
            "Concepto de razón de cambio y monotonía (creciente, decreciente, constante).",
            "Ubicación de puntos cartesianos."
        ],
        "formulas": [
            {
                "name": "Pendiente de la recta dados dos puntos $(x_1, y_1)$ y $(x_2, y_2)$",
                "latex": "m = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad x_1 \\ne x_2",
                "notes": "Si $m > 0$ es creciente; si $m < 0$ es decreciente; si $m = 0$ es horizontal constante."
            },
            {
                "name": "Ecuación explícita (pendiente-ordenada)",
                "latex": "y = mx + b",
                "notes": "El valor $b$ corresponde a la ordenada en el origen, punto de corte $(0, b)$."
            },
            {
                "name": "Intersección con el eje de las abscisas ($x$)",
                "latex": "\\left(-\\frac{b}{m}, 0\\right), \\quad m \\ne 0",
                "notes": "Se obtiene haciendo $y = 0$ y despejando la variable $x$."
            },
            {
                "name": "Criterio de paralelismo y perpendicularidad",
                "latex": "L_1 \\parallel L_2 \\iff m_1 = m_2; \\quad L_1 \\perp L_2 \\iff m_1 \\cdot m_2 = -1",
                "notes": "Rectas perpendiculares tienen pendientes opuestas y recíprocas."
            }
        ],
        "coreExplanation": (
            "La **función lineal** describe una relación de proporcionalidad y variación constante entre dos magnitudes. "
            "Geométricamente se representa como una línea recta ininterrumpida.\n\n"
            "La **pendiente** ($m$) mide la inclinación o razón de cambio vertical por cada unidad de desplazamiento horizontal. "
            "El valor $b$ es el corte con el eje $y$, que representa el estado inicial cuando $x = 0$.\n\n"
            "Para determinar la ecuación completa de una recta basta con conocer:\n"
            "1. Dos puntos cualesquiera, o bien\n"
            "2. Un punto y el valor de su pendiente (o la relación de paralelismo/perpendicularidad con otra recta dada)."
        ),
        "commonMistakes": [
            {
                "mistake": "Invertir numerador y denominador en la pendiente",
                "description": "Calcular $m = \\frac{x_2 - x_1}{y_2 - y_1}$ en lugar de $\\frac{y_2 - y_1}{x_2 - x_1}$.",
                "correction": "Recuerde la regla nemotécnica: 'Las Y van arriba (cielo) y las X abajo (suelo)'."
            },
            {
                "mistake": "Confundir intersección con eje X e intersección con eje Y",
                "description": "Decir que la recta $y = 2x - 6$ interseca al eje $x$ en $(-6, 0)$.",
                "correction": "El corte con el eje $y$ tiene $x=0$, es decir $(0, -6)$. El corte con el eje $x$ tiene $y=0$, resolviendo $2x - 6 = 0 \\Rightarrow x = 3$, o sea $(3, 0)$."
            }
        ],
        "workedExample": {
            "statement": "Una recta pasa por los puntos $A(1, 3)$ y $B(4, 9)$. Halle su pendiente, su ecuación en la forma $y = mx + b$, y determine sus puntos de intersección con ambos ejes coordenados.",
            "primaryMethod": {
                "name": "Procedimiento Algebraico Estándar",
                "steps": [
                    "1. Calcular la pendiente: $m = \\frac{9 - 3}{4 - 1} = \\frac{6}{3} = 2$.",
                    "2. Hallar el corte $b$: Sustituimos el punto $A(1,3)$ en $y = mx + b$:\n   $$3 = 2(1) + b \\Rightarrow 3 = 2 + b \\Rightarrow b = 1$$",
                    "3. Escribir la ecuación canónica: $y = 2x + 1$.",
                    "4. Intersección con el eje $y$: Como $b = 1$, el punto es $(0, 1)$.",
                    "5. Intersección con el eje $x$: Igualamos $y = 0$:\n   $$0 = 2x + 1 \\Rightarrow 2x = -1 \\Rightarrow x = -\\frac{1}{2}$$\n   El punto es $\\left(-\\frac{1}{2}, 0\\right)$."
                ]
            },
            "alternativeMethod": {
                "name": "Forma Punto-Pendiente Directa",
                "steps": [
                    "1. Usar $y - y_1 = m(x - x_1)$ con $m = 2$ y $A(1,3)$:\n   $$y - 3 = 2(x - 1) \\Rightarrow y - 3 = 2x - 2 \\Rightarrow y = 2x + 1$$"
                ]
            }
        },
        "interactiveVisualType": None,
        "microQuiz": [
            {
                "id": "quiz-func-01",
                "question": "¿Cuál es la pendiente de la recta perpendicular a $y = -\\frac{1}{4}x + 3$?",
                "options": {
                    "A": "$4$",
                    "B": "$-\\frac{1}{4}$",
                    "C": "$-4$",
                    "D": "$\\frac{1}{4}$"
                },
                "correctOption": "A",
                "explanation": "La pendiente de la recta perpendicular es el opuesto recíproco: $m_2 = -\\frac{1}{-1/4} = 4$."
            }
        ]
    },

    # 4. STATISTICS: Medidas de Posición y Cajas (A1.2, A3.2)
    {
        "id": "lesson-statistics-a1-2",
        "domain": "statistics",
        "evidenceKey": "bxm/matematica/02-2026/statistics/A1.2",
        "evidenceCode": "A1.2",
        "title": "Medidas de Posición y Diagramas de Cajas",
        "subtitle": "Media, mediana, moda, cuartiles ($Q_1, Q_2, Q_3$), recorrido intercuartílico (RIC) y asimetría",
        "conceptIds": ["mep-est-medidas-posicion-01", "mep-est-diagrama-cajas-ric-03"],
        "prerequisites": [
            "Ordenamiento ascendente de secuencias numéricas.",
            "Cálculo de porcentajes y proporciones sobre muestras.",
            "Concepto de dispersión básica (recorrido total = $\\text{Máx} - \\text{Mín}$)."
        ],
        "formulas": [
            {
                "name": "Media aritmética",
                "latex": "\\bar{x} = \\frac{\\sum x_i}{n}",
                "notes": "Sensible a valores extremos atípicos."
            },
            {
                "name": "Recorrido Intercuartílico (RIC)",
                "latex": "\\text{RIC} = Q_3 - Q_1",
                "notes": "Mide la dispersión del $50\\%$ central de los datos; no se ve afectado por valores atípicos extremos."
            },
            {
                "name": "Barreras de Tukey para datos atípicos",
                "latex": "[Q_1 - 1.5 \\cdot \\text{RIC}, \\; Q_3 + 1.5 \\cdot \\text{RIC}]",
                "notes": "Cualquier dato fuera de este intervalo se considera un valor atípico (outlier)."
            }
        ],
        "coreExplanation": (
            "Las **medidas de posición** permiten sintetizar y describir el comportamiento central y la división porcentual de una distribución de datos.\n\n"
            "- **Media ($\\\\bar{x}$)**: Centro de masa aritmético.\n"
            "- **Mediana (\\\\text{Med} o $Q_2$)**: Valor que divide a la muestra ordenada exactamente en dos partes iguales ($50\\%$ inferior y $50\\%$ superior).\n"
            "- **Cuartiles ($Q_1, Q_2, Q_3$)**: Dividen la muestra en 4 segmentos de $25\\%$ cada uno.\n\n"
            "El **Diagrama de Caja y Bigotes (Box Plot)** visualiza el resumen de los 5 números: $\\text{Mínimo}$, $Q_1$, $\\text{Mediana}$, $Q_3$, y $\\text{Máximo}$. "
            "La longitud de la caja es el $\\text{RIC} = Q_3 - Q_1$, dentro de la cual se ubica el $50\\%$ central de las observaciones."
        ),
        "commonMistakes": [
            {
                "mistake": "Calcular la mediana sin ordenar previamente los datos",
                "description": "Tomar el número que está en el medio de la lista desordenada.",
                "correction": "El primer paso ineludible en estadística descriptiva siempre es ordenar de menor a mayor."
            },
            {
                "mistake": "Creer que si la caja es más ancha hay más datos",
                "description": "Pensar que un intervalo más largo contiene más observaciones que uno corto.",
                "correction": "Cada cuarto (entre Mín y Q1, entre Q1 y Med, entre Med y Q3, entre Q3 y Máx) contiene exactamente el $25\\%$ de los datos. Un intervalo más largo significa mayor dispersión, no mayor cantidad de datos."
            }
        ],
        "workedExample": {
            "statement": "Se tiene la muestra ordenada de notas de 10 estudiantes: $45, 50, 60, 65, 70, 75, 80, 85, 90, 95$. Calcule la mediana, los cuartiles $Q_1$ y $Q_3$, el RIC y analice la simetría de la distribución.",
            "primaryMethod": {
                "name": "Método de Partición en Mitades",
                "steps": [
                    "1. Mediana ($Q_2$): Al ser $n = 10$, promediamos los valores de las posiciones 5 y 6:\n   $$\\text{Med} = \\frac{70 + 75}{2} = 72.5$$",
                    "2. Primer cuartil ($Q_1$): Mediana de la mitad inferior ($45, 50, 60, 65, 70$):\n   $$Q_1 = 60$$",
                    "3. Tercer cuartil ($Q_3$): Mediana de la mitad superior ($75, 80, 85, 90, 95$):\n   $$Q_3 = 85$$",
                    "4. Recorrido Intercuartílico: $\\text{RIC} = Q_3 - Q_1 = 85 - 60 = 25$.",
                    "5. Simetría: $\\text{Med} - Q_1 = 72.5 - 60 = 12.5$ y $Q_3 - \\text{Med} = 85 - 72.5 = 12.5$.\n   Como ambas distancias son exactamente iguales, la distribución central es perfectamente **simétrica**."
                ]
            }
        },
        "interactiveVisualType": None,
        "microQuiz": [
            {
                "id": "quiz-stat-01",
                "question": "En un diagrama de cajas, ¿qué porcentaje de los datos se ubica estrictamente entre el valor Mínimo y el tercer cuartil $Q_3$?",
                "options": {
                    "A": "El $75\\%$",
                    "B": "El $25\\%$",
                    "C": "El $50\\%$",
                    "D": "El $100\\%$"
                },
                "correctOption": "A",
                "explanation": "Por definición de cuartiles, desde el mínimo hasta $Q_3$ se acumula el $75\\%$ de la distribución."
            }
        ]
    }
]

from content_repairs import repair_lessons
repair_lessons(lessons)

output = {
    "version": "v1.0.0",
    "totalLessons": len(lessons),
    "lessons": lessons
}

with open('content/bxm-mvp-learning/lessons-pack.json', 'w', encoding='utf-8') as out_f:
    json.dump(output, out_f, indent=2, ensure_ascii=False)

print(f"Generated {len(lessons)} rich lessons with worked examples, common mistakes, and micro-quizzes.")
