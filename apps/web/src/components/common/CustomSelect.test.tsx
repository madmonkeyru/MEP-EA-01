import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomSelect } from './CustomSelect';

describe('CustomSelect', () => {
  const options = [
    { value: 'one', label: 'Primera' }, { value: 'two', label: 'Segunda' },
    { value: 'disabled', label: 'No disponible', disabled: true },
  ];
  it('exposes a single named control with the selected value', () => {
    render(<CustomSelect label="Materia" value="one" options={options} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Materia' })).toHaveValue('one');
    expect(screen.getAllByLabelText('Materia')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'No disponible' })).toBeDisabled();
  });
  it('passes the selected value and supports explicit accessible names', () => {
    const onChange = vi.fn();
    render(<CustomSelect label="Materia" aria-label="Cambiar materia" value="one" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Cambiar materia' }), { target: { value: 'two' } });
    expect(onChange).toHaveBeenCalledWith('two');
  });
  it('honors disabled controls and string options', () => {
    render(<CustomSelect title="Nivel" value="1" options={['1', '2']} disabled onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Nivel' })).toBeDisabled();
  });
});
