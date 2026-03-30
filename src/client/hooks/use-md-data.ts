import type { MdMeta } from "@md-meta-view/core";
import { useCallback, useEffect, useState } from "react";

async function fetchFromApi(): Promise<MdMeta> {
  const res = await fetch("/api/entries");
  return res.json();
}

async function fetchFromStatic(): Promise<MdMeta> {
  const res = await fetch("/meta.json");
  return res.json();
}

const fetchMeta =
  import.meta.env.MODE === "production" ? fetchFromStatic : fetchFromApi;

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
    if (import.meta.env.MODE === "production") return;

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
