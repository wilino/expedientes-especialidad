import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  caratula: z.string().min(1, 'La carátula es obligatoria'),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateExpedienteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (codigo: string, caratula: string) => Promise<void>;
}

export function CreateExpedienteDialog({
  open,
  onClose,
  onSave,
}: CreateExpedienteDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { codigo: '', caratula: '' },
  });

  const onSubmit = async (values: CreateFormValues) => {
    await onSave(values.codigo, values.caratula);
    reset();
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Nuevo expediente</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Controller
            name="codigo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Código"
                placeholder="EXP-2026-001"
                error={!!errors.codigo}
                helperText={errors.codigo?.message}
                fullWidth
                autoFocus
                sx={{ mt: 1 }}
              />
            )}
          />
          <Controller
            name="caratula"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Carátula"
                placeholder="Demanda laboral - Juan Perez"
                error={!!errors.caratula}
                helperText={errors.caratula?.message}
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Crear
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
