import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReminderItem } from '../../../lib/contracts';
import { ReminderPanel } from './reminder-panel';

const baseReminder: ReminderItem = {
  id: 'r1',
  titulo: 'Audiencia',
  descripcion: 'Juzgado 5to',
  fechaHora: new Date(Date.now() + 3600_000).toISOString(),
  prioridad: 'URGENTE',
  completado: false,
  recursoTipo: null,
  recursoId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ReminderPanel', () => {
  it('calls onToggleComplete when reminder checkbox changes', async () => {
    const user = userEvent.setup();
    const onToggleComplete = vi.fn();

    render(
      <ReminderPanel
        items={[baseReminder]}
        loading={false}
        error={null}
        creating={false}
        onToggleComplete={onToggleComplete}
        onCreate={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onToggleComplete).toHaveBeenCalledWith('r1', true);
  });

  it('creates a reminder from dialog form', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(
      <ReminderPanel
        items={[]}
        loading={false}
        error={null}
        creating={false}
        onToggleComplete={vi.fn()}
        onCreate={onCreate}
      />,
    );

    await user.click(screen.getByLabelText('Agregar recordatorio'));
    await user.type(screen.getByLabelText('Título'), 'Revisión de expediente');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
