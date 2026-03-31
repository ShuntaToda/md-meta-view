import type { MdEntryMeta } from "@md-meta-view/core";
import { useCallback, useMemo, useState } from "react";
import { DataTable, type TableState } from "@/components/data-table";
import { MarkdownView } from "@/components/markdown-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEntryHtml } from "@/hooks/use-entry-html";
import { useMdData } from "@/hooks/use-md-data";
import { useTheme } from "@/hooks/use-theme";
import {
  buildShareUrl,
  searchParamsToTableState,
  tableStateToSearchParams,
} from "@/lib/search-params";

function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    sort: params.get("sort") || undefined,
    filter: params.get("filter") || undefined,
    q: params.get("q") || undefined,
    file: params.get("file") || undefined,
  };
}

function setSearchParams(params: Record<string, string | undefined>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  }
  window.history.replaceState(null, "", url.toString());
}

export default function App() {
  useTheme();
  const { data, loading } = useMdData();
  const [copiedShare, setCopiedShare] = useState(false);

  const initialSearch = useMemo(() => getSearchParams(), []);
  const tableState = useMemo(
    () => searchParamsToTableState(initialSearch),
    [initialSearch],
  );
  const [currentTableState, setCurrentTableState] =
    useState<TableState>(tableState);

  const [selectedId, setSelectedId] = useState<string | null>(
    initialSearch.file ?? null,
  );

  const selectedMeta = useMemo(() => {
    if (!selectedId || !data) return null;
    return (
      data.entries.find(
        (e) => e.id === selectedId || e.relativePath === selectedId,
      ) ?? null
    );
  }, [selectedId, data]);

  const { entry: selectedEntry, loading: entryLoading } = useEntryHtml(
    selectedMeta?.id ?? null,
  );

  const handleTableStateChange = useCallback((state: TableState) => {
    setCurrentTableState(state);
    const params = tableStateToSearchParams(state);
    setSearchParams({ sort: params.sort, filter: params.filter, q: params.q });
  }, []);

  const handleSelect = useCallback((entry: MdEntryMeta) => {
    setSelectedId(entry.id);
    setSearchParams({ file: entry.id });
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setSearchParams({ file: undefined });
  }, []);

  const handleCopyShareLink = useCallback(async () => {
    const params = tableStateToSearchParams(currentTableState);
    const url = buildShareUrl(params);
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }, [currentTableState]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No markdown files found.</p>
      </div>
    );
  }

  const hasFilters =
    currentTableState.sorting.length > 0 ||
    currentTableState.columnFilters.length > 0 ||
    currentTableState.globalFilter !== "";

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b px-4 py-3 shrink-0 flex items-center justify-between">
        <h1 className="text-lg font-bold">md-meta-view</h1>
        <ThemeToggle />
      </header>
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={selectedId ? 50 : 100} minSize={30}>
          <div className="h-full overflow-auto p-4">
            {hasFilters && (
              <div className="mb-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareLink}
                >
                  {copiedShare ? "Copied!" : "Share View"}
                </Button>
              </div>
            )}
            <DataTable
              entries={data.entries}
              keys={data.keys}
              onSelect={handleSelect}
              selectedId={selectedMeta?.id}
              tableState={currentTableState}
              onTableStateChange={handleTableStateChange}
            />
          </div>
        </ResizablePanel>
        {selectedId && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full overflow-auto p-4">
                {entryLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : selectedEntry ? (
                  <MarkdownView entry={selectedEntry} onClose={handleClose} />
                ) : (
                  <p className="text-muted-foreground">Entry not found.</p>
                )}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
