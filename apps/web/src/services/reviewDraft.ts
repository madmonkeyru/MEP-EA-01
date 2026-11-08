import draft from '../../../../content/programs/i_ii_ciclo/matematica/drafts/2026-c2.json';
import type { Item, PracticeConfig } from '../types';

export const reviewScheduleUrl = draft.scheduleSourceUrl;

export const reviewConfig: PracticeConfig = {
  reviewDraft: 'cico-2026-c2',
  mode: 'simulation',
  title: 'Revisión pedagógica · Matemáticas I y II Ciclo',
  itemCount: draft.totalItems,
  enableTimer: true,
  timerDurationMinutes: draft.timeLimitMinutes,
};

export function isReviewContext(context: { programId?: string; subjectId?: string; convocatoriaId?: string }) {
  return context.programId === draft.programId && context.subjectId === 'matematicas' &&
    context.convocatoriaId === draft.convocatoriaId;
}

export function getReviewItems(config: PracticeConfig): Item[] {
  if (config.reviewDraft !== reviewConfig.reviewDraft || !isReviewContext(config)) return [];

  return mapCicoItems(true);
}

export function getPublishedCicoItems(): Item[] {
  return draft.status === 'released' && draft.review.status === 'complete' ? mapCicoItems(false) : [];
}

function mapCicoItems(review: boolean): Item[] {
  let position = 0;
  return draft.sections.flatMap(section => section.items.map(item => {
    position++;
    return {
      id: review ? -position : item.publicId,
      code: item.code,
      area: section.blockCode,
      area_id: section.areaId,
      topic: section.blockCode,
      stem: item.stem,
      options: item.options,
      correct_answer: item.correctAnswer as Item['correct_answer'],
      solution_steps: [item.solution],
      spec: { block: section.blockCode, evidence: item.evidence },
      visual_spec: item.visual_spec,
      calculator_allowed: draft.calculatorAllowed,
      provenance: draft.provenance,
    };
  }));
}
