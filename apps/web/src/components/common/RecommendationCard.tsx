import React from 'react';
import type { CanonicalRecommendation } from '../../types/recommendation';

export interface RecommendationCardProps {
  recommendation: CanonicalRecommendation;
  onPrimaryAction: (recommendation: CanonicalRecommendation) => void;
  onSecondaryAction?: (recommendation: CanonicalRecommendation) => void;
  className?: string;
  variant?: 'hero' | 'compact';
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onPrimaryAction, onSecondaryAction, className = '', variant = 'hero' }) => {
  const { title, description, domainLabel, estimatedMinutes, cta } = recommendation;
  return <article data-testid="canonical-recommendation-card" data-activity-type={recommendation.activityType} data-reason={recommendation.reason} className={`recommendation recommendation--${variant} ${className}`}>
    <h2 className="eyebrow">Recomendado para ti</h2>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p>{description}</p>
    {(domainLabel || estimatedMinutes) && <p className="muted">{[domainLabel, estimatedMinutes ? `Unos ${estimatedMinutes} min` : ''].filter(Boolean).join(' · ')}</p>}
    <div className="action-row">
      <button type="button" onClick={() => onPrimaryAction(recommendation)} className="primary-button">{cta.label}</button>
      {cta.secondaryLabel && onSecondaryAction && <button type="button" onClick={() => onSecondaryAction(recommendation)} className="tertiary-button">{cta.secondaryLabel}</button>}
      {!cta.secondaryLabel && recommendation.targetId && (recommendation.reason === 'diagnostic_weakness' || recommendation.reason === 'remediation_pending') && onSecondaryAction && <button type="button" onClick={() => onSecondaryAction({ ...recommendation, cta: { ...cta, secondaryAction: 'retest', secondaryTargetId: recommendation.targetId } })} className="tertiary-button">Comprobar mi avance</button>}
    </div>
  </article>;
};
