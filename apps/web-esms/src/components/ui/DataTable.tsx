import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Skeleton } from './Skeleton';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  skeletonRowCount?: number;
  selectedRowId?: string | number;
  getRowId?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pagination?: {
    page: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    onLimitChange?: (newLimit: number) => void;
  };
  className?: string;

  // Row selection for Export / Actions
  selectable?: boolean;
  selectedRowIds?: Set<string | number>;
  onSelectRow?: (rowId: string | number, row: T) => void;
  onSelectAll?: (selectAll: boolean) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRowCount = 6,
  selectedRowId,
  getRowId,
  onRowClick,
  emptyMessage = 'No records found',
  pagination,
  className = '',
  selectable = false,
  selectedRowIds,
  onSelectRow,
  onSelectAll
}: DataTableProps<T>) {
  const startItem = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  return (
    <Box className={`w-full ${className}`}>
      <TableContainer sx={{ overflowX: 'auto', backgroundColor: '#ffffff' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fcfcfd' }}>
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    pl: 2.5,
                    py: 1.5,
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={
                      data.length > 0 &&
                      data.every((row, rIdx) => {
                        const id = getRowId ? getRowId(row) : (row as any).id || rIdx;
                        return selectedRowIds?.has(id);
                      })
                    }
                    indeterminate={
                      data.length > 0 &&
                      data.some((row, rIdx) => {
                        const id = getRowId ? getRowId(row) : (row as any).id || rIdx;
                        return selectedRowIds?.has(id);
                      }) &&
                      !data.every((row, rIdx) => {
                        const id = getRowId ? getRowId(row) : (row as any).id || rIdx;
                        return selectedRowIds?.has(id);
                      })
                    }
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    sx={{
                      p: 0.5,
                      color: '#94a3b8',
                      '&.Mui-checked': { color: '#4f46e5' },
                      '&.MuiCheckbox-indeterminate': { color: '#4f46e5' }
                    }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    width: col.width,
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #f1f5f9',
                    py: 1.75
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            {isLoading && data.length === 0 ? (
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <TableRow key={rIdx}>
                  {selectable && (
                    <TableCell sx={{ width: 48, pl: 2.5, py: 2 }}>
                      <Skeleton height={18} width={18} borderRadius="4px" />
                    </TableCell>
                  )}
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align || 'left'} sx={{ py: 2 }}>
                      <Skeleton height={20} width={cIdx === 0 ? '60%' : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                  <Typography variant="body2">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rIdx) => {
                const rowId = getRowId ? getRowId(row) : (row as any).id || rIdx;
                const isSelected = selectedRowId !== undefined && selectedRowId === rowId;
                const isChecked = selectedRowIds?.has(rowId) || false;

                return (
                  <TableRow
                    key={rowId}
                    hover={!!onRowClick}
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected ? '#eeeffe' : isChecked ? '#f8faff' : 'inherit',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: isSelected ? '#eeeffe' : '#f8fafc' },
                      '&:last-child td': { borderBottom: pagination ? '1px solid #f1f5f9' : 'none' }
                    }}
                  >
                    {selectable && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          width: 48,
                          pl: 2.5,
                          py: 1.5,
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => onSelectRow && onSelectRow(rowId, row)}
                          sx={{
                            p: 0.5,
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#4f46e5' }
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        sx={{
                          py: 1.75,
                          fontSize: '0.875rem',
                          color: '#0f172a',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {pagination && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            px: 2.5,
            py: 2,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            borderRadius: '0 0 16px 16px'
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            {/* Left: showing X–Y of Z */}
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
              <Box component="span" sx={{ fontWeight: 500, color: '#334155' }}>Showing </Box>
              {startItem.toLocaleString()}–{endItem.toLocaleString()} of {pagination.total.toLocaleString()}
            </Typography>

            {/* Center: rows-per-page selector */}
            {pagination.onLimitChange && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  Rows per page
                </Typography>
                <MuiSelect<number>
                  size="small"
                  value={pagination.limit}
                  onChange={(e) => {
                    pagination.onLimitChange!(Number(e.target.value));
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                    slotProps: {
                      paper: {
                        sx: {
                          borderRadius: '10px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          maxHeight: 240,
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          '&::-webkit-scrollbar': { display: 'none' },
                          '& .MuiList-root': {
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': { display: 'none' }
                          }
                        }
                      }
                    }
                  }}
                  sx={{
                    fontSize: '0.8125rem',
                    borderRadius: '10px',
                    height: 32,
                    '& .MuiSelect-select': { py: '4px', px: '10px' },
                    '& fieldset': { borderColor: '#e2e8f0' }
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <MenuItem key={n} value={n} sx={{ fontSize: '0.8125rem' }}>
                      {n}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </Box>
            )}
          </Box>

          {/* Right: Previous / Next buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <Typography variant="caption" sx={{ color: '#64748b', minWidth: 60, textAlign: 'center' }}>
              {pagination.page} / {totalPages}
            </Typography>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || isLoading}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
