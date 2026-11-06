# QBE verification and enablement review

**GREEN-LIT WITH BLOCKED EXCEPTIONS**

Reviewed all 27 supplied sets: **536 genuine questions; 516 enabled; 20 kept disabled**. Clean: **469**. Non-blocking issue: **47**. Blocker: **20**.

## Coverage and data integrity

- All 27 supplied cleaned sets and their raw DOCX text/media reviewed. Each published answer and explanation independently established; options checked for uniqueness.
- All source images inspected; required production visuals reconstructed using existing visual components and checked against their mathematical requirements. Actual component rendering checked automatically for every enabled question at 1100px and 390px, with representative screenshots inspected manually.
- The supplied 2023-c1 functions source includes only q23–37; the 2023-c2 geometry source skips q32. These are historical practice sets, not claims of complete official examinations.
- Original source provenance remains source_unverified. Evaluation mappings remain candidly unmapped/candidate where appropriate; these metadata warnings do not prevent safe practice use.
- The 564 initial records included extraction fragments and repeated IDs. All initial occurrences are accounted for in source_reconciliation.json; the recovered implicit question is bxm-raw-2022-c1-geometry-1-q13. Stable canonical source IDs are retained. Numeric runtime IDs are recorded in publication_report.json and checked against all existing programs.

The original 564 extracted occurrences reconcile to 535 retained questions and 29 fragments merged into their parent questions. One genuine implicit question was recovered, producing 536 questions. Raw DOCX assets remain unchanged. The initial pre-repair assessment is preserved in INITIAL_CONTENT_QA_REVIEW.md/.json.

## Set dispositions

| Set | Reviewed | Enabled | Blocked |
| --- | ---: | ---: | ---: |
| bxm-raw-2019-c1-functions-1 | 20 | 20 | 0 |
| bxm-raw-2019-c1-statistics-1 | 18 | 18 | 0 |
| bxm-raw-2019-c2-functions-2 | 20 | 20 | 0 |
| bxm-raw-2019-c2-geometry-2 | 22 | 19 | 3 |
| bxm-raw-2019-c2-statistics-2 | 18 | 18 | 0 |
| bxm-raw-2021-c1-functions-1 | 20 | 20 | 0 |
| bxm-raw-2021-c1-geometry-1 | 22 | 20 | 2 |
| bxm-raw-2021-c1-statistics-1 | 18 | 16 | 2 |
| bxm-raw-2021-c2-functions-2 | 20 | 20 | 0 |
| bxm-raw-2021-c2-geometry-2 | 22 | 22 | 0 |
| bxm-raw-2021-c2-statistics-2 | 18 | 18 | 0 |
| bxm-raw-2022-c1-functions-1 | 20 | 20 | 0 |
| bxm-raw-2022-c1-geometry-1 | 22 | 22 | 0 |
| bxm-raw-2023-c1-functions-1 | 15 | 15 | 0 |
| bxm-raw-2023-c1-geometry-1 | 22 | 21 | 1 |
| bxm-raw-2023-c2-functions-2 | 20 | 19 | 1 |
| bxm-raw-2023-c2-geometry-2 | 21 | 20 | 1 |
| bxm-raw-2023-c2-statistics-2 | 18 | 16 | 2 |
| bxm-raw-2024-c1-functions-1 | 20 | 19 | 1 |
| bxm-raw-2024-c1-geometry-1 | 22 | 22 | 0 |
| bxm-raw-2024-c1-statistics-1 | 18 | 18 | 0 |
| bxm-raw-2024-c2-functions-2 | 20 | 19 | 1 |
| bxm-raw-2024-c2-geometry-2 | 22 | 22 | 0 |
| bxm-raw-2024-c2-statistics-2 | 18 | 17 | 1 |
| bxm-raw-2025-c1-functions-1 | 20 | 18 | 2 |
| bxm-raw-2025-c1-geometry-1 | 22 | 21 | 1 |
| bxm-raw-2025-c1-statistics-1 | 18 | 16 | 2 |

## Blocked questions

Each entry is **BLOCKER → KEEP DISABLED**. The exact issue explains its material effect and required correction.

### bxm-raw-2019-c2-geometry-2-q05

La fuente y el registro solo dicen De ellas son verdaderas, pero no suministran las proposiciones I y II. Se deben recuperar las afirmaciones antes de designar una respuesta.

Required correction: La fuente y el registro solo dicen De ellas son verdaderas, pero no suministran las proposiciones I y II. Se deben recuperar las afirmaciones antes de designar una respuesta.

### bxm-raw-2019-c2-geometry-2-q09

La fuente solo declara un cuadrado y un hexágono, sin regularidad ni igualdad entre CD y el lado compartido BG. CD=4√3 no determina el lado del cuadrado. Debe aportarse la regularidad o la medida BG.

Required correction: La fuente solo declara un cuadrado y un hexágono, sin regularidad ni igualdad entre CD y el lado compartido BG. CD=4√3 no determina el lado del cuadrado. Debe aportarse la regularidad o la medida BG.

### bxm-raw-2019-c2-geometry-2-q10

CD=4√3 no determina el área de un hexágono no declarado regular. Se requiere regularidad o dimensiones suficientes; no se debe asumir a partir de la apariencia.

Required correction: CD=4√3 no determina el área de un hexágono no declarado regular. Se requiere regularidad o dimensiones suficientes; no se debe asumir a partir de la apariencia.

### bxm-raw-2021-c1-geometry-1-q09

Solo se da AB=6 y se menciona un pentágono sin declarar que sea regular ni que CE=AB. El lado del triángulo equilátero CDE no queda determinado. Debe recuperarse la condición de regularidad o la longitud CE.

Required correction: Solo se da AB=6 y se menciona un pentágono sin declarar que sea regular ni que CE=AB. El lado del triángulo equilátero CDE no queda determinado. Debe recuperarse la condición de regularidad o la longitud CE.

### bxm-raw-2021-c1-geometry-1-q10

Se conoce únicamente AB=6, sin declarar regular el pentágono ni indicar sus otras longitudes. No puede deducirse su perímetro. Se debe aportar la condición o las longitudes faltantes.

Required correction: Se conoce únicamente AB=6, sin declarar regular el pentágono ni indicar sus otras longitudes. No puede deducirse su perímetro. Se debe aportar la condición o las longitudes faltantes.

### bxm-raw-2021-c1-statistics-1-q45

El conjunto de Ana no respalda una afirmación de asimetría positiva; la fuente usa además el término incorrecto simetría positiva. Es necesario corregir la proposición de forma explícita antes de enseñar el concepto.

Required correction: El conjunto de Ana no respalda una afirmación de asimetría positiva; la fuente usa además el término incorrecto simetría positiva. Es necesario corregir la proposición de forma explícita antes de enseñar el concepto.

### bxm-raw-2021-c1-statistics-1-q46

La proposición II usa variabilidad significativa sin definir criterio ni prueba. No puede evaluarse como una afirmación matemática determinada. Se debe indicar la medida o el umbral.

Required correction: La proposición II usa variabilidad significativa sin definir criterio ni prueba. No puede evaluarse como una afirmación matemática determinada. Se debe indicar la medida o el umbral.

### bxm-raw-2023-c1-geometry-1-q11

Se menciona un hexágono sin declarar regularidad ni dar sus dimensiones suficientes. Los triángulos equiláteros y AB por sí solos no determinan el área del hexágono. Debe recuperarse la condición de hexágono regular o los datos faltantes.

Required correction: Se menciona un hexágono sin declarar regularidad ni dar sus dimensiones suficientes. Los triángulos equiláteros y AB por sí solos no determinan el área del hexágono. Debe recuperarse la condición de hexágono regular o los datos faltantes.

### bxm-raw-2023-c2-functions-2-q47

f(x)=(6+12x)/12=x+1/2 tiene inversa x-1/2. Ninguna alternativa ofrece a=1,b=-1/2. Debe corregirse una alternativa o recuperarse el enunciado correcto.

Required correction: f(x)=(6+12x)/12=x+1/2 tiene inversa x-1/2. Ninguna alternativa ofrece a=1,b=-1/2. Debe corregirse una alternativa o recuperarse el enunciado correcto.

### bxm-raw-2023-c2-geometry-2-q25

Las alternativas C y D son idénticas y ambas coinciden con la traslación correcta: (x-1)²+(y-4)²=4. Debe sustituirse un distractor duplicado con una alternativa inequívocamente incorrecta.

Required correction: Las alternativas C y D son idénticas y ambas coinciden con la traslación correcta: (x-1)²+(y-4)²=4. Debe sustituirse un distractor duplicado con una alternativa inequívocamente incorrecta.

### bxm-raw-2023-c2-statistics-2-q04

La fuente declara iguales las desviaciones estándar, pero las amplitudes de A y B difieren. La pregunta usa mayor variabilidad sin precisar la medida, lo que cambia la verdad de II; debe especificarse la medida.

Required correction: La fuente declara iguales las desviaciones estándar, pero las amplitudes de A y B difieren. La pregunta usa mayor variabilidad sin precisar la medida, lo que cambia la verdad de II; debe especificarse la medida.

### bxm-raw-2023-c2-statistics-2-q13

La proposición I escribe P(A∩C)=C, comparando una probabilidad con un evento sin expresión numérica válida. La corrección no está determinada por la fuente; se debe recuperar la proposición correcta.

Required correction: La proposición I escribe P(A∩C)=C, comparando una probabilidad con un evento sin expresión numérica válida. La corrección no está determinada por la fuente; se debe recuperar la proposición correcta.

### bxm-raw-2024-c1-functions-1-q18

Solo se informa la población inicial de 100. Tanto 100·2^t como 100·(0.5)^t son modelos exponenciales positivos con ese valor inicial. Falta una condición de crecimiento o datos posteriores para distinguir A y C.

Required correction: Solo se informa la población inicial de 100. Tanto 100·2^t como 100·(0.5)^t son modelos exponenciales positivos con ese valor inicial. Falta una condición de crecimiento o datos posteriores para distinguir A y C.

### bxm-raw-2024-c2-functions-2-q12

El texto declara g⁻¹(x)=logₐ(x) y g(8)=3. Entonces a^8=3 y ninguna de las tres opciones es un punto de la inversa. Si se pretendía g(x)=logₐ(x), la respuesta cambiaría; la fuente debe aclararse.

Required correction: El texto declara g⁻¹(x)=logₐ(x) y g(8)=3. Entonces a^8=3 y ninguna de las tres opciones es un punto de la inversa. Si se pretendía g(x)=logₐ(x), la respuesta cambiaría; la fuente debe aclararse.

### bxm-raw-2024-c2-statistics-2-q24

Se anuncian 15 partidos del equipo A, pero solo se suministran 14 puntajes. El dato faltante puede cambiar la variabilidad y no debe inventarse; recuperar el puntaje antes de comparar.

Required correction: Se anuncian 15 partidos del equipo A, pero solo se suministran 14 puntajes. El dato faltante puede cambiar la variabilidad y no debe inventarse; recuperar el puntaje antes de comparar.

### bxm-raw-2025-c1-functions-1-q25

No se suministran los conjuntos A y B ni una definición suficiente de sus dominios. Las expresiones f:A→ℝ y g:B→ℝ no permiten elegir el subconjunto indicado. Se deben recuperar los intervalos originales.

Required correction: No se suministran los conjuntos A y B ni una definición suficiente de sus dominios. Las expresiones f:A→ℝ y g:B→ℝ no permiten elegir el subconjunto indicado. Se deben recuperar los intervalos originales.

### bxm-raw-2025-c1-functions-1-q26

Tanto x<0 como x≥0 hacen inyectiva a f(x)=x² en el dominio restringido. Las alternativas A y B garantizan una inversa; se debe reformular una de ellas o permitir selección múltiple.

Required correction: Tanto x<0 como x≥0 hacen inyectiva a f(x)=x² en el dominio restringido. Las alternativas A y B garantizan una inversa; se debe reformular una de ellas o permitir selección múltiple.

### bxm-raw-2025-c1-geometry-1-q06

Las opciones A y B son verdaderas: r y d son paralelas y la tangente d es perpendicular al radio OD. La pregunta exige una única respuesta. Se debe reformular una alternativa con evidencia matemática.

Required correction: Las opciones A y B son verdaderas: r y d son paralelas y la tangente d es perpendicular al radio OD. La pregunta exige una única respuesta. Se debe reformular una alternativa con evidencia matemática.

### bxm-raw-2025-c1-statistics-1-q47

La pregunta compara cantidades de aprobados sin informar los tamaños de los grupos. La proporción de aprobados puede compararse, pero las cantidades absolutas no. Es necesario precisar proporción o suministrar tamaños.

Required correction: La pregunta compara cantidades de aprobados sin informar los tamaños de los grupos. La proporción de aprobados puede compararse, pero las cantidades absolutas no. Es necesario precisar proporción o suministrar tamaños.

### bxm-raw-2025-c1-statistics-1-q51

No se especifica la medida de variabilidad: los rangos son iguales (55-24=31), pero los recorridos intercuartílicos difieren (A:17.5; B:8.5). Las alternativas A y B resultan defendibles según la medida. Se debe precisar la medida antes de designar la respuesta.

Required correction: No se especifica la medida de variabilidad: los rangos son iguales (55-24=31), pero los recorridos intercuartílicos difieren (A:17.5; B:8.5). Las alternativas A y B resultan defendibles según la medida. Se debe precisar la medida antes de designar la respuesta.

## Non-blocking findings

- 47 enabled questions record explicit source/content/notation clarifications or corrections; details are retained per question and in transformation history. Corrected content is not represented as an unchanged source transcription.
- Minor wording, spacing, typography and attributed-source metadata warnings do not block enablement.
- Three-option questions retain their original A–C options; the existing renderer and validators now accept both three and four options.

## Validation

- 69 test files, 355 tests passed (before final independently verified q58 addition); all 16 affected content/runtime/visual tests passed after the addition. The expanded all-visual test unmounts each rendered item and uses a 30-second limit; its first rerun exceeded the old 5-second limit.
- npm run build passed
- 821 items, 14 blueprints, zero errors/warnings; 516 released QBE items across 27 sets
- 536 evaluated, 516 eligible with provenance/mapping warnings, 20 ineligible questions (21 individual blocker findings).
- 54 set-width checks, 1032 question renders; zero math errors, raw LaTeX leaks, nonfinite SVG, article overflow or clipped SVG labels.
- 27 sets visible; three-option question, correct scoring, explanation, reload persistence and results submission checked; zero page errors.
- Recovery rerun preserves all 27 reviewed cleaned files byte for byte; all 27 raw DOCX hashes unchanged.
- git diff --check passed.

