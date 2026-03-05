import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../features/auth/use-auth';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const loginSchema = z.object({
  correo: z.string().email('Ingrese un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitializing, login } = useAuth();
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: 'admin@expedientes.local',
      password: 'Admin@2026',
    },
  });

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    try {
      await login(values.correo, values.password);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
      setError(message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 480, p: 3 }}>
        <Stack component="form" spacing={2.2} onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Typography
              variant="overline"
              color="primary.dark"
              fontWeight={700}
              letterSpacing={1}
            >
              Sistema legal
            </Typography>
            <Typography variant="h4" component="h1">
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accede a expedientes, auditoría y reportes con control RBAC.
            </Typography>
          </Box>

          <Controller
            name="correo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo"
                type="email"
                autoComplete="email"
                error={!!errors.correo}
                helperText={errors.correo?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Button variant="contained" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Ingresando...' : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
