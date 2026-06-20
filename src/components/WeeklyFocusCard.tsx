import { useState, useEffect } from 'react';
import { getWeeklyFocus, protocolWeekFromSaveCount } from '../lib/weeklyFocus';

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

function todayKey() {
  return `wf-seen-${new Date().toISOString().split('T')[0]}`;
}

export default function WeeklyFocusCard({ phase, cyclePhaseName, saveCount }: Props) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => !!localStorage.getItem(todayKey()));

  const week = protocolWeekFromSaveCount(saveCount);
  const { theme, card, weekNumber } = getWeeklyFocus(phase, cyclePhaseName, week);

  const colors = CYCLE_COLORS[cyclePhaseName] ?? CYCLE_COLORS['Not sure'];

  useEffect(() => {
    if (open) {
      setSeen(true);
      localStorage.setItem(todayKey(), '1');
    }
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Collapsed card */}
      <div
        className="wf-card"
        style={{ background: colors.bg }}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
        aria-label={`Open this week's focus: ${theme.name}`}
      >
        <div className="wf-card-left">
          <div className="wf-week-label" style={{ color: colors.label }}>
            Week {weekNumber} Focus
            {!seen && <span className="wf-unread-dot" style={{ background: colors.dot }} />}
          </div>
          <div className="wf-theme-name">{theme.name}</div>
          <div className="wf-card-teaser">{card.headline}</div>
        </div>
        <div className="wf-card-cta" style={{ color: colors.label }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div className="task-drawer-backdrop" onClick={handleClose} />
          <div className="task-drawer wf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="task-drawer-handle" />
            <div className="task-drawer-header">
              <div className="task-drawer-meta">
                <span className="task-drawer-category wf-drawer-category" style={{ color: colors.label, background: colors.bg }}>
                  Week {weekNumber} · {theme.name}
                </span>
              </div>
              <button type="button" className="task-drawer-close" onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className="task-drawer-body">
              {/* Hook line */}
              <p className="wf-drawer-hook">{theme.hook}</p>

              <div className="task-drawer-divider" />

              {/* Today's lesson */}
              <div className="wf-lesson-label">Today&rsquo;s lesson</div>
              <h3 className="task-drawer-short-title">{card.headline}</h3>
              <p className="task-drawer-explanation wf-lesson-body">{card.body}</p>

              {/* Takeaway pill */}
              <div className="wf-takeaway" style={{ background: colors.bg, borderLeft: `3px solid ${colors.dot}` }}>
                <span className="wf-takeaway-label" style={{ color: colors.label }}>Your takeaway</span>
                <p className="wf-takeaway-text">{card.takeaway}</p>
              </div>
            </div>

            <div className="task-drawer-footer">
              <button
                type="button"
                className="wf-close-btn"
                style={{ background: colors.dot }}
                onClick={handleClose}
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
