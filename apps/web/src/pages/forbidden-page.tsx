import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

export function ForbiddenPage() {
  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 480 }}>
        <BlockIcon sx={{ fontSize: 64, color: 'warning.main' }} />
        <Typography variant="h2">Acceso denegado</Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No tienes los permisos necesarios para acceder a esta página. Contacta
          a un administrador si crees que esto es un error.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Volver al inicio
        </Button>
      </Stack>
    </Box>
  );
}
