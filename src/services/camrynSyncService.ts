import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from '../lib/supabase';

// daily_items is a shared FrontDoor table not in database.types.ts, so this
// stays untyped rather than typing it against the app's own Database
// interface. Previously this created its own createClient() instance,
// which produced a second GoTrueClient in the same browser context
// (Supabase's own warning: "may produce undefined behavior when used
// concurrently under the same storage key"). Reusing the one client the
// rest of the app already has avoids that entirely.
const supabase = typedSupabase as unknown as SupabaseClient;

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface CamrynSyncPayload {
  userId: string;
  energy: string;
  taskShortTitles: string[]; // all 3 task short titles
  checkedItems?: boolean[]; // which of the 3 tasks are checked off
}

export async function syncToFrontDoor(payload: CamrynSyncPayload): Promise<void> {
  try {
    await upsertDailyItems(payload.taskShortTitles, payload.energy, payload.userId, payload.checkedItems);
  } catch (err) {
    console.error('[camrynSync] sync failed:', err);
  }
}

export async function upsertChatTask(userId: string, title: string, energy: string): Promise<void> {
  try {
    const today = localToday();
    const sourceId = `camryn-chat-${userId.slice(0, 8)}-${today}`;
    const { data: existing } = await supabase.from('daily_items').select('id, completion_state').eq('source_id', sourceId).maybeSingle();
    if (existing) {
      if (existing.completion_state === 'pending') {
        const { error } = await supabase.from('daily_items').update({ title, updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) console.error('[camrynSync] upsertChatTask update failed:', error);
      }
      return;
    }
    const energyFit = energy === 'High' ? 'high' : energy === 'Low' ? 'low' : 'medium';
    const { error } = await supabase.from('daily_items').insert({ source_app: 'camryn', source_id: sourceId, title, domain: 'wellness', priority: 2, energy_fit: energyFit, estimated_minutes: 20, due_today: true, scheduled_date: today, completion_state: 'pending', is_hero: false, display_order: 45, unlock_order: 0, user_id: userId });
    if (error) console.error('[camrynSync] upsertChatTask insert failed:', error);
  } catch (err) {
    console.error('[camrynSync] upsertChatTask failed:', err);
  }
}

async function upsertDailyItems(taskShortTitles: string[], energy: string, userId: string, checkedItems?: boolean[]) {
  const today = localToday();
  const energyFit = energy === 'High' ? 'high' : energy === 'Low' ? 'low' : 'medium';

  await Promise.all(taskShortTitles.slice(0, 3).map(async (title, idx) => {
    const sourceId = `camryn-${userId.slice(0, 8)}-${today}-${idx}`;
    const isChecked = checkedItems ? checkedItems[idx] === true : false;
    const { data: existing } = await supabase.from('daily_items').select('id, completion_state').eq('source_id', sourceId).maybeSingle();

    if (existing) {
      if (isChecked && existing.completion_state === 'pending') {
        const { error } = await supabase.from('daily_items').update({ completion_state: 'done', updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) console.error('[camrynSync] mark-done update failed:', error);
      } else if (!isChecked && existing.completion_state === 'done') {
        // Previously missing: nothing reverted a 'done' row back to 'pending'
        // when a task got unchecked, so unchecking in the Camryn UI never
        // stuck -- Front Door's stale 'done' state would just re-mark it
        // checked again on the next load.
        const { error } = await supabase.from('daily_items').update({ completion_state: 'pending', updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) console.error('[camrynSync] mark-pending update failed:', error);
      } else if (!isChecked && existing.completion_state === 'pending') {
        const { error } = await supabase.from('daily_items').update({ title, updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) console.error('[camrynSync] title update failed:', error);
      }
      return;
    }

    const { error } = await supabase.from('daily_items').insert({
      source_app: 'camryn',
      source_id: sourceId,
      title,
      domain: 'wellness',
      priority: 2,
      energy_fit: energyFit,
      estimated_minutes: 20,
      due_today: true,
      scheduled_date: today,
      completion_state: isChecked ? 'done' : 'pending',
      is_hero: false,
      display_order: 40 + idx,
      unlock_order: idx,
      user_id: userId,
    });
    if (error) console.error('[camrynSync] daily item insert failed:', error);
  }));
}

// Returns the task indices (0, 1, or 2) that were completed in Front Door today.
export async function fetchFrontDoorCompletions(userId: string): Promise<number[]> {
  try {
    const today = localToday();
    const prefix = `camryn-${userId.slice(0, 8)}-${today}-`;
    const { data } = await supabase
      .from('daily_items')
      .select('source_id, completion_state')
      .like('source_id', `${prefix}%`)
      .eq('user_id', userId);
    if (!data) return [];
    return data
      .filter((r) => r.completion_state === 'done' || r.completion_state === 'completed')
      .map((r) => parseInt(r.source_id.replace(prefix, ''), 10))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 2);
  } catch {
    return [];
  }
}

// Subscribe to real-time changes on daily_items for this user today.
// Calls onUpdate with the new array of completed task indices whenever Front Door checks something off.
export function subscribeFrontDoorCompletions(
  userId: string,
  onUpdate: (completedIndices: number[]) => void,
): RealtimeChannel {
  const today = localToday();
  const prefix = `camryn-${userId.slice(0, 8)}-${today}-`;

  const channel = supabase
    .channel(`daily-items-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'daily_items',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // Re-fetch all today's completions on any update
        const { data } = await supabase
          .from('daily_items')
          .select('source_id, completion_state')
          .like('source_id', `${prefix}%`)
          .eq('user_id', userId);
        if (!data) return;
        const completed = data
          .filter((r) => r.completion_state === 'done' || r.completion_state === 'completed')
          .map((r) => parseInt(r.source_id.replace(prefix, ''), 10))
          .filter((n) => !isNaN(n) && n >= 0 && n <= 2);
        onUpdate(completed);
      },
    )
    .subscribe();

  return channel;
}
