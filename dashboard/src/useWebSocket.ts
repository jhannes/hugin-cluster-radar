import { useEffect, useRef, useState } from "react";

export function useWebSocket(callback: (data: string) => void, url: string) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const [ws, setWs] = useState<WebSocket | undefined>();

  function connect() {
    console.log("Attempting reconnect");
    const ws = new WebSocket(url);
    ws.onopen = () => console.log("ws open");
    ws.onclose = () => {
      setTimeout(connect, 5000);
    };
    ws.onmessage = (e: MessageEvent) => {
      savedCallback.current(e.data);
    };
    setWs(ws);
  }

  useEffect(() => {
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [url]);
}
