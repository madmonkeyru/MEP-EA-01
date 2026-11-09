import { useState, useEffect, useMemo } from 'react';
import type { Assessment, OptionId, Attempt } from '@mep-ea/domain';
import type { PlatformApi } from '@mep-ea/api';
import { EntitlementRequired } from '@mep-ea/api';
import { TextRenderer as MathText } from '../components/common/TextRenderer';
import { PaywallModal } from '../components/common/PaywallModal';

export type SimulationMode = 'diagnostic' | 'mock' | 'simulation';

export interface SimulationSurfaceProps {
  api: PlatformApi;
  programId?: string;
  subjectId?: string;
  onAttemptSubmitted?: (attempt: Attempt) => void;
  onBackToHub?: () => void;
  onNavigateToRemediation?: () => void;
}

export function SimulationSurface({
  api,
  programId = 'bxm',
  subjectId = 'matematica',
  onAttemptSubmitted,
  onBackToHub,
  onNavigateToRemediation,
}: SimulationSurfaceProps) {
  // Mode Selection / Compilation state
  const [selectedMode, setSelectedMode] = useState<SimulationMode | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>();

  // Attempt Execution state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { questionId: string; optionId: OptionId; answeredAt: string }>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!deadlineAt || submittedAttempt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        void handleAutoSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt, submittedAttempt]);

  const handleLaunch = async (mode: SimulationMode) => {
    setLoading(true);
    setError(null);
    try {
      const compiled = await api.compileAssessment({
        programId,
        subjectId,
        mode,
      });
      setAssessment(compiled);
      setSelectedMode(mode);
      setCurrentIndex(0);
      setAnswers({});
      setBookmarkedIds(new Set());
      const now = Date.now();
      const deadline = now + compiled.blueprint.timeLimitSeconds * 1000;
      setStartedAt(new Date(now).toISOString());
      setDeadlineAt(deadline);
      setRemainingSeconds(compiled.blueprint.timeLimitSeconds);
      setSubmittedAttempt(null);
    } catch (err) {
      if (err instanceof EntitlementRequired) {
        setPaywallReason(err.reasonEs);
        setPaywallOpen(true);
      } else {
        setError(err instanceof Error ? err.message : 'Error al compilar la prueba');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: OptionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        optionId,
        answeredAt: new Date().toISOString(),
      },
    }));
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!assessment || !startedAt || !deadlineAt) return;
    setSubmitting(true);
    try {
      const session = await api.getSession();
      const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();
      const attempt: Attempt = {
        schemaVersion: 1,
        id: attemptId,
        learnerId: session.learnerId,
        assessmentId: assessment.id,
        assessmentVersion: assessment.blueprint.version,
        questionIds: assessment.questions.map(q => q.id),
        status: 'submitted',
        currentIndex,
        answers,
        startedAt,
        updatedAt: nowIso,
        submittedAt: nowIso,
        deadlineAt: new Date(deadlineAt).toISOString(),
      };

      await api.submitAttempt(attempt);
      setSubmittedAttempt(attempt);
      if (onAttemptSubmitted) onAttemptSubmitted(attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entregar la prueba.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  // Filtered questions indices for grid navigation
  const questions = assessment?.questions ?? [];
  const filteredIndices = useMemo(() => {
    return questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
      if (filter === 'unanswered') return !answers[q.id];
      if (filter === 'flagged') return bookmarkedIds.has(q.id);
      return true;
    }).map(({ idx }) => idx);
  }, [questions, answers, bookmarkedIds, filter]);

  const currentQuestion = questions[currentIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Result summary screen
  if (submittedAttempt && assessment) {
    const answeredCount = Object.keys(answers).length;
    const totalCount = assessment.questions.length;
    return (
      <section aria-label="Resultado de Simulación" className="bg-white p-6 border rounded-xl shadow-sm space-y-6">
        <div className="border-b pb-4">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Prueba Entregada
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            {selectedMode === 'simulation'
              ? 'Simulación Oficial MEP 02-2026'
              : selectedMode === 'mock'
              ? 'Simulacro Formativo de Matemática'
              : 'Diagnóstico Curricular BXM'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tu intento ha sido registrado de forma segura. Tus respuestas se proyectaron al Plan de Nivelación y al estado de dominio curricular.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border rounded-lg">
            <span className="text-xs text-slate-500 font-medium">Total de preguntas</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-4 bg-slate-50 border rounded-lg">
            <span className="text-xs text-slate-500 font-medium">Preguntas respondidas</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{answeredCount}</p>
          </div>
          <div className="p-4 bg-slate-50 border rounded-lg">
            <span className="text-xs text-slate-500 font-medium">Sin responder</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalCount - answeredCount}</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t flex-wrap">
          {onNavigateToRemediation && (
            <button
              type="button"
              onClick={onNavigateToRemediation}
              className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-xs"
            >
              Ver Plan de Nivelación y Reforzar Debilidades →
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setAssessment(null);
              setSelectedMode(null);
              setSubmittedAttempt(null);
            }}
            className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Realizar otra prueba
          </button>
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Volver a mi preparación
            </button>
          )}
        </div>
      </section>
    );
  }

  // 2. Active timed exam runner
  if (assessment && currentQuestion) {
    const isBookmarked = bookmarkedIds.has(currentQuestion.id);
    const selectedOption = answers[currentQuestion.id]?.optionId;

    return (
      <section aria-label="Ejecución de Examen" className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 border-b pb-4 flex-wrap">
          <div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
              {selectedMode === 'simulation' ? 'Simulación Oficial' : selectedMode === 'mock' ? 'Simulacro Formativo' : 'Diagnóstico'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Pregunta {currentIndex + 1} de {assessment.questions.length}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {remainingSeconds !== null && (
              <div
                role="timer"
                aria-label="Tiempo restante"
                className={`text-sm font-mono font-bold px-3 py-1.5 rounded-lg border ${
                  remainingSeconds < 300
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                ⏱ {formatTime(remainingSeconds)}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleToggleBookmark(currentQuestion.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isBookmarked ? '★ Marcada para revisión' : '☆ Marcar para revisión'}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Question Navigator Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Navegador de preguntas:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-slate-800 text-white font-bold' : 'hover:underline'}`}
              >
                Todas ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unanswered')}
                className={`px-2 py-0.5 rounded ${filter === 'unanswered' ? 'bg-slate-800 text-white font-bold' : 'hover:underline'}`}
              >
                Sin responder ({questions.filter(q => !answers[q.id]).length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('flagged')}
                className={`px-2 py-0.5 rounded ${filter === 'flagged' ? 'bg-slate-800 text-white font-bold' : 'hover:underline'}`}
              >
                Marcadas ({bookmarkedIds.size})
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-lg max-h-32 overflow-y-auto">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = bookmarkedIds.has(q.id);
              const isCurrent = idx === currentIndex;
              const matchesFilter = filteredIndices.includes(idx);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`size-8 rounded text-xs font-bold transition flex items-center justify-center relative ${
                    isCurrent
                      ? 'ring-2 ring-indigo-600 ring-offset-1 bg-indigo-600 text-white'
                      : isAnswered
                      ? 'bg-slate-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  } ${!matchesFilter ? 'opacity-30' : ''}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 size-2 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stem and Options */}
        <div className="space-y-4 pt-2">
          <div className="text-base text-slate-900 leading-relaxed font-serif p-4 bg-slate-50/60 border rounded-lg">
            <MathText content={currentQuestion.stem} />
          </div>

          <div className="space-y-2.5">
            {currentQuestion.options.map(opt => {
              const selected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-sm transition flex items-start gap-3 ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <span
                    className={`size-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs uppercase ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MathText content={opt.text} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t flex-wrap">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              disabled={currentIndex >= assessment.questions.length - 1}
              onClick={() => setCurrentIndex(i => Math.min(assessment.questions.length - 1, i + 1))}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Entregando…' : 'Entregar prueba'}
          </button>
        </div>
      </section>
    );
  }

  // 3. Launcher Selection View
  return (
    <section aria-label="Plataforma de Simulación y Evaluación" className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Simulación y Evaluaciones Oficiales</h2>
        <p className="text-sm text-slate-500 mt-1">
          Generación determinista según las tablas de especificaciones DGEC/MEP (Convocatoria 02-2026).
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Diagnostic Mode */}
        <article className="p-5 border rounded-xl flex flex-col justify-between hover:border-slate-300 transition bg-slate-50/30">
          <div>
            <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 mb-2">
              Gratuito
            </div>
            <h3 className="text-lg font-bold text-slate-900">Diagnóstico Curricular</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              20 ítems balanceados (8 Geometría, 8 Funciones, 4 Estadística). Detecta debilidades y orienta tu ruta inicial.
            </p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <p>⏱ 30 minutos de tiempo límite</p>
              <p>🎯 Preguntas del banco propio</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleLaunch('diagnostic')}
            className="mt-5 w-full py-2 px-3 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
          >
            Iniciar diagnóstico
          </button>
        </article>

        {/* Formative Mock Mode */}
        <article className="p-5 border rounded-xl flex flex-col justify-between hover:border-slate-300 transition bg-slate-50/30">
          <div>
            <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
              Gratuito
            </div>
            <h3 className="text-lg font-bold text-slate-900">Simulacro Formativo</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              20 ítems cronometrados para comprobar tu evolución. Alimenta directamente tu Plan de Nivelación y retests.
            </p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <p>⏱ 45 minutos de tiempo límite</p>
              <p>📊 Alimenta nivelación continua</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleLaunch('mock')}
            className="mt-5 w-full py-2 px-3 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
          >
            Iniciar simulacro
          </button>
        </article>

        {/* Official Reference Simulation Mode (Pro Gated) */}
        <article className="p-5 border border-amber-300 rounded-xl flex flex-col justify-between bg-amber-50/30 relative">
          <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
            Plan Pro
          </span>
          <div>
            <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 mb-2">
              Referencia MEP 02-2026
            </div>
            <h3 className="text-lg font-bold text-slate-900">Simulación Oficial</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              60 ítems oficiales auténticos bajo condiciones reales de examen (23 Geometría, 25 Funciones, 12 Estadística).
            </p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <p>⏱ 150 minutos cronometrados</p>
              <p>🏛 Flujo oficial aislado</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleLaunch('simulation')}
            className="mt-5 w-full py-2 px-3 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition"
          >
            Comenzar simulación
          </button>
        </article>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        featureTitle="Simulación Completa de Examen MEP"
        featureDescription={paywallReason ?? 'La simulación completa de 60 ítems con cronómetro oficial requiere una suscripción Pro.'}
      />
    </section>
  );
}
