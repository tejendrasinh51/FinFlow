import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useWebSocket({ onMessage, onOpen, onClose }: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectInterval = 30000;

  const connect = useCallback(async () => {
    try {
      // 1. Fetch transient connection token
      const tokenRes = await fetch('/api/auth/token');
      if (!tokenRes.ok) {
        throw new Error('Failed to fetch transient WebSocket authentication token.');
      }
      const tokenData = await tokenRes.json();
      if (!tokenData.success || !tokenData.token) {
        throw new Error('WebSocket token request was unauthenticated.');
      }

      // 2. Fetch target WebSocket address
      const wsGatewayRes = await fetch('/api/ws');
      if (!wsGatewayRes.ok) {
        throw new Error('Failed to resolve target WebSocket address.');
      }
      const wsGatewayData = await wsGatewayRes.json();
      const wsBaseUrl = wsGatewayData.url;

      // 3. Connect to Server
      const finalWsUrl = `${wsBaseUrl}?token=${tokenData.token}`;
      
      if (wsRef.current) {
        wsRef.current.close();
      }

      const socket = new WebSocket(finalWsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket stream connection established.');
        setConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0; // Reset reconnect counter
        if (onOpen) onOpen();
      };

      socket.onmessage = (event) => {
        if (onMessage) onMessage(event);
      };

      socket.onclose = () => {
        setConnected(false);
        if (onClose) onClose();
        
        // Handle automatic reconnection
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptRef.current),
          maxReconnectInterval
        );
        reconnectAttemptRef.current += 1;
        
        console.warn(`WebSocket connection closed. Reconnecting in ${delay}ms...`);
        setTimeout(() => {
          connect();
        }, delay);
      };

      socket.onerror = (err) => {
        console.error('WebSocket connection encountered an error:', err);
        setError(err);
      };

    } catch (err: any) {
      console.error('Failed to initialize WebSocket connection:', err.message);
      // Wait and attempt reconnection
      setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [onMessage, onOpen, onClose]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        // Clear listeners to prevent state leaks on unmount
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('Cannot send message. WebSocket is not open.');
    }
  }, []);

  return {
    connected,
    error,
    sendMessage,
  };
}
