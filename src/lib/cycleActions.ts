import { supabase } from './supabase';

export interface CycleProtocolAction {
  phase: string;
  protocolActionId: string;
}

export interface CycleIntentionalAction {
  phase: string;
  text: string;
  done: boolean;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

export async function getProtocolActionPick(): Promise<CycleProtocolAction | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('cycle_action_pick')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data?.cycle_action_pick) return null;
  const pick = data.cycle_action_pick as Record<string, CycleProtocolAction>;
  return pick[today()] ?? null;
}

export async function saveProtocolActionPick(phase: string, protocolActionId: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('cycle_action_pick')
    .eq('user_id', userId)
    .maybeSingle();
  const existing = (data?.cycle_action_pick as Record<string, CycleProtocolAction>) ?? {};
  existing[today()] = { phase, protocolActionId };
  await supabase
    .from('camryn_sessions')
    .update({ cycle_action_pick: existing })
    .eq('user_id', userId);
}

export async function clearProtocolActionPick(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('cycle_action_pick')
    .eq('user_id', userId)
    .maybeSingle();
  const existing = (data?.cycle_action_pick as Record<string, CycleProtocolAction>) ?? {};
  delete existing[today()];
  await supabase
    .from('camryn_sessions')
    .update({ cycle_action_pick: existing })
    .eq('user_id', userId);
}

export async function getIntentionalAction(): Promise<CycleIntentionalAction | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('intentional_action')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data?.intentional_action) return null;
  const actions = data.intentional_action as Record<string, CycleIntentionalAction>;
  return actions[today()] ?? null;
}

export async function saveIntentionalAction(phase: string, text: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('intentional_action')
    .eq('user_id', userId)
    .maybeSingle();
  const existing = (data?.intentional_action as Record<string, CycleIntentionalAction>) ?? {};
  const current = existing[today()];
  existing[today()] = { phase, text, done: current?.done ?? false };
  await supabase
    .from('camryn_sessions')
    .update({ intentional_action: existing })
    .eq('user_id', userId);
}

export async function toggleIntentionalDone(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { data } = await supabase
    .from('camryn_sessions')
    .select('intentional_action')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data?.intentional_action) return;
  const existing = data.intentional_action as Record<string, CycleIntentionalAction>;
  const entry = existing[today()];
  if (!entry) return;
  existing[today()] = { ...entry, done: !entry.done };
  await supabase
    .from('camryn_sessions')
    .update({ intentional_action: existing })
    .eq('user_id', userId);
}