Evidence logs and rendering checks are available locally in artifacts/qbe/. The JSON companion contains the same disposition for every reviewed question.

## Question-level records

### bxm-raw-2019-c1-functions-1-q01

**CLEAN → ENABLE**

Accuracy: El codominio es {0}, así que x²-1=0 y x≠0: D={-1,1}. I y II son verdaderas; III incluye indebidamente cero.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q02

**CLEAN → ENABLE**

Accuracy: La rama inferior cubre [-3,0) y la superior (0,3]. El cero no se alcanza porque el eje X es asíntota.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q03

**CLEAN → ENABLE**

Accuracy: La rama izquierda está definida para x≤-1 y la derecha para x≥1; el dominio es (-∞,-1]∪[1,∞).
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q04

**CLEAN → ENABLE**

Accuracy: T asigna 1→0 y 4→3 dentro de B y es función. J(0)=1 no pertenece a E={0,3}; J no define una función D→E. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q05

**CLEAN → ENABLE**

Accuracy: En [-2,0] el tramo es estrictamente creciente y tiene inversa. Los demás intervalos cruzan el máximo o salen del dominio.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q06

**CLEAN → ENABLE**

Accuracy: y=x/2+4 implica x=2y-8. La inversa es 2x-8: a=2,b=-8.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q07

**CLEAN → ENABLE**

Accuracy: g(1)=1-6=-5 y, según la tabla, f(-5)=3.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q08

**CLEAN → ENABLE**

Accuracy: g(f(x))=1-2(x²-1)=3-2x², no 3-x². g toma valores 3,1,-5, que no están todos en el dominio {0,1,2} de f. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q09

**CLEAN → ENABLE**

Accuracy: Al poner x=0 se obtiene y=2. Si m<0, la pendiente -m es positiva y la recta es creciente. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q10

**CLEAN → ENABLE**

Accuracy: El vértice (2,6) y una raíz -1 implican apertura hacia abajo y otra raíz 2+(2-(-1))=5. El ámbito es (-∞,6]. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q11

**CLEAN → ENABLE**

Accuracy: La inversa de y=2ˣ se obtiene intercambiando variables: y=log₂(x).
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q12

**CLEAN → ENABLE**

Accuracy: m²=16 y la base exponencial es positiva; por tanto m=4.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q13

**CLEAN → ENABLE**

Accuracy: 5ˣ es creciente y su inversa es log₅(x), no el logaritmo decimal sin base indicada. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q14

**CLEAN → ENABLE**

Accuracy: Si d es la diagonal menor, d(d+2)/2=40. d²+2d-80=(d+10)(d-8)=0 y la solución positiva es 8.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q15

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Cuadruplicar exige 2^(0.2x)=4=2²; 0.2x=2 y x=10 años.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q16

**CLEAN → ENABLE**

Accuracy: Con m entrenamientos de montaña, 6m+4(26-m)=132 da m=14. La distancia en montaña es 6·14=84 km.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q17

**CLEAN → ENABLE**

Accuracy: log₂(a)=3 implica a=8. logₐ(x)=2 implica x=a²=64.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q18

**CLEAN → ENABLE**

Accuracy: Los datos satisfacen x=(1/3)^y; por tanto y=log_(1/3)(x), un modelo logarítmico.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q19

**CLEAN → ENABLE**

Accuracy: La población se triplica cada día: en el quinto día es 3⁵=243.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-functions-1-q20

**CLEAN → ENABLE**

Accuracy: La tabla A corresponde a x², no a una recta. La tabla B corresponde a √x. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q01

**CLEAN → ENABLE**

Accuracy: El promedio ponderado es 0.25·85+0.35·70+0.40·80=77.75.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q02

**CLEAN → ENABLE**

Accuracy: Seis de las doce notas superan 94, exactamente 50%. La moda es 100, pero solo tres de doce estudiantes obtuvieron esa nota; no constituyen una mayoría.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q03

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Las marcas de clase son 5,9,13 y las frecuencias 2,3,5. La media estimada es (5·2+9·3+13·5)/10=10.2 horas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q04

**CLEAN → ENABLE**

Accuracy: El recorrido intercuartílico es Q3-Q1=23-12=11.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q05

**CLEAN → ENABLE**

Accuracy: La diferencia máxima es el recorrido: 32-4=28.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q06

**CLEAN → ENABLE**

Accuracy: Las desviaciones estándar son 12,7,10,10. La mayor es 12, correspondiente a álgebra.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q07

**CLEAN → ENABLE**

Accuracy: Los recorridos son 100-30=70 y 90-20=70.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q08

**CLEAN → ENABLE**

Accuracy: En 11-2 al menos el 50% queda por debajo de 70, mientras en 11-1 al menos el 50% alcanza 80. El máximo de 11-1 es 100 y el de 11-2 es 90; ambas afirmaciones son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q09

**CLEAN → ENABLE**

Accuracy: El mínimo de 11-2 es 20, menor que 30 de 11-1. En ambas Q1=40, de modo que al menos el 75% alcanza 40. Ambas son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q10

**CLEAN → ENABLE**

Accuracy: Para David, z es 7/12≈0.583 en teatro, 0 en cocina, 0.5 en música y -0.8 en pintura. El mayor es teatro.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q11

**CLEAN → ENABLE**

Accuracy: Para Natalia los valores z son 25/12≈2.083,15/7≈2.143,1 y 0.2. La posición relativa más baja es pintura.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q12

**CLEAN → ENABLE**

Accuracy: La fórmula de la unión es válida para cualesquiera eventos. A,B,C,D son regiones disjuntas que particionan la población; el complemento de A es B∪C∪D. Ambas igualdades son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q13

**CLEAN → ENABLE**

Accuracy: B y C son regiones disjuntas, así que P(B∩C)=0. C y D también son disjuntos, por lo que la probabilidad de su unión es la suma. Ambas son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q14

**CLEAN → ENABLE**

Accuracy: P(A∪B)=0.20+0.15=0.35, mientras P(C)=0.25. Además P(A∪B∪C)=0.60, no 1. Ninguna es verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q15

**CLEAN → ENABLE**

Accuracy: Para 7 u 8, las probabilidades son 0,2/8,2/12; C no es el mejor. Para 4≤X<9 son 3/6,5/8,5/12; B es el mejor. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q16

**CLEAN → ENABLE**

Accuracy: Para X≤7, A tiene probabilidad 1, mayor que 7/8 y 7/12. La probabilidad de par es 1/2 en los tres dados. Ambas son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q17

**CLEAN → ENABLE**

Accuracy: Solo una bebida suma 12+5+7=24 personas de un total de 31; la probabilidad es 24/31.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c1-statistics-1-q18

**CLEAN → ENABLE**

Accuracy: Dos bebidas suman las regiones de intersección 4+3=7, sin triple intersección; P=7/31.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q01

**CLEAN → ENABLE**

Accuracy: El primer segmento cubre [0,1] y el segundo [2,3], incluidos sus extremos. Ese es el ámbito de f.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q02

**CLEAN → ENABLE**

Accuracy: Ambas ramas de g toman valores entre 2 y 3, con extremos incluidos. Ámbito=[2,3].
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q03

**CLEAN → ENABLE**

Accuracy: El valor -2 está excluido por el denominador. La única preimagen de cero es 2, por lo que M={2}. Solo I.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q04

**CLEAN → ENABLE**

Accuracy: El intervalo [-5,-4] está enteramente en un tramo estrictamente decreciente. Los demás intervalos cruzan el mínimo o incluyen un tramo constante.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q05

**CLEAN → ENABLE**

Accuracy: g(-2)=-4 y la gráfica da f(-4)=0, no -4. El ámbito de r es [1,7], no contenido en el dominio [-3,3] de g. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q06

**CLEAN → ENABLE**

Accuracy: R(-1)=2,R(0)=1 y Q(0)=1,Q(2)=5 pertenecen a sus respectivos codominios. Ambas relaciones son funciones.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q07

**CLEAN → ENABLE**

Accuracy: y=x/2-3 implica x=2y+6. La inversa tiene a=2,b=6.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q08

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ámbito de la inversa es el dominio original [8,∞), no [3,∞). El dominio de la inversa es [3,∞), no [8,∞). Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q09

**CLEAN → ENABLE**

Accuracy: 2=-4(1)+b implica b=6, así que corta Y en (0,6).
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q10

**CLEAN → ENABLE**

Accuracy: La pendiente es 1. Al poner y=0, x=-3 y no 3. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q11

**CLEAN → ENABLE**

Accuracy: Un mínimo de ordenada 3 implica ámbito [3,∞).
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q12

**CLEAN → ENABLE**

Accuracy: b^(-2)=16 implica b²=1/16; como b>0, b=1/4.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q13

**CLEAN → ENABLE**

Accuracy: Por definición de logaritmo, logₐ(a²)=2.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q14

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: 10^(x+h)=1000^h=10^(3h); entonces x+h=3h y x=2h.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q15

**CLEAN → ENABLE**

Accuracy: El área original es 200π-4π=196π; el radio es √196=14.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q16

**CLEAN → ENABLE**

Accuracy: Pan+leche=1100 y 3pan+2leche=2700. Restando dos veces la primera, pan=500 y leche=600.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q17

**CLEAN → ENABLE**

Accuracy: Los datos siguen n(t)=log₃(t). La preimagen de 3 es 3³=27.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q18

**CLEAN → ENABLE**

Accuracy: Costo variable 4000x más costo fijo semanal 100000: c(x)=4000x+100000.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q19

**CLEAN → ENABLE**

Accuracy: La población se multiplica por cuatro cada día: p(4)=4⁴=256.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-functions-2-q20

**CLEAN → ENABLE**

Accuracy: La tabla corresponde a r(x)=√x: la preimagen de 4 es 16 y el modelo no es cuadrático. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q01

**CLEAN → ENABLE**

Accuracy: Centro (0,-3) y radio 3 dan x²+(y+3)²=9.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q02

**CLEAN → ENABLE**

Accuracy: La circunferencia amarilla tiene centro (0,-3) y radio 3. La verde comparte centro pero tiene radio 4.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q03

**CLEAN → ENABLE**

Accuracy: En I, 0²+3²=9>8, por lo que el punto no es interior. En II, (1+1)²+(1+1)²=8>4 y el punto es exterior. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q04

**CLEAN → ENABLE**

Accuracy: El centro tiene ordenada -2 y el radio es 2; la horizontal y=-4 está exactamente a dos unidades del centro y es tangente.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q05

**BLOCKER → KEEP DISABLED**

Accuracy: La fuente y el registro solo dicen De ellas son verdaderas, pero no suministran las proposiciones I y II. Se deben recuperar las afirmaciones antes de designar una respuesta.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La fuente y el registro solo dicen De ellas son verdaderas, pero no suministran las proposiciones I y II. Se deben recuperar las afirmaciones antes de designar una respuesta.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2019-c2-geometry-2-q06

**CLEAN → ENABLE**

Accuracy: m es tangente en P, así que OP es perpendicular a m. La recta s pasa por el centro y no es perpendicular al radio OP. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q07

**CLEAN → ENABLE**

Accuracy: El centro original es (0,1); al subir dos unidades queda en (0,3).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q08

**CLEAN → ENABLE**

Accuracy: Los centros son (0,0) y (0,-1). Se traslada una unidad hacia abajo.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q09

**BLOCKER → KEEP DISABLED**

Accuracy: La fuente solo declara un cuadrado y un hexágono, sin regularidad ni igualdad entre CD y el lado compartido BG. CD=4√3 no determina el lado del cuadrado. Debe aportarse la regularidad o la medida BG.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La fuente solo declara un cuadrado y un hexágono, sin regularidad ni igualdad entre CD y el lado compartido BG. CD=4√3 no determina el lado del cuadrado. Debe aportarse la regularidad o la medida BG.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2019-c2-geometry-2-q10

**BLOCKER → KEEP DISABLED**

Accuracy: CD=4√3 no determina el área de un hexágono no declarado regular. Se requiere regularidad o dimensiones suficientes; no se debe asumir a partir de la apariencia.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: CD=4√3 no determina el área de un hexágono no declarado regular. Se requiere regularidad o dimensiones suficientes; no se debe asumir a partir de la apariencia.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2019-c2-geometry-2-q11

**CLEAN → ENABLE**

Accuracy: Las longitudes AB,BC,CD,DE,EA son 1,4,5,3,5. Su suma es 18.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q12

**CLEAN → ENABLE**

Accuracy: Aplicando la fórmula de área por coordenadas a (-4,2),(-4,1),(0,1),(3,5),(0,5), se obtiene 16.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q13

**CLEAN → ENABLE**

Accuracy: La figura R es simétrica respecto de la vertical x=-3, que pasa por su centro.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q14

**CLEAN → ENABLE**

Accuracy: La figura P solo tiene el eje vertical x=4; la parte superior dentada no se refleja en la base inferior.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q15

**CLEAN → ENABLE**

Accuracy: Reflejar respecto de x=3 aplica x′=6-x, y′=y. (1,-1) se transforma en (5,-1).
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q16

**CLEAN → ENABLE**

Accuracy: Los vértices de C se obtienen multiplicando los de A por -1/2 respecto del origen. Cambia el tamaño, por lo que es una homotecia.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q17

**CLEAN → ENABLE**

Accuracy: Los vértices de B se desplazan tres unidades hacia abajo, conservando las abscisas y la orientación, para formar C.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q18

**CLEAN → ENABLE**

Accuracy: Reflexión en y=1: y′=2-y. (-2,4) se transforma en (-2,-2).
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q19

**CLEAN → ENABLE**

Accuracy: Un plano perpendicular a la base del cono y sin pasar por el vértice es paralelo al eje y genera una sección hiperbólica.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q20

**CLEAN → ENABLE**

Accuracy: El radio basal es 4. A mitad de altura, la semejanza reduce el radio a 2.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q21

**CLEAN → ENABLE**

Accuracy: El corte paralelo a la base conserva el radio 10; la longitud de la circunferencia es 2π·10=20π.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-geometry-2-q22

**CLEAN → ENABLE**

Accuracy: La esfera tiene R=10 y la distancia al plano es 8. El radio de sección es √(100-64)=6; su longitud es 12π.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q01

**CLEAN → ENABLE**

Accuracy: La nota anual es 0.20·100+0.30·90+0.50·80=87.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q02

**CLEAN → ENABLE**

Accuracy: Las modas son 92 y 96. La mediana es 96 y la media es (96+92+92+93+98+92+100+93+97+96+96)/11=95. Por ello son verdaderas I y III: D.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q03

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Con marcas de clase 5,7,9 y frecuencias 2,3,5, la media estimada es (10+21+45)/10=7.6 horas.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q04

**CLEAN → ENABLE**

