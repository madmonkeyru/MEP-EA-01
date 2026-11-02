import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';
afterEach(cleanup);
it('names the modal, contains keyboard focus and restores the trigger', () => {
  const close = vi.fn();
  const trigger = document.createElement('button'); trigger.textContent = 'Open'; document.body.append(trigger); trigger.focus();
  const { unmount } = render(<Dialog title="Confirmar" onClose={close}><button>Última acción</button></Dialog>);
  const dialog = screen.getByRole('dialog', { name: 'Confirmar' });
  const first = screen.getByRole('button', { name: 'Cerrar Confirmar' });
  const last = screen.getByRole('button', { name: 'Última acción' });
  expect(first).toHaveFocus();
  last.focus(); fireEvent.keyDown(dialog, { key: 'Tab' }); expect(first).toHaveFocus();
  fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true }); expect(last).toHaveFocus();
  fireEvent.keyDown(dialog, { key: 'Escape' }); expect(close).toHaveBeenCalledOnce();
  unmount(); expect(trigger).toHaveFocus(); trigger.remove();
});
