import type { AssessmentBlueprint, Concept, CurriculumTaxonomy, CurriculumVersion, Program, Question, VisualSpecification } from '@mep-ea/domain';
import { ensure, finite, integer, list, object, oneOf, text, timestamp, unique } from '@mep-ea/validation';

const programs = ['bxm', 'edad', 'iii_ciclo', 'i_ii_ciclo'] as const;
const optionIds = ['A', 'B', 'C', 'D'] as const;
const strings = (value: unknown, path: string) => list(value, path).map((v, i) => text(v, `${path}[${i}]`));
function pair(value: unknown, path: string): [number, number] {
  const v = list(value, path); ensure(v.length === 2, path, 'expected two coordinates');
  return [finite(v[0], path), finite(v[1], path)];
}
export function parseVisual(value: unknown): VisualSpecification {
  const v = object(value, 'visual'); const alt = text(v.alt, 'visual.alt');
  const kind = oneOf(v.kind, ['circle', 'coordinate-plane'] as const, 'visual.kind');
  if (kind === 'circle') {
    const radius = finite(v.radius, 'visual.radius'); ensure(radius > 0, 'visual.radius', 'must be positive');
    return { kind, alt, center: pair(v.center, 'visual.center'), radius };
  }
  const xRange = pair(v.xRange, 'visual.xRange'); const yRange = pair(v.yRange, 'visual.yRange');
  ensure(xRange[0] < xRange[1] && yRange[0] < yRange[1], 'visual', 'invalid coordinate bounds');
  return { kind, alt, xRange, yRange, points: list(v.points, 'visual.points').map(p => {
    const point = object(p, 'point'); return { x: finite(point.x, 'point.x'), y: finite(point.y, 'point.y'), label: text(point.label, 'point.label') };
  }) };
}
export function parseProgram(value: unknown): Program {
  const v = object(value, 'program'); return { id: oneOf(v.id, programs, 'program.id'), name: text(v.name, 'program.name'), subjectIds: strings(v.subjectIds, 'program.subjectIds') };
}
export function parseConcept(value: unknown): Concept {
  const v = object(value, 'concept'); const id = text(v.id, 'concept.id'); const prerequisiteIds = strings(v.prerequisiteIds, 'concept.prerequisiteIds');
  unique(prerequisiteIds, 'concept.prerequisiteIds'); ensure(!prerequisiteIds.includes(id), 'concept', 'cannot require itself');
  return { id, domainId: text(v.domainId, 'concept.domainId'), name: text(v.name, 'concept.name'), prerequisiteIds };
}
export function parseCurriculumVersion(value: unknown): CurriculumVersion {
  const v = object(value, 'curriculumVersion');
  return {
    id: text(v.id, 'curriculumVersion.id'),
    programId: oneOf(v.programId, programs, 'curriculumVersion.programId'),
    subjectId: text(v.subjectId, 'curriculumVersion.subjectId'),
    version: text(v.version, 'curriculumVersion.version'),
    effectiveFrom: text(v.effectiveFrom, 'curriculumVersion.effectiveFrom'),
    ...(v.effectiveTo ? { effectiveTo: text(v.effectiveTo, 'curriculumVersion.effectiveTo') } : {}),
    sourceReference: text(v.sourceReference, 'curriculumVersion.sourceReference'),
    status: oneOf(v.status, ['active', 'archived', 'draft'] as const, 'curriculumVersion.status'),
  };
}

