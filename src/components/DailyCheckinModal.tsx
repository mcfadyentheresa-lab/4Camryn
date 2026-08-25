import { useState, useEffect } from 'react';
import { PROTOCOL } from '../lib/protocol';
import CamrynOrb from './ui/CamrynOrb';

interface Props {
  initialEnergy: string;
  initialStress: string;
  onComplete: (energy: string, stress: string) => void;
  onDismiss: () => void;
}

type Step = 'energy' | 'stress' | 'done';

const STORAGE_KEY = 'camryn_checkin_date';

// Local date, not toISOString() (UTC) -- see the matching fix in App.tsx's
// loadSession: for part of the evening in any timezone west of UTC, UTC has
// already rolled to tomorrow, so a UTC-based "today" wrongly stops matching
// the date this modal was actually marked done under, re-showing it a
// second time on the same local calendar day.
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function shouldShowCheckin(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== today();
}

export function markCheckinDone(): void {
  localStorage.setItem(STORAGE_KEY, today());
}

export default function DailyCheckinModal({ initialEnergy, initialStress, onComplete, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('energy');
  const [energy, setEnergy] = useState(initialEnergy);
  const [stress, setStress] = useState(initialStress);
  const [animIn, setAnimIn] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleEnergySelect = (e: string) => {
    setEnergy(e);
    setTimeout(() => setStep('stress'), 260);
  };

  const handleStressSelect = (s: string) => {
    setStress(s);
    markCheckinDone(); // mark immediately so re-renders don't re-show the modal
    setLeaving(true);
    setTimeout(() => {
      onComplete(energy, s);
    }, 420);
  };

  const handleDismiss = () => {
    markCheckinDone();
    setLeaving(true);
    setTimeout(() => onDismiss(), 420);
  };

  const energyHints: Record<string, string> = {
    Low: 'Rest-forward day — protocol adapts.',
    Medium: 'Good working rhythm.',
    High: 'Use your energy well.',
  };

  const stressHints: Record<string, string> = {
    Low: 'Clear head — great for deep work.',
    Moderate: 'Normal background load.',
    High: 'Protocol will add nervous system support.',
    'Very high': 'Camryn will prioritise regulation today.',
  };

  return (
    <div className={`checkin-modal-backdrop ${animIn ? 'visible' : ''} ${leaving ? 'leaving' : ''}`}>
      <div className={`checkin-modal-card ${animIn ? 'visible' : ''} ${leaving ? 'leaving' : ''}`}>
        <button className="checkin-modal-close" onClick={handleDismiss} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="checkin-modal-orb">
          <CamrynOrb size={44} />
        </div>

        {step === 'energy' && (
          <div className="checkin-modal-body">
            <p className="checkin-modal-question">How's your energy today?</p>
            <div className="checkin-modal-chips">
              {PROTOCOL.energy.map((e) => (
                <button
                  key={e}
                  className={`checkin-modal-chip ${e === energy ? 'active' : ''}`}
                  onClick={() => handleEnergySelect(e)}
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="checkin-modal-hint">{energyHints[energy] || ''}</p>
          </div>
        )}

        {step === 'stress' && (
          <div className="checkin-modal-body checkin-modal-body--in">
            <p className="checkin-modal-question">And your stress level?</p>
            <div className="checkin-modal-chips">
              {PROTOCOL.stress.map((s) => (
                <button
                  key={s}
                  className={`checkin-modal-chip ${s === stress ? 'active' : ''}`}
                  onClick={() => handleStressSelect(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="checkin-modal-hint">{stressHints[stress] || ''}</p>
          </div>
        )}

        <div className="checkin-modal-step-dots">
          <span className={`checkin-dot ${step === 'energy' ? 'active' : 'done'}`} />
          <span className={`checkin-dot ${step === 'stress' ? 'active' : step === 'done' ? 'done' : ''}`} />
        </div>
      </div>
    </div>
  );
}
