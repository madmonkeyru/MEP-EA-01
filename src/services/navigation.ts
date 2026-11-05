import { programManifest } from './programCatalog';

export interface AppRoute {
  view: 'landing' | 'welcome' | 'framework' | 'hub' | 'guide' | 'helper' | 'calendar' | 'test' | 'results' | 'learning';
  evidenceKey?: string;
  sessionId?: string;
  tab?: string;
  resourceTab?: string;
  programId?: string;
  subjectId?: string;
  moduleId?: string;
  convocatoriaId?: string;
}

export function readRoute(hash: string): AppRoute {
  const [path, query] = hash.replace(/^#/, '').split('?');
  if (!path || path === '/') return { view: 'landing' };
  if (path === '/calendario') { const params = new URLSearchParams(query); return { view: 'calendar', programId: params.get('programa') || undefined, convocatoriaId: params.get('convocatoria') || undefined }; }
  if (path === '/guia') return { view: 'guide' };
  if (path === '/ayuda') { const params = new URLSearchParams(query); return { view: 'helper', programId: params.get('programa') || undefined, subjectId: params.get('materia') || undefined, moduleId: params.get('nivel') || undefined }; }
  if (path === '/programas') return { view: 'welcome' };
  const parts = path.split('/').filter(Boolean);
  const program = programManifest.programs.find(p => p.id === parts[1]);
  if (parts[0] !== 'programas' || !program || parts.length > 3) return { view: 'welcome' };
  const params = new URLSearchParams(query);
  const modules = (program.subprograms || []).filter(m => typeof m !== 'string');
  const moduleId = modules.find(m => m.id === params.get('nivel'))?.id || modules[0]?.id;
  const convocatoriaId = params.get('convocatoria') === '2026-c1' ? '2026-c1' : '2026-c2';
  const subject = program.subjects.find(s => s.id === (program.id === 'bxm' && parts[2] === 'matematica' ? 'matematicas' : parts[2]));
  const phase = params.get('pantalla');
  const learning = phase === 'aprendizaje' && program.id === 'bxm' && subject?.id === 'matematicas' && convocatoriaId === '2026-c2';
  return { view: subject ? (learning ? 'learning' : phase === 'prueba' ? 'test' : phase === 'resultado' ? 'results' : 'hub') : 'framework', programId: program.id,
    ...(learning && params.get('evidencia') ? { evidenceKey: params.get('evidencia')! } : {}),
    ...(params.get('intento') ? { sessionId: params.get('intento')! } : {}),
    ...(['practice', 'resources', 'temario', 'path', 'progress', 'review', ...(learning ? ['inicio','diagnostic','assessment','result'] : [])].includes(params.get('seccion') || '') ? { tab: params.get('seccion')! } : {}),
    ...(['pdf', 'specs', 'terms', 'formulas'].includes(params.get('recurso') || '') ? { resourceTab: params.get('recurso')! } : {}),
    subjectId: subject?.id, moduleId, convocatoriaId };
}

export function routeHash(route: AppRoute): string {
  if (route.view === 'calendar') { const params = new URLSearchParams(); if (route.programId) params.set('programa', route.programId); if (route.convocatoriaId) params.set('convocatoria', route.convocatoriaId); return '#/calendario' + (params.size ? '?' + params : ''); }
  if (route.view === 'guide') return '#/guia';
  if (route.view === 'helper') { const params = new URLSearchParams(); if (route.programId) params.set('programa', route.programId); if (route.subjectId) params.set('materia', route.subjectId); if (route.moduleId) params.set('nivel', route.moduleId); return '#/ayuda' + (params.size ? '?' + params : ''); }
  if (route.view === 'landing') return '#/';
  if (route.view === 'welcome') return '#/programas';
  const params = new URLSearchParams();
  if (route.moduleId) params.set('nivel', route.moduleId);
  params.set('convocatoria', route.convocatoriaId || '2026-c2');
  if (route.view === 'learning') { params.set('pantalla', 'aprendizaje'); if (route.sessionId) params.set('intento', route.sessionId); if (route.evidenceKey) params.set('evidencia', route.evidenceKey); }
  if (route.view === 'test' || route.view === 'results') { params.set('pantalla', route.view === 'test' ? 'prueba' : 'resultado'); if (route.sessionId) params.set('intento', route.sessionId); }
  if (route.tab) params.set('seccion', route.tab);
  if (route.resourceTab) params.set('recurso', route.resourceTab);
  return `#/programas/${route.programId}${route.view !== 'framework' ? `/${route.subjectId}` : ''}?${params}`;
}
