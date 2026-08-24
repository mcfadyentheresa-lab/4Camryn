import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PeriodToggleProps {
  userId: string;
  onPeriodStart: (dateStr: string) => void;
}

const LONG_PRESS_MS = 500;

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PeriodToggle({ userId, onPeriodStart }: PeriodToggleProps) {
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  // The active log's real start_date, kept separate from "today" so a
  // long-press correction has the actual value to pre-fill rather than
  // defaulting back to today every time.
  const [activeStartDate, setActiveStartDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(localToday);
  // State updates aren't synchronous, so two rapid clicks (a real double-tap,
  // or duplicate events) can both read `busy` as false before either's
  // setBusy(true) lands, letting both through. A ref is readable/settable
  // synchronously within the same tick, closing that race properly.
  const busyRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when the long-press timer actually fires, so the click event that
  // still follows pointerup after a long press doesn't also toggle the
  // period on top of opening the date picker.
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('camryn_period_log')
      .select('id, start_date, end_date')
      .eq('user_id', userId)
      // Backdating (below) means start_date is no longer guaranteed unique
      // per row -- two logs can now legitimately share a start_date (a
      // corrected one and an old closed one, as happened live while
      // testing this). created_at as a tiebreaker resolves ties to the
      // most recently created row deterministically instead of leaving it
      // to Postgres's unspecified tie order.
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data && !data.end_date) {
          setActiveLogId(data.id);
          setActiveStartDate(data.start_date);
        } else {
          setActiveLogId(null);
          setActiveStartDate(null);
        }
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
      else {
        setActiveLogId(null);
        setActiveStartDate(null);
      }
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
        setActiveStartDate(today);
        onPeriodStart(today);
      }
    }
    busyRef.current = false;
    setBusy(false);
  };

  const handleClick = () => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    handleToggle();
  };

  const openPicker = () => {
    longPressFiredRef.current = true;
    setPickerDate(activeStartDate ?? localToday());
    setPickerOpen(true);
  };

  const startLongPress = () => {
    if (busyRef.current) return;
    longPressTimerRef.current = setTimeout(openPicker, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => () => cancelLongPress(), []);

  const handleSaveDate = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    if (activeLogId) {
      const { error } = await supabase
        .from('camryn_period_log')
        .update({ start_date: pickerDate })
        .eq('id', activeLogId);
      if (error) {
        console.error('period log start-date correction failed:', error);
      } else {
        setActiveStartDate(pickerDate);
        onPeriodStart(pickerDate);
      }
    } else {
      const { data, error } = await supabase
        .from('camryn_period_log')
        .insert({ user_id: userId, start_date: pickerDate })
        .select('id')
        .maybeSingle();
      if (error) {
        console.error('period log backdated start failed:', error);
      } else if (data) {
        setActiveLogId(data.id);
        setActiveStartDate(pickerDate);
        onPeriodStart(pickerDate);
      }
    }

    busyRef.current = false;
    setBusy(false);
    setPickerOpen(false);
  };

  return (
    <div className="period-toggle-wrap">
      <button
        type="button"
        className={`period-toggle ${activeLogId ? 'active' : ''}`}
        onClick={handleClick}
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        disabled={busy}
        aria-label={activeLogId ? 'Mark period as done' : 'Mark period as started today'}
        title={
          activeLogId
            ? 'Period active — tap when it’s done, hold to correct the start date'
            : 'Tap when your period starts, hold to backdate'
        }
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

      {pickerOpen && (
        <>
          <div className="period-picker-backdrop" onClick={() => setPickerOpen(false)} />
          <div className="period-picker-pop">
            <div className="period-picker-label">
              {activeLogId ? 'Correct the start date' : 'When did it start?'}
            </div>
            <input
              type="date"
              className="cycle-date-input"
              value={pickerDate}
              max={localToday()}
              onChange={(e) => setPickerDate(e.target.value)}
            />
            <div className="period-picker-actions">
              <button type="button" className="period-picker-cancel" onClick={() => setPickerOpen(false)}>
                Cancel
              </button>
              <button type="button" className="period-picker-save" onClick={handleSaveDate} disabled={busy}>
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
