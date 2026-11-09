import type { SubjectAuthoringPackage } from './types';
import { ValidationError } from '@mep-ea/validation';
import { parseBlueprint, parseQuestion, parseTaxonomy } from '../schemas';

export interface ValidationReport {
  valid: boolean;
  subjectId: string;
  curriculumVersionId: string;
  errors: string[];
  warnings: string[];
  stats: {
    domainsCount: number;
    conceptsCount: number;
    evidencesCount: number;
    lessonsCount: number;
    questionsCount: number;
    blueprintsCount: number;
  };
}

/**
 * Validates a complete SubjectAuthoringPackage against Gates A, B, C, D and referential integrity rules.
 */
export function validateSubjectPackage(pkg: SubjectAuthoringPackage): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const addError = (path: string, msg: string) => {
    errors.push(`${path}: ${msg}`);
  };

  // 1. Validate taxonomy structure
  try {
    const rawTaxonomy = {
      programs: [{ id: pkg.program.id, name: pkg.program.name, subjectIds: [pkg.subject.id] }],
      subjects: [{ id: pkg.subject.id, programId: pkg.program.id, name: pkg.subject.name }],
      curriculumVersions: [pkg.curriculumVersion],
      domains: pkg.domains.map(d => ({
        id: d.id,
        subjectId: pkg.subject.id,
        name: d.name,
        curriculumVersionId: pkg.curriculumVersion.id,
      })),
      concepts: pkg.concepts.map(c => ({
        id: c.id,
        domainId: c.domainId,
        name: c.name,
        prerequisiteIds: c.prerequisiteIds,
      })),
      evidences: pkg.evidences.map(e => ({
        id: e.id,
        domainId: e.domainId,
        affirmationCode: e.affirmationCode,
        description: e.description,
        conceptIds: e.conceptIds,
      })),
    };
    parseTaxonomy(rawTaxonomy);
  } catch (err) {
    if (err instanceof ValidationError) {
      addError(err.path, err.message);
    } else {
      addError('taxonomy', (err as Error).message);
    }
  }

  // 2. Validate Questions against Gate A, B, C, D
  const domainIds = new Set(pkg.domains.map(d => d.id));
  const evidenceIds = new Set(pkg.evidences.map(e => e.id));
  const conceptIds = new Set(pkg.concepts.map(c => c.id));

  for (let i = 0; i < pkg.questions.length; i++) {
    const q = pkg.questions[i]!;
    try {
      parseQuestion(q);
      if (!domainIds.has(q.domainId)) {
        addError(`questions[${i}].domainId`, `domain ${q.domainId} not found in package`);
      }
      if (!evidenceIds.has(q.evidenceId)) {
        addError(`questions[${i}].evidenceId`, `evidence ${q.evidenceId} not found in package`);
      }
      for (const cid of q.conceptIds) {
        if (!conceptIds.has(cid)) {
          addError(`questions[${i}].conceptIds`, `concept ${cid} not found in package`);
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        addError(err.path, err.message);
      } else {
        addError(`questions[${i}]`, (err as Error).message);
      }
    }
  }

  // 3. Validate Lessons
  const lessonIds = new Set<string>();
  for (let i = 0; i < pkg.lessons.length; i++) {
    const l = pkg.lessons[i]!;
    if (lessonIds.has(l.id)) {
      addError(`lessons[${i}].id`, `duplicate lesson id: ${l.id}`);
    }
    lessonIds.add(l.id);

    if (!domainIds.has(l.domain)) {
      addError(`lessons[${i}].domain`, `domain ${l.domain} not found in package`);
    }
    if (!evidenceIds.has(l.evidenceKey)) {
      addError(`lessons[${i}].evidenceKey`, `evidence ${l.evidenceKey} not found in package`);
    }
    for (const cid of l.conceptIds) {
      if (!conceptIds.has(cid)) {
        addError(`lessons[${i}].conceptIds`, `concept ${cid} not found in package`);
      }
    }
    if (!l.title || l.title.trim().length === 0) {
      addError(`lessons[${i}].title`, 'title is required');
    }
    if (!l.microQuiz || !Array.isArray(l.microQuiz) || l.microQuiz.length === 0) {
      addError(`lessons[${i}].microQuiz`, 'microQuiz array is required');
    }
  }

  // 4. Validate Blueprints
  for (let i = 0; i < pkg.blueprints.length; i++) {
    const bp = pkg.blueprints[i]!;
    try {
      parseBlueprint(bp);
      for (const q of bp.domainQuotas) {
        if (!domainIds.has(q.domainId)) {
          addError(`blueprints[${i}].domainQuotas`, `domain ${q.domainId} not found in package`);
        }
      }
      if (bp.evidenceIds) {
        for (const eid of bp.evidenceIds) {
          if (!evidenceIds.has(eid)) {
            addError(`blueprints[${i}].evidenceIds`, `evidence ${eid} not found in package`);
          }
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        addError(err.path, err.message);
      } else {
        addError(`blueprints[${i}]`, (err as Error).message);
      }
    }
  }

  return {
    valid: errors.length === 0,
    subjectId: pkg.subject.id,
    curriculumVersionId: pkg.curriculumVersion.id,
    errors,
    warnings,
    stats: {
      domainsCount: pkg.domains.length,
      conceptsCount: pkg.concepts.length,
      evidencesCount: pkg.evidences.length,
      lessonsCount: pkg.lessons.length,
      questionsCount: pkg.questions.length,
      blueprintsCount: pkg.blueprints.length,
    },
  };
}
