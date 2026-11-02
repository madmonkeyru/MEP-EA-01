import { useMemo, useState } from 'react';
import type { DomainArea, PracticeConfig, PracticeMode } from '../../types';
import { dataService } from '../../services/dataService';
import { knowledgeService } from '../../services/knowledgeService';
import { prepareItems, modeLabel, isExam } from '../../services/learningSession';
import { Dialog } from '../common/Dialog';
import { CustomSelect } from '../common/CustomSelect';

export function EvaluationModulesWidget({ onStartSimulation, onStartPractice, initialMode = 'area' }: { initialMode?: PracticeMode; onStartSimulation: () => void; onStartPractice: (config: PracticeConfig) => void }) {
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [area, setArea] = useState<DomainArea>('geometry');
  const [topic, setTopic] = useState('all');
  const [set, setSet] = useState('all');
  const [concept, setConcept] = useState('');
  const [count, setCount] = useState<number | 'all'>(10);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [error, setError] = useState('');
  const [preflight, setPreflight] = useState<PracticeConfig | null>(null);
  const all = dataService.getAllItems();
  const concepts = knowledgeService.getTerms().filter(term => all.some(item => item.concept_id === term.id || item.linked_concepts?.includes(term.id)));
  const config: PracticeConfig = { mode, programId: dataService.getCurrentProgramId(), subjectId: dataService.getCurrentSubjectId(), convocatoriaId: dataService.getCurrentConvocatoriaId(), setId: mode === 'simulation' ? 'set_1' : mode === 'dynamic_mock' ? 'all' : set,
    area: mode === 'area' || mode === 'topic' ? area : undefined, topic: mode === 'topic' ? topic : undefined, conceptId: mode === 'concept_drilldown' ? concept : undefined,
    itemCount: isExam({ mode } as PracticeConfig) ? 60 : count, enableTimer: isExam({ mode } as PracticeConfig) || timed, timerDurationMinutes: isExam({ mode } as PracticeConfig) ? 150 : minutes };
  // Counts are calculated without repeatedly shuffling the random practice pool.
  const eligible = useMemo(() => prepareItems({ ...config, mode: mode === 'random_practice' ? 'area' : mode, itemCount: 'all', area: mode === 'random_practice' ? undefined : config.area }).length, [mode, area, topic, set, concept, all.length]);
  const actual = Math.min(config.itemCount === 'all' ? eligible : config.itemCount, eligible);
  const selectMode = (next: PracticeMode) => { setMode(next); setError(''); };
  function start() {
    if (!eligible || (mode === 'concept_drilldown' && !concept)) { setError('Elige una selección con preguntas disponibles.'); return; }
    if (config.enableTimer && (!Number.isFinite(config.timerDurationMinutes) || config.timerDurationMinutes < 5 || config.timerDurationMinutes > 180)) { setError('El tiempo debe ser de 5 a 180 minutos.'); return; }
    if (isExam(config) && actual < 60) { setError('No hay 60 preguntas disponibles para esta simulación. Cambia el conjunto.'); return; }
    const ready = { ...config, itemCount: actual };
    if (isExam(config)) setPreflight(ready); else onStartPractice(ready);
  }

  const simulationOptions = [
    { value: 'simulation', label: 'Prueba completa de referencia', description: 'Simula el examen 02-2026 oficial' },
    { value: 'dynamic_mock', label: 'Distribución curricular: 23 / 25 / 12', description: 'Ponderado oficial MEP' },
  ];

  const practiceModeOptions = [
    { value: 'area', label: 'Área temática', description: 'Geometría, Álgebra o Estadística' },
    { value: 'topic', label: 'Tema específico', description: 'Práctica focalizada por tema' },
    { value: 'random_practice', label: 'Preguntas variadas', description: 'Mezcla aleatoria' },
    { value: 'concept_drilldown', label: 'Concepto clave', disabled: !concepts.length, description: !concepts.length ? 'Sin preguntas vinculadas' : 'Refuerzo de conceptos' },
  ];

  const setOptions = [
    { value: 'all', label: 'Todos los conjuntos' },
    ...dataService.getSets().map(s => ({ value: s.id, label: s.name })),
  ];

  const areaOptions = [
    { value: 'geometry', label: 'Geometría' },
    { value: 'functions', label: 'Relaciones y álgebra' },
    { value: 'statistics', label: 'Estadística y probabilidad' },
  ];

  const topicOptions = [
    { value: 'all', label: 'Todos los temas del área' },
    ...dataService.getTopicsByArea(area, set).map(t => ({ value: t, label: t })),
  ];

  const countOptions = [
    { value: '5', label: '5 preguntas' },
    { value: '10', label: '10 preguntas' },
    { value: '20', label: '20 preguntas' },
    { value: 'all', label: 'Todas las disponibles' },
  ];

  return <section className="ui-surface rounded-2xl p-5 sm:p-7 space-y-5" aria-labelledby="practice-config-title">
    <h2 id="practice-config-title" className="text-xl font-semibold">¿Cómo quieres estudiar hoy?</h2>
    <fieldset><legend className="field-legend">Tu objetivo</legend><div className="action-row">
      <button className={!isExam(config) ? 'primary-button' : 'secondary-button'} aria-pressed={!isExam(config)} onClick={() => selectMode('area')}>Aprender y repasar</button>
      <button className={isExam(config) ? 'primary-button' : 'secondary-button'} aria-pressed={isExam(config)} onClick={() => selectMode('simulation')}>Ensayar el examen</button>
    </div></fieldset>
    <form className="form-stack" onSubmit={event => { event.preventDefault(); start(); }}>
      {isExam(config) ? <>
        <label>Tipo de simulación
          <CustomSelect
            label="Tipo de simulación"
            value={mode}
            options={simulationOptions}
            onChange={val => selectMode(val as PracticeMode)}
          />
        </label>
        <p className="text-sm text-stone-600 dark:text-stone-300">60 preguntas · 150 minutos · Sin respuestas ni explicaciones durante el intento.</p>
      </> : <>
        <label>Organizar práctica por
          <CustomSelect
            label="Organizar práctica por"
            value={mode}
            options={practiceModeOptions}
            onChange={val => selectMode(val as PracticeMode)}
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label>Conjunto de preguntas
            <CustomSelect
              label="Conjunto de preguntas"
              value={set}
              options={setOptions}
              onChange={val => { setSet(val); setTopic('all'); }}
            />
          </label>
          {(mode === 'area' || mode === 'topic') && (
            <label>Área temática
              <CustomSelect
                label="Área temática"
                value={area}
                options={areaOptions}
                onChange={val => { setArea(val as DomainArea); setTopic('all'); }}
              />
            </label>
          )}
        </div>
        {mode === 'topic' && (
          <label>Tema
            <CustomSelect
              label="Tema"
              value={topic}
              options={topicOptions}
              onChange={val => setTopic(val)}
            />
          </label>
        )}
        {mode === 'concept_drilldown' && (
          <label>Concepto
            <CustomSelect
              label="Concepto"
              value={concept}
              options={[
                { value: '', label: 'Elige un concepto disponible' },
                ...concepts.map(c => ({ value: c.id, label: c.term })),
              ]}
              onChange={val => setConcept(val)}
            />
          </label>
        )}
        <label>Cantidad de preguntas
          <CustomSelect
            label="Cantidad de preguntas"
            value={String(count)}
            options={countOptions}
            onChange={val => setCount(val === 'all' ? 'all' : Number(val))}
          />
        </label>
        <label className="inline-choice"><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />Practicar con límite de tiempo</label>
        {timed && <label>Duración en minutos<input type="number" min={5} max={180} required value={minutes || ''} onChange={e => setMinutes(Number(e.target.value))} /></label>}
        <p className="muted">Puedes comprobar cada respuesta para aprender. Una vez verificada, se conserva tu primera elección.</p>
      </>}
      <p role="status">{eligible} preguntas disponibles. Este intento tendrá <strong>{actual}</strong>{!isExam(config) && count !== 'all' && count > eligible ? ' (ajustado al contenido disponible)' : ''}.</p>
      {error && <p role="alert" className="error-message">{error}</p>}
      <button className="primary-button" disabled={!actual}>{isExam(config) ? 'Preparar simulación' : 'Iniciar práctica'}</button>
    </form>
    {preflight && <Dialog title="Antes de comenzar" onClose={() => setPreflight(null)}><h3>{modeLabel(preflight)}</h3><p>Matemáticas BXM · Referencia 02-2026 · 60 preguntas · 150 minutos.</p><p>El tiempo continúa al salir o cerrar la página. Al terminar, se entregan automáticamente las respuestas guardadas. Podrás revisar las soluciones después de entregar.</p><p>Fórmulas: apoyo de estudio disponible. Calculadora no programable. Esta práctica independiente no equivale a una prueba ni matrícula del MEP.</p><button className="primary-button" onClick={() => { const selected = preflight; setPreflight(null); if (selected.mode === 'simulation') onStartSimulation(); else onStartPractice(selected); }}>Iniciar simulación</button></Dialog>}
  </section>;
}
