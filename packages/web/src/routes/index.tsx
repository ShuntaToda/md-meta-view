import type { MdEntry } from "@md-meta-view/core";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { DataTable, type TableState } from "@/components/data-table";
import { MarkdownView } from "@/components/markdown-view";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMdData } from "@/hooks/use-md-data";
import {
  buildShareUrl,
  searchParamsToTableState,
  tableStateToSearchParams,
} from "@/lib/search-params";

export function IndexPage() {
  const { data } = useMdData();
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [copied, setCopied] = useState(false);

  const tableState = useMemo(() => searchParamsToTableState(search), [search]);
  const [selectedId, setSelectedId] = useState<string | null>(
    search.file ?? null,
  );
  const selected = useMemo(() => {
    if (!selectedId || !data) return null;
    return (
      data.entries.find(
        (e) => e.id === selectedId || e.relativePath === selectedId,
      ) ?? null
    );
  }, [selectedId, data]);

  const handleTableStateChange = useCallback(
    (state: TableState) => {
      const params = tableStateToSearchParams(state);
      navigate({
        to: "/",
        search: (prev) => ({
          file: prev.file,
          sort: params.sort,
          filter: params.filter,
          q: params.q,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleCopyShareLink = useCallback(async () => {
    const params = tableStateToSearchParams(tableState);
    const url = buildShareUrl(params);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tableState]);

  if (!data || data.entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No markdown files found.</p>
      </div>
    );
  }

  const handleSelect = (entry: MdEntry) => {
    setSelectedId(entry.id);
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, file: entry.id }),
      replace: true,
    });
  };

  const handleClose = () => {
    setSelectedId(null);
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, file: undefined }),
      replace: true,
    });
  };

  const hasFilters =
    tableState.sorting.length > 0 ||
    tableState.columnFilters.length > 0 ||
    tableState.globalFilter !== "";

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={selected ? 50 : 100} minSize={30}>
        <div className="h-full overflow-auto p-4">
          {hasFilters && (
            <div className="mb-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyShareLink}
              >
                {copied ? "Copied!" : "Share View"}
              </Button>
            </div>
          )}
          <DataTable
            entries={data.entries}
            keys={data.keys}
            onSelect={handleSelect}
            selectedId={selected?.id}
            tableState={tableState}
            onTableStateChange={handleTableStateChange}
          />
        </div>
      </ResizablePanel>
      {selected && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full overflow-auto p-4">
              <MarkdownView entry={selected} onClose={handleClose} />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
