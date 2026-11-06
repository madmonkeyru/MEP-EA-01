import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BxmLessonView } from '../components/BxmLessonView';
import { BxmContentService } from '../services/bxmContentService';
import { BxmDigitalTemario } from '../components/BxmDigitalTemario';
import { BxmLearningStore } from '../../bxm-integration/learningStore';
import { BxmLearningHub } from '../../bxm-integration/BxmLearningHub';
import type { AppRoute } from '../../../services/navigation';

describe('Milestone 2 (M2): Content → Learning Experience', () => {
  const userId = 'user-m2-test';

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders canonical lesson structural sequence: header, formulas, explanation, visual, mistakes, worked example, micro-quiz, practice CTA', () => {
    const lesson = BxmContentService.getLessonById('lesson-geometry-a1-1')!;
    expect(lesson).toBeDefined();

    const handlePractice = vi.fn();
    render(
      <BxmLessonView
        lesson={lesson}
        callbacks={{
          onStartTargetedPractice: handlePractice,
        }}
        capabilities={{ isPremium: true }}
      />
    );

    // Concept & Title
    expect(screen.getByText('Ecuación Canónica y Elementos de la Circunferencia')).toBeInTheDocument();
    expect(screen.getByText('Geometría')).toBeInTheDocument();
    expect(screen.getByText('Habilidad formativa oficial')).toBeInTheDocument();

    // Formulas
    expect(screen.getByText('Fórmulas Clave')).toBeInTheDocument();

    // Explanation
    expect(screen.getByText('Fundamento Teórico y Geométrico')).toBeInTheDocument();

    // Visual
    expect(screen.getByText('Laboratorio Interactivo')).toBeInTheDocument();

    // Common mistakes
    expect(screen.getByText(/Errores Comunes en el Examen de Bachillerato/i)).toBeInTheDocument();

    // Worked Example
    expect(screen.getByText('Ejemplo Resuelto Paso a Paso')).toBeInTheDocument();

    // Micro-Quiz
    expect(screen.getByText('Comprobación de Aprendizaje')).toBeInTheDocument();

    // Transition to Practice CTA
    const practiceBtn = screen.getByText(/Practicar esta habilidad/i);
    expect(practiceBtn).toBeInTheDocument();
    fireEvent.click(practiceBtn);
    expect(handlePractice).toHaveBeenCalledWith(lesson.evidenceKey);
  });

  it('displays contextual "Why am I here?" messaging based on entry reason', () => {
    const lesson = BxmContentService.getLessonById('lesson-functions-a2-3')!;
    expect(lesson).toBeDefined();

    // Diagnostic weakness context
    const { unmount } = render(
      <BxmLessonView
        lesson={lesson}
        contextReason="diagnostic_weakness"
        capabilities={{ isPremium: true }}
      />
    );
    expect(screen.getByText('Prioridad del Diagnóstico')).toBeInTheDocument();
    expect(screen.getByText(/Tu diagnóstico identificó una oportunidad de mejora/i)).toBeInTheDocument();
    unmount();

    // Remediation context
    render(
      <BxmLessonView
        lesson={lesson}
        contextReason="remediation"
        capabilities={{ isPremium: true }}
      />
    );
    expect(screen.getByText('Plan de Nivelación')).toBeInTheDocument();
    expect(screen.getByText(/Refuerzo guiado para/i)).toBeInTheDocument();
  });

  it('allows micro-quiz retry on incorrect response with step-by-step pedagogical explanation', () => {
    const lesson = BxmContentService.getLessonById('lesson-geometry-a1-1')!;
    const handleMicroQuizAnswered = vi.fn();

    render(
      <BxmLessonView
        lesson={lesson}
        callbacks={{
          onMicroQuizAnswered: handleMicroQuizAnswered,
        }}
        capabilities={{ isPremium: true }}
      />
    );

    // Find first micro quiz and select incorrect answer (B for quiz-geo-01)
    const optionB = screen.getAllByText('B')[0].closest('button')!;
    expect(optionB).toBeInTheDocument();
    fireEvent.click(optionB);

    // Submit answer
    const checkBtn = screen.getAllByText('Comprobar respuesta')[0].closest('button')!;
    expect(checkBtn).toBeInTheDocument();
    fireEvent.click(checkBtn);

    // Assert pedagogical feedback displayed
    expect(screen.getByText('Respuesta incorrecta')).toBeInTheDocument();
    expect(screen.getByText(/Atención al razonamiento:/i)).toBeInTheDocument();
    expect(screen.getByText(/Explicación paso a paso:/i)).toBeInTheDocument();

    // Assert retry button is present and not locked out
    const retryBtn = screen.getByText('← Intentar de nuevo').closest('button')!;
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);

    // Can now select correct answer A and resubmit
    const optionA = screen.getAllByText('A')[0].closest('button')!;
    expect(optionA).toBeInTheDocument();
    fireEvent.click(optionA);
    const checkBtnAgain = screen.getAllByText('Comprobar respuesta')[0].closest('button')!;
    fireEvent.click(checkBtnAgain);

    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(screen.getByText(/¡Excelente razonamiento!/i)).toBeInTheDocument();
  });

  it('records lesson completion in store and displays completed checkmark', () => {
    const store = new BxmLearningStore(userId);
    expect(store.isLessonCompleted('lesson-geometry-a1-1')).toBe(false);

    store.recordLessonCompletion('lesson-geometry-a1-1');
    expect(store.isLessonCompleted('lesson-geometry-a1-1')).toBe(true);

    const lesson = BxmContentService.getLessonById('lesson-geometry-a1-1')!;
    render(
      <BxmLessonView
        lesson={lesson}
        isCompleted={true}
        capabilities={{ isPremium: true }}
      />
    );

    expect(screen.getByText('Lección completada')).toBeInTheDocument();
    expect(screen.getByText(/¡Lección completada! Ahora demuestra lo aprendido/i)).toBeInTheDocument();
  });

  it('integrates canonical lesson launch in BxmLearningHub via Temario with contextReason', () => {
    const route: AppRoute = {
      view: 'learning',
      programId: 'bxm',
      subjectId: 'matematicas',
      convocatoriaId: '2026-c2',
      tab: 'temario',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
      contextReason: 'study_session',
    };

    render(
      <BxmLearningHub
        userId={userId}
        route={route}
        onNavigate={vi.fn()}
        onOfficialSimulation={vi.fn()}
      />
    );

    expect(screen.getByText('Sesión Guiada')).toBeInTheDocument();
    expect(screen.getByText(/Sesión de estudio: fortalece/i)).toBeInTheDocument();
    expect(screen.getByText('Ecuación Canónica y Elementos de la Circunferencia')).toBeInTheDocument();
  });
});