Accuracy: En Mercadeo Q3-Q1=41-30=11.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q05

**CLEAN → ENABLE**

Accuracy: En Informática Q3-Q1=40-26=14.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q06

**CLEAN → ENABLE**

Accuracy: Los recorridos intercuartílicos de Contabilidad y Secretariado son ambos 12. El rango de Secretariado es 52-24=28 y el de Contabilidad 42-19=23; también se comparan así sus recorridos. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q07

**CLEAN → ENABLE**

Accuracy: El mínimo del primer semestre es 50<60. Ambos recorridos intercuartílicos son 20, por lo que II es falsa. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q08

**CLEAN → ENABLE**

Accuracy: Ni un cuartil ni una mediana garantizan una observación exactamente igual al valor resumido. En el primer semestre [70,80] contiene al menos un cuartil y en el segundo también; solo II está garantizada.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q09

**CLEAN → ENABLE**

Accuracy: Ambos recorridos intercuartílicos son 20. El Q3=80 del primer semestre no garantiza una nota exactamente 80. Ambas proposiciones son falsas.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q10

**CLEAN → ENABLE**

Accuracy: Juan tiene z=(70-58)/3=4 y Rita z=(65-48)/5=3.4. La variabilidad relativa femenina 5/48 es mayor que 3/58. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q11

**CLEAN → ENABLE**

Accuracy: José tiene z=2; Ana tiene z=2.4 y María z=3.2. José no supera a Ana ni iguala a María. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q12

**CLEAN → ENABLE**

Accuracy: A∩B contiene 6, así que no puede omitirse la intersección al sumar probabilidades. El complemento de C es {1,2,3,4,5}, no {1,3,5}. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q13

**CLEAN → ENABLE**

Accuracy: B∩C={6,9}, por lo que su probabilidad no es cero. La fórmula general de la unión siempre es correcta. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q14

**CLEAN → ENABLE**

Accuracy: A∪B∪C no contiene 1 ni 5, de modo que no tiene probabilidad 1. B={3,6,9} contiene tres elementos. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q15

**CLEAN → ENABLE**

Accuracy: Las probabilidades de blanca o azul son 5/10,5/15,5/8,5/11. La mayor corresponde a la bolsa 3.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q16

**CLEAN → ENABLE**

Accuracy: Las probabilidades de blanca o roja son 9/10,14/15,7/8,10/11. La mayor corresponde a la bolsa 2.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q17

**CLEAN → ENABLE**

Accuracy: Mujer zurda y hombre derecho son categorías disjuntas con 2+30=32 estudiantes, de un total 53.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2019-c2-statistics-2-q18

**CLEAN → ENABLE**

Accuracy: Hombre zurdo o mujer derecha o mujer zurda suma 3+18+2=23 de 53.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q23

**CLEAN → ENABLE**

Accuracy: La rama inferior alcanza -1 y baja sin límite; la superior alcanza 1 y crece sin límite. Ámbito=(-∞,-1]∪[1,∞).
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q24

**CLEAN → ENABLE**

Accuracy: Las ramas están definidas para [-3,0) y (0,2], excluyendo cero, la asíntota vertical.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q25

**CLEAN → ENABLE**

Accuracy: Con codominio {0}, el numerador debe ser cero y el denominador distinto de cero. El dominio es {-2}; solo I es verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q26

**CLEAN → ENABLE**

Accuracy: x²-1 no envía todo [-1,1] a {0}. En cambio g(0)=-1 y g(-1)=-3 sí pertenecen al codominio. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q27

**CLEAN → ENABLE**

Accuracy: En (-2,-1) el segmento es estrictamente creciente. Los otros intervalos cruzan un cambio de monotonicidad y repiten valores.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q28

**CLEAN → ENABLE**

Accuracy: g(5)=3 y la gráfica muestra f(3)=2: I verdadera. m(h(x))=2(x+1)+1=2x+3, no 2x+2. El ámbito de r es [-5,4], contenido en el dominio de h; III verdadera. I y III.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q29

**CLEAN → ENABLE**

Accuracy: y=2x/3+2 implica x=3y/2-3, así que f⁻¹(x)=3x/2-3.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q30

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La función 3√(x-1)+2 con dominio [5,∞) tiene ámbito [8,∞). La inversa intercambia dominio y ámbito; ambas afirmaciones son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q31

**CLEAN → ENABLE**

Accuracy: 5=2m-1 implica m=3.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q32

**CLEAN → ENABLE**

Accuracy: 8=-2+b implica b=10. El cero satisface -2x+10=0: x=5.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q33

**CLEAN → ENABLE**

Accuracy: La intersección Y es (0,16), no (0,-16). Con a<0, la parábola crece en x<0. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q34

**CLEAN → ENABLE**

Accuracy: f es exponencial decreciente y g es logarítmica decreciente. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q35

**CLEAN → ENABLE**

Accuracy: Los puntos indican f(x)=(1/2)^x y g(x)=log_(1/2)(x). Son inversas con a=b=1/2. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q36

**CLEAN → ENABLE**

Accuracy: Matrícula 40000 más diez sesiones de 5000: total 90000 colones.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q37

**CLEAN → ENABLE**

Accuracy: f(a²)=5logₐ(a²)=5·2=10.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q38

**CLEAN → ENABLE**

Accuracy: B(0)=10⁶. Para llegar a 11390625 se necesitan 6 h, pues 1.5⁶=11.390625; no está entre 2 y 5. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q39

**CLEAN → ENABLE**

Accuracy: De 2c+t=1600 y 3c+2t=2700 resulta c=500 y t=600 colones.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q40

**CLEAN → ENABLE**

Accuracy: Ingreso menos costo es (7000-2000)x-100000. Equilibrio: 5000x=100000, x=20.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q41

**CLEAN → ENABLE**

Accuracy: La gráfica f tiene puntos (0,0),(1,1),(2,4),(3,9), propios de x². La tabla g es √x. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-functions-1-q42

**CLEAN → ENABLE**

Accuracy: g(x)=3ˣ, así que k=81, no 36. f(x)=log₂(x). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q01

**CLEAN → ENABLE**

Accuracy: Centro (0,-1), radio 4: x²+(y+1)²=16.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q02

**CLEAN → ENABLE**

Accuracy: Respecto de Q(2,0), las distancias al cuadrado son QP²=5<9 y QR²=10>9. P es interior y R exterior; ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q03

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: QP²=(1-2)²+(-2)²=5. Con centro (2,0), la ecuación es (x-2)²+y²=5.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Notación del segmento QP normalizada; sin cambio matemático.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q04

**CLEAN → ENABLE**

Accuracy: La circunferencia tiene centro (-2,2), radio 2. La distancia a y=x es 2√2>2: no es secante. La recta x=0 está a distancia 2: es tangente. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q05

**CLEAN → ENABLE**

Accuracy: y=4 es tangente, no exterior; x=4 es exterior, no tangente. La distancia de (-2,2) a x+y-2=0 es √2<2, por lo que III es la única verdadera.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q06

**CLEAN → ENABLE**

Accuracy: n y r tienen pendiente -1, así que son paralelas. r es tangente en M y perpendicular al radio OM. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q07

**CLEAN → ENABLE**

Accuracy: Trasladar (3,-4) dos a la izquierda da (1,-4), y el radio permanece √8, no 10. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q08

**CLEAN → ENABLE**

Accuracy: El centro cambia de (0,-1) a (0,0): una unidad hacia arriba.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q09

**BLOCKER → KEEP DISABLED**

Accuracy: Solo se da AB=6 y se menciona un pentágono sin declarar que sea regular ni que CE=AB. El lado del triángulo equilátero CDE no queda determinado. Debe recuperarse la condición de regularidad o la longitud CE.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Solo se da AB=6 y se menciona un pentágono sin declarar que sea regular ni que CE=AB. El lado del triángulo equilátero CDE no queda determinado. Debe recuperarse la condición de regularidad o la longitud CE.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2021-c1-geometry-1-q10

**BLOCKER → KEEP DISABLED**

Accuracy: Se conoce únicamente AB=6, sin declarar regular el pentágono ni indicar sus otras longitudes. No puede deducirse su perímetro. Se debe aportar la condición o las longitudes faltantes.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Se conoce únicamente AB=6, sin declarar regular el pentágono ni indicar sus otras longitudes. No puede deducirse su perímetro. Se debe aportar la condición o las longitudes faltantes.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2021-c1-geometry-1-q11

**CLEAN → ENABLE**

Accuracy: Las longitudes AB,BC,CD,DE,EF son 3,2,3,2,2; FG=√5 y GA=√13. P=12+√5+√13.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q12

**CLEAN → ENABLE**

Accuracy: Los vértices (-1,6),(-1,3),(1,3),(1,0),(3,0),(3,2),(2,4) dan área 12 por la fórmula de coordenadas.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q13

**CLEAN → ENABLE**

Accuracy: Es un rectángulo de ancho 4 y alto 6. Tiene dos ejes de simetría, x=4 e y=4.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q14

**CLEAN → ENABLE**

Accuracy: La reflexión en x=4 intercambia F(2,1) y H(6,1). El segmento EQ, situado arriba, se refleja en sí mismo y no en FH. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q15

**CLEAN → ENABLE**

Accuracy: Reflejar en x=1 intercambia los triángulos: (-1,7)→(3,7),(-3,3)→(5,3),(-1,3)→(3,3).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q16

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: F=(4,4). Multiplicar sus coordenadas por -0.5 da (-2,-2).
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la coma de la coordenada D, escrita (-2-2) en la fuente; la transformación determina (-2,-2).
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q17

**CLEAN → ENABLE**

Accuracy: C=(2,1). La reflexión en x=-1 da x′=-2-2=-4, y′=1.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q18

**CLEAN → ENABLE**

Accuracy: B=(1,3). Una rotación de 180° en el origen da (-1,-3).
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q19

**CLEAN → ENABLE**

Accuracy: El corte paralelo al eje, perpendicular a la base y sin el vértice produce una hipérbola.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q20

**CLEAN → ENABLE**

Accuracy: El plano paralelo a la base genera un círculo, no un rectángulo. Un corte oblicuo que no toca las bases genera una elipse. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q21

**CLEAN → ENABLE**

Accuracy: La diagonal de la base cuadrada es 141.42≈100√2 cm; su lado es aproximadamente 100. Área total 2·100²+4·100·200≈100000 cm².
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-geometry-1-q22

**CLEAN → ENABLE**

Accuracy: R=10 y distancia al plano 6. El radio circular es √(100-36)=8 y su perímetro es 16π.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q43

**CLEAN → ENABLE**

Accuracy: El mínimo cero garantiza al menos una persona sin partidos; la media es 6, no 5, y la moda es 3. Son verdaderas I y III.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q44

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Las marcas 2,4,6 ponderadas por 5,4,1 dan (10+16+6)/10=3.2 horas.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q45

**BLOCKER → KEEP DISABLED**

Accuracy: El conjunto de Ana no respalda una afirmación de asimetría positiva; la fuente usa además el término incorrecto simetría positiva. Es necesario corregir la proposición de forma explícita antes de enseñar el concepto.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: El conjunto de Ana no respalda una afirmación de asimetría positiva; la fuente usa además el término incorrecto simetría positiva. Es necesario corregir la proposición de forma explícita antes de enseñar el concepto.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2021-c1-statistics-1-q46

**BLOCKER → KEEP DISABLED**

Accuracy: La proposición II usa variabilidad significativa sin definir criterio ni prueba. No puede evaluarse como una afirmación matemática determinada. Se debe indicar la medida o el umbral.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La proposición II usa variabilidad significativa sin definir criterio ni prueba. No puede evaluarse como una afirmación matemática determinada. Se debe indicar la medida o el umbral.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2021-c1-statistics-1-q47

**CLEAN → ENABLE**

Accuracy: El mínimo es 50-30=20; nadie dedicó menos de 20 h. La mediana 32 garantiza al menos 50% de valores de 32 o más. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q48

**CLEAN → ENABLE**

Accuracy: Q1=38-14=24. Al menos 25% estudia 24 h o menos y el intervalo [Q1,Q3]=[24,38] contiene al menos la mitad. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q49

**CLEAN → ENABLE**

Accuracy: Ambos mínimos son 4 h y, por tanto, se observaron. El máximo francés es 10, así que nadie requirió más de 11 h. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q50

**CLEAN → ENABLE**

Accuracy: Los franceses tienen mediana 7 y los ingleses Q1=7. Con grupos iguales, al menos 5/8=62.5% tardan 7 h o más, una mayoría. Ni un Q3=9 ni una mediana 9 garantizan una observación exactamente 9. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q51

**CLEAN → ENABLE**

Accuracy: Los ingleses tienen rango 9 e IQR 5, mayores que 6 y 4 de los franceses. Su caja está desplazada hacia tiempos bajos y su cola superior es más larga; los franceses son simétricos alrededor de 7. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q52

**CLEAN → ENABLE**

Accuracy: Las desviaciones estándar son 1.2,1.3,1.6,1.8. La menor variabilidad absoluta corresponde a E.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q53

**CLEAN → ENABLE**

Accuracy: En una carrera es mejor un menor tiempo estandarizado: Yuri z=0 y Flor z≈-0.769, por lo que I es falsa. Ruth z=0 y Gina z=0.625, de modo que II es verdadera.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q54

**CLEAN → ENABLE**

Accuracy: A contiene pares y C impares; son disjuntos. P(A∩C)=0 y P(A∪C)=P(A)+P(C). Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q55

**CLEAN → ENABLE**

Accuracy: A∩B={8,10,14} no es vacío. La fórmula general de la unión es verdadera. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q56

**CLEAN → ENABLE**

Accuracy: B y C son disjuntos. El complemento de A∪B es {19,21}, con dos elementos. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q57

**CLEAN → ENABLE**

Accuracy: Para X<4, A da 3/6 y B 3/12. Para X>4, A da 2/6 y B 8/12. Ambas elecciones indicadas maximizan la probabilidad.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q58

**CLEAN → ENABLE**

Accuracy: Para 3<X<9, A tiene 3/6 y B 5/12, de modo que I es falsa. Ambos dados tienen probabilidad 1/2 de obtener par, de modo que II es verdadera: D.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q59

**CLEAN → ENABLE**

Accuracy: Tenis y ajedrez no se intersectan en el diagrama. La probabilidad de practicar ambos es cero.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c1-statistics-1-q60

**CLEAN → ENABLE**

Accuracy: Las dos regiones de intersección contienen 5 y 7 personas, sumando 12 de un total de 31. P=12/31.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q23

**CLEAN → ENABLE**

Accuracy: El primer tramo recorre [-2,0] y la semirrecta desde (3,2) recorre [2,∞). Esa es la unión del ámbito.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q24

