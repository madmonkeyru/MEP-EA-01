import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaywallModal } from './PaywallModal';
import { subscriptionService } from '../../services/subscriptionService';

describe('PaywallModal', () => {
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
  beforeEach(() => {
    subscriptionService.setTier('free');
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PaywallModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders plans, freemium guarantee, and feature title when open', () => {
    render(
      <PaywallModal
        isOpen={true}
        onClose={vi.fn()}
        featureTitle="Desbloquear Práctica Avanzada"
        featureDescription="Accede a cientos de ítems categorizados."
      />
    );

    expect(screen.getByText('Desbloquear Práctica Avanzada')).toBeInTheDocument();
    expect(screen.getByText('Accede a cientos de ítems categorizados.')).toBeInTheDocument();
    expect(screen.getByText('Plan Mensual Pro')).toBeInTheDocument();
    expect(screen.getByText('Pase Semestral BXM Total')).toBeInTheDocument();
    expect(screen.getByText(/Garantía de contenido libre/)).toBeInTheDocument();
  });

  it('allows dev toggle between Free and Premium tiers', () => {
    render(<PaywallModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Acceso Gratuito (Freemium)')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Cambiar a Premium/i });
    fireEvent.click(toggleBtn);

    expect(subscriptionService.isPremium()).toBe(true);
    expect(screen.getByText('Plan Pro Activo')).toBeInTheDocument();
  });

  it('allows simulating upgrade by selecting a plan and closes dialog', () => {
    const onClose = vi.fn();
    render(<PaywallModal isOpen={true} onClose={onClose} />);

    const choosePlanBtn = screen.getByRole('button', { name: /Simular acceso: Plan Mensual Pro/i });
    fireEvent.click(choosePlanBtn);

    expect(subscriptionService.isPremium()).toBe(true);
    expect(onClose).toHaveBeenCalled();
  });

  it('has no production controls that grant Pro access', () => {
    vi.stubEnv('DEV', false);
    render(<PaywallModal isOpen onClose={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Modo pruebas|Simular acceso/ })).not.toBeInTheDocument();
    const plans = screen.getAllByRole('button', { name: 'Contratación próximamente' });
    for (const plan of plans) { expect(plan).toBeDisabled(); fireEvent.click(plan); }
    expect(subscriptionService.getTier()).toBe('free');
  });
});
