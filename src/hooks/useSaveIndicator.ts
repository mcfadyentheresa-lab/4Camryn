import { useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'saved';

export function useSaveIndicator() {
  const [state, setState] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => setState('saving');
  const done = () => {
    setState('saved');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  };

  return [state, start, done] as const;
}
