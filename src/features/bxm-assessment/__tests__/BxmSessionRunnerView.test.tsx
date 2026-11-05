import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BxmSessionRunnerView } from '../components/BxmSessionRunnerView';
import { SessionRunner, SystemClock } from '../sessionRunner';
import { sampleAuthoredItems } from '../fixtures/sampleItems';
import type { AssessmentPolicy, SessionResultExport } from '../types';

describe('BxmSessionRunnerView Component (Agent B)', () => {
  it('renders item stem, options, and handles option selection', () => {
    const policy: AssessmentPolicy = {
      mode: 'study',
      kind: 'topic_practice',
      enableTimer: false,
      allowHints: true,
      allowRetries: true,
      allowImmediateFeedback: true,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 2),
      policy,
      clock: new SystemClock(),
    });

    const finishFn = vi.fn();

    render(<BxmSessionRunnerView runner={runner} onFinish={finishFn} />);

    // Item 1 stem
    expect(screen.getByText(/Considere la circunferencia/i)).toBeDefined();

    // Select option A
    const optionA = screen.getByRole('button', { name: 'Opción A' });
    fireEvent.click(optionA);

    expect(runner.getItemState(sampleAuthoredItems[0].id)?.draftOption).toBe('A');
  });

  it('allows flagging for review and navigating questions', () => {
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'mock_exam',
      enableTimer: false,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 3),
      policy,
      clock: new SystemClock(),
    });

    const finishFn = vi.fn();

    render(<BxmSessionRunnerView runner={runner} onFinish={finishFn} />);

    // Toggle flag
    const flagBtn = screen.getByText('Marcar para revisión');
    fireEvent.click(flagBtn);

    expect(screen.getByText('Desmarcar')).toBeDefined();
    expect(runner.getItemState(sampleAuthoredItems[0].id)?.flaggedForReview).toBe(true);

    // Navigate to next
    const nextBtn = screen.getByText('Siguiente');
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Pregunta 2 de 3/i)).toBeDefined();
  });

  it('submits exam and displays results breakdown', () => {
    const policy: AssessmentPolicy = {
      mode: 'exam',
      kind: 'mock_exam',
      enableTimer: false,
      allowHints: false,
      allowRetries: false,
      allowImmediateFeedback: false,
      allowFormulaSheet: true,
      allowCalculator: true,
    };

    const runner = new SessionRunner({
      items: sampleAuthoredItems.slice(0, 2),
      policy,
      clock: new SystemClock(),
    });

    let finishedResult: SessionResultExport | null = null;
    const finishFn = vi.fn((res) => {
      finishedResult = res;
    });

    render(<BxmSessionRunnerView runner={runner} onFinish={finishFn} />);

    const submitBtn = screen.getByText('Entregar examen');
    fireEvent.click(submitBtn);

    expect(finishFn).toHaveBeenCalledOnce();
    expect(finishedResult).not.toBeNull();
    expect(screen.getByText('Resultados de la Evaluación BXM')).toBeDefined();
  });
});
