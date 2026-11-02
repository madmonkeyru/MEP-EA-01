import { ProgramInfo } from '../../types';
import { type AppRoute, routeHash } from '../../services/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ContextControls } from './FrameworkHubPage';
import { OfficialResources } from '../knowledge/OfficialResources';
import { Tabs } from '../common/Tabs';
export function GenericSubjectHubPage({ program, route, onNavigate }: { program: ProgramInfo; route: AppRoute; onNavigate: (route: AppRoute) => void }) {
  const subject = program.subjects.find(subject => subject.id === route.subjectId)!;
  const tab = route.tab || 'practice';
  return <div className="page-width py-8 space-y-6">
    <Breadcrumbs items={[{ label: 'Inicio', href: '#/' }, { label: 'Programas', href: '#/programas' }, { label: program.name, href: routeHash({ ...route, view: 'framework', subjectId: undefined }) }, { label: subject.name }]} />
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4"><p className="eyebrow">PDF disponibles · Práctica interactiva en preparación</p><h1 className="text-3xl font-semibold" tabIndex={-1}>{subject.name} · {program.name}</h1><ContextControls program={program} route={route} onChange={onNavigate} /></header>
    <Tabs label="Secciones de la asignatura" value={tab} onChange={tab => onNavigate({ ...route, tab })} items={[{ id: 'practice', label: 'Práctica y simulación' }, { id: 'resources', label: 'Recursos' }, { id: 'progress', label: 'Progreso' }]}>
      {tab === 'resources' ? <OfficialResources programId={program.id} subjectId={subject.id} moduleId={route.moduleId} /> : <section className="ui-surface rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">{tab === 'practice' ? 'Banco de preguntas en preparación' : 'Aún no hay intentos en esta asignatura'}</h2><p>{tab === 'practice' ? 'Puedes consultar prácticas oficiales y tablas de especificaciones en PDF mientras se prepara la práctica interactiva.' : 'El historial de esta materia se habilitará con la práctica interactiva.'}</p><div className="action-row"><button className="primary-button" onClick={() => onNavigate({ ...route, tab: 'resources' })}>Consultar materiales oficiales</button><button className="secondary-button" onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Practicar Matemáticas BXM</button></div></section>}
    </Tabs>
    <a href={routeHash({ ...route, view: 'framework', subjectId: undefined })} className="text-link">Ver asignaturas del programa</a>
  </div>;
}
