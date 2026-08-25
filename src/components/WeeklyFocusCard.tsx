import { useState } from 'react';
import { getWeeklyFocus, protocolWeekFromSaveCount } from '../lib/weeklyFocus';
import { localToday } from '../lib/date';

interface Props {
  phase: number;
  cyclePhaseName: string;
  saveCount: number;
}

const CYCLE_COLORS: Record<string, { bg: string; dot: string; label: string }> = {
  'Follicular':   { bg: '#e8f5e9', dot: '#2a9d6f', label: '#157060' },
  'Ovulation':    { bg: '#e0f4fb', dot: '#2e9bbf', label: '#1f7a99' },
  'Early luteal': { bg: '#fff3e0', dot: '#d4813a', label: '#a85e1e' },
  'Late luteal':  { bg: '#fce4ec', dot: '#c2405e', label: '#9b1e3a' },
  'Menstruation': { bg: '#fce4ec', dot: '#c2405e', label: '#9b1e3a' },
  'Not sure':     { bg: '#eaf3f7', dot: '#2e9bbf', label: '#1f7a99' },
};

const THEME_EMOJI: Record<string, string> = {
  'everything-water': '💧',
  'sleep-environment': '🌙',
  'gut-foundation': '🌿',
  'cycle-awareness': '🔄',
  'strength-foundations': '💪',
  'stress-nervous-system': '🧘',
  'protein-foundations': '🥗',
  'your-space': '🏠',
  'hormone-foundations': '⚡',
  'confidence-identity': '✨',
  'sleep-depth': '😴',
  'body-composition': '🏋️',
  'relationships-energy': '🤝',
  'joints-longevity': '🦴',
  'growth-mindset': '📈',
  'micronutrients': '💊',
  'purpose-meaning': '🧭',
  'cold-exposure': '❄️',
  'skin-inside-out': '🧴',
};

// Burst directions for the "poof" dismiss, spread in a fan above the Got it button.
const POOF_ANGLES = [-70, -35, -10, 10, 35, 70];
const POOF_DURATION_MS = 380;

function scienceKey() {
  return `wf-science-read-${localToday()}`;
}

export default function WeeklyFocusCard({ phase, cyclePhaseName, saveCount }: Props) {
  const [open, setOpen] = useState(false);
  const [poofing, setPoofing] = useState(false);
  const [readToday, setReadToday] = useState(() => !!localStorage.getItem(scienceKey()));

  const week = protocolWeekFromSaveCount(saveCount);
  const { theme, card, weekNumber } = getWeeklyFocus(phase, cyclePhaseName, week);
  const colors = CYCLE_COLORS[cyclePhaseName] ?? CYCLE_COLORS['Not sure'];
  const emoji = THEME_EMOJI[theme.id] ?? '✦';

  const handleGotIt = () => {
    setPoofing(true);
    setTimeout(() => {
      setOpen(false);
      setPoofing(false);
      setReadToday(true);
      localStorage.setItem(scienceKey(), '1');
    }, POOF_DURATION_MS);
  };

  return (
    <div className="wf-card2" style={{ background: colors.bg }}>
      <div className="wf-head">
        <div className="wf-icon-circle" style={{ background: colors.dot }} aria-hidden="true">{emoji}</div>
        <div className="wf-eyebrow" style={{ color: colors.label }}>Week {weekNumber} · {cyclePhaseName}</div>
      </div>

      <div className="wf-headline">{theme.name}</div>
      <p className="wf-hook">{theme.hook}</p>

      <div className="wf-today-label" style={{ color: colors.label }}>Today</div>
      <p className="wf-today-text">{card.takeaway}</p>

      {!open && !readToday && (
        <button
          type="button"
          className="wf-sci-toggle"
          style={{ background: colors.dot }}
          onClick={() => setOpen(true)}
        >
          See the full science
        </button>
      )}

      {readToday && !open && (
        <div className="wf-sci-read" style={{ color: colors.label }}>
          <span className="wf-sci-read-check" style={{ background: colors.dot }}>✓</span>
          You&rsquo;ve got today&rsquo;s science
        </div>
      )}

      {open && (
        <div className={`wf-sci-panel${poofing ? ' wf-poofing' : ''}`}>
          <h3 className="wf-sci-title">{card.headline}</h3>
          <p className="wf-sci-body">{card.body}</p>
          <button type="button" className="wf-sci-gotit" onClick={handleGotIt}>Got it</button>

          {poofing && (
            <div className="wf-poof-burst" aria-hidden="true">
              {POOF_ANGLES.map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const dist = 46;
                const bx = Math.round(Math.sin(rad) * dist);
                const by = Math.round(-Math.cos(rad) * dist);
                return (
                  <span
                    key={deg}
                    className="wf-poof-particle"
                    style={{
                      background: colors.dot,
                      '--bx': `${bx}px`,
                      '--by': `${by}px`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
