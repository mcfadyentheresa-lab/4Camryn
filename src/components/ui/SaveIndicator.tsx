import type { SaveState } from '../../hooks/useSaveIndicator';

interface SaveIndicatorProps {
  state: SaveState;
  className?: string;
}

export default function SaveIndicator({ state, className = 'save-indicator' }: SaveIndicatorProps) {
  if (state === 'idle') return null;
  return <div className={className}>{state === 'saving' ? 'Saving…' : 'Saved'}</div>;
}
