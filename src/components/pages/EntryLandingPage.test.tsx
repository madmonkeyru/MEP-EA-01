import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EntryLandingPage } from './EntryLandingPage';

describe('EntryLandingPage', () => {
  it('renders a unified landing card with clear validation paths', () => {
    const handleExplore = vi.fn();
    const handleEnterBxm = vi.fn();

    render(
      <EntryLandingPage
        onExplorePrograms={handleExplore}
        onEnterBxmHub={handleEnterBxm}
      />
    );

    const landingCard = screen.getByRole('region', { name: /Prepárate para cualquier materia/i });
    expect(within(landingCard).getByText('Matemáticas BXM')).toBeInTheDocument();
    expect(within(landingCard).getByText('Explorar Programas')).toBeInTheDocument();

    const enterBxmBtn = screen.getByText('Practicar Matemáticas BXM');
    fireEvent.click(enterBxmBtn);
    expect(handleEnterBxm).toHaveBeenCalledTimes(1);

    const exploreBtn = screen.getByText('Explorar programas');
    fireEvent.click(exploreBtn);
    expect(handleExplore).toHaveBeenCalledTimes(1);
  });

  it('renders the wavy flag as a decorative, non-interactive ambient background', () => {
    const { container } = render(
      <EntryLandingPage
        onExplorePrograms={vi.fn()}
        onEnterBxmHub={vi.fn()}
      />
    );

    const background = container.querySelector('[aria-hidden="true"]');
    expect(background).toHaveClass('pointer-events-none');
    expect(background?.querySelector('svg[viewBox="0 0 1440 680"]')).toBeInTheDocument();
    expect(background).toHaveClass('inset-0');
    expect(background).not.toHaveClass('h-[680px]');
    expect(background?.querySelector('svg')).toHaveClass('opacity-90', 'dark:opacity-40');

    const fadeMask = background?.querySelector('#flag-fade-mask');
    expect(fadeMask?.querySelector('stop[offset="0%"]')).toHaveAttribute('stop-opacity', '0.65');
    expect(fadeMask?.querySelector('stop[offset="100%"]')).toHaveAttribute('stop-opacity', '0.65');

    const blueGradient = background?.querySelector('#cr-blue-grad');
    expect(blueGradient?.querySelector('stop[offset="50%"]')).toHaveAttribute('stop-opacity', '0.38');
  });
});
