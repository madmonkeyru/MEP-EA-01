import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { ThemeProvider } from '../../context/ThemeContext';

describe('Header', () => {
  it('renders application title with prototype name and login button when user is logged out (Public Header)', () => {
    render(
      <ThemeProvider>
        <Header currentUser={null} onUserChanged={vi.fn()} onNavigateHome={vi.fn()} currentView="landing" />
      </ThemeProvider>
    );

    expect(screen.getByRole('img', { name: 'Yigüirro de Costa Rica' })).toHaveAttribute('src', '/logo_yiguirro_cr_high_fidelity.svg');
    expect(screen.getByText('MEP-EA-01')).toBeInTheDocument();
    expect(screen.getByText(/Preparación independiente/)).toBeInTheDocument();
    expect(screen.getByText('Perfil local opcional')).toBeInTheDocument();
    // Program dropdown should not be present on landing view
    expect(screen.queryByTitle('Cambiar programa de estudio')).not.toBeInTheDocument();
  });

  it('renders user name and logout button when logged in (Private Header)', () => {
    render(
      <ThemeProvider>
        <Header
          currentUser={{ id: '1', name: 'Estudiante Prueba', email: 'test@mep.cr' }}
          onUserChanged={vi.fn()}
          onNavigateHome={vi.fn()}
          currentView="hub"
        />
      </ThemeProvider>
    );

    expect(screen.getByText(/Estudiante Prueba/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usar modo invitado' })).toBeInTheDocument();
    expect(screen.queryByText('Perfil local opcional')).not.toBeInTheDocument();
    // Program dropdown should be visible on hub view
    expect(screen.getByTitle('Cambiar programa de estudio')).toBeInTheDocument();
  });

  it('toggles mobile sidebar navigation when hamburger button is clicked', () => {
    render(
      <ThemeProvider>
        <Header currentUser={null} onUserChanged={vi.fn()} onNavigateHome={vi.fn()} currentView="landing" />
      </ThemeProvider>
    );

    // Initial state: hamburger button has aria-label="Abrir menú" and sidebar drawer is not in DOM
    const openButton = screen.getByRole('button', { name: 'Abrir menú' });
    expect(openButton).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Menú de navegación' })).not.toBeInTheDocument();

    // Click hamburger to open sidebar
    fireEvent.click(openButton);

    // Now drawer dialog is visible
    expect(screen.getByRole('dialog', { name: 'Menú de navegación' })).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: 'Cerrar menú' });
    expect(closeButtons.length).toBeGreaterThan(0);

    // Click close button inside drawer
    fireEvent.click(closeButtons[0]);
    expect(screen.queryByRole('dialog', { name: 'Menú de navegación' })).not.toBeInTheDocument();
  });
});
