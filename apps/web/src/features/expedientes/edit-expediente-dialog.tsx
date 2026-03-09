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
import type { ExpedienteItem } from '../../lib/contracts';

const editSchema = z.object({
  caratula: z.string().min(1, 'La carátula es obligatoria'),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditExpedienteDialogProps {
  open: boolean;
  expediente: ExpedienteItem | null;
  onClose: () => void;
  onSave: (id: string, caratula: string) => Promise<void>;
}

export function EditExpedienteDialog({
  open,
  expediente,
  onClose,
  onSave,
}: EditExpedienteDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: { caratula: expediente?.caratula ?? '' },
  });

  const onSubmit = async (values: EditFormValues) => {
    if (!expediente) return;
    await onSave(expediente.id, values.caratula);
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Editar expediente {expediente?.codigo}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Controller
            name="caratula"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Carátula"
                error={!!errors.caratula}
                helperText={errors.caratula?.message}
                fullWidth
                autoFocus
                sx={{ mt: 1 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
