import { IconButton, Paper, Stack, TablePagination, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { GridColDef } from '@mui/x-data-grid';
import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import { DataTable } from '../../../ui/components';
import type { AdminUserItem } from '../../../lib/contracts';

interface AdminUsersTableProps {
  rows: AdminUserItem[];
  loading: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  showActions: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenActions: (
    event: MouseEvent<HTMLElement>,
    user: AdminUserItem,
  ) => void;
}

export function AdminUsersTable({
  rows,
  loading,
  total,
  page,
  rowsPerPage,
  showActions,
  onPageChange,
  onRowsPerPageChange,
  onOpenActions,
}: AdminUsersTableProps) {
  const columns = useMemo<GridColDef<AdminUserItem>[]>(() => {
    const base: GridColDef<AdminUserItem>[] = [
      {
        field: 'nombre',
        headerName: 'Nombre',
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'correo',
        headerName: 'Correo',
        flex: 1,
        minWidth: 220,
      },
      {
        field: 'estado',
        headerName: 'Estado',
        minWidth: 120,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={row.estado ? 'success' : 'default'}
            label={row.estado ? 'Activo' : 'Inactivo'}
          />
        ),
      },
      {
        field: 'roles',
        headerName: 'Roles',
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderCell: ({ row }) =>
          row.roles.length > 0
            ? row.roles.map((role) => role.nombre).join(', ')
            : 'Sin roles',
      },
    ];

    if (!showActions) {
      return base;
    }

    return [
      ...base,
      {
        field: 'acciones',
        headerName: 'Acciones',
        minWidth: 80,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <IconButton
            size="small"
            onClick={(event) => onOpenActions(event, row)}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ];
  }, [onOpenActions, showActions]);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <DataTable rows={rows} columns={columns} loading={loading} />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_event, nextPage) => onPageChange(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            onRowsPerPageChange(Number(event.target.value));
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Stack>
    </Paper>
  );
}
