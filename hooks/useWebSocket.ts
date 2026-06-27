import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';

declare global {
  interface Window {
    __WS_URL__?: string;
  }
}

const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

function nextBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_INITIAL_MS * 2 ** attempt, BACKOFF_MAX_MS);
}

function buildWsUrl(token: string): string {
  // 1. If runtime WS URL was injected by the server
  if (typeof window !== 'undefined' && window.__WS_URL__) {
    const base = window.__WS_URL__;
    return `${base}/ws?token=${token}`;
  }

  // 2. If client environment variable is defined
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return `${wsUrl}/ws?token=${token}`;
  }

  // 3. If absolute API URL is defined
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiUrl.startsWith('http')) {
    const base = apiUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://')
      .replace('/api/v1', '');
    return `${base}/ws?token=${token}`;
  }

  // 4. Local fallback
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = window.location.host;
    
    // If running on a non-standard port (e.g., Next.js dev server on port 3000), redirect to API port 8000
    if (window.location.port && window.location.port !== '80' && window.location.port !== '443') {
      host = `${window.location.hostname}:8000`;
    }
    return `${protocol}//${host}/ws?token=${token}`;
  }

  return `ws://localhost:8000/ws?token=${token}`;
}

export function useWebSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      attemptRef.current = 0;
      return;
    }

    const connect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
      }

      console.log('[WS] Connecting...');
      const ws = new WebSocket(buildWsUrl(accessToken));
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected');
        attemptRef.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'message.new') {
            console.log('[WS] New message received', event);
            // Invalidate chats list query
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            
            // Invalidate current chat messages query if payload data is available
            const msgData = event.payload?.data;
            if (msgData?.chat_id) {
              queryClient.invalidateQueries({ queryKey: ['messages', msgData.chat_id] });
            }
          }
        } catch (err) {
          console.error('[WS] Error parsing message:', err);
        }
      };

      ws.onclose = (e) => {
        console.log(`[WS] Disconnected, code: ${e.code}`);
        socketRef.current = null;
        
        if (e.code === 4003) {
          // Token expired or invalid
          useAuthStore.getState().logout();
          return;
        }

        const delay = nextBackoffDelay(attemptRef.current);
        attemptRef.current += 1;
        
        console.log(`[WS] Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error('[WS] Connection error', err);
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [accessToken, queryClient]);
}
