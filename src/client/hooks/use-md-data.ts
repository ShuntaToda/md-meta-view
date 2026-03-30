import type { MdMeta } from "@md-meta-view/core";
import { useCallback, useEffect, useState } from "react";

export function useMdData() {
  const [data, setData] = useState<MdMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        setData(await res.json());
      } else {
        const staticRes = await fetch("/meta.json");
        if (staticRes.ok) {
          setData(await staticRes.json());
        }
      }
    } catch {
      try {
        const staticRes = await fetch("/meta.json");
        if (staticRes.ok) {
          setData(await staticRes.json());
        }
      } catch {
        console.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
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
        // Static build mode, no WebSocket
      }
    };

    connectWs();

    return () => {
      ws?.close();
    };
  }, []);

  return { data, loading };
}
