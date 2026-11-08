import { programManifest } from '../../services/programCatalog';
import { type AppRoute, routeHash } from '../../services/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';

export function ActivityContext({ route }: { route: AppRoute }) {
  const program = programManifest.programs.find(item => item.id === route.programId);
  const subject = program?.subjects.find(item => item.id === route.subjectId);
  if (!program || !subject) return null;
  const parent = routeHash({ view: 'hub', programId: program.id, subjectId: subject.id, moduleId: route.moduleId, convocatoriaId: route.convocatoriaId, tab: route.tab === 'review' ? 'review' : undefined });
  return <div className="activity-context page-width">
    <div className="activity-context-trail"><Breadcrumbs items={[
      { label: 'Programas', href: '#/programas' },
      { label: program.name, href: routeHash({ view: 'framework', programId: program.id, moduleId: route.moduleId, convocatoriaId: route.convocatoriaId }) },
      { label: subject.name, href: parent },
      { label: route.view === 'results' ? 'Resultados' : 'Actividad en curso' },
    ]} /></div>
    <a className="text-link activity-context-back" href={parent}>← {subject.name}</a>
  </div>;
}
