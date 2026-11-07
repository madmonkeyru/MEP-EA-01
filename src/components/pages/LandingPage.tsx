import { StatusBadge } from '../common/StatusBadge';
import { PageContainer, SplitPane } from '../layout/Workspace';
import { PreparationPathView } from "../curriculum/PreparationPathView";
import { DigitalTemarioView } from "../curriculum/DigitalTemarioView";
import { useState } from 'react';
import type { PracticeConfig, User } from '../../types';
import { storageService } from '../../services/storageService';
import { dataService } from '../../services/dataService';
import { isExam, modeLabel } from '../../services/learningSession';
import { type AppRoute, routeHash } from '../../services/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Tabs } from '../common/Tabs';
import { Dialog } from '../common/Dialog';
import { EvaluationModulesWidget } from '../practice/EvaluationModulesWidget';
import { SpecsTable } from '../knowledge/SpecsTable';
import { TermsDictionary } from '../knowledge/TermsDictionary';
import { FormulasSheet } from '../knowledge/FormulasSheet';
import { OfficialResources } from '../knowledge/OfficialResources';
import { DynamicMilestoneBanner } from '../knowledge/DynamicMilestoneBanner';
import { GenericSubjectHubPage } from './GenericSubjectHubPage';

interface SubjectHubPageProps {
  contextControls?: React.ReactNode; currentUser: User | null; route?: AppRoute; onNavigate?: (route: AppRoute) => void;
  onNavigateHome?: () => void; onStartSimulation: () => void; onStartPractice: (config: PracticeConfig) => void;
  onStartPracticeByItems?: (ids: number[], title: string) => void;
}
export function SubjectHubPage({ contextControls, currentUser, route, onNavigate, onNavigateHome, onStartPractice, onStartSimulation, onStartPracticeByItems }: SubjectHubPageProps) {
  const [localTab, setLocalTab] = useState('practice');
  const [localResource, setLocalResource] = useState('pdf');
  const [revision, setRevision] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [undone, setUndone] = useState<ReturnType<typeof storageService.getAttempts>[number] | null>(null);
  const [error, setError] = useState('');
  const [clearHistory, setClearHistory] = useState(false);
  const program = dataService.getCurrentProgram();
  const context = route || { view: 'hub' as const, programId: program?.id || 'bxm', subjectId: 'matematicas', convocatoriaId: dataService.getCurrentConvocatoriaId() || '2026-c2' };
  const navigate = onNavigate || ((next: AppRoute) => { window.location.hash = routeHash(next); });
  if (program && program.id !== 'bxm') return <GenericSubjectHubPage program={program} route={context} onNavigate={navigate} onStartPractice={onStartPractice} />;
  const attempts = storageService.getContextAttempts({ programId: 'bxm', subjectId: 'matematicas', convocatoriaId: context.convocatoriaId }, currentUser?.id || 'guest');
  const comparable = attempts.filter(a => a.session && isExam(a.session.config) && a.mode === 'simulation');
  const tab = route?.tab || localTab;
  const resource = route?.resourceTab || localResource;
  function change(tab: string, resourceTab?: string) { if (onNavigate) navigate({ ...context, tab, resourceTab: resourceTab || context.resourceTab }); else { setLocalTab(tab); if (resourceTab) setLocalResource(resourceTab); } }
  return <PageContainer className="subject-hub-page" data-revision={revision}>
    <Breadcrumbs items={[{ label: 'Programas', href: '#/programas' }, { label: program?.name || 'BXM', href: routeHash({ ...context, view: 'framework', subjectId: undefined }), onClick: onNavigateHome }, { label: 'Matemáticas' }]} />
    <header className="page-intro relative isolate overflow-hidden p-6 sm:p-8 rounded-3xl">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 480 260"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-y-0 right-0 h-full w-[min(60%,32rem)] text-indigo-950/15 dark:text-indigo-100/10 pointer-events-none select-none"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <path d="M170 220H470M205 245V20" opacity=".35" />
          <path d="M205 190C245 190 265 42 310 42S365 190 435 190" opacity=".75" />
          <path d="M250 220V42M295 220V42M340 220V42M385 220V42M430 220V42M205 85H470M205 130H470M205 175H470" strokeDasharray="3 7" opacity=".3" />
          <path d="M330 188 375 105 420 188Z" opacity=".65" />
          <circle cx="375" cy="145" r="44" opacity=".6" />
        </g>
        <g fill="currentColor" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="18" opacity=".65">
          <text x="360" y="52">x² + y²</text>
          <text x="425" y="112">π</text>
          <text x="270" y="210">∑</text>
          <text x="225" y="58">f(x)</text>
        </g>
      </svg>
      <div className="relative z-10 space-y-4">
        <p className="eyebrow">Práctica interactiva disponible</p>
        <h1 className="text-3xl font-semibold" tabIndex={-1}>Tu espacio de Matemáticas BXM</h1>
        <p>Aprende a tu ritmo, ensaya el examen o consulta materiales.</p>
        {context.convocatoriaId === '2026-c2' && <button className="primary-button" onClick={() => navigate({ ...context, view: 'learning', tab: 'inicio', sessionId: undefined })}>Ver mi preparación</button>}
        {contextControls}
      </div>
    </header>

    {/* Dynamic MEP Milestones Banner */}
    <details className="subject-schedule">
    <summary>Fechas oficiales MEP</summary>
    <DynamicMilestoneBanner
      programId="bxm"
      convocatoriaId={context.convocatoriaId || '2026-c2'}
      subjectFilter="Matemáticas"
    />
    </details>

    <Tabs
      label="Secciones de Matemáticas"
      value={tab}
      onChange={value => change(value)}
      items={[
        { id: 'practice', label: 'Práctica' },
        { id: 'simulation', label: 'Simulaciones' },
        { id: 'resources', label: 'Recursos' },
        { id: 'temario', label: 'Temario Digital' },
        { id: 'path', label: 'Ruta de estudio' },
        { id: 'progress', label: 'Mi progreso' },
      ]}
    >
      {tab === 'temario' ? <DigitalTemarioView onStartQuiz={onStartPractice} />
      : tab === 'path' ? <PreparationPathView programId={context.programId || 'bxm'} subjectId={context.subjectId || 'matematicas'} convocatoriaId={context.convocatoriaId || '02-2026'} onStartQuiz={onStartPractice} />
      : (tab === 'practice' || tab === 'simulation') ? <SplitPane><EvaluationModulesWidget key={tab} initialMode={tab === 'simulation' ? 'simulation' : 'area'} onStartPractice={onStartPractice} onStartSimulation={onStartSimulation} /><aside className="ui-surface rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">Tu próximo paso</h2><p>{comparable.length ? 'Última simulación completa: ' + comparable[0].scorePercentage + '%.' : 'Aún sin datos de simulación. Puedes empezar con una práctica corta y sin tiempo.'}</p><p className="muted">Las prácticas de aprendizaje y las simulaciones se muestran por separado. El resultado no predice una nota oficial.</p><button className="secondary-button" onClick={() => change('progress')}>Ver historial de este perfil</button><button className="secondary-button" onClick={() => change('resources', 'pdf')}>Buscar materiales oficiales</button></aside></SplitPane>
      : tab === 'resources' ? <Tabs label="Tipo de recurso" value={resource} onChange={value => change('resources', value)} items={[{ id: 'pdf', label: 'PDF oficiales' }, { id: 'specs', label: 'Temario' }, { id: 'terms', label: 'Diccionario' }, { id: 'formulas', label: 'Fórmulas' }]}>
        {resource === 'pdf' ? <OfficialResources programId="bxm" subjectId="matematicas" /> : resource === 'specs' ? <SpecsTable onStartPracticeByItems={onStartPracticeByItems} onOpenLesson={() => change('path')} /> : resource === 'terms' ? <TermsDictionary onPractice={onStartPractice} /> : <FormulasSheet />}
      </Tabs> : <section className="ui-surface rounded-2xl p-6 space-y-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">Historial de este perfil</h2><button className="secondary-button" disabled={!attempts.length} onClick={() => setClearHistory(true)}>Eliminar todo el historial</button></div><p className="muted">Solo Matemáticas BXM y esta convocatoria. Guardado en este navegador; borrar sus datos elimina el historial. Cambiar de perfil no mezcla los resultados.</p>{!attempts.length && <p>Aún sin intentos. Tu primer resultado aparecerá aquí.</p>}{attempts.map(a => <article key={a.id} className="history-row"><div><h3 className="font-semibold">{a.session ? modeLabel(a.session.config) : a.scopeText}</h3><StatusBadge status="completed" /><p>{new Date(a.timestamp).toLocaleString('es-CR')} · {a.correctCount}/{a.totalItems} correctas · {a.scorePercentage}%</p></div><div className="action-row">{a.session ? <a className="text-link" href={routeHash({ ...context, view: 'results', sessionId: a.id })}>Revisar resultado</a> : <span className="muted">Registro antiguo sin detalle guardado</span>}<button className="secondary-button" onClick={() => setDeleting(a.id)}>Eliminar</button></div></article>)}{undone && <p role="status">Registro eliminado. <button className="text-link" onClick={() => { storageService.saveAttempt(undone); setUndone(null); setRevision(value => value + 1); }}>Deshacer</button></p>}{error && <p role="alert">{error}</p>}</section>}
    </Tabs>
    {clearHistory && <Dialog title="¿Eliminar todo el historial?" onClose={() => setClearHistory(false)}><p>Se eliminarán {attempts.length} resultados de Matemáticas BXM de esta convocatoria y este perfil. Los otros perfiles y convocatorias se conservan. Esta acción no se puede deshacer.</p><div className="action-row"><button className="secondary-button" onClick={() => setClearHistory(false)}>Cancelar</button><button className="primary-button" onClick={() => { if (storageService.deleteContextAttempts({ programId: 'bxm', subjectId: 'matematicas', convocatoriaId: context.convocatoriaId }, currentUser?.id || 'guest')) { setUndone(null); setClearHistory(false); setError(''); setRevision(value => value + 1); } else setError(storageService.lastError); }}>Sí, eliminar todos</button></div>{error && <p role="alert">{error}</p>}</Dialog>}
    {deleting && <Dialog title="¿Eliminar este resultado?" onClose={() => setDeleting(null)}><p>Solo se eliminará este registro del perfil actual.</p><button className="primary-button" onClick={() => { const previous = attempts.find(a => a.id === deleting)!; if (storageService.deleteAttempt(deleting)) { setUndone(previous); setRevision(value => value + 1); setDeleting(null); } else setError(storageService.lastError); }}>Eliminar resultado</button></Dialog>}
  </PageContainer>;
}
export const LandingPage = SubjectHubPage;
