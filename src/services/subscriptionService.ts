import { entitlementService } from './entitlementService';
export type { UserTier as SubscriptionTier } from '../types/learningDomain';
import type { UserTier as SubscriptionTier } from '../types/learningDomain';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceCRC: number;
  period: string;
  badge?: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason?: string;
  requiredTier: SubscriptionTier;
  featureName: string;
}



export const PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_monthly',
    name: 'Plan Mensual Pro',
    priceCRC: 4900,
    period: '/mes',
    description: 'Acceso total a todas las materias y convocatorias.',
    features: [
      'Simulacros ponderados oficiales (23/25/12)',
      'Práctica por concepto y nivel de dificultad',
      'Temario Digital completo con lecciones interactivas',
      'Micro-quizzes y comprobaciones con retroalimentación',
      'Plan de nivelación personalizado y analíticas avanzadas',
    ],
  },
  {
    id: 'plan_semiannual_bundle',
    name: 'Pase Semestral BXM Total',
    priceCRC: 14900,
    period: '/convocatoria',
    badge: 'Más Popular',
    highlight: true,
    description: 'Preparación integral para toda la convocatoria DGEC.',
    features: [
      'Todo lo incluido en el Plan Mensual',
      'Banco extendido con más de 200 ítems BXM',
      'Explicaciones paso a paso con fórmulas KaTeX y gráficos SVG',
      'Simulaciones ilimitadas con cronómetro oficial (150 min)',
      'Soporte prioritario y guías de trámites DGEC',
    ],
  },
];

class SubscriptionService {
  getTier(): SubscriptionTier { return entitlementService.getTier(); }
  setTier(tier: SubscriptionTier): void { entitlementService.setTier(tier); }
  isPremium(): boolean { return this.getTier() === 'premium'; }
  toggleTier(): SubscriptionTier { return entitlementService.toggleTier(); }
  subscribe(listener: (tier: SubscriptionTier) => void): () => void { return entitlementService.subscribe(listener); }

  checkFeatureAccess(feature: 'official_exam' | 'dynamic_mock' | 'area_practice' | 'topic_practice' | 'concept_drilldown' | 'difficulty_filter' | 'textbook_reading' | 'checkpoint_quizzes' | 'analytics_advanced'): EntitlementCheckResult {

    // Free features
    if (feature === 'official_exam') {
      return {
        hasAccess: true,
        requiredTier: 'free',
        featureName: 'Examen Oficial de Referencia (60 preguntas)',
      };
    }

    // Gated premium features
    const featureLabels: Record<string, string> = {
      dynamic_mock: 'Simulacro Ponderado MEP (23/25/12)',
      area_practice: 'Práctica por Área Temática',
      topic_practice: 'Práctica por Tema Específico',
      concept_drilldown: 'Refuerzo de Conceptos Clave',
      difficulty_filter: 'Filtro por Nivel de Dificultad',
      textbook_reading: 'Temario Digital Completo con Lecciones',
      checkpoint_quizzes: 'Quizzes de Comprobación y Dominio',
      analytics_advanced: 'Analítica de Progreso y Nivelación',
    };

    const entitlement = feature === 'dynamic_mock' ? 'mock_exams' : feature === 'textbook_reading' ? 'lesson_library' : feature === 'analytics_advanced' ? 'advanced_progress' : 'practice_bank';
    const hasAccess = entitlementService.hasEntitlement(entitlement);
    return {
      hasAccess,
      requiredTier: 'premium',
      featureName: featureLabels[feature] || 'Función Premium',
      reason: hasAccess ? undefined : 'Esta función requiere un plan activo de preparación avanzada.',
    };
  }
}

export const subscriptionService = new SubscriptionService();
