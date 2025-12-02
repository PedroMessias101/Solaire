// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../constants/api";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WS conectado");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      console.log("WS mensagem:", event.data);
      setMessage(JSON.parse(event.data));
    };

    ws.current.onerror = (error) => {
      console.log("WS erro:", error);
    };

    ws.current.onclose = () => {
      console.log("WS desconectado — tentando reconectar...");
      setConnected(false);

      setTimeout(() => {
        useWebSocket();
      }, 2000);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  return { message, connected };
}
