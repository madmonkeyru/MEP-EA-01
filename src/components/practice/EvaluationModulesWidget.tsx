import { useState, useEffect } from 'react';
import type { DifficultyTier, DomainArea, PracticeConfig, PracticeMode } from '../../types';
import { dataService } from '../../services/dataService';
import { knowledgeService } from '../../services/knowledgeService';
import { storageService } from '../../services/storageService';
import { subscriptionService, type SubscriptionTier } from '../../services/subscriptionService';
import { prepareItems, modeLabel, isExam } from '../../services/learningSession';
import { Dialog } from '../common/Dialog';
import { CustomSelect } from '../common/CustomSelect';
import { PaywallModal } from '../common/PaywallModal';
import { Compass } from 'lucide-react';

export function EvaluationModulesWidget({ onStartSimulation, onStartPractice, initialMode = 'area' }: { initialMode?: PracticeMode; onStartSimulation: () => void; onStartPractice: (config: PracticeConfig) => void }) {
  const [goal, setGoal] = useState<'diagnostic' | 'practice' | 'exam'>(initialMode === 'simulation' || initialMode === 'dynamic_mock' ? 'exam' : initialMode === 'diagnostic' ? 'diagnostic' : 'practice');
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [area, setArea] = useState<DomainArea>('geometry');
  const [topic, setTopic] = useState('all');
  const [set, setSet] = useState('all');
  const [concept, setConcept] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyTier>();
  const [count, setCount] = useState<number | 'all'>(initialMode === 'diagnostic' ? 8 : 10);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [error, setError] = useState('');
  const [preflight, setPreflight] = useState<PracticeConfig | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState({ title: '', desc: '' });
  const [tier, setTier] = useState<SubscriptionTier>(subscriptionService.getTier());

  useEffect(() => {
    return subscriptionService.subscribe(newTier => setTier(newTier));
  }, []);

  const all = dataService.getAllItems();
  const concepts = knowledgeService.getTerms().filter(term => all.some(item => item.concept_id === term.id || item.linked_concepts?.includes(term.id)));

  const config: PracticeConfig = {
    mode,
    programId: dataService.getCurrentProgramId(),
    subjectId: dataService.getCurrentSubjectId(),
    convocatoriaId: dataService.getCurrentConvocatoriaId(),
    setId: mode === 'simulation' ? 'set_1' : mode === 'dynamic_mock' ? 'all' : set,
    area: mode === 'area' || mode === 'topic' ? area : undefined,
    topic: mode === 'topic' ? topic : undefined,
    conceptId: mode === 'concept_drilldown' ? concept : undefined,
    difficultyTier: goal === 'practice' ? difficulty : undefined,
    itemCount: isExam({ mode } as PracticeConfig) ? 60 : mode === 'diagnostic' ? 8 : count,
    enableTimer: isExam({ mode } as PracticeConfig) || timed,
    timerDurationMinutes: isExam({ mode } as PracticeConfig) ? 150 : minutes
  };
  // Counts are calculated without repeatedly shuffling the random practice pool.
  const eligible = mode === 'concept_drilldown' && !concept ? 0 : prepareItems({
    ...config,
    mode: mode === 'random_practice' ? 'area' : mode,
    itemCount: 'all',
  }).length;
  const actual = Math.min(config.itemCount === 'all' ? eligible : config.itemCount, eligible);

  const selectGoal = (nextGoal: 'diagnostic' | 'practice' | 'exam') => {
    setGoal(nextGoal);
    setError('');
    storageService.logTelemetryEvent('goal_selected', { goal: nextGoal });
    if (nextGoal === 'diagnostic') {
      setMode('diagnostic');
      setCount(8);
    } else if (nextGoal === 'practice') {
      setMode('area');
      setCount(10);
    } else {
      setMode('simulation');
      setCount(60);
    }
  };

  const triggerPaywall = (title: string, desc: string) => {
    setPaywallFeature({ title, desc });
    setPaywallOpen(true);
  };

  const selectMode = (next: PracticeMode) => {
    if (next === 'dynamic_mock' && tier !== 'premium') {
      triggerPaywall('Simulacro Ponderado MEP Pro', 'Simula la distribución exacta de 23 ítems de Geometría, 25 de Álgebra y 12 de Estadística combinando todo el banco.');
      return;
    }
    setMode(next);
    setError('');
  };

  function start() {
    if (!eligible || (mode === 'concept_drilldown' && !concept)) { setError('Elige una selección con preguntas disponibles.'); return; }
    if (config.enableTimer && (!Number.isFinite(config.timerDurationMinutes) || config.timerDurationMinutes < 5 || config.timerDurationMinutes > 180)) { setError('El tiempo debe ser de 5 a 180 minutos.'); return; }
    if (isExam(config) && actual < 60) { setError('No hay 60 preguntas disponibles para esta simulación. Cambia el conjunto.'); return; }

    // If attempting premium modes while on free tier, guide user to upgrade
    if (tier !== 'premium') {
      if (mode === 'dynamic_mock') {
        triggerPaywall('Simulacro Ponderado MEP Pro', 'Combina 23 ítems de Geometría, 25 de Álgebra y 12 de Estadística.');
        return;
      }
      if (mode === 'concept_drilldown') {
        triggerPaywall('Refuerzo de Conceptos Pro', 'Practica preguntas asociadas a conceptos y teoremas matemáticos clave.');
        return;
      }
    }

    const ready = { ...config, itemCount: actual };

    if (mode === 'diagnostic') {
      storageService.logTelemetryEvent('diagnostic_started', { questions: actual });
    } else {
      storageService.logTelemetryEvent('session_started', { mode, questions: actual });
    }

    if (isExam(config)) setPreflight(ready); else onStartPractice(ready);
  }

  const simulationOptions = [
    { value: 'simulation', label: 'Prueba completa de referencia (Gratis)', description: 'Simula el examen 02-2026 oficial (60 preguntas - Acceso Libre)' },
    { value: 'dynamic_mock', label: 'Distribución curricular: 23 / 25 / 12 (PRO)', description: 'Ponderado oficial MEP (60 preguntas combinadas)' },
  ];

  const practiceModeOptions = [
    { value: 'area', label: 'Área temática', description: 'Geometría, Álgebra o Estadística' },
    { value: 'topic', label: 'Tema específico', description: 'Práctica focalizada por tema' },
    { value: 'random_practice', label: 'Preguntas variadas', description: 'Mezcla aleatoria' },
    { value: 'concept_drilldown', label: 'Concepto clave (PRO)', disabled: !concepts.length, description: !concepts.length ? 'Sin preguntas vinculadas' : 'Refuerzo de conceptos' },
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

  return (
    <section className="ui-surface rounded-2xl p-5 sm:p-7 space-y-6" aria-labelledby="practice-config-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 dark:border-stone-700/60 pb-4">
        <div>
          <h2 id="practice-config-title" className="text-xl sm:text-2xl font-bold tracking-tight">
            ¿Cómo quieres estudiar hoy?
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            Elige un objetivo para comenzar. Tienes acceso libre a la prueba oficial completa de referencia (60 ítems).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tier === 'premium' ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black tracking-wider uppercase bg-amber-400 text-stone-950 shadow-2xs">
              Pro
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              1 Practica Oficial Gratis
            </span>
          )}
        </div>
      </div>

      {/* Goal Selector: 3 Clear Pillars */}
      <fieldset>
        <legend className="field-legend mb-2">Tu objetivo</legend>
        <div className="action-row flex flex-wrap gap-2">
          <button
            type="button"
            className={goal === 'practice' ? 'primary-button' : 'secondary-button'}
            aria-pressed={goal === 'practice'}
            onClick={() => selectGoal('practice')}
          >
            Aprender y repasar
          </button>
          <button
            type="button"
            className={goal === 'diagnostic' ? 'primary-button' : 'secondary-button'}
            aria-pressed={goal === 'diagnostic'}
            onClick={() => selectGoal('diagnostic')}
          >
            Diagnóstico Rápido
          </button>
          <button
            type="button"
            className={goal === 'exam' ? 'primary-button' : 'secondary-button'}
            aria-pressed={goal === 'exam'}
            onClick={() => selectGoal('exam')}
          >
            Ensayar el examen
          </button>
        </div>
      </fieldset>

      <form className="form-stack pt-2" onSubmit={event => { event.preventDefault(); start(); }}>
        {goal === 'diagnostic' && (
          <div className="bg-stone-50 dark:bg-stone-900/40 rounded-xl p-4 border border-stone-200 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm">
              <Compass className="w-4 h-4" />
              <span>Configuración del Diagnóstico</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Evaluaremos 8 preguntas equilibradas (3 de Geometría, 3 de Álgebra y 2 de Estadística). Al finalizar, obtendrás tu diagnóstico por área y recomendaciones de temas específicos para practicar.
            </p>
            <label className="inline-choice text-xs sm:text-sm text-stone-700 dark:text-stone-300 cursor-pointer pt-1">
              <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} className="rounded border-stone-300 text-indigo-600" />
              <span>Activar cronómetro sugerido (20 minutos)</span>
            </label>
          </div>
        )}

        {goal === 'exam' && (
          <>
            <label>Tipo de simulación
              <CustomSelect
                label="Tipo de simulación"
                value={mode}
                options={simulationOptions}
                onChange={val => selectMode(val as PracticeMode)}
              />
            </label>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              60 preguntas · 150 minutos · Sin respuestas ni explicaciones durante el intento. Intentos ilimitados en la prueba oficial de referencia.
            </p>
          </>
        )}

        {goal === 'practice' && (
          <>
            <label>Organizar práctica por
              <CustomSelect
                label="Organizar práctica por"
                value={mode}
                options={practiceModeOptions}
                onChange={val => {
                  if (val === 'concept_drilldown' && tier !== 'premium') {
                    triggerPaywall('Refuerzo por Concepto Clave Pro', 'Practica directamente con teoremas y conceptos matemáticos con explicaciones profundas.');
                  } else {
                    selectMode(val as PracticeMode);
                  }
                }}
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
            <label>Dificultad
              <CustomSelect
                label="Dificultad"
                value={difficulty === undefined ? 'all' : String(difficulty)}
                options={[
                  { value: 'all', label: 'Todos los niveles' },
                  { value: '1', label: 'Nivel 1 · Básico' },
                  { value: '2', label: 'Nivel 2 · Intermedio' },
                  { value: '3', label: 'Nivel 3 · Avanzado' },
                ]}
                onChange={value => {
                  setDifficulty(value === 'all' ? undefined : Number(value) as DifficultyTier);
                  setError('');
                }}
              />
            </label>
            <label>Cantidad de preguntas
              <CustomSelect
                label="Cantidad de preguntas"
                value={String(count)}
                options={countOptions}
                onChange={val => setCount(val === 'all' ? 'all' : Number(val))}
              />
            </label>
            <label className="inline-choice">
              <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />
              Practicar con límite de tiempo
            </label>
            {timed && (
              <label>Duración en minutos
                <input type="number" min={5} max={180} required value={minutes || ''} onChange={e => setMinutes(Number(e.target.value))} />
              </label>
            )}
            <p className="muted">Puedes comprobar cada respuesta para aprender. Una vez verificada, se conserva tu primera elección.</p>
          </>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700/60">
          <p role="status" className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {eligible} preguntas en banco. Este intento tendrá <strong>{actual}</strong>
            {!isExam(config) && mode !== 'diagnostic' && count !== 'all' && count > eligible ? ' (ajustado)' : ''}.
          </p>
          {error && <p role="alert" className="error-message text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button className="primary-button self-stretch sm:self-auto py-2.5 px-6 font-semibold" disabled={!actual}>
            {goal === 'diagnostic' ? 'Iniciar Diagnóstico (8 ítems)' : isExam(config) ? 'Preparar simulación' : 'Iniciar práctica'}
          </button>
        </div>
      </form>

      {preflight && (
        <Dialog title="Antes de comenzar" onClose={() => setPreflight(null)}>
          <h3 className="font-bold text-lg mb-2">{modeLabel(preflight)}</h3>
          <p className="text-sm mb-2">Matemáticas BXM · Referencia 02-2026 · 60 preguntas · 150 minutos.</p>
          <p className="text-sm text-stone-600 dark:text-stone-300 mb-2">
            El tiempo continúa al salir o cerrar la página. Al terminar, se entregan automáticamente las respuestas guardadas. Podrás revisar las soluciones después de entregar.
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Fórmulas: apoyo de estudio disponible. Calculadora no programable. Esta práctica independiente no equivale a una prueba ni matrícula del MEP.
          </p>
          <button
            className="primary-button w-full py-2.5"
            onClick={() => {
              const selected = preflight;
              setPreflight(null);
              if (selected.mode === 'simulation') onStartSimulation();
              else onStartPractice(selected);
            }}
          >
            Iniciar simulación
          </button>
        </Dialog>
      )}

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        featureTitle={paywallFeature.title}
        featureDescription={paywallFeature.desc}
      />
    </section>
  );
}
