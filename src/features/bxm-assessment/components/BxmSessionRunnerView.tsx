import { Dialog } from '../../../components/common/Dialog';
import { TextRenderer } from '../../../components/common/TextRenderer';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AssessmentItem,
  LearnerReportedReason,
  OptionLetter,
  SessionResultExport,
} from '../types';
import { SessionRunner } from '../sessionRunner';
import { STANDARD_LEARNER_REASONS } from '../wrongAnswerClassifier';

export interface BxmSessionRunnerViewProps {
  runner: SessionRunner;
  onFinish: (result: SessionResultExport) => void;
  onExit?: () => void;
  formulaSheet?: React.ReactNode;
  onStateChange?: (runner: SessionRunner) => void;
}

export const BxmSessionRunnerView: React.FC<BxmSessionRunnerViewProps> = ({
  runner,
  onFinish,
  onExit,
  formulaSheet,
  onStateChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(runner.getCurrentIndex());
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showLearnerReasonModal, setShowLearnerReasonModal] = useState(false);
  const [result, setResult] = useState<SessionResultExport | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [_flagRevision, setFlagRevision] = useState(0);

  const questionHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { questionHeading.current?.focus(); }, [currentIndex]);
  const isExam = runner.isExamMode();
  const currentItem: AssessmentItem | undefined = runner.items[currentIndex];
  const currentState = currentItem ? runner.getItemState(currentItem.id) : undefined;
  const currentFeedback = currentState?.retryAttempts.at(-1) || currentState?.firstResponse;

  // Sync draft selection on item change
  useEffect(() => {
    if (currentItem && currentState) {
      setSelectedOption(currentState.draftOption);
      setShowExplanation(!runner.isExamMode() && runner.policy.allowImmediateFeedback && currentState.isFinalAnswerSubmitted);
      setCurrentHint(null);
    }
  }, [currentIndex, currentItem, currentState]);

  const finishDelivered = useRef(false);
  const handleFinish = useCallback((exportData: SessionResultExport) => {
    if (finishDelivered.current) return;
    finishDelivered.current = true;
    setResult(exportData);
    onFinish(exportData);
  }, [onFinish]);

  const persist = useCallback(() => {
    if (runner.isFinished()) handleFinish(runner.exportResults());
    else onStateChange?.(runner);
  }, [runner, handleFinish, onStateChange]);
  useEffect(() => {
    runner.setCurrentIndex(currentIndex);
    persist();
  }, [currentIndex, runner, persist]);

  // Timer tick for exam mode
  const deadline = runner.getDeadline();
  useEffect(() => {
    if (!deadline || runner.isFinished()) return;

    const tick = () => {
      const now = runner.clock.now();
      const diff = Math.max(0, Math.ceil((deadline - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        const exported = runner.finalizeSession('timed_out');
        handleFinish(exported);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, runner, handleFinish]);

  if (result) {
    return <BxmSessionResultBreakdownView result={result} onExit={onExit} />;
  }

  if (!currentItem) {
    return (
      <div className="p-6 text-center">
        <p className="text-stone-600">No hay preguntas disponibles en esta sesión.</p>
        {onExit && (
          <button className="mt-4 px-4 py-2 bg-stone-800 text-white rounded" onClick={onExit}>
            Salir
          </button>
        )}
      </div>
    );
  }

  const optionsList: Array<{ letter: OptionLetter; text: string }> = Array.isArray(currentItem.options)
    ? currentItem.options
    : (Object.entries(currentItem.options).map(([letter, text]) => ({
        letter: letter as OptionLetter,
        text,
      })));

  const handleOptionSelect = (letter: OptionLetter) => {
    setSelectedOption(letter);
    runner.selectDraftOption(letter, currentItem.id);
    persist();
  };

  const handleToggleFlag = () => {
    runner.toggleReviewFlag(currentItem.id);
    persist();
    setFlagRevision((r) => r + 1);
  };

  const handleRevealHint = () => {
    const hintRes = runner.revealHint(currentItem.id);
    persist();
    if (hintRes.hint) {
      setCurrentHint(hintRes.hint);
    }
  };

  const handleVerifyStudyAnswer = () => {
    if (!selectedOption) return;
    const verification = runner.verifyStudyAnswer(currentItem.id);
    persist();
    setFlagRevision(value => value + 1);
    if (!verification) return;
    const isCorrect = verification.isCorrect;

    if (!isCorrect && (!currentItem.distractorExplanations || !currentItem.distractorExplanations[selectedOption])) {
      // Invite learner-reported reason
      setShowLearnerReasonModal(true);
    } else {
      setShowExplanation(runner.policy.allowImmediateFeedback);
    }
  };

  const handleConfirmLearnerReason = (reason: LearnerReportedReason) => {
    runner.reportLearnerReason(currentItem.id, reason);
    persist();
    setFlagRevision(value => value + 1);
    setShowLearnerReasonModal(false);
    setShowExplanation(runner.policy.allowImmediateFeedback);
  };

  const handleManualFinalize = () => {
    const exported = runner.finalizeSession('completed');
    handleFinish(exported);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="assessment-workspace max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm text-stone-900 dark:text-stone-100">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-bold px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded">
            {isExam ? 'Modo Examen' : 'Modo Estudio'}
          </span>
          <span className="text-sm font-semibold">
            Pregunta {currentIndex + 1} de {runner.items.length}
          </span>
          {currentState?.flaggedForReview && (
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
              ⚑ Marcada
            </span>
          )}
        </div>

        <div className="assessment-tools">
          {onExit && <button onClick={() => { persist(); onExit(); }} className="secondary-button">Guardar y salir</button>}
          {remainingSeconds !== null && (
            <div role="timer" aria-label="Tiempo restante" className={`text-sm font-mono font-medium ${remainingSeconds < 300 ? 'text-red-700 dark:text-red-300' : 'text-stone-600 dark:text-stone-300'}`}>
              Tiempo: {formatTimer(remainingSeconds)}
            </div>
          )}

          <button
            onClick={handleToggleFlag}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
              currentState?.flaggedForReview
                ? 'bg-amber-500 text-white border-amber-600'
                : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {currentState?.flaggedForReview ? 'Desmarcar' : 'Marcar para revisión'}
          </button>

          <button
            onClick={handleManualFinalize}
            className="px-3 py-1.5 text-xs font-semibold bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 rounded hover:opacity-90"
          >
            {isExam ? 'Entregar examen' : 'Finalizar sesión'}
          </button>
        </div>
      </div>

      {/* Item Metadata */}
      {runner.policy.allowFormulaSheet && formulaSheet && <details className="mb-4"><summary>Hoja de fórmulas permitida</summary>{formulaSheet}</details>}
      {runner.policy.allowCalculator && <p className="text-xs mb-3">Puede utilizar la calculadora permitida para esta actividad.</p>}
      <p className="muted mb-4">{{ geometry: 'Geometría', functions: 'Funciones', statistics: 'Estadística' }[currentItem.domain]}</p>

      {/* Stem */}
      <h1 ref={questionHeading} tabIndex={-1} className="question-stem mb-6">
        <TextRenderer content={currentItem.stem} inline />
      </h1>

      {/* Options */}
      <div className="space-y-2 sm:space-y-3 mb-6">
        {optionsList.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          return (
            <button
              key={opt.letter}
              aria-label={`Opción ${opt.letter}`}
              aria-describedby={`bxm-option-description-${opt.letter}`}
              aria-pressed={isSelected}
              onClick={() => handleOptionSelect(opt.letter)}
              className={`w-full text-left p-2.5 sm:p-3.5 rounded-xl border text-xs sm:text-base flex items-start gap-2.5 sm:gap-3 transition cursor-pointer min-w-0 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-medium'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-800 dark:text-stone-200'
              }`}
            >
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 sm:mt-0 ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}>
                {opt.letter}
              </span>
              <span id={`bxm-option-description-${opt.letter}`} className="flex-1 min-w-0 break-words leading-relaxed">
                <TextRenderer content={opt.text} inline />
              </span>
            </button>
          );
        })}
      </div>

      {/* Study Mode: Hints & Verification */}
      {!isExam && (
        <div className="mb-6 space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            {runner.policy.allowHints && (currentItem.hints?.length || 0) > 0 && (
              <button
                onClick={handleRevealHint}
                className="px-3 py-1.5 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Pista ({currentState?.hintsRevealed || 0}/{currentItem.hints?.length || 0})
              </button>
            )}

            <button
              onClick={handleVerifyStudyAnswer}
              disabled={!selectedOption}
              className={`px-4 py-2 text-sm font-semibold rounded ${
                selectedOption
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Verificar respuesta
            </button>
          </div>

          {currentHint && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200">
              <strong>Pista:</strong> <TextRenderer content={currentHint} inline />
            </div>
          )}

          {showExplanation && runner.policy.allowImmediateFeedback && currentFeedback && (
            <div className={`p-4 sm:p-5 rounded-xl border text-sm space-y-3 ${
              currentFeedback.isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
            }`}>
              <div className="flex items-center justify-between gap-2 border-b border-current/15 pb-2">
                <span className="font-bold text-base flex items-center gap-1.5">
                  {currentFeedback.isCorrect ? '✓ ¡Excelente, respuesta correcta!' : '✗ Respuesta incorrecta'}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/70 dark:bg-stone-900/60 border border-current/20">
                  Opción correcta: {currentItem.correctAnswer}
                </span>
              </div>

              {/* Qué ocurrió pedagógicamente */}
              {!currentFeedback.isCorrect && (
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="font-black uppercase tracking-wider text-[11px] text-rose-800 dark:text-rose-300">
                    ¿Qué ocurrió?
                  </div>
                  {currentFeedback.authoredMisconception ? (
                    <div className="leading-relaxed p-2.5 rounded-lg bg-rose-100/60 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800">
                      <TextRenderer content={currentFeedback.authoredMisconception.explanation} inline />
                    </div>
                  ) : (
                    <div className="leading-relaxed p-2.5 rounded-lg bg-rose-100/60 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800">
                      Tu selección no coincide con el procedimiento matemático requerido para esta pregunta.
                    </div>
                  )}

                  {currentItem.solutionSteps && currentItem.solutionSteps.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-stone-900 dark:text-stone-100">
                      <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5">Recuerda la regla clave:</span>
                      <TextRenderer content={typeof currentItem.solutionSteps[0] === 'string' ? currentItem.solutionSteps[0] : currentItem.solutionSteps[0].explanation} inline />
                    </div>
                  )}
                </div>
              )}

              {currentItem.solutionSteps && currentItem.solutionSteps.length > 0 && (
                <div className="pt-2 border-t border-current/15 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider">
                    {currentFeedback.isCorrect ? 'Resolución paso a paso:' : 'Paso a paso para resolver:'}
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm leading-relaxed">
                    {currentItem.solutionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="pl-1">
                        <TextRenderer content={typeof step === 'string' ? step : `${step.title}: ${step.explanation}`} inline />
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actionable Next Step CTA inside immediate feedback */}
              <div className="pt-2 border-t border-current/15 flex items-center justify-between gap-2">
                <span className="text-xs font-medium">
                  {currentIndex < runner.items.length - 1
                    ? '¿Listo para continuar?'
                    : 'Has llegado a la última pregunta.'}
                </span>
                {currentIndex < runner.items.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(i => Math.min(runner.items.length - 1, i + 1))}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Siguiente pregunta →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualFinalize}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-xs"
                  >
                    Ver resultados finales
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="assessment-navigation pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 disabled:opacity-40"
        >
          Anterior
        </button>

        {/* Quick Question Grid Dots */}
        <div className="assessment-question-rail">
          {runner.items.map((it, idx) => {
            const st = runner.getItemState(it.id);
            const isDone = st?.draftOption !== null || st?.firstResponse !== null;
            const isCur = idx === currentIndex;
            return (
              <button
                key={it.id}
                aria-label={`Pregunta ${idx + 1}${st?.flaggedForReview ? ', marcada para revisión' : ''}`}
                aria-current={isCur ? 'step' : undefined}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-6 rounded text-xs font-bold shrink-0 transition ${
                  isCur
                    ? 'ring-2 ring-blue-600 bg-stone-200 dark:bg-stone-700'
                    : isDone
                    ? 'bg-stone-300 dark:bg-stone-600 text-stone-800 dark:text-stone-200'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(runner.items.length - 1, i + 1))}
          disabled={currentIndex === runner.items.length - 1}
          className="px-4 py-2 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>

      {/* Learner Reason Modal */}
      {showLearnerReasonModal && (
        <Dialog title="¿Qué crees que falló en esta respuesta?" onClose={() => handleConfirmLearnerReason('unknown')}>
            <p className="text-xs text-stone-500 mb-4">
              Identificar la causa de tu error te ayuda a enfocar mejor tu estudio. (No afectará tu puntuación).
            </p>

            <div className="space-y-2 mb-6">
              {STANDARD_LEARNER_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleConfirmLearnerReason(r.id)}
                  className="w-full text-left p-2.5 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs transition"
                >
                  <div className="font-semibold">{r.label}</div>
                  <div className="text-stone-500 text-[11px]">{r.description}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleConfirmLearnerReason('unknown')}
              className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 underline"
            >
              Omitir / No estoy seguro
            </button>
        </Dialog>
      )}
    </div>
  );
};

export const BxmSessionResultBreakdownView: React.FC<{
  result: SessionResultExport;
  onExit?: () => void;
}> = ({ result, onExit }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-xl font-bold">Tu resultado</h2>
          <p className="text-xs text-stone-500">
            {result.kind === 'diagnostic' ? 'Diagnóstico completado' : result.kind === 'retest' ? 'Comprobación sin ayudas completada' : result.kind === 'mastery_check' ? 'Comprobación de dominio completada' : result.kind === 'mock_exam' ? 'Simulacro de práctica completado' : 'Práctica completada'}
          </p>
        </div>
        {onExit && (
          <button onClick={onExit} className="px-4 py-2 text-xs font-semibold bg-stone-800 text-white rounded">
            Volver
          </button>
        )}
      </div>

      {/* Global KPI banner */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="text-xs text-stone-500">Puntaje primer intento</div>
          <div className="text-2xl font-black">{result.firstResponseScorePercentage}%</div>
          <div className="text-xs text-stone-500">
            {result.firstResponseCorrectCount} de {result.totalActualItems} correctas
          </div>
        </div>
        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="text-xs text-stone-500">Respondidas</div>
          <div className="text-2xl font-black">{result.totalAnswered}</div>
          <div className="text-xs text-stone-500">Sin responder: {result.totalUnanswered}</div>
        </div>
      </div>
      <p className="muted mb-4">Duración: {Math.floor(result.durationSeconds / 60)} min {result.durationSeconds % 60} s · {result.status === 'timed_out' ? 'Se terminó el tiempo' : 'Actividad finalizada'}</p>

      {/* Shortfall Banner if any */}
      {result.shortfalls && result.shortfalls.length > 0 && (
        <div className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
          <strong>Actividad más corta:</strong> No había suficientes preguntas para completar todos los temas:
          <ul className="list-disc list-inside mt-1">
            {result.shortfalls.map((s) => (
              <li key={s.domain}>
                <span className="capitalize">{{ geometry: 'Geometría', functions: 'Funciones', statistics: 'Estadística' }[s.domain]}</span>: {s.available} disponibles de {s.requested} solicitadas (faltante: {s.missing}).
              </li>
            ))}
          </ul>
        </div>
      )}

      <details><summary>Ver detalles de mis respuestas</summary>
      {/* Domain Breakdown */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
        Desglose por Área Curricular
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.values(result.domainBreakdowns).map((dom) => (
          <div key={{ geometry: 'Geometría', functions: 'Funciones', statistics: 'Estadística' }[dom.domain]} className="p-4 border border-stone-200 dark:border-stone-800 rounded-lg">
            <div className="text-xs font-semibold capitalize mb-1">{{ geometry: 'Geometría', functions: 'Funciones', statistics: 'Estadística' }[dom.domain]}</div>
            <div className="text-xl font-bold">{dom.scorePercentage}%</div>
            <div className="text-xs text-stone-500">
              {dom.correctFirstResponseCount} / {dom.totalItems} preguntas
            </div>
          </div>
        ))}
      </div>

      {/* Cognitive Breakdown */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
        Desglose por Nivel Cognitivo
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.values(result.cognitiveBreakdowns).map((cog) => (
          <div key={cog.cognitiveLevel} className="p-4 border border-stone-200 dark:border-stone-800 rounded-lg">
            <div className="text-xs font-semibold capitalize mb-1">{cog.cognitiveLevel}</div>
            <div className="text-xl font-bold">{cog.scorePercentage}%</div>
            <div className="text-xs text-stone-500">
              {cog.correctFirstResponseCount} / {cog.totalItems} preguntas
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Breakdown */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
        Desglose por Dificultad
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.values(result.difficultyBreakdowns).map((diff) => (
          <div key={diff.difficultyTier} className="p-4 border border-stone-200 dark:border-stone-800 rounded-lg">
            <div className="text-xs font-semibold mb-1">Nivel {diff.difficultyTier}</div>
            <div className="text-xl font-bold">{diff.scorePercentage}%</div>
            <div className="text-xs text-stone-500">
              {diff.correctFirstResponseCount} / {diff.totalItems} preguntas
            </div>
          </div>
        ))}
      </div>

      </details>
      {/* Notice */}
      <p className="text-xs text-stone-400 italic text-center mt-6">
        Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP.
      </p>
    </div>
  );
};
