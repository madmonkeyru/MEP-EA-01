import type { TestSession, Item } from '../types';
import { storageService } from './storageService';

type RemediationDomain = 'numbers' | 'geometry' | 'measurement' | 'algebra' | 'statistics';

export interface ConceptRemediationItem {
  conceptId: string;
  conceptName: string;
  domain: RemediationDomain;
  totalQuestions: number;
  incorrectQuestions: number;
  accuracyPercentage: number;
  recommendedPracticeItems: number[];
  suggestedFormulaSheets: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface DomainRemediationSummary {
  domain: RemediationDomain;
  label: string;
  totalQuestions: number;
  incorrectQuestions: number;
  accuracyPercentage: number;
  status: 'critical' | 'needs_reinforcement' | 'mastered';
}

export interface RemediationPlan {
  id: string;
  sessionId: string;
  generatedAt: string;
  overallScore: number;
  targetProgram: string;
  targetSubject: string;
  weakConcepts: ConceptRemediationItem[];
  domainSummaries: DomainRemediationSummary[];
  topPriorityDrilldowns: ConceptRemediationItem[];
  suggestedNextSteps: string[];
}

const DOMAIN_LABELS: Record<RemediationDomain, string> = {
  numbers: 'Números',
  geometry: 'Geometría',
  measurement: 'Medidas',
  algebra: 'Relaciones y Álgebra',
  statistics: 'Estadística y Probabilidad',
};

const FORMULA_SHEETS_MAP: Record<string, string[]> = {
  // Geometry concepts
  'geo-circ': ['Ecuación de la circunferencia: $(x-h)^2 + (y-k)^2 = r^2$', 'Distancia entre puntos: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$'],
  'geo-pos-rel': ['Posiciones relativas recta-circunferencia: $\\Delta > 0$ secante, $\\Delta = 0$ tangente, $\\Delta < 0$ exterior'],
  'geo-polig': ['Polígonos regulares: Medida ángulo central $\\frac{360^\\circ}{n}$, Suma ángulos internos $180^\\circ(n-2)$', 'Área polígono regular: $A = \\frac{P \\cdot a}{2}$'],
  'geo-trans': ['Transformaciones en el plano: Traslación $(x+a, y+b)$, Reflexión respecto a los ejes'],
  'geo-3d': ['Cuerpos redondos: Esfera $V = \\frac{4}{3}\\pi r^3$, Cilindro $V = \\pi r^2 h$, Cono $V = \\frac{1}{3}\\pi r^2 h$'],

  // Algebra & Functions concepts
  'alg-fun-lin': ['Función lineal: $f(x) = mx + b$, Pendiente $m = \\frac{y_2-y_1}{x_2-x_1}$'],
  'alg-fun-cuad': ['Función cuadrática: $f(x) = ax^2 + bx + c$, Vértice $(-\\frac{b}{2a}, -\\frac{\\Delta}{4a})$, Discriminante $\\Delta = b^2 - 4ac$'],
  'alg-fun-exp': ['Función exponencial: $f(x) = a^x$, Creciente si $a > 1$, Decreciente si $0 < a < 1$'],
  'alg-fun-log': ['Función logarítmica: $f(x) = \\log_a(x)$, Relación inversa $\\log_a(x) = y \\iff a^y = x$'],
  'alg-comp-inv': ['Composición $(f \\circ g)(x) = f(g(x))$ y Función inversa $f^{-1}(x)$'],

  // Statistics & Probability concepts
  'est-pos': ['Medidas de posición: Media aritmética $\\bar{x} = \\frac{\\sum x_i}{n}$, Mediana y Cuartiles $Q_1, Q_2, Q_3$'],
  'est-disp': ['Medidas de variabilidad: Recorrido $R = X_{\\max} - X_{\\min}$, Recorrido intercuartílico $RI = Q_3 - Q_1$'],
  'est-prob': ['Probabilidad laplaciana: $P(A) = \\frac{\\text{casos favorables}}{\\text{casos posibles}}$'],
  'est-cond': ['Probabilidad de eventos: Regla de la suma $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$'],
};

function resolveDomain(item: Item): RemediationDomain {
  if (item.area_id === 'numbers' || item.area_id === 'measurement') return item.area_id;
  const code = (item.code || String(item.id) || '').toLowerCase();
  if (code.includes('geo') || item.area_id === 'geometry') return 'geometry';
  if (code.includes('alg') || code.includes('fun') || item.area_id === 'functions') return 'algebra';
  return 'statistics';
}

function resolveConceptName(conceptId: string): string {
  const map: Record<string, string> = {
    'geo-circ': 'Circunferencia y Representaciones Geométricas',
    'geo-pos-rel': 'Rectas Secantes, Tangentes y Exteriores',
    'geo-polig': 'Polígonos Regulares y Perímetros/Áreas',
    'geo-trans': 'Transformaciones Isométricas en el Plano',
    'geo-3d': 'Cuerpos Redondos y Secciones Planas 3D',
    'alg-fun-lin': 'Funciones Lineales y Modelado de Variación',
    'alg-fun-cuad': 'Función Cuadrática, Vértice y Parábola',
    'alg-fun-exp': 'Modelos Exponenciales y Crecimiento',
    'alg-fun-log': 'Logaritmos y Ecuaciones Logarítmicas',
    'alg-comp-inv': 'Composición de Funciones e Inversa',
    'est-pos': 'Medidas de Posición y Diagramas de Cajas',
    'est-disp': 'Dispersión y Comparación de Conjuntos de Datos',
    'est-prob': 'Reglas Fundamentales de Probabilidad',
    'est-cond': 'Eventos Compuestos y Probabilidad Condicional',
  };
  if (conceptId === 'numbers-general') return DOMAIN_LABELS.numbers;
  if (conceptId === 'measurement-general') return DOMAIN_LABELS.measurement;
  return map[conceptId] || `Concepto clave (${conceptId})`;
}

/**
 * Evaluates a completed test session (especially diagnostic mode)
 * and generates a targeted Plan de Nivelación (Remediation Plan).
 */
export function generateRemediationPlan(session: TestSession): RemediationPlan {
  const items = session.items || [];
  const responses = session.responses || {};

  // Group items by concept
  const conceptMap = new Map<string, {
    conceptId: string;
    domain: RemediationDomain;
    total: number;
    incorrect: number;
    itemIds: number[];
  }>();

  // Group items by domain
  const domainMap: Record<RemediationDomain, { total: number; incorrect: number }> = {
    numbers: { total: 0, incorrect: 0 },
    geometry: { total: 0, incorrect: 0 },
    measurement: { total: 0, incorrect: 0 },
    algebra: { total: 0, incorrect: 0 },
    statistics: { total: 0, incorrect: 0 },
  };

  let totalCorrect = 0;

  for (const item of items) {
    const domain = resolveDomain(item);
    const conceptId = item.concept_id || `${domain}-general`;
    const response = responses[item.id];
    const isCorrect = response?.selectedOption === item.correct_answer;

    if (isCorrect) {
      totalCorrect++;
    }

    // Update domain totals
    domainMap[domain].total++;
    if (!isCorrect) {
      domainMap[domain].incorrect++;
    }

    // Update concept totals
    if (!conceptMap.has(conceptId)) {
      conceptMap.set(conceptId, {
        conceptId,
        domain,
        total: 0,
        incorrect: 0,
        itemIds: [],
      });
    }
    const record = conceptMap.get(conceptId)!;
    record.total++;
    if (!isCorrect) {
      record.incorrect++;
      record.itemIds.push(item.id);
    }
  }

  // Calculate concept remediation items
  const weakConcepts: ConceptRemediationItem[] = [];
  conceptMap.forEach((entry) => {
    const accuracy = entry.total > 0 ? Math.round(((entry.total - entry.incorrect) / entry.total) * 100) : 0;
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (accuracy < 50) priority = 'high';
    else if (accuracy < 75) priority = 'medium';

    weakConcepts.push({
      conceptId: entry.conceptId,
      conceptName: resolveConceptName(entry.conceptId),
      domain: entry.domain,
      totalQuestions: entry.total,
      incorrectQuestions: entry.incorrect,
      accuracyPercentage: accuracy,
      recommendedPracticeItems: entry.itemIds,
      suggestedFormulaSheets: FORMULA_SHEETS_MAP[entry.conceptId] || [],
      priority,
    });
  });

  // Sort weak concepts by priority: high first, then medium, then by accuracy ascending
  weakConcepts.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return a.accuracyPercentage - b.accuracyPercentage;
  });

  // Top priority drilldowns: concepts that need work (accuracy < 75%)
  const topPriorityDrilldowns = weakConcepts.filter((c) => c.priority === 'high' || c.priority === 'medium');

  // Domain summaries
  const domains: RemediationDomain[] = ['geometry', 'algebra', 'statistics'];
  if (domainMap.numbers.total) domains.unshift('numbers');
  if (domainMap.measurement.total) domains.splice(domains.indexOf('geometry') + 1, 0, 'measurement');
  const domainSummaries: DomainRemediationSummary[] = domains.map((dom) => {
    const domData = domainMap[dom];
    const acc = domData.total > 0 ? Math.round(((domData.total - domData.incorrect) / domData.total) * 100) : 0;
    let status: 'critical' | 'needs_reinforcement' | 'mastered' = 'mastered';
    if (acc < 60) status = 'critical';
    else if (acc < 75) status = 'needs_reinforcement';

    return {
      domain: dom,
      label: DOMAIN_LABELS[dom],
      totalQuestions: domData.total,
      incorrectQuestions: domData.incorrect,
      accuracyPercentage: acc,
      status,
    };
  });

  const overallScore = items.length > 0 ? Math.round((totalCorrect / items.length) * 100) : 0;

  const suggestedNextSteps: string[] = [];
  if (topPriorityDrilldowns.length > 0) {
    suggestedNextSteps.push(`Iniciar práctica focalizada en "${topPriorityDrilldowns[0].conceptName}".`);
  }
  const criticalDomain = domainSummaries.find((d) => d.status === 'critical');
  if (criticalDomain) {
    suggestedNextSteps.push(`Repasar las fórmulas oficiales y resúmenes de ${criticalDomain.label}.`);
  }
  suggestedNextSteps.push('Realizar una prueba de 10 preguntas aleatorias de refuerzo antes del simulacro completo.');

  const plan: RemediationPlan = {
    id: `plan-${Date.now()}-${session.sessionId.slice(0, 8)}`,
    sessionId: session.sessionId,
    generatedAt: new Date().toISOString(),
    overallScore,
    targetProgram: session.config.programId || 'bxm',
    targetSubject: session.config.subjectId || 'matematicas',
    weakConcepts,
    domainSummaries,
    topPriorityDrilldowns,
    suggestedNextSteps,
  };

  return plan;
}

const ACTIVE_PLAN_KEY = 'mep_ea_active_remediation_plan';

export function saveActiveRemediationPlan(plan: RemediationPlan): void {
  try {
    localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(plan));
    // Log telemetry funnel transition: diagnostic completed -> remediation generated
    storageService.logTelemetryEvent(
      'remediation_started',
      { planId: plan.id, weakConceptsCount: plan.topPriorityDrilldowns.length },
      plan.targetProgram,
      plan.targetSubject,
      'diagnostic'
    );
  } catch {
    // Non-fatal if storage quota exceeded
  }
}

export function getActiveRemediationPlan(): RemediationPlan | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PLAN_KEY);
    return raw ? JSON.parse(raw) as RemediationPlan : null;
  } catch {
    return null;
  }
}

export function clearActiveRemediationPlan(): void {
  try {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
  } catch {
    // Non-fatal
  }
}
