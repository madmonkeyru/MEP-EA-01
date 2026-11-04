import { PreparationPathView } from "../curriculum/PreparationPathView";
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
  const program = dataService.getCurrentProgram();
  const context = route || { view: 'hub' as const, programId: program?.id || 'bxm', subjectId: 'matematicas', convocatoriaId: dataService.getCurrentConvocatoriaId() || '2026-c2' };
  const navigate = onNavigate || ((next: AppRoute) => { window.location.hash = routeHash(next); });
  if (program && program.id !== 'bxm') return <GenericSubjectHubPage program={program} route={context} onNavigate={navigate} onStartPractice={onStartPractice} />;
  const attempts = storageService.getContextAttempts({ programId: 'bxm', subjectId: 'matematicas', convocatoriaId: context.convocatoriaId }, currentUser?.id || 'guest');
  const comparable = attempts.filter(a => a.session && isExam(a.session.config) && a.mode === 'simulation');
  const tab = route?.tab || localTab;
  const resource = route?.resourceTab || localResource;
  function change(tab: string, resourceTab?: string) { if (onNavigate) navigate({ ...context, tab, resourceTab: resourceTab || context.resourceTab }); else { setLocalTab(tab); if (resourceTab) setLocalResource(resourceTab); } }
  return <div className="subject-hub-page page-width py-8 space-y-6" data-revision={revision}>
    <Breadcrumbs items={[{ label: 'Programas', href: '#/programas' }, { label: program?.name || 'BXM', href: routeHash({ ...context, view: 'framework', subjectId: undefined }), onClick: onNavigateHome }, { label: 'Matemáticas' }]} />
    <header className="page-intro p-6 sm:p-8 rounded-3xl space-y-4"><p className="eyebrow">Práctica interactiva disponible</p><h1 className="text-3xl font-semibold" tabIndex={-1}>Tu espacio de Matemáticas BXM</h1><p>Aprende a tu ritmo, ensaya el examen o consulta materiales.</p>{contextControls}</header>
    <Tabs label="Secciones de Matemáticas" value={tab} onChange={value => change(value)} items={[{ id: 'practice', label: 'Práctica y simulación' }, { id: 'resources', label: 'Recursos' }, { id: 'path', label: 'Ruta de estudio' }, { id: 'progress', label: 'Mi progreso' }]}>
      {tab === 'path' ? <PreparationPathView programId={context.programId || 'bxm'} subjectId={context.subjectId || 'matematicas'} convocatoriaId={context.convocatoriaId || '02-2026'} onStartQuiz={onStartPractice} />
      : tab === 'practice' ? <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)] gap-6 items-start"><EvaluationModulesWidget onStartPractice={onStartPractice} onStartSimulation={onStartSimulation} /><aside className="ui-surface rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">Tu próximo paso</h2><p>{comparable.length ? 'Última simulación completa: ' + comparable[0].scorePercentage + '%.' : 'Aún sin datos de simulación. Puedes empezar con una práctica corta y sin tiempo.'}</p><p className="muted">Las prácticas de aprendizaje y las simulaciones se muestran por separado. El resultado no predice una nota oficial.</p><button className="secondary-button" onClick={() => change('progress')}>Ver historial de este perfil</button><button className="secondary-button" onClick={() => change('resources', 'pdf')}>Buscar materiales oficiales</button></aside></div>
      : tab === 'resources' ? <Tabs label="Tipo de recurso" value={resource} onChange={value => change('resources', value)} items={[{ id: 'pdf', label: 'PDF oficiales' }, { id: 'specs', label: 'Temario' }, { id: 'terms', label: 'Diccionario' }, { id: 'formulas', label: 'Fórmulas' }]}>
        {resource === 'pdf' ? <OfficialResources programId="bxm" subjectId="matematicas" /> : resource === 'specs' ? <SpecsTable onStartPracticeByItems={onStartPracticeByItems} onOpenLesson={() => change('path')} /> : resource === 'terms' ? <TermsDictionary onPractice={onStartPractice} /> : <FormulasSheet />}
      </Tabs> : <section className="ui-surface rounded-2xl p-6 space-y-5"><h2 className="text-xl font-semibold">Historial de este perfil</h2><p className="muted">Solo Matemáticas BXM y esta convocatoria. Guardado en este navegador; borrar sus datos elimina el historial. Cambiar de perfil no mezcla los resultados.</p>{!attempts.length && <p>Aún sin intentos. Tu primer resultado aparecerá aquí.</p>}{attempts.map(a => <article key={a.id} className="history-row"><div><h3 className="font-semibold">{a.session ? modeLabel(a.session.config) : a.scopeText}</h3><p>{new Date(a.timestamp).toLocaleString('es-CR')} · {a.correctCount}/{a.totalItems} correctas · {a.scorePercentage}%</p></div><div className="action-row">{a.session ? <a className="text-link" href={routeHash({ ...context, view: 'results', sessionId: a.id })}>Revisar resultado</a> : <span className="muted">Registro antiguo sin detalle guardado</span>}<button className="secondary-button" onClick={() => setDeleting(a.id)}>Eliminar</button></div></article>)}{undone && <p role="status">Registro eliminado. <button className="text-link" onClick={() => { storageService.saveAttempt(undone); setUndone(null); setRevision(value => value + 1); }}>Deshacer</button></p>}{error && <p role="alert">{error}</p>}</section>}
    </Tabs>
    {deleting && <Dialog title="¿Eliminar este resultado?" onClose={() => setDeleting(null)}><p>Solo se eliminará este registro del perfil actual.</p><button className="primary-button" onClick={() => { const previous = attempts.find(a => a.id === deleting)!; if (storageService.deleteAttempt(deleting)) { setUndone(previous); setRevision(value => value + 1); setDeleting(null); } else setError(storageService.lastError); }}>Eliminar resultado</button></Dialog>}
  </div>;
}
export const LandingPage = SubjectHubPage;
