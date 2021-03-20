import { useEffect, useRef, useState } from "react";

export function useWebSocket(callback: (data: string) => void, url: string) {
  const [connectTime, setConnectTime] = useState<Date | undefined>();
  const [disconnectTime, setDisconnectTime] = useState<Date | undefined>();
  const connected = useRef(false);
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const [ws, setWs] = useState<WebSocket | undefined>();

  function connect() {
    console.log("Attempting reconnect");
    connected.current = false;
    const ws = new WebSocket(url);
    ws.onopen = () => {
      connected.current = true;
      setConnectTime(new Date());
      setDisconnectTime(undefined);
    };
    ws.onclose = () => {
      if (connected.current) {
        setDisconnectTime(new Date());
      }
      connected.current = false;
      setConnectTime(undefined);
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
  return { connectTime, disconnectTime, connected: connected.current };
}
