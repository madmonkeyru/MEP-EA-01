import React from 'react';
import {
  classifyStudentMastery,
  type StudentMasteryConfig,
} from '../../features/bxm-progress/domain/masteryTiers';

export interface StudentMasteryBadgeProps {
  percentage: number;
  config?: StudentMasteryConfig;
  showPercentage?: boolean;
  className?: string;
}

export const StudentMasteryBadge: React.FC<StudentMasteryBadgeProps> = ({
  percentage,
  config,
  showPercentage = true,
  className = '',
}) => {
  const presentation = classifyStudentMastery(percentage, config);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${presentation.pillClass} ${className}`}
      aria-label={`Nivel de dominio: ${presentation.label}${showPercentage ? ` (${presentation.percentage}%)` : ''}`}
    >
      <span aria-hidden="true">{presentation.badgeEmoji}</span>
      <span>{presentation.label}</span>
      {showPercentage && presentation.percentage !== undefined && (
        <span className="font-mono opacity-80 text-[11px] font-semibold">
          ({presentation.percentage}%)
        </span>
      )}
    </span>
  );
};
