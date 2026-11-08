import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScheduleBadge, StatusBadge } from './StatusBadge';

describe('status semantics', () => {
  it('does not describe a past official date as learner completion', () => {
    render(<><ScheduleBadge status="past" /><StatusBadge status="completed" /></>);
    expect(screen.getByText('Fecha pasada')).toHaveAttribute('data-kind', 'schedule');
    expect(screen.getByText('Completado')).toHaveAttribute('data-kind', 'learning');
    expect(screen.queryByText('Realizado')).not.toBeInTheDocument();
  });
});
