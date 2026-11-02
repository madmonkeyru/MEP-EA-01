import { render, screen } from '@testing-library/react';
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
});
