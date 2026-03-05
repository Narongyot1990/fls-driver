'use client';

import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 30000;

export function useOnlineStatus(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = async () => {
    try {
      await fetch('/api/online', { method: 'POST', keepalive: true });
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  };

  const sendDisconnect = async () => {
    try {
      await fetch('/api/online', { method: 'DELETE', keepalive: true });
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    sendHeartbeat();

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    window.addEventListener('beforeunload', sendDisconnect);
    window.addEventListener('pagehide', sendDisconnect);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      sendDisconnect();
      window.removeEventListener('beforeunload', sendDisconnect);
      window.removeEventListener('pagehide', sendDisconnect);
    };
  }, [enabled]);
}

export const ONLINE_TIMEOUT_MS = 5 * 60 * 1000;
