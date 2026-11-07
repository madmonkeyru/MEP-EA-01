export interface FaqItem {
  id: string;
  category: 'general' | 'programas' | 'reglas' | 'matricula' | 'planes';
  question: string;
  answer: string;
  keywords: string[];
  officialLink?: {
    label: string;
    url: string;
  };
  internalLink?: {
    label: string;
    routeHash: string;
  };
}

export interface ProgramOverview {
  id: string;
  name: string;
  tagline: string;
  targetAudience: string;
  levels: string;
  passingScore: number;
  calculatorRules: string;
  requirements: string[];
  subjects: string[];
}

export interface PlatformMission {
  title: string;
  subtitle: string;
  description: string;
  pillars: {
    title: string;
    description: string;
  }[];
  disclaimer: string;
}

export const PLATFORM_INFO: PlatformMission = {
  title: 'MEP-EA-01 · Educación Abierta Digital',
  subtitle: 'Plataforma interactiva independiente de práctica y diagnóstico para Educación Abierta en Costa Rica',
  description:
    'MEP-EA-01 es una plataforma educativa de alto rendimiento diseñada para estudiantes, adultos trabajadores y postulantes que se preparan para los exámenes de certificación administrados por la Dirección de Gestión y Evaluación de la Calidad (DGEC) del Ministerio de Educación Pública (MEP).',
  pillars: [
    {
      title: 'Alineación Curricular Oficial 02-2026',
      description:
        'Cada ítem, lección y simulación respeta rigurosamente las tablas de especificaciones oficiales del MEP (afirmaciones, evidencias y distribución por áreas cognitivas).',
    },
    {
      title: 'Diagnóstico Guiado y Nivelación Real',
      description:
        'Identifica con exactitud tus áreas fuertes y débiles en 20 preguntas diagnósticas, ofreciendo planes de refuerzo y lecciones teóricas antes de volver a evaluar.',
    },
    {
      title: 'Privacidad y Autonomía',
      description:
        'Tus intentos y avances se conservan en tu navegador sin requerir registro obligatorio ni compartir información privada. Estudia a tu propio ritmo.',
    },
    {
      title: 'Accesibilidad e Inclusión',
      description:
        'Interfaz optimizada con soporte completo para modo claro/oscuro, visualización matemática en KaTeX de alta velocidad y compatibilidad táctil móvil integral.',
    },
  ],
  disclaimer:
    'Nota de independencia institucional: MEP-EA-01 es una iniciativa y prototipo de software de aprendizaje independiente. No forma parte de la estructura interna del Ministerio de Educación Pública de Costa Rica ni de la DGEC. La matrícula formal, el pago de derechos de examen, la designación de sedes y la entrega de títulos oficiales se realizan de manera exclusiva a través del portal oficial "Yo Aplico" de la DGEC.',
};

