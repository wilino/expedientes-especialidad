import { Button, Paper } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { DataTable } from '../../../ui/components';
import type { AdminRoleItem } from '../../../lib/contracts';

interface AdminRolesTableProps {
  rows: AdminRoleItem[];
  loading: boolean;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
}

export function AdminRolesTable({
  rows,
  loading,
  selectedRoleId,
  onSelectRole,
}: AdminRolesTableProps) {
  const roleColumns = useMemo<GridColDef<AdminRoleItem>[]>(
    () => [
      {
        field: 'nombre',
        headerName: 'Rol',
        minWidth: 170,
        flex: 1,
      },
      {
        field: 'descripcion',
        headerName: 'Descripción',
        minWidth: 240,
        flex: 1,
        valueGetter: (_value, row) => row.descripcion ?? '-',
      },
      {
        field: 'usuarios',
        headerName: 'Usuarios',
        minWidth: 110,
        valueGetter: (_value, row) => row._count?.usuarios ?? 0,
      },
      {
        field: 'acciones',
        headerName: 'Acciones',
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Button
            variant={selectedRoleId === row.id ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onSelectRole(row.id)}
          >
            {selectedRoleId === row.id ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        ),
      },
    ],
    [onSelectRole, selectedRoleId],
  );

  return (
    <Paper sx={{ p: 2 }}>
      <DataTable rows={rows} columns={roleColumns} loading={loading} />
    </Paper>
  );
}
