import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (url) => {
    if (socket) return socket;

    const newSocket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Battle socket connected successfully');
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
