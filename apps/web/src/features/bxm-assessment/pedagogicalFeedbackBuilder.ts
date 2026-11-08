import type { AssessmentItem, OptionLetter } from '../bxm-assessment/types';
import type { PedagogicalQuestionFeedback } from '../../types/feedback';

/**
 * Builds structured pedagogical feedback for a student response using the strict fallback hierarchy:
 * 1. distractorRationale[selectedAnswer] / distractorExplanations[selectedAnswer] when authored and available.
 * 2. Item-specific solution steps / explanation.
 * 3. keyRule / formula / principle when available.
 * 4. Safe generic explanation as the final fallback.
 *
 * Never invents an unevidenced misconception.
 */
export function buildPedagogicalFeedback(
  item: AssessmentItem,
  selectedAnswer: OptionLetter,
  isCorrect: boolean,
  options?: {
    retryAvailable?: boolean;
    keyRule?: string;
  }
): PedagogicalQuestionFeedback {
  const authoredDistractor = !isCorrect && item.distractorExplanations
    ? item.distractorExplanations[selectedAnswer]
    : undefined;

  // 1. Misconception explanation if authored
  const misconception = authoredDistractor
    ? authoredDistractor.explanation || authoredDistractor.misconceptionLabel
    : undefined;

  // 2. Primary pedagogical explanation
  let explanation = '';
  if (isCorrect) {
    explanation = (item.solutionSteps && item.solutionSteps.length > 0)
      ? item.solutionSteps.join('\n')
      : '¡Respuesta correcta! Has aplicado correctamente las propiedades y pasos matemáticos requeridos.';
  } else if (misconception) {
    explanation = misconception;
  } else if (item.solutionSteps && item.solutionSteps.length > 0) {
    explanation = item.solutionSteps.join('\n');
  } else {
    explanation = 'La opción seleccionada no cumple con las condiciones del problema. Revisa el procedimiento y las fórmulas requeridas.';
  }

  // 3. Key rule / formula
  const keyRule = options?.keyRule || (item.solutionSteps && item.solutionSteps.length > 1 ? (typeof item.solutionSteps[0] === 'string' ? item.solutionSteps[0] : item.solutionSteps[0].explanation) : undefined);

  return {
    correctness: isCorrect,
    selectedAnswer,
    correctAnswer: item.correctAnswer,
    explanation,
    misconception: !isCorrect ? misconception : undefined,
    keyRule: keyRule || undefined,
    evidenceId: item.evidenceId,
    evidenceDesc: item.evidenceCode,
    retryAvailable: options?.retryAvailable ?? false,
    retryEvidenceKey: item.evidenceId,
  };
}
