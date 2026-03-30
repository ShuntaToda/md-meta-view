import type { MdData } from "@md-meta-view/core";
import { useCallback, useEffect, useState } from "react";

export function useMdData() {
  const [data, setData] = useState<MdData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const staticRes = await fetch("/data.json");
        if (staticRes.ok) {
          const json = await staticRes.json();
          setData(json);
        }
      }
    } catch {
      try {
        const staticRes = await fetch("/data.json");
        if (staticRes.ok) {
          const json = await staticRes.json();
          setData(json);
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
