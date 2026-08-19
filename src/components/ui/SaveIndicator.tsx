import type { SaveState } from '../../hooks/useSaveIndicator';

interface SaveIndicatorProps {
  state: SaveState;
  className?: string;
}

export default function SaveIndicator({ state, className = 'save-indicator' }: SaveIndicatorProps) {
  if (state === 'idle') return null;
  if (state === 'error') {
    return <div className={className} style={{ color: 'var(--error, #d64545)' }}>Save failed — try again</div>;
  }
  return <div className={className}>{state === 'saving' ? 'Saving…' : 'Saved'}</div>;
}
