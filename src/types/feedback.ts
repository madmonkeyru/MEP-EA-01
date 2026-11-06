export interface PedagogicalQuestionFeedback {
  correctness: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  misconception?: string;
  keyRule?: string;
  evidenceId: string;
  evidenceDesc?: string;
  retryAvailable: boolean;
  retryEvidenceKey?: string;
}
