// supabase/functions/camryn-status/index.ts
//
// Read bridge for Camryn — the missing fourth. Same shape as
// dream-status/quest-status/book-status. Reads from the real, working
// tables confirmed earlier this project (camryn_daily_saves,
// camryn_sessions) — NOT camryn_state, which is confirmed dead code
// (referenced by Camryn's own sync but the table doesn't exist).
//
// Reuses CAMRYN_TARGET_USER_ID, already configured and in active use by
// camryn-intake and camryn-apply-pending — same real account
// (f47fbc4f-83fe-4933-a913-cc6a2dd843d2) confirmed throughout this
// project.
import { createClient } from 'npm:@supabase/supabase-js@2';
const STATUS_SECRET = Deno.env.get('CAMRYN_STATUS_SECRET');
const TARGET_USER_ID = Deno.env.get('CAMRYN_TARGET_USER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    },
  });
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    }});
  }
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }
  const providedSecret = req.headers.get('x-camryn-status-secret');
  if (!STATUS_SECRET || providedSecret !== STATUS_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }
  if (!TARGET_USER_ID) {
    return json({ error: 'CAMRYN_TARGET_USER_ID not configured' }, 500);
  }
  const { data: latestSave, error: saveError } = await supabase
    .from('camryn_daily_saves')
    .select('tasks_complete, tasks_total, is_complete, save_date')
    .eq('user_id', TARGET_USER_ID)
    .order('save_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (saveError) return json({ error: saveError.message }, 500);
  const { data: session, error: sessionError } = await supabase
    .from('camryn_sessions')
    .select('save_count, current_phase, energy')
    .eq('user_id', TARGET_USER_ID)
    .maybeSingle();
  if (sessionError) return json({ error: sessionError.message }, 500);
  return json({
    data: {
      tasks_complete: latestSave?.tasks_complete ?? null,
      tasks_total: latestSave?.tasks_total ?? null,
      is_complete: latestSave?.is_complete ?? null,
      save_date: latestSave?.save_date ?? null,
      save_count: session?.save_count ?? null,
      current_phase: session?.current_phase ?? null,
      energy: session?.energy ?? null,
      queried_at: new Date().toISOString(),
    },
  });
});
// ---------------------------------------------------------------------
// DEFERRED: multi-user identity mapping (same caveat as every bridge
// built this project). Hardcoded to a single CAMRYN_TARGET_USER_ID.
// ---------------------------------------------------------------------