export const PROGRAMS_OVERVIEW: ProgramOverview[] = [
  {
    id: 'bxm',
    name: 'Bachillerato por Madurez Suficiente (BXM)',
    tagline: 'Título de Bachiller en Educación Media en una sola convocatoria por materia',
    targetAudience: 'Personas de 18 años o más con noveno año aprobado (o menores egresados de educación formal diversificada).',
    levels: 'Prueba única por materia (abarca contenidos integrados de 10° y 11° año).',
    passingScore: 70,
    calculatorRules: 'Permitida calculadora científica estándar en Matemáticas (no programable ni con conectividad).',
    requirements: [
      'Tener al menos 18 años cumplidos al momento de la matrícula.',
      'Certificado de conclusión de III Ciclo (9° año) o convalidación formal de estudios equivalentes.',
    ],
    subjects: ['Español', 'Matemáticas', 'Estudios Sociales', 'Educación Cívica', 'Inglés o Francés', 'Una Ciencia (Biología, Física o Química)'],
  },
  {
    id: 'edad',
    name: 'Educación Diversificada a Distancia (EDAD)',
    tagline: 'Bachillerato dividido en dos etapas modulares (Parte 1 y Parte 2)',
    targetAudience: 'Jóvenes y adultos con noveno año aprobado y estudiantes rezagados de colegios que desean completar su bachillerato paso a paso.',
    levels: 'Dos pruebas por materia: Prueba 1 (10° año) y Prueba 2 (11° año). La aprobación de la Prueba 1 es requisito para matricular la Prueba 2 en la misma materia.',
    passingScore: 70,
    calculatorRules: 'Permitida calculadora científica estándar en Matemáticas (no programable).',
    requirements: [
      'Tener al menos 15 años (o 18 años según caso específico de ingreso).',
      'Certificado de conclusión de III Ciclo (9° año).',
      'Reconocimiento de materias aprobadas en 10° de colegio formal si aplica.',
    ],
    subjects: ['Español', 'Matemáticas', 'Estudios Sociales', 'Educación Cívica', 'Inglés o Francés', 'Una Ciencia (Biología, Física o Química)'],
  },
  {
    id: 'iii_ciclo',
    name: 'III Ciclo de la Educación General Básica (EGBA)',
    tagline: 'Secundaria básica flexible: 7°, 8° y 9° año',
    targetAudience: 'Jóvenes a partir de 14 años y adultos que concluyeron la educación primaria y buscan obtener el certificado de noveno año.',
    levels: 'Tres niveles secuenciales: Sétimo (7°), Octavo (8°) y Noveno (9°).',
    passingScore: 65,
    calculatorRules: 'Permitida calculadora básica en niveles correspondientes conforme lineamiento de la DGEC.',
    requirements: [
      'Tener 14 años cumplidos.',
      'Certificado de conclusión de I y II Ciclo (6° grado de primaria).',
    ],
    subjects: ['Español', 'Matemáticas', 'Ciencias', 'Estudios Sociales', 'Educación Cívica', 'Inglés'],
  },
  {
    id: 'i_ii_ciclo',
    name: 'I y II Ciclo de la EGB Abierta (CICO)',
    tagline: 'Conclusión de la educación primaria para jóvenes y adultos',
    targetAudience: 'Personas jóvenes y adultas que desean certificar su educación primaria básica (1° a 6° grado).',
    levels: 'Evaluación única de suficiencia o graduación de ciclo primario.',
    passingScore: 65,
    calculatorRules: 'Prohibido el uso de calculadora en la prueba de Matemáticas (cálculo aritmético manual obligatorio).',
    requirements: [
      'Tener al menos 14 años cumplidos para el ingreso general.',
      'Cédula de identidad, tarjeta de identidad de menores (TIM) o documento de identidad migratorio vigente.',
    ],
    subjects: ['Español', 'Matemáticas', 'Ciencias', 'Estudios Sociales', 'Educación Cívica'],
  },
];

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'Todas las preguntas' },
  { id: 'general', label: 'General y Plataforma' },
  { id: 'programas', label: 'Programas y Requisitos' },
  { id: 'reglas', label: 'Reglas de Examen' },
  { id: 'matricula', label: 'Matrícula y Trámites DGEC' },
  { id: 'planes', label: 'Acceso Gratuito y Pro' },
] as const;

