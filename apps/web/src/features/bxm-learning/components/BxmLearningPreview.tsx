import React, { useState } from 'react';
import { BxmDigitalTemario } from './BxmDigitalTemario';
import { BxmContentService } from '../services/bxmContentService';
import { BxmIsomorphicGenerator } from '../services/bxmIsomorphicGenerator';
import { BxmAuthoredItem } from '../types';

export const BxmLearningPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'temario' | 'authored_pack' | 'isomorphic_lab'>('temario');
  const [quizLogs, setQuizLogs] = useState<Array<{ quizId: string; option: string; correct: boolean; time: string }>>([]);
  const [targetedEvidence, setTargetedEvidence] = useState<string | null>(null);

  // Isomorphic playground state
  const [isoParams, setIsoParams] = useState<{ h: number; k: number; r: number }>({ h: 3, k: -2, r: 5 });
  const [generatedItem, setGeneratedItem] = useState<BxmAuthoredItem | null>(() =>
    BxmIsomorphicGenerator.generateCircleCanonicalItem({ h: 3, k: -2, r: 5 })
  );

  const authoredItems = BxmContentService.getAuthoredItems();

  const handleMicroQuizAnswered = (payload: {
    quizId: string;
    evidenceKey: string;
    selectedOption: string;
    isCorrect: boolean;
    timestamp: string;
  }) => {
    setQuizLogs((prev) => [
      {
        quizId: payload.quizId,
        option: payload.selectedOption,
        correct: payload.isCorrect,
        time: payload.timestamp
      },
      ...prev
    ]);
  };

  const handleStartTargetedPractice = (evidenceKey: string) => {
    setTargetedEvidence(evidenceKey);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Navigation */}
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Agent A — Módulo de Aprendizaje BXM
          </span>
          <h2 className="text-lg font-bold">Vista Previa & Laboratorio de Integración</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('temario')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'temario'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Temario Digital (71)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('authored_pack')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'authored_pack'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Banco de Autor ({authoredItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('isomorphic_lab')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'isomorphic_lab'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            Generador Isomórfico
          </button>
        </div>
      </header>

      {/* Integration Callbacks Feed Banner */}
      {quizLogs.length > 0 && (
        <div className="max-w-6xl mx-auto p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs">
          <div className="font-bold text-stone-500 uppercase tracking-wider mb-1">
            Registro de Callbacks Inyectados (Assessment Sink):
          </div>
          <div className="flex flex-wrap gap-2">
            {quizLogs.slice(0, 3).map((log, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded font-mono ${
                  log.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {log.quizId}: opción {log.option} ({log.correct ? 'OK' : 'FAIL'})
              </span>
            ))}
          </div>
        </div>
      )}

      {targetedEvidence && (
        <div className="max-w-6xl mx-auto p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs flex justify-between items-center">
          <span>
            Solicitud de práctica inyectada para evidencia:{' '}
            <strong className="font-mono">{targetedEvidence}</strong>
          </span>
          <button
            type="button"
            onClick={() => setTargetedEvidence(null)}
            className="text-stone-500 hover:text-stone-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab View */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'temario' && (
          <BxmDigitalTemario
            callbacks={{
              onMicroQuizAnswered: handleMicroQuizAnswered,
              onStartTargetedPractice: handleStartTargetedPractice
            }}
          />
        )}

        {activeTab === 'authored_pack' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Banco de Autor BXM (30 Ítems Base Verificados)</h3>
              <span className="text-xs text-stone-500">10 Geometría | 10 Álgebra | 10 Estadística</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authoredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {item.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      Nivel: {item.cognitiveLevel} | Dificultad: {item.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{item.stem}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(item.options).map(([k, opt]) => (
                      <div
                        key={k}
                        className={`p-2 rounded border ${
                          k === item.correctOption
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="font-bold mr-1">{k}:</span> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'isomorphic_lab' && (
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Laboratorio de Generación Isomórfica Determinista</h3>
              <p className="text-xs text-stone-500">
                Familia: <code className="font-mono text-amber-600">bxm-iso-geo-circ-canon</code> (A1.2)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Parámetro Centro h:</label>
                <input
                  type="number"
                  value={isoParams.h}
                  onChange={(e) => {
                    const newParams = { ...isoParams, h: parseInt(e.target.value, 10) || 0 };
                    setIsoParams(newParams);
                    setGeneratedItem(BxmIsomorphicGenerator.generateCircleCanonicalItem(newParams));
                  }}
                  className="w-full p-2 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Parámetro Centro k:</label>
                <input
                  type="number"
                  value={isoParams.k}
                  onChange={(e) => {
                    const newParams = { ...isoParams, k: parseInt(e.target.value, 10) || 0 };
                    setIsoParams(newParams);
                    setGeneratedItem(BxmIsomorphicGenerator.generateCircleCanonicalItem(newParams));
                  }}
                  className="w-full p-2 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Parámetro Radio r:</label>
                <input
                  type="number"
                  min={1}
                  value={isoParams.r}
                  onChange={(e) => {
                    const newParams = { ...isoParams, r: Math.max(1, parseInt(e.target.value, 10) || 1) };
                    setIsoParams(newParams);
                    setGeneratedItem(BxmIsomorphicGenerator.generateCircleCanonicalItem(newParams));
                  }}
                  className="w-full p-2 rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850"
                />
              </div>
            </div>

            {generatedItem && (
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                    {generatedItem.id}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ Respuesta correcta verificada independientemente
                  </span>
                </div>
                <div className="text-sm font-semibold">{generatedItem.stem}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(generatedItem.options).map(([k, opt]) => (
                    <div
                      key={k}
                      className={`p-2 rounded border ${
                        k === generatedItem.correctOption
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {k}: {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