**CLEAN → ENABLE**

Accuracy: El tramo izquierdo va de x=-4 a x=-1; el derecho comienza en x=3 y continúa sin límite. Dominio=[-4,-1]∪[3,∞).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q25

**CLEAN → ENABLE**

Accuracy: x=-1 está excluido del denominador; x=1 es la única raíz válida del numerador. S={1}, por lo que solo II es verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q26

**CLEAN → ENABLE**

Accuracy: x²-4 no envía todo [-2,2] al único valor cero. En T, 0→1 y -1→2 pertenecen a B. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q27

**CLEAN → ENABLE**

Accuracy: El tramo entre x=0 y x=1 es estrictamente decreciente. Los demás intervalos propuestos cruzan un mínimo o un máximo y no son inyectivos.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q28

**CLEAN → ENABLE**

Accuracy: f(1)=-4 y h(-4)=-5: I verdadera. m(h(x))=3(x-1)-1=3x-4, no 3x-2. r toma valores en [-4,4], incluidos en el dominio de f: III verdadera. I y III.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q29

**CLEAN → ENABLE**

Accuracy: y=(-2x+4)/8=-x/4+1/2 implica x=-4y+2. La inversa tiene a=-4,b=2.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q30

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Para f(x)=√(x+3)-1 y x≥1, el mínimo es f(1)=1. El dominio de la inversa es [1,∞).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q31

**CLEAN → ENABLE**

Accuracy: La gráfica pasa por (-2,3) y (0,6), con pendiente 3/2 positiva, no -3/2. La intersección Y es (0,6). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q32

**CLEAN → ENABLE**

Accuracy: La recta y=-x tiene pendiente negativa y pasa por el origen. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q33

**CLEAN → ENABLE**

Accuracy: La parábola tiene máximo en (2,4); decrece para x>2 y es inyectiva en [2,∞). Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q34

**CLEAN → ENABLE**

Accuracy: g es exponencial creciente y f logarítmica creciente. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q35

**CLEAN → ENABLE**

Accuracy: Los puntos (2,4) de g y (4,2) de f, junto a sus interceptos, corresponden a 2ˣ y log₂(x). Son inversas y a=b=2.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q36

**CLEAN → ENABLE**

Accuracy: La máquina uno produce 90/2=45 botones/min y la dos 105/3=35. Conviene la primera y su función es 45x, no 15x. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q37

**CLEAN → ENABLE**

Accuracy: 3p+2y=2800 y 2p+3y=2700 dan p=600,y=500 colones.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q38

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: p(0)=8000. El modelo se reduce a la mitad cuando -0.2t=-1, esto es t=5 horas, no a cuatro años. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q39

**CLEAN → ENABLE**

Accuracy: logₐ(a⁴)+logₐ((a⁴)²)=4+8=12.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q40

**CLEAN → ENABLE**

Accuracy: La cantidad restante disminuye 80 m cada 10 s, a tasa constante -8 m/s. El modelo es lineal.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q41

**CLEAN → ENABLE**

Accuracy: La tabla A sigue y=0.5·2ˣ y la B y=2log₂(x). Ambas clasificaciones son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-functions-2-q42

**CLEAN → ENABLE**

Accuracy: En A, y=x²+1 da m=10. En B, y=2√x da n=10. Son iguales y el segundo modelo es raíz cuadrada.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q01

**CLEAN → ENABLE**

Accuracy: El centro es (2,5) y el radio OB=2; la ecuación es (x-2)²+(y-5)²=4.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q02

**CLEAN → ENABLE**

Accuracy: Centro (-1,3), radio 4 dan (x+1)²+(y-3)²=16.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q03

**CLEAN → ENABLE**

Accuracy: M(14,1) dista al cuadrado 173 del centro (1,-1), mayor que 2, por lo que no es interior. T es el centro, así que no es exterior. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q04

**CLEAN → ENABLE**

Accuracy: La distancia a y=3 es 3, igual al radio, por lo que es tangente y no secante. La distancia a x=3 es 2<3, por lo que es secante y no tangente. Ninguna verdadera.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q05

**CLEAN → ENABLE**

Accuracy: x=-3 dista 4 del centro (1,0), mayor que el radio 3. La recta y=-x dista 1/√2<3 y es secante. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q06

**CLEAN → ENABLE**

Accuracy: La recta r es tangente en A. Por tanto, es perpendicular al radio AO.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q07

**CLEAN → ENABLE**

Accuracy: El centro original es (1,4); al subir 2 queda en (1,6), conservando r²=4.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q08

**CLEAN → ENABLE**

Accuracy: Trasladar (1,4) dos a la izquierda y una abajo da (-1,3). La ecuación es (x+1)²+(y-3)²=4.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q09

**CLEAN → ENABLE**

Accuracy: En el hexágono regular lado=radio, de modo que P=6·4=24. Con apotema 3√3, lado=6 y área=36·3√3/2=54√3. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q10

**CLEAN → ENABLE**

Accuracy: Ángulo interno 60° implica un triángulo de perímetro 12, no 16. Ángulo central 90° implica un cuadrado de área 25, no 18. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q11

**CLEAN → ENABLE**

Accuracy: Con A(-2,0),B(4,0),C(4,7),D(0,5),E(0,3), el área por coordenadas es 27.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q12

**CLEAN → ENABLE**

Accuracy: Ángulo externo 90° implica cuadrado. Con diagonal 5√2, el lado es 5 y el área es 25.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q13

**CLEAN → ENABLE**

Accuracy: La figura es simétrica solo en x=0. La muesca superior y el vértice inferior impiden una simetría horizontal.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q14

**CLEAN → ENABLE**

Accuracy: E=(-3,3); su reflejo respecto del eje Y es (3,3), el punto G.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q15

**CLEAN → ENABLE**

Accuracy: El triángulo GJH tiene lados 5,√13,√18 y es escaleno. FGHJ es un paralelogramo oblicuo con lados desiguales, sin eje de reflexión. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q16

**CLEAN → ENABLE**

Accuracy: Una rotación antihoraria de 90° envía (x,y) a (-y,x). (3,1)→(-1,3), no (1,3); (3,2)→(-2,3). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q17

**CLEAN → ENABLE**

Accuracy: La transformación indicada lleva el triángulo rojo al amarillo, no al revés. La reflexión en y=-1 lleva los vértices rojos a los amarillos. Solo II es correcta.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q18

**CLEAN → ENABLE**

Accuracy: Sumar (4,3) a los vértices verdes produce los amarillos. Multiplicar los vértices rojos por -1 produce los azules. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q19

**CLEAN → ENABLE**

Accuracy: Un plano perpendicular a la base y sin el vértice produce una sección hiperbólica.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q20

**CLEAN → ENABLE**

Accuracy: Radio basal 8, altura 16, corte a 6 de la base: radio del corte=8(16-6)/16=5. Longitud=10π.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q21

**CLEAN → ENABLE**

Accuracy: La diagonal de la base cuadrada es 70.71≈50√2, así que el lado es aproximadamente 50. Con altura 100, área total≈2·50²+4·50·100=25000 cm².
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-geometry-2-q22

**CLEAN → ENABLE**

Accuracy: Radio de esfera 15 y radio del corte 12: distancia=√(225-144)=9.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q43

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Las marcas de clase 500,700,900 con frecuencias 46,44,10 dan (23000+30800+9000)/100=628 miles de colones.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q44

**CLEAN → ENABLE**

Accuracy: La media de A es 1575/9=175, igual a la de B. El máximo A es 190 y el de B 194. Ninguna afirmación es verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q45

**CLEAN → ENABLE**

Accuracy: A tiene media 175, mediana 180 y una cola hacia tallas menores, por lo que no tiene asimetría positiva. B tiene media, mediana y moda 175 y cuartiles aproximadamente equilibrados. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q46

**CLEAN → ENABLE**

Accuracy: El rango A es 190-155=35. El de B es 194-150=44, mayor; A no tiene mayor variabilidad por recorrido. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q47

**CLEAN → ENABLE**

Accuracy: El mínimo es máximo menos recorrido: 61-48=13 horas, que necesariamente se observó.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q48

**CLEAN → ENABLE**

Accuracy: Q1=18 y Q3=18+32=50. La mediana 42 garantiza al menos 50% por encima de 42; [18,50] contiene al menos la mitad. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q49

**CLEAN → ENABLE**

Accuracy: En A, [7,10]=[Q1,Me] solo garantiza 25%, no 50%. En B y C, Q3=10, que garantiza al menos 25% con 10 h o más. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q50

**CLEAN → ENABLE**

Accuracy: Los tres mínimos son 6. Una mediana o un cuartil de 10 no garantiza una observación exactamente 10. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q51

**CLEAN → ENABLE**

Accuracy: La mediana B es 8, por lo que al menos 50% dedica 8 h o menos. A tiene IQR 4 y rango 6; C tiene IQR 2 y rango 5. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q52

**CLEAN → ENABLE**

Accuracy: Los CV son Q:3/42≈0.0714, R:5/49≈0.1020, W:4/58≈0.0690, Y:2/22≈0.0909. El mínimo es W.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q53

**CLEAN → ENABLE**

Accuracy: Los valores z son Q:-2/3, R:1/5, W:-4 y Y:4. El máximo corresponde a Y.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q54

**CLEAN → ENABLE**

Accuracy: A y B son resultados distintos, por lo que su intersección es vacía. Su unión solo tiene 2 de 8 resultados, no probabilidad 1. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q55

**CLEAN → ENABLE**

Accuracy: A está contenido en C, por lo que P(A∪C)=4/8. B∪C contiene 5/8 de los resultados. Ninguna unión tiene probabilidad 1.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q56

**CLEAN → ENABLE**

Accuracy: P(Cᶜ)=4/8, mientras P(A)=1/8: I es falsa. P(Bᶜ)=7/8=1-P(A), por lo que II es verdadera.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q57

**CLEAN → ENABLE**

Accuracy: Las probabilidades de hombre con IMC bajo o mujer con IMC alto son 7/27,6/28,6/28,6/28. La mayor corresponde a 11-1.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q58

**CLEAN → ENABLE**

Accuracy: Las probabilidades de IMC normal son 11/27,9/28,10/28,10/28. La mayor corresponde a 11-1.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q59

**CLEAN → ENABLE**

Accuracy: Un dado justo tiene tres caras pares de seis y todas las caras son positivas. Ambas afirmaciones son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2021-c2-statistics-2-q60

**CLEAN → ENABLE**

Accuracy: No hay cara mayor que 7. Los impares mayores que 2 son 3 y 5, con probabilidad 2/6. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q23

**CLEAN → ENABLE**

Accuracy: En f el extremo (0,3) es abierto, así que el ámbito no incluye 3 y I es falsa. En g el dominio es [-3,-1]∪(2,6], como indica II. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q24

**CLEAN → ENABLE**

Accuracy: El ámbito de g es [1,3], por lo que su complemento real es (-∞,1)∪(3,∞).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q25

**CLEAN → ENABLE**

Accuracy: En [-1,1] la gráfica es estrictamente creciente. Los demás intervalos incluyen parte del tramo constante, impidiendo la inversa.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q26

**CLEAN → ENABLE**

Accuracy: x=2 está excluido por el denominador y -2 es la única raíz válida del numerador. D={-2}. Solo I.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q27

**CLEAN → ENABLE**

Accuracy: g(2)=2·2-5=-1. La gráfica da f(-1)=0, así que (f∘g)(2)=0.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q28

**CLEAN → ENABLE**

Accuracy: j toma valores [0,4], contenidos en el dominio de r. g toma valores [-5,1], no contenidos en [0,4]. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q29

**CLEAN → ENABLE**

Accuracy: M(0)=5 no pertenece a B={0,10}, por lo que M no es función A→B. N no envía todos los números de [-3,3] a cero. Ninguna.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q30

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Para f(x)=4√(x-3)+2, x≥4, el ámbito comienza en 6, no 1. La inversa de -x/4+4 es -4x+16, no -4x+8. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q31

**CLEAN → ENABLE**

Accuracy: -12=4(-1)-b da b=8; y=4x-8 se anula en x=2.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q32

**CLEAN → ENABLE**

Accuracy: La parábola abre hacia arriba, así que a>0. Corta al eje X en dos puntos, por lo que Δ>0 y II es falsa. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q33

**CLEAN → ENABLE**

Accuracy: La inversa es (1/3)ˣ, no 3ˣ. Un logaritmo no interseca el eje Y; su intersección X es (1,0). Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q34

**CLEAN → ENABLE**

Accuracy: El punto (2,4) implica a²=4 y a>0, así que a=2. Al ser a>1, la función es creciente. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q35

**CLEAN → ENABLE**

Accuracy: f(x)=2(x+1)²-8=2x²+4x-6. Corta Y en (0,-6).
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q36

**CLEAN → ENABLE**

Accuracy: La primera máquina produce 5·16/2=40 paquetes/min; la segunda 6.5·18/3=39. El primer modelo no es 32x y no conviene la segunda. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q37

**CLEAN → ENABLE**

Accuracy: 4p+2z=2950 y 3p+5z=3525. Al resolver se obtiene p=550 colones.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q38

**CLEAN → ENABLE**

Accuracy: 96000/1500=64=2⁶. t/3=6, así que t=18 h.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q39

**CLEAN → ENABLE**

Accuracy: 1/m³=m^(-3), de modo que logₘ(1/m³)=-3.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q40

**CLEAN → ENABLE**

Accuracy: Por cada aumento de una unidad de x, y se divide entre dos. El modelo es 3(1/2)ˣ, exponencial.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q41

**CLEAN → ENABLE**

Accuracy: La parábola de utilidad alcanza su máximo en x=-1500/(2·(-0.2))=3750. u(3750)=2712500.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-functions-1-q42

**CLEAN → ENABLE**

Accuracy: Cada aumento de 150 unidades de altura reduce un grado de temperatura; la tasa es constante y el modelo es lineal.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q01

**CLEAN → ENABLE**

Accuracy: Centro (-2,0), r=5: (x+2)²+y²=25.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q02

**CLEAN → ENABLE**

Accuracy: La circunferencia azul tiene centro (4,0) y radio 4; las demás tienen otros centros.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q03

**CLEAN → ENABLE**

Accuracy: Centro (2,-4), r²=25: (2,4) da 64>25 y es exterior; (0,-4) da 4<25 y es interior. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q04

**CLEAN → ENABLE**

Accuracy: El centro es (2,4), r=4. La recta y=0 dista 4 y es tangente; las otras distan 2,5,6 respectivamente.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q05

**CLEAN → ENABLE**

Accuracy: La distancia del centro a y=x es √2<4, así que no es exterior. y=-2 dista 6>4 y no es secante. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q06

