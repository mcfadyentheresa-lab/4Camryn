import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PROTOCOL, dailyTasks, dailyLearnForToday, TAG_TO_QUEST, daysCompletedInPhase } from '../lib/protocol';
import {
  PHASE_QUESTS,
  ensureDailyPick,
  calcStreak,
  calcProgressPct,
  isPhaseComplete,
  isTodayCompleted,
  toggleToday,
  saveAllMastery,
  type MasteryData,
  type AllPhaseMastery,
} from '../lib/mastery';
import { getDailyCoachingSentence, getCompletionNote, getPhasePosition } from '../lib/dailyCoaching';
import { recordSlotCompletion } from '../lib/completion';
import MasteryCard from './MasteryCard';
import CycleActionTile from './CycleActionTile';
import WeeklyFocusCard from './WeeklyFocusCard';
import PeriodToggle from './PeriodToggle';

interface Session {
  current_phase: number;
  cycle_phase_name: string;
  cycle_day: number | null;
  last_period_date: string | null;
  energy: string;
  stress: string;
  save_count: number;
  phase_start_save_count: number;
}

interface MainContentProps {
  userId: string;
  session: Session;
  allMastery: AllPhaseMastery;
  onAllMasteryChange: (updated: AllPhaseMastery | ((prev: AllPhaseMastery) => AllPhaseMastery)) => void;
  onDaySaveStart?: () => void;
  onDaySaveSuccess?: (saveCount: number) => void;
  onDaySaveError?: (retry: () => void) => void;
  onNavigateToJournal?: () => void;
  onNavigateTo?: (view: string) => void;
  onPhaseProgressChange?: (pct: number) => void;
  onPhaseComplete?: (phase: number) => void;
  dailyStreak?: number;
  daysSinceLastSave?: number | null;
  frontDoorCompletions?: number[];
  todayCheckedItems?: boolean[] | null;
  onPeriodStart?: (dateStr: string) => void;
}

function questIdFromTag(tag: string, phase: number): string | null {
  const questId = TAG_TO_QUEST[tag];
  if (!questId) return null;
  const phaseQuests = PHASE_QUESTS[phase] ?? PHASE_QUESTS[1];
  return phaseQuests.some((q) => q.id === questId) ? questId : null;
}

function phaseKey(phase: number): keyof AllPhaseMastery {
  if (phase === 2) return 'phase2';
  if (phase === 3) return 'phase3';
  if (phase === 4) return 'phase4';
  if (phase === 5) return 'phase5';
  if (phase === 6) return 'phase6';
  return 'phase1';
}

function getSlotLabel(slot: number): string {
  if (slot === 0) return 'morning';
  if (slot === 1) return 'afternoon';
  return 'evening';
}


