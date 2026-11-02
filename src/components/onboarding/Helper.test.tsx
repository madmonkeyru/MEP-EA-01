import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WizardProvider, useWizard } from './wizardStore';
import { ReadinessWizard } from './ReadinessWizard';
import { HelperPage, helperProgramRoute } from './HelperPage';
import { readRoute, routeHash } from '../../services/navigation';

afterEach(cleanup);

describe('optional guide and resources', () => {
  it('allows skipping or browsing resources before answering anything', () => {
    const skip = vi.fn();
    const explore = vi.fn();
    render(<WizardProvider><ReadinessWizard onNavigate={vi.fn()} onSkip={skip} onExplore={explore} /></WizardProvider>);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Omitir guía' }));
    expect(skip).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Ver recursos sin responder' }));
    expect(explore).toHaveBeenCalledOnce();
  });

  it('preserves answers across guide remounts within the provider and resets on request', () => {
    function Host({ open }: { open: boolean }) {
      const wizard = useWizard();
      return <><button onClick={wizard.reset}>Reset</button>{open && <ReadinessWizard onNavigate={vi.fn()} onSkip={vi.fn()} onExplore={vi.fn()} />}</>;
    }
    const { rerender } = render(<WizardProvider><Host open /></WizardProvider>);
    fireEvent.click(screen.getByRole('radio', { name: /No estoy seguro/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('heading', { name: '¿A cuáles programas puede optar?' })).toBeInTheDocument();
    rerender(<WizardProvider><Host open={false} /></WizardProvider>);
    rerender(<WizardProvider><Host open /></WizardProvider>);
    expect(screen.getByRole('heading', { name: '¿A cuáles programas puede optar?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('heading', { name: '¿Para qué se está preparando?' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /No estoy seguro/ })).not.toBeChecked();
  });

  it('exposes PDFs for all four programs without a profile and filters searches', () => {
    render(<WizardProvider><HelperPage onNavigate={vi.fn()} /></WizardProvider>);
    for (const name of ['I y II Ciclo', 'III Ciclo', 'EDAD', 'BXM']) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(screen.getAllByRole('link').filter(link => link.getAttribute('href')?.endsWith('.pdf')).length).toBeGreaterThan(0);
    }
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no such resource' } });
    expect(screen.getByRole('status')).toHaveTextContent('0 materiales');
  });

  it('round trips helper links and maps prototype program and level identifiers', () => {
    for (const view of ['guide', 'helper'] as const) expect(readRoute(routeHash({ view }))).toEqual({ view });
    expect(readRoute(routeHash(helperProgramRoute('i-ii'))).programId).toBe('cico');
    expect(readRoute(routeHash(helperProgramRoute('iii', '9'))).moduleId).toBe('III_CICLO_9');
    expect(readRoute(routeHash(helperProgramRoute('edad', '11'))).moduleId).toBe('EDAD_2');
  });

  it('completes the unsure-program route and links the recommendation to the app', () => {
    const navigate = vi.fn();
    const { container } = render(<WizardProvider><ReadinessWizard onNavigate={navigate} onSkip={vi.fn()} onExplore={vi.fn()} /></WizardProvider>);
    const select = (name: string, value: string) => fireEvent.click(container.querySelector(`input[name="${name}"][value="${value}"]`)!);
    const next = () => fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    select('program', 'unsure'); next();
    select('age', '18-plus'); select('schooling', 'ninth');
    select('foreign', 'no'); select('style', 'self'); next();
    select('enrolled', 'not-yet'); select('certs', 'missing'); select('hours', '3-5'); select('confidence', 'mid');
    for (const name of ['first', 'window', 'id', 'recognition', 'materials']) select(name, 'no');
    fireEvent.click(screen.getByRole('button', { name: 'Ver mi ruta' }));
    expect(screen.getByRole('heading', { name: 'Ruta sugerida: BXM' })).toBeInTheDocument();
    expect(screen.queryByText('Preparación del expediente')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar mi programa' }));
    expect(navigate).toHaveBeenCalledWith(helperProgramRoute('bxm'));
    fireEvent.click(screen.getByRole('button', { name: 'Empezar de nuevo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, empezar de nuevo' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('requires a science and language when planning the complete BXM program', () => {
    const { container } = render(<WizardProvider><ReadinessWizard onNavigate={vi.fn()} onSkip={vi.fn()} onExplore={vi.fn()} /></WizardProvider>);
    fireEvent.click(container.querySelector('input[name="program"][value="bxm"]')!);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Biología' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Francés' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    expect(screen.getByText(/6 pruebas · ₡48/)).toBeInTheDocument();
  });
});

