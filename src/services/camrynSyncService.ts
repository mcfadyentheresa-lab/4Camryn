import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

export interface CamrynSyncPayload {
  userId: string;
  protocolPhase: number;
  protocolPhaseName: string;
  cyclePhase: string;
  energy: string;
  stress: string;
  dailyStreak: number;
  savedToday: boolean;
  tasksComplete: number;
  tasksTotal: number;
  protocolComplete: boolean;
  taskShortTitles: string[]; // all 3 task short titles
  checkedItems?: boolean[]; // which of the 3 tasks are checked off
}

export async function syncToFrontDoor(payload: CamrynSyncPayload): Promise<void> {
  try {
    await Promise.all([
      upsertCamrynState(payload),
      upsertDailyItems(payload.taskShortTitles, payload.energy, payload.userId, payload.checkedItems),
    ]);
  } catch (err) {
    console.error('[camrynSync] sync failed:', err);
  }
}

async function upsertCamrynState(p: CamrynSyncPayload) {
  const payload = { protocol_phase: p.protocolPhase, protocol_phase_name: p.protocolPhaseName, cycle_phase_name: p.cyclePhase, energy_level: p.energy, stress_level: p.stress, daily_streak: p.dailyStreak, saved_today: p.savedToday, tasks_complete: p.tasksComplete, tasks_total: p.tasksTotal, protocol_complete: p.protocolComplete, updated_at: new Date().toISOString() };
  const { data: existing } = await supabase.from('camryn_state').select('id').eq('user_id', p.userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (existing) { await supabase.from('camryn_state').update(payload).eq('id', existing.id); }
  else { await supabase.from('camryn_state').insert({ ...payload, user_id: p.userId }); }
}

export async function upsertChatTask(userId: string, title: string, energy: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sourceId = `camryn-chat-${userId.slice(0, 8)}-${today}`;
    const { data: existing } = await supabase.from('daily_items').select('id, completion_state').eq('source_id', sourceId).maybeSingle();
    if (existing) {
      if (existing.completion_state === 'pending') { await supabase.from('daily_items').update({ title, updated_at: new Date().toISOString() }).eq('id', existing.id); }
      return;
    }
    const energyFit = energy === 'High' ? 'high' : energy === 'Low' ? 'low' : 'medium';
    await supabase.from('daily_items').insert({ source_app: 'camryn', source_id: sourceId, title, domain: 'wellness', priority: 2, energy_fit: energyFit, estimated_minutes: 20, due_today: true, scheduled_date: today, completion_state: 'pending', is_hero: false, display_order: 45, unlock_order: 0, user_id: userId });
  } catch (err) {
    console.error('[camrynSync] upsertChatTask failed:', err);
  }
}

async function upsertDailyItems(taskShortTitles: string[], energy: string, userId: string, checkedItems?: boolean[]) {
  const today = new Date().toISOString().split('T')[0];
  const energyFit = energy === 'High' ? 'high' : energy === 'Low' ? 'low' : 'medium';

  await Promise.all(taskShortTitles.slice(0, 3).map(async (title, idx) => {
    const sourceId = `camryn-${userId.slice(0, 8)}-${today}-${idx}`;
    const isChecked = checkedItems ? checkedItems[idx] === true : false;
    const { data: existing } = await supabase.from('daily_items').select('id, completion_state').eq('source_id', sourceId).maybeSingle();

    if (existing) {
      // If Camryn just checked this off, write it to Front Door
      if (isChecked && existing.completion_state === 'pending') {
        await supabase.from('daily_items').update({ completion_state: 'done', updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else if (!isChecked && existing.completion_state === 'pending') {
        // Update title only when still pending
        await supabase.from('daily_items').update({ title, updated_at: new Date().toISOString() }).eq('id', existing.id);
      }
      return;
    }

    await supabase.from('daily_items').insert({
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
      unlock_order: idx, // 0 = first, 1 = unlocks after 0 done, 2 = unlocks after 1 done
      user_id: userId,
    });
  }));
}

// Returns the task indices (0, 1, or 2) that were completed in Front Door today.
export async function fetchFrontDoorCompletions(userId: string): Promise<number[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
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
  const today = new Date().toISOString().split('T')[0];
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