export function parseQuestion(value: unknown): Question {
  const v = object(value, 'question');
  const options = list(v.options, 'question.options').map((raw, i) => {
    const option = object(raw, `options[${i}]`); return {
      id: oneOf(option.id, optionIds, 'option.id'), text: text(option.text, 'option.text'),
      ...(option.rationale === undefined ? {} : { rationale: text(option.rationale, 'option.rationale') }),
    };
  });
  ensure(options.length === 4, 'question.options', 'exactly four options required');
  unique(options.map(o => o.id), 'question.options'); unique(options.map(o => o.text.trim()), 'question.options.text');
  const correctOptionId = oneOf(v.correctOptionId, optionIds, 'question.correctOptionId');
  ensure(typeof v.requiresVisual === 'boolean', 'question.requiresVisual', 'expected boolean');
  const visual = v.visual === undefined ? undefined : parseVisual(v.visual);
  ensure(!v.requiresVisual || visual, 'question.visual', 'referenced figure is missing (Gate B)');
  const provenance = object(v.provenance, 'question.provenance'); const publication = object(v.publication, 'question.publication');
  const status = oneOf(publication.status, ['draft', 'published'] as const, 'publication.status');
  let signoff: Question['publication']['signoff'];
  if (publication.signoff !== undefined) {
    const s = object(publication.signoff, 'publication.signoff');
    const gates = strings(s.gates, 'signoff.gates');
    ensure(gates.length === 4 && ['A', 'B', 'C', 'D'].every(g => gates.includes(g)), 'signoff.gates', 'all gates required');
    signoff = { reviewerId: text(s.reviewerId, 'signoff.reviewerId'), reviewedAt: timestamp(s.reviewedAt, 'signoff.reviewedAt'), gates: ['A', 'B', 'C', 'D'] };
  }
  const provenanceStatus = oneOf(provenance.status, ['source_unverified', 'authored_computationally_checked', 'verified'] as const, 'provenance.status');
  ensure(status !== 'published' || (signoff && provenanceStatus !== 'source_unverified'), 'publication', 'reviewed provenance and signoff required (Gate D)');
  const stem = text(v.stem, 'question.stem');
  // Unescaped dollar delimiters must be balanced; full typesetting stays in platform renderers.
  ensure((stem.match(/(?<!\\)\$/g)?.length ?? 0) % 2 === 0, 'question.stem', 'unbalanced math delimiters');
  const conceptIds = strings(v.conceptIds, 'question.conceptIds'); ensure(conceptIds.length > 0, 'question.conceptIds', 'concept mapping required (Gate C)');
  return {
    id: text(v.id, 'question.id'), version: text(v.version, 'question.version'), programId: oneOf(v.programId, programs, 'question.programId'),
    subjectId: text(v.subjectId, 'question.subjectId'), domainId: text(v.domainId, 'question.domainId'), evidenceId: text(v.evidenceId, 'question.evidenceId'),
    conceptIds, familyId: text(v.familyId, 'question.familyId'), cognitiveLevel: oneOf(v.cognitiveLevel, ['reproduccion', 'conexion', 'reflexion'] as const, 'question.cognitiveLevel'),
    stream: oneOf(v.stream, ['authored', 'official_reference'] as const, 'question.stream'), stem, options, correctOptionId,
    requiresVisual: v.requiresVisual, ...(visual ? { visual } : {}), solution: strings(v.solution, 'question.solution'),
    ...(v.curriculumVersionId ? { curriculumVersionId: text(v.curriculumVersionId, 'question.curriculumVersionId') } : {}),
    provenance: { source: text(provenance.source, 'provenance.source'), status: provenanceStatus }, publication: { status, ...(signoff ? { signoff } : {}) },
  };
}
export function parseBlueprint(value: unknown): AssessmentBlueprint {
  const v = object(value, 'blueprint');
  const totalItems = integer(v.totalItems, 'blueprint.totalItems', 1);
  const domainQuotas = list(v.domainQuotas, 'blueprint.domainQuotas').map(raw => {
    const q = object(raw, 'quota'); return { domainId: text(q.domainId, 'quota.domainId'), count: integer(q.count, 'quota.count', 1) };
  });
  unique(domainQuotas.map(q => q.domainId), 'blueprint.domainQuotas');
  ensure(domainQuotas.reduce((n, q) => n + q.count, 0) === totalItems, 'blueprint', 'quotas must sum to totalItems');
  const mode = oneOf(v.mode, ['diagnostic', 'practice', 'benchmark'] as const, 'blueprint.mode');
  const stream = oneOf(v.stream, ['authored', 'official_reference'] as const, 'blueprint.stream');
  ensure(stream !== 'official_reference' || mode === 'benchmark', 'blueprint.stream', 'official items reserved for benchmarks');
  const evidenceIds = v.evidenceIds === undefined ? undefined : strings(v.evidenceIds, 'blueprint.evidenceIds');
  if (evidenceIds) { ensure(evidenceIds.length > 0, 'blueprint.evidenceIds', 'cannot be empty'); unique(evidenceIds, 'blueprint.evidenceIds'); }
  return { id: text(v.id, 'blueprint.id'), version: text(v.version, 'blueprint.version'), programId: oneOf(v.programId, programs, 'blueprint.programId'),
    subjectId: text(v.subjectId, 'blueprint.subjectId'), convocatoriaId: text(v.convocatoriaId, 'blueprint.convocatoriaId'),
    ...(v.curriculumVersionId ? { curriculumVersionId: text(v.curriculumVersionId, 'blueprint.curriculumVersionId') } : {}),
    mode, stream, totalItems, timeLimitSeconds: integer(v.timeLimitSeconds, 'blueprint.timeLimitSeconds', 1), domainQuotas,
    ...(evidenceIds ? { evidenceIds } : {}) };
}
export function parseTaxonomy(value: unknown): CurriculumTaxonomy {
  const v = object(value, 'taxonomy');
  const curriculumVersions = v.curriculumVersions === undefined ? undefined : list(v.curriculumVersions, 'curriculumVersions').map(parseCurriculumVersion);
  const taxonomy: CurriculumTaxonomy = {
    programs: list(v.programs, 'programs').map(parseProgram), concepts: list(v.concepts, 'concepts').map(parseConcept),
    subjects: list(v.subjects, 'subjects').map(raw => { const s = object(raw, 'subject'); return { id: text(s.id, 'subject.id'), name: text(s.name, 'subject.name'), programId: oneOf(s.programId, programs, 'subject.programId') }; }),
    domains: list(v.domains, 'domains').map(raw => { const d = object(raw, 'domain'); return { id: text(d.id, 'domain.id'), subjectId: text(d.subjectId, 'domain.subjectId'), name: text(d.name, 'domain.name'), ...(d.curriculumVersionId ? { curriculumVersionId: text(d.curriculumVersionId, 'domain.curriculumVersionId') } : {}) }; }),
    evidences: list(v.evidences, 'evidences').map(raw => { const e = object(raw, 'evidence'); return { id: text(e.id, 'evidence.id'), domainId: text(e.domainId, 'evidence.domainId'), affirmationCode: text(e.affirmationCode, 'evidence.affirmationCode'), description: text(e.description, 'evidence.description'), conceptIds: strings(e.conceptIds, 'evidence.conceptIds') }; }),
    ...(curriculumVersions ? { curriculumVersions } : {}),
  };
  for (const [key, entities] of Object.entries(taxonomy)) unique(entities.map((e: { id: string }) => e.id), `taxonomy.${key}`);
  for (const p of taxonomy.programs) ensure(p.subjectIds.every(id => taxonomy.subjects.some(s => s.id === id && s.programId === p.id)), p.id, 'unknown subject');
  for (const s of taxonomy.subjects) ensure(taxonomy.programs.some(p => p.id === s.programId && p.subjectIds.includes(s.id)), s.id, 'unknown program');
  for (const d of taxonomy.domains) ensure(taxonomy.subjects.some(s => s.id === d.subjectId), d.id, 'unknown subject');
  for (const c of taxonomy.concepts) {
    ensure(taxonomy.domains.some(d => d.id === c.domainId), c.id, 'unknown domain');
    ensure(c.prerequisiteIds.every(id => taxonomy.concepts.some(p => p.id === id)), c.id, 'unknown prerequisite');
  }
  const visit = (id: string, ancestors: Set<string>) => {
    ensure(!ancestors.has(id), id, 'cyclic prerequisites');
    for (const next of taxonomy.concepts.find(c => c.id === id)!.prerequisiteIds) visit(next, new Set([...ancestors, id]));
  };
  for (const c of taxonomy.concepts) visit(c.id, new Set());
  for (const e of taxonomy.evidences) ensure(taxonomy.domains.some(d => d.id === e.domainId) && e.conceptIds.every(id => taxonomy.concepts.some(c => c.id === id && c.domainId === e.domainId)), e.id, 'invalid evidence mapping');
  return taxonomy;
}
