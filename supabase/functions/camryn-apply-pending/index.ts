// supabase/functions/camryn-apply-pending/index.ts
//
// Task 5 apply-logic — REVISED to add authentication.
//
// SECURITY FIX: this function previously had no auth check at all
// (verify_jwt: false, no secret) — anyone who found its URL could invoke
// it and process every pending row. That was tolerable while it was only
// ever invoked manually by a developer. Now that camryn-intake calls this
// automatically (see the trigger added to camryn-intake), it needs to be
// closed to the public internet. Reuses CAMRYN_INTAKE_SECRET (already
// configured in this project) rather than introducing a second secret.
//
// SCOPE (unchanged from the original version): only replicates
// camryn_daily_saves and camryn_sessions.save_count. camryn_unlocks and
// daily_items remain deliberately deferred — see the build brief.

import { createClient } from 'npm:@supabase/supabase-js@2';

const INTAKE_SECRET = Deno.env.get('CAMRYN_INTAKE_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  const providedSecret = req.headers.get('x-camryn-intake-secret');
  if (!INTAKE_SECRET || providedSecret !== INTAKE_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  const { data: pendingRows, error: fetchError } = await supabase
    .from('camryn_pending_writes')
    .select()
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (fetchError) {
    return json({ error: fetchError.message }, 500);
  }

  const results: Array<{ id: string; applied: boolean; error?: string }> = [];

  for (const row of pendingRows ?? []) {
    try {
      const { data: savedRow, error: saveError } = await supabase
        .from('camryn_daily_saves')
        .upsert(
          [
            {
              user_id: row.user_id,
              save_date: row.target_date,
              tasks_complete: row.tasks_complete,
              tasks_total: row.tasks_total,
              is_complete: row.tasks_complete === row.tasks_total,
            },
          ],
          { onConflict: 'user_id,save_date' }
        )
        .select()
        .single();

      if (saveError) throw saveError;

      const { data: currentSession, error: sessionReadError } = await supabase
        .from('camryn_sessions')
        .select('save_count')
        .eq('user_id', row.user_id)
        .maybeSingle();

      if (sessionReadError) throw sessionReadError;

      if (currentSession) {
        const { error: sessionWriteError } = await supabase
          .from('camryn_sessions')
          .update({ save_count: (currentSession.save_count ?? 0) + 1 })
          .eq('user_id', row.user_id);

        if (sessionWriteError) throw sessionWriteError;
      }

      const { error: applyError } = await supabase
        .from('camryn_pending_writes')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_daily_save_id: savedRow?.id ?? null,
        })
        .eq('id', row.id);

      if (applyError) throw applyError;

      results.push({ id: row.id, applied: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      await supabase
        .from('camryn_pending_writes')
        .update({ status: 'rejected' })
        .eq('id', row.id);

      results.push({ id: row.id, applied: false, error: message });
    }
  }

  return json({ processed: results.length, results });
});
