/**
 * Product Capability Matrix and Evaluator for BXM Mathematics.
 * Conforms to CONSOLIDATED DECISIONS v1 Section 7.
 */

export type UserTier = 'free' | 'premium';

export type ProductCapability =
  | 'official_reference_benchmark'
  | 'official_specifications_and_resources'
  | 'initial_diagnostic_and_basic_results'
  | 'sample_complete_lesson_per_domain'
  | 'full_authored_lesson_pack'
  | 'interactive_lessons_and_visuals'
  | 'extended_micro_quizzes'
  | 'extended_authored_practice'
  | 'isomorphic_practice_drills'
  | 'configurable_mock_sessions'
  | 'current_session_explanation'
  | 'longitudinal_mastery_dashboard'
  | 'personalized_practice_queue'
  | 'structured_study_plans'
  | 'weekly_progress_reports_and_streaks';

export interface CapabilityDecision {
  capability: ProductCapability;
  allowed: boolean;
  requiredTier: UserTier;
  labelEs: string;
  reasonEs?: string;
}

const CAPABILITY_DEFINITIONS: Record<
  ProductCapability,
  {
    labelEs: string;
    freeAllowed: boolean;
    premiumAllowed: boolean;
    freeReasonEs?: string;
  }
> = {
  official_reference_benchmark: {
    labelEs: 'Examen Oficial de Referencia (60 preguntas) y revisión',
    freeAllowed: true,
    premiumAllowed: true,
  },
  official_specifications_and_resources: {
    labelEs: 'Especificaciones oficiales, temario base y hojas de fórmulas',
    freeAllowed: true,
    premiumAllowed: true,
  },
  initial_diagnostic_and_basic_results: {
    labelEs: 'Diagnóstico inicial y desglose básico por área temática',
    freeAllowed: true,
    premiumAllowed: true,
  },
  sample_complete_lesson_per_domain: {
    labelEs: 'Lección completa de muestra y micro-quiz por dominio',
    freeAllowed: true,
    premiumAllowed: true,
  },
  current_session_explanation: {
    labelEs: 'Explicación paso a paso de actividades en curso',
    freeAllowed: true,
    premiumAllowed: true,
  },

  // Premium Gated Capabilities
  full_authored_lesson_pack: {
    labelEs: 'Paquete completo de lecciones temáticas BXM',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'El acceso a todas las lecciones del temario digital requiere el Plan Premium.',
  },
  interactive_lessons_and_visuals: {
    labelEs: 'Manipulación interactiva de figuras geométricas SVG y gráficos',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Los simuladores visuales interactivos son una función del Plan Premium.',
  },
  extended_micro_quizzes: {
    labelEs: 'Micro-quizzes formativos extendidos con diagnóstico de error',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Las evaluaciones formativas intermedias requieren suscripción activa.',
  },
  extended_authored_practice: {
    labelEs: 'Práctica extendida con banco de autoría por indicador y dificultad',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'El banco extendido de ejercicios de autoría está disponible en el Plan Premium.',
  },
  isomorphic_practice_drills: {
    labelEs: 'Práctica isomórfica con variantes matemáticas parametrizadas',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'La generación de variantes isomórficas ilimitadas requiere el Plan Premium.',
  },
  configurable_mock_sessions: {
    labelEs: 'Simulacros configurables ponderados según matriz MEP (23/25/12)',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Los simulacros ponderados avanzados están reservados para suscriptores.',
  },
  longitudinal_mastery_dashboard: {
    labelEs: 'Panel de preparación longitudinal con maestría por evidencia',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'El seguimiento longitudinal de maestría por indicador requiere suscripción activa.',
  },
  personalized_practice_queue: {
    labelEs: 'Cola inteligente de práctica personalizada y calibración',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Las recomendaciones automáticas de la cola de práctica son exclusivas de Premium.',
  },
  structured_study_plans: {
    labelEs: 'Plan de estudio ordenado y recomendaciones de retest',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Los planes de estudio y retests guiados requieren el Plan Premium.',
  },
  weekly_progress_reports_and_streaks: {
    labelEs: 'Informe semanal de aprendizaje (7 días) y racha de constancia',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Los informes de progreso semanal y analítica de racha forman parte de Premium.',
  },
};

export interface CapabilityProvider {
  getTier: () => UserTier;
  evaluate: (capability: ProductCapability) => CapabilityDecision;
  canAccess: (capability: ProductCapability) => boolean;
}

/**
 * Creates an injectable capability provider for testing and presentation gating.
 */
export function createCapabilityProvider(initialTier: UserTier = 'free'): CapabilityProvider {
  let currentTier = initialTier;

  return {
    getTier: () => currentTier,
    evaluate: (capability: ProductCapability): CapabilityDecision => {
      const def = CAPABILITY_DEFINITIONS[capability];
      if (!def) {
        return {
          capability,
          allowed: false,
          requiredTier: 'premium',
          labelEs: capability,
          reasonEs: 'Capacidad desconocida o no autorizada.',
        };
      }

      const allowed = currentTier === 'premium' ? def.premiumAllowed : def.freeAllowed;
      return {
        capability,
        allowed,
        requiredTier: def.freeAllowed ? 'free' : 'premium',
        labelEs: def.labelEs,
        reasonEs: allowed ? undefined : def.freeReasonEs,
      };
    },
    canAccess: (capability: ProductCapability): boolean => {
      const def = CAPABILITY_DEFINITIONS[capability];
      if (!def) return false;
      return currentTier === 'premium' ? def.premiumAllowed : def.freeAllowed;
    },
  };
}
