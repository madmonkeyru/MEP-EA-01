import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { storageService } from '../../services/storageService';
import { dataService } from '../../services/dataService';
import type { PracticeConfig, ProgramInfo } from '../../types';
import { type AppRoute, routeHash } from '../../services/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ContextControls } from './FrameworkHubPage';
import { OfficialResources } from '../knowledge/OfficialResources';
import { Tabs } from '../common/Tabs';
export function GenericSubjectHubPage({ program, route, onNavigate, onStartPractice }: { program: ProgramInfo; route: AppRoute; onNavigate: (route: AppRoute) => void; onStartPractice: (config: PracticeConfig) => void }) {
  const [confirmExam, setConfirmExam] = useState(false);
  const subject = program.subjects.find(subject => subject.id === route.subjectId)!;
  const tab = route.tab === 'resources' || route.tab === 'progress' ? route.tab : 'practice';
  const blueprint = dataService.findConvocatoriaBlueprint(program.id, subject.id, route.moduleId, route.convocatoriaId);
  const coverage = blueprint?.coverage === 'complete' ? 'Simulación completa' : 'Muestra interactiva';
  const itemIds = blueprint?.sections.flatMap(section => section.itemIds)
    .map(code => dataService.getItemById(code)?.id)
    .filter((id): id is number => id !== undefined) || [];
  const attempts = tab === 'progress' ? storageService.getContextAttempts({
    programId: program.id, subjectId: subject.id, convocatoriaId: route.convocatoriaId,
  }).filter(attempt => !attempt.session?.config.reviewDraft && attempt.session?.config.subprogramId === route.moduleId) : [];
  const canStart = !!blueprint && blueprint.totalItems === new Set(itemIds).size;
  const start = () => {
    if (!blueprint || !canStart) return;
    onStartPractice({
      mode: blueprint.coverage === 'complete' ? 'simulation' : 'area',
      title: blueprint.coverage === 'sample' ? `Muestra interactiva · ${subject.name}` : blueprint.title,
      itemIds,
      itemCount: itemIds.length,
      enableTimer: blueprint.coverage === 'complete',
      timerDurationMinutes: blueprint.timeLimitMinutes,
    });
  };

  return <div className="page-width py-8 space-y-6">
    <Breadcrumbs items={[{ label: 'Inicio', href: '#/' }, { label: 'Programas', href: '#/programas' }, { label: program.name, href: routeHash({ ...route, view: 'framework', subjectId: undefined }) }, { label: subject.name }]} />
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4"><p className="eyebrow">{blueprint ? coverage : 'PDF disponibles · Práctica interactiva en preparación'}</p><h1 className="text-3xl font-semibold" tabIndex={-1}>{subject.name} · {program.name}</h1><ContextControls program={program} route={route} onChange={onNavigate} /></header>
    <Tabs label="Secciones de la asignatura" value={tab} onChange={tab => onNavigate({ ...route, tab })} items={[{ id: 'practice', label: 'Práctica y simulación' }, { id: 'resources', label: 'Recursos' }, { id: 'progress', label: 'Progreso' }]}>
      {tab === 'resources' ? <OfficialResources programId={program.id} subjectId={subject.id} moduleId={route.moduleId} /> : <section className="ui-surface rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">{tab === 'practice' ? (blueprint ? coverage : 'Banco de preguntas en preparación') : 'Historial de este perfil'}</h2>{tab === 'practice' && blueprint && <p>{blueprint.title} · {blueprint.totalItems} preguntas{blueprint.freeReference ? ' · Referencia gratuita' : ''}</p>}
        {tab === 'practice' && !blueprint && <p>Puedes consultar prácticas oficiales y tablas de especificaciones en PDF mientras se prepara la práctica interactiva.</p>}
        {tab === 'progress' && <>
          <p>Los resultados de esta asignatura y convocatoria se guardan en este navegador.</p>
          {!attempts.length && <p>Aún no hay intentos en esta asignatura.</p>}
          {attempts.map(attempt => <article key={attempt.id} className="history-row">
            <div><h3 className="font-semibold">{attempt.scopeText}</h3><p>{attempt.correctCount}/{attempt.totalItems} correctas · {attempt.scorePercentage}%</p></div>
            <a className="text-link" href={routeHash({ ...route, view: 'results', sessionId: attempt.id })}>Revisar resultado</a>
          </article>)}
        </>}
        {tab === 'practice' && canStart && <button className="primary-button" onClick={() => {
          if (blueprint.coverage === 'complete') setConfirmExam(true); else start();
        }}>{blueprint.coverage === 'complete' ? 'Preparar simulación' : 'Iniciar muestra'}</button>}<div className="action-row"><button className="primary-button" onClick={() => onNavigate({ ...route, tab: 'resources' })}>Consultar materiales oficiales</button><button className="secondary-button" onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Practicar Matemáticas BXM</button></div></section>}
    </Tabs>
    {confirmExam && blueprint && <Dialog title="Antes de comenzar" onClose={() => setConfirmExam(false)}>
      <p>{blueprint.totalItems} preguntas · {blueprint.timeLimitMinutes} minutos{blueprint.calculatorAllowed ? '' : ' · Calculadora prohibida'}.</p>
      <p>El cronómetro continúa si sales de la página. Puedes revisar las respuestas y explicaciones al entregar.</p>
      <button className="primary-button" onClick={() => { setConfirmExam(false); start(); }}>Iniciar simulación</button>
    </Dialog>}
    <a href={routeHash({ ...route, view: 'framework', subjectId: undefined })} className="text-link">Ver asignaturas del programa</a>
  </div>;
}
