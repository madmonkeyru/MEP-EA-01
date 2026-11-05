import spec from '../../../../content/programs/bxm/matematica/specs/02-2026.json';
import type { BxmDomain, QualifiedEvidenceInfo } from '../domain/types';

/** Canonical catalog; retained export name for backwards compatibility. */
export const BXM_OFFICIAL_EVIDENCES_FIXTURE: QualifiedEvidenceInfo[] = spec.blocks.flatMap(block =>
  block.affirmations.flatMap(affirmation => affirmation.evidences.map(evidence => ({
    key: `bxm/matematica/02-2026/${block.areaId}/${evidence.code}`,
    domain: block.areaId as BxmDomain,
    rawCode: evidence.code,
    affirmationCode: affirmation.code,
    description: evidence.desc,
  }))),
);
