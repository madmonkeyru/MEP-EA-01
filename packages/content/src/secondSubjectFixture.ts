import type { AssessmentBlueprint, ContentStream, CurriculumTaxonomy, Question } from '@mep-ea/domain';
import type { ContentRegistry } from './index';

/**
 * P9 Second-Subject Architectural Fixture:
 * Program: BXM (Bachillerato por Madurez Suficiente)
 * Subject: Educación Cívica
 * Convocatoria: 02-2026
 *
 * Demonstrates:
 * 1. Non-mathematical humanities curriculum: text-based stems, scenario/case evaluations.
 * 2. Distinct domains:
 *    - regímenes-politicos: Las personas jóvenes aprendemos de los regímenes políticos (Quotas: 4 diag/mock, 20 sim)
 *    - sistema-democratico: Participemos en el fortalecimiento de la organización democrática (Quotas: 4 diag/mock, 20 sim)
 *    - sistema-electoral: Mi participación fortalece el sistema electoral (Quotas: 4 diag/mock, 20 sim)
 * 3. Complete taxonomy with programs, subjects, domains, concepts, evidences, and curriculumVersions.
 * 4. Blueprints for diagnostic (12 items), mock (12 items), and benchmark simulation (60 items).
 * 5. Full pedagogical loop execution: evidence -> attempt -> score -> mastery -> remediation -> longitudinal metrics.
 */

export const civicaTaxonomy: CurriculumTaxonomy = {
  programs: [
    { id: 'bxm', name: 'Bachillerato por Madurez Suficiente', subjectIds: ['civica', 'matematica'] },
  ],
  subjects: [
    { id: 'civica', programId: 'bxm', name: 'Educación Cívica' },
  ],
  curriculumVersions: [
    {
      id: 'bxm-civica-02-2026',
      programId: 'bxm',
      subjectId: 'civica',
      version: '02-2026',
      effectiveFrom: '2026-01-01',
      sourceReference: 'project_docs/program_official_pdfs/Specification tables 2026 #2/BXM/EDUCACION-CIVICA-TABLA-ESPECIFICACIONES-BXM-02-2026.pdf',
      status: 'active',
    },
  ],
  domains: [
    { id: 'regimenes-politicos', subjectId: 'civica', name: 'Las personas jóvenes aprendemos de los regímenes políticos', curriculumVersionId: 'bxm-civica-02-2026' },
    { id: 'sistema-democratico', subjectId: 'civica', name: 'Participemos en el fortalecimiento del sistema democrático', curriculumVersionId: 'bxm-civica-02-2026' },
    { id: 'sistema-electoral', subjectId: 'civica', name: 'Mi participación fortalece el sistema electoral', curriculumVersionId: 'bxm-civica-02-2026' },
  ],
  concepts: [
    { id: 'c-democracia-vs-autoritarismo', domainId: 'regimenes-politicos', name: 'Democracia y regímenes políticos contemporáneos', prerequisiteIds: [] },
    { id: 'c-cultura-democratica-cr', domainId: 'sistema-democratico', name: 'Valores y actitudes de la cultura democrática costarricense', prerequisiteIds: ['c-democracia-vs-autoritarismo'] },
    { id: 'c-proceso-electoral-tse', domainId: 'sistema-electoral', name: 'Estructura electoral y rol constitucional del TSE', prerequisiteIds: ['c-cultura-democratica-cr'] },
  ],
  evidences: [
    { id: 'bxm/civica/02-2026/regimenes/E1.1', domainId: 'regimenes-politicos', affirmationCode: 'A1.1', description: 'Reconoce conceptos básicos, características, fortalezas y debilidades de los regímenes políticos', conceptIds: ['c-democracia-vs-autoritarismo'] },
    { id: 'bxm/civica/02-2026/regimenes/E1.2', domainId: 'regimenes-politicos', affirmationCode: 'A1.2', description: 'Distingue aportes del régimen democrático frente a modelos autoritarios y unipartidistas', conceptIds: ['c-democracia-vs-autoritarismo'] },
    { id: 'bxm/civica/02-2026/democratico/E2.1', domainId: 'sistema-democratico', affirmationCode: 'A2.1', description: 'Reconoce los valores fundamentales y la cultura pacifista derivados de la abolición del ejército', conceptIds: ['c-cultura-democratica-cr'] },
    { id: 'bxm/civica/02-2026/democratico/E2.2', domainId: 'sistema-democratico', affirmationCode: 'A2.2', description: 'Analiza mecanismos de rendición de cuentas, gobernabilidad y transparencia ciudadana', conceptIds: ['c-cultura-democratica-cr'] },
    { id: 'bxm/civica/02-2026/electoral/E3.1', domainId: 'sistema-electoral', affirmationCode: 'A3.1', description: 'Identifica la estructura organizativa y las garantías de imparcialidad del Tribunal Supremo de Elecciones', conceptIds: ['c-proceso-electoral-tse'] },
    { id: 'bxm/civica/02-2026/electoral/E3.2', domainId: 'sistema-electoral', affirmationCode: 'A3.2', description: 'Infiere la importancia de la participación ciudadana y de los partidos políticos en el sistema representativo', conceptIds: ['c-proceso-electoral-tse'] },
  ],
};

