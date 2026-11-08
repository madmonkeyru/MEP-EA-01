import { useState } from 'react';
import type { Attempt, Answer } from '@mep-ea/domain';
import type { DraftState } from '@mep-ea/api';

export interface ConflictResolutionChoice {
  type: 'accept_server' | 'keep_local' | 'combine';
  reconciledAttempt: Attempt;
  baseRevision: number;
}

export function ConflictReviewModal({
  conflictState,
  localAttempt,
  isOpen,
  onResolve,
  onCancel,
}: {
  conflictState: DraftState;
  localAttempt: Attempt;
  isOpen: boolean;
  onResolve: (choice: ConflictResolutionChoice) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<'choose' | 'combine'>('choose');
  const serverDraft = conflictState.draft?.attempt;
  const currentRevision = conflictState.draft?.revision ?? 1;

  // Track combined selections per question
  const [combinedAnswers, setCombinedAnswers] = useState<Record<string, Answer>>(() => {
    return { ...localAttempt.answers };
  });

  if (!isOpen || !serverDraft) return null;

  const handleAcceptServer = () => {
    onResolve({
      type: 'accept_server',
      reconciledAttempt: serverDraft,
      baseRevision: currentRevision,
    });
  };

  const handleKeepLocal = () => {
    // Preserve earliest response timestamps (firstAnswers) and rebase onto server revision
    const preservedFirstAnswers = {
      ...serverDraft.firstAnswers,
      ...localAttempt.firstAnswers,
    };
    const reconciledAttempt: Attempt = {
      ...localAttempt,
      firstAnswers: preservedFirstAnswers,
      updatedAt: new Date().toISOString(),
    };
    onResolve({
      type: 'keep_local',
      reconciledAttempt,
      baseRevision: currentRevision,
    });
  };

  const handleConfirmCombine = () => {
    const preservedFirstAnswers = {
      ...serverDraft.firstAnswers,
      ...localAttempt.firstAnswers,
    };
    const reconciledAttempt: Attempt = {
      ...localAttempt,
      answers: combinedAnswers,
      firstAnswers: preservedFirstAnswers,
      updatedAt: new Date().toISOString(),
    };
    onResolve({
      type: 'combine',
      reconciledAttempt,
      baseRevision: currentRevision,
    });
  };

  const questionIds = Array.from(new Set([
    ...localAttempt.questionIds,
    ...serverDraft.questionIds,
  ]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="border-b pb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Conflicto de Edición Multi-Dispositivo (409)
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Revisión y Reconciliación de Borrador
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Se detectó un cambio simultáneo desde otro dispositivo (Revisión del servidor: {currentRevision}).
            Selecciona cómo deseas reconciliar tu progreso. Ningún cambio se sobreescribirá silenciosamente.
          </p>
        </div>

        {mode === 'choose' ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 border rounded-lg bg-slate-50 space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm">Versión del Servidor</h4>
                <p className="text-xs text-slate-500">
                  Guardado desde otro dispositivo el {new Date(serverDraft.updatedAt).toLocaleTimeString()}.
                </p>
                <p className="text-xs font-medium text-slate-700">
                  Respuestas: {Object.keys(serverDraft.answers || {}).length} preguntas
                </p>
                <button
                  type="button"
                  onClick={handleAcceptServer}
                  className="w-full mt-2 text-xs font-medium bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300 transition"
                >
                  Aceptar versión del servidor
                </button>
              </div>

              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 space-y-2">
                <h4 className="font-semibold text-blue-900 text-sm">Versión Local de este Dispositivo</h4>
                <p className="text-xs text-blue-600">
                  Editado localmente el {new Date(localAttempt.updatedAt).toLocaleTimeString()}.
                </p>
                <p className="text-xs font-medium text-blue-800">
                  Respuestas: {Object.keys(localAttempt.answers || {}).length} preguntas
                </p>
                <button
                  type="button"
                  onClick={handleKeepLocal}
                  className="w-full mt-2 text-xs font-medium bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Conservar versión local
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setMode('combine')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Comparar y combinar pregunta por pregunta →
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cerrar sin resolver
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Elige para cada pregunta la respuesta que deseas conservar. La procedencia de la primera respuesta se mantendrá intacta.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {questionIds.map((qId, i) => {
                const localAns = localAttempt.answers?.[qId]?.optionId;
                const serverAns = serverDraft.answers?.[qId]?.optionId;
                const selected = combinedAnswers[qId]?.optionId;
                const isConflict = localAns !== serverAns;

                return (
                  <div key={qId} className={`p-3 border rounded text-xs flex justify-between items-center ${isConflict ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50'}`}>
                    <div>
                      <span className="font-semibold">Pregunta {i + 1}</span>
                      <span className="ml-2 text-slate-500">
                        Local: {localAns ?? '—'} | Servidor: {serverAns ?? '—'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {localAns && (
                        <button
                          type="button"
                          onClick={() => setCombinedAnswers(prev => ({
                            ...prev,
                            [qId]: localAttempt.answers[qId],
                          }))}
                          className={`px-2 py-1 rounded text-xs font-medium ${selected === localAns ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Local ({localAns})
                        </button>
                      )}
                      {serverAns && (
                        <button
                          type="button"
                          onClick={() => setCombinedAnswers(prev => ({
                            ...prev,
                            [qId]: serverDraft.answers[qId],
                          }))}
                          className={`px-2 py-1 rounded text-xs font-medium ${selected === serverAns ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Servidor ({serverAns})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                ← Volver a opciones generales
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs px-3 py-1.5 text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCombine}
                  className="text-xs font-medium bg-slate-900 text-white px-4 py-1.5 rounded hover:bg-slate-800"
                >
                  Guardar selección combinada
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