export const FAQ_ITEMS: FaqItem[] = [
  // --- GENERAL Y PLATAFORMA ---
  {
    id: 'gen-01',
    category: 'general',
    question: '¿Qué es MEP-EA-01 y cuál es su objetivo?',
    answer:
      'MEP-EA-01 es una plataforma web independiente creada para preparar a estudiantes de Costa Rica en las pruebas de certificación de Educación Abierta. Brinda simulacros de examen cronometrados, diagnósticos por habilidades, temarios interactivos con fórmulas y explicaciones paso a paso.',
    keywords: ['plataforma', 'mep-ea-01', 'propósito', 'qué es', 'objetivo'],
  },
  {
    id: 'gen-02',
    category: 'general',
    question: '¿Necesito crear una cuenta o registrarme para estudiar?',
    answer:
      'No. Puedes comenzar inmediatamente en modo invitado sin crear una cuenta. Todos tus intentos, avances y notas se guardan automáticamente en el almacenamiento local de tu navegador (localStorage). Si lo deseas, puedes crear perfiles locales para separar el estudio de diferentes miembros en el mismo dispositivo.',
    keywords: ['cuenta', 'registro', 'perfil', 'invitado', 'gratis', 'privacidad'],
  },
  {
    id: 'gen-03',
    category: 'general',
    question: '¿Se sincronizan mis intentos entre mi teléfono y mi computadora?',
    answer:
      'Actualmente, por privacidad y ligereza técnica, el progreso se almacena localmente en el dispositivo donde estudias. Si deseas respaldar o transferir tu historial, puedes usar la herramienta de exportación e importación de perfil desde el menú de configuración.',
    keywords: ['sincronizar', 'dispositivos', 'celular', 'computadora', 'historial', 'respaldo'],
  },
  {
    id: 'gen-04',
    category: 'general',
    question: '¿Las preguntas del simulador coinciden con las de la prueba real?',
    answer:
      'Sí. Las pruebas se construyen siguiendo con exactitud las Tablas de Especificaciones Oficiales publicadas por la DGEC para la Convocatoria 02-2026. Los ítems cubren las mismas afirmaciones, evidencias, niveles de complejidad cognitiva y número de ítems (por ejemplo, 60 ítems en Matemáticas BXM distribuidos en Geometría, Relaciones y Álgebra, y Estadística y Probabilidad).',
    keywords: ['preguntas', 'examen real', 'especificaciones', 'temario', 'dgec', 'validez'],
    internalLink: {
      label: 'Consultar Tabla de Especificaciones BXM',
      routeHash: '#/programas/bxm/matematicas?convocatoria=2026-c2&recurso=specs',
    },
  },

  // --- PROGRAMAS Y REQUISITOS ---
  {
    id: 'prog-01',
    category: 'programas',
    question: '¿Cuál es la diferencia entre Bachillerato por Madurez (BXM) y EDAD?',
    answer:
      'Bachillerato por Madurez Suficiente (BXM) evalúa la materia completa de 10° y 11° en un único examen de 60 ítems por asignatura, requiriendo 18 años cumplidos. EDAD divide la materia en dos exámenes separados: Prueba 1 (10° año) y Prueba 2 (11° año), lo que permite avanzar por etapas y convalidar materias aprobadas en décimo de colegio tradicional.',
    keywords: ['diferencia', 'bxm', 'edad', 'etapas', 'décimo', 'undécimo', 'colegio'],
  },
  {
    id: 'prog-02',
    category: 'programas',
    question: 'Aprobé materias en un colegio formal (público o privado), ¿puedo convalidarlas?',
    answer:
      'Sí. Si aprobaste asignaturas en 10° o 11° año en el sistema formal regular, puedes solicitar a la DGEC el reconocimiento oficial mediante el formulario "Reconocimiento de materias de bachillerato aprobadas en educación formal". Las materias aprobadas te eximen de presentarlas en Educación Abierta.',
    keywords: ['convalidar', 'reconocimiento', 'materias aprobadas', 'colegio', 'formulario', 'exoneración'],
    internalLink: {
      label: 'Ver trámite de reconocimiento en la Guía',
      routeHash: '#/ayuda?programa=bxm',
    },
    officialLink: {
      label: 'Portal de trámites DGEC',
      url: 'https://dgec.mep.go.cr/consultas/',
    },
  },
  {
    id: 'prog-03',
    category: 'programas',
    question: '¿Qué edad mínima se requiere para cada programa?',
    answer:
      '• I y II Ciclo (Primaria): 14 años cumplidos.\n• III Ciclo (EGBA 7°, 8°, 9°): 14 años cumplidos.\n• EDAD: 15 años cumplidos (con 9° aprobado).\n• Bachillerato por Madurez (BXM): 18 años cumplidos (o menores graduados/egresados del ciclo diversificado regular).',
    keywords: ['edad', 'edad mínima', 'años', 'requisito', 'menor de edad', '18 años', '14 años'],
  },
  {
    id: 'prog-04',
    category: 'programas',
    question: 'Si cursé estudios en el extranjero, ¿cómo obtengo la equiparación para matricular?',
    answer:
      'Debes solicitar la Resolución de Equiparación ante el Departamento de Control de Calidad de la DGEC (correo dgec.reconocimientos@mep.go.cr) presentando tus certificados autenticados o apostillados con traducción oficial si corresponde. El trámite demora aproximadamente entre 4 y 6 semanas antes de la matrícula.',
    keywords: ['extranjero', 'apostilla', 'equiparación', 'internacional', 'estudios fuera'],
  },

  // --- REGLAS DE EXAMEN ---
  {
    id: 'reg-01',
    category: 'reglas',
    question: '¿Cuál es la nota mínima para aprobar un examen?',
    answer:
      'En Bachillerato por Madurez (BXM) y en EDAD la nota mínima de aprobación es 70. En I y II Ciclo y en III Ciclo (EGBA) la nota mínima de aprobación es 65. No existe curva ni nota de presentación en Educación Abierta; la nota depende al 100% del examen aplicado.',
    keywords: ['nota mínima', 'calificación', 'pasar', '65', '70', 'ponderación'],
  },
  {
    id: 'reg-02',
    category: 'reglas',
    question: '¿Se permite el uso de calculadora en los exámenes de Matemáticas?',
    answer:
      '• En BXM y EDAD: Se permite calculadora científica básica/estándar no programable. No se permiten calculadoras con pantallas gráficas avanzadas, matrices algebraicas simbólicas ni conectividad celular/bluetooth.\n• En I y II Ciclo: Está terminantemente prohibida toda clase de calculadora (las operaciones deben realizarse manualmente en las hojas de borrador).',
    keywords: ['calculadora', 'permitida', 'científica', 'prohibida', 'reglas', 'matemáticas'],
  },
  {
    id: 'reg-03',
    category: 'reglas',
    question: '¿Cuánto tiempo dura la prueba y cuántas preguntas contiene?',
    answer:
      'En Matemáticas BXM la prueba oficial consta de 60 ítems de selección única (con 4 opciones A, B, C, D) y un tiempo oficial de 150 minutos (2 horas y 30 minutos). Estudiantes con apoyo curricular formalmente aprobado reciben el tiempo adicional reglamentario establecido por su asesoría.',
    keywords: ['tiempo', 'duración', 'preguntas', '60 ítems', 'minutos', 'adecuación'],
  },
  {
    id: 'reg-04',
    category: 'reglas',
    question: '¿Qué documentos debo presentar el día del examen en la sede?',
    answer:
      'Debes presentar tu documento de identidad original y vigente (Cédula de Identidad costarricense, Tarjeta de Identidad de Menores TIM o DIMEX/Pasaporte vigente), el comprobante de matrícula impreso o digital emitido por "Yo Aplico", lápiz de grafito (frecuentemente HB o número 2), borrador y tu calculadora reglamentaria si está permitida.',
    keywords: ['cédula', 'documentos', 'sede', 'día del examen', 'lápiz', 'comprobante'],
  },

  // --- MATRÍCULA Y TRÁMITES DGEC ---
  {
    id: 'mat-01',
    category: 'matricula',
    question: '¿Cómo y dónde se realiza la matrícula oficial?',
    answer:
      'La matrícula oficial se realiza exclusivamente en línea mediante el portal oficial de la DGEC "Yo Aplico" (portaldgec.mep.go.cr/yo_aplico/Login) durante las fechas de inscripción establecidas en el calendario anual de la DGEC. Cada materia tiene un costo fijado por el MEP que se cancela en las entidades bancarias autorizadas.',
    keywords: ['matrícula', 'yo aplico', 'inscripción', 'dgec', 'fechas', 'portal'],
    officialLink: {
      label: 'Acceso a Portal Yo Aplico (MEP)',
      url: 'https://portaldgec.mep.go.cr/yo_aplico/Login',
    },
  },
  {
    id: 'mat-02',
    category: 'matricula',
    question: '¿Cómo solicito adecuación curricular o apoyos educativos?',
    answer:
      'La solicitud de apoyos educativos (como tiempo adicional, recinto aparte o prueba en ampliación) debe gestionarse ante la Asesoría Pedagógica de Educación Especial de la Dirección Regional correspondiente con suficiente anticipación. Al matricular en Yo Aplico, debes adjuntar la carta oficial de aprobación de apoyos.',
    keywords: ['apoyo educativo', 'adecuación', 'educación especial', 'tiempo adicional', 'discapacidad'],
  },
  {
    id: 'mat-03',
    category: 'matricula',
    question: '¿Dónde puedo consultar el calendario oficial de convocatorias 2026?',
    answer:
      'Puedes consultar todas las fechas de matrícula, aplicación de pruebas, entrega de resultados y apelaciones directamente en nuestra sección interactiva de Calendario o descargando el folleto oficial de la DGEC.',
    keywords: ['calendario', 'fechas', 'convocatoria', '2026', 'sedes', 'resultados'],
    internalLink: {
      label: 'Ver Calendario Oficial DGEC',
      routeHash: '#/calendario',
    },
  },

  // --- PLANES Y ACCESO ---
  {
    id: 'plan-01',
    category: 'planes',
    question: '¿Qué incluye el acceso libre y gratuito de MEP-EA-01?',
    answer:
      'El acceso libre te permite realizar la prueba oficial de referencia de 60 ítems de Matemáticas BXM de forma ilimitada, consultar el temario digital con lecciones muestra, explorar la tabla oficial de especificaciones curriculares, utilizar el diccionario de términos matemáticos, consultar las fórmulas oficiales y acceder a los formularios de trámite DGEC sin costo.',
    keywords: ['gratis', 'libre', 'plan free', 'simulador gratuito', 'acceso'],
  },
  {
    id: 'plan-02',
    category: 'planes',
    question: '¿Qué ventajas ofrece el Plan Pro / Premium?',
    answer:
      'El Plan Pro desbloquea prácticas ilimitadas con variantes matemáticas isomórficas (preguntas dinámicas con números aleatorios para evitar memorización), simulacros formativos de 20 preguntas con planes personalizados de nivelación, biblioteca extendida de lecciones con micro-quizzes de comprobación y analíticas longitudinales de preparación por evidencia.',
    keywords: ['plan pro', 'premium', 'isomórficos', 'beneficios', 'nivelación', 'ventajas'],
  },
  {
    id: 'plan-03',
    category: 'planes',
    question: '¿La plataforma cobra automáticamente o requiere tarjeta bancaria para probar?',
    answer:
      'No. No solicitamos tarjetas de crédito ni realizamos cobros automáticos para estudiar con los recursos oficiales y la prueba completa de referencia. El entorno formativo está pensado para ser accesible a toda la comunidad estudiantil de Costa Rica.',
    keywords: ['cobro', 'tarjeta', 'precio', 'suscripción', 'seguridad'],
  },
];
