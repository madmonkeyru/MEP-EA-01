import { type AppRoute, routeHash } from './navigation';

/** Global destinations reuse the same routes as contextual navigation. */
export function appNavigation(route: AppRoute) {
  const inSubject = !!route.programId && !!route.subjectId;
  const subject: AppRoute = {
    view: route.view === 'learning' ? 'learning' : 'hub', programId: route.programId, subjectId: route.subjectId,
    moduleId: route.moduleId, convocatoriaId: route.convocatoriaId,
  };
  return [
    { label: 'Inicio', href: '#/', active: route.view === 'landing' },
    { label: 'Programas', href: '#/programas', active: ['welcome', 'framework', 'results'].includes(route.view) || (['hub', 'learning'].includes(route.view) && !!route.tab && !['practice', 'simulation', 'progress'].includes(route.tab)) },
    ...(inSubject ? [
      { label: 'Práctica', href: routeHash({ ...subject, tab: 'practice' }), active: ['hub', 'learning'].includes(route.view) && (route.tab === 'practice' || (route.view === 'hub' && !route.tab)) },
      { label: 'Simulaciones', href: routeHash({ ...subject, tab: 'simulation' }), active: ['hub', 'learning'].includes(route.view) && route.tab === 'simulation' },
      { label: 'Progreso', href: routeHash({ ...subject, tab: 'progress' }), active: ['hub', 'learning'].includes(route.view) && route.tab === 'progress' },
    ] : []),
    { label: 'Calendario', href: routeHash({ view: 'calendar', programId: route.programId, convocatoriaId: route.convocatoriaId }), active: route.view === 'calendar' },
    { label: 'Guía y recursos', href: routeHash({ view: 'helper', programId: route.programId, subjectId: route.subjectId, moduleId: route.moduleId }), active: route.view === 'helper' },
  ];
}
