import { Button, Paper, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateUserInput } from '../types';

const createUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Ingrese un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export function AdminUsersCreateForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (values: CreateUserInput) => Promise<void>;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { nombre: '', correo: '', password: '' },
  });

  const onValidSubmit = async (values: CreateUserInput) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        component="form"
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        onSubmit={handleSubmit(onValidSubmit)}
      >
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="correo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Correo"
              type="email"
              error={!!errors.correo}
              helperText={errors.correo?.message}
              fullWidth
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
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />
          )}
        />
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          Crear usuario
        </Button>
      </Stack>
    </Paper>
  );
}
