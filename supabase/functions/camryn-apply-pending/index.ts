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
// SCOPE: replicates camryn_daily_saves, camryn_sessions.save_count, and
// (as of the completion-tracking consolidation) reconciles daily_items so a
// pending-write-driven completion looks identical to a direct Front Door
// write once applied -- see reconcileDailyItems below. camryn_unlocks
// remains deferred. mastery_data is NOT reconciled here: quest-linked task
// slots would need the same task-generation logic src/lib/protocol.ts
// implements client-side, and duplicating that in Deno isn't worth it for
// a single-user app -- if the pending write lands while the Camryn tab is
// closed, save_count and daily_items update immediately but mastery_data
// lags until the app is next opened, same as a direct Front Door write to
// daily_items already behaves today.

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

// Update-only mirror into daily_items, matching the source_id convention
// and idempotent done/pending transitions the frontend's own
// upsertDailyItems (camrynSyncService.ts) already uses. Update-only is
// deliberate: if no daily_items row exists yet for a slot, there's nothing
// to reconcile -- the frontend creates it correctly next time the app
// opens. Best-effort: a failure here must never fail the pending write
// itself, since camryn_daily_saves is the write that actually matters.
async function reconcileDailyItems(userId: string, targetDate: string, checkedItems: unknown): Promise<void> {
  if (!Array.isArray(checkedItems)) return;

  await Promise.all(checkedItems.slice(0, 3).map(async (isChecked: unknown, idx: number) => {
    const sourceId = `camryn-${userId.slice(0, 8)}-${targetDate}-${idx}`;
    const { data: existing } = await supabase
      .from('daily_items')
      .select('id, completion_state')
      .eq('source_id', sourceId)
      .maybeSingle();
    if (!existing) return;

    if (isChecked === true && existing.completion_state === 'pending') {
      await supabase
        .from('daily_items')
        .update({ completion_state: 'done', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else if (isChecked === false && existing.completion_state === 'done') {
      await supabase
        .from('daily_items')
        .update({ completion_state: 'pending', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    }
  }));
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
              checked_items: row.checked_items ?? null,
            },
          ],
          { onConflict: 'user_id,save_date' }
        )
        .select()
        .single();

      if (saveError) throw saveError;

      const { count: realSaveCount, error: countError } = await supabase
        .from('camryn_daily_saves')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', row.user_id)
        .eq('is_complete', true);
      if (countError) throw countError;
      if (realSaveCount !== null) {
        const { error: sessionWriteError } = await supabase
          .from('camryn_sessions')
          .update({ save_count: realSaveCount })
          .eq('user_id', row.user_id);
        if (sessionWriteError) throw sessionWriteError;
      }

      try {
        await reconcileDailyItems(row.user_id, row.target_date, row.checked_items);
      } catch (reconcileErr) {
        console.error('daily_items reconcile failed (non-fatal):', reconcileErr);
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
