import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SubjectHubPage } from './LandingPage';
afterEach(cleanup);
it('starts with untimed learning, previews the exact count and presents simulation preflight', () => {
  const onPractice = vi.fn(), onSimulation = vi.fn();
  render(<SubjectHubPage currentUser={null} onStartPractice={onPractice} onStartSimulation={onSimulation} />);
  expect(screen.getByText(/Aún sin datos de simulación/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar práctica' }));
  expect(onPractice).toHaveBeenCalledWith(expect.objectContaining({ mode: 'area', enableTimer: false, area: 'geometry' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ensayar el examen' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preparar simulación' }));
  expect(screen.getByRole('dialog', { name: 'Antes de comenzar' })).toBeInTheDocument();
  expect(onSimulation).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulación' }));
  expect(onSimulation).toHaveBeenCalledOnce();
});
