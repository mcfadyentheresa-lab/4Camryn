import { useEffect, useState } from 'react';
import { localToday } from '../lib/date';
import type { ChallengeContent } from '../lib/challenges';
import {
  evaluateStreakChallenge,
  evaluateCumulativeChallenge,
  getMvwCap,
  getMvwUsageCount,
  getRankedInterventions,
} from '../lib/challengeProgress';
import {
  fetchStreakDays,
  fetchMoneyEntries,
  fetchResistanceEvents,
  fetchUserResistanceEvents,
  logResistanceEvent,
  updateResistanceOutcome,
  logStreakDay,
  logMoneyEntry,
  type ChallengeInstanceRow,
} from '../lib/challengeCompletion';
import {
  RESISTANCE_TYPES,
  INTERVENTIONS,
  INTERVENTION_COPY,
  DIFFERENT_VERSION_OPTIONS,
  CHOSEN_FOR_YOU,
  MVW_ACTIONS,
  FRICTION_OPTIONS,
  pickFromPool,
  type ResistanceType,
  type InterventionType,
  type ResistanceDomain,
  type FrictionOption,
} from '../lib/resistanceSupport';
import type { InstanceDetail } from './ChallengeSection';
import CamrynOrb from './ui/CamrynOrb';

type Step = 'classify' | 'offer' | 'action' | 'outcome';
type OutcomeKind = 'full' | 'reduced' | 'none';

interface ResistanceSupportModalProps {
  userId: string;
  instance: ChallengeInstanceRow;
  content: ChallengeContent;
  detail: InstanceDetail;
  energyLevel?: string;
  onClose: () => void;
  onChange: (updated: ChallengeInstanceRow | null) => void;
  onDetailChange: (detail: InstanceDetail) => void;
}

