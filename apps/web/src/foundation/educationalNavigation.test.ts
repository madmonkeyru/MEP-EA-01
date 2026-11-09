import { describe, it, expect } from 'vitest';
import { parseEducationalHash, serializeEducationalHash } from './educationalNavigation';

describe('educationalNavigation (P10.4 Durable Navigation & Context)', () => {
  it('parses bare tab hash routes', () => {
    expect(parseEducationalHash('#/practicar')).toEqual({ tab: 'practicar' });
    expect(parseEducationalHash('#progreso')).toEqual({ tab: 'progreso' });
    expect(parseEducationalHash('')).toEqual({ tab: 'aprender' });
  });

  it('parses structured program and subject routes', () => {
    const route = parseEducationalHash('#/program/bxm/subject/civica/tab/practicar');
    expect(route).toEqual({
      programId: 'bxm',
      subjectId: 'civica',
      tab: 'practicar',
    });
  });

  it('parses evidence deep links', () => {
    const route = parseEducationalHash('#/program/bxm/subject/matematica/evidence/bxm%2Fmatematica%2F02-2026%2Fgeometry%2FA1.1');
    expect(route).toEqual({
      programId: 'bxm',
      subjectId: 'matematica',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.1',
      tab: 'aprender',
    });
  });

  it('serializes context roundtrip without losing educational parameters', () => {
    const original = {
      programId: 'bxm',
      subjectId: 'civica',
      evidenceKey: 'bxm/civica/02-2026/regimenes/E1.1',
      tab: 'aprender' as const,
    };
    const hash = serializeEducationalHash(original);
    const parsed = parseEducationalHash(hash);
    expect(parsed).toEqual(original);
  });
});
