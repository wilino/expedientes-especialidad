import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
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
import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';
import { AccessRules, type AccessRule } from '../auth/access-rules';
import { usePermissions } from '../auth/use-permissions';
import { PermissionCodes } from '../auth/permission-codes';
import { useNotifications } from '../dashboard';

const DRAWER_WIDTH = 260;

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon: typeof DashboardOutlinedIcon;
  section: 'main' | 'admin';
  accessRule?: AccessRule;
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: DashboardOutlinedIcon, section: 'main' },
  {
    to: '/expedientes',
    label: 'Expedientes',
    icon: FolderOpenOutlinedIcon,
    section: 'main',
    accessRule: AccessRules.expedientes,
  },
  {
    to: '/actuaciones',
    label: 'Actuaciones',
    icon: GavelOutlinedIcon,
    section: 'main',
    accessRule: AccessRules.actuaciones,
  },
  {
    to: '/documentos',
    label: 'Documentos',
    icon: DescriptionOutlinedIcon,
    section: 'main',
    accessRule: AccessRules.documentos,
  },
  {
    to: '/auditoria',
    label: 'Auditoría',
    icon: FactCheckOutlinedIcon,
    section: 'main',
    accessRule: AccessRules.auditoria,
  },
  {
    to: '/reportes',
    label: 'Reportes',
    icon: BarChartOutlinedIcon,
    section: 'main',
    accessRule: AccessRules.reportes,
  },
  {
    to: '/usuarios',
    label: 'Usuarios',
    icon: GroupOutlinedIcon,
    section: 'admin',
    accessRule: AccessRules.adminUsers,
  },
  {
    to: '/roles',
    label: 'Roles',
    icon: SecurityOutlinedIcon,
    section: 'admin',
    accessRule: AccessRules.adminRoles,
  },
] satisfies NavItem[];

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { can, canAll, canAny } = usePermissions();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const canReadNotifications = can(PermissionCodes.NOTIFICACION_READ);

  const { notificationsQuery } = useNotifications({
    take: 1,
    enabled: canReadNotifications,
  });

  const unreadCount = canReadNotifications ? notificationsQuery.data?.unreadCount ?? 0 : 0;

  const hasAccess = (rule?: AccessRule) => {
    if (!rule) {
      return true;
    }

    return rule.requireAll ? canAll(rule.permissions) : canAny(rule.permissions);
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => hasAccess(item.accessRule));
  const mainItems = visibleNavItems.filter((item) => item.section === 'main');
  const adminItems = visibleNavItems.filter((item) => item.section === 'admin');

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs =
    pathSegments.length === 0
      ? [{ to: '/', label: 'Dashboard', isLast: true }]
      : pathSegments.map((segment, index) => {
          const to = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const navItem = visibleNavItems.find((item) => item.to === to);
          return {
            to,
            label: navItem?.label ?? toTitleCase(segment),
            isLast: index === pathSegments.length - 1,
          };
        });

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        px: 1.2,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'primary.main',
        color: 'common.white',
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 1.1, mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            color: 'primary.dark',
            width: 36,
            height: 36,
            fontWeight: 700,
          }}
        >
          <BalanceRoundedIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
            EXPEDIENTES
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Gestión legal
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 1.2 }} />

      <List disablePadding sx={{ display: 'grid', gap: 0.4 }}>
        {mainItems.map((item) => {
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
                borderRadius: 1.5,
                color: isActive ? 'common.white' : 'rgba(226,232,240,0.9)',
                borderLeft: '3px solid',
                borderColor: isActive ? 'secondary.main' : 'transparent',
                '& .MuiListItemIcon-root': {
                  color: isActive ? 'common.white' : 'rgba(148,163,184,1)',
                },
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'primary.light',
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {adminItems.length > 0 ? (
        <>
          <Typography
            variant="overline"
            sx={{
              mt: 2,
              px: 1.2,
              color: 'secondary.main',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Administración
          </Typography>

          <List disablePadding sx={{ display: 'grid', gap: 0.4 }}>
            {adminItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  selected={isActive}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 1.5,
                    color: isActive ? 'common.white' : 'rgba(226,232,240,0.9)',
                    borderLeft: '3px solid',
                    borderColor: isActive ? 'secondary.main' : 'transparent',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'common.white' : 'rgba(148,163,184,1)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'primary.light',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </>
      ) : null}

      <Box sx={{ mt: 'auto', px: 1.1, pt: 1.3, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', color: 'primary.dark' }}>
            {user?.nombre?.trim().charAt(0).toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.nombre ?? 'Usuario'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }} noWrap>
              {user?.roles?.[0] ?? user?.correo ?? 'Sin rol'}
            </Typography>
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => void logout()}
          sx={{
            mt: 1.2,
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'common.white',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              bgcolor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1.2 }}>
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
            <Typography variant="subtitle1" fontWeight={700}>
              Sistema legal
            </Typography>
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

          {canReadNotifications ? (
            <IconButton color="inherit" aria-label="Notificaciones">
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          ) : null}
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
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
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
