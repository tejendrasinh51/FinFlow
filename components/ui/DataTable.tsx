'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
}

type SortDir = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  emptyMessage = 'No data found.',
  className,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [query, setQuery]       = useState('')
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>(null)
  const [page, setPage]         = useState(1)

  // Filter
  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    )
  }, [data, query])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc') }
    else if (sortDir === 'asc') setSortDir('desc')
    else { setSortKey(null); setSortDir(null) }
    setPage(1)
  }

  const SortIcon = ({ col }: { col: Column<T> }) => {
    const key = String(col.key)
    if (!col.sortable) return null
    if (sortKey !== key) return <ArrowUpDown size={12} className="text-text-tertiary" />
    if (sortDir === 'asc')  return <ArrowUp   size={12} className="text-cyan" />
    if (sortDir === 'desc') return <ArrowDown size={12} className="text-cyan" />
    return <ArrowUpDown size={12} className="text-text-tertiary" />
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-9 py-2 bg-surface border border-[var(--color-border)] rounded-lg text-sm text-text-secondary placeholder:text-text-tertiary font-mono focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-surface">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'data-table-header text-left px-4 py-3 whitespace-nowrap select-none',
                    col.sortable && 'cursor-pointer hover:text-text-secondary transition-colors',
                    col.headerClassName
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
              {actions && <th className="data-table-header text-right px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-text-tertiary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, ri) => (
                <tr
                  key={ri}
                  className={cn(
                    'data-table-row transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={cn('px-4 py-3 text-text-secondary', col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as string] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded flex items-center justify-center border border-[var(--color-border)] text-text-tertiary hover:text-text-secondary disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={cn(
                    'w-7 h-7 rounded border text-xs transition-all',
                    pg === page
                      ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : 'border-[var(--color-border)] text-text-tertiary hover:text-text-secondary'
                  )}
                >
                  {pg}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded flex items-center justify-center border border-[var(--color-border)] text-text-tertiary hover:text-text-secondary disabled:opacity-30 transition-all"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
