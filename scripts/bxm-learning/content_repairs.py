"""Versioned editorial corrections applied by the authored-pack compiler."""

def normalize_text(value):
    if isinstance(value, str):
        return value.replace('\\\\', '\\').replace('\\n', '\n')
    if isinstance(value, list):
        return [normalize_text(v) for v in value]
    if isinstance(value, dict):
        return {k: normalize_text(v) for k, v in value.items()}
    return value

def repair_lessons(lessons):
    for lesson in lessons:
        if lesson['interactiveVisualType'] == 'sphere_cross_section':
            lesson['coreExplanation'] = lesson['coreExplanation'].replace(
                'la sección plana resultante es **siempre una circunferencia** (o círculo).',
                'si $d<R$ se obtiene una sección circular; si $d=R$, un punto de tangencia; si $d>R$, no hay intersección.')
        if lesson['domain'] == 'functions':
            lesson['coreExplanation'] = lesson['coreExplanation'].replace(
                'una relación de proporcionalidad y variación constante', 'una relación de variación constante (proporcional solo si el intercepto es cero)')
        if lesson['domain'] == 'statistics':
            lesson['workedExample']['primaryMethod']['steps'][-1] = (
                'Las distancias de la mediana a ambos extremos de la caja son $12.5$. '
                'Las dos mitades de la caja tienen igual amplitud; esto no demuestra simetría de toda la distribución.')
            quiz = lesson['microQuiz'][0]
            quiz['question'] = 'En la lectura aproximada de un diagrama de cajas, ¿qué porcentaje acumulado corresponde al tercer cuartil $Q_3$?'
            quiz['explanation'] = 'El tercer cuartil corresponde aproximadamente al percentil 75; los empates pueden afectar las proporciones estrictas.'
        lesson.update(normalize_text(lesson))

def apply_repairs(items):
    for item in items:
        suffix = item['id'].removeprefix('bxm-authored-v1-')
        remap = {
            'geo-002': 'A1.3', 'geo-003': 'A1.3', 'geo-004': 'A3.1', 'geo-009': 'A1.3',
            'func-007': 'A2.1', 'func-008': 'A3.1', 'func-009': 'A3.1',
            'stat-003': 'A3.1', 'stat-004': 'A1.2', 'stat-006': 'A1.3',
            'stat-007': 'A1.4', 'stat-008': 'A3.1', 'stat-009': 'A3.1', 'stat-010': 'A3.1',
        }
        if suffix in remap:
            item['evidenceCode'] = remap[suffix]
            item['evidenceKey'] = f"bxm/matematica/02-2026/{item['domain']}/{remap[suffix]}"
        families = {
            'geo-001': 'bxm-iso-geo-circ-canon', 'geo-006': 'bxm-iso-geo-sphere-cut',
            'func-003': 'bxm-iso-func-slope-intercept', 'stat-003': 'bxm-iso-stat-ric-box',
        }
        item['familyId'] = families.get(suffix, 'bxm-fixed-' + suffix)
        item['templateVersion'] = '1.1.0'
        if suffix == 'stat-009':
            item['stem'] = ('En un grupo de 8 personas, las edades son: $18, 19, 20, 22, 24, 25, 28, 36$. '
                            'Usando la mediana de cada mitad para calcular los cuartiles, '
                            '¿cuál es la diferencia entre el rango total y el recorrido intercuartílico?')
            item['options'] = {'A': '$11$', 'B': '$18$', 'C': '$7$', 'D': '$25$'}
            item['solutionSteps'] = [
                'Rango: $36 - 18 = 18$.',
                'Mitad inferior: $18,19,20,22$; $Q_1=(19+20)/2=19.5$.',
                'Mitad superior: $24,25,28,36$; $Q_3=(25+28)/2=26.5$.',
                '$\\mathrm{RIC}=26.5-19.5=7$. Diferencia: $18-7=11$.',
            ]
            item['distractorRationale']['C'] = 'Usó solo el RIC, sin restarlo del rango.'
            item['distractorRationale']['D'] = 'Sumó el rango y el RIC.'
        if suffix == 'stat-006':
            item['stem'] = ('Una distribución unimodal de estaturas presenta una cola más extendida hacia '
                            'los valores pequeños. ¿Qué tipo de asimetría describe esta forma?')
            item['solutionSteps'] = ['Una cola extendida hacia los valores pequeños define asimetría negativa (hacia la izquierda).',
                                     'La comparación de media y mediana por sí sola no demuestra la forma de una distribución.']
        if suffix == 'geo-005':
            item['stem'] = item['stem'].replace('una esfera con un plano', 'la superficie de una esfera con un plano').replace('como sección plana', 'como curva de intersección')
