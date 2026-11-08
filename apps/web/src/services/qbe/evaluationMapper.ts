import type {
  CanonicalIntermediateQuestion,
  CanonicalEvaluationMapping,
} from '../../types/qbe';

interface EvidenceRule {
  area: 'geometry' | 'functions' | 'statistics';
  afirmacion: string;
  evidencia: string;
  keywords: RegExp[];
  confidence: number;
  description: string;
}

const MAPPING_RULES: EvidenceRule[] = [
  // GEOMETRY
  {
    area: 'geometry',
    afirmacion: 'A1',
    evidencia: 'A1.2',
    keywords: [/ecuación\s+de\s+(?:la\s+)?circunferencia/i, /centro.*radio.*ecuación/i, /\(x\s*[-+]\s*\d+\)\^2/i],
    confidence: 0.88,
    description: 'Representación algebraica de una circunferencia dado su centro y radio',
  },
  {
    area: 'geometry',
    afirmacion: 'A2',
    evidencia: 'A2.1',
    keywords: [/traslad(?:a|ación)/i, /se\s+traslada\s+la\s+circunferencia/i],
    confidence: 0.85,
    description: 'Traslaciones de circunferencias',
  },
  {
    area: 'geometry',
    afirmacion: 'A3',
    evidencia: 'A3.1',
    keywords: [/\binterior\b/i, /\bexterior\b/i, /punto.*circunferencia/i],
    confidence: 0.85,
    description: 'Puntos interiores y exteriores a la circunferencia',
  },
  {
    area: 'geometry',
    afirmacion: 'A3',
    evidencia: 'A3.2',
    keywords: [/\bsecante\b/i, /\btangente\b/i, /recta.*circunferencia/i],
    confidence: 0.85,
    description: 'Rectas secantes, tangentes o exteriores a la circunferencia',
  },
  {
    area: 'geometry',
    afirmacion: 'A4',
    evidencia: 'A4.2',
    keywords: [/área.*(?:polígono|triángulo|figura)/i, /perímetro.*(?:polígono|figura|pentágono)/i],
    confidence: 0.82,
    description: 'Perímetros o áreas de polígonos no regulares en coordenadas',
  },
  {
    area: 'geometry',
    afirmacion: 'A5',
    evidencia: 'A5.2',
    keywords: [/sección\s+plana/i, /intersecado\s+por\s+un\s+plano/i, /\besfera\b/i, /\bcono\b/i, /\bcilindro\b/i],
    confidence: 0.85,
    description: 'Secciones planas de una esfera, cono o cilindro circular recto',
  },
  {
    area: 'geometry',
    afirmacion: 'A6',
    evidencia: 'A6.1',
    keywords: [/eje(?:s)?\s+de\s+simetría/i, /simetría\s+axial/i],
    confidence: 0.86,
    description: 'Ejes de simetría en figuras simétricas',
  },
  {
    area: 'geometry',
    afirmacion: 'A7',
    evidencia: 'A7.1',
    keywords: [/\bhomotecia\b/i, /reflexión\s+con\s+simetría/i, /rotación\s+de\s+\d+/i],
    confidence: 0.87,
    description: 'Transformaciones en el plano (homotecia, reflexión, rotación)',
  },

  // FUNCTIONS & ALGEBRA
  {
    area: 'functions',
    afirmacion: 'A1',
    evidencia: 'A1.3',
    keywords: [/composición\s+de\s+funciones/i, /\(f\s*o\s*g\)/i, /\(g\s*o\s*f\)/i],
    confidence: 0.88,
    description: 'Composición de funciones',
  },
  {
    area: 'functions',
    afirmacion: 'A2',
    evidencia: 'A2.3',
    keywords: [/pendiente/i, /intersección\s+con\s+el\s+eje/i, /función\s+lineal/i],
    confidence: 0.84,
    description: 'Pendiente e intersecciones de la función lineal',
  },
  {
    area: 'functions',
    afirmacion: 'A2',
    evidencia: 'A2.5',
    keywords: [/función\s+cuadrática/i, /vértice.*parábola/i, /concavidad/i],
    confidence: 0.84,
    description: 'Elementos o propiedades de la función cuadrática',
  },
  {
    area: 'functions',
    afirmacion: 'A3',
    evidencia: 'A3.2',
    keywords: [/sistema\s+de\s+(?:dos\s+)?ecuaciones/i, /solución\s+única/i],
    confidence: 0.86,
    description: 'Sistemas de ecuaciones lineales con dos incógnitas',
  },
  {
    area: 'functions',
    afirmacion: 'A4',
    evidencia: 'A4.4',
    keywords: [/función\s+inversa/i, /criterio\s+de\s+la\s+inversa/i, /f\^\{-1\}/i],
    confidence: 0.88,
    description: 'Inversa de una función',
  },
  {
    area: 'functions',
    afirmacion: 'A5',
    evidencia: 'A5.2',
    keywords: [/función\s+exponencial/i, /creciente.*exponencial/i, /a\^x/i],
    confidence: 0.85,
    description: 'Propiedades de la función exponencial',
  },
  {
    area: 'functions',
    afirmacion: 'A5',
    evidencia: 'A5.6',
    keywords: [/logaritmo/i, /\blog\b/i, /propiedad(?:es)?\s+de\s+los\s+logaritmos/i],
    confidence: 0.85,
    description: 'Propiedades y simplificación de expresiones con logaritmos',
  },

  // STATISTICS & PROBABILITY
  {
    area: 'statistics',
    afirmacion: 'A1',
    evidencia: 'A1.2',
    keywords: [/\bmediana\b/i, /\bmoda\b/i, /media\s+aritmética/i, /\bcuartil(?:es)?\b/i],
    confidence: 0.88,
    description: 'Medidas de posición (moda, media, mediana, cuartiles)',
  },
  {
    area: 'statistics',
    afirmacion: 'A2',
    evidencia: 'A2.1',
    keywords: [/evento\s+aleatorio/i, /puntos\s+muestrales/i, /unión.*intersección/i, /espacio\s+muestral/i],
    confidence: 0.85,
    description: 'Puntos muestrales y operaciones de eventos aleatorios',
  },
  {
    area: 'statistics',
    afirmacion: 'A3',
    evidencia: 'A3.1',
    keywords: [/\bdesviación\s+estándar\b/i, /\bvariancia\b/i, /\brecorrido\s+intercuartílico\b/i, /coeficiente\s+de\s+variación/i],
    confidence: 0.86,
    description: 'Medidas de variabilidad (desviación estándar, varianza, recorrido)',
  },
  {
    area: 'statistics',
    afirmacion: 'A3',
    evidencia: 'A3.2',
    keywords: [/diagrama(?:s)?\s+de\s+cajas/i, /caja\s+y\s+bigotes/i],
    confidence: 0.88,
    description: 'Comparación de grupos mediante diagramas de cajas',
  },
];

export function mapQuestionToEvaluationFramework(
  question: CanonicalIntermediateQuestion
): CanonicalEvaluationMapping {
  const area = question.source.area;
  const stem = question.content.stem_cleaned;
  const optionsText = question.content.options.map(o => o.text_cleaned).join(' ');
  const fullText = `${stem} ${optionsText}`;

  // Find candidate rules for this area
  const candidateRules = MAPPING_RULES.filter(r => r.area === area);

  for (const rule of candidateRules) {
    const matchesAll = rule.keywords.some(rx => rx.test(fullText));
    if (matchesAll) {
      return {
        framework_version: '02-2026',
        afirmacion: rule.afirmacion,
        evidencia: rule.evidencia,
        mapping_status: 'candidate',
        mapping_confidence: rule.confidence,
        rationale: `Matched domain rule: ${rule.description}`,
      };
    }
  }

  // If no confident rule matches, do NOT force. Return unmapped or no_direct_mapping
  return {
    framework_version: '02-2026',
    afirmacion: null,
    evidencia: null,
    mapping_status: 'unmapped',
    mapping_confidence: 0.0,
    rationale: 'No confident match found against official 02-2026 evidence criteria',
  };
}
