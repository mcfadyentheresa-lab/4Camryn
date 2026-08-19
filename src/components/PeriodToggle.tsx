import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PeriodToggleProps {
  userId: string;
  onPeriodStart: (dateStr: string) => void;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PeriodToggle({ userId, onPeriodStart }: PeriodToggleProps) {
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // State updates aren't synchronous, so two rapid clicks (a real double-tap,
  // or duplicate events) can both read `busy` as false before either's
  // setBusy(true) lands, letting both through. A ref is readable/settable
  // synchronously within the same tick, closing that race properly.
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('camryn_period_log')
      .select('id, end_date')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setActiveLogId(data && !data.end_date ? data.id : null);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const handleToggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const today = localToday();

    if (activeLogId) {
      const { error } = await supabase
        .from('camryn_period_log')
        .update({ end_date: today })
        .eq('id', activeLogId);
      if (error) console.error('period log end failed:', error);
      else setActiveLogId(null);
    } else {
      const { data, error } = await supabase
        .from('camryn_period_log')
        .insert({ user_id: userId, start_date: today })
        .select('id')
        .maybeSingle();
      if (error) {
        console.error('period log start failed:', error);
      } else if (data) {
        setActiveLogId(data.id);
        onPeriodStart(today);
      }
    }
    busyRef.current = false;
    setBusy(false);
  };

  return (
    <button
      type="button"
      className={`period-toggle ${activeLogId ? 'active' : ''}`}
      onClick={handleToggle}
      disabled={busy}
      aria-label={activeLogId ? 'Mark period as done' : 'Mark period as started today'}
      title={activeLogId ? 'Period active — tap when it’s done' : 'Tap when your period starts'}
    >
      <svg width="16" height="18" viewBox="0 0 14 16" fill="none">
        <path
          d="M7 1C7 1 1.5 8.3 1.5 11.3C1.5 14.3 3.9 15.8 7 15.8C10.1 15.8 12.5 14.3 12.5 11.3C12.5 8.3 7 1 7 1Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill={activeLogId ? 'currentColor' : 'none'}
        />
      </svg>
    </button>
  );
}
