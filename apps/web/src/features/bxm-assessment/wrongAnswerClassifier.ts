/**
 * Wrong-Answer Classification and Diagnostic Flow
 * Agent B - Exclusive Ownership (`src/features/bxm-assessment/`)
 *
 * Requirements:
 * - Use supplied distractor/misconception mapping if present on the item.
 * - If absent, invite learner-reported reasons from the 6 standard categories:
 *   - formula_selection
 *   - algebraic_manipulation
 *   - arithmetic
 *   - graph_reading
 *   - misread_question
 *   - concept_misunderstanding
 *   - unknown / skip
 * - NEVER guess or infer a specific misconception without evidence.
 * - Explicitly distinguish authored interpretations from self-reported learner reasons.
 */

import type {
  AssessmentItem,
  DistractorExplanation,
  LearnerReportedReason,
  OptionLetter,
} from './types';

export interface WrongAnswerAnalysis {
  chosenOption: OptionLetter;
  correctAnswer: OptionLetter;
  hasAuthoredMisconception: boolean;
  misconceptionSource: 'authored_distractor' | 'learner_reported' | 'unclassified';
  misconceptionId?: string;
  label?: string;
  explanationText?: string;
  learnerReportedReason?: LearnerReportedReason;
}

export const STANDARD_LEARNER_REASONS: Array<{
  id: LearnerReportedReason;
  label: string;
  description: string;
}> = [
  {
    id: 'formula_selection',
    label: 'Elección de fórmula',
    description: 'Elegí o recordé una fórmula incorrecta para este problema.',
  },
  {
    id: 'algebraic_manipulation',
    label: 'Despeje o álgebra',
    description: 'Me equivoqué en un paso algebraico, cambio de signos o despeje.',
  },
  {
    id: 'arithmetic',
    label: 'Cálculo aritmético',
    description: 'Cometí un error en una operación básica o al meter los datos a la calculadora.',
  },
  {
    id: 'graph_reading',
    label: 'Lectura gráfica / figura',
    description: 'Interpreté mal el plano cartesiano, la figura 3D o las coordenadas.',
  },
  {
    id: 'misread_question',
    label: 'Lectura del enunciado',
    description: 'No leí bien qué pedía la pregunta o pasé por alto un dato clave.',
  },
  {
    id: 'concept_misunderstanding',
    label: 'Confusión del concepto',
    description: 'No tenía claro el concepto teórico evaluado.',
  },
  {
    id: 'unknown',
    label: 'No estoy seguro / Prefiero omitir',
    description: 'No identifico exactamente la causa de mi respuesta incorrecta.',
  },
];

export class WrongAnswerClassifier {
  /**
   * Classify an incorrect answer.
   * Checks item's authored distractor explanations first.
   */
  public static analyze(
    item: AssessmentItem,
    chosenOption: OptionLetter,
    reportedReason?: LearnerReportedReason
  ): WrongAnswerAnalysis {
    if (chosenOption === item.correctAnswer) {
      throw new Error(`Option ${chosenOption} is correct for item ${item.id}. Only incorrect answers can be classified.`);
    }

    const distractor: DistractorExplanation | undefined = item.distractorExplanations?.[chosenOption];

    if (distractor) {
      return {
        chosenOption,
        correctAnswer: item.correctAnswer,
        hasAuthoredMisconception: true,
        misconceptionSource: 'authored_distractor',
        misconceptionId: distractor.misconceptionId,
        label: distractor.misconceptionLabel || 'Distractor verificado',
        explanationText: distractor.explanation,
        learnerReportedReason: reportedReason,
      };
    }

    if (reportedReason && reportedReason !== 'unknown') {
      const standard = STANDARD_LEARNER_REASONS.find((r) => r.id === reportedReason);
      return {
        chosenOption,
        correctAnswer: item.correctAnswer,
        hasAuthoredMisconception: false,
        misconceptionSource: 'learner_reported',
        label: standard ? standard.label : reportedReason,
        explanationText: standard ? standard.description : undefined,
        learnerReportedReason: reportedReason,
      };
    }

    return {
      chosenOption,
      correctAnswer: item.correctAnswer,
      hasAuthoredMisconception: false,
      misconceptionSource: 'unclassified',
      learnerReportedReason: reportedReason || 'unknown',
    };
  }
}
