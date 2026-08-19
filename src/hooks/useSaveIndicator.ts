import { useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function useSaveIndicator() {
  const [state, setState] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    setState('saving');
  };
  const done = () => {
    setState('saved');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  };
  // No auto-clear timeout -- a failed save should stay visible until the
  // next save attempt, not quietly disappear after a couple seconds like
  // a success does.
  const fail = () => {
    if (timer.current) clearTimeout(timer.current);
    setState('error');
  };

  return [state, start, done, fail] as const;
}
