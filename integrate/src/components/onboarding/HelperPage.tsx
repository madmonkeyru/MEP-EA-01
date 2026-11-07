import { Tabs } from '../common/Tabs';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Compass, CheckCircle2 } from 'lucide-react';
import { AppRoute, routeHash } from '../../services/navigation';
import { PROGRAMS, PROGRAM_LEVELS, PROGRAM_SUBJECTS, subjectLabel } from '../../services/onboarding/catalog';
import { PROGRAM_ORDER, type ProgramId, type LevelId } from '../../services/onboarding/types';
import { useWizard } from './wizardStore';
import { FormHelper } from './FormHelper';
import { OfficialResources } from '../knowledge/OfficialResources';
import { dataService } from '../../services/dataService';

export function helperProgramRoute(program: ProgramId, level?: LevelId): AppRoute {
  return { view: 'framework', programId: program === 'i-ii' ? 'i_ii_ciclo' : program === 'iii' ? 'iii_ciclo' : program,
    moduleId: program === 'iii' ? `III_CICLO_${level || '7'}` : program === 'edad' ? (level === '11' ? 'EDAD_2' : 'EDAD_1') : undefined,
    convocatoriaId: '2026-c2' };
}

export function HelperPage({ onNavigate, route }: { onNavigate: (route: AppRoute) => void; route?: AppRoute }) {
  const wizard = useWizard();
  const [panel, setPanel] = useState('resources');
  const [program, setProgram] = useState<ProgramId>(() => {
    if (wizard.program && wizard.program !== 'unsure') return wizard.program;
    const active = route?.programId || dataService.getCurrentProgramId();
    return (active === 'cico' || active === 'i_ii_ciclo') ? 'i-ii' : active === 'iii_ciclo' ? 'iii' : active === 'edad' ? 'edad' : 'bxm';
  });

  useEffect(() => { const id = route?.programId; if (id) setProgram((id === 'cico' || id === 'i_ii_ciclo') ? 'i-ii' : id === 'iii_ciclo' ? 'iii' : id === 'edad' ? 'edad' : 'bxm'); }, [route?.programId]);
  const copy = PROGRAMS[program];
  const button = 'min-h-11 px-4 py-3 rounded-xl font-semibold text-sm cursor-pointer';

  return <div className="helper-page page-width py-8 space-y-8">
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4">
      <p className="text-xs uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-300">A tu ritmo · Sin registro</p>
      <h1 tabIndex={-1} className="text-3xl sm:text-4xl font-semibold">Guía y recursos</h1>
      <p className="max-w-2xl text-muted">Te ayudamos a orientar qué programa oficial de Educación Abierta se adapta a tu situación académica, qué requisitos y formularios presentar ante el MEP, y cómo planificar tu estudio.</p>
      <div className="flex flex-wrap gap-3">
        <button className={`${button} bg-indigo-600 text-white flex items-center gap-2`} onClick={() => onNavigate({ view: 'guide' })}><Compass size={18} />{wizard.program ? 'Continuar mi guía' : 'Comenzar guía opcional'}</button>
        <button className={`${button} ui-muted-button`} onClick={() => onNavigate({ view: 'welcome' })}>Omitir e ir a programas</button>
      </div>
      <p className="text-xs text-muted">Las respuestas se conservan solo durante esta sesión de la página. No se envían al MEP ni se guardan en un perfil.</p>
    </header>

    {/* Actionable Next Steps / Advice Card */}
    <section className="rounded-3xl border border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20 p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
        <CheckCircle2 className="size-4" />
        <span>Ruta de Acción Recomendada</span>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        ¿Qué debes hacer para matricular y prepararte con éxito?
      </h2>
      <div className="grid sm:grid-cols-3 gap-4 pt-1">
        <div className="rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900 p-4 space-y-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            1
          </span>
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Verifica tu elegibilidad</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Revisa si requieres convalidación formal de materias de colegio tradicional o si puedes ingresar directamente a BXM / EDAD.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900 p-4 space-y-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            2
          </span>
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Revisa tu expediente y trámite</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Consulta tus aprobaciones y el aviso de matrícula. Un expediente aceptado puede evitar repetir documentos de ingreso; usa el buscador para identificar el trámite que sí necesitas.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900 p-4 space-y-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            3
          </span>
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Ensaya con la Prueba Oficial Libre</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Explora los materiales oficiales de tu programa. En Matemáticas BXM puedes practicar el formato de 60 preguntas y revisar explicaciones.
          </p>
        </div>
      </div>
      <div className="pt-2 flex flex-wrap gap-3">
        <button
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs transition hover:bg-indigo-700"
          onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}
        >
          Iniciar Prueba Oficial BXM (Gratis)
        </button>
        <button
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition hover:bg-stone-50"
          onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2', tab: 'temario' })}
        >
          Explorar Temario Digital BXM
        </button>
      </div>
    </section>

    <Tabs label="Explorar guía y recursos" value={panel} onChange={setPanel} items={[{ id: 'resources', label: 'Materiales de estudio' }, { id: 'forms', label: 'Trámites y formularios' }, { id: 'programs', label: 'Conoce tus opciones' }, { id: 'support', label: 'Matrícula y apoyos' }]}>
    <section className="space-y-4" aria-labelledby="helper-programs">
      <h2 id="helper-programs" className="text-xl font-semibold">Conoce tus opciones</h2>
      <div className="flex flex-wrap gap-2" aria-label="Programa para consultar">
        {PROGRAM_ORDER.map(id => <button key={id} aria-pressed={program === id} onClick={() => { setProgram(id); const query = new URLSearchParams(window.location.hash.split('?')[1]); query.set('programa', id === 'i-ii' ? 'i_ii_ciclo' : id === 'iii' ? 'iii_ciclo' : id); for (const key of ['buscar', 'materiaFiltro', 'nivelFiltro', 'tipo']) query.delete(key); window.history.replaceState(null, '', '#/ayuda?' + query); }} className={`${button} ${program === id ? 'bg-indigo-600 text-white' : 'ui-surface'}`}>{PROGRAMS[id].name}</button>)}
      </div>
      {panel === 'programs' && <><button className="secondary-button" onClick={() => { wizard.selectProgram(program); onNavigate({ view: 'guide' }); }}>Orientarme sobre {copy.name}</button>
      <article className="ui-surface p-5 sm:p-7 rounded-2xl space-y-4">
        <div><h3 className="text-xl font-semibold">{copy.name} · {copy.offer}</h3><p className="mt-2 text-muted">{copy.summary}</p></div>
        <p className="text-sm">{copy.topology} Nota mínima por prueba: <strong>{copy.pass}</strong>.</p>
        <p className="text-sm text-muted">Materias: {PROGRAM_SUBJECTS[program].map(subject => subjectLabel(program, subject)).join(', ')}{program === 'bxm' || program === 'edad' ? ', y una ciencia: Biología, Física o Química.' : '.'}</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">{copy.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
        <div className="flex flex-wrap gap-2">{(PROGRAM_LEVELS[program].length ? PROGRAM_LEVELS[program] : [undefined]).map(level => <button key={level || program} className={`${button} ui-muted-button inline-flex items-center gap-2`} onClick={() => onNavigate(helperProgramRoute(program, level))}>Ver asignaturas{level ? ` · ${program === 'edad' ? (level === '10' ? 'Parte 1' : 'Parte 2') : `${level}°`}` : ''}<ArrowRight size={16} /></button>)}</div>
        <a className="text-link" href={routeHash({ ...helperProgramRoute(program), view: 'calendar' })}>Consultar fechas de este programa</a>
        <p className="text-xs text-muted">Información de referencia de Educación Abierta. Confirma requisitos, fechas y costos de tu convocatoria con la DGEC.</p>
      </article></>}
    </section>

    {panel === 'forms' && <FormHelper key={program} program={program} />}

    {panel === 'resources' && <section className="space-y-4" aria-labelledby="available-resources">
      <h2 id="available-resources" className="text-xl font-semibold flex gap-2 items-center"><BookOpen size={22} /> Recursos para estudiar</h2>
      <div className="ui-surface rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Práctica interactiva de Matemáticas BXM · 02-2026</h3>
        <p className="text-sm text-muted">Simulación de 60 ítems, práctica por área o tema, explicaciones, especificaciones, diccionario y fórmulas. También hay muestras de Matemáticas para otros programas y materiales oficiales para las demás asignaturas.</p>
        <button className={`${button} bg-indigo-600 text-white`} onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Abrir Matemáticas BXM</button>
      </div>
      <OfficialResources key={program} programId={program === 'i-ii' ? 'i_ii_ciclo' : program === 'iii' ? 'iii_ciclo' : program} subjectId={route?.subjectId} moduleId={route?.moduleId} />
    </section>}
    <IssueDraft />
    {panel === 'support' && <section className="ui-surface rounded-2xl p-5 space-y-4" aria-labelledby="official-support">
      <h2 id="official-support" className="text-xl font-semibold">Matrícula y apoyos educativos</h2>
      <p className="text-sm text-muted">Consulta el registro de calificaciones antes de inscribir materias. Conserva el comprobante de matrícula aceptada y presenta tu identificación original el día de la prueba.</p>
      <p className="text-sm text-muted">Si necesitas apoyos educativos, consulta a la Asesoría Pedagógica de Educación Especial de tu región. En III Ciclo y EDAD se debe adjuntar la carta de apoyos aprobados e indicarlos al matricular. Los reconocimientos de materias y estudios extranjeros requieren un trámite previo.</p>
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        <a href="https://portaldgec.mep.go.cr/yo_aplico/Login" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">Yo Aplico · Matrícula</a>
        <a href="https://dgec.mep.go.cr/" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">DGEC · Fechas y programas</a>
        <a href="https://dgec.mep.go.cr/consultas/" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">DGEC · Consultas y reconocimientos</a>
        <a href="#/acerca" className="min-h-11 inline-flex items-center underline">Preguntas Frecuentes y Acerca de</a>
      </div>
    </section>}
    </Tabs>
  </div>;
}

function IssueDraft() {
  const reference = new URLSearchParams(window.location.hash.split('?')[1]).get('reporte');
  const [text, setText] = useState(reference ? 'Pregunta: ' + reference + '\nDescribe el problema: ' : '');
  const [status, setStatus] = useState('');
  if (!reference) return null;
  return <section className="ui-surface p-6 rounded-2xl space-y-4"><h2 className="text-xl font-semibold">Preparar un reporte de contenido</h2><p>Revisa el texto antes de copiarlo. No incluyas datos personales. Este borrador no se envía automáticamente ni registra un caso de soporte.</p><label>Referencia y descripción<textarea rows={5} value={text} onChange={event => setText(event.target.value)} /></label><button className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(text); setStatus('Borrador copiado. Puedes compartirlo con quien te facilita esta plataforma.'); } catch { setStatus('Selecciona y copia el texto del borrador.'); } }}>Copiar borrador</button><p role="status">{status}</p></section>;
}
