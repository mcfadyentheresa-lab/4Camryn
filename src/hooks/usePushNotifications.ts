import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushState = 'unknown' | 'subscribed' | 'denied' | 'unsupported';

export function usePushNotifications(userId: string | null) {
  const [state, setState] = useState<PushState>('unknown');

  useEffect(() => {
    if (!userId) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription()
    ).then((sub) => {
      setState(sub ? 'subscribed' : 'unknown');
    });
  }, [userId]);

  const subscribe = async (): Promise<boolean> => {
    if (!userId || !VAPID_PUBLIC_KEY) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      if (!json.endpoint) throw new Error('Push subscription missing endpoint');
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: (json.keys as Record<string, string>).p256dh,
        auth_key: (json.keys as Record<string, string>).auth,
      }, { onConflict: 'endpoint' });
      if (error) throw error;
      setState('subscribed');
      return true;
    } catch {
      setState(Notification.permission === 'denied' ? 'denied' : 'unknown');
      return false;
    }
  };

  const unsubscribe = async (): Promise<void> => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      if (error) {
        // Still unsubscribe the browser's push registration -- that's the
        // user-facing goal (stop notifications). The orphaned DB row just
        // means a future push attempt to this endpoint will fail server-side.
        console.error('push subscription row delete failed:', error);
      }
      await sub.unsubscribe();
    }
    setState('unknown');
  };

  return { state, subscribe, unsubscribe };
}
