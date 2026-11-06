import React from 'react';
import type { CanonicalRecommendation } from '../../types/recommendation';

export interface RecommendationCardProps {
  recommendation: CanonicalRecommendation;
  onPrimaryAction: (recommendation: CanonicalRecommendation) => void;
  onSecondaryAction?: (recommendation: CanonicalRecommendation) => void;
  className?: string;
  variant?: 'hero' | 'compact';
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPrimaryAction,
  onSecondaryAction,
  className = '',
  variant = 'hero',
}) => {
  const {
    title,
    description,
    domainLabel,
    currentAccuracyPercentage,
    statusLabel,
    estimatedMinutes,
    cta,
    reason,
  } = recommendation;

  const isHero = variant === 'hero';

  const reasonBadgeLabel = (() => {
    switch (reason) {
      case 'no_diagnostic_yet':
        return 'Primer paso recomendado';
      case 'remediation_pending':
        return 'Plan de nivelación activo';
      case 'diagnostic_weakness':
        return 'Refuerzo prioritario';
      case 'retest_available':
        return 'Retest sugerido';
      case 'simulation_recommended':
        return 'Comprobación general';
      case 'unfinished_lesson':
        return 'Lección pendiente';
      case 'general_practice':
      default:
        return 'Recomendado para ti';
    }
  })();

  return (
    <article
      data-testid="canonical-recommendation-card"
      data-activity-type={recommendation.activityType}
      data-reason={recommendation.reason}
      className={`rounded-2xl border-2 transition-all min-w-0 overflow-hidden ${
        reason === 'diagnostic_weakness' || reason === 'simulation_weakness' || reason === 'remediation_pending'
          ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/50 dark:bg-amber-950/25'
          : reason === 'simulation_recommended'
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850'
      } ${isHero ? 'p-5 sm:p-6 space-y-3.5 shadow-xs' : 'p-4 space-y-2.5'} ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
            Tu siguiente paso recomendado
          </h2>
          <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-stone-950">
            {reasonBadgeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          {domainLabel && <span className="capitalize">{domainLabel}</span>}
          {estimatedMinutes && (
            <>
              <span>·</span>
              <span>~{estimatedMinutes} min</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={`font-bold text-stone-900 dark:text-stone-100 ${isHero ? 'text-lg sm:text-xl' : 'text-base'}`}>
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          {description}
        </p>

        {(currentAccuracyPercentage !== undefined || statusLabel) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400 pt-1">
            {currentAccuracyPercentage !== undefined && (
              <span>
                Precisión actual: <strong className="text-stone-900 dark:text-stone-100">{currentAccuracyPercentage}%</strong>
              </span>
            )}
            {statusLabel && (
              <>
                <span>·</span>
                <span>
                  Estado: <strong className="text-amber-700 dark:text-amber-400">{statusLabel}</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="action-row pt-2">
        <button
          type="button"
          onClick={() => onPrimaryAction(recommendation)}
          className="primary-button cursor-pointer text-xs sm:text-sm"
        >
          {cta.label}
        </button>

        {cta.secondaryLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={() => onSecondaryAction(recommendation)}
            className="secondary-button cursor-pointer text-xs sm:text-sm"
          >
            {cta.secondaryLabel}
          </button>
        )}

        {/* Retest CTA when available for weak / remediation items */}
        {recommendation.targetId && (recommendation.reason === 'diagnostic_weakness' || recommendation.reason === 'remediation_pending') && onSecondaryAction && (
          <button
            type="button"
            onClick={() => onSecondaryAction({
              ...recommendation,
              cta: {
                ...recommendation.cta,
                secondaryAction: 'retest',
                secondaryTargetId: recommendation.targetId,
              },
            })}
            className="secondary-button cursor-pointer text-xs sm:text-sm"
          >
            Preparar Retest
          </button>
        )}
      </div>
    </article>
  );
};
