// The one place Camryn's frontend writes "did the user complete task X
// today" -- consolidates what used to be four independent write paths
// (MainContent's toggle effect, App.tsx's handleSaveDay, JournalSection's
// quest-recognition save, ProfileSection's reset) into three functions with
// one clear contract each. See /Users/theresamcfadyen/.claude/plans for the
// full context on why this exists.
//
// Two-tier model, not a single flat structure:
//   Tier 1 (quest-linked, drives streaks/mastery %): mastery_data.
//   Tier 2 (today's 3 task slots, drives checkboxes/save_count/streak):
//     camryn_daily_saves.checked_items -- needed because every "Cycle · *"
//     task tag maps to no quest at all (see TAG_TO_QUEST in protocol.ts),
//     so Tier 1 alone can never represent "was slot 2 checked today."

import { supabase } from './supabase';
import {
  type AllPhaseMastery,
  type MasteryData,
  toggleToday,
  isTodayCompleted,
  calcStreak,
  saveAllMastery,
  blankAllMastery,
} from './mastery';
import { syncToFrontDoor } from '../services/camrynSyncService';

function phaseKey(phase: number): keyof AllPhaseMastery {
  if (phase === 2) return 'phase2';
  if (phase === 3) return 'phase3';
  if (phase === 4) return 'phase4';
  if (phase === 5) return 'phase5';
  if (phase === 6) return 'phase6';
  return 'phase1';
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Toggles one quest's completedDates for today, applying the exact same
// guard rules MainContent's autoMarkQuest already used (ported verbatim,
// not re-derived): no-op if already in the desired state, and don't let a
// quest that's already reached its target get a new completion date added
// for "today" if today wasn't the day that finished it.
function toggleQuestForToday(phaseData: MasteryData, questId: string, checked: boolean): MasteryData | null {
  const qs = phaseData.quests[questId];
  if (!qs) return null;
  const alreadyDone = isTodayCompleted(qs.completedDates);
  const streak = calcStreak(qs.completedDates, qs.targetDays);
  const isComplete = streak >= qs.targetDays;
  const noop = (checked && alreadyDone) || (!checked && !alreadyDone) || (isComplete && !alreadyDone);
  if (noop) return null;
  return {
    ...phaseData,
    quests: {
      ...phaseData.quests,
      [questId]: { ...qs, completedDates: toggleToday(qs.completedDates) },
    },
  };
}

export interface RecordSlotCompletionParams {
  userId: string;
  phase: number;
  questId: string | null;
  checked: boolean;
  allMastery: AllPhaseMastery;
  allChecked: boolean[];
  taskShortTitles: string[];
  energy: string;
}

export interface CompletionResult {
  mastery: AllPhaseMastery;
  saveCount: number;
}

// One of today's 3 visible task slots changed. Updates the backing quest
// (if any), upserts today's camryn_daily_saves row (now including which
// exact slots are checked, not just the count), recomputes the true
// save_count, and mirrors to Front Door -- in that order, matching the
// original call order in App.tsx's handleSaveDay so behavior doesn't shift.
export async function recordSlotCompletion(params: RecordSlotCompletionParams): Promise<CompletionResult> {
  const { userId, phase, questId, checked, allMastery, allChecked, taskShortTitles, energy } = params;
  const pKey = phaseKey(phase);
  let mastery = allMastery;

  if (questId) {
    const updatedPhaseData = toggleQuestForToday(mastery[pKey], questId, checked);
    if (updatedPhaseData) {
      mastery = { ...mastery, [pKey]: updatedPhaseData };
      await saveAllMastery(userId, mastery);
    }
  }

  const today = localToday();
  const tasksComplete = allChecked.filter(Boolean).length;
  const tasksTotal = allChecked.length;
  const isDayComplete = tasksComplete === tasksTotal;

  const { error: dailySaveError } = await supabase
    .from('camryn_daily_saves')
    .upsert([{
      user_id: userId,
      save_date: today,
      tasks_complete: tasksComplete,
      tasks_total: tasksTotal,
      is_complete: isDayComplete,
      checked_items: allChecked,
    }], { onConflict: 'user_id,save_date' });
  if (dailySaveError) throw dailySaveError;

  const { count: realSaveCount, error: countError } = await supabase
    .from('camryn_daily_saves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_complete', true);
  if (countError) throw countError;
  const saveCount = realSaveCount ?? 0;

  const { error: sessionError } = await supabase
    .from('camryn_sessions')
    .update({ save_count: saveCount })
    .eq('user_id', userId);
  if (sessionError) throw sessionError;

  syncToFrontDoor({ userId, energy, taskShortTitles, checkedItems: allChecked }).catch(() => {});

  return { mastery, saveCount };
}

// A quest was recognized from a chat message (JournalSection), not a
// checkbox tap. Mirrors the "mark done, never unmark" batch logic that
// lived inline in JournalSection before -- chat recognition only ever adds
// a completion, so this intentionally doesn't route through
// recordSlotCompletion's checked=false path.
export async function markQuestsCompleted(
  userId: string,
  phase: number,
  questIds: string[],
  allMastery: AllPhaseMastery,
): Promise<AllPhaseMastery | null> {
  const pKey = phaseKey(phase);
  let phaseData = allMastery[pKey];
  let changed = false;

  for (const questId of questIds) {
    const qs = phaseData.quests[questId];
    if (!qs || isTodayCompleted(qs.completedDates)) continue;
    phaseData = {
      ...phaseData,
      quests: {
        ...phaseData.quests,
        [questId]: { ...qs, completedDates: toggleToday(qs.completedDates) },
      },
    };
    changed = true;
  }

  if (!changed) return null;
  const updated: AllPhaseMastery = { ...allMastery, [pKey]: phaseData };
  await saveAllMastery(userId, updated);
  return updated;
}

// The one reset routine -- both ProfileSection's manual reset and App.tsx's
// protocol restart call this instead of each hand-rolling their own blank
// state and their own recompute-and-snapshot logic.
export async function resetAllCompletion(userId: string): Promise<CompletionResult> {
  const mastery = blankAllMastery();
  await saveAllMastery(userId, mastery);

  // save_count is a live recompute (see recordSlotCompletion above) and
  // can't be forced to 0 and stay there -- the next save would reassert the
  // true historical count. Snapshot both save_count and phase_start_save_count
  // to the same true value instead, exactly like normal phase advancement
  // already does (App.tsx: phase_start_save_count: session.save_count).
  const { count: trueSaveCount, error: countError } = await supabase
    .from('camryn_daily_saves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_complete', true);
  if (countError) throw countError;
  const saveCount = trueSaveCount ?? 0;

  const { error: sessionError } = await supabase
    .from('camryn_sessions')
    .update({ save_count: saveCount, phase_start_save_count: saveCount })
    .eq('user_id', userId);
  if (sessionError) throw sessionError;

  const today = localToday();
  const { error: todaySaveError } = await supabase
    .from('camryn_daily_saves')
    .update({ checked_items: null, tasks_complete: 0, is_complete: false })
    .eq('user_id', userId)
    .eq('save_date', today);
  // Non-fatal: if today has no row yet, there's nothing to clear.
  if (todaySaveError) console.error('resetAllCompletion: could not clear today’s checked_items:', todaySaveError);

  // The Front Door widget (daily_items, a table shared with other systems)
  // independently remembers today's task completions and re-applies them
  // the moment the Today screen reloads, silently undoing the reset for
  // anything completed earlier today. Scoped tightly to today + this user +
  // Camryn's own rows so nothing outside this reset's intent is touched.
  const untypedSupabase = supabase as unknown as import('@supabase/supabase-js').SupabaseClient;
  const { error: frontDoorError } = await untypedSupabase
    .from('daily_items')
    .update({ completion_state: 'pending' })
    .eq('user_id', userId)
    .eq('source_app', 'camryn')
    .eq('scheduled_date', today);
  if (frontDoorError) console.error('resetAllCompletion: front door completion reset failed:', frontDoorError);

  return { mastery, saveCount };
}
