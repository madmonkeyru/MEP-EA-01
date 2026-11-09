import type { AssessmentBlueprint } from '@mep-ea/domain';
import { createLearningPreviewCatalog, type LearningCatalog, type LearningNode } from './expansion';
import {
  civicaAuthoredQuestions,
  civicaDiagnosticBlueprint,
  civicaMockBlueprint,
  civicaOfficialSimulationBlueprint,
  civicaTaxonomy,
} from './secondSubjectFixture';
import { loadRegistry } from './index';

/**
 * Creates a generalized multi-subject learning catalog combining
 * BXM Matemática and BXM Educación Cívica 02-2026.
 */
export function createMultiSubjectCatalog(): LearningCatalog {
  const base = createLearningPreviewCatalog();

  const civicaNodes: LearningNode[] = civicaTaxonomy.evidences.map(e => {
    const items = civicaAuthoredQuestions.filter(q => q.evidenceId === e.id);
    return {
      key: e.id,
      domainId: e.domainId,
      code: e.affirmationCode,
      description: e.description,
      status: 'complete',
      reviewStatus: 'verified',
      lesson: null,
      conceptIds: [...e.conceptIds],
      practiceItemIds: items.map(q => q.id),
      practiceBlueprintId: items.length ? `p2-practice:${e.id}` : null,
    };
  });

  const allNodes: LearningNode[] = [...base.nodes, ...civicaNodes];
  const allQuestions = [...base.registry.questions, ...civicaAuthoredQuestions];

  const mergedTaxonomy = {
    programs: [
      { id: 'bxm', name: 'Bachillerato por Madurez Suficiente', subjectIds: ['matematica', 'civica'] },
    ],
    subjects: [
      ...base.registry.taxonomy.subjects,
      { id: 'civica', programId: 'bxm', name: 'Educación Cívica' },
    ],
    curriculumVersions: civicaTaxonomy.curriculumVersions,
    domains: [
      ...base.registry.taxonomy.domains,
      ...civicaTaxonomy.domains,
    ],
    concepts: [
      ...base.registry.taxonomy.concepts,
      ...civicaTaxonomy.concepts,
    ],
    evidences: [
      ...base.registry.taxonomy.evidences,
      ...civicaTaxonomy.evidences,
    ],
  };

  const registry = loadRegistry(mergedTaxonomy, allQuestions);

  const civicaPracticeBlueprints: AssessmentBlueprint[] = civicaNodes
    .filter(n => n.practiceBlueprintId)
    .map(n => ({
      id: n.practiceBlueprintId!,
      version: '1.0.0',
      programId: 'bxm',
      subjectId: 'civica',
      convocatoriaId: '02-2026',
      mode: 'practice',
      stream: 'authored',
      totalItems: n.practiceItemIds.length,
      timeLimitSeconds: n.practiceItemIds.length * 180,
      evidenceIds: [n.key],
      domainQuotas: [{ domainId: n.domainId, count: n.practiceItemIds.length }],
    }));

  const allBlueprints: AssessmentBlueprint[] = [
    ...base.blueprints,
    civicaDiagnosticBlueprint,
    civicaMockBlueprint,
    civicaOfficialSimulationBlueprint,
    ...civicaPracticeBlueprints,
  ];

  return {
    registry,
    nodes: allNodes,
    lessons: base.lessons,
    blueprints: allBlueprints,
    allowDraftPreview: true,
  };
}
