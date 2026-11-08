import type { Attempt, Diagnostic, RemediationPlan, AssessmentBlueprint } from '@mep-ea/domain';
import { loadRegistry, parseBlueprint, type ContentRegistry } from '@mep-ea/content';
import { object, text, list, ensure, unique } from '@mep-ea/validation';

export interface LearnerIdentity { learnerId: string }
export interface AttemptRecord {
  schemaVersion: 1; revision: 1; attempt: Attempt; receivedAt: string;
  result: { diagnostic: Diagnostic; remediation: RemediationPlan };
}
export interface CatalogPackage {
  schemaVersion: 1; version: string; channel: 'production' | 'development';
  registry: ContentRegistry; blueprints: AssessmentBlueprint[];
}
export function parseCatalogPackage(raw: unknown): CatalogPackage {
  const v = object(raw, 'catalog');
  ensure(v.schemaVersion === 1 && (v.channel === 'production' || v.channel === 'development'), 'catalog', 'unsupported package');
  const registry = object(v.registry, 'catalog.registry');
  const parsed = loadRegistry(registry.taxonomy, list(registry.questions, 'catalog.questions'));
  ensure(v.channel !== 'production' || parsed.questions.every(q => q.publication.status === 'published'), 'catalog', 'draft content prohibited');
  const blueprints = list(v.blueprints, 'catalog.blueprints').map(parseBlueprint);
  unique(blueprints.map(b => b.id), 'catalog.blueprints');
  return { schemaVersion: 1, version: text(v.version, 'catalog.version'), channel: v.channel,
    registry: parsed, blueprints };
}
