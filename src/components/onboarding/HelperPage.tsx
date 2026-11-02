import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Compass } from 'lucide-react';
import { AppRoute } from '../../services/navigation';
import { PROGRAMS, PROGRAM_LEVELS, PROGRAM_SUBJECTS, subjectLabel } from '../../services/onboarding/catalog';
import { PROGRAM_ORDER, type ProgramId, type LevelId } from '../../services/onboarding/types';
import { useWizard } from './wizardStore';
import { OfficialResources } from '../knowledge/OfficialResources';
import { dataService } from '../../services/dataService';

export function helperProgramRoute(program: ProgramId, level?: LevelId): AppRoute {
  return { view: 'framework', programId: program === 'i-ii' ? 'cico' : program === 'iii' ? 'iii_ciclo' : program,
    moduleId: program === 'iii' ? `III_CICLO_${level || '7'}` : program === 'edad' ? (level === '11' ? 'EDAD_2' : 'EDAD_1') : undefined,
    convocatoriaId: '2026-c2' };
}

export function HelperPage({ onNavigate, route }: { onNavigate: (route: AppRoute) => void; route?: AppRoute }) {
  const wizard = useWizard();
  const [program, setProgram] = useState<ProgramId>(() => {
    if (wizard.program && wizard.program !== 'unsure') return wizard.program;
    const active = route?.programId || dataService.getCurrentProgramId();
    return active === 'cico' ? 'i-ii' : active === 'iii_ciclo' ? 'iii' : active === 'edad' ? 'edad' : 'bxm';
  });

  useEffect(() => { const id = route?.programId; if (id) setProgram(id === 'cico' ? 'i-ii' : id === 'iii_ciclo' ? 'iii' : id === 'edad' ? 'edad' : 'bxm'); }, [route?.programId]);
  const copy = PROGRAMS[program];
  const button = 'min-h-11 px-4 py-3 rounded-xl font-semibold text-sm cursor-pointer';

  return <div className="helper-page max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
    <header className="page-intro rounded-3xl p-6 sm:p-8 space-y-4">
      <p className="text-xs uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-300">A tu ritmo · Sin registro</p>
      <h1 tabIndex={-1} className="text-3xl sm:text-4xl font-semibold">Guía y recursos</h1>
      <p className="max-w-2xl text-muted">Explora los programas y sus materiales sin responder preguntas. Si necesitas orientación, la guía te ayuda a organizar una ruta y tus trámites. Es completamente opcional.</p>
      <div className="flex flex-wrap gap-3">
        <button className={`${button} bg-indigo-600 text-white flex items-center gap-2`} onClick={() => onNavigate({ view: 'guide' })}><Compass size={18} />{wizard.program ? 'Continuar mi guía' : 'Comenzar guía opcional'}</button>
        <button className={`${button} ui-muted-button`} onClick={() => onNavigate({ view: 'welcome' })}>Omitir e ir a programas</button>
      </div>
      <p className="text-xs text-muted">Las respuestas se conservan solo durante esta sesión de la página. No se envían al MEP ni se guardan en un perfil.</p>
    </header>

    <section className="space-y-4" aria-labelledby="helper-programs">
      <h2 id="helper-programs" className="text-xl font-semibold">Conoce tus opciones</h2>
      <div className="flex flex-wrap gap-2" aria-label="Programa para consultar">
        {PROGRAM_ORDER.map(id => <button key={id} aria-pressed={program === id} onClick={() => { setProgram(id); const query = new URLSearchParams(window.location.hash.split('?')[1]); query.set('programa', id === 'i-ii' ? 'cico' : id === 'iii' ? 'iii_ciclo' : id); for (const key of ['buscar', 'materiaFiltro', 'nivelFiltro', 'tipo']) query.delete(key); window.history.replaceState(null, '', '#/ayuda?' + query); }} className={`${button} ${program === id ? 'bg-indigo-600 text-white' : 'ui-surface'}`}>{PROGRAMS[id].name}</button>)}
      </div>
      <button className="secondary-button" onClick={() => { wizard.selectProgram(program); onNavigate({ view: 'guide' }); }}>Orientarme sobre {copy.name}</button>
      <article className="ui-surface p-5 sm:p-7 rounded-2xl space-y-4">
        <div><h3 className="text-xl font-semibold">{copy.name} · {copy.offer}</h3><p className="mt-2 text-muted">{copy.summary}</p></div>
        <p className="text-sm">{copy.topology} Nota mínima por prueba: <strong>{copy.pass}</strong>.</p>
        <p className="text-sm text-muted">Materias: {PROGRAM_SUBJECTS[program].map(subject => subjectLabel(program, subject)).join(', ')}{program === 'bxm' || program === 'edad' ? ', y una ciencia: Biología, Física o Química.' : '.'}</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">{copy.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
        <div className="flex flex-wrap gap-2">{(PROGRAM_LEVELS[program].length ? PROGRAM_LEVELS[program] : [undefined]).map(level => <button key={level || program} className={`${button} ui-muted-button inline-flex items-center gap-2`} onClick={() => onNavigate(helperProgramRoute(program, level))}>Ver asignaturas{level ? ` · ${program === 'edad' ? (level === '10' ? 'Parte 1' : 'Parte 2') : `${level}°`}` : ''}<ArrowRight size={16} /></button>)}</div>
        <p className="text-xs text-muted">Información de referencia de Educación Abierta. Confirma requisitos, fechas y costos de tu convocatoria con la DGEC.</p>
      </article>
    </section>

    <section className="space-y-4" aria-labelledby="available-resources">
      <h2 id="available-resources" className="text-xl font-semibold flex gap-2 items-center"><BookOpen size={22} /> Recursos para estudiar</h2>
      <div className="ui-surface rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Práctica interactiva de Matemáticas BXM · 02-2026</h3>
        <p className="text-sm text-muted">Simulación de 60 ítems, práctica por área o tema, explicaciones, especificaciones, diccionario y fórmulas. Las demás rutas de la plataforma están en vista previa.</p>
        <button className={`${button} bg-indigo-600 text-white`} onClick={() => onNavigate({ view: 'hub', programId: 'bxm', subjectId: 'matematicas', convocatoriaId: '2026-c2' })}>Abrir Matemáticas BXM</button>
      </div>
      <OfficialResources key={program} programId={program === 'i-ii' ? 'cico' : program === 'iii' ? 'iii_ciclo' : program} subjectId={route?.subjectId} moduleId={route?.moduleId} />
    </section>

    <IssueDraft />
    <section className="ui-surface rounded-2xl p-5 space-y-4" aria-labelledby="official-support">
      <h2 id="official-support" className="text-xl font-semibold">Matrícula y apoyos educativos</h2>
      <p className="text-sm text-muted">Consulta el registro de calificaciones antes de inscribir materias. Conserva el comprobante de matrícula aceptada y presenta tu identificación original el día de la prueba.</p>
      <p className="text-sm text-muted">Si necesitas apoyos educativos, consulta a la Asesoría Pedagógica de Educación Especial de tu región. En III Ciclo y EDAD se debe adjuntar la carta de apoyos aprobados e indicarlos al matricular. Los reconocimientos de materias y estudios extranjeros requieren un trámite previo.</p>
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        <a href="https://portaldgec.mep.go.cr/yo_aplico/Login" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">Yo Aplico · Matrícula</a>
        <a href="https://dgec.mep.go.cr/" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">DGEC · Fechas y programas</a>
        <a href="https://dgec.mep.go.cr/consultas/" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center underline">DGEC · Consultas y reconocimientos</a>
      </div>
    </section>
  </div>;
}

function IssueDraft() {
  const reference = new URLSearchParams(window.location.hash.split('?')[1]).get('reporte');
  const [text, setText] = useState(reference ? 'Pregunta: ' + reference + '\nDescribe el problema: ' : '');
  const [status, setStatus] = useState('');
  if (!reference) return null;
  return <section className="ui-surface p-6 rounded-2xl space-y-4"><h2 className="text-xl font-semibold">Preparar un reporte de contenido</h2><p>Revisa el texto antes de copiarlo. No incluyas datos personales. Este borrador no se envía automáticamente ni registra un caso de soporte.</p><label>Referencia y descripción<textarea rows={5} value={text} onChange={event => setText(event.target.value)} /></label><button className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(text); setStatus('Borrador copiado. Puedes compartirlo con quien te facilita esta plataforma.'); } catch { setStatus('Selecciona y copia el texto del borrador.'); } }}>Copiar borrador</button><p role="status">{status}</p></section>;
}
