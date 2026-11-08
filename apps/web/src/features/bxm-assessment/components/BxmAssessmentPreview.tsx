import React, { useState } from 'react';
import { BxmSessionRunnerView } from './BxmSessionRunnerView';
import { SessionRunner, SystemClock } from '../sessionRunner';
import { SelectionEngine } from '../selectionEngine';
import { sampleAuthoredItems } from '../fixtures/sampleItems';
import type { AssessmentPolicy, SessionResultExport } from '../types';

export const BxmAssessmentPreview: React.FC = () => {
  const [activeSession, setActiveSession] = useState<{
    runner: SessionRunner;
    title: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<SessionResultExport | null>(null);

  const startDiagnostic = () => {
    const blueprint = SelectionEngine.assembleDiagnostic(sampleAuthoredItems, {
      seed: 42,
      totalItems: 20,
    });

    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'diagnostic',
      timeLimitMinutes: 30,
      enableTimer: true,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
      allowOfficialFallback: false,
    };

    const runner = new SessionRunner({
      sessionId: `diag-${Date.now()}`,
      items: blueprint.items,
      policy,
      shortfalls: blueprint.shortfalls,
      clock: new SystemClock(),
    });

    setActiveSession({ runner, title: 'Diagnóstico BXM (20 preguntas / 30 min)' });
    setLastResult(null);
  };

  const startStudyPractice = () => {
    const policy: AssessmentPolicy = {
      mode: 'study',
      kind: 'topic_practice',
      enableTimer: false,
      allowHints: true,
      allowRetries: true,
      allowImmediateFeedback: true,
      allowFormulaSheet: true,
      allowCalculator: true,
      maxRetriesPerItem: 3,
    };

    const runner = new SessionRunner({
      sessionId: `study-${Date.now()}`,
      items: sampleAuthoredItems.slice(0, 5),
      policy,
      clock: new SystemClock(),
    });

    setActiveSession({ runner, title: 'Práctica de Estudio Guiada' });
    setLastResult(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          BXM Mathematics Assessment Harness (Agent B)
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
          Visualizador de sesiones de evaluación independiente para BXM 02-2026.
        </p>

        <div className="flex gap-4">
          <button
            onClick={startDiagnostic}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            Iniciar Diagnóstico (Examen 30 min)
          </button>
          <button
            onClick={startStudyPractice}
            className="px-4 py-2 bg-stone-700 text-white rounded font-medium hover:bg-stone-800 transition"
          >
            Iniciar Modo Estudio (Pistas y Reintentos)
          </button>
        </div>
      </div>

      {activeSession && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{activeSession.title}</h2>
            <button
              onClick={() => setActiveSession(null)}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Cerrar sesión
            </button>
          </div>

          <BxmSessionRunnerView
            runner={activeSession.runner}
            onFinish={(res) => {
              setLastResult(res);
            }}
            onExit={() => setActiveSession(null)}
          />
        </div>
      )}

      {lastResult && !activeSession && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
          Último resultado exportado: {lastResult.firstResponseCorrectCount} de {lastResult.totalActualItems} correctas ({lastResult.firstResponseScorePercentage}%).
        </div>
      )}
    </div>
  );
};
