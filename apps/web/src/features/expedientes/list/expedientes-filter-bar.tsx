import { Button, Stack, TextField } from '@mui/material';

interface ExpedientesFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onApply: () => void;
}

export function ExpedientesFilterBar({
  query,
  onQueryChange,
  onApply,
}: ExpedientesFilterBarProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label="Buscar"
        placeholder="Código o carátula"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onApply();
          }
        }}
        size="small"
        sx={{ width: 280 }}
      />
      <Button variant="outlined" onClick={onApply}>
        Filtrar
      </Button>
    </Stack>
  );
}
