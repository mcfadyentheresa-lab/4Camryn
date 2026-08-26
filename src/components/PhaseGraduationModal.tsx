import CamrynOrb from './ui/CamrynOrb';
import { PROTOCOL } from '../lib/protocol';
import { PHASE_MESSAGES } from '../lib/phaseMessages';

interface PhaseGraduationModalProps {
  completedPhase: number;
  displayName: string | null;
  onAdvance: () => void;
}

export default function PhaseGraduationModal({ completedPhase, displayName, onAdvance }: PhaseGraduationModalProps) {
  const nextPhase = completedPhase + 1;
  const nextPhaseData = PROTOCOL.phases.find((p) => p.id === nextPhase);
  const msg = PHASE_MESSAGES[completedPhase];
  const isFinalPhase = completedPhase === 6;

  if (!msg) return null;
  if (!isFinalPhase && !nextPhaseData) return null;

  return (
    <div className="grad-backdrop">
      <div className="grad-modal">

        <div className="grad-orb-row">
          <CamrynOrb size={56} />
          <div className="grad-phase-badge grad-phase-badge--done">
            Phase {completedPhase} complete
          </div>
        </div>

        <h2 className="grad-heading">{displayName ? `${displayName}, ${msg.heading}` : msg.heading}</h2>
        <p className="grad-body">{msg.body}</p>

        <div className="grad-proofs">
          {msg.proofs.map((proof) => (
            <div key={proof} className="grad-proof-row">
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path d="M1 5.5l4 4.5 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{proof}</span>
            </div>
          ))}
        </div>

        {isFinalPhase ? (
          <>
            <div className="grad-next-box">
              <div className="grad-next-label">What comes next</div>
              <p className="grad-next-teaser">{msg.nextTeaser}</p>
            </div>
            <button className="grad-btn" onClick={onAdvance}>
              Complete Protocol
            </button>
          </>
        ) : (
          <>
            <div className="grad-next-box">
              <div className="grad-next-label">Up next</div>
              <div className="grad-next-phase">
                <span className="grad-next-pill">Phase {nextPhase}</span>
                <span className="grad-next-name">{nextPhaseData!.name} · weeks {nextPhaseData!.weeks}</span>
              </div>
              <p className="grad-next-teaser">{msg.nextTeaser}</p>
            </div>
            <button className="grad-btn" onClick={onAdvance}>
              Start Phase {nextPhase} — {nextPhaseData!.name}
            </button>
          </>
        )}

      </div>
    </div>
  );
}
