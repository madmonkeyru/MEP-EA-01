import { StatusBadge } from '../common/StatusBadge';
import { PageContainer, Section } from '../layout/Workspace';
import { useState } from 'react';
import { AssessmentBriefing } from '../practice/LearningConfiguration';
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
  const tab = route.tab === 'resources' || route.tab === 'progress' || route.tab === 'simulation' ? route.tab : 'practice';
  const blueprint = dataService.findConvocatoriaBlueprint(program.id, subject.id, route.moduleId, route.convocatoriaId);
  const coverage = blueprint?.coverage === 'complete' ? 'Simulación completa' : 'Muestra interactiva';
  const itemIds = blueprint?.sections.flatMap(section => section.itemIds)
    .map(code => dataService.getItemById(code)?.id)
    .filter((id): id is number => id !== undefined) || [];
  const attempts = tab === 'progress' ? storageService.getContextAttempts({
    programId: program.id, subjectId: subject.id, convocatoriaId: route.convocatoriaId,
  }).filter(attempt => !attempt.session?.config.reviewDraft && attempt.session?.config.subprogramId === route.moduleId) : [];
  const activityTab = tab === 'practice' || tab === 'simulation';
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

  return <PageContainer>
    <Breadcrumbs items={[{ label: 'Inicio', href: '#/' }, { label: 'Programas', href: '#/programas' }, { label: program.name, href: routeHash({ ...route, view: 'framework', subjectId: undefined }) }, { label: subject.name }]} />
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4"><p className="eyebrow">{blueprint ? coverage : 'PDF disponibles · Práctica interactiva en preparación'}</p><h1 className="text-3xl font-semibold" tabIndex={-1}>{subject.name} · {program.name}</h1><ContextControls program={program} route={route} onChange={onNavigate} /></header>
    <Tabs label="Secciones de la asignatura" value={tab} onChange={tab => onNavigate({ ...route, tab })} items={[{ id: 'practice', label: 'Práctica' }, { id: 'simulation', label: 'Simulaciones' }, { id: 'resources', label: 'Recursos' }, { id: 'progress', label: 'Progreso' }]}>
      {tab === 'resources' ? <OfficialResources programId={program.id} subjectId={subject.id} moduleId={route.moduleId} /> : <Section><h2 className="text-xl font-semibold">{tab === 'simulation' && blueprint?.coverage !== 'complete' ? 'Simulación no disponible' : activityTab ? (blueprint ? coverage : 'Banco de preguntas en preparación') : 'Historial de este perfil'}</h2>{activityTab && blueprint && (tab !== 'simulation' || blueprint.coverage === 'complete') && <p>{blueprint.title} · {blueprint.totalItems} preguntas{blueprint.freeReference ? ' · Referencia gratuita' : ''}</p>}
        {tab === 'simulation' && blueprint?.coverage !== 'complete' && <p>No hay una simulación completa disponible para esta selección. Puedes consultar los materiales oficiales o volver a Práctica.</p>}
        {activityTab && !blueprint && <p>Puedes consultar prácticas oficiales y tablas de especificaciones en PDF mientras se prepara la práctica interactiva.</p>}
        {tab === 'progress' && <>
          <p>Los resultados de esta asignatura y convocatoria se guardan en este navegador.</p>
          {!attempts.length && <p>Aún no hay intentos en esta asignatura.</p>}
          {attempts.map(attempt => <article key={attempt.id} className="history-row">
            <div><h3 className="font-semibold">{attempt.scopeText}</h3><StatusBadge status="completed" /><p>{attempt.correctCount}/{attempt.totalItems} correctas · {attempt.scorePercentage}%</p></div>
            <a className="text-link" href={routeHash({ ...route, view: 'results', sessionId: attempt.id })}>Revisar resultado</a>
          </article>)}
        </>}
        {activityTab && canStart && (tab !== 'simulation' || blueprint?.coverage === 'complete') && <button className="primary-button" onClick={() => {
          if (blueprint.coverage === 'complete') setConfirmExam(true); else start();
        }}>{blueprint.coverage === 'complete' ? 'Preparar simulación' : 'Iniciar muestra'}</button>}<div className="action-row"><button className={activityTab && canStart && (tab !== 'simulation' || blueprint?.coverage === 'complete') ? 'secondary-button' : 'primary-button'} onClick={() => onNavigate({ ...route, tab: 'resources' })}>Consultar materiales oficiales</button>{tab === 'simulation' && blueprint?.coverage !== 'complete' ? <button className="secondary-button" onClick={() => onNavigate({ ...route, tab: 'practice' })}>Ver práctica disponible</button> : <button className="secondary-button" onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Practicar Matemáticas BXM</button>}</div></Section>}
    </Tabs>
    {confirmExam && blueprint && <AssessmentBriefing title="Antes de comenzar" onClose={() => setConfirmExam(false)}
      summary={{ requested: blueprint.totalItems, actual: itemIds.length, scope: `${subject.name} · ${program.name}`, timerMinutes: blueprint.timeLimitMinutes }}
      startLabel="Iniciar simulación" onStart={() => { setConfirmExam(false); start(); }}>
      <p>{blueprint.totalItems} preguntas · {blueprint.timeLimitMinutes} minutos{blueprint.calculatorAllowed ? '' : ' · Calculadora prohibida'}.</p>
      <p>El cronómetro continúa si sales de la página. Puedes revisar las respuestas y explicaciones al entregar.</p>
    </AssessmentBriefing>}
    <a href={routeHash({ ...route, view: 'framework', subjectId: undefined })} className="text-link">Ver asignaturas del programa</a>
  </PageContainer>;
}
