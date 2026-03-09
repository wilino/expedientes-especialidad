import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import type { AdminRoleItem, AdminUserItem } from '../../../lib/contracts';

interface AdminUserRoleDialogProps {
  open: boolean;
  user: AdminUserItem | null;
  selectedRoleId: string;
  roles: AdminRoleItem[];
  assigning: boolean;
  removing: boolean;
  onClose: () => void;
  onRoleChange: (roleId: string) => void;
  onAssign: () => void;
  onRemove: () => void;
}

export function AdminUserRoleDialog({
  open,
  user,
  selectedRoleId,
  roles,
  assigning,
  removing,
  onClose,
  onRoleChange,
  onAssign,
  onRemove,
}: AdminUserRoleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Gestionar roles: {user?.nombre}</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Rol"
          fullWidth
          sx={{ mt: 1 }}
          value={selectedRoleId}
          onChange={(event) => onRoleChange(event.target.value)}
          SelectProps={{ native: true }}
        >
          <option value="">Seleccionar rol...</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.nombre}
            </option>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="outlined"
          color="warning"
          disabled={!selectedRoleId || removing}
          onClick={onRemove}
        >
          <PersonRemoveIcon fontSize="small" sx={{ mr: 0.5 }} />
          Remover
        </Button>
        <Button
          variant="contained"
          disabled={!selectedRoleId || assigning}
          onClick={onAssign}
        >
          <PersonAddIcon fontSize="small" sx={{ mr: 0.5 }} />
          Asignar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
