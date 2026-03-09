import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface AdminUserPermissionsDialogProps {
  open: boolean;
  userName: string;
  permissions: string[];
  onClose: () => void;
}

export function AdminUserPermissionsDialog({
  open,
  userName,
  permissions,
  onClose,
}: AdminUserPermissionsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Permisos efectivos: {userName}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
          {permissions.length > 0 ? (
            permissions.map((permission) => (
              <Chip key={permission} label={permission} size="small" />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              El usuario no tiene permisos efectivos.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
