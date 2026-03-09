import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';
import { AccessRules, type AccessRule } from '../auth/access-rules';
import { usePermissions } from '../auth/use-permissions';

const DRAWER_WIDTH = 272;

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon: typeof DashboardOutlinedIcon;
  accessRule?: AccessRule;
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: DashboardOutlinedIcon },
  {
    to: '/expedientes',
    label: 'Expedientes',
    icon: FolderOpenOutlinedIcon,
    accessRule: AccessRules.expedientes,
  },
  {
    to: '/actuaciones',
    label: 'Actuaciones',
    icon: GavelOutlinedIcon,
    accessRule: AccessRules.actuaciones,
  },
  {
    to: '/documentos',
    label: 'Documentos',
    icon: DescriptionOutlinedIcon,
    accessRule: AccessRules.documentos,
  },
  {
    to: '/auditoria',
    label: 'Auditoría',
    icon: FactCheckOutlinedIcon,
    accessRule: AccessRules.auditoria,
  },
  {
    to: '/reportes',
    label: 'Reportes',
    icon: BarChartOutlinedIcon,
    accessRule: AccessRules.reportes,
  },
  {
    to: '/usuarios',
    label: 'Usuarios',
    icon: GroupOutlinedIcon,
    accessRule: AccessRules.adminUsers,
  },
  {
    to: '/roles',
    label: 'Roles',
    icon: SecurityOutlinedIcon,
    accessRule: AccessRules.adminRoles,
  },
] satisfies NavItem[];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { canAll, canAny } = usePermissions();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasAccess = (rule?: AccessRule) => {
    if (!rule) {
      return true;
    }
    return rule.requireAll ? canAll(rule.permissions) : canAny(rule.permissions);
  };
  const visibleNavItems = NAV_ITEMS.filter((item) => hasAccess(item.accessRule));

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs =
    pathSegments.length === 0
      ? [{ to: '/', label: 'Dashboard', isLast: true }]
      : pathSegments.map((segment, index) => {
          const to = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const navItem = visibleNavItems.find((item) => item.to === to);
          return {
            to,
            label:
              navItem?.label ??
              segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            isLast: index === pathSegments.length - 1,
          };
        });

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="h5">Expedientes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Control legal y trazabilidad
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List disablePadding>
        {visibleNavItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={isActive}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 1.2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                },
                '&.Mui-selected .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
            aria-label="Abrir navegación"
          >
            <MenuIcon />
          </IconButton>

          <Stack sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Sistema legal</Typography>
            <Breadcrumbs sx={{ mt: 0.25 }} aria-label="Breadcrumb de navegación">
              {breadcrumbs.map((crumb) =>
                crumb.isLast ? (
                  <Typography key={crumb.to} variant="caption" color="text.secondary">
                    {crumb.label}
                  </Typography>
                ) : (
                  <MuiLink
                    key={crumb.to}
                    component={RouterLink}
                    to={crumb.to}
                    underline="hover"
                    color="inherit"
                    variant="caption"
                  >
                    {crumb.label}
                  </MuiLink>
                ),
              )}
            </Breadcrumbs>
          </Stack>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
              {user?.nombre?.trim().charAt(0).toUpperCase() ?? 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user?.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.correo}
              </Typography>
            </Box>
          </Stack>

          <Button variant="outlined" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
