import { createClient } from '@supabase/supabase-js';

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
  priorityTaskTitle: string | null;
}

export async function syncToFrontDoor(payload: CamrynSyncPayload): Promise<void> {
  try {
    await Promise.all([
      upsertCamrynState(payload),
      payload.priorityTaskTitle ? upsertDailyItem(payload.priorityTaskTitle, payload.energy, payload.userId) : Promise.resolve(),
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

async function upsertDailyItem(taskTitle: string, energy: string, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const sourceId = `camryn-${userId.slice(0, 8)}-${today}`;
  const { data: existing } = await supabase.from('daily_items').select('id, completion_state').eq('source_id', sourceId).maybeSingle();
  if (existing) {
    if (existing.completion_state === 'pending') { await supabase.from('daily_items').update({ title: taskTitle, updated_at: new Date().toISOString() }).eq('id', existing.id); }
    return;
  }
  const energyFit = energy === 'High' ? 'high' : energy === 'Low' ? 'low' : 'medium';
  await supabase.from('daily_items').insert({ source_app: 'camryn', source_id: sourceId, title: taskTitle, domain: 'wellness', priority: 2, energy_fit: energyFit, estimated_minutes: 20, due_today: true, scheduled_date: today, completion_state: 'pending', is_hero: false, display_order: 40, user_id: userId });
}
