import type { AssessmentBlueprint, Question } from '@mep-ea/domain';
import type { LearningLesson, LearningNode } from '../expansion';
import type { SubjectAuthoringPackage } from './types';
import { validateSubjectPackage } from './validator';

export interface IngestedSubjectContent {
  package: SubjectAuthoringPackage;
  nodes: LearningNode[];
  lessons: LearningLesson[];
  questions: Question[];
  blueprints: AssessmentBlueprint[];
}

/**
 * Ingests a validated SubjectAuthoringPackage into runtime-ready nodes, lessons, questions, and blueprints.
 */
export function ingestSubjectPackage(pkg: SubjectAuthoringPackage): IngestedSubjectContent {
  const report = validateSubjectPackage(pkg);
  if (!report.valid) {
    throw new Error(`Failed to ingest subject package ${pkg.subject.id}: \n- ${report.errors.join('\n- ')}`);
  }

  const lessons: LearningLesson[] = pkg.lessons.map(l => ({
    id: l.id,
    domain: l.domain,
    evidenceKey: l.evidenceKey,
    evidenceCode: l.evidenceCode,
    title: l.title,
    subtitle: l.subtitle,
    conceptIds: [...l.conceptIds],
    prerequisites: [...l.prerequisites],
    formulas: l.formulas ?? [],
    coreExplanation: l.coreExplanation,
    commonMistakes: [...l.commonMistakes],
    workedExample: { ...l.workedExample },
    interactiveVisualType: l.interactiveVisualType ?? null,
    microQuiz: l.microQuiz.map(mq => ({
      id: mq.id,
      question: mq.question,
      options: { ...mq.options },
      correctOption: mq.correctOption,
      explanation: mq.explanation,
    })),
    publication: { status: 'draft' as const },
  }));

  const questions: Question[] = pkg.questions.map(q => ({
    ...q,
  }));

  const nodes: LearningNode[] = pkg.evidences.map(e => {
    const lesson = lessons.find(l => l.evidenceKey === e.id) ?? null;
    const practiceItems = questions.filter(q => q.evidenceId === e.id && q.stream === 'authored');
    const practiceBlueprintId = practiceItems.length ? `p2-practice:${e.id}` : null;

    return {
      key: e.id,
      domainId: e.domainId,
      code: e.affirmationCode,
      description: e.description,
      status: 'complete',
      reviewStatus: 'verified',
      lesson,
      conceptIds: [...e.conceptIds],
      practiceItemIds: practiceItems.map(q => q.id),
      practiceBlueprintId,
    };
  });

  const practiceBlueprints: AssessmentBlueprint[] = nodes
    .filter(n => n.practiceBlueprintId && n.practiceItemIds.length > 0)
    .map(n => ({
      id: n.practiceBlueprintId!,
      version: '1.0.0',
      programId: pkg.program.id,
      subjectId: pkg.subject.id,
      convocatoriaId: pkg.curriculumVersion.version,
      curriculumVersionId: pkg.curriculumVersion.id,
      mode: 'practice',
      stream: 'authored',
      totalItems: n.practiceItemIds.length,
      timeLimitSeconds: n.practiceItemIds.length * 180,
      evidenceIds: [n.key],
      domainQuotas: [{ domainId: n.domainId, count: n.practiceItemIds.length }],
    }));

  const allBlueprints: AssessmentBlueprint[] = [
    ...pkg.blueprints,
    ...practiceBlueprints,
  ];

  return {
    package: pkg,
    nodes,
    lessons,
    questions,
    blueprints: allBlueprints,
  };
}
