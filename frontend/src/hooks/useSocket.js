import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

export function useSocket() {
  const [materials, setMaterials] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [flashMap, setFlashMap] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('initial_data', (data) => {
      setMaterials(data.materials);
      setForecasts(data.forecasts);
      setSummary(data.summary);
      setLastUpdate(new Date(data.timestamp));
    });

    socket.on('price_update', ({ updates, timestamp }) => {
      setLastUpdate(new Date(timestamp));
      const newFlash = {};

      setMaterials((prev) =>
        prev.map((m) => {
          const u = updates.find((x) => x.id === m.id);
          if (!u) return m;
          newFlash[m.id] = u.changeAmount >= 0 ? 'up' : 'down';
          return {
            ...m,
            currentPrice: u.currentPrice,
            previousPrice: u.previousPrice,
            changeAmount: u.changeAmount,
            changePercent: u.changePercent,
            lastUpdated: u.lastUpdated,
          };
        })
      );

      setFlashMap(newFlash);
      setTimeout(() => setFlashMap({}), 1100);

      // Recompute summary client-side approximation
      setSummary((prev) => {
        if (!prev) return prev;
        return { ...prev, lastUpdated: timestamp };
      });
    });

    socket.on('forecast_update', ({ forecasts: newForecasts }) => {
      setForecasts(newForecasts);
    });

    return () => socket.disconnect();
  }, []);

  return { materials, forecasts, summary, connected, lastUpdate, flashMap };
}