**CLEAN → ENABLE**

Accuracy: AC es horizontal y no paralela a la tangente oblicua r. r es perpendicular al radio AB. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q07

**CLEAN → ENABLE**

Accuracy: Centro (2,4) menos (4,0) da (-2,4); el radio sigue siendo 3. La ecuación es (x+2)²+(y-4)²=9.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q08

**CLEAN → ENABLE**

Accuracy: Centro (2,4)+(1,-2)=(3,2), conservando r²=9.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q09

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Por coordenadas el área es 25. Las longitudes son 5,√13,2,5,5,8; su suma es 25+√13. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizaron radicales y marcas de segmento de la fuente; sin cambio de valores.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q10

**CLEAN → ENABLE**

Accuracy: Ángulo central 36° implica diez lados de 3 y perímetro 30. La otra figura es un cuadrado de diagonal 5√3 y área 75/2, no 5√3. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q11

**CLEAN → ENABLE**

Accuracy: El ángulo interno 120° implica hexágono. Con apotema 4√3 el lado es 8 y el área es (48·4√3)/2=96√3.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q12

**CLEAN → ENABLE**

Accuracy: En un hexágono regular el radio coincide con el lado. P=6·5=30.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q13

**CLEAN → ENABLE**

Accuracy: Los cuatro vértices forman un cuadrado girado: tiene cuatro ejes de simetría.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q14

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Respecto de y=3, B y D permanecen fijos y no se intercambian. AB se transforma en CB, no en AD. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizaron radicales y marcas de segmento de la fuente; sin cambio de valores.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q15

**CLEAN → ENABLE**

Accuracy: Un triángulo equilátero tiene tres ejes, uno por cada vértice y el punto medio del lado opuesto.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q16

**CLEAN → ENABLE**

Accuracy: La traslación de B a C es (8,4). El punto azul (-2,-1) se envía a (6,3), no al rojo (2,1). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q17

**CLEAN → ENABLE**

Accuracy: Reflejar A en el eje Y la envía a la derecha, no a B. Rotar B 90° antihorarios tampoco produce A. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q18

**CLEAN → ENABLE**

Accuracy: La homotecia de razón -1 coincide con una rotación de 180° y ambas envían B a C. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q19

**CLEAN → ENABLE**

Accuracy: Un plano oblicuo a un cilindro que no toca las bases produce una elipse.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q20

**CLEAN → ENABLE**

Accuracy: Radio de sección=√(13²-5²)=12; perímetro=24π.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q21

**CLEAN → ENABLE**

Accuracy: P es el punto superior donde concurren las generatrices del cono; es su vértice.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2022-c1-geometry-1-q22

**CLEAN → ENABLE**

Accuracy: Radio basal 6 y corte a mitad de altura: radio de sección 3; perímetro=6π.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q23

**CLEAN → ENABLE**

Accuracy: El tramo inferior recorre [-2,0] y el superior [1,3], con extremos incluidos. Ámbito=[-2,0]∪[1,3].
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q24

**CLEAN → ENABLE**

Accuracy: x=0 queda excluido del denominador. La raíz válida de x²-4x es 4, por lo que S={4}.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q25

**CLEAN → ENABLE**

Accuracy: J no envía todo [-6,6] a cero. T(1)=0 y T(2)=1 sí pertenecen al codominio. Solo la relación 2.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q26

**CLEAN → ENABLE**

Accuracy: Entre -2 y 0, f es estrictamente creciente. Los demás intervalos cruzan el máximo o contienen un tramo constante.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q27

**CLEAN → ENABLE**

Accuracy: f(-2)=-4 y h(-4)=-6. m(r(x))=x²-2, no -x²+2. El ámbito de m es [-2,4], no contenido en [-2,2], dominio de r. Solo 1.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q28

**CLEAN → ENABLE**

Accuracy: y=(x+1)/2 implica x=2y-1; a=2,b=-1.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q29

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Para x≥4, el mínimo es 2√(4+5)-7=-1. El dominio de la inversa es [-1,∞).
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q30

**CLEAN → ENABLE**

Accuracy: La curva y=2√x se obtiene por homotecia de razón 4 en el origen aplicada a y=√x; y=√x+2 es una traslación vertical de dos unidades. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q31

**CLEAN → ENABLE**

Accuracy: La recta cruza Y en 2 y contiene (8,4), por lo que su pendiente es (4-2)/8=1/4, menor que 1. Solo 1.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q32

**CLEAN → ENABLE**

Accuracy: y=-x es decreciente y pasa por (0,0). Solo 2.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q33

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La parábola pasa por el origen, de modo que c=0; abre hacia abajo, de modo que a<0. Solo 1.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q34

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La parábola tiene dos raíces distintas, por lo que Δ>0. Con eje x=3 y raíz 0, la otra raíz es 6. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q35

**CLEAN → ENABLE**

Accuracy: Si 0<a<1, la inversa logₐ(x) es decreciente. Es logarítmica; solo 2.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q36

**CLEAN → ENABLE**

Accuracy: A requiere 15/3=5 min/vaca y B 30/5=6 min/vaca. A es más rápida y para A el tiempo es t(x)=5x. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-functions-1-q37

**CLEAN → ENABLE**

Accuracy: 2p+3t=2800 y 3p+2t=2700 dan t=600 colones.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q01

**CLEAN → ENABLE**

Accuracy: La figura tiene centro (0,3) y radio 3; su ecuación es x²+(y-3)²=9.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q02

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Centro (-2,1), radio 4: (x+2)²+(y-1)²=16.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restituyó el exponente 2 omitido en (x+2) de la opción D. El centro y el radio del enunciado determinan inequívocamente la corrección.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q03

**CLEAN → ENABLE**

Accuracy: Respecto de (-1,0), M(1,0) da distancia²=4<7 y T(1,2) da 8>7. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q04

**CLEAN → ENABLE**

Accuracy: x=-3 dista 3<√10 del centro (0,2), así que es secante. y=-3 dista 5>√10 y no es tangente. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q05

**CLEAN → ENABLE**

Accuracy: y=x dista √2<√10 del centro, así que es secante. y=-2 dista 4>√10 y es exterior. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q06

**CLEAN → ENABLE**

Accuracy: A,O,E son colineales y r es tangente en A; la recta OE es perpendicular a r.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q07

**CLEAN → ENABLE**

Accuracy: El centro (3,3) sube a (3,5), conservando radio 2: (x-3)²+(y-5)²=4.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q08

**CLEAN → ENABLE**

Accuracy: El centro (3,3)+(3,-1)=(6,2); la ecuación es (x-6)²+(y-2)²=4.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q09

**CLEAN → ENABLE**

Accuracy: Ángulo central 120° implica triángulo equilátero. Con lado 6, área=6²√3/4=9√3.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q10

**CLEAN → ENABLE**

Accuracy: n-3=7 implica n=10. Con lado 3, perímetro=30.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q11

**BLOCKER → KEEP DISABLED**

Accuracy: Se menciona un hexágono sin declarar regularidad ni dar sus dimensiones suficientes. Los triángulos equiláteros y AB por sí solos no determinan el área del hexágono. Debe recuperarse la condición de hexágono regular o los datos faltantes.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Se menciona un hexágono sin declarar regularidad ni dar sus dimensiones suficientes. Los triángulos equiláteros y AB por sí solos no determinan el área del hexágono. Debe recuperarse la condición de hexágono regular o los datos faltantes.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2023-c1-geometry-1-q12

**CLEAN → ENABLE**

Accuracy: 180-360/n=108 implica n=5. El perímetro es 5·6=30.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q13

**CLEAN → ENABLE**

Accuracy: En las figuras 1 y 3, la reflexión respecto del eje X envía (-2,3) a (-2,-3), punto homólogo mostrado en la figura 3.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q14

**CLEAN → ENABLE**

Accuracy: Las figuras 1 y 2 son reflejos respecto del eje Y: x=0.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q15

**CLEAN → ENABLE**

Accuracy: Las figuras 1 y 3 son reflejos respecto del eje X: y=0.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q16

**CLEAN → ENABLE**

Accuracy: A=(-3,-2). En una reflexión respecto de y=-1, y′=-2-y=0. La imagen es (-3,0).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q17

**CLEAN → ENABLE**

Accuracy: C=(-5,-5); después de trasladar (9,8), queda (4,3). Al rotar 90° antihorarios se obtiene (-3,4).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q18

**CLEAN → ENABLE**

Accuracy: B=(-6,-4) se transforma en (6,4), no (4,6). La homotecia de razón -1 sí reproduce la figura 1. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q19

**CLEAN → ENABLE**

Accuracy: Un corte oblicuo que no alcanza la base ni el vértice y produce una sección cerrada en una sola napa es elíptico.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q20

**CLEAN → ENABLE**

Accuracy: Radio basal 6, altura 8 y corte a mitad: radio de sección 3 y longitud 6π.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q21

**CLEAN → ENABLE**

Accuracy: El radio es 20 y el plano está a 12 del eje. El ancho de la sección es 2√(400-144)=32. Área=32·100=3200 cm².
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c1-geometry-1-q22

**CLEAN → ENABLE**

Accuracy: OP=6 y PB=8 forman un triángulo rectángulo: OB=10. AB es diámetro y mide 20.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q41

**CLEAN → ENABLE**

Accuracy: x=0 está excluido y el único cero válido de -x²+x es 1. D={1}; solo II.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q42

**CLEAN → ENABLE**

Accuracy: J envía -1 y 1 a cero. T envía -4 a 0 y 0 a 4, ambos en B. Ambas funciones están bien definidas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q43

**CLEAN → ENABLE**

Accuracy: La intersección [0,10)∩[-1,5) es [0,5).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q44

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: f(x)=√(x-2)+1, x≥3, tiene ámbito [2,∞). El complemento real del dominio de la inversa es (-∞,2).
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q45

**CLEAN → ENABLE**

Accuracy: El intervalo (-3,2) contiene un tramo constante, así que no es inyectivo. El dominio de f es [-5,3] y su complemento es (-∞,-5)∪(3,∞). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q46

**CLEAN → ENABLE**

Accuracy: El ámbito de f es [-2,2], contenido en el dominio de g=[-2,2], por lo que g∘f existe. f(h(2))=f(0)=1, no 2. r∘g=x²-4. El ámbito de r no está contenido en el dominio de g.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q47

**BLOCKER → KEEP DISABLED**

Accuracy: f(x)=(6+12x)/12=x+1/2 tiene inversa x-1/2. Ninguna alternativa ofrece a=1,b=-1/2. Debe corregirse una alternativa o recuperarse el enunciado correcto.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: f(x)=(6+12x)/12=x+1/2 tiene inversa x-1/2. Ninguna alternativa ofrece a=1,b=-1/2. Debe corregirse una alternativa o recuperarse el enunciado correcto.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2023-c2-functions-2-q48

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: f(x)=5√(x-16). Su reducción a √(x-16) puede obtenerse por homotecia de centro (16,0) y razón 1/25. Trasladar f 16 unidades hacia la izquierda da 5√x. Ambas afirmaciones son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q49

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La recta y=5 tiene pendiente cero y contiene (0,5). Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q50

**CLEAN → ENABLE**

Accuracy: La recta pasa por (-3,2) y (0,-1): y=-x-1. Así f(-7)=6 y la función es decreciente. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q51

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: a⁵=32 con a>0 implica a=2. f es creciente, pero la inversa es log₂(x), no log₅(x). Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q52

**CLEAN → ENABLE**

Accuracy: La parábola abre hacia arriba, por lo que a>0. Cruza Y por debajo de cero, por lo que c<0. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q53

**CLEAN → ENABLE**

Accuracy: El eje es x=1 y una raíz es -1, de modo que la otra es 3. Así f(3)=0 y ambas son verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q54

**CLEAN → ENABLE**

Accuracy: 2l+3g=775 y 3l+2g=850 dan l=200 colones.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q55

**CLEAN → ENABLE**

Accuracy: 132000=120000·1.1¹ y 175692=120000·1.1⁴. Transcurren 4-1=3 años.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q56

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: log₂(m)=-1 implica m=1/2. Entonces (1/2)^x=16=2⁴ implica x=-4.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q57

**CLEAN → ENABLE**

Accuracy: Después de 60 minutos la tarifa aumenta 2400/60=40 colones/min. A los 90 minutos cuesta 3000+30·40=4200, no 4300. A 25 y 50 minutos cuesta lo mismo, 3000. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q58

**CLEAN → ENABLE**

Accuracy: El costo es la matrícula fija de 12 000 colones más 3000 colones por cada una de las x lecciones: C(x)=12 000+3000x, con 0≤x≤23. Solo A tiene ambos términos correctos; B aumenta indebidamente el costo fijo y C y D usan 23 como tarifa por lección.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q59

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Con la primera abscisa restituida a 2, f(x)=2log₂(x). La tabla g es 3·2ˣ. Ambas clasificaciones son correctas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restituyó la primera abscisa de la tabla f de 1 a 2: los otros cuatro pares siguen exactamente y=2log₂(x), y el primer valor y=2 tiene preimagen 2. Corrección matemática explícita, no una aprobación de la tabla original.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-functions-2-q60

**CLEAN → ENABLE**

Accuracy: La primera tabla cumple f(x)=2√x y la segunda g(x)=x²+x. Ambas clasificaciones son correctas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q19

**CLEAN → ENABLE**

Accuracy: Centro (-3,-4), radio 5: (x+3)²+(y+4)²=25.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q20

**CLEAN → ENABLE**

Accuracy: Centro (-2,0), radio 2: (x+2)²+y²=4.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q21

**CLEAN → ENABLE**

Accuracy: P(0,0) da distancia²=4<5 y es interior, no exterior. R(1,1) da 10>5 y es exterior, no interior. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q22

**CLEAN → ENABLE**

Accuracy: La distancia del centro (0,1) a y=x es 1/√2<3, así que es secante. La recta y=-3 dista 4>3 y es exterior. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q23

**CLEAN → ENABLE**

Accuracy: La recta y=0 dista 2 del centro (-3,2), igual al radio. La recta y=-x dista 1/√2<2, así que es secante. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q24

**CLEAN → ENABLE**

Accuracy: T es punto de tangencia de r y C. El radio OT es perpendicular a r.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q25

**BLOCKER → KEEP DISABLED**

