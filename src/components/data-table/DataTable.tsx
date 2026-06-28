import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalItems?: number;
  page?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  getRowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  totalItems = 0,
  page = 1,
  itemsPerPage = 30,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  getRowKey,
  onRowClick,
  actions,
  emptyTitle = 'Aucun résultat',
  emptyDescription = 'Aucun élément ne correspond à votre recherche.',
  className,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const from = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const to = Math.min(page * itemsPerPage, totalItems);

  function handleSort(col: Column<T>) {
    if (!col.sortable || !onSort) return;
    const newDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newDir);
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold font-lexend text-gray-600 uppercase tracking-wide whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-900',
                    col.headerClassName
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUp
                          className={cn('h-3 w-3', sortKey === col.key && sortDir === 'asc' ? 'text-gray-900' : 'text-gray-300')}
                        />
                        <ChevronDown
                          className={cn('h-3 w-3 -mt-1', sortKey === col.key && sortDir === 'desc' ? 'text-gray-900' : 'text-gray-300')}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold font-lexend text-gray-600 uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <TableSkeleton rows={5} cols={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <EmptyState
                    icon={<Inbox className="h-8 w-8" />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={getRowKey ? getRowKey(row) : i}
                  className={cn(
                    'hover:bg-gray-50/70 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm font-poppins text-gray-700 whitespace-nowrap',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-poppins">
            {from}–{to} sur {totalItems} résultats
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange?.(1)}
              disabled={page <= 1}
              icon={<ChevronsLeft className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <span className="text-xs text-gray-600 font-poppins px-2">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              icon={<ChevronRight className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange?.(totalPages)}
              disabled={page >= totalPages}
              icon={<ChevronsRight className="h-4 w-4" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
