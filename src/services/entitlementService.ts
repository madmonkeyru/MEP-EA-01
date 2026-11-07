import type { UserTier } from '../types/learningDomain';
export type { UserTier } from '../types/learningDomain';
import { createCapabilityProvider, type ProductCapability } from './capabilityModel';
import { STORAGE_KEYS } from './storageRegistry';

export type Entitlement =
  | 'official_resources'
  | 'diagnostic'
  | 'reference_exam'
  | 'basic_results'
  | 'lesson_library'
  | 'practice_bank'
  | 'adaptive_practice'
  | 'mock_exams'
  | 'advanced_progress'
  | 'study_sessions';

export interface EntitlementDecision {
  entitlement: Entitlement;
  hasAccess: boolean;
  requiredTier: UserTier;
  labelEs: string;
  reasonEs?: string;
  upgradeCtaTextEs?: string;
}

export interface EntitlementDefinition {
  labelEs: string;
  freeAllowed: boolean;
  premiumAllowed: boolean;
  freeReasonEs?: string;
  upgradeCtaTextEs?: string;
}

export const ENTITLEMENT_DEFINITIONS: Record<Entitlement, EntitlementDefinition> = {
  official_resources: {
    labelEs: 'Recursos oficiales MEP, especificaciones y formulario',
    freeAllowed: true,
    premiumAllowed: true,
  },
  diagnostic: {
    labelEs: 'Diagnóstico formativo inicial de 20 preguntas',
    freeAllowed: true,
    premiumAllowed: true,
  },
  reference_exam: {
    labelEs: 'Examen Oficial de Referencia MEP (60 preguntas)',
    freeAllowed: true,
    premiumAllowed: true,
  },
  basic_results: {
    labelEs: 'Resultados globales y desglose básico por área temática',
    freeAllowed: true,
    premiumAllowed: true,
  },
  lesson_library: {
    labelEs: 'Temario Digital y biblioteca completa de lecciones interactivas',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Has completado esta lección de muestra. Continúa con acceso a todas las lecciones del temario.',
    upgradeCtaTextEs: 'Desbloquear lecciones',
  },
  practice_bank: {
    labelEs: 'Banco extendido de práctica de autoría por habilidad',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Has completado la práctica básica. Desbloquea más ejercicios para seguir reforzando.',
    upgradeCtaTextEs: 'Explorar práctica extendida',
  },
  adaptive_practice: {
    labelEs: 'Práctica adaptativa e isomórfica con variantes infinitas',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Genera variantes automáticas ilimitadas de los ejercicios que más te cuestan con el plan completo.',
    upgradeCtaTextEs: 'Activar variantes ilimitadas',
  },
  mock_exams: {
    labelEs: 'Simulacros ponderados de autor y retests de nivelación',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Pon a prueba tu preparación con simulacros ponderados y planes de remediación automáticos.',
    upgradeCtaTextEs: 'Ver simulacros completos',
  },
  advanced_progress: {
    labelEs: 'Seguimiento longitudinal de maestría y analíticas detalladas',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Visualiza tu historial de intentos, rachas de estudio y nivel de dominio por indicador.',
    upgradeCtaTextEs: 'Ver analíticas avanzadas',
  },
  study_sessions: {
    labelEs: 'Sesiones guiadas de estudio (15, 30 y 60 minutos)',
    freeAllowed: false,
    premiumAllowed: true,
    freeReasonEs: 'Aprovecha tus sesiones de estudio con rutinas automáticas adaptadas a tu nivel.',
    upgradeCtaTextEs: 'Activar sesiones de estudio',
  },
};

const STORAGE_TIER_KEY = STORAGE_KEYS.subscription;
const ENTITLEMENT_CAPABILITY: Record<Entitlement, ProductCapability> = {
  official_resources: 'official_specifications_and_resources', diagnostic: 'initial_diagnostic_and_basic_results',
  reference_exam: 'official_reference_benchmark', basic_results: 'initial_diagnostic_and_basic_results',
  lesson_library: 'full_authored_lesson_pack', practice_bank: 'extended_authored_practice',
  adaptive_practice: 'isomorphic_practice_drills', mock_exams: 'configurable_mock_sessions',
  advanced_progress: 'longitudinal_mastery_dashboard', study_sessions: 'structured_study_plans',
};
function isAllowed(tier: UserTier, entitlement: Entitlement) {
  return createCapabilityProvider(tier).canAccess(ENTITLEMENT_CAPABILITY[entitlement]);
}

