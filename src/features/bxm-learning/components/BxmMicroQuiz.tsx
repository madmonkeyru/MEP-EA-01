import { TextRenderer } from '../../../components/common/TextRenderer';
import React, { useId, useMemo, useState } from 'react';
import { BxmMicroQuizItem } from '../types';
import { MicroQuizEngine } from '../../bxm-assessment/microQuizEngine';
import type { AssessmentItem, OptionLetter } from '../../bxm-assessment/types';

export interface BxmMicroQuizProps {
  quiz: BxmMicroQuizItem;
  evidenceKey: string;
  onAnswered?: (payload: {
    quizId: string;
    evidenceKey: string;
    selectedOption: string;
    isCorrect: boolean;
    timestamp: string;
    eventId: string;
    responseIndex: number;
    hintsUsedBeforeResponse: number;
    hasSeenExplanationBefore: boolean;
    reviewStatus: 'unreviewed';
  }) => void;
  className?: string;
}

export const BxmMicroQuiz: React.FC<BxmMicroQuizProps> = ({
  quiz,
  evidenceKey,
  onAnswered,
  className = ''
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const questionId = useId();
  const engine = useMemo(() => new MicroQuizEngine(quiz.id, [{
    id: quiz.id, provenance: 'authored', reviewStatus: 'unreviewed',
    domain: evidenceKey.split('/')[3] as AssessmentItem['domain'], evidenceId: evidenceKey,
    evidenceCode: evidenceKey.split('/').at(-1)!, cognitiveLevel: 'reproduccion', difficultyTier: 1,
    stem: quiz.question, options: quiz.options as AssessmentItem['options'], correctAnswer: quiz.correctOption as OptionLetter,
    solutionSteps: [quiz.explanation],
  }]), [quiz, evidenceKey]);

  const handleSelect = (key: string) => {
    if (isSubmitted) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;
    const response = engine.submitAnswer(quiz.id, selectedOption as OptionLetter);
    if (!response) return;
    setIsSubmitted(true);
    const isCorrect = response.isCorrect;
    if (onAnswered) {
      onAnswered({
        quizId: quiz.id,
        evidenceKey,
        selectedOption,
        isCorrect,
        timestamp: response.attemptEvent.timestamp,
        eventId: response.attemptEvent.eventId,
        responseIndex: response.attemptEvent.attemptIndex,
        hintsUsedBeforeResponse: response.attemptEvent.hintsUsedBeforeResponse,
        hasSeenExplanationBefore: !!response.attemptEvent.hasSeenExplanationBefore,
        reviewStatus: 'unreviewed',
      });
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div role="region" aria-label="Comprobación de aprendizaje" aria-describedby={questionId} data-quiz-id={quiz.id} className={`p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
          Micro-Quiz de Comprobación
        </span>
        {isSubmitted && (
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              selectedOption === quiz.correctOption
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {selectedOption === quiz.correctOption ? '¡Correcto!' : 'Respuesta incorrecta'}
          </span>
        )}
      </div>

      <div id={questionId} className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">
        <TextRenderer content={quiz.question} inline />
      </div>

      <div className="space-y-2 mb-4">
        {Object.entries(quiz.options).map(([key, text]) => {
          let btnStyle = 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-amber-400 dark:hover:border-amber-600 text-stone-800 dark:text-stone-200';
          if (selectedOption === key) {
            btnStyle = 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 font-medium';
          }
          if (isSubmitted) {
            if (key === quiz.correctOption) {
              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
            } else if (selectedOption === key) {
              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
            }
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              disabled={isSubmitted}
              className={`w-full text-left p-2.5 rounded-lg border text-sm flex items-start gap-2.5 transition-colors ${btnStyle}`}
            >
              <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300">
                {key}
              </span>
              <span className="flex-1"><TextRenderer content={text} inline /></span>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Comprobar respuesta
        </button>
      ) : (
        <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <strong className="text-stone-900 dark:text-stone-100">Explicación:</strong> <TextRenderer content={quiz.explanation} inline />
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Reintentar pregunta
          </button>
        </div>
      )}
    </div>
  );
};
