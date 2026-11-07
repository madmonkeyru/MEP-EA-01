import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SubjectHubPage } from './LandingPage';
afterEach(cleanup);
it('makes resource panels keyboard navigable and exposes official PDFs without a guide', () => {
  render(<SubjectHubPage currentUser={null} onStartPractice={vi.fn()} onStartSimulation={vi.fn()} />);
  const practice = screen.getByRole('tab', { name: 'Práctica' });
  practice.focus(); fireEvent.keyDown(practice, { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Simulaciones' })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Simulaciones' }), { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Recursos' })).toHaveFocus();
  expect(screen.getByRole('heading', { name: 'Materiales oficiales en PDF' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Abrir PDF (otra pestaña)' }).length).toBeGreaterThan(0);
  const previews = document.querySelectorAll('.resource-pdf-card__preview iframe');
  expect(previews.length).toBe(screen.getAllByRole('link', { name: 'Abrir PDF (otra pestaña)' }).length);
  expect(previews[0]).toHaveAttribute('src', expect.stringContaining('#page=1'));
  fireEvent.click(screen.getByRole('tab', { name: 'Temario' }));
  expect(screen.getByRole('heading', { name: /Qué debo estudiar/ })).toBeInTheDocument();
});
