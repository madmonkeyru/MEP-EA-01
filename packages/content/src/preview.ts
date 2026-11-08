import raw from './representative.json';
import { loadRegistry, parseBlueprint, resolveBlueprint } from './index';
/** Development reference only. Imported POC content retains draft status; no reviewer signoff is invented. */
export function createFoundationAssessment() {
  return resolveBlueprint(parseBlueprint(raw.blueprint), loadRegistry(raw.taxonomy, raw.questions), { allowDraftPreview: true });
}