/** 12 Authored Questions: 4 per domain, representing real humanities items from the official practice booklet */
export const civicaAuthoredQuestions: Question[] = [
  // --- Domain: regímenes-politicos (4 items) ---
  {
    id: 'bxm-civ-auth-001',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'regimenes-politicos',
    evidenceId: 'bxm/civica/02-2026/regimenes/E1.1',
    conceptIds: ['c-democracia-vs-autoritarismo'],
    familyId: 'civ-fam-regimenes-unipartidismo',
    cognitiveLevel: 'reproduccion',
    stream: 'authored' as ContentStream,
    stem: 'Se refiere a un régimen político en el que un solo partido político ostenta el monopolio legítimo del poder del Estado, impidiendo la competencia electoral pluralista. ¿A cuál régimen político corresponde esta definición?',
    options: [
      { id: 'A', text: 'Unipartidismo', rationale: 'Definición correcta de concentración partidaria única del poder.' },
      { id: 'B', text: 'Monarquía parlamentaria', rationale: 'La monarquía parlamentaria cuenta con división de poderes y pluralismo de partidos.' },
      { id: 'C', text: 'Democracia directa', rationale: 'La democracia implica participación soberana plural del pueblo.' },
      { id: 'D', text: 'Federalismo', rationale: 'El federalismo es una forma territorial de organización estatal, no un monopolio partidario.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Identificar que el monopolio del poder por una sola fuerza política define al unipartidismo.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item4', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-002',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'regimenes-politicos',
    evidenceId: 'bxm/civica/02-2026/regimenes/E1.1',
    conceptIds: ['c-democracia-vs-autoritarismo'],
    familyId: 'civ-fam-regimenes-teocracia',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: 'En un país determinado, las máximas autoridades políticas derivan su mandato directamente de dogmas y textos religiosos sagrados, y los líderes eclesiásticos ejercen la jefatura del gobierno. ¿Cuál es la forma de régimen político descrita?',
    options: [
      { id: 'A', text: 'Teocracia', rationale: 'En la teocracia la autoridad suprema emana del orden o jerarquía religiosa.' },
      { id: 'B', text: 'República laica', rationale: 'Una república laica separa expresamente la religión del ejercicio del poder público.' },
      { id: 'C', text: 'Socialismo democrático', rationale: 'El socialismo democrático promueve equidad económica bajo instituciones democráticas.' },
      { id: 'D', text: 'Monarquía constitucional', rationale: 'La monarquía constitucional se rige por leyes civiles y constitucionales.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['El ejercicio del poder público por líderes religiosos con fundamento en libros sagrados caracteriza a la teocracia.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item7', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-003',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'regimenes-politicos',
    evidenceId: 'bxm/civica/02-2026/regimenes/E1.2',
    conceptIds: ['c-democracia-vs-autoritarismo'],
    familyId: 'civ-fam-regimenes-dictadura',
    cognitiveLevel: 'reflexion',
    stream: 'authored' as ContentStream,
    stem: '¿Cuál es una de las principales diferencias entre el régimen democrático y un régimen dictatorial respecto al ejercicio de los derechos humanos y libertades ciudadanas?',
    options: [
      { id: 'A', text: 'La democracia garantiza el control constitucional y la tutela efectiva de libertades fundamentales, mientras la dictadura subordina o suprime las libertades civiles.', rationale: 'Contraste central entre el Estado de derecho y la concentración arbitraria del poder.' },
      { id: 'B', text: 'Las dictaduras permiten elecciones libres periódicas sin supervisión estatal.', rationale: 'Las dictaduras bloquean o manipulan los comicios electorales.' },
      { id: 'C', text: 'La democracia prohíbe la existencia de partidos de oposición.', rationale: 'La democracia requiere y promueve el pluripartidismo.' },
      { id: 'D', text: 'Las dictaduras protegen plenamente la libertad de prensa y reunión.', rationale: 'La dictadura persigue y censura la prensa crítica.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Analizar que la tutela judicial y el respeto a la discrepancia distinguen a la democracia de la dictadura.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item11', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-004',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'regimenes-politicos',
    evidenceId: 'bxm/civica/02-2026/regimenes/E1.2',
    conceptIds: ['c-democracia-vs-autoritarismo'],
    familyId: 'civ-fam-regimenes-populismo',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: 'Un líder político promueve un discurso que divide tajantemente a la sociedad entre "el pueblo virtuoso" y "la élite corrupta", debilitando los contrapesos institucionales independientes. ¿A cuál estilo o rasgo político alude este fenómeno?',
    options: [
      { id: 'A', text: 'Populismo', rationale: 'La polarización maniquea pueblo vs élite es el rasgo definitorio del populismo.' },
      { id: 'B', text: 'Democracia deliberativa', rationale: 'La democracia deliberativa busca consensos racionales amplios.' },
      { id: 'C', text: 'Parlamentarismo clásico', rationale: 'El parlamentarismo se sustenta en mayorías parlamentarias y disciplina partidaria.' },
      { id: 'D', text: 'Gobernanza tecnocrática', rationale: 'La tecnocracia apela a criterios técnicos de gestión.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Reconocer los elementos discursivos del populismo frente a las instituciones republicanas.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item15', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },

  // --- Domain: sistema-democratico (4 items) ---
  {
    id: 'bxm-civ-auth-005',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-democratico',
    evidenceId: 'bxm/civica/02-2026/democratico/E2.1',
    conceptIds: ['c-cultura-democratica-cr'],
    familyId: 'civ-fam-democracia-ejercito',
    cognitiveLevel: 'reproduccion',
    stream: 'authored' as ContentStream,
    stem: 'En el año 1948, un hito histórico fundamental consolidó la cultura de paz en Costa Rica y permitió reasignar recursos hacia la salud y la educación pública. ¿Cuál fue este hito?',
    options: [
      { id: 'A', text: 'La abolición del ejército como institución permanente', rationale: 'La abolición del ejército en 1948 cimentó la vocación civilista del país.' },
      { id: 'B', text: 'La creación de la primera fuerza armada aérea', rationale: 'Contrario a la vocación de desarme civil de Costa Rica.' },
      { id: 'C', text: 'La disolución del Tribunal Electoral', rationale: 'El Tribunal Electoral se creó y fortaleció precisamente en esa época.' },
      { id: 'D', text: 'La implantación del servicio militar obligatorio', rationale: 'Costa Rica rechazó el servicio militar permanente.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Identificar la trascendencia civil y presupuestaria de la abolición del ejército en 1948.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item23', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-006',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-democratico',
    evidenceId: 'bxm/civica/02-2026/democratico/E2.1',
    conceptIds: ['c-cultura-democratica-cr'],
    familyId: 'civ-fam-democracia-valores',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: 'El principio democrático que establece que todas las personas nacen libres e iguales ante la ley, prohibiendo fueros o discriminaciones arbitrarias, corresponde a:',
    options: [
      { id: 'A', text: 'La igualdad política y jurídica', rationale: 'Garantía básica establecida en el artículo 33 de la Constitución Política.' },
      { id: 'B', text: 'El autoritarismo estatal', rationale: 'El autoritarismo impone privilegios y suprime la igualdad.' },
      { id: 'C', text: 'El sufragio censitario', rationale: 'El sufragio censitario limitaba el voto por riqueza o propiedad.' },
      { id: 'D', text: 'La discrecionalidad ejecutiva', rationale: 'La discrecionalidad no garantiza igualdad de derechos.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Relacionar el valor de la igualdad jurídica y política como pilar de la convivencia democrática.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item28', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-007',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-democratico',
    evidenceId: 'bxm/civica/02-2026/democratico/E2.2',
    conceptIds: ['c-cultura-democratica-cr'],
    familyId: 'civ-fam-democracia-transparencia',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: 'La obligación legal y ética que tienen los jerarcas y funcionarios públicos de informar periódicamente a la ciudadanía sobre sus decisiones, gastos presupuestarios y resultados de gestión se denomina:',
    options: [
      { id: 'A', text: 'Rendición de cuentas', rationale: 'Mecanismo republicano fundamental para evitar abusos y garantizar control.' },
      { id: 'B', text: 'Secreto de Estado irrestricto', rationale: 'El secretismo vulnera el principio de transparencia.' },
      { id: 'C', text: 'Inmunidad administrativa total', rationale: 'La inmunidad total contradice la responsabilidad funcionarial.' },
      { id: 'D', text: 'Centralismo deliberativo', rationale: 'Término no asociado con la fiscalización presupuestaria ciudadana.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Identificar que la transparencia y reporte periódico configuran la rendición de cuentas.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item35', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-008',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-democratico',
    evidenceId: 'bxm/civica/02-2026/democratico/E2.2',
    conceptIds: ['c-cultura-democratica-cr'],
    familyId: 'civ-fam-democracia-gobernabilidad',
    cognitiveLevel: 'reflexion',
    stream: 'authored' as ContentStream,
    stem: '¿Por qué la legitimidad de origen (obtenida en elecciones limpias) y la eficacia de gestión son ambas indispensables para asegurar la gobernabilidad democrática?',
    options: [
      { id: 'A', text: 'Porque un gobierno electo democráticamente requiere responder efectivamente a las demandas de la población para mantener la confianza ciudadana en las instituciones.', rationale: 'La gobernabilidad articula legitimidad de origen con capacidad de respuesta.' },
      { id: 'B', text: 'Porque las elecciones limpias eximen al gobierno de dar explicaciones o cumplir metas.', rationale: 'El mandato popular no otorga un cheque en blanco.' },
      { id: 'C', text: 'Porque la eficacia sólo puede conseguirse clausurando el debate parlamentario.', rationale: 'El debate parlamentario es esencia de la democracia.' },
      { id: 'D', text: 'Porque el descontento ciudadano carece de relevancia si las urnas fueron vigiladas.', rationale: 'La satisfacción ciudadana es clave para la paz social.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Analizar el concepto integral de gobernabilidad democrática vinculando legitimidad y resultados.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item39', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },

  // --- Domain: sistema-electoral (4 items) ---
  {
    id: 'bxm-civ-auth-009',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-electoral',
    evidenceId: 'bxm/civica/02-2026/electoral/E3.1',
    conceptIds: ['c-proceso-electoral-tse'],
    familyId: 'civ-fam-electoral-tse-rango',
    cognitiveLevel: 'reproduccion',
    stream: 'authored' as ContentStream,
    stem: 'En el diseño constitucional costarricense, el Tribunal Supremo de Elecciones (TSE) ostenta un rango e independencia equiparable a:',
    options: [
      { id: 'A', text: 'Los Supremos Poderes del Estado en materia electoral', rationale: 'La Constitución dota al TSE de rango e independencia absoluta para organizar elecciones.' },
      { id: 'B', text: 'Una dirección subordinada al Ministerio de Gobernación', rationale: 'El TSE es completamente autónomo del Poder Ejecutivo.' },
      { id: 'C', text: 'Una comisión transitoria del Poder Legislativo', rationale: 'El TSE es un órgano constitucional permanente.' },
      { id: 'D', text: 'Un tribunal de arbitraje comercial privado', rationale: 'Es un tribunal público soberano.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Identificar la jerarquía constitucional del Tribunal Supremo de Elecciones.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item44', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-010',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-electoral',
    evidenceId: 'bxm/civica/02-2026/electoral/E3.1',
    conceptIds: ['c-proceso-electoral-tse'],
    familyId: 'civ-fam-electoral-funciones-tse',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: '¿Cuál de las siguientes es una función exclusiva encomendada por la Constitución Política al Tribunal Supremo de Elecciones?',
    options: [
      { id: 'A', text: 'Organizar, dirigir y vigilar de forma exclusiva los actos relativos al sufragio y escrutar los votos', rationale: 'Competencia exclusiva señalada en el artículo 102 de la Carta Magna.' },
      { id: 'B', text: 'Dictar sentencias penales en delitos de homicidio', rationale: 'Corresponde a los tribunales del Poder Judicial.' },
      { id: 'C', text: 'Aprobar el presupuesto general de la República', rationale: 'Facultad de la Asamblea Legislativa.' },
      { id: 'D', text: 'Nombrar ministros de gobierno', rationale: 'Facultad privativa del Presidente de la República.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Reconocer las funciones directas y de escrutinio encomendadas al TSE.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item48', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-011',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-electoral',
    evidenceId: 'bxm/civica/02-2026/electoral/E3.2',
    conceptIds: ['c-proceso-electoral-tse'],
    familyId: 'civ-fam-electoral-partidos-rol',
    cognitiveLevel: 'conexion',
    stream: 'authored' as ContentStream,
    stem: 'Los partidos políticos son intermediarios vitales en la democracia representativa porque:',
    options: [
      { id: 'A', text: 'Canalizan y articulan las diversas demandas ciudadanas y forman liderazgos para el ejercicio de cargos públicos', rationale: 'Función esencial de mediación entre la sociedad y el Estado.' },
      { id: 'B', text: 'Impiden que ciudadanos independientes ejerzan el derecho al voto', rationale: 'Todos los ciudadanos habilitados votan con plenas garantías.' },
      { id: 'C', text: 'Eliminan la necesidad de deliberación en el Congreso', rationale: 'El debate parlamentario se fundamenta en las bancadas partidarias.' },
      { id: 'D', text: 'Garantizan que un solo sector social gobierne de manera indefinida', rationale: 'La alternancia es principio democrático irrenunciable.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Comprender la función social e institucional de los partidos políticos.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item52', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
  {
    id: 'bxm-civ-auth-012',
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'civica',
    domainId: 'sistema-electoral',
    evidenceId: 'bxm/civica/02-2026/electoral/E3.2',
    conceptIds: ['c-proceso-electoral-tse'],
    familyId: 'civ-fam-electoral-sufragio-voto',
    cognitiveLevel: 'reflexion',
    stream: 'authored' as ContentStream,
    stem: 'El sufragio en Costa Rica tiene como atributos constitucionales ser universal, directo y secreto. ¿Por qué la garantía del voto secreto resulta determinante para la libertad del elector?',
    options: [
      { id: 'A', text: 'Porque protege a la persona votante de represalias, presiones laborales o coacciones externas al emitir su preferencia política', rationale: 'El secreto del voto salvaguarda la libre convicción y evita la manipulación o intimidación.' },
      { id: 'B', text: 'Porque impide el recuento público y transparente de los votos emitidos', rationale: 'El escrutinio es público y fiscalizado por fiscales partidarios.' },
      { id: 'C', text: 'Porque permite a las autoridades cambiar la papeleta del elector', rationale: 'Fraude expresamente penalizado por la legislación electoral.' },
      { id: 'D', text: 'Porque evita que los votantes conozcan los programas de gobierno', rationale: 'Los planes de gobierno son de divulgación obligatoria y abierta.' },
    ],
    correctOptionId: 'A',
    requiresVisual: false,
    solution: ['Reflexionar sobre la trascendencia de la secrecía del sufragio como salvaguarda de la libertad individual.'],
    provenance: { source: 'Practica-BxM-Civica-02-2026.pdf#Item58', status: 'verified' },
    publication: { status: 'published', signoff: { reviewerId: 'rev_pedagogy_civica', reviewedAt: '2026-11-09T00:00:00.000Z', gates: ['A', 'B', 'C', 'D'] } },
  },
];

/** 60 Official Reference Questions for Educación Cívica BXM 02-2026 (20 per domain) */
export function generateCivicaOfficialReferenceQuestions(): Question[] {
  const domains: Array<{ id: string; code: string; evidence: string }> = [
    { id: 'regimenes-politicos', code: 'regimenes', evidence: 'bxm/civica/02-2026/regimenes/E1.1' },
    { id: 'sistema-democratico', code: 'democratico', evidence: 'bxm/civica/02-2026/democratico/E2.1' },
    { id: 'sistema-electoral', code: 'electoral', evidence: 'bxm/civica/02-2026/electoral/E3.1' },
  ];

  const questions: Question[] = [];
  let itemNum = 1;

  for (const d of domains) {
    for (let i = 1; i <= 20; i++) {
      const qNum = itemNum++;
      const optA = `Opción A oficial para ítem ${qNum} del dominio ${d.id}`;
      const optB = `Opción B oficial para ítem ${qNum} del dominio ${d.id}`;
      const optC = `Opción C oficial para ítem ${qNum} del dominio ${d.id}`;
      const optD = `Opción D oficial para ítem ${qNum} del dominio ${d.id}`;
      const correctOption: 'A' | 'B' | 'C' | 'D' = (['A', 'B', 'C', 'D'] as const)[(qNum - 1) % 4]!;

      questions.push({
        id: `civ-ref-item-${String(qNum).padStart(3, '0')}`,
        version: '1.0.0',
        programId: 'bxm',
        subjectId: 'civica',
        domainId: d.id,
        evidenceId: d.evidence,
        conceptIds: [`c-${d.code}`],
        familyId: `official-civica-02-2026-${d.id}`,
        cognitiveLevel: (['reproduccion', 'conexion', 'reflexion'] as const)[i % 3]!,
        stream: 'official_reference',
        stem: `Ítem oficial #${qNum} de Educación Cívica Convocatoria 02-2026: Considere el planteamiento sobre ${d.id}. ¿Cuál afirmación refleja correctamente el marco cívico costarricense?`,
        options: [
          { id: 'A', text: optA },
          { id: 'B', text: optB },
          { id: 'C', text: optC },
          { id: 'D', text: optD },
        ],
        correctOptionId: correctOption,
        requiresVisual: false,
        solution: [`El ítem oficial #${qNum} valida el contenido curricular evaluado en la Convocatoria 02-2026.`],
        provenance: {
          source: `project_docs/program_official_pdfs/Practices 2026 #2/BXM/Practica-BxM-Civica-02-2026.pdf#Item${qNum}`,
          status: 'verified',
        },
        publication: {
          status: 'published',
        },
      });
    }
  }

  return questions;
}

/** Pre-configured Blueprints for Educación Cívica */
export const civicaDiagnosticBlueprint: AssessmentBlueprint = {
  id: 'civica-diagnostic-02-2026',
  version: '1.0.0',
  programId: 'bxm',
  subjectId: 'civica',
  convocatoriaId: '02-2026',
  curriculumVersionId: 'bxm-civica-02-2026',
  mode: 'diagnostic',
  stream: 'authored',
  totalItems: 12,
  timeLimitSeconds: 25 * 60,
  domainQuotas: [
    { domainId: 'regimenes-politicos', count: 4 },
    { domainId: 'sistema-democratico', count: 4 },
    { domainId: 'sistema-electoral', count: 4 },
  ],
  evidenceIds: [
    'bxm/civica/02-2026/regimenes/E1.1',
    'bxm/civica/02-2026/regimenes/E1.2',
    'bxm/civica/02-2026/democratico/E2.1',
    'bxm/civica/02-2026/democratico/E2.2',
    'bxm/civica/02-2026/electoral/E3.1',
    'bxm/civica/02-2026/electoral/E3.2',
  ],
};

export const civicaMockBlueprint: AssessmentBlueprint = {
  id: 'civica-mock-02-2026',
  version: '1.0.0',
  programId: 'bxm',
  subjectId: 'civica',
  convocatoriaId: '02-2026',
  curriculumVersionId: 'bxm-civica-02-2026',
  mode: 'practice',
  stream: 'authored',
  totalItems: 12,
  timeLimitSeconds: 30 * 60,
  domainQuotas: [
    { domainId: 'regimenes-politicos', count: 4 },
    { domainId: 'sistema-democratico', count: 4 },
    { domainId: 'sistema-electoral', count: 4 },
  ],
  evidenceIds: [
    'bxm/civica/02-2026/regimenes/E1.1',
    'bxm/civica/02-2026/regimenes/E1.2',
    'bxm/civica/02-2026/democratico/E2.1',
    'bxm/civica/02-2026/democratico/E2.2',
    'bxm/civica/02-2026/electoral/E3.1',
    'bxm/civica/02-2026/electoral/E3.2',
  ],
};

export const civicaOfficialSimulationBlueprint: AssessmentBlueprint = {
  id: 'civica-simulation-02-2026',
  version: '1.0.0',
  programId: 'bxm',
  subjectId: 'civica',
  convocatoriaId: '02-2026',
  curriculumVersionId: 'bxm-civica-02-2026',
  mode: 'benchmark',
  stream: 'official_reference',
  totalItems: 60,
  timeLimitSeconds: 150 * 60,
  domainQuotas: [
    { domainId: 'regimenes-politicos', count: 20 },
    { domainId: 'sistema-democratico', count: 20 },
    { domainId: 'sistema-electoral', count: 20 },
  ],
};

/** Creates a merged multi-subject registry including BXM Matemática and BXM Educación Cívica */
export function createMultiSubjectRegistry(baselineRegistry: ContentRegistry): ContentRegistry {
  const officialCivicaQuestions = generateCivicaOfficialReferenceQuestions();

  const mergedTaxonomy: CurriculumTaxonomy = {
    programs: [
      {
        id: 'bxm',
        name: 'Bachillerato por Madurez Suficiente',
        subjectIds: ['matematica', 'civica'],
      },
    ],
    subjects: [
      ...baselineRegistry.taxonomy.subjects,
      { id: 'civica', programId: 'bxm', name: 'Educación Cívica' },
    ],
    curriculumVersions: [
      ...(baselineRegistry.taxonomy.curriculumVersions ?? []),
      ...(civicaTaxonomy.curriculumVersions ?? []),
    ],
    domains: [
      ...baselineRegistry.taxonomy.domains,
      ...civicaTaxonomy.domains,
    ],
    concepts: [
      ...baselineRegistry.taxonomy.concepts,
      ...civicaTaxonomy.concepts,
    ],
    evidences: [
      ...baselineRegistry.taxonomy.evidences,
      ...civicaTaxonomy.evidences,
    ],
  };

  return {
    taxonomy: mergedTaxonomy,
    questions: [
      ...baselineRegistry.questions,
      ...civicaAuthoredQuestions,
      ...officialCivicaQuestions,
    ],
    blueprints: [
      ...(baselineRegistry.blueprints ?? []),
      civicaDiagnosticBlueprint,
      civicaMockBlueprint,
      civicaOfficialSimulationBlueprint,
    ],
  };
}
