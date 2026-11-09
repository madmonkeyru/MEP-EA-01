import raw from './expansion-data.json';
import type { AssessmentBlueprint, Question } from '@mep-ea/domain';
import { ensure, unique } from '@mep-ea/validation';
import { loadRegistry, parseBlueprint, type ContentRegistry } from './index';

export type LessonFormulas = { name: string; latex: string; notes: string };
export type LessonCommonMistake = { mistake: string; description: string; correction: string };
export type LessonWorkedExample = {
  statement: string;
  primaryMethod: { name: string; steps: string[] };
  alternativeMethod?: { name: string; steps: string[] };
};
export type LessonMicroQuiz = {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: string;
  explanation: string;
};

export interface LearningLesson {
  id: string;
  domain: string;
  evidenceKey: string;
  evidenceCode: string;
  title: string;
  subtitle: string;
  conceptIds: string[];
  prerequisites: string[];
  formulas: LessonFormulas[];
  coreExplanation: string;
  commonMistakes: LessonCommonMistake[];
  workedExample: LessonWorkedExample;
  interactiveVisualType: string | null;
  microQuiz: LessonMicroQuiz[];
  publication: { status: 'draft' };
}
export interface LearningNode {
  key: string; domainId: string; code: string; description: string;
  status: 'complete' | 'scaffolded_available_soon'; reviewStatus: string;
  conceptIds: string[]; lesson: LearningLesson | null; practiceItemIds: string[];
  practiceBlueprintId: string | null;
}
export interface LearningCatalog {
  registry: ContentRegistry; nodes: LearningNode[]; lessons: LearningLesson[];
  blueprints: AssessmentBlueprint[]; allowDraftPreview: true;
}
/** Explicit development catalog. Source completion describes asset coverage, never editorial approval. */
export function createLearningPreviewCatalog(): LearningCatalog {
  ensure(raw.authored.provenance === 'authored_proprietary', 'learning', 'authored stream required');
  const lessons: LearningLesson[] = raw.lessons.lessons.map(l => ({ ...l, publication: { status: 'draft' } }));
  unique(lessons.map(l => l.id), 'learning.lessons');
  unique(raw.evidence.evidences.map(e => e.key), 'learning.evidence');
  const questions = raw.authored.items.map(item => {
    ensure(item.provenance === 'authored_proprietary' && item.reviewStatus === 'authored_computationally_checked', item.id, 'invalid authored provenance');
    return {
      id: item.id, version: item.templateVersion, programId: 'bxm', subjectId: 'matematica',
      domainId: item.domain, evidenceId: item.evidenceKey, conceptIds: [item.conceptId],
      familyId: item.familyId, cognitiveLevel: item.cognitiveLevel, stream: 'authored',
      stem: item.stem, options: Object.entries(item.options).map(([id, text]) => ({ id, text,
        ...(id in item.distractorRationale ? { rationale: item.distractorRationale[id as keyof typeof item.distractorRationale] } : {}) })),
      correctOptionId: item.correctOption, requiresVisual: false, solution: item.solutionSteps,
      provenance: { source: `content/bxm-mvp-learning/authored-items-pack.json#${item.id}`, status: item.reviewStatus },
      publication: { status: 'draft' },
    };
  });
  const nodes: LearningNode[] = raw.evidence.evidences.map(e => {
    ensure(e.status === 'complete' || e.status === 'scaffolded_available_soon', e.key, 'unknown coverage status');
    const lesson = lessons.find(l => l.id === e.lessonId) ?? null;
    ensure(e.status === 'complete' ? lesson?.evidenceKey === e.key && lesson.domain === e.domain : e.lessonId === null, e.key, 'invalid lesson linkage');
    const items = questions.filter(q => q.evidenceId === e.key);
    return { key: e.key, domainId: e.domain, code: e.evidenceCode, description: e.evidenceDesc,
      status: e.status, reviewStatus: e.reviewStatus, lesson,
      conceptIds: [...new Set([...e.conceptIds, ...(lesson?.conceptIds ?? []), ...items.flatMap(q => q.conceptIds)])],
      practiceItemIds: items.map(q => q.id), practiceBlueprintId: items.length ? `p2-practice:${e.key}` : null };
  });
  ensure(lessons.every(l => nodes.some(n => n.lesson?.id === l.id)), 'learning', 'orphan lesson');
  const usedConcepts = new Set(nodes.flatMap(n => n.conceptIds));
  const registry = loadRegistry({
    programs: [{ id: 'bxm', name: 'Bachillerato por Madurez Suficiente', subjectIds: ['matematica'] }],
    subjects: [{ id: 'matematica', programId: 'bxm', name: 'Matemática' }],
    domains: [...new Map(raw.evidence.evidences.map(e => [e.domain, { id: e.domain, subjectId: 'matematica', name: e.blockName }])).values()],
    concepts: raw.concepts.filter(c => usedConcepts.has(c.id)).map(c => ({ id: c.id, domainId: c.domain, name: c.term, prerequisiteIds: [] })),
    evidences: nodes.map(n => ({ id: n.key, domainId: n.domainId,
      affirmationCode: raw.evidence.evidences.find(e => e.key === n.key)!.affirmationCode,
      description: n.description, conceptIds: n.conceptIds })),
  }, questions);
  const blueprint = (id: string, mode: 'practice' | 'diagnostic', items: Question[]) => parseBlueprint({
    id, version: raw.authored.packVersion, programId: 'bxm', subjectId: 'matematica', convocatoriaId: raw.evidence.specId,
    mode, stream: 'authored', totalItems: items.length, timeLimitSeconds: items.length * 180,
    ...(mode === 'practice' ? { evidenceIds: [...new Set(items.map(q => q.evidenceId))] } : {}),
    domainQuotas: [...new Set(items.map(q => q.domainId))].map(domainId => ({ domainId, count: items.filter(q => q.domainId === domainId).length })),
  });
  const blueprints = [blueprint('p2-authored-diagnostic', 'diagnostic', registry.questions), ...nodes.filter(n => n.practiceBlueprintId).map(n =>
    blueprint(n.practiceBlueprintId!, 'practice', registry.questions.filter(q => q.evidenceId === n.key)))];
  return { registry, nodes, lessons, blueprints, allowDraftPreview: true };
}
