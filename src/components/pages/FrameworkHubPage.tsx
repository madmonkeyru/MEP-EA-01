import { dataService } from '../../services/dataService';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ProgramInfo } from '../../types';
import { calculatorRule } from '../../services/learningSession';
import { AppRoute, routeHash } from '../../services/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { CustomSelect } from '../common/CustomSelect';
import { DynamicMilestoneBanner } from '../knowledge/DynamicMilestoneBanner';
import { SubjectMotif } from '../common/SubjectMotif';

export const hubPanel = 'ui-surface rounded-2xl p-5 sm:p-6 space-y-4';
export const hubButton = 'px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm cursor-pointer';

export function ContextControls({ program, route, onChange }: {
  program: ProgramInfo; route: AppRoute; onChange: (route: AppRoute) => void;
}) {
  const modules = (program.subprograms || []).filter(m => typeof m !== 'string');
  const moduleOptions = modules.map(m => ({ value: m.id, label: m.name }));
  const convocatoriaOptions = [
    { value: '2026-c1', label: '01-2026 · PDF / vista previa' },
    { value: '2026-c2', label: '02-2026 · Matemáticas BXM activa' },
  ];

  return <div className="flex flex-wrap items-end gap-4 text-sm">
    {modules.length > 0 && (
      <label className="font-semibold text-xs uppercase tracking-wider text-stone-600 dark:text-stone-300 min-w-[170px]">
        Nivel o parte
        <div className="mt-1 normal-case tracking-normal text-sm font-normal">
          <CustomSelect
            label="Nivel o parte"
            value={route.moduleId || modules[0]?.id}
            options={moduleOptions}
            onChange={val => onChange({ ...route, moduleId: val })}
          />
        </div>
      </label>
    )}
    <label className="font-semibold text-xs uppercase tracking-wider text-stone-600 dark:text-stone-300 min-w-[220px]">
      Convocatoria de referencia
      <div className="mt-1 normal-case tracking-normal text-sm font-normal">
        <CustomSelect
          label="Convocatoria de referencia"
          value={route.convocatoriaId || '2026-c2'}
          options={convocatoriaOptions}
          onChange={val => onChange({ ...route, convocatoriaId: val })}
        />
      </div>
    </label>
    <div className="pb-2.5 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 font-medium">
      <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
        Nota mínima: <strong className="text-stone-900 dark:text-stone-100">{program.passingScore}</strong>
      </span>
      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
        {calculatorRule(program.id, route.subjectId, route.moduleId)}
      </span>
    </div>
  </div>;
}

export function FrameworkHubPage({ program, route, onNavigate }: {
  program: ProgramInfo; route: AppRoute; onNavigate: (route: AppRoute) => void;
}) {
  return <div className="page-width py-8 space-y-6">
    <Breadcrumbs items={[{ label: 'Inicio', href: '#/' },
      { label: 'Programas', href: '#/programas' }, { label: program.name }]} />
    <section className="page-intro rounded-3xl p-6 sm:p-8 space-y-5">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Tu programa de estudio</p>
      <h1 tabIndex={-1} className="text-2xl sm:text-3xl font-semibold">{program.name}</h1>
      <p>{program.description}</p>
      <ContextControls program={program} route={route} onChange={onNavigate} />
      <p className="text-sm text-stone-600 dark:text-slate-400">{program.id === 'edad'
        ? 'Parte 1 (Décimo) → Parte 2 (Undécimo). Aprobar la Parte 1 es requisito para inscribir la Parte 2 de esa materia; puedes estudiar ambas sin verificar matrícula aquí.'
        : program.id === 'iii_ciclo' ? 'Séptimo → Octavo → Noveno: cada nivel reúne seis materias. Puedes consultar los PDF de cada etapa.'
        : program.id === 'cico' || program.id === 'i_ii_ciclo' ? 'Cinco pruebas por suficiencia para completar la primaria. Matemáticas se evalúa sin calculadora.'
        : 'Una prueba por asignatura. En Ciencias, elige Biología, Física o Química; en Idioma, elige tu opción.'}</p>
    </section>

    {/* Program-Aware Schedule & Milestones */}
    <DynamicMilestoneBanner
      programId={program.id}
      convocatoriaId={route.convocatoriaId || '2026-c2'}
      subjectFilter="Matemáticas"
    />

    <section aria-label="Asignaturas del programa" className="space-y-4">
      <h2 className="text-xl font-semibold">Elige una asignatura</h2>
      <p className="text-sm text-stone-600 dark:text-slate-400">Matemáticas BXM tiene prácticas disponibles en 02-2026. Las demás rutas permiten explorar su estructura.</p>
      {[['Materias del programa', program.subjects.filter(subject => !['biologia', 'fisica', 'quimica', 'ingles', 'frances'].includes(subject.id))], ['Elige una ciencia', program.subjects.filter(subject => ['biologia', 'fisica', 'quimica'].includes(subject.id))], [program.id === 'iii_ciclo' ? 'Idioma: Inglés' : 'Elige un idioma', program.subjects.filter(subject => ['ingles', 'frances'].includes(subject.id))]].map(([label, entries]) => (entries as typeof program.subjects).length > 0 && <details key={label as string} open className="subject-group ui-surface rounded-2xl p-4 space-y-3"><summary className="font-semibold cursor-pointer">{label as string} · {(entries as typeof program.subjects).length}</summary><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{(entries as typeof program.subjects).map(subject => <a key={subject.id} className="relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-4 subject-card subject-card-compact text-left ui-lift border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md transition-all group" href={routeHash({ ...route, view: 'hub', subjectId: subject.id })} onClick={event => { if (!event.ctrlKey && !event.metaKey) { event.preventDefault(); onNavigate({ ...route, view: 'hub', subjectId: subject.id }); } }}>
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 opacity-10 dark:opacity-15 group-hover:opacity-20 text-stone-700 dark:text-stone-300 transition-opacity">
          <SubjectMotif subjectId={subject.id} className="w-full h-full" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="subject-icon"><BookOpen size={21} aria-hidden="true" /></span>
          <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{subject.name}</h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">{catalogueLabel(dataService.findConvocatoriaBlueprint(program.id, subject.id, route.moduleId, route.convocatoriaId)?.coverage)}</p>
          <span className="text-link inline-flex items-center gap-1.5 pt-1">Ver materia y recursos <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </a>)}</div></details>)}

    </section>
  </div>;
}

function catalogueLabel(coverage?: 'complete' | 'sample') {
  if (coverage === 'complete') return 'Simulación completa disponible';
  if (coverage === 'sample') return 'Muestra interactiva disponible';
  return 'PDF oficiales disponibles · Práctica interactiva en preparación';
}