Accuracy: Las alternativas C y D son idénticas y ambas coinciden con la traslación correcta: (x-1)²+(y-4)²=4. Debe sustituirse un distractor duplicado con una alternativa inequívocamente incorrecta.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Las alternativas C y D son idénticas y ambas coinciden con la traslación correcta: (x-1)²+(y-4)²=4. Debe sustituirse un distractor duplicado con una alternativa inequívocamente incorrecta.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2023-c2-geometry-2-q26

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La circunferencia original tiene centro (-1,4) y radio 2. Trasladar (-1,-3) da centro (-2,1): (x+2)²+(y-1)²=4.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró explícitamente el centro y radio del contexto gráfico compartido de las preguntas anteriores.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q27

**CLEAN → ENABLE**

Accuracy: BAFE tiene ancho 6 y altura 2, por lo que P=16. La parte superior tiene bases 6 y 4 y altura 2, con área 10; área total=12+10=22, no 20. Solo I: C.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q28

**CLEAN → ENABLE**

Accuracy: El ángulo externo 90° implica cuadrado. Diagonal 5√2 da lado 5 y perímetro 20.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q29

**CLEAN → ENABLE**

Accuracy: La suma 720° implica hexágono. Apotema 4√3 da lado 8 y área 96√3.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q30

**CLEAN → ENABLE**

Accuracy: Ángulo central 72° implica pentágono. Lado=2·6·sin36° y P=60·sin36°≈35.27.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q31

**CLEAN → ENABLE**

Accuracy: A=(1,2) y C=(7,2) tienen mediatriz x=(1+7)/2=4.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q33

**CLEAN → ENABLE**

Accuracy: La reflexión en x=4 lleva AB a DC. La reflexión en y=3 lleva el trapecio superior ABCD al inferior SRUT. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q34

**CLEAN → ENABLE**

Accuracy: G=(2,4); reflejar respecto de y=0 da (2,-4).
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q35

**CLEAN → ENABLE**

Accuracy: La razón -1 y la rotación de 180° son la misma transformación (x,y)→(-x,-y); envían los vértices de HGFE a ABCD. Ambas válidas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q36

**CLEAN → ENABLE**

Accuracy: La reflexión en y=1 no cambia las abscisas negativas de CBAD y no puede producir RWPQ a la derecha. La traslación (2,-5) lleva E,H,G,F a R,W,P,Q. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q37

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: AB=8 implica radio 4. MA une extremos de radios ortogonales y mide 4√2, no 4; OA=OB=4. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizaron sobrelíneas de segmentos sin cambiar sus relaciones.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q38

**CLEAN → ENABLE**

Accuracy: El corte está a 15 del vértice en un cono de altura 20 y radio basal 8. Radio de sección=8·15/20=6, longitud=12π.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q39

**CLEAN → ENABLE**

Accuracy: Un corte oblicuo produce una elipse. Un plano que contiene el eje OS produce una sección rectangular, no hiperbólica. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-geometry-2-q40

**CLEAN → ENABLE**

Accuracy: AS=5 es radio basal. Un corte paralelo a la base tiene el mismo radio y longitud=2π·5=10π.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q01

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Las marcas de clase son 2000,2400,2800. El promedio estimado es (2000·42+2400·48+2800·10)/100=2272 dólares.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q02

**CLEAN → ENABLE**

Accuracy: La media A es 108/13≈8.3077, por lo que la diferencia con 10 no es 2. Q1=8 en B no garantiza un dato exactamente 8. Ninguna es verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q03

**CLEAN → ENABLE**

Accuracy: La moda A es 8 y la de B es 10, con diferencia 2. Los resúmenes de B son simétricos alrededor de 10, no muestran asimetría positiva. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q04

**BLOCKER → KEEP DISABLED**

Accuracy: La fuente declara iguales las desviaciones estándar, pero las amplitudes de A y B difieren. La pregunta usa mayor variabilidad sin precisar la medida, lo que cambia la verdad de II; debe especificarse la medida.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La fuente declara iguales las desviaciones estándar, pero las amplitudes de A y B difieren. La pregunta usa mayor variabilidad sin precisar la medida, lo que cambia la verdad de II; debe especificarse la medida.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2023-c2-statistics-2-q05

**CLEAN → ENABLE**

Accuracy: Con mínimo 12 y recorrido 20, el máximo es 32, necesariamente observado.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q06

**CLEAN → ENABLE**

Accuracy: Q1=15 no garantiza 25% con 14 h o menos. Con IQR=14, Q3=29; [15,26] no garantiza 75%. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q07

**CLEAN → ENABLE**

Accuracy: El rango conjunto es 132-5=127, no 25. Ambos mínimos son 5 y ambos primeros cuartiles 30; al menos un cuartil de cada grupo queda en [5,30]. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q08

**CLEAN → ENABLE**

Accuracy: Ambos Q1 son 30, de modo que al menos 75% de los recorridos son de 30 km o más. El máximo mayor es del camión 2 y la mediana no garantiza un dato igual a ella; Q3 del camión 1 es 94, no 107.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q09

**CLEAN → ENABLE**

Accuracy: El máximo del camión 2 es 132, no 137. Su rango es 127 frente a 102 y su IQR es 77 frente a 64; presenta mayor variabilidad. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q10

**CLEAN → ENABLE**

Accuracy: El CV de undécimo es 0.3/10.8·100≈2.78%, no 3.6. Miguel tiene z=0.5 y Óscar z=1; como se trata de tiempo de carrera, Miguel ocupa la mejor posición. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q11

**CLEAN → ENABLE**

Accuracy: 0.6/10.5<0.6/10.2, por lo que noveno tiene menor CV. Enrique tiene z=(10.6-10.2)/0.6≈0.67. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q12

**CLEAN → ENABLE**

Accuracy: Par e impar son disjuntos, así que P(A∩B)=0, no 1. La fórmula general de la unión es verdadera. Solo II.
Answer: D
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q13

**BLOCKER → KEEP DISABLED**

Accuracy: La proposición I escribe P(A∩C)=C, comparando una probabilidad con un evento sin expresión numérica válida. La corrección no está determinada por la fuente; se debe recuperar la proposición correcta.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La proposición I escribe P(A∩C)=C, comparando una probabilidad con un evento sin expresión numérica válida. La corrección no está determinada por la fuente; se debe recuperar la proposición correcta.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2023-c2-statistics-2-q14

**CLEAN → ENABLE**

Accuracy: A y B son complementarios con probabilidad 1/2 cada uno; P(Bᶜ)=1-P(A)=1/2. C y D se intersectan en {2,3}, de modo que no se pueden sumar sin restar la intersección. Solo I.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q15

**CLEAN → ENABLE**

Accuracy: Para 5 o 6, A da 2/6, B 2/8 y C 2/12: C no es óptimo. Para 3≤X<8, A da 4/6, mayor que 5/8 de B; tampoco II. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q16

**CLEAN → ENABLE**

Accuracy: Para X<9, A y B tienen probabilidad 1, frente a 8/12 de C. En los tres dados la mitad de caras es impar. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q17

**CLEAN → ENABLE**

Accuracy: Dulce o salado incluye las regiones 9+3+8+4=24 de 39 personas, con probabilidad 24/39.
Answer: D
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2023-c2-statistics-2-q18

**CLEAN → ENABLE**

Accuracy: Exactamente dos sabores suman 3+4=7 personas de 39; la probabilidad es 7/39.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q01

**CLEAN → ENABLE**

Accuracy: x=5 está excluido y el único cero válido de 25-x² es -5. El dominio de esta función con codominio {0} es {-5}.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q02

**CLEAN → ENABLE**

Accuracy: T envía -2 y 2 a cero. R(-1)=-3 no pertenece al codominio {0,3}. Solo T es función.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q03

**CLEAN → ENABLE**

Accuracy: El complemento del codominio de g=(0,∞) es (-∞,0]. Intersecarlo con [-6,5] da [-6,0].
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q04

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ámbito de la inversa coincide con el dominio original [10,∞), independientemente del valor mínimo de la función.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q05

**CLEAN → ENABLE**

Accuracy: El intervalo (-1,0) está en un segmento estrictamente decreciente del dominio. Las otras opciones se extienden fuera del dominio de f, que termina en cero.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q06

**CLEAN → ENABLE**

Accuracy: El ámbito de r=x²-4, x∈[-2,2], es [-4,0], contenido en el dominio de f. En cambio f(g(0))=f(-2)=2, no -2, y g no está definida para todo [-4,0].
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q07

**CLEAN → ENABLE**

Accuracy: y=(x+2)/3 implica x=3y-2. La inversa tiene a=3,b=-2.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q08

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: √x+1 es traslación vertical; √(x+1) es traslación horizontal hacia la izquierda. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q09

**CLEAN → ENABLE**

Accuracy: Una recta horizontal y=-2 tiene pendiente cero, no pasa por el origen ni corta al eje X.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q10

**CLEAN → ENABLE**

Accuracy: La recta corta X en (6,0), por lo que f(6)=0. Es decreciente y la intersección Y es (0,8).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q11

**CLEAN → ENABLE**

Accuracy: a³=8 y a>0 dan a=2. La función crece y su inversa es log₂(x). Ambas verdaderas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q12

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La parábola abre hacia abajo (a<0), corta Y en 8 y tiene dos raíces distintas; por tanto Δ>0.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q13

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El vértice tiene abscisa 1. El eje de simetría es la recta vertical x=1.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q14

**CLEAN → ENABLE**

Accuracy: t=ln(33752.87/25000)/0.05≈6 años, que está entre 4 y 9.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q15

**CLEAN → ENABLE**

Accuracy: Resolver 18A+25B=161000 y 15A+37B=215000 da A=2000 y B=5000 colones.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q16

**CLEAN → ENABLE**

Accuracy: El mínimo de 2x²-60x+1769 está en x=15. C(15)=450-900+1769=1319.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q17

**CLEAN → ENABLE**

Accuracy: log₂(m)=3 da m=8 y logₘ(x)=2 da x=64.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q18

**BLOCKER → KEEP DISABLED**

Accuracy: Solo se informa la población inicial de 100. Tanto 100·2^t como 100·(0.5)^t son modelos exponenciales positivos con ese valor inicial. Falta una condición de crecimiento o datos posteriores para distinguir A y C.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Solo se informa la población inicial de 100. Tanto 100·2^t como 100·(0.5)^t son modelos exponenciales positivos con ese valor inicial. Falta una condición de crecimiento o datos posteriores para distinguir A y C.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2024-c1-functions-1-q19

**CLEAN → ENABLE**

Accuracy: A sigue y=2x² y B sigue y=3√x. Ambas clasificaciones son correctas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-functions-1-q20

**CLEAN → ENABLE**

Accuracy: En A, y=2x-3 da P=5, no 7. En B, y=2log₃(x), así que K=27, mayor que 26.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q39

**CLEAN → ENABLE**

Accuracy: Centro (3,-2), radio 1: (x-3)²+(y+2)²=1.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q40

**CLEAN → ENABLE**

Accuracy: El centro es (4,0) y el radio 4; la ecuación es (x-4)²+y²=16.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q41

**CLEAN → ENABLE**

Accuracy: El centro es (-3,0) y r²=3. P(0,0) tiene distancia²=9>3 y R es el centro, con distancia cero. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q42

**CLEAN → ENABLE**

Accuracy: La circunferencia tiene centro (3,3), radio 3. y=0 e y=6 son tangentes, mientras y=x pasa por el centro y es secante.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q43

**CLEAN → ENABLE**

Accuracy: P es el origen y T=(12,n). Pitágoras: 12²+n²=13², luego n²=25. Como T está arriba del eje X en la figura, n=5.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q44

**CLEAN → ENABLE**

Accuracy: El centro es (1,0), radio 3. La horizontal y=3 está a distancia 3, por lo que es tangente.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q45

**CLEAN → ENABLE**

Accuracy: El centro (0,1) se desplaza a (2,-4), conservando r²=6. La ecuación es (x-2)²+(y+4)²=6.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q46

**CLEAN → ENABLE**

Accuracy: El centro (3,0) se desplaza (-4,3) a (-1,3), con radio 2. La ecuación es (x+1)²+(y-3)²=4.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q47

**CLEAN → ENABLE**

Accuracy: Ángulo interno 120° implica hexágono regular. Su lado es el radio 6, y el área es (3√3/2)·36=54√3.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q48

**CLEAN → ENABLE**

Accuracy: Ángulo central 45° implica ocho lados: P=8·6=48. Sin diagonales implica triángulo equilátero; lado=24/3=8 y área=8²√3/4=16√3. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q49

**CLEAN → ENABLE**

Accuracy: En I, un cuadrado de apotema 6 tiene lado 12 y área 144, no 36. En II, un cuadrado de radio 3√2 tendría área 36, no 18; además no existe un polígono con una sola diagonal total. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q50

**CLEAN → ENABLE**

Accuracy: La parte superior es un triángulo de base 13 y altura 6, área 39. La parte inferior es un trapecio de bases 13 y 10, altura 12, área 138. Total 177.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q51

**CLEAN → ENABLE**

Accuracy: Solo la vertical x=4 divide la figura en mitades especulares. No hay simetría horizontal o diagonal.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q52

**CLEAN → ENABLE**

Accuracy: Las figuras 2 y 3 son reflejos respecto del eje Y, de ecuación x=0.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q53

**CLEAN → ENABLE**

Accuracy: Reflejar ∠IJK en el eje X no produce ∠CDE: los vértices no corresponden. Reflejar la figura 1 respecto de y=x tampoco produce la 3. Ninguna verdadera.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q54

**CLEAN → ENABLE**

Accuracy: C=(-3,1). Una rotación antihoraria de 90° da (-1,-3).
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q55

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Reflejar el triángulo 3 en x=3.5 produce el 2. Aplicar razón -1 a ABC también produce el 2. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizó la tercera etiqueta D a C, conservando el texto y la respuesta A; no se agregó una alternativa.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q56

**CLEAN → ENABLE**

Accuracy: Para pasar del triángulo 1 al 2 se suma (1,-3); la traslación es T(x+1,y-3).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q57

**CLEAN → ENABLE**

Accuracy: Un plano paralelo a una generatriz y que no pasa por el vértice genera una parábola.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q58

**CLEAN → ENABLE**

Accuracy: Radio de sección=√(13²-12²)=5.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q59

**CLEAN → ENABLE**

Accuracy: El corte axial es un rectángulo de largo 120 y ancho igual al diámetro 40: área=4800 cm².
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-geometry-1-q60

**CLEAN → ENABLE**

Accuracy: Por semejanza, si H es la altura original, (H-4)/H=3/8. Así 8H-32=3H y H=6.4 cm.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q21

**CLEAN → ENABLE**

Accuracy: El promedio ponderado es 0.50·70+0.30·80+0.20·90=77.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q22

**CLEAN → ENABLE**

