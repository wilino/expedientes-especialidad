import { ConfirmDialog } from '../../../ui/components';

interface AdminUserToggleDialogProps {
  open: boolean;
  userName: string;
  currentEstado: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminUserToggleDialog({
  open,
  userName,
  currentEstado,
  loading,
  onConfirm,
  onClose,
}: AdminUserToggleDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={currentEstado ? '¿Desactivar usuario?' : '¿Activar usuario?'}
      description={`Usuario: ${userName}`}
      confirmText={currentEstado ? 'Desactivar' : 'Activar'}
      danger={currentEstado}
      loading={loading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