export default function ResistanceSupportModal({
  userId,
  instance,
  content,
  detail,
  energyLevel,
  onClose,
  onChange,
  onDetailChange,
}: ResistanceSupportModalProps) {
  const domain: ResistanceDomain = content.secondaryTags?.includes('sleep')
    ? 'sleep'
    : content.primaryDomain === 'food' ? 'food' : 'body';
  // Free context from today's check-in (DailyCheckinModal) -- used only to
  // pre-highlight the matching chip, never to auto-select it. Resistance
  // type stays entirely user-chosen; this is a hint, not a shortcut.
  const suggestedType: ResistanceType | null = energyLevel === 'Low' ? 'low-energy' : null;

  const [animIn, setAnimIn] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [step, setStep] = useState<Step>('classify');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [mvwUsageCount, setMvwUsageCount] = useState(0);
  const [userEvents, setUserEvents] = useState<{ resistance_type: string; intervention_selected: string | null; completed_full: boolean | null; completed_reduced: boolean | null }[]>([]);
  const [resistanceType, setResistanceType] = useState<ResistanceType | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [ranked, setRanked] = useState<InterventionType[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);
  const [frictionPicked, setFrictionPicked] = useState<FrictionOption | null>(null);
  const [pickedText, setPickedText] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<OutcomeKind | null>(null);

  const mvwCap = getMvwCap(content);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchResistanceEvents(instance.id), fetchUserResistanceEvents(userId)])
      .then(([instanceEvents, allUserEvents]) => {
        if (cancelled) return;
        setMvwUsageCount(getMvwUsageCount(instanceEvents));
        setUserEvents(allUserEvents);
      })
      .catch(() => !cancelled && setError('Could not load your history — offering the default options.'))
      .finally(() => !cancelled && setLoadingEvents(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown ticks purely client-side -- nothing server-tracked, so
  // closing the tab mid-timer never leaves anything hanging.
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onClose(), 420);
  };

  const handleClassify = async (type: ResistanceType) => {
    setResistanceType(type);
    const rankedList = getRankedInterventions(type, userEvents, mvwUsageCount, mvwCap);
    setRanked(rankedList);
    setBusy(true);
    setError(null);
    try {
      const row = await logResistanceEvent({
        userId,
        instanceId: instance.id,
        challengeDomain: content.primaryDomain,
        resistanceType: type,
        interventionOffered: rankedList.slice(0, 2),
      });
      setEventId(row.id);
      setStep('offer');
    } catch {
      setError('Something went wrong logging that — you can still pick an option below.');
      setStep('offer');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectIntervention = async (id: InterventionType) => {
    setSelectedIntervention(id);
    if (id === 'different-version') setPickedText(pickFromPool(DIFFERENT_VERSION_OPTIONS[domain], `${instance.id}:${localToday()}:dv`));
    if (id === 'choose-for-me') setPickedText(pickFromPool(CHOSEN_FOR_YOU[domain], `${instance.id}:${localToday()}:cf`));
    if (id === 'start-with-me' || id === 'push-me') setCountdown(180);
    if (id === 'make-it-a-game') setCountdown(domain === 'body' ? 60 : 120);
    setStep('action');
    if (eventId) {
      try {
        await updateResistanceOutcome(eventId, userId, { interventionSelected: id });
      } catch {
        // Non-fatal -- the flow continues either way, this just means the
        // stats won't have this attempt counted.
      }
    }
  };

  // The actual "did it happen" write always goes through the same
  // logStreakDay/logMoneyEntry the rest of the challenge system uses --
  // resistance support is a detour, never a second door. `kind` only
  // controls what gets annotated on the resistance event itself.
  const doLog = async (kind: 'full' | 'reduced', label: string) => {
    setBusy(true);
    setError(null);
    try {
      if (instance.completion_type === 'streak') {
        const result = await logStreakDay(userId, instance);
        onChange(result.instance);
        onDetailChange({ ...detail, streakDays: await fetchStreakDays(instance.id) });
      } else if (instance.completion_type === 'cumulative') {
        const result = await logMoneyEntry(userId, instance, { source: label, amount: 1, recurring: false });
        onChange(result.instance);
        onDetailChange({ ...detail, moneyEntries: await fetchMoneyEntries(instance.id) });
      }
      if (eventId) {
        await updateResistanceOutcome(eventId, userId, {
          started: true,
          completedFull: kind === 'full',
          completedReduced: kind === 'reduced',
          continuedPastMinimum: kind === 'full' && (selectedIntervention === 'start-with-me' || selectedIntervention === 'push-me'),
        });
      }
      setOutcome(kind);
      setStep('outcome');
    } catch {
      setError('Could not log that just now — try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const doNotStarted = async () => {
    setBusy(true);
    try {
      if (eventId) {
        await updateResistanceOutcome(eventId, userId, { started: false, completedFull: false, completedReduced: false });
      }
      setOutcome('none');
      setStep('outcome');
    } finally {
      setBusy(false);
    }
  };

  const finishOutcome = async (felt: 'better' | 'same' | 'worse') => {
    if (eventId) {
      try {
        await updateResistanceOutcome(eventId, userId, { feltAfterward: felt });
      } catch {
        // Non-fatal -- close either way.
      }
    }
    handleDismiss();
  };

  const realityCheck = (() => {
    if (resistanceType !== 'missed-days-feels-ruined') return null;
    if (instance.completion_type === 'streak') {
      const params = instance.params as { durationDays: number; tolerance: 'strict' | number };
      const evaln = evaluateStreakChallenge(detail.streakDays, instance.accepted_date, params.durationDays, params.tolerance);
      if (params.tolerance === 'strict') {
        return `You're at ${evaln.daysCompleted}/${params.durationDays} days. This one resets on a miss, but starting again right now still counts fully.`;
      }
      return `You're at ${evaln.daysCompleted}/${params.durationDays} days, and you've used ${evaln.skipsUsed} of ${params.tolerance} allowed skips. This isn't ruined.`;
    }
    if (instance.completion_type === 'cumulative') {
      const params = instance.params as { target: number };
      const evaln = evaluateCumulativeChallenge(detail.moneyEntries.map((e) => Number(e.amount)), params.target, instance.window_ends_date);
      return `You're at ${evaln.total}/${params.target}. There's no streak to lose here — everything you log still counts.`;
    }
    return null;
  })();

  const offeredList = showMore
    ? INTERVENTIONS.filter((i) => i.id !== 'minimum-viable-win' || mvwUsageCount < mvwCap).map((i) => i.id)
    : ranked;

  return (
    <div className={`checkin-modal-backdrop ${animIn ? 'visible' : ''} ${leaving ? 'leaving' : ''}`}>
      <div className={`checkin-modal-card ${animIn ? 'visible' : ''} ${leaving ? 'leaving' : ''}`}>
        <button className="checkin-modal-close" onClick={handleDismiss} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="checkin-modal-orb">
          <CamrynOrb size={44} />
        </div>

        {error && <p className="challenge-error" style={{ marginBottom: 12 }}>{error}</p>}

        {step === 'classify' && (
          <div className="checkin-modal-body">
            <p className="checkin-modal-question">What's going on right now?</p>
            <div className="checkin-modal-chips">
              {RESISTANCE_TYPES.map((r) => (
                <button
                  key={r.id}
                  className={`checkin-modal-chip ${r.id === suggestedType ? 'resistance-chip-suggested' : ''}`}
                  disabled={busy || loadingEvents}
                  onClick={() => handleClassify(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="checkin-modal-hint">
              {loadingEvents
                ? 'One moment…'
                : suggestedType
                  ? "Today's check-in said low energy — that might be it, but pick whatever's actually closest."
                  : "Whichever's closest — it doesn't have to be exact."}
            </p>
          </div>
        )}

        {step === 'offer' && (
          <div className="checkin-modal-body">
            {realityCheck && <p className="resistance-reality-check">{realityCheck}</p>}
            <p className="checkin-modal-question">Want help with this?</p>
            <div className="resistance-offer-list">
              {offeredList.map((id) => {
                const opt = INTERVENTIONS.find((i) => i.id === id);
                const copy = INTERVENTION_COPY[id][domain];
                if (!opt) return null;
                return (
                  <button key={id} className="resistance-offer-card" disabled={busy} onClick={() => handleSelectIntervention(id)}>
                    <span className="resistance-offer-label">{opt.label}</span>
                    <span className="resistance-offer-prompt">{copy.prompt}</span>
                  </button>
                );
              })}
            </div>
            {!showMore && (
              <button className="challenge-link-btn" onClick={() => setShowMore(true)}>
                See other options
              </button>
            )}
            <button className="challenge-link-btn" onClick={handleDismiss}>
              Not right now
            </button>
          </div>
        )}

        {step === 'action' && selectedIntervention && (
          <div className="checkin-modal-body">
            {(selectedIntervention === 'start-with-me' || selectedIntervention === 'push-me') && (
              <>
                <p className="checkin-modal-question">{INTERVENTION_COPY[selectedIntervention][domain].action}</p>
                {countdown !== null && countdown > 0 ? (
                  <div className="resistance-timer">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</div>
                ) : (
                  <div className="checkin-modal-chips">
                    <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('full', 'Kept going after starting')}>
                      Keep going — log it
                    </button>
                    <button className="challenge-link-btn" disabled={busy} onClick={() => doLog('reduced', 'Started, stopped after a few minutes')}>
                      That's enough for today
                    </button>
                  </div>
                )}
              </>
            )}

            {selectedIntervention === 'remove-friction' && (
              !frictionPicked ? (
                <>
                  <p className="checkin-modal-question">What's actually in the way?</p>
                  <div className="checkin-modal-chips">
                    {FRICTION_OPTIONS[domain].map((f) => (
                      <button key={f.id} className="checkin-modal-chip" onClick={() => setFrictionPicked(f)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="checkin-modal-question">{frictionPicked.fix}</p>
                  <div className="checkin-modal-chips">
                    <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('full', frictionPicked.fix)}>
                      Did it
                    </button>
                    <button className="challenge-link-btn" disabled={busy} onClick={doNotStarted}>
                      Still no
                    </button>
                  </div>
                </>
              )
            )}

            {selectedIntervention === 'different-version' && (
              <>
                <p className="checkin-modal-question">{pickedText}</p>
                <div className="checkin-modal-chips">
                  <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('full', pickedText)}>
                    Did this instead
                  </button>
                  <button className="challenge-link-btn" disabled={busy} onClick={doNotStarted}>
                    Still no
                  </button>
                </div>
              </>
            )}

            {selectedIntervention === 'make-it-a-game' && (
              countdown !== null && countdown > 0 ? (
                <>
                  <p className="checkin-modal-question">{INTERVENTION_COPY['make-it-a-game'][domain].action}</p>
                  <div className="resistance-timer">{countdown}s</div>
                </>
              ) : (
                <>
                  <p className="checkin-modal-question">Did you get moving?</p>
                  <div className="checkin-modal-chips">
                    <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('full', 'Beat the countdown')}>
                      Yes
                    </button>
                    <button className="challenge-link-btn" disabled={busy} onClick={doNotStarted}>
                      Not yet
                    </button>
                  </div>
                </>
              )
            )}

            {selectedIntervention === 'choose-for-me' && (
              <>
                <p className="checkin-modal-question">{pickedText}</p>
                <div className="checkin-modal-chips">
                  <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('full', pickedText)}>
                    Did it
                  </button>
                  <button className="challenge-link-btn" disabled={busy} onClick={doNotStarted}>
                    Still no
                  </button>
                </div>
              </>
            )}

            {selectedIntervention === 'minimum-viable-win' && (
              <>
                <p className="checkin-modal-question">{MVW_ACTIONS[domain]}</p>
                <div className="checkin-modal-chips">
                  <button className="challenge-btn-primary" disabled={busy} onClick={() => doLog('reduced', 'Minimum viable version')}>
                    Logged it
                  </button>
                  <button className="challenge-link-btn" disabled={busy} onClick={doNotStarted}>
                    Still no
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'outcome' && (
          <div className="checkin-modal-body">
            <p className="checkin-modal-question">
              {outcome === 'none' ? "That's okay — noted for next time." : outcome === 'reduced' ? 'Logged. That counts.' : 'Nice. Logged.'}
            </p>
            {outcome !== 'none' ? (
              <>
                <p className="checkin-modal-hint">How do you feel now?</p>
                <div className="checkin-modal-chips">
                  <button className="checkin-modal-chip" onClick={() => finishOutcome('better')}>Better</button>
                  <button className="checkin-modal-chip" onClick={() => finishOutcome('same')}>Same</button>
                  <button className="checkin-modal-chip" onClick={() => finishOutcome('worse')}>Worse</button>
                  <button className="challenge-link-btn" onClick={handleDismiss}>Skip</button>
                </div>
              </>
            ) : (
              <button className="challenge-btn-primary" onClick={handleDismiss}>Close</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
