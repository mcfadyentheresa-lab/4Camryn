import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface Props {
  userId: string;
}

export default function MorningNudgePrompt({ userId }: Props) {
  const { state, subscribe } = usePushNotifications(userId);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('camryn_push_dismissed') === '1'
  );

  if (state === 'unsupported' || state === 'denied' || dismissed) return null;
  if (state === 'subscribed') return null;

  const handleEnable = async () => {
    setLoading(true);
    await subscribe();
    setLoading(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('camryn_push_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="push-prompt">
      <div className="push-prompt-inner">
        <div className="push-prompt-text">
          <p className="push-prompt-title">Get a morning message from Camryn</p>
          <p className="push-prompt-body">A daily nudge personalised to your cycle and protocol — different every day.</p>
        </div>
        <div className="push-prompt-actions">
          <button
            className="push-prompt-btn push-prompt-btn--enable"
            onClick={handleEnable}
            disabled={loading}
          >
            {loading ? 'Enabling…' : 'Enable'}
          </button>
          <button
            className="push-prompt-btn push-prompt-btn--dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
