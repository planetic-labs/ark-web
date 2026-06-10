import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';

const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

function nextBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_INITIAL_MS * 2 ** attempt, BACKOFF_MAX_MS);
}

function buildWsUrl(token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (!apiUrl.startsWith('http')) {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}/ws?token=${token}`;
    }
    return `ws://localhost:8000/ws?token=${token}`;
  }
  const base = apiUrl
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
    .replace('/api/v1', '');
  return `${base}/ws?token=${token}`;
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
