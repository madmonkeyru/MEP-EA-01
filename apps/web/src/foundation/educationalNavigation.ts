export interface EducationalRouteContext {
  tab: 'aprender' | 'practicar' | 'progreso';
  programId?: string;
  subjectId?: string;
  evidenceKey?: string;
}

/**
 * Parses the hash into a durable educational route context.
 * Supported schemas:
 * - #/tab (e.g. #/aprender, #/practicar, #/progreso)
 * - #/program/:programId/subject/:subjectId
 * - #/program/:programId/subject/:subjectId/tab/:tab
 * - #/program/:programId/subject/:subjectId/evidence/:evidenceKey
 */
export function parseEducationalHash(hash: string): EducationalRouteContext {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean) {
    return { tab: 'aprender' };
  }

  const parts = clean.split('/').filter(Boolean);
  const context: EducationalRouteContext = { tab: 'aprender' };

  if (parts.length === 1 && ['aprender', 'practicar', 'progreso'].includes(parts[0])) {
    context.tab = parts[0] as EducationalRouteContext['tab'];
    return context;
  }

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const val = parts[i + 1];
    if (!val) break;

    if (key === 'program') {
      context.programId = decodeURIComponent(val);
    } else if (key === 'subject') {
      context.subjectId = decodeURIComponent(val);
    } else if (key === 'evidence') {
      context.evidenceKey = decodeURIComponent(val);
    } else if (key === 'tab' && ['aprender', 'practicar', 'progreso'].includes(val)) {
      context.tab = val as EducationalRouteContext['tab'];
    }
  }

  return context;
}

/**
 * Serializes the educational context into a canonical URL hash.
 */
export function serializeEducationalHash(context: EducationalRouteContext): string {
  const segments: string[] = [];

  if (context.programId) {
    segments.push('program', encodeURIComponent(context.programId));
  }
  if (context.subjectId) {
    segments.push('subject', encodeURIComponent(context.subjectId));
  }
  if (context.evidenceKey) {
    segments.push('evidence', encodeURIComponent(context.evidenceKey));
  }
  if (context.tab && (context.tab !== 'aprender' || !context.programId)) {
    segments.push('tab', context.tab);
  }

  return segments.length > 0 ? `#/${segments.join('/')}` : '#/aprender';
}
