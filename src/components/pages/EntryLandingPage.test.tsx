import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EntryLandingPage } from './EntryLandingPage';

describe('EntryLandingPage', () => {
  it('renders simple prototype landing without hero, offering clear validation paths', () => {
    const handleExplore = vi.fn();
    const handleEnterBxm = vi.fn();

    render(
      <EntryLandingPage
        onExplorePrograms={handleExplore}
        onEnterBxmHub={handleEnterBxm}
      />
    );

    expect(screen.getByText(/Prepárate para cualquier materia/i)).toBeInTheDocument();
    expect(screen.getByText('Matemáticas BXM')).toBeInTheDocument();
    expect(screen.getByText('Explorar Programas')).toBeInTheDocument();

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
  });
});
