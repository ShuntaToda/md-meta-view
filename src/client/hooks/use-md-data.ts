import type { MdMeta } from "@md-meta-view/core";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    __MD_META_VIEW_MODE__?: "api" | "static";
  }
}

const isApi = window.__MD_META_VIEW_MODE__ === "api";
const base = import.meta.env.BASE_URL;

async function fetchFromApi(): Promise<MdMeta> {
  const res = await fetch("/api/entries");
  return res.json();
}

async function fetchFromStatic(): Promise<MdMeta> {
  const res = await fetch(`${base}meta.json`);
  return res.json();
}

const fetchMeta = isApi ? fetchFromApi : fetchFromStatic;

export function useMdData() {
  const [data, setData] = useState<MdMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setData(await fetchMeta());
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isApi) return;

    let ws: WebSocket | null = null;

    const connectWs = async () => {
      try {
        const res = await fetch("/api/ws-port");
        if (!res.ok) return;
        const { port } = await res.json();
        ws = new WebSocket(`ws://localhost:${port}`);
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "update") {
            setData(message.data);
          }
        };
        ws.onclose = () => {
          setTimeout(connectWs, 2000);
        };
      } catch {
        // No WebSocket available
      }
    };

    connectWs();

    return () => {
      ws?.close();
    };
  }, []);

  return { data, loading };
}
