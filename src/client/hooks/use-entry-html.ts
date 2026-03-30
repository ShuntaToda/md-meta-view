import type { MdEntry } from "@md-meta-view/core";
import { useEffect, useState } from "react";

export function useEntryHtml(id: string | null) {
  const [entry, setEntry] = useState<MdEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchEntry = async () => {
      try {
        // Try API first (dev mode)
        const res = await fetch(`/api/entries/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEntry(data);
          return;
        }
      } catch {
        // Fall through to static
      }

      try {
        // Static build fallback
        const res = await fetch(`/entries/${encodeURIComponent(id)}.json`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEntry(data);
          return;
        }
      } catch {
        // Not found
      }

      if (!cancelled) setEntry(null);
    };

    fetchEntry().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { entry, loading };
}
