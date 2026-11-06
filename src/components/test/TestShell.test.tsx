import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestShell } from './TestShell';
import { ThemeProvider } from '../../context/ThemeContext';
import { createSession } from '../../services/learningSession';
import type { PracticeConfig } from '../../types';
import { dataService } from '../../services/dataService';
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });
const config: PracticeConfig = { mode: 'simulation', itemCount: 5, enableTimer: false, timerDurationMinutes: 15 };
function mount(value = config, finish = vi.fn(), initial = createSession(value)) { return { finish, ...render(<ThemeProvider><TestShell config={value} initialSession={initial} onFinishTest={finish} /></ThemeProvider>) }; }
describe('test integrity and accessible answering', () => {
  it('scores an imported three-option item and never displays a phantom D option', () => {
    const item = dataService.getItemById('item-qbe-2025-c1-geometry-1-q02')!;
    const cfg: PracticeConfig = { ...config, mode: 'area', itemIds: [item.id], itemCount: 1 };
    const { container } = mount(cfg);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(container.querySelector('input[value="D"]')).toBeNull();
    fireEvent.click(container.querySelector('input[value="B"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Verificar respuesta y ver explicación' }));
    const feedback = screen.getByRole('region', { name: 'Explicación de la respuesta' });
    expect(within(feedback).getByRole('status')).toHaveTextContent('Respuesta correcta');
    expect(feedback).toHaveTextContent('16');
  });
  it('submits the latest response once when the deadline expires', () => {
    vi.useFakeTimers();
    const timed = { ...config, enableTimer: true };
    const initial = { ...createSession(timed), deadline: Date.now() + 2000 };
    const { finish, container } = mount(timed, vi.fn(), initial);
    fireEvent.click(container.querySelector('input[value="B"]')!);
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(container.querySelector('input[value="A"]')!);
    act(() => vi.advanceTimersByTime(1000));
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish.mock.calls[0][0].responses[initial.itemIds[0]].selectedOption).toBe('A');
    expect(finish.mock.calls[0][0].elapsedSeconds).toBe(2);
    act(() => vi.advanceTimersByTime(3000));
    expect(finish).toHaveBeenCalledTimes(1);
  });
  it('does not restore a different session just because its question count matches', () => {
    const previous = createSession(config); previous.responses[previous.itemIds[0]] = { itemId: previous.itemIds[0], selectedOption: 'A' };
    localStorage.setItem('mep_ea_active_session', JSON.stringify(previous));
    render(<ThemeProvider><TestShell config={config} onFinishTest={vi.fn()} /></ThemeProvider>);
    expect(screen.getAllByRole('radio').every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
  });
  it('suspends shortcuts during reference dialogs and restores focus', () => {
    mount();
    const formulas = screen.getByRole('button', { name: 'Fórmulas' });
    formulas.focus(); fireEvent.click(formulas);
    expect(screen.getByRole('dialog', { name: 'Fórmulas de referencia' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getAllByRole('radio', { hidden: true }).every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar fórmulas' }));
    expect(formulas).toHaveFocus();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'Pregunta 2 de 5' })).toBeInTheDocument();
  });
  it('locks verified learning answers and suppresses feedback in weighted mocks', () => {
    const learning = { ...config, mode: 'area' as const, area: 'geometry' as const };
    const { container, unmount } = mount(learning);
    fireEvent.click(container.querySelector('input[value="A"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Verificar respuesta y ver explicación' }));
    expect(screen.getAllByRole('radio').every(input => (input as HTMLInputElement).disabled)).toBe(true);
    unmount();
    const weighted = { ...config, mode: 'dynamic_mock' as const };
    const next = mount(weighted);
    fireEvent.click(next.container.querySelector('input[value="A"]')!);
    expect(screen.queryByRole('button', { name: /Verificar respuesta/ })).not.toBeInTheDocument();
  });
});
