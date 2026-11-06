import type { LearningContextReason } from '../../../services/navigation';

export interface LessonContextBannerInfo {
  tag: string;
  headline: string;
  description: string;
  badgeStyle: 'amber' | 'rose' | 'indigo' | 'emerald';
}

/**
 * Returns student-facing contextual "Why am I here?" messaging based on the
 * learner's entry source and the subject/skill name.
 */
export function getLessonContextBanner(
  reason: LearningContextReason | undefined,
  skillName: string,
  domainName: string
): LessonContextBannerInfo {
  switch (reason) {
    case 'diagnostic_weakness':
      return {
        tag: 'Prioridad del Diagnóstico',
        headline: `Tu diagnóstico identificó una oportunidad de mejora en ${skillName}`,
        description: `Esta lección te ayuda a dominar los conceptos clave de ${domainName} antes de volver a practicar.`,
        badgeStyle: 'rose',
      };
    case 'remediation':
      return {
        tag: 'Plan de Nivelación',
        headline: `Refuerzo guiado para ${skillName}`,
        description: `Revisa la teoría y los errores frecuentes para resolver las dudas detectadas en tu sesión anterior.`,
        badgeStyle: 'amber',
      };
    case 'study_session':
      return {
        tag: 'Sesión Guiada',
        headline: `Sesión de estudio: fortalece ${skillName}`,
        description: `Avanza paso a paso: comprende el concepto, analiza el ejemplo resuelto y comprueba lo aprendido.`,
        badgeStyle: 'indigo',
      };
    case 'temario_exploration':
      return {
        tag: 'Temario Digital',
        headline: `Explorando el programa oficial: ${skillName}`,
        description: `Consulta el fundamento teórico, fórmulas clave y errores frecuentes evaluados en Bachillerato.`,
        badgeStyle: 'emerald',
      };
    case 'direct':
    default:
      return {
        tag: 'Lección Formativa',
        headline: `Esta lección fortalece: ${skillName}`,
        description: `Aprende el concepto con explicaciones claras, ejemplos resueltos paso a paso y comprobaciones interactivas.`,
        badgeStyle: 'amber',
      };
  }
}