Accuracy: Mínimo y máximo están a 10 de la mediana 60; Q1 y Q3 están a 5, y media, mediana y moda son 60. El resumen tiende a la simetría; los cuartiles no garantizan observaciones exactas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q23

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Con marcas 450,750,1050 y frecuencias 6,10,4, la media estimada es (2700+7500+4200)/20=720 colones.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q24

**CLEAN → ENABLE**

Accuracy: El rango femenino 43 y mínimo 18 dan máximo 61. El máximo masculino es 63; la persona de mayor edad es un hombre.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q25

**CLEAN → ENABLE**

Accuracy: La mediana masculina 44 garantiza al menos 50% con 44 años o más. Q3 femenino=24+26=50, por lo que al menos 25% tiene 50 o más y, por tanto, 44 o más. Solo A está garantizada.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q26

**CLEAN → ENABLE**

Accuracy: Los rangos son A:560-140=420, B:490-50=440 y C:500-120=380. También el IQR de B (280) supera los otros. El sitio B presenta mayor variabilidad.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q27

**CLEAN → ENABLE**

Accuracy: Ambas medianas son 25, así que al menos el 50% de cada torneo alcanza 25 puntos. Los extremos no descartan 30 ni garantizan un dato de 20.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q28

**CLEAN → ENABLE**

Accuracy: I es falsa: los primeros cuartiles son 15 y 10, no 5. Ambos Q3=25 garantizan al menos 100 de 400 entrevistas con 25 minutos o más. El máximo de febrero 35 supera al de enero 30. II y III.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q29

**CLEAN → ENABLE**

Accuracy: Febrero tiene rango 35-5=30 e IQR 25-10=15, mayores que 20 y 10 de enero. La mediana 15 no garantiza una observación exactamente 15, y el mínimo menor es febrero.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q30

**CLEAN → ENABLE**

Accuracy: Los CV son 7/70=0.10, 8/76≈0.1053 y 8/80=0.10. El mayor corresponde a B.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q31

**CLEAN → ENABLE**

Accuracy: Los z son Alice:0.012/0.563≈0.0213, Alana:0.016/0.463≈0.0346 y Axa:0.007/0.539≈0.0130. La mejor posición es Alana.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q32

**CLEAN → ENABLE**

Accuracy: A={5,7,11,13}, por lo que tiene cuatro elementos. A y B son disjuntos, de modo que P(A∩B)=0 y I es falsa. Solo II.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q33

**CLEAN → ENABLE**

Accuracy: B∩C={10}, con probabilidad 1/11, no 1. D={12,13,14,15}, cuyo complemento tiene siete elementos, no cuatro. Ninguna verdadera.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q34

**CLEAN → ENABLE**

Accuracy: P(A)=4/11 y P(D)=4/11. Ambas expresiones dan P(Aᶜ)=7/11. Ambas verdaderas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q35

**CLEAN → ENABLE**

Accuracy: Las probabilidades son H:18/28≈0.643, K:20/27≈0.741 y M:18/24=0.75. La mayor corresponde a M.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q36

**CLEAN → ENABLE**

Accuracy: Las probabilidades de no preferir voleibol son H:18/28≈0.643, K:18/27≈0.667, M:16/24≈0.667. La menor es H.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q37

**CLEAN → ENABLE**

Accuracy: Mujer activa y hombre sedentario son categorías disjuntas con 15+12=27 personas de 57. P=27/57.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c1-statistics-1-q38

**CLEAN → ENABLE**

Accuracy: Mujer o persona activa suma 26+34-15=45 personas de 57. P=45/57.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q01

**CLEAN → ENABLE**

Accuracy: El denominador excluye cero; el numerador se anula en -1 y 1. D={-1,1}, así que I y II son verdaderas y III falsa.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q02

**CLEAN → ENABLE**

Accuracy: La tabla A asigna a x=2 dos imágenes distintas, 2 y 3. El gráfico B supera la prueba de recta vertical y C asigna -3 y 3 a cero. Solo A no es función.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q03

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ámbito de la gráfica es [-2,∞), cuyo complemento es (-∞,-2). Las otras opciones incluyen un hueco del dominio o un intervalo no inyectivo.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: La opción B original imponía 2<y<-2, un conjunto vacío. Se corrigió a y<-2, complemento inequívoco del ámbito [-2,+∞) observado en la figura.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q04

**CLEAN → ENABLE**

Accuracy: y=(8-4x)/12=2/3-x/3 implica x=2-3y. La inversa es -3x+2.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q05

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ámbito de la inversa es el dominio original [8,∞).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q06

**CLEAN → ENABLE**

Accuracy: La gráfica da f(3)=4 y p(x)=x+2, por lo que p(f(3))=6.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q07

**CLEAN → ENABLE**

Accuracy: r tiene ámbito [-4,4], contenido en el dominio de p. p tiene ámbito [-2,6], que no queda en el dominio de r. h(p(0))=h(2)=3, no 2. Solo C.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q08

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Multiplicar √(x+1) por 5 no es una traslación vertical; sumar 5 sí es traslación, no homotecia. √x se obtiene trasladando √(x+1) una unidad a la derecha. Solo 2.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauraron los radicandos completos indicados por las barras de la fuente.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q09

**CLEAN → ENABLE**

Accuracy: La parábola abre hacia arriba y su vértice está por debajo del eje X; corta X dos veces.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q10

**CLEAN → ENABLE**

Accuracy: El vértice es (5,-3), con apertura hacia arriba, y ambos ceros son positivos. Para todo x∈(-6,0), la gráfica está arriba del eje X.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q11

**CLEAN → ENABLE**

Accuracy: 0=2x/3+1 implica x=-3/2; intersección=(-3/2,0).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q12

**BLOCKER → KEEP DISABLED**

Accuracy: El texto declara g⁻¹(x)=logₐ(x) y g(8)=3. Entonces a^8=3 y ninguna de las tres opciones es un punto de la inversa. Si se pretendía g(x)=logₐ(x), la respuesta cambiaría; la fuente debe aclararse.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: El texto declara g⁻¹(x)=logₐ(x) y g(8)=3. Entonces a^8=3 y ninguna de las tres opciones es un punto de la inversa. Si se pretendía g(x)=logₐ(x), la respuesta cambiaría; la fuente debe aclararse.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2024-c2-functions-2-q13

**CLEAN → ENABLE**

Accuracy: Si 0<a<1 y x<0, a^x=1/a^(-x)>1. El ámbito sigue siendo positivo y la inversa conserva la base a<1.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q14

**CLEAN → ENABLE**

Accuracy: u(x)=100x-0.5x² tiene máximo en x=100. u(100)=5000.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q15

**CLEAN → ENABLE**

Accuracy: 4a+2p=78000 y 2a+6p=84000 dan a=15000 y p=9000 colones.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q16

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: m(0)=64. A las 3 h quedan 64/8=8 mg, por lo que se eliminaron 56 mg. A las 4 h queda 1/16 de la dosis inicial. Solo B.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q17

**CLEAN → ENABLE**

Accuracy: Equilibrio: 600x=350x+20000, de donde x=80.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q18

**CLEAN → ENABLE**

Accuracy: La tabla A cumple f(x)=3log₂(x); B es lineal y C exponencial. Solo A es logarítmica.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q19

**CLEAN → ENABLE**

Accuracy: I sigue y=2√x; II sigue y=(1/2)^x; III sigue y=x². Orden: raíz cuadrada, exponencial, cuadrática.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-functions-2-q20

**CLEAN → ENABLE**

Accuracy: Comienza con 1000 ml y pierde 20 ml por minuto: s(x)=1000-20x, para 0≤x≤50.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q39

**CLEAN → ENABLE**

Accuracy: Centro (-3,-3), radio 3: (x+3)²+(y+3)²=9.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q40

**CLEAN → ENABLE**

Accuracy: Respecto de (1,2), las distancias² de A,B,C son 8,17,13. Solo A cumple distancia²<9.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q41

**CLEAN → ENABLE**

Accuracy: Centro (0,1), r=5: x²+(y-1)²=25.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q42

**CLEAN → ENABLE**

Accuracy: El centro es (0,-3), radio 4. La vertical x=4 está a distancia 4 y es tangente.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q43

**CLEAN → ENABLE**

Accuracy: La distancia de (-2,1) a x-y+1=0 es 2/√2=√2<2. La recta es secante.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q44

**CLEAN → ENABLE**

Accuracy: r es tangente en A, por lo que es perpendicular al radio OA.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q45

**CLEAN → ENABLE**

Accuracy: El centro (-1,3) baja a (-1,1), con r²=4. La ecuación es (x+1)²+(y-1)²=4.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q46

**CLEAN → ENABLE**

Accuracy: El centro (-1,3) se traslada (-4,1) a (-5,4). La ecuación es (x+5)²+(y-4)²=4.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q47

**CLEAN → ENABLE**

Accuracy: FEDH tiene área 3·3=9, no 12. BEDC tiene área (7+6)·3/2=19.5, no 25.5. Los lados del contorno suman 5+3+3+6+3+√10=20+√10. Solo C.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q48

**CLEAN → ENABLE**

Accuracy: n-3=2 implica cinco lados. Perímetro=5·8=40.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q49

**CLEAN → ENABLE**

Accuracy: Ángulo central 60° implica hexágono. Con radio 8, P=48. Con apotema 3√3, lado=6 y área=54√3. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q50

**CLEAN → ENABLE**

Accuracy: En I el cuadrado de radio 2√2 tiene lado 4 y área 16, no 18. En II el ángulo interno 144° implica diez lados y perímetro 30, no 48. Ninguna verdadera.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q51

**CLEAN → ENABLE**

Accuracy: La recta EF es horizontal y=1. La reflexión respecto de ella intercambia H(-1,3) con J(-1,-1), y fija E y F.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q52

**CLEAN → ENABLE**

Accuracy: Un octágono regular tiene ocho ejes de simetría: cuatro por vértices opuestos y cuatro por puntos medios de lados opuestos.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q53

**CLEAN → ENABLE**

Accuracy: La reflexión respecto de y=x intercambia M(-2,2) y O(2,-2), mientras fija N(4,4) y P(-4,-4). Es un eje de simetría.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q54

**CLEAN → ENABLE**

Accuracy: La rotación de 180° y la homotecia de razón -1 coinciden y envían la figura 1 a la 3. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q55

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: E=(3,2). Su reflexión en y=0 es (3,-2).
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizó el separador de coordenadas de la opción C (3.-2) a (3,-2).
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q56

**CLEAN → ENABLE**

Accuracy: La traslación de la figura 1 a la 2 es (-7,1): E(3,2)→N(-4,3), F(3,5)→Q(-4,6), G(6,7)→P(-1,8), H(6,4)→S(-1,5).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q57

**CLEAN → ENABLE**

Accuracy: El corte perpendicular a la base sin pasar por el vértice produce una hipérbola.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q58

**CLEAN → ENABLE**

Accuracy: El corte oblicuo de un cilindro sin tocar las bases produce una elipse.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q59

**CLEAN → ENABLE**

Accuracy: El radio basal es 6 y el corte está a mitad de altura, por lo que el radio es 3 y la longitud es 6π.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-geometry-2-q60

**CLEAN → ENABLE**

Accuracy: Radio OK=10 y distancia OE=6 dan radio de sección 8 y perímetro 16π. M,O,K son colineales y M,K pertenecen a la esfera, por lo que MK es diámetro. Ambas verdaderas.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q21

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Las marcas 4,8,12 con frecuencias 4,6,10 dan (16+48+120)/20=9.2 horas.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó que el promedio de datos agrupados se estima mediante marcas de clase; no se alteraron datos ni alternativas.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q22

**CLEAN → ENABLE**

Accuracy: La nota ponderada es 70·0.35+76·0.25+100·0.25+80·0.15=80.5.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q23

**CLEAN → ENABLE**

Accuracy: El resumen de B es simétrico: mínimo 90, Q1 94, mediana 98, Q3 102, máximo 106, media y moda 98. Tiende a la simetría.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q24

**BLOCKER → KEEP DISABLED**

Accuracy: Se anuncian 15 partidos del equipo A, pero solo se suministran 14 puntajes. El dato faltante puede cambiar la variabilidad y no debe inventarse; recuperar el puntaje antes de comparar.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Se anuncian 15 partidos del equipo A, pero solo se suministran 14 puntajes. El dato faltante puede cambiar la variabilidad y no debe inventarse; recuperar el puntaje antes de comparar.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2024-c2-statistics-2-q25

**CLEAN → ENABLE**

Accuracy: La desviación de Luis es √(8/5)≈1.265 y la de Omar √(10/5)≈1.414. Según la desviación estándar, Omar tiene mayor variabilidad.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q26

**CLEAN → ENABLE**

Accuracy: El rango L es 46, M es 100-60=40 y K es 92-72=20. Sus IQR son 23,18,10, respectivamente. L es mayor por ambas medidas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q27

**CLEAN → ENABLE**

Accuracy: B tiene mediana 70, inferior al aprobado 80; A tiene mediana 80 y C mínimo 80. C tiene el menor rango e IQR. A tiene el mayor rango (100-50=50). Las tres afirmaciones son las previstas por los cuartiles.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q28

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: La mediana de Alajuela es 26°C, igual al máximo de Cartago. Por tanto, al menos la mitad de temperaturas de Alajuela igualan o superan dicho máximo. Los cuartiles no garantizan observaciones exactamente 23°C.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó igualan o superan en vez de superan: la mediana de Alajuela coincide con el máximo de Cartago (26°C). La versión original exigía una desigualdad estricta no garantizada.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q29

**CLEAN → ENABLE**

Accuracy: Alajuela tiene rango 32-20=12 e IQR 29-23=6, menores que 26-10=16 y 23-15=8 de Cartago. Presenta menor variabilidad.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q30

**CLEAN → ENABLE**

Accuracy: Los CV son D:8/89≈0.0899, E:9/91≈0.0989 y F:7/70=0.10. El mayor es F.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q31

**CLEAN → ENABLE**

Accuracy: Los z son D:1/8=0.125, E:-1/9≈-0.111 y F:0. El mejor es el estudiante de D.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q32

**CLEAN → ENABLE**

Accuracy: Todo elemento del espacio muestral es par o impar; A∪B=E y su probabilidad es 1.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q33

**CLEAN → ENABLE**

Accuracy: La probabilidad de la unión es P(B)+P(D)-P(B∩D). Aquí D={5} está contenido en B, de modo que omitir la intersección daría un valor incorrecto.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q34

**CLEAN → ENABLE**

Accuracy: La regla del complemento es P(Cᶜ)=1-P(C). C tiene 9 de 12 resultados, por lo que la respuesta no coincide con P(C) ni con 1-P(Cᶜ).
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q35

**CLEAN → ENABLE**

Accuracy: Blanco o negro tiene probabilidades R:12/22, S:14/18, T:7/14. La mayor es la de S.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q36

