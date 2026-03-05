import { Box } from '@mui/material';
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
} from '@mui/x-data-grid';

interface DataTableProps<R extends GridValidRowModel> {
  rows: R[];
  columns: GridColDef<R>[];
  loading?: boolean;
  pageSizeOptions?: number[];
  autoHeight?: boolean;
  disableRowSelectionOnClick?: boolean;
  getRowId?: DataGridProps<R>['getRowId'];
}

export function DataTable<R extends GridValidRowModel>({
  rows,
  columns,
  loading = false,
  pageSizeOptions = [10, 25, 50],
  autoHeight = true,
  disableRowSelectionOnClick = true,
  getRowId,
}: DataTableProps<R>) {
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        autoHeight={autoHeight}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        getRowId={getRowId}
        density="standard"
      />
    </Box>
  );
}
