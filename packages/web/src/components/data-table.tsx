import type { MdEntry } from "@md-meta-view/core";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ColumnFilter } from "@/components/column-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}

interface DataTableProps {
  entries: MdEntry[];
  keys: string[];
  onSelect: (entry: MdEntry) => void;
  selectedId?: string;
  tableState?: TableState;
  onTableStateChange?: (state: TableState) => void;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function DataTable({
  entries,
  keys,
  onSelect,
  selectedId,
  tableState,
  onTableStateChange,
}: DataTableProps) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const sorting = tableState?.sorting ?? internalSorting;
  const columnFilters = tableState?.columnFilters ?? internalColumnFilters;
  const globalFilter = tableState?.globalFilter ?? internalGlobalFilter;

  const updateState = (partial: Partial<TableState>) => {
    const next = { sorting, columnFilters, globalFilter, ...partial };
    if (onTableStateChange) {
      onTableStateChange(next);
    } else {
      if (partial.sorting !== undefined) setInternalSorting(partial.sorting);
      if (partial.columnFilters !== undefined)
        setInternalColumnFilters(partial.columnFilters);
      if (partial.globalFilter !== undefined)
        setInternalGlobalFilter(partial.globalFilter);
    }
  };

  const columns = useMemo<ColumnDef<MdEntry>[]>(() => {
    const cols: ColumnDef<MdEntry>[] = [
      {
        accessorKey: "relativePath",
        header: "File",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.relativePath}</span>
        ),
      },
    ];

    for (const key of keys) {
      cols.push({
        id: `fm_${key}`,
        accessorFn: (row) => row.frontmatter[key],
        header: key,
        cell: ({ getValue }) => {
          const value = getValue();
          const str = formatCellValue(value);
          if (str.length > 60) {
            return (
              <span className="text-xs" title={str}>
                {str.slice(0, 60)}...
              </span>
            );
          }
          return <span className="text-xs">{str}</span>;
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue = formatCellValue(row.getValue(columnId));
          return cellValue.toLowerCase().includes(filterValue.toLowerCase());
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = formatCellValue(rowA.getValue(columnId));
          const b = formatCellValue(rowB.getValue(columnId));
          return a.localeCompare(b, "ja");
        },
      });
    }

    return cols;
  }, [keys]);

  const table = useReactTable({
    data: entries,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      updateState({ sorting: next });
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnFilters) : updater;
      updateState({ columnFilters: next });
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (value) => {
      updateState({ globalFilter: value });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiSort: true,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(e) => updateState({ globalFilter: e.target.value })}
          className="max-w-xs h-8 text-sm"
        />

        {/* Column visibility toggle */}
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" size="sm" className="h-8">
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Toggle columns
            </p>
            <div className="space-y-1">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={(e) => col.toggleVisibility(e.target.checked)}
                      className="rounded"
                    />
                    {col.id.replace("fm_", "")}
                  </label>
                ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              updateState({ columnFilters: [], globalFilter: "" });
            }}
          >
            Clear filters
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFilterCount}
            </Badge>
          </Button>
        )}

        {/* Sort indicator */}
        {sorting.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Sort:</span>
            {sorting.map((sort) => (
              <Badge
                key={sort.id}
                variant="outline"
                className="text-xs cursor-pointer"
                onClick={() => {
                  updateState({
                    sorting: sorting.filter((s) => s.id !== sort.id),
                  });
                }}
              >
                {sort.id.replace("fm_", "")} {sort.desc ? "↓" : "↑"} ✕
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Active column filters */}
      {columnFilters.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {columnFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={() => {
                updateState({
                  columnFilters: columnFilters.filter(
                    (f) => f.id !== filter.id,
                  ),
                });
              }}
            >
              {filter.id.replace("fm_", "")}: {String(filter.value)} ✕
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="p-0">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-2 text-left hover:bg-muted/50 flex-1 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                      {header.column.getCanFilter() && (
                        <Popover>
                          <PopoverTrigger>
                            <button
                              type="button"
                              className={`px-1.5 py-2 hover:bg-muted/50 cursor-pointer ${
                                header.column.getFilterValue()
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              ▼
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-60 p-3" align="start">
                            <ColumnFilter column={header.column} />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    row.original.id === selectedId ? "bg-muted" : ""
                  }`}
                  onClick={() => onSelect(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {entries.length} file(s)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