**CLEAN → ENABLE**

Accuracy: No negro tiene probabilidades R:18/22, S:12/18, T:10/14. La mayor es R.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q37

**CLEAN → ENABLE**

Accuracy: Bribrí y cabécar no se intersectan en el diagrama. Su intersección tiene probabilidad cero.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2024-c2-statistics-2-q38

**CLEAN → ENABLE**

Accuracy: Las regiones que hablan exactamente dos idiomas contienen 4+7=11 de 57 personas. P=11/57.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q23

**CLEAN → ENABLE**

Accuracy: El denominador excluye -1 y la única raíz válida del numerador es 1. D={1}, de modo que {1}⊂D es la opción correcta bajo la inclusión no estricta usada por la fuente.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q24

**CLEAN → ENABLE**

Accuracy: La tabla A asigna exactamente un valor a cada entrada, aun cuando todas las imágenes son 1. El gráfico B no supera la prueba de recta vertical y g:ℤ→ℤ,(x+1)/2 no envía los enteros pares a enteros.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q25

**BLOCKER → KEEP DISABLED**

Accuracy: No se suministran los conjuntos A y B ni una definición suficiente de sus dominios. Las expresiones f:A→ℝ y g:B→ℝ no permiten elegir el subconjunto indicado. Se deben recuperar los intervalos originales.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: No se suministran los conjuntos A y B ni una definición suficiente de sus dominios. Las expresiones f:A→ℝ y g:B→ℝ no permiten elegir el subconjunto indicado. Se deben recuperar los intervalos originales.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2025-c1-functions-1-q26

**BLOCKER → KEEP DISABLED**

Accuracy: Tanto x<0 como x≥0 hacen inyectiva a f(x)=x² en el dominio restringido. Las alternativas A y B garantizan una inversa; se debe reformular una de ellas o permitir selección múltiple.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Tanto x<0 como x≥0 hacen inyectiva a f(x)=x² en el dominio restringido. Las alternativas A y B garantizan una inversa; se debe reformular una de ellas o permitir selección múltiple.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2025-c1-functions-1-q27

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ámbito de la inversa coincide con el dominio original [9,∞).
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q28

**CLEAN → ENABLE**

Accuracy: r(x)=-x²+4 en [-2,2] tiene ámbito [0,4], contenido en el dominio de p. En cambio p tiene ámbito [0,4], no contenido en [-2,2]. p(f(-2))=0, no 4. Solo A.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q29

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: 5√x modifica la escala, no es una traslación horizontal. √x+1 es traslación vertical y √(x+1) es traslación horizontal, no homotecia en el origen. Solo 2.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se restauró la notación matemática de la fuente (radicando, exponente o coordenada) antes de resolver.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q30

**CLEAN → ENABLE**

Accuracy: La parábola corta al eje X en 0 y 2: tiene dos ceros.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q31

**CLEAN → ENABLE**

Accuracy: La parábola abre hacia abajo y es positiva estrictamente entre sus ceros: (0,2).
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q32

**CLEAN → ENABLE**

Accuracy: 0=2x+6 implica x=-3; la intersección es (-3,0).
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q33

**CLEAN → ENABLE**

Accuracy: logₐ(16)=4 implica a=2. La inversa es 2ˣ, que contiene (1,2).
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q34

**CLEAN → ENABLE**

Accuracy: Si a>1 y x<0, a^x=1/a^(-x)<1. El cero no pertenece al ámbito y la inversa mantiene base a>1.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q35

**CLEAN → ENABLE**

Accuracy: El máximo de -0.001x²+57x ocurre en x=28500. La utilidad máxima es 57²/(4·0.001)=812250 dólares.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q36

**CLEAN → ENABLE**

Accuracy: 2c+3t=4800 y 3c+2t=4900 dan c=1020 y t=920 colones.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q37

**CLEAN → ENABLE**

Accuracy: 320000/10000=32=a⁵, por lo que a=2. P(6)=10000·2⁶=640000.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q38

**CLEAN → ENABLE**

Accuracy: Ganancia=600x-(400x+30000)=200x-30000. Igualarla a 10000 da x=200.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q39

**CLEAN → ENABLE**

Accuracy: La tabla B sigue y=2log₂(x); A es lineal y C sigue una exponencial desplazada. Solo B es logarítmica.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q40

**CLEAN → ENABLE**

Accuracy: I cumple y=0.5√x y II cumple y=2ˣ: raíz cuadrada y exponencial.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q41

**CLEAN → ENABLE**

Accuracy: I cumple r=x-2 y II cumple k=-x². Orden: lineal y cuadrática.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-functions-1-q42

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: Con x meses transcurridos desde el depósito inicial de enero, a(x)=2000+200x. En diciembre x=11 y a(11)=4200.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se precisó el origen temporal x=0 en enero; no cambia el modelo ni el saldo de diciembre.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q01

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El centro es (0,-3) y el radio es 3; por tanto x²+(y+3)²=9. Las otras opciones tienen otro centro.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Corrección explícita de C: el término derecho 0 se sustituyó por 9, determinado inequívocamente por el centro (0,-3) y el radio 3 de la figura fuente.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q02

**CLEAN → ENABLE**

Accuracy: La forma (x-h)²+(y-k)²=r², con (h,k)=(1,0) y r=4, da (x-1)²+y²=16.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q03

**CLEAN → ENABLE**

Accuracy: Respecto de (-2,1), las distancias al cuadrado de A, B y C son 9, 4 y 2. Solo 9 es mayor que r²=5.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q04

**CLEAN → ENABLE**

Accuracy: El centro es (0,-1), r=2. La distancia a x=-2 es 2, igual al radio; la recta es tangente.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q05

**CLEAN → ENABLE**

Accuracy: El centro es (2,3), r=1. Su distancia a x+y=0 es 5/√2>1, de modo que la recta es exterior.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q06

**BLOCKER → KEEP DISABLED**

Accuracy: Las opciones A y B son verdaderas: r y d son paralelas y la tangente d es perpendicular al radio OD. La pregunta exige una única respuesta. Se debe reformular una alternativa con evidencia matemática.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: Las opciones A y B son verdaderas: r y d son paralelas y la tangente d es perpendicular al radio OD. La pregunta exige una única respuesta. Se debe reformular una alternativa con evidencia matemática.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2025-c1-geometry-1-q07

**CLEAN → ENABLE**

Accuracy: A=(4,2) y B=(-4,2). El desplazamiento es (-8,0): ocho unidades hacia la izquierda.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q08

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: C=(5,-2) y B=(-4,2). B-C=(-9,4): nueve unidades hacia la izquierda y cuatro hacia arriba.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se corrigió el centro inicial B por C: el original pedía trasladar B a sí misma, mientras todas las alternativas exigen desplazamiento a la izquierda y arriba. C→B queda determinado por la figura y coincide únicamente con la opción B.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q09

**CLEAN → ENABLE**

Accuracy: Con B(8,9), A(-1,6), E(-1,1), D(9,1), C(4,6), la fórmula del área por coordenadas da 45 unidades cuadradas.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q10

**CLEAN → ENABLE**

Accuracy: Desde un vértice se trazan n-3=3 diagonales; n=6. En un hexágono regular el lado es igual al radio: P=6·3=18.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q11

**CLEAN → ENABLE**

Accuracy: El ángulo central de 90° implica un cuadrado. Una diagonal de 6 da área d²/2=36/2=18.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q12

**NON-BLOCKING ISSUE → ENABLE**

Accuracy: El ángulo interno de 60° implica un triángulo equilátero. Con apotema 2√3, el lado es 2a√3=12 y el área es (3·12·2√3)/2=36√3.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Issues: Se normalizó el radical sobrelineado de la fuente a LaTeX sin cambiar su valor.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q13

**CLEAN → ENABLE**

Accuracy: El rectángulo de vértices (-2,2),(2,2),(2,-3),(-2,-3) tiene dos ejes de simetría, x=0 e y=-0.5; no es un cuadrado.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q14

**CLEAN → ENABLE**

Accuracy: La reflexión (x,y)→(-y,-x) fija N(-4,4) y P(3,-3) e intercambia M(2,2) con O(-2,-2). Su eje es y=-x.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q15

**CLEAN → ENABLE**

Accuracy: La reflexión respecto de y=x transforma (x,y) en (y,x), enviando A,B,C,D a A′,B′,C′,D′ respectivamente.
Answer: B
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q16

**CLEAN → ENABLE**

Accuracy: F=(-1,-2). Reflejar en y=-x aplica (x,y)→(-y,-x), de donde F′=(2,1).
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q17

**CLEAN → ENABLE**

Accuracy: Con F=(-1,-2) y centro en el origen, la homotecia de razón -2 da F′=(2,4).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q18

**CLEAN → ENABLE**

Accuracy: E=(-2,-1); al trasladar se obtiene (1,-2). Una rotación antihoraria de 90° envía (x,y) a (-y,x), de donde (2,1).
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q19

**CLEAN → ENABLE**

Accuracy: Si H es la altura total, por semejanza 3/5=(H-4)/H. Así 3H=5H-20 y H=10.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q20

**CLEAN → ENABLE**

Accuracy: El radio de la esfera es 5. El radio de la sección es √(25-9)=4 y su longitud es 2π·4=8π.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q21

**CLEAN → ENABLE**

Accuracy: Un corte de un cono circular recto paralelo a su base produce una sección circular, cuya frontera es una circunferencia.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-geometry-1-q22

**CLEAN → ENABLE**

Accuracy: El radio es 20 y la distancia del plano al eje es 12. El ancho del corte es 2√(20²-12²)=32. Su área es 32·40=1280 pulgadas cuadradas.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q43

**CLEAN → ENABLE**

Accuracy: La nota final cumple 0.30·65+0.20·95+0.50p=80. Así 38.5+0.5p=80 y p=83.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q44

**CLEAN → ENABLE**

Accuracy: El primer cuartil es 700 g, por lo que al menos el 75% de las masas son de 700 g o más. Ni la media implica un dato igual a ella ni se sabe que la mayoría pese 800 g.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q45

**CLEAN → ENABLE**

Accuracy: El intervalo por encima de la mediana es más amplio que el inferior: 2400-900=1500 frente a 900-500=400. También Q3-Me=500>Me-Q1=200; la asimetría es positiva.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q46

**CLEAN → ENABLE**

Accuracy: El rango de A es 94-43=51 y el de B es 100-49=51. Sus recorridos intercuartílicos también coinciden: 89-68=21 y 95-74=21.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q47

**BLOCKER → KEEP DISABLED**

Accuracy: La pregunta compara cantidades de aprobados sin informar los tamaños de los grupos. La proporción de aprobados puede compararse, pero las cantidades absolutas no. Es necesario precisar proporción o suministrar tamaños.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: La pregunta compara cantidades de aprobados sin informar los tamaños de los grupos. La proporción de aprobados puede compararse, pero las cantidades absolutas no. Es necesario precisar proporción o suministrar tamaños.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2025-c1-statistics-1-q48

**CLEAN → ENABLE**

Accuracy: La desviación poblacional de Ana es √((4+1+1)/3)=√2≈1.41; la de Ruth es √((1+0+1)/3)≈0.82. Ana tiene mayor variabilidad.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q49

**CLEAN → ENABLE**

Accuracy: Ambos terceros cuartiles son 46 min. Por ello al menos un 25% de los recorridos de cada autobús duran 46 min o más. Una mediana no garantiza un dato exactamente igual a ella.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q50

**CLEAN → ENABLE**

Accuracy: El máximo observado es 55 min para ambos autobuses; ese máximo corresponde a al menos un recorrido de cada uno.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q51

**BLOCKER → KEEP DISABLED**

Accuracy: No se especifica la medida de variabilidad: los rangos son iguales (55-24=31), pero los recorridos intercuartílicos difieren (A:17.5; B:8.5). Las alternativas A y B resultan defendibles según la medida. Se debe precisar la medida antes de designar la respuesta.
Answer: No unique reliable answer can be designated from the supplied content.
Explanation: Withheld; a solution must follow the corrected premise/options.
Visual specification: Source visual and associated mathematical conditions checked where applicable; see exact defect.
Formatting: No separate formatting blocker beyond the defect described.
Issues: No se especifica la medida de variabilidad: los rangos son iguales (55-24=31), pero los recorridos intercuartílicos difieren (A:17.5; B:8.5). Las alternativas A y B resultan defendibles según la medida. Se debe precisar la medida antes de designar la respuesta.
Rationale: Substantive defect makes the student-facing question unreliable; correction required before enablement.

### bxm-raw-2025-c1-statistics-1-q52

**CLEAN → ENABLE**

Accuracy: Los coeficientes de variación son 4.8/174≈2.759%, 4.6/170≈2.706% y 4.7/180≈2.611%. El menor corresponde a 8C.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q53

**CLEAN → ENABLE**

Accuracy: Las puntuaciones z de los estudiantes son 0/4.8=0, 1/4.6≈0.217 y -2/4.7≈-0.426. La mayor posición relativa corresponde a 8B.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q54

**CLEAN → ENABLE**

Accuracy: De los once números de E, solo 8 y 12 son divisibles entre 4. La probabilidad es 2/11.
Answer: A
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q55

**CLEAN → ENABLE**

Accuracy: Los números mayores que 12 son 13,15,17: tres resultados entre once, con probabilidad 3/11.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q56

**CLEAN → ENABLE**

Accuracy: Todo número entero de E es par o impar. La unión es todo el espacio muestral y tiene probabilidad 1.
Answer: C
Explanation: Independently authored and checked.
Visual specification: N/A; all essential data in the prompt.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q57

**CLEAN → ENABLE**

Accuracy: Las probabilidades de anís o fresa son 10/18, 8/10 y 5/14. La mayor es 8/10, en la urna E.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q58

**CLEAN → ENABLE**

Accuracy: Las probabilidades de menta o fresa son 12/18, 7/10 y 12/14. La mayor es 12/14, en la urna F.
Answer: C
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q59

**CLEAN → ENABLE**

Accuracy: Las regiones que hablan al menos dos idiomas suman 4+3+11+2=20. El total es 53 y la probabilidad es 20/53.
Answer: A
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.

### bxm-raw-2025-c1-statistics-1-q60

**CLEAN → ENABLE**

Accuracy: La región exclusivamente bribrí y español tiene 11 personas, excluyendo las dos trilingües. La probabilidad es 11/53.
Answer: B
Explanation: Independently authored and checked.
Visual specification: Verified SVG/table composite.
Formatting: Passed actual TextRenderer/VisualRenderer desktop and mobile rendering checks; no material interpretation defect.
Rationale: Unique answer; complete data and materially correct reasoning.
