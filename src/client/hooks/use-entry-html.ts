import type { MdEntry } from "@md-meta-view/core";
import { useEffect, useState } from "react";

const isApi = window.__MD_META_VIEW_MODE__ === "api";
const base = import.meta.env.BASE_URL;

async function fetchFromApi(id: string): Promise<MdEntry | null> {
  const res = await fetch(`/api/entries/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchFromStatic(id: string): Promise<MdEntry | null> {
  const res = await fetch(`${base}entries/${encodeURIComponent(id)}.json`);
  if (!res.ok) return null;
  return res.json();
}

const fetchEntry = isApi ? fetchFromApi : fetchFromStatic;

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

    fetchEntry(id)
      .then((data) => {
        if (!cancelled) setEntry(data);
      })
      .catch(() => {
        if (!cancelled) setEntry(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { entry, loading };
}
