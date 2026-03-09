import { Button, Paper, Stack, TextField } from '@mui/material';

interface AdminRoleCreateFormProps {
  roleName: string;
  roleDescription: string;
  creating: boolean;
  onRoleNameChange: (value: string) => void;
  onRoleDescriptionChange: (value: string) => void;
  onCreate: () => void;
}

export function AdminRoleCreateForm({
  roleName,
  roleDescription,
  creating,
  onRoleNameChange,
  onRoleDescriptionChange,
  onCreate,
}: AdminRoleCreateFormProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          label="Nombre de rol"
          value={roleName}
          onChange={(event) => onRoleNameChange(event.target.value)}
          fullWidth
        />
        <TextField
          label="Descripción"
          value={roleDescription}
          onChange={(event) => onRoleDescriptionChange(event.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={onCreate} disabled={creating}>
          Crear rol
        </Button>
      </Stack>
    </Paper>
  );
}