export interface EntitlementProvider {
  getTier: () => UserTier;
  checkAccess: (entitlement: Entitlement) => EntitlementDecision;
  hasEntitlement: (entitlement: Entitlement) => boolean;
  setTier: (tier: UserTier) => void;
  toggleTier: () => UserTier;
  subscribe: (listener: (tier: UserTier) => void) => () => void;
}

class EntitlementManager implements EntitlementProvider {
  private listeners: Array<(tier: UserTier) => void> = [];

  public getTier(): UserTier {
    try {
      const stored = localStorage.getItem(STORAGE_TIER_KEY);
      if (stored === 'premium' || stored === 'free') {
        return stored;
      }
    } catch {
      // ignore storage access errors
    }
    return 'free';
  }

  public setTier(tier: UserTier): void {
    try {
      localStorage.setItem(STORAGE_TIER_KEY, tier);
    } catch {
      // ignore
    }
    this.notify(tier);
  }

  public toggleTier(): UserTier {
    const next = this.getTier() === 'premium' ? 'free' : 'premium';
    this.setTier(next);
    return next;
  }

  public subscribe(listener: (tier: UserTier) => void): () => void {
    this.listeners.push(listener);
    const changed = (event: StorageEvent) => { if (event.key === STORAGE_TIER_KEY || event.key === null) listener(this.getTier()); };
    window.addEventListener('storage', changed);
    return () => {
      window.removeEventListener('storage', changed);
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(tier: UserTier) {
    this.listeners.forEach((l) => {
      try {
        l(tier);
      } catch {
        // ignore callback error
      }
    });
  }

  public checkAccess(entitlement: Entitlement): EntitlementDecision {
    const tier = this.getTier();
    const def = ENTITLEMENT_DEFINITIONS[entitlement];

    if (!def) {
      return {
        entitlement,
        hasAccess: false,
        requiredTier: 'premium',
        labelEs: entitlement,
        reasonEs: 'Capacidad no reconocida o no disponible.',
      };
    }

    const hasAccess = isAllowed(tier, entitlement);
    return {
      entitlement,
      hasAccess,
      requiredTier: isAllowed('free', entitlement) ? 'free' : 'premium',
      labelEs: def.labelEs,
      reasonEs: hasAccess ? undefined : def.freeReasonEs,
      upgradeCtaTextEs: hasAccess ? undefined : def.upgradeCtaTextEs,
    };
  }

  public hasEntitlement(entitlement: Entitlement): boolean {
    return this.checkAccess(entitlement).hasAccess;
  }
}

export const entitlementService = new EntitlementManager();

/**
 * Creates an injectable capability / entitlement provider for testing or scoped components.
 */
export function createEntitlementProvider(initialTier?: unknown): EntitlementProvider {
  let tier: UserTier = initialTier === 'premium' ? 'premium' : 'free';
  const listeners: Array<(t: UserTier) => void> = [];

  return {
    getTier: () => tier,
    setTier: (newTier: UserTier) => {
      tier = newTier;
      listeners.forEach((l) => l(tier));
    },
    toggleTier: () => {
      tier = tier === 'premium' ? 'free' : 'premium';
      listeners.forEach((l) => l(tier));
      return tier;
    },
    subscribe: (listener: (t: UserTier) => void) => {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
    checkAccess: (entitlement: Entitlement): EntitlementDecision => {
      const def = ENTITLEMENT_DEFINITIONS[entitlement];
      if (!def) {
        return {
          entitlement,
          hasAccess: false,
          requiredTier: 'premium',
          labelEs: entitlement,
        };
      }
      const hasAccess = isAllowed(tier, entitlement);
      return {
        entitlement,
        hasAccess,
        requiredTier: isAllowed('free', entitlement) ? 'free' : 'premium',
        labelEs: def.labelEs,
        reasonEs: hasAccess ? undefined : def.freeReasonEs,
        upgradeCtaTextEs: hasAccess ? undefined : def.upgradeCtaTextEs,
      };
    },
    hasEntitlement: (entitlement: Entitlement): boolean => {
      const def = ENTITLEMENT_DEFINITIONS[entitlement];
      if (!def) return false;
      return isAllowed(tier, entitlement);
    },
  };
}
