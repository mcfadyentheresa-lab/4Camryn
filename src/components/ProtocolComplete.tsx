import CamrynOrb from './ui/CamrynOrb';
import { PROTOCOL } from '../lib/protocol';
import { PHASE_MESSAGES } from '../lib/phaseMessages';

interface ProtocolCompleteProps {
  displayName: string | null;
  completedAt: string | null;
  onMaintain: () => void;
  onRestart: () => void;
}

// Sourced from PhaseGraduationModal's PHASE_MESSAGES rather than duplicated
// here -- this used to hand-roll its own 3-phase list (a leftover from
// before the protocol was expanded from 3 phases/22 weeks to the current 6
// phases/52 weeks), silently omitting Integrate, Sustain, and Thrive from
// the one screen meant to recap the entire year.
const ALL_PROOFS = PROTOCOL.phases.map((p) => ({
  phase: p.id,
  label: p.name,
  items: PHASE_MESSAGES[p.id]?.proofs ?? [],
}));

export default function ProtocolComplete({ displayName, completedAt, onMaintain, onRestart }: ProtocolCompleteProps) {
  const dateLabel = completedAt
    ? new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="pc-backdrop">
      <div className="pc-shell">

        {/* Header */}
        <div className="pc-header">
          <div className="pc-orb-wrap">
            <CamrynOrb size={68} />
            <div className="pc-orb-ring" />
          </div>
          <div className="pc-badge">52-week protocol complete</div>
          <h1 className="pc-headline">
            {displayName ? `${displayName}, you built it.` : 'You built it.'}
          </h1>
          {dateLabel && <p className="pc-date">Completed {dateLabel}</p>}
          <p className="pc-intro">
            Fifty-two weeks. Six phases. Thirty mastery quests. You didn't just follow a protocol — you proved it on yourself, one day at a time. This is what the work looks like from the outside.
          </p>
        </div>

        {/* Phase recap */}
        <div className="pc-phases">
          {ALL_PROOFS.map(({ phase, label, items }) => (
            <div key={phase} className="pc-phase-block">
              <div className={`pc-phase-pill pc-phase-pill--${phase}`}>Phase {phase} · {label}</div>
              <ul className="pc-proof-list">
                {items.map((item) => (
                  <li key={item} className="pc-proof-item">
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1 5l3.5 4 7.5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Camryn message */}
        <div className="pc-message">
          <p>
            "The protocol ends here. But the body you built doesn't. You know what works for you, how your cycle shapes your energy, what your baseline feels like, and what it feels like when things are off.
          </p>
          <p>
            That knowledge is yours permanently. What comes next is up to you."
          </p>
          <div className="pc-message-sig">— Camryn</div>
        </div>

        {/* Choice */}
        <div className="pc-choice">
          <h3 className="pc-choice-heading">What comes next?</h3>

          <div className="pc-choice-cards">
            <button className="pc-choice-card pc-choice-card--maintain" onClick={onMaintain}>
              <div className="pc-choice-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="pc-choice-text">
                <div className="pc-choice-title">Maintain Mode</div>
                <div className="pc-choice-desc">Keep the daily check-in, body logging, and journal running. Tasks shift to maintenance standards. No countdown — just your standards held indefinitely.</div>
              </div>
            </button>

            <button className="pc-choice-card pc-choice-card--restart" onClick={onRestart}>
              <div className="pc-choice-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </div>
              <div className="pc-choice-text">
                <div className="pc-choice-title">Run it again</div>
                <div className="pc-choice-desc">Reset mastery tracking and run the full 52-week protocol from Phase 1. All your historical data stays. A second run compounds on what you already built.</div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
