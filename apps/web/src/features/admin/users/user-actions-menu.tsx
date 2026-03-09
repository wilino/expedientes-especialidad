import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import type { AdminUserItem } from '../../../lib/contracts';

interface AdminUserActionsMenuProps {
  anchorEl: HTMLElement | null;
  user: AdminUserItem | null;
  canManageRoles: boolean;
  canViewPermissions: boolean;
  canToggleState: boolean;
  onClose: () => void;
  onManageRoles: () => void;
  onViewPermissions: () => void;
  onToggleState: () => void;
}

export function AdminUserActionsMenu({
  anchorEl,
  user,
  canManageRoles,
  canViewPermissions,
  canToggleState,
  onClose,
  onManageRoles,
  onViewPermissions,
  onToggleState,
}: AdminUserActionsMenuProps) {
  return (
    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
      {canManageRoles ? (
        <MenuItem onClick={onManageRoles}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gestionar roles</ListItemText>
        </MenuItem>
      ) : null}
      {canViewPermissions ? (
        <MenuItem onClick={onViewPermissions}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver permisos</ListItemText>
        </MenuItem>
      ) : null}
      {canToggleState ? (
        <MenuItem onClick={onToggleState}>
          <ListItemIcon>
            {user?.estado ? (
              <ToggleOffIcon fontSize="small" />
            ) : (
              <ToggleOnIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{user?.estado ? 'Desactivar' : 'Activar'}</ListItemText>
        </MenuItem>
      ) : null}
    </Menu>
  );
}