// Returns today's local date as YYYY-MM-DD, matching the same convention as mastery.ts.
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MainContent({
  userId,
  session,
  allMastery,
  onAllMasteryChange,
  onDaySaveStart,
  onDaySaveSuccess,
  onDaySaveError,
  onPhaseProgressChange,
  onPhaseComplete,
  dailyStreak = 0,
  daysSinceLastSave = null,
  frontDoorCompletions = [],
  todayCheckedItems = null,
  onPeriodStart,
}: MainContentProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(() => [false, false, false]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [highlightedQuestId, setHighlightedQuestId] = useState<string | null>(null);
  const [masteryOpen, setMasteryOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  // todayKey drives a re-derivation of checkedItems when the calendar day changes.
  // This ensures accumulation tasks reset to unchecked at midnight rather than
  // carrying forward the previous day's checked state.
  const [todayKey, setTodayKey] = useState(localToday);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);
  const skipMasterySideEffectsRef = useRef(true);
  const latestAllMasteryRef = useRef(allMastery);
  // Side effects for a checkedItems change (recordSlotCompletion, celebration)
  // run from a useEffect below, not from inside the setCheckedItems updater --
  // updater functions run as part of React's render phase for this component,
  // and calling another component's setState (onAllMasteryChange/
  // onDaySaveSuccess both eventually call setState on App) from there
  // triggers "Cannot update a component while rendering a different
  // component".
  const pendingCheckedSideEffectsRef = useRef<{
    next: boolean[];
    touchedIndices: number[];
    origin: 'toggle' | 'frontDoor';
  } | null>(null);

  // Poll for date change at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayKey(localToday());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const phase = PROTOCOL.phases.find((p) => p.id === session.current_phase) || PROTOCOL.phases[0];
  const tasks = dailyTasks(session.current_phase, session.energy, session.stress, session.cycle_phase_name);
  const todayLearn = dailyLearnForToday(session.cycle_phase_name);

  const pKey = phaseKey(session.current_phase);
  const quests = useMemo(() => PHASE_QUESTS[session.current_phase] ?? PHASE_QUESTS[1], [session.current_phase]);
  const masteryData: MasteryData = useMemo(() => ensureDailyPick(allMastery[pKey], quests), [allMastery, pKey, quests]);

  // Reads latestAllMasteryRef at fire time rather than closing over the
  // value passed in when scheduled -- every allMastery change (whichever
  // component caused it) reschedules this via the effect below, so the
  // debounced write always lands the freshest snapshot instead of a stale
  // one that could clobber a newer write that landed in between.
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      saveAllMastery(userId, latestAllMasteryRef.current).catch((err) => {
        console.error('mastery save failed:', err);
      });
    }, 1000);
  }, [userId]);

  // Flush a pending debounced save immediately on unmount (e.g. switching away
  // from the "today" tab) instead of leaving a raw setTimeout to fire later --
  // an orphaned timer firing after the fact can land after (and overwrite) a
  // newer write from elsewhere, like a Journal-driven mastery update.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        saveAllMastery(userId, latestAllMasteryRef.current).catch((err) => {
          console.error('mastery save failed (unmount flush):', err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Composes via React's functional setState form so that multiple synchronous
  // calls in the same tick (e.g. marking several tasks' quests at once from a
  // Front Door sync batch) each build on the previous one instead of racing
  // on a stale `allMastery` closure and clobbering each other's writes.
  const updateMasteryData = useCallback((updater: (prev: MasteryData) => MasteryData) => {
    onAllMasteryChange((prevAll) => {
      const currentData = ensureDailyPick(prevAll[pKey], quests);
      const updated = updater(currentData);
      return updated === currentData ? prevAll : { ...prevAll, [pKey]: updated };
    });
  }, [pKey, quests, onAllMasteryChange]);

  // Runs the save/progress/graduation side effects whenever allMastery actually
  // changes (from this component or elsewhere, e.g. JournalSection), instead of
  // from inside the state updater above where React may invoke it more than once.
  useEffect(() => {
    latestAllMasteryRef.current = allMastery;
    if (skipMasterySideEffectsRef.current) {
      skipMasterySideEffectsRef.current = false;
      return;
    }
    scheduleSave();
    const pct = calcProgressPct(masteryData, quests);
    onPhaseProgressChange?.(pct);
    // No phase-number gate here -- this used to be capped at <= 3 (a leftover
    // from early development), which meant completing Phase 4/5/6's quests
    // never triggered graduation at all. Every phase should fire the same way.
    if (isPhaseComplete(masteryData, quests)) {
      onPhaseComplete?.(session.current_phase);
    }
  }, [allMastery]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTask = useCallback((idx: number, newChecked?: boolean[]) => {
    setCheckedItems((prev) => {
      const next = newChecked ?? [...prev];
      if (!newChecked) next[idx] = !next[idx];
      pendingCheckedSideEffectsRef.current = { next: [...next], touchedIndices: [idx], origin: 'toggle' };
      return next;
    });
  }, []);

  // Runs the quest marks / save / celebration for a checkedItems change
  // queued by toggleTask or the Front Door completions effect below, once the
  // state has actually committed -- see the ref comment above for why this
  // can't live inside the setCheckedItems updater itself. Each touched slot
  // is written through recordSlotCompletion (src/lib/completion.ts), the one
  // place that now owns mastery_data, camryn_daily_saves, save_count, and
  // the Front Door mirror for a task-slot change -- replacing the old split
  // between autoMarkQuest's debounced mastery save and App.tsx's immediate
  // onSaveDay, which could land out of order against each other.
  useEffect(() => {
    const pending = pendingCheckedSideEffectsRef.current;
    if (!pending) return;
    pendingCheckedSideEffectsRef.current = null;
    const { next, touchedIndices, origin } = pending;
    const doneCount = next.filter(Boolean).length;

    // Preserve the original guard: once at least one real save has gone
    // through this session, don't re-save a toggle that nets out to nothing
    // done (e.g. a rapid check/uncheck). Front Door catch-ups always save.
    if (origin === 'toggle' && savedRef.current && doneCount === 0) return;

    const retry = () => {
      pendingCheckedSideEffectsRef.current = pending;
      setCheckedItems((c) => [...c]);
    };

    const taskShortTitles = tasks.map((t) => (t as any).shortTitle || t.tag.split('·')[1]?.trim() || t.tag);

    (async () => {
      onDaySaveStart?.();
      try {
        let mastery = latestAllMasteryRef.current;
        let saveCount = session.save_count;
        for (const idx of touchedIndices) {
          const questId = questIdFromTag(tasks[idx]?.tag || '', session.current_phase);
          const result = await recordSlotCompletion({
            userId,
            phase: session.current_phase,
            questId,
            checked: next[idx],
            allMastery: mastery,
            allChecked: next,
            taskShortTitles,
            energy: session.energy,
          });
          mastery = result.mastery;
          saveCount = result.saveCount;
          onAllMasteryChange(mastery);
        }
        savedRef.current = true;
        onDaySaveSuccess?.(saveCount);
        if (origin === 'toggle') {
          if (doneCount === 3) setTimeout(() => setShowCelebration(true), 200);
        } else if (next.every(Boolean)) {
          setShowCelebration(true);
        }
      } catch (err) {
        console.error('recordSlotCompletion failed:', err);
        onDaySaveError?.(retry);
      }
    })();
  }, [checkedItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMasteryToggle = useCallback((id: string) => {
    updateMasteryData((prev) => {
      const qs = prev.quests[id];
      if (!qs) return prev;
      const streak = calcStreak(qs.completedDates, qs.targetDays);
      if (streak >= qs.targetDays && !isTodayCompleted(qs.completedDates)) return prev;
      return {
        ...prev,
        quests: {
          ...prev.quests,
          [id]: { ...qs, completedDates: toggleToday(qs.completedDates) },
        },
      };
    });
  }, [updateMasteryData]);

  const handlePickClick = useCallback(() => {
    const pickId = masteryData.pickId;
    if (!pickId) return;
    setHighlightedQuestId(pickId);
    setTimeout(() => setHighlightedQuestId(null), 2000);
    document.getElementById(`quest-row-${pickId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [masteryData.pickId]);

  useEffect(() => {
    // Accumulation tasks reset visually each day unless completed again today;
    // progress is based on dated completion history, not a carry-forward boolean.
    // Tasks with no quest behind them (e.g. the cycle task) have no mastery data
    // to derive from, so read today's own checked_items row first (the slot's
    // real home now -- see completion.ts). The Front Door fallback below is
    // NOT dead code, despite the consolidation plan assuming it would become
    // one once checked_items existed -- todayCheckedItems is null until
    // Camryn's own first save of the day (or a pre-migration row), so it's
    // still the only way a completion Front Door already recorded today shows
    // up before the user touches anything in Camryn itself.
    const derived = tasks.map((task, idx) => {
      const questId = questIdFromTag(task.tag, session.current_phase);
      if (!questId) {
        if (todayCheckedItems && idx < todayCheckedItems.length) return !!todayCheckedItems[idx];
        return frontDoorCompletions.includes(idx);
      }
      const qs = masteryData.quests[questId];
      return qs ? isTodayCompleted(qs.completedDates) : false;
    });

    setCheckedItems(derived);
    if (derived.every(Boolean)) setShowCelebration(true);
    else setShowCelebration(false);
    savedRef.current = false;
  }, [session.current_phase, masteryData, todayKey, todayCheckedItems]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply completions from Front Door whenever the list updates (real-time or on load)
  useEffect(() => {
    if (frontDoorCompletions.length === 0) return;
    setCheckedItems((prev) => {
      const next = [...prev];
      const touchedIndices: number[] = [];
      frontDoorCompletions.forEach((idx) => {
        if (idx >= 0 && idx < tasks.length && !next[idx]) {
          next[idx] = true;
          touchedIndices.push(idx);
        }
      });
      if (touchedIndices.length === 0) return prev;
      pendingCheckedSideEffectsRef.current = { next: [...next], touchedIndices, origin: 'frontDoor' };
      return next;
    });
  }, [frontDoorCompletions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pct = calcProgressPct(masteryData, quests);
    onPhaseProgressChange?.(pct);
  }, [session.current_phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const shortTag = (tag: string) => tag.split('·')[1]?.trim() || tag;

  // Find the quest closest to completion (most progress, not yet done)
  const nearestQuest = useMemo(() => {
    const incomplete = quests.filter((q) => {
      const qs = masteryData.quests[q.id];
      if (!qs) return true;
      return calcStreak(qs.completedDates, q.targetDays) < q.targetDays;
    });
    if (incomplete.length === 0) return null;
    return incomplete.reduce((best, q) => {
      const qs = masteryData.quests[q.id];
      const bqs = masteryData.quests[best.id];
      const qPct = qs ? calcStreak(qs.completedDates, q.targetDays) / q.targetDays : 0;
      const bPct = bqs ? calcStreak(bqs.completedDates, best.targetDays) / best.targetDays : 0;
      return qPct > bPct ? q : best;
    });
  }, [masteryData, quests]);

  const nearestQuestPct = useMemo(() => {
    if (!nearestQuest) return 0;
    const qs = masteryData.quests[nearestQuest.id];
    if (!qs) return 0;
    const streak = calcStreak(qs.completedDates, nearestQuest.targetDays);
    return Math.round((streak / nearestQuest.targetDays) * 100);
  }, [nearestQuest, masteryData]);

  const nearestQuestDaysLeft = useMemo(() => {
    if (!nearestQuest) return 0;
    const qs = masteryData.quests[nearestQuest.id];
    if (!qs) return nearestQuest.targetDays;
    const streak = calcStreak(qs.completedDates, nearestQuest.targetDays);
    return nearestQuest.targetDays - streak;
  }, [nearestQuest, masteryData]);

  const TAG_EMOJI: Record<string, string> = {
    'Hydration': '💧',
    'Gut': '🌿',
    'Sleep': '🌙',
    'Nutrition': '🥗',
    'Movement': '🚶',
    'Strength': '💪',
    'Hormones': '⚡',
    'Body Composition': '🏋️',
    'Longevity': '🦴',
    'Menstruation': '🌸',
    'Follicular': '🌱',
    'Ovulation': '✨',
    'Early Luteal': '🍂',
    'Late Luteal': '🌙',
    'Not Tracking': '📋',
    'Regulation': '🧘',
    'Priority': '⭐',
    'Self-Assessment': '🔍',
  };
  const taskEmoji = (tag: string) => {
    const sub = shortTag(tag);
    return TAG_EMOJI[sub] || '✦';
  };

  const openCard = (idx: number) => setExpanded(idx);
  const closeCard = () => setExpanded(null);

  return (
    <div className="today-single">

      {/* ── Comeback card — shown when 2+ days without saving ── */}
      {daysSinceLastSave !== null && daysSinceLastSave >= 2 && (() => {
        const phaseName = PROTOCOL.phases.find((p) => p.id === session.current_phase)?.name ?? 'Foundation';
        const dayN = daysCompletedInPhase(session.save_count, session.phase_start_save_count);
        let title: string;
        let text: string;

        if (daysSinceLastSave <= 3) {
          title = `You were gone for ${daysSinceLastSave} days. No lecture.`;
          text = `You're still on Day ${dayN} of Phase ${session.current_phase} — ${phaseName}. Same tasks, same protocol. Pick one and start there.`;
        } else if (daysSinceLastSave <= 7) {
          title = `It's been ${daysSinceLastSave} days.`;
          text = `You're still exactly where you left off — Day ${dayN}, Phase ${session.current_phase} (${phaseName}). Nothing resets. Open the first task. That's the only action right now.`;
        } else {
          title = 'Welcome back.';
          text = `You took a break. The protocol was waiting. You're still on Day ${dayN} of Phase ${session.current_phase} — ${phaseName}. Gaps don't erase days. They just pause them.`;
        }

        return (
          <div className="comeback-card">
            <div className="comeback-card-left">
              <span className="comeback-card-days">{daysSinceLastSave}d</span>
            </div>
            <div className="comeback-card-body">
              <p className="comeback-card-title">{title}</p>
              <p className="comeback-card-text">{text}</p>
            </div>
          </div>
        );
      })()}

      {/* ── Period toggle + streak banner (streak shown when ≥ 2 and no gap) ── */}
      <div className="today-status-row">
        <PeriodToggle userId={userId} onPeriodStart={(d) => onPeriodStart?.(d)} />
        {dailyStreak >= 2 && (daysSinceLastSave === null || daysSinceLastSave <= 1) && (
          <div className="streak-banner">
            <span className="streak-fire">●</span>
            <span className="streak-count">{dailyStreak} day streak</span>
            <span className="streak-label">Keep it going</span>
          </div>
        )}
      </div>

      {/* ── Phase position strip + Camryn daily sentence ── */}
      {(() => {
        const pos = getPhasePosition(session.save_count, session.current_phase, session.phase_start_save_count ?? 0);
        const sentence = getDailyCoachingSentence(session.cycle_phase_name, session.current_phase);
        const phaseData = PROTOCOL.phases.find((p) => p.id === session.current_phase);
        return (
          <div className="phase-strip">
            <div className="phase-strip-meta">
              <span className="phase-strip-name">
                Phase {session.current_phase} · {phaseData?.name}
              </span>
              <span className="phase-strip-position">
                Day {pos.dayInPhase} · Week {pos.weekInPhase} of {pos.totalWeeksInPhase}
              </span>
            </div>
            <p className="phase-strip-sentence">{sentence}</p>
          </div>
        );
      })()}

      <div className="tasks-card">
        <WeeklyFocusCard
          phase={session.current_phase}
          cyclePhaseName={session.cycle_phase_name}
          saveCount={daysCompletedInPhase(session.save_count, session.phase_start_save_count)}
        />

        {tasks.map((task, idx) => {
          const isCycleRow = idx === 1;
          const isExpanded = expanded === idx;
          const bestSlot = getSlotLabel(idx);

          return (
            <div
              key={idx}
              className={[
                'task-row-simple',
                checkedItems[idx] ? 'is-done' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => openCard(idx)}
            >
              <span className="task-flip-emoji">{taskEmoji(task.tag)}</span>
              <div className="task-flip-front-text">
                <span className="task-flip-label">{(task as any).shortTitle || shortTag(task.tag)}</span>
                <span className="task-flip-hint">Best this {bestSlot}</span>
                <p className="task-row-body">{task.body}</p>
              </div>
              {checkedItems[idx] ? (
                <span className="task-flip-done-badge">
                  <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : (
                <svg className="task-row-chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}

              {/* Expanded drawer — portaled to document.body so it escapes
                  .task-row-simple's opacity:0.45 and stacking context */}
              {isExpanded && createPortal(
                <>
                  <div className="task-drawer-backdrop" onClick={(e) => { e.stopPropagation(); closeCard(); }} />
                  <div className="task-drawer" onClick={(e) => e.stopPropagation()}>
                    <div className="task-drawer-handle" />
                    <div className="task-drawer-header">
                      <div className="task-drawer-meta">
                        <span className="task-drawer-category">{shortTag(task.tag)}</span>
                      </div>
                      <button type="button" className="task-drawer-close" onClick={closeCard} aria-label="Close">✕</button>
                    </div>
                    <div className="task-drawer-body">
                      <div className="task-drawer-emoji">{taskEmoji(task.tag)}</div>
                      <h3 className="task-drawer-short-title">{(task as any).shortTitle || shortTag(task.tag)}</h3>
                      <p className="task-drawer-title">{task.title}</p>
                      <div className="task-drawer-divider" />
                      <p className="task-drawer-explanation">{task.body}</p>
                      {isCycleRow && (
                        <div className="task-drawer-cycle">
                          <CycleActionTile
                            taskTitle={task.title}
                            taskBody={task.body}
                            checked={checkedItems[idx]}
                            infoOpen={false}
                            phaseName={shortTag(task.tag)}
                            cyclePhase={session.cycle_phase_name}
                            onCheck={() => toggleTask(idx)}
                            onToggleInfo={() => {}}
                          />
                        </div>
                      )}
                    </div>
                    <div className="task-drawer-footer">
                      <button
                        type="button"
                        className={`task-drawer-check ${checkedItems[idx] ? 'checked' : ''}`}
                        onClick={() => { toggleTask(idx); closeCard(); }}
                      >
                        {checkedItems[idx] ? (
                          <>
                            <svg width="12" height="10" viewBox="0 0 11 9" fill="none">
                              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Done
                          </>
                        ) : 'Mark done'}
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          );
        })}

        {/* Footer: progress bar while incomplete, persistent completion state when all 3 done */}
        {showCelebration ? (
          <div className="tasks-complete-state">
            <div className="tasks-complete-check">
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="tasks-complete-body">
              <p className="tasks-complete-headline">
                Day {daysCompletedInPhase(session.save_count, session.phase_start_save_count)} done
                {dailyStreak >= 2
                  ? <span className="tasks-complete-streak"> · {dailyStreak} days in a row</span>
                  : dailyStreak === 1
                    ? <span className="tasks-complete-streak"> · First day</span>
                    : null
                }
              </p>
              <p className="tasks-complete-note">{getCompletionNote(session.cycle_phase_name, session.current_phase)}</p>
            </div>
          </div>
        ) : (
          <div className="tasks-footer">
            <span className="progress-text">{checkedItems.filter(Boolean).length}/3</span>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(checkedItems.filter(Boolean).length / 3) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Today's Learn card ── */}
      <div className="mastery-collapse" style={{ marginTop: '12px' }}>
        <button
          className="mastery-collapse-toggle"
          onClick={() => setLearnOpen((v) => !v)}
          aria-expanded={learnOpen}
        >
          <span className="mastery-collapse-label">📖 Today's Learn</span>
          <span className="mastery-collapse-hint">{todayLearn.tag} · tap to read</span>
          <svg
            className={`mastery-collapse-chevron ${learnOpen ? 'open' : ''}`}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {learnOpen && (
          <div className="mastery-collapse-body">
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>{todayLearn.title}</p>
            <p>{todayLearn.body}</p>
          </div>
        )}
      </div>

      {/* ── Nearest mastery nudge ── */}
      {nearestQuest && nearestQuestPct > 0 && (
        <button
          className="mastery-nudge"
          onClick={() => { setMasteryOpen(true); setTimeout(() => document.getElementById(`quest-row-${nearestQuest.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
        >
          <div className="mastery-nudge-label">Next unlock</div>
          <div className="mastery-nudge-text">
            <span className="mastery-nudge-title">{nearestQuest.title}</span>
            <span className="mastery-nudge-days">{nearestQuestDaysLeft} day{nearestQuestDaysLeft !== 1 ? 's' : ''} to go</span>
          </div>
          <div className="mastery-nudge-bar-wrap">
            <div className="mastery-nudge-bar" style={{ width: `${nearestQuestPct}%` }} />
          </div>
        </button>
      )}

      {/* ── Mastery unlocks — always accessible ── */}
      <div className="mastery-collapse">
        <button
          className="mastery-collapse-toggle"
          onClick={() => setMasteryOpen((v) => !v)}
          aria-expanded={masteryOpen}
        >
          <span className="mastery-collapse-label">Mastery unlocks</span>
          <span className="mastery-collapse-hint">{phase.name} phase progress</span>
          <svg
            className={`mastery-collapse-chevron ${masteryOpen ? 'open' : ''}`}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {masteryOpen && (
          <div className="mastery-collapse-body">
            <MasteryCard
              phaseNumber={session.current_phase}
              phaseName={phase.name}
              data={masteryData}
              highlightedId={highlightedQuestId}
              onToggle={handleMasteryToggle}
              onPickClick={handlePickClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
