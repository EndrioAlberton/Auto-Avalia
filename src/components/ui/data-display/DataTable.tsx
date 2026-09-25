import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { EmptyState } from './EmptyState';
import InboxIcon from '@mui/icons-material/Inbox';
import { colors } from '../tokens';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null | undefined;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  rowsPerPage?: number;
}

type SortState = { key: string; dir: 'asc' | 'desc' };

export function DataTable<T extends object>({ columns, rows, loading, emptyState, rowsPerPage: rpp = 10 }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rpp);
  const [sort, setSort] = useState<SortState | null>(null);

  const getSortValue = (col: Column<T>, row: T) =>
    col.sortValue ? col.sortValue(row) : (row as Record<string, unknown>)[col.key] as string | number | null | undefined;

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getSortValue(col, a);
      const vb = getSortValue(col, b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string' || typeof vb === 'string') return String(va).localeCompare(String(vb)) * dir;
      return (va - vb) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null;
    });
    setPage(0);
  };

  const displayRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'} style={{ width: col.width }}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort?.key === col.key}
                      direction={sort?.key === col.key ? sort.dir : 'asc'}
                      onClick={() => handleSort(col)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <MuiSkeleton variant="text" sx={{ bgcolor: colors.surface2 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : displayRows.length > 0
              ? displayRows.map((row, i) => (
                  <TableRow key={i} sx={{ '&:hover': { background: colors.surface2 } }}>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align ?? 'left'}>
                        {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && rows.length === 0 && (
        <Box>
          {emptyState ?? (
            <EmptyState
              icon={<InboxIcon />}
              title="Nenhum registro encontrado"
              body="Não há dados para exibir no momento."
            />
          )}
        </Box>
      )}

      {rows.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Por página:"
          sx={{ color: colors.inkSubtle, borderTop: `1px solid ${colors.hairline}` }}
        />
      )}
    </Box>
  );
}
