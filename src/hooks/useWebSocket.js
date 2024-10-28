import { useState, useEffect, useRef } from 'react';

const useWebSocket = (symbol, interval) => {
  const [data, setData] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setData(formatCandlestick(message));
    };

    return () => wsRef.current.close();
  }, [symbol, interval]);

  const disconnect = () => wsRef.current && wsRef.current.close();

  return { data, connect: wsRef.current, disconnect };
};

const formatCandlestick = (message) => ({
  time: message.k.t,
  open: parseFloat(message.k.o),
  high: parseFloat(message.k.h),
  low: parseFloat(message.k.l),
  close: parseFloat(message.k.c),
});

export default useWebSocket;
