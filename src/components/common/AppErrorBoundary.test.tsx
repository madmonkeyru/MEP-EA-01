import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('offers reload and home recovery after a render or chunk failure without clearing history', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  localStorage.setItem('mep_ea_attempts', '[{"id":"retained"}]');
  function Screen(): never { throw new Error('Failed to fetch dynamically imported module'); }
  render(<AppErrorBoundary><Screen /></AppErrorBoundary>);
  expect(screen.getByRole('alert')).toHaveTextContent('No pudimos abrir esta página');
  expect(screen.getByRole('button', { name: 'Reintentar carga' })).toBeInTheDocument();
  expect(localStorage.getItem('mep_ea_attempts')).toBe('[{"id":"retained"}]');
  expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '#/');
});
