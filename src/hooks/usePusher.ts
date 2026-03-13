'use client';

import { useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import type { Channel } from 'pusher-js';

interface PusherBinding {
  event: string;
  callback: (data: any) => void;
}

/**
 * Subscribe to one or more Pusher channels and bind events.
 * Automatically unsubscribes on unmount.
 *
 * @param channelName - channel to subscribe to
 * @param bindings    - array of { event, callback }
 * @param enabled     - set false to skip (e.g. while user is loading)
 */
export function usePusher(
  channelName: string,
  bindings: PusherBinding[],
  enabled = true,
) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    for (const { event, callback } of bindings) {
      channel.bind(event, callback);
    }

    return () => {
      for (const { event, callback } of bindings) {
        channel.unbind(event, callback);
      }
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
    // We stringify bindings events to keep deps stable; callbacks should be
    // wrapped in useCallback by consumers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, enabled, ...bindings.map((b) => b.event)]);
}

/**
 * Subscribe to multiple channels at once.
 * Each entry is [channelName, bindings[]]
 */
export function usePusherMulti(
  subscriptions: Array<{ channel: string; bindings: PusherBinding[] }>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channels: Channel[] = [];

    for (const sub of subscriptions) {
      const channel = pusher.subscribe(sub.channel);
      channels.push(channel);
      for (const { event, callback } of sub.bindings) {
        channel.bind(event, callback);
      }
    }

    return () => {
      for (let i = 0; i < subscriptions.length; i++) {
        const sub = subscriptions[i];
        const channel = channels[i];
        for (const { event, callback } of sub.bindings) {
          channel.unbind(event, callback);
        }
        pusher.unsubscribe(sub.channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...subscriptions.map((s) => s.channel)]);
}
