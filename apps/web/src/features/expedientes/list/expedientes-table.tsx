import {
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import type { EstadoExpediente, ExpedienteItem } from '../../../lib/contracts';
import { DataTable } from '../../../ui/components';
import { EstadoChip } from '../estado-chip';

const ESTADO_OPTIONS: { value: EstadoExpediente; label: string }[] = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'EN_TRAMITE', label: 'En trámite' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'ARCHIVADO', label: 'Archivado' },
];

interface ExpedientesTableProps {
  rows: ExpedienteItem[];
  loading: boolean;
  canUpdate: boolean;
  canChangeState: boolean;
  onViewDetail: (expediente: ExpedienteItem) => void;
  onEdit: (expediente: ExpedienteItem) => void;
  onChangeState: (expedienteId: string, estado: EstadoExpediente) => void;
}

export function ExpedientesTable({
  rows,
  loading,
  canUpdate,
  canChangeState,
  onViewDetail,
  onEdit,
  onChangeState,
}: ExpedientesTableProps) {
  const columns = useMemo<GridColDef<ExpedienteItem>[]>(() => {
    const base: GridColDef<ExpedienteItem>[] = [
      { field: 'codigo', headerName: 'Código', flex: 1, minWidth: 140 },
      { field: 'caratula', headerName: 'Carátula', flex: 2, minWidth: 200 },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 140,
        renderCell: ({ row }) => <EstadoChip estado={row.estado} />,
      },
      {
        field: 'fechaApertura',
        headerName: 'Fecha apertura',
        width: 140,
        valueFormatter: (value: string) => new Date(value).toLocaleDateString('es-BO'),
      },
    ];

    const stateColumn = canChangeState
      ? [
          {
            field: '_cambioEstado' as const,
            headerName: 'Cambio de estado',
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: ({ row }: { row: ExpedienteItem }) => (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={row.estado}
                  onChange={(event) =>
                    onChangeState(row.id, event.target.value as EstadoExpediente)
                  }
                  size="small"
                >
                  {ESTADO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
          } satisfies GridColDef<ExpedienteItem>,
        ]
      : [];

    return [
      ...base,
      ...stateColumn,
      {
        field: '_acciones',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Ver detalle">
              <IconButton size="small" onClick={() => onViewDetail(row)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canUpdate ? (
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ),
      },
    ];
  }, [canChangeState, canUpdate, onChangeState, onEdit, onViewDetail]);

  return <DataTable rows={rows} columns={columns} loading={loading} />;
}
