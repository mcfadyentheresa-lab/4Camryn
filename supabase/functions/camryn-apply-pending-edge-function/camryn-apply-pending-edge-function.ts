// supabase/functions/camryn-apply-pending/index.ts
//
// Task 5: Camryn's apply-logic. Reads camryn_pending_writes rows with
// status='pending' and applies them.
//
// SCOPE DECISION, stated explicitly: this replicates only 2 of the 5
// writes handleSaveDay performs:
//   - camryn_daily_saves  (INCLUDED — simple upsert, safe)
//   - camryn_sessions.save_count  (INCLUDED — simple counter increment)
//   - camryn_unlocks      (DEFERRED — requires porting PROTOCOL mastery/
//                          countdown logic; getting this wrong risks
//                          corrupting real protocol progression)
//   - daily_items          (DEFERRED — requires replicating dailyTasks()
//                          task-title generation from phase/energy/stress;
//                          skipping this means Front Door's own "Today
//                          with Camryn" display won't immediately reflect
//                          a Front-Door-initiated completion, a cosmetic
//                          gap, not a correctness one)
//   - camryn_state         (SKIPPED ENTIRELY — confirmed dead code, table
//                          doesn't exist; not worth replicating a broken
//                          write)
//
// This function is NOT the same code as handleSaveDay — it's an
// independent re-implementation of a subset of its behavior, since
// handleSaveDay is tangled in React component state and can't be called
// directly from a server-side function. Drift between the two is a real,
// accepted risk of this design — if handleSaveDay's logic changes later,
// this function needs to be updated separately, by hand.
//
// This function should be invoked on a schedule (e.g. Supabase cron) or
// triggered after camryn-intake creates a new pending row — trigger
// mechanism is a deployment decision, not decided in this file.

import { createClient } from 'npm:@supabase/supabase-js@2';

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

  // Fetch all pending rows (in a solo-user deployment this is at most a
  // handful; if this ever needs to scale, add a LIMIT and pagination).
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
      // 1. camryn_daily_saves — matches handleSaveDay lines 426-436
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

      // 2. camryn_sessions.save_count — matches updateSessionField in
      //    handleSaveDay line 447. Read-then-write, since there's no
      //    atomic increment via the JS client for a dynamic column.
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
      // If no session row exists yet, deliberately skip rather than
      // guess at creating one — that's a state this app shouldn't be in
      // for a real user, and manufacturing a session row server-side
      // risks masking a genuine problem instead of surfacing it.

      // Mark this pending write applied, with a pointer back to the
      // real check-in it produced.
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

      // Mark rejected rather than leaving it silently stuck as pending
      // forever — this is what lets Front Door's verify polling
      // eventually surface a real failure instead of timing out vaguely.
      await supabase
        .from('camryn_pending_writes')
        .update({ status: 'rejected' })
        .eq('id', row.id);

      results.push({ id: row.id, applied: false, error: message });
    }
  }

  return json({ processed: results.length, results });
});
