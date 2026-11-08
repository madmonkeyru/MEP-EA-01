import raw from './representative.json';
import { loadRegistry, parseBlueprint, resolveBlueprint } from './index';
/** Development reference only. Imported POC content retains draft status; no reviewer signoff is invented. */
export function createFoundationAssessment() {
  return resolveBlueprint(parseBlueprint(raw.blueprint), loadRegistry(raw.taxonomy, raw.questions), { allowDraftPreview: true });
}
/** Explicit draft-only P1 review catalog. Production resolution still requires Gate D. */
export function createJourneyPreviewCatalog() {
  return { registry: loadRegistry(raw.taxonomy, raw.questions), blueprints: [parseBlueprint(raw.blueprint)], allowDraftPreview: true };
}
