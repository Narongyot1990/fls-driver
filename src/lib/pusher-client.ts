import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === 'undefined') return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) {
    console.warn('Pusher: NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER is not set — real-time disabled');
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, { cluster });
  }
  return pusherInstance;
}
