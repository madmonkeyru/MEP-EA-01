import type { Assessment, AssessmentBlueprint, CurriculumTaxonomy, Question } from '@mep-ea/domain';
import { ensure, unique } from '@mep-ea/validation';
import { parseBlueprint, parseQuestion, parseTaxonomy } from './schemas';
export * from './schemas';
export * from './compilation';

export interface ContentRegistry { taxonomy: CurriculumTaxonomy; questions: Question[] }
export function loadRegistry(taxonomy: unknown, items: unknown[]): ContentRegistry {
  const registry = { taxonomy: parseTaxonomy(taxonomy), questions: items.map(parseQuestion) };
  unique(registry.questions.map(q => q.id), 'registry.questions');
  for (const q of registry.questions) {
    ensure(registry.taxonomy.subjects.some(s => s.id === q.subjectId && s.programId === q.programId), q.id, 'invalid program/subject');
    ensure(registry.taxonomy.domains.some(d => d.id === q.domainId && d.subjectId === q.subjectId), q.id, 'invalid domain');
    const evidence = registry.taxonomy.evidences.find(e => e.id === q.evidenceId && e.domainId === q.domainId);
    ensure(evidence && q.conceptIds.every(id => evidence.conceptIds.includes(id)), q.id, 'invalid evidence/concept mapping');
  }
  return registry;
}
/** Stable ID ordering gives reproducible P0 compilation; seeded balancing is a later capability. */
export function resolveBlueprint(raw: AssessmentBlueprint, registry: ContentRegistry, options: { allowDraftPreview?: boolean } = {}): Assessment {
  const blueprint = parseBlueprint(raw);
  ensure(registry.taxonomy.subjects.some(s => s.id === blueprint.subjectId && s.programId === blueprint.programId), blueprint.id, 'unknown program/subject');
  ensure(!blueprint.evidenceIds || blueprint.evidenceIds.every(id => registry.taxonomy.evidences.some(e => e.id === id)), blueprint.id, 'unknown evidence');
  const candidates = registry.questions.map(parseQuestion).filter(q =>
    q.programId === blueprint.programId && q.subjectId === blueprint.subjectId && q.stream === blueprint.stream &&
    (!blueprint.evidenceIds || blueprint.evidenceIds.includes(q.evidenceId)) &&
    (q.publication.status === 'published' || options.allowDraftPreview === true));
  unique(candidates.map(q => q.id), 'assessment.questions');
  const questions = blueprint.domainQuotas.flatMap(quota => {
    const pool = candidates.filter(q => q.domainId === quota.domainId).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    ensure(pool.length >= quota.count, blueprint.id, `insufficient eligible questions in ${quota.domainId}`);
    return pool.slice(0, quota.count);
  });
  // Identity pins the exact question revisions and order, not only the blueprint label.
  return { id: JSON.stringify([blueprint.id, blueprint.version, ...questions.map(q => [q.id, q.version])]), blueprint, questions };
}
