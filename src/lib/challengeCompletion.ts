// Read/write layer for challenge instances -- mirrors completion.ts's role
// for the protocol (one place that writes state, applying the same guard
// rules the schema expects). Content (why/what/rules) lives in
// challenges.ts; pure progress math lives in challengeProgress.ts; this file
// is the only place that talks to camryn_challenge_* over the network.

import { supabase } from './supabase';
import { localToday, addLocalDays, formatLocalDate, daysBetweenLocal } from './date';
import type { ChallengeContent } from './challenges';
import {
  evaluateStreakChallenge,
  evaluateCumulativeChallenge,
  evaluateAuditChallenge,
  type StreakEvaluation,
  type CumulativeEvaluation,
  type AuditEvaluation,
} from './challengeProgress';

// The camryn_challenge_* tables and RPCs were added in
// 20260828130000_create_camryn_challenges.sql, after the last Supabase type
// generation, so they aren't in database.types.ts yet -- same untyped-client
// pattern completion.ts uses for daily_items. Safe to drop once
// database.types.ts is regenerated against the migrated project.
const db = supabase as unknown as import('@supabase/supabase-js').SupabaseClient;

export type ChallengeStatus = 'active' | 'paused' | 'completed' | 'failed' | 'abandoned';

export interface ChallengeInstanceRow {
  id: string;
  user_id: string;
  challenge_id: string;
  completion_type: 'streak' | 'cumulative' | 'audit';
  params: Record<string, unknown>;
  status: ChallengeStatus;
  accepted_date: string;
  window_ends_date: string | null;
  paused_at: string | null;
  paused_days_total: number;
  completed_at: string | null;
  failed_at: string | null;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoneyEntryRow {
  id: string;
  instance_id: string;
  source: string;
  amount: number;
  recurring: boolean;
  logged_date: string;
}

export interface AuditItemRow {
  id: string;
  instance_id: string;
  label: string;
  monthly_cost: number | null;
  used_recently: boolean | null;
}

// ── Discovery / history ──────────────────────────────────────────────────

export async function fetchActiveInstances(userId: string): Promise<ChallengeInstanceRow[]> {
  const { data, error } = await db
    .from('camryn_challenge_instances')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChallengeInstanceRow[];
}

export async function fetchInstanceHistory(userId: string): Promise<ChallengeInstanceRow[]> {
  const { data, error } = await db
    .from('camryn_challenge_instances')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['completed', 'failed', 'abandoned'])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChallengeInstanceRow[];
}

export async function fetchStreakDays(instanceId: string): Promise<string[]> {
  const { data, error } = await db
    .from('camryn_challenge_streak_days')
    .select('completed_date')
    .eq('instance_id', instanceId);
  if (error) throw error;
  return (data ?? []).map((d: { completed_date: string }) => d.completed_date);
}

