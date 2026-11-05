import React, { useState, useEffect, useCallback } from 'react';
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
}

export const BxmSessionRunnerView: React.FC<BxmSessionRunnerViewProps> = ({
  runner,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(runner.getCurrentIndex());
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showLearnerReasonModal, setShowLearnerReasonModal] = useState(false);
  const [result, setResult] = useState<SessionResultExport | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [_flagRevision, setFlagRevision] = useState(0);

  const isExam = runner.isExamMode();
  const currentItem: AssessmentItem | undefined = runner.items[currentIndex];
  const currentState = currentItem ? runner.getItemState(currentItem.id) : undefined;

  // Sync draft selection on item change
  useEffect(() => {
    if (currentItem && currentState) {
      setSelectedOption(currentState.draftOption);
      setShowExplanation(currentState.isFinalAnswerSubmitted);
      setCurrentHint(null);
    }
  }, [currentIndex, currentItem, currentState]);

  const handleFinish = useCallback((exportData: SessionResultExport) => {
    setResult(exportData);
    onFinish(exportData);
  }, [onFinish]);

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
  };

  const handleToggleFlag = () => {
    runner.toggleReviewFlag(currentItem.id);
    setFlagRevision((r) => r + 1);
  };

  const handleRevealHint = () => {
    const hintRes = runner.revealHint(currentItem.id);
    if (hintRes.hint) {
      setCurrentHint(hintRes.hint);
    }
  };

  const handleVerifyStudyAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentItem.correctAnswer;

    if (!isCorrect && (!currentItem.distractorExplanations || !currentItem.distractorExplanations[selectedOption])) {
      // Invite learner-reported reason
      setShowLearnerReasonModal(true);
    } else {
      runner.verifyStudyAnswer(currentItem.id);
      setShowExplanation(true);
    }
  };

  const handleConfirmLearnerReason = (reason: LearnerReportedReason) => {
    runner.verifyStudyAnswer(currentItem.id, reason);
    setShowLearnerReasonModal(false);
    setShowExplanation(true);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm text-stone-900 dark:text-stone-100">
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

        <div className="flex items-center gap-4">
          {remainingSeconds !== null && (
            <div className={`text-sm font-mono font-bold ${remainingSeconds < 300 ? 'text-red-600 animate-pulse' : 'text-stone-600 dark:text-stone-300'}`}>
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
      <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400 mb-4">
        <span>Área: <strong className="capitalize">{currentItem.domain}</strong></span>
        <span>•</span>
        <span>Evidencia: <strong>{currentItem.evidenceCode}</strong></span>
        <span>•</span>
        <span>Nivel: <strong className="capitalize">{currentItem.cognitiveLevel}</strong></span>
        <span>•</span>
        <span>Dificultad: Tier {currentItem.difficultyTier}</span>
      </div>

      {/* Stem */}
      <div className="text-base sm:text-lg mb-6 leading-relaxed font-serif">
        {currentItem.stem}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {optionsList.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          return (
            <button
              key={opt.letter}
              onClick={() => handleOptionSelect(opt.letter)}
              className={`w-full text-left p-3.5 rounded-lg border text-sm sm:text-base flex items-start gap-3 transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 font-medium'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }`}
            >
              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {opt.letter}
              </span>
              <span className="flex-1">{opt.text}</span>
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
              <strong>Pista:</strong> {currentHint}
            </div>
          )}

          {showExplanation && currentState?.firstResponse && (
            <div className={`p-4 rounded-lg border text-sm ${
              currentState.firstResponse.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            }`}>
              <div className="font-bold mb-1">
                {currentState.firstResponse.isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'} (Opción {currentItem.correctAnswer})
              </div>

              {currentState.firstResponse.authoredMisconception && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold">Interpretación del error:</span> {currentState.firstResponse.authoredMisconception.explanation}
                </div>
              )}

              {currentState.firstResponse.learnerReportedReason && (
                <div className="mt-2 text-xs italic">
                  Motivo reportado por el estudiante: {currentState.firstResponse.learnerReportedReason}
                </div>
              )}

              {currentItem.solutionSteps && currentItem.solutionSteps.length > 0 && (
                <div className="mt-3 pt-2 border-t border-current/20">
                  <div className="font-semibold text-xs mb-1">Paso a paso:</div>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    {currentItem.solutionSteps.map((step, sIdx) => (
                      <li key={sIdx}>
                        {typeof step === 'string' ? step : `${step.title}: ${step.explanation}`}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 disabled:opacity-40"
        >
          Anterior
        </button>

        {/* Quick Question Grid Dots */}
        <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-md py-1">
          {runner.items.map((it, idx) => {
            const st = runner.getItemState(it.id);
            const isDone = st?.draftOption !== null || st?.firstResponse !== null;
            const isCur = idx === currentIndex;
            return (
              <button
                key={it.id}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl max-w-md w-full shadow-lg">
            <h3 className="text-base font-bold mb-2">¿Qué crees que falló en esta respuesta?</h3>
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
          </div>
        </div>
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
          <h2 className="text-xl font-bold">Resultados de la Evaluación BXM</h2>
          <p className="text-xs text-stone-500">
            Sesión: {result.sessionId} • Modo: <span className="capitalize">{result.mode}</span>
          </p>
        </div>
        {onExit && (
          <button onClick={onExit} className="px-4 py-2 text-xs font-semibold bg-stone-800 text-white rounded">
            Volver
          </button>
        )}
      </div>

      {/* Global KPI banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="text-xs text-stone-500">Duración</div>
          <div className="text-2xl font-black">{Math.floor(result.durationSeconds / 60)}m {result.durationSeconds % 60}s</div>
          <div className="text-xs text-stone-500">Estado: {result.status}</div>
        </div>
        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="text-xs text-stone-500">Benchmark oficial</div>
          <div className="text-2xl font-black">{result.benchmarkExposed ? 'Expuesto' : 'Limpio'}</div>
          <div className="text-xs text-stone-500">No contamina simulación</div>
        </div>
      </div>

      {/* Shortfall Banner if any */}
      {result.shortfalls && result.shortfalls.length > 0 && (
        <div className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
          <strong>Aviso de cobertura del banco:</strong> Se detectaron faltantes en el inventario disponible:
          <ul className="list-disc list-inside mt-1">
            {result.shortfalls.map((s) => (
              <li key={s.domain}>
                <span className="capitalize">{s.domain}</span>: {s.available} disponibles de {s.requested} solicitadas (faltante: {s.missing}).
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Domain Breakdown */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
        Desglose por Área Curricular
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.values(result.domainBreakdowns).map((dom) => (
          <div key={dom.domain} className="p-4 border border-stone-200 dark:border-stone-800 rounded-lg">
            <div className="text-xs font-semibold capitalize mb-1">{dom.domain}</div>
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
            <div className="text-xs font-semibold mb-1">Tier {diff.difficultyTier}</div>
            <div className="text-xl font-bold">{diff.scorePercentage}%</div>
            <div className="text-xs text-stone-500">
              {diff.correctFirstResponseCount} / {diff.totalItems} preguntas
            </div>
          </div>
        ))}
      </div>

      {/* Notice */}
      <p className="text-xs text-stone-400 italic text-center mt-6">
        Indicador formativo interno de avance; no constituye una predicción ni garantía del resultado oficial ante el MEP.
      </p>
    </div>
  );
};
