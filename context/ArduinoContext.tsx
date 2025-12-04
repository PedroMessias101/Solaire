import { createContext, useContext, useState } from "react";

interface RealtimeData {
  panelId: number;
  temperatura: number;
  corrente: number;
  tensao: number;
  potencia: number;
}

const ArduinoContext = createContext<{
  realtime: RealtimeData | null;
  setRealtime: (data: RealtimeData) => void;
}>({
  realtime: null,
  setRealtime: () => {},
});

export const ArduinoProvider = ({ children }: any) => {
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);

  return (
    <ArduinoContext.Provider value={{ realtime, setRealtime }}>
      {children}
    </ArduinoContext.Provider>
  );
};

export const useArduino = () => useContext(ArduinoContext);
