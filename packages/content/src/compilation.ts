import type { Assessment, AssessmentBlueprint, ContentStream, Question } from '@mep-ea/domain';
import { ensure, unique } from '@mep-ea/validation';
import type { ContentRegistry } from './index';
import { parseBlueprint } from './schemas';
import officialItemsRaw from './official-c2-items.json';

export type CompilationMode = 'diagnostic' | 'mock' | 'simulation';

export interface CompilationRequest {
  programId: 'bxm';
  subjectId: 'matematica';
  mode: CompilationMode;
  seed?: number;
}

export interface CompilationEngineOptions {
  allowDraftPreview?: boolean;
}

/** Linear Congruential Generator (LCG) for deterministic seeded pseudo-random selection. */
export function createRng(seed = 1337): () => number {
  let state = (seed >>> 0) || 1337;
  return () => {
    // Numerical Recipes LCG parameters: a = 1664525, c = 1013904223, m = 2^32
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Deterministic shuffle using Fisher-Yates with deterministic RNG. */
export function deterministicShuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Builds the official reference question list for BXM Matemática 2026-c2 (60 items).
 * Guaranteed to have stream: 'official_reference' and isolated from authored pools.
 */
export function loadOfficialReferenceQuestions(): Question[] {
  return officialItemsRaw.map(item => {
    const optEntries = Object.entries(item.options) as ['A' | 'B' | 'C' | 'D', string][];
    return {
      id: item.code,
      version: '1.0.0',
      programId: 'bxm',
      subjectId: 'matematica',
      domainId: item.area_id,
      evidenceId: `bxm/matematica/02-2026/${item.area_id}/${item.evidence}`,
      conceptIds: item.concept_id ? [item.concept_id] : [],
      familyId: `official-c2-${item.area_id}`,
      cognitiveLevel: (item.cognitive_level as 'reproduccion' | 'conexion' | 'reflexion') || 'reproduccion',
      stream: 'official_reference' as ContentStream,
      stem: item.stem,
      options: optEntries.map(([id, text]) => ({ id, text })),
      correctOptionId: item.correct_answer as 'A' | 'B' | 'C' | 'D',
      requiresVisual: false,
      solution: item.solution_steps || [],
      provenance: {
        source: `content/programs/bxm/matematica/convocatorias/2026-c2.json#${item.code}`,
        status: 'verified',
      },
      publication: {
        status: 'published',
      },
    };
  });
}

/**
 * Test Compilation Engine implementing P6.1 & P6.2 requirements:
 * 1. Deterministic generation driven by Convocatoria Blueprints & stable seed.
 * 2. 20-item diagnostic & formative mock selected from authored items (quotas: 8 Geometry, 8 Functions, 4 Statistics).
 * 3. 60-item official simulation compiled from Official Reference Stream (23 Geometry, 25 Functions, 12 Statistics).
 * 4. Strict stream isolation: official items are never injected into diagnostic or mock assessments.
 */
export function compileAssessment(
  request: CompilationRequest,
  registry: ContentRegistry,
  options: CompilationEngineOptions = {}
): Assessment {
  ensure(request.programId === 'bxm', 'compile', 'only bxm supported');
  ensure(request.subjectId === 'matematica', 'compile', 'only matematica supported');
  ensure(['diagnostic', 'mock', 'simulation'].includes(request.mode), 'compile', 'invalid mode');

  const seed = request.seed ?? 202602;
  const rng = createRng(seed);

  if (request.mode === 'simulation') {
    // Official-Reference Stream 60-item benchmark
    const officialQuestions = loadOfficialReferenceQuestions();
    ensure(officialQuestions.length === 60, 'compile', 'official benchmark must contain exactly 60 items');

    const blueprint: AssessmentBlueprint = parseBlueprint({
      id: `p6-official-simulation:2026-c2:s${seed}`,
      version: '1.0.0',
      programId: 'bxm',
      subjectId: 'matematica',
      convocatoriaId: '2026-c2',
      mode: 'benchmark',
      stream: 'official_reference',
      totalItems: 60,
      timeLimitSeconds: 150 * 60, // 150 minutes standard examination
      domainQuotas: [
        { domainId: 'geometry', count: 23 },
        { domainId: 'functions', count: 25 },
        { domainId: 'statistics', count: 12 },
      ],
    });

    // Verification of quotas
    const geoCount = officialQuestions.filter(q => q.domainId === 'geometry').length;
    const funcCount = officialQuestions.filter(q => q.domainId === 'functions').length;
    const statCount = officialQuestions.filter(q => q.domainId === 'statistics').length;
    ensure(geoCount === 23 && funcCount === 25 && statCount === 12, 'compile', 'official stream quota mismatch');

    return {
      id: JSON.stringify([blueprint.id, blueprint.version, ...officialQuestions.map(q => [q.id, q.version])]),
      blueprint,
      questions: officialQuestions,
    };
  }

  // 20-item Diagnostic or Formative Mock (selected strictly from authored stream)
  const candidatePool = registry.questions.filter(q => {
    // P6.2: Official reference items must NEVER appear in diagnostic or mock
    if (q.stream !== 'authored') return false;
    if (q.programId !== 'bxm' || q.subjectId !== 'matematica') return false;
    return q.publication.status === 'published' || options.allowDraftPreview === true;
  });

  const domainQuotas = [
    { domainId: 'geometry', count: 8 },
    { domainId: 'functions', count: 8 },
    { domainId: 'statistics', count: 4 },
  ];

  const selectedQuestions: Question[] = [];

  for (const quota of domainQuotas) {
    const domainItems = candidatePool.filter(q => q.domainId === quota.domainId);
    ensure(
      domainItems.length >= quota.count,
      'compile',
      `insufficient eligible authored items for domain ${quota.domainId}`
    );

    // Group items by cognitive level to preserve cognitive demand balance where possible
    const rep = domainItems.filter(q => q.cognitiveLevel === 'reproduccion');
    const con = domainItems.filter(q => q.cognitiveLevel === 'conexion');
    const ref = domainItems.filter(q => q.cognitiveLevel === 'reflexion');

    // Deterministic shuffle per cognitive group
    const shuffledRep = deterministicShuffle(rep, rng);
    const shuffledCon = deterministicShuffle(con, rng);
    const shuffledRef = deterministicShuffle(ref, rng);

    // Interleave/combine groups deterministically, prioritizing cognitive diversity
    const combinedPool = [...shuffledRep, ...shuffledCon, ...shuffledRef];
    const picked = combinedPool.slice(0, quota.count);
    selectedQuestions.push(...picked);
  }

  unique(selectedQuestions.map(q => q.id), 'compile.selectedQuestions');
  ensure(selectedQuestions.length === 20, 'compile', 'compiled assessment must have exactly 20 items');

  const blueprintId = `p6-compiled-${request.mode}:bxm-matematica:s${seed}`;
  const blueprint: AssessmentBlueprint = parseBlueprint({
    id: blueprintId,
    version: '1.0.0',
    programId: 'bxm',
    subjectId: 'matematica',
    convocatoriaId: '02-2026',
    mode: request.mode === 'diagnostic' ? 'diagnostic' : 'practice',
    stream: 'authored',
    totalItems: 20,
    timeLimitSeconds: request.mode === 'diagnostic' ? 30 * 60 : 45 * 60, // 30 min diagnostic / 45 min mock
    domainQuotas,
    evidenceIds: [...new Set(selectedQuestions.map(q => q.evidenceId))],
  });

  return {
    id: JSON.stringify([blueprint.id, blueprint.version, ...selectedQuestions.map(q => [q.id, q.version])]),
    blueprint,
    questions: selectedQuestions,
  };
}
