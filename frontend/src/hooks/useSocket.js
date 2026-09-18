import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (url) => {
    if (socket) return socket;

    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Battle socket connected successfully');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Battle socket connect error (retrying):', err.message || err);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Battle socket disconnected');
    });

    setSocket(newSocket);
    return newSocket;
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    connect,
    disconnect
  };
}

export default useSocket;
