import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Extra classes applied to both header and body cells (e.g. text alignment). */
    className?: string;
  }
}
import { cn } from "@/shared/lib/cn";
import { count } from "@/shared/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "./button";
import { Checkbox } from "./checkbox";

/** "actions" → "Actions", "__select" → "Select" — a readable sr-only header label. */
function humanizeColumnId(id: string): string {
  const cleaned = id.replace(/^__/, "").replace(/[-_]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Column";
}

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
}

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Rendered above the table (status tabs · search · segmented control). */
  toolbar?: ReactNode;
  /**
   * Controlled sorting. When provided with `manualSorting`, the table reflects
   * the state and reports changes but does not sort client-side (the server
   * returns pre-sorted rows). Omit for internal client-side sorting.
   */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  /** Server-side pagination footer. Omit for no pagination. */
  pagination?: DataTablePagination;
  /** Opt-in row selection: renders a leading checkbox column (Session 8 bulk actions). */
  enableRowSelection?: boolean;
  getRowId?: (row: T) => string;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
}

/**
 * The reusable table workhorse (plan §8). TanStack core with sortable headers,
 * custom cell renderers, a toolbar slot, server-ready pagination, and designed
 * loading/empty/error slots. URL-synced state is supplied by the caller (see
 * `useTableUrlState`) so the table stays presentational and reusable — the
 * Session 3 rules list and logs reuse it unchanged.
 */
export function DataTable<T>({
  columns,
  data,
  loading,
  skeletonRows = 6,
  empty,
  onRowClick,
  toolbar,
  sorting,
  onSortingChange,
  manualSorting,
  pagination,
  enableRowSelection,
  getRowId,
  selectedIds,
  onSelectedIdsChange,
}: DataTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const controlled = sorting !== undefined;

  const selectionOn = Boolean(enableRowSelection && getRowId && onSelectedIdsChange);
  const selected = new Set(selectedIds ?? []);
  const pageIds = selectionOn ? data.map((r) => getRowId!(r)) : [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id));

  const toggleAll = () => {
    if (!onSelectedIdsChange) return;
    if (allSelected) {
      onSelectedIdsChange((selectedIds ?? []).filter((id) => !pageIds.includes(id)));
    } else {
      onSelectedIdsChange(Array.from(new Set([...(selectedIds ?? []), ...pageIds])));
    }
  };
  const toggleRow = (id: string) => {
    if (!onSelectedIdsChange) return;
    onSelectedIdsChange(
      selected.has(id) ? (selectedIds ?? []).filter((x) => x !== id) : [...(selectedIds ?? []), id],
    );
  };

  const selectColumn: ColumnDef<T, unknown> = {
    id: "__select",
    enableSorting: false,
    meta: { className: "w-10" },
    header: () => (
      <span className="flex items-center">
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={toggleAll}
          aria-label="Select all rows"
        />
      </span>
    ),
    cell: ({ row }) => {
      const id = getRowId!(row.original);
      return (
        <span className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(id)}
            onCheckedChange={() => toggleRow(id)}
            aria-label="Select row"
          />
        </span>
      );
    },
  };

  const effectiveColumns = selectionOn ? [selectColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    state: { sorting: controlled ? sorting : internalSorting },
    onSortingChange: controlled ? onSortingChange : setInternalSorting,
    manualSorting: controlled ? manualSorting : false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  });

  return (
    <div className="flex flex-col">
      {toolbar}
      {loading ? (
        <SkeletonTable columns={columns} rows={skeletonRows} />
      ) : !data.length ? (
        <div className="py-2">{empty ?? <EmptyState compact title="Nothing here yet" />}</div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  // Display columns (row actions, etc.) often render no header text,
                  // which makes axe treat that column's cells as header-less. Give
                  // such a header an sr-only label from its id so every <td> stays
                  // associated with a named <th> (WCAG 1.3.1 / td-has-header).
                  const headerDef = header.column.columnDef.header;
                  const emptyHeader =
                    !header.isPlaceholder && (headerDef === "" || headerDef == null);
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.columnDef.meta?.className)}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : emptyHeader ? (
                        <span className="sr-only">{humanizeColumnId(header.column.id)}</span>
                      ) : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-text-secondary focus-visible:text-text-primary focus-visible:outline-none"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ChevronUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {pagination && !loading ? <PaginationBar pagination={pagination} rows={data.length} /> : null}
    </div>
  );
}

function SkeletonTable<T>({ columns, rows }: { columns: ColumnDef<T, unknown>[]; rows: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((_c, i) => (
            <TableHead key={i}>
              <Skeleton className="h-3 w-16" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {columns.map((_c, c) => (
              <TableCell key={c}>
                <Skeleton className="h-4 w-full max-w-[120px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PaginationBar({ pagination, rows }: { pagination: DataTablePagination; rows: number }) {
  const { pageIndex, pageSize, total, onPageChange } = pagination;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = pageIndex * pageSize + rows;
  return (
    <div className="flex items-center justify-between border-t border-hairline px-1 pt-3 text-xs text-text-tertiary">
      <span className="tabular-nums">
        {count(from)}–{count(to)} of {count(total)}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 0}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Prev
        </Button>
        <span className="px-1.5 tabular-nums">
          {pageIndex + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex + 1 >= pageCount}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