export async function fetchMoneyEntries(instanceId: string): Promise<MoneyEntryRow[]> {
  const { data, error } = await db
    .from('camryn_challenge_money_entries')
    .select('*')
    .eq('instance_id', instanceId)
    .order('logged_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MoneyEntryRow[];
}

export async function fetchAuditItems(instanceId: string): Promise<AuditItemRow[]> {
  const { data, error } = await db
    .from('camryn_challenge_audit_items')
    .select('*')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as AuditItemRow[];
}

// ── Acceptance ────────────────────────────────────────────────────────────

export interface StartChallengeOptions {
  unlockLabel?: string;
  prerequisiteChallengeIds?: string[];
}

// Prerequisite checking and the insert happen together inside the
// start_challenge_instance RPC (one Postgres statement), not as a client-side
// "check then insert" -- a stale client can't start a challenge whose
// prerequisite was never actually completed, and a duplicate accidental
// double-tap hits the partial unique index and comes back as a clear
// 'challenge_already_active' error instead of a second row.
export async function startChallenge(
  userId: string,
  challenge: ChallengeContent,
  opts: StartChallengeOptions = {},
): Promise<ChallengeInstanceRow> {
  const acceptedDate = localToday();
  let windowEndsDate: string | null = null;
  const params: Record<string, unknown> = {};

  if (challenge.completion.type === 'streak') {
    windowEndsDate = addLocalDays(acceptedDate, challenge.completion.durationDays - 1);
    params.durationDays = challenge.completion.durationDays;
    params.tolerance = challenge.completion.tolerance;
  } else if (challenge.completion.type === 'cumulative') {
    windowEndsDate = addLocalDays(acceptedDate, challenge.completion.windowDays - 1);
    params.target = challenge.completion.target;
    params.unit = challenge.completion.unit;
  } else {
    params.reviewUnit = challenge.completion.reviewUnit;
    params.itemLabel = challenge.completion.itemLabel;
    params.markField = challenge.completion.markField;
    params.hasCost = challenge.completion.hasCost;
  }

  if (challenge.unlock?.kind === 'reward') {
    // Snapshotted onto the instance at acceptance -- editing the reward
    // later (or a future content edit to challenge.unlock.label) must never
    // retroactively change what an already-running instance is chasing.
    params.unlockLabel = opts.unlockLabel || challenge.unlock.label || undefined;
  }

  const { data, error } = await db.rpc('start_challenge_instance', {
    p_challenge_id: challenge.id,
    p_completion_type: challenge.completion.type,
    p_params: params,
    p_accepted_date: acceptedDate,
    p_window_ends_date: windowEndsDate,
    p_prerequisite_ids: opts.prerequisiteChallengeIds ?? challenge.prerequisites ?? [],
  });
  if (error) throw error;
  void userId; // ownership is enforced by auth.uid() inside the RPC, not this param
  return data as ChallengeInstanceRow;
}

// ── Streak progress ───────────────────────────────────────────────────────

export interface StreakDayLogResult {
  instance: ChallengeInstanceRow;
  evaluation: StreakEvaluation;
}

export async function logStreakDay(userId: string, instance: ChallengeInstanceRow): Promise<StreakDayLogResult> {
  const today = localToday();

  // ON CONFLICT DO NOTHING via ignoreDuplicates -- a double-tap or a retried
  // request the same day can't inflate a day into counting twice, backed by
  // the (instance_id, completed_date) unique constraint.
  const { error: insertError } = await db
    .from('camryn_challenge_streak_days')
    .upsert([{ instance_id: instance.id, user_id: userId, completed_date: today }], {
      onConflict: 'instance_id,completed_date',
      ignoreDuplicates: true,
    });
  if (insertError) throw insertError;

  const days = await fetchStreakDays(instance.id);
  const params = instance.params as { durationDays: number; tolerance: 'strict' | number; unlockLabel?: string };
  const evaluation = evaluateStreakChallenge(days, instance.accepted_date, params.durationDays, params.tolerance, today);

  let updatedInstance = instance;
  if (evaluation.isComplete) {
    updatedInstance = (await completeChallengeInstance(instance.id, !!params.unlockLabel)) ?? instance;
  } else if (evaluation.isBroken) {
    updatedInstance = (await failChallengeInstance(instance.id, userId)) ?? instance;
  }

  return { instance: updatedInstance, evaluation };
}

// ── Cumulative (money) progress ──────────────────────────────────────────

export interface MoneyEntryLogResult {
  instance: ChallengeInstanceRow;
  evaluation: CumulativeEvaluation;
}

export async function logMoneyEntry(
  userId: string,
  instance: ChallengeInstanceRow,
  entry: { source: string; amount: number; recurring: boolean },
): Promise<MoneyEntryLogResult> {
  if (entry.amount <= 0) throw new Error('Entry amount must be positive');

  const { error: insertError } = await db.from('camryn_challenge_money_entries').insert([
    {
      instance_id: instance.id,
      user_id: userId,
      source: entry.source,
      amount: entry.amount,
      recurring: entry.recurring,
      logged_date: localToday(),
    },
  ]);
  if (insertError) throw insertError;

  const entries = await fetchMoneyEntries(instance.id);
  const params = instance.params as { target: number; unlockLabel?: string };
  const evaluation = evaluateCumulativeChallenge(
    entries.map((e) => Number(e.amount)),
    params.target,
    instance.window_ends_date ?? localToday(),
  );

  let updatedInstance = instance;
  if (evaluation.isComplete) {
    updatedInstance = (await completeChallengeInstance(instance.id, !!params.unlockLabel)) ?? instance;
  } else if (evaluation.isExpired) {
    updatedInstance = (await failChallengeInstance(instance.id, userId)) ?? instance;
  }

  return { instance: updatedInstance, evaluation };
}

// Entries are correctable (a sale falling through) without touching the
// instance's status -- only the live sum matters, never a cached total, so
// removing an entry safely un-completes nothing that already finished.
export async function removeMoneyEntry(entryId: string, userId: string): Promise<void> {
  const { error } = await db.from('camryn_challenge_money_entries').delete().eq('id', entryId).eq('user_id', userId);
  if (error) throw error;
}

// ── Audit progress ────────────────────────────────────────────────────────

export async function addAuditItem(
  userId: string,
  instanceId: string,
  label: string,
  monthlyCost?: number,
): Promise<AuditItemRow> {
  const { data, error } = await db
    .from('camryn_challenge_audit_items')
    .insert([{ instance_id: instanceId, user_id: userId, label, monthly_cost: monthlyCost ?? null }])
    .select()
    .single();
  if (error) throw error;
  return data as AuditItemRow;
}

export interface AuditReviewResult {
  instance: ChallengeInstanceRow;
  evaluation: AuditEvaluation;
}

export async function reviewAuditItem(
  userId: string,
  instance: ChallengeInstanceRow,
  itemId: string,
  usedRecently: boolean,
): Promise<AuditReviewResult> {
  const { error: updateError } = await db
    .from('camryn_challenge_audit_items')
    .update({ used_recently: usedRecently, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('user_id', userId);
  if (updateError) throw updateError;

  const items = await fetchAuditItems(instance.id);
  const evaluation = evaluateAuditChallenge(
    items.map((i) => ({ monthlyCost: i.monthly_cost !== null ? Number(i.monthly_cost) : null, usedRecently: i.used_recently })),
  );

  // An audit's payoff is the found-money total, which is meant to seed a
  // follow-on challenge (e.g. Find $1,000) rather than grant a reward here
  // directly -- completing the review is the completion, so grantsUnlock is
  // always false for this type.
  const updatedInstance = evaluation.isComplete ? (await completeChallengeInstance(instance.id, false)) ?? instance : instance;

  return { instance: updatedInstance, evaluation };
}

// ── Pause / resume ────────────────────────────────────────────────────────

export async function pauseChallenge(instanceId: string, userId: string): Promise<ChallengeInstanceRow | null> {
  const { data, error } = await db
    .from('camryn_challenge_instances')
    .update({ status: 'paused', paused_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', instanceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ChallengeInstanceRow | null;
}

export async function resumeChallenge(instance: ChallengeInstanceRow, userId: string): Promise<ChallengeInstanceRow | null> {
  if (!instance.paused_at) return instance;

  // paused_at is a timestamptz (an absolute instant, unambiguous). Reading
  // it back through `new Date(...)` and its local getters -- never
  // toISOString() -- converts it to the browser's local calendar day the
  // same safe way localToday() does. This is what makes pausing actually
  // freeze the day-counter instead of just being cosmetic.
  const pausedOnDate = formatLocalDate(new Date(instance.paused_at));
  const pausedDays = Math.max(0, daysBetweenLocal(pausedOnDate, localToday()));

  const { data, error } = await db
    .from('camryn_challenge_instances')
    .update({
      status: 'active',
      paused_at: null,
      paused_days_total: instance.paused_days_total + pausedDays,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instance.id)
    .eq('user_id', userId)
    .eq('status', 'paused')
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ChallengeInstanceRow | null;
}

// ── Terminal transitions ─────────────────────────────────────────────────

// WHERE status IN ('active','paused') makes this idempotent: a retried call
// after a flaky response updates zero rows instead of double-failing an
// already-failed instance.
export async function failChallengeInstance(instanceId: string, userId: string): Promise<ChallengeInstanceRow | null> {
  const { data, error } = await db
    .from('camryn_challenge_instances')
    .update({ status: 'failed', failed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', instanceId)
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ChallengeInstanceRow | null;
}

export async function abandonChallengeInstance(instanceId: string, userId: string): Promise<ChallengeInstanceRow | null> {
  const { data, error } = await db
    .from('camryn_challenge_instances')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('id', instanceId)
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ChallengeInstanceRow | null;
}

// Routes through the complete_challenge_instance RPC, which guards the same
// way (WHERE status IN ('active','paused')) -- a retried completion call
// returns null instead of granting a second unlock. This is the direct fix
// for the class of bug that produced the camryn_unlocks duplicate rows.
export async function completeChallengeInstance(
  instanceId: string,
  grantsUnlock: boolean,
): Promise<ChallengeInstanceRow | null> {
  const { data, error } = await db.rpc('complete_challenge_instance', {
    p_instance_id: instanceId,
    p_grants_unlock: grantsUnlock,
  });
  if (error) throw error;
  return (data as ChallengeInstanceRow | null) ?? null;
}
