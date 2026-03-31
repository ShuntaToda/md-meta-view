import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { TableState } from "@/components/data-table";

export interface SearchParams {
  sort?: string;
  filter?: string;
  q?: string;
  file?: string;
}

export function searchParamsToTableState(search: SearchParams): TableState {
  const sorting: SortingState = [];
  if (search.sort) {
    for (const part of search.sort.split(",")) {
      const [id, dir] = part.split(":");
      if (id) {
        sorting.push({ id, desc: dir === "desc" });
      }
    }
  }

  const columnFilters: ColumnFiltersState = [];
  if (search.filter) {
    for (const part of search.filter.split(",")) {
      const colonIdx = part.indexOf(":");
      if (colonIdx > 0) {
        const id = part.slice(0, colonIdx);
        const value = part.slice(colonIdx + 1);
        columnFilters.push({ id, value });
      }
    }
  }

  return {
    sorting,
    columnFilters,
    globalFilter: search.q ?? "",
  };
}

export function tableStateToSearchParams(state: TableState): SearchParams {
  const params: SearchParams = {};

  if (state.sorting.length > 0) {
    params.sort = state.sorting
      .map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`)
      .join(",");
  }

  if (state.columnFilters.length > 0) {
    params.filter = state.columnFilters
      .map((f) => `${f.id}:${f.value}`)
      .join(",");
  }

  if (state.globalFilter) {
    params.q = state.globalFilter;
  }

  return params;
}

export function buildShareUrl(
  search: SearchParams,
  origin = window.location.origin,
): string {
  const url = new URL(`${origin}/`);
  if (search.sort) url.searchParams.set("sort", search.sort);
  if (search.filter) url.searchParams.set("filter", search.filter);
  if (search.q) url.searchParams.set("q", search.q);
  return url.toString();
}
