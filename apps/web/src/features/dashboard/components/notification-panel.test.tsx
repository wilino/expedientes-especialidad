import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { NotificationItem } from '../../../lib/contracts';
import { NotificationPanel } from './notification-panel';

describe('NotificationPanel', () => {
  it('does not show mark-as-read action for fallback readonly notifications', () => {
    const fallbackItem: NotificationItem = {
      id: 'fallback-a1',
      tipo: 'INFO',
      titulo: 'Evento fallback',
      mensaje: 'Recurso X',
      recursoTipo: null,
      recursoId: null,
      leida: false,
      createdAt: new Date().toISOString(),
      readOnly: true,
      source: 'fallback',
    };

    render(
      <NotificationPanel
        items={[fallbackItem]}
        unreadCount={0}
        loading={false}
        error={null}
        onMarkRead={vi.fn()}
      />,
    );

    expect(screen.getByText('Evento fallback')).toBeInTheDocument();
    expect(screen.queryByLabelText('Marcar como leída')).not.toBeInTheDocument();
  });
});
