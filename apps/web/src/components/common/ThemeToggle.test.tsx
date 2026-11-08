import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

it('toggles light and dark with an accessible switch and persists the choice', () => {
  localStorage.setItem('mep_ea_01_theme', 'light');
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'true');
  expect(document.documentElement).toHaveClass('dark');
  expect(localStorage.getItem('mep_ea_01_theme')).toBe('dark');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  expect(localStorage.getItem('mep_ea_01_theme')).toBe('light');
});

it('follows the system preference until the student makes a choice', () => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  expect(screen.getByRole('switch', { name: 'Modo oscuro' })).toHaveAttribute('aria-checked', 'true');
  expect(localStorage.getItem('mep_ea_01_theme')).toBeNull();
});
