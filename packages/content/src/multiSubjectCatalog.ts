import type { LearningCatalog, LearningLesson, LearningNode } from './expansion';
import type { SubjectAuthoringPackage } from './authoring/types';
import type { AssessmentBlueprint, CurriculumTaxonomy, Question } from '@mep-ea/domain';
import { createLearningPreviewCatalog } from './expansion';
import { ingestSubjectPackage } from './authoring/ingestion';
import {
  civicaAuthoredQuestions,
  civicaDiagnosticBlueprint,
  civicaMockBlueprint,
  civicaOfficialSimulationBlueprint,
  civicaTaxonomy,
} from './secondSubjectFixture';
import { loadRegistry } from './index';

// Import Estudios Sociales authored package
import estudiosSocialesPackageJson from './data/estudios-sociales-package.json';

/**
 * Registry of authorized and published subject authoring packages.
 * Only validated and explicitly registered packages are exposed to runtime.
 */
export const registeredSubjectPackages: SubjectAuthoringPackage[] = [
  estudiosSocialesPackageJson as unknown as SubjectAuthoringPackage,
];

/**
 * Creates a generalized multi-subject learning catalog combining
 * all base, fixture, and registered subject packages dynamically.
 */
export function createMultiSubjectCatalog(customPackages?: SubjectAuthoringPackage[]): LearningCatalog {
  const base = createLearningPreviewCatalog();

  // 1. Cívica fixture nodes
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

  // 2. Ingest registered subject packages dynamically
  const packagesToIngest = customPackages ?? registeredSubjectPackages;
  const ingestedResults = packagesToIngest.map(pkg => ingestSubjectPackage(pkg));

  const allNodes: LearningNode[] = [
    ...base.nodes,
    ...civicaNodes,
    ...ingestedResults.flatMap(r => r.nodes),
  ];

  const allLessons: LearningLesson[] = [
    ...base.lessons,
    ...ingestedResults.flatMap(r => r.lessons),
  ];

  const allQuestions: Question[] = [
    ...base.registry.questions,
    ...civicaAuthoredQuestions,
    ...ingestedResults.flatMap(r => r.questions),
  ];

  const allSubjectIds = [
    'matematica',
    'civica',
    ...packagesToIngest.map(p => p.subject.id),
  ];

  const mergedTaxonomy: CurriculumTaxonomy = {
    programs: [
      {
        id: 'bxm',
        name: 'Bachillerato por Madurez Suficiente',
        subjectIds: [...new Set(allSubjectIds)],
      },
    ],
    subjects: [
      ...base.registry.taxonomy.subjects,
      { id: 'civica', programId: 'bxm', name: 'Educación Cívica' },
      ...packagesToIngest.map(p => ({
        id: p.subject.id,
        programId: p.program.id,
        name: p.subject.name,
      })),
    ],
    curriculumVersions: [
      ...(base.registry.taxonomy.curriculumVersions ?? []),
      ...(civicaTaxonomy.curriculumVersions ?? []),
      ...packagesToIngest.map(p => p.curriculumVersion),
    ],
    domains: [
      ...base.registry.taxonomy.domains,
      ...civicaTaxonomy.domains,
      ...packagesToIngest.flatMap(p =>
        p.domains.map(d => ({
          id: d.id,
          subjectId: p.subject.id,
          name: d.name,
          curriculumVersionId: p.curriculumVersion.id,
        }))
      ),
    ],
    concepts: [
      ...base.registry.taxonomy.concepts,
      ...civicaTaxonomy.concepts,
      ...packagesToIngest.flatMap(p => p.concepts),
    ],
    evidences: [
      ...base.registry.taxonomy.evidences,
      ...civicaTaxonomy.evidences,
      ...packagesToIngest.flatMap(p => p.evidences),
    ],
  };

  const registry = loadRegistry(mergedTaxonomy, allQuestions);

  const allBlueprints: AssessmentBlueprint[] = [
    ...base.blueprints,
    civicaDiagnosticBlueprint,
    civicaMockBlueprint,
    civicaOfficialSimulationBlueprint,
    ...civicaPracticeBlueprints,
    ...ingestedResults.flatMap(r => r.blueprints),
  ];

  return {
    registry,
    nodes: allNodes,
    lessons: allLessons,
    blueprints: allBlueprints,
    allowDraftPreview: true,
  };
}
