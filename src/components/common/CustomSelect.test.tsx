import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomSelect } from './CustomSelect';

describe('CustomSelect', () => {
  const options = [
    { value: 'opt1', label: 'Opción 1' },
    { value: 'opt2', label: 'Opción 2' },
    { value: 'opt3', label: 'Opción 3 (Deshabilitada)', disabled: true },
  ];

  it('renders with selected option label', () => {
    render(<CustomSelect value="opt1" options={options} onChange={vi.fn()} aria-label="Selector de prueba" />);
    expect(screen.getByRole('button', { name: 'Selector de prueba' })).toHaveTextContent('Opción 1');
  });

  it('opens options list when clicking trigger button', () => {
    render(<CustomSelect value="opt1" options={options} onChange={vi.fn()} aria-label="Selector" />);
    const trigger = screen.getByRole('button', { name: 'Selector' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(3);
  });

  it('selects option and triggers onChange', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="opt1" options={options} onChange={handleChange} aria-label="Selector" />);
    fireEvent.click(screen.getByRole('button', { name: 'Selector' }));

    const listbox = screen.getByRole('listbox');
    const option2 = listbox.querySelector('#_r_2_-opt-1') || listbox.querySelectorAll('[role="option"]')[1];
    fireEvent.click(option2 as HTMLElement);
    expect(handleChange).toHaveBeenCalledWith('opt2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with keyboard ArrowDown and selects with Enter', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="opt1" options={options} onChange={handleChange} aria-label="Selector" />);
    const trigger = screen.getByRole('button', { name: 'Selector' });

    // Open with arrow down
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Navigate to next item
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('opt2');
  });

  it('closes on Escape key', () => {
    render(<CustomSelect value="opt1" options={options} onChange={vi.fn()} aria-label="Selector" />);
    const trigger = screen.getByRole('button', { name: 'Selector' });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
