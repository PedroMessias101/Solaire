<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../constants/api";
 
=======
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../constants/api";

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<any>(null);
  const [connected, setConnected] = useState(false);
<<<<<<< HEAD
 
  useEffect(() => {
    ws.current = new WebSocket(WS_URL);
 
=======

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
    ws.current.onopen = () => {
      console.log("WS conectado");
      setConnected(true);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
    ws.current.onmessage = (event) => {
      console.log("WS mensagem:", event.data);
      setMessage(JSON.parse(event.data));
    };
<<<<<<< HEAD
 
    ws.current.onerror = (error) => {
      console.log("WS erro:", error);
    };
 
    ws.current.onclose = () => {
      console.log("WS desconectado — tentando reconectar...");
      setConnected(false);
 
=======

    ws.current.onerror = (error) => {
      console.log("WS erro:", error);
    };

    ws.current.onclose = () => {
      console.log("WS desconectado — tentando reconectar...");
      setConnected(false);

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
      setTimeout(() => {
        useWebSocket();
      }, 2000);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
    return () => {
      ws.current?.close();
    };
  }, []);
<<<<<<< HEAD
 
  return { message, connected };
}
=======

  return { message, connected };
}
>>>>>>> 45a7f2fbca08a32445235bff760a1648d334cf9b
