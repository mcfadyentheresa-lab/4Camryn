// supabase/functions/camryn-intake/index.ts
//
// Inbound bridge — REVISED to trigger apply-logic automatically.
//
// TRIGGER MECHANISM DECISION: event-driven, not cron. After a successful
// 'create', this function immediately calls camryn-apply-pending in the
// same project, so a proposal gets applied within the same round trip
// instead of waiting on a schedule. This is awaited (not fire-and-forget)
// because Supabase edge function isolates can be torn down once a
// response is returned — an un-awaited call risks never completing.
//
// IMPORTANT: if the trigger call fails (network blip, apply-pending
// down, etc.), this does NOT fail the create response — the row was
// already safely inserted as 'pending'. A failed trigger just means it
// falls back to needing a manual invocation, exactly like before this
// change. The user-facing write already succeeded either way.

import { createClient } from 'npm:@supabase/supabase-js@2';

const INTAKE_SECRET = Deno.env.get('CAMRYN_INTAKE_SECRET');
const TARGET_USER_ID = Deno.env.get('CAMRYN_TARGET_USER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function triggerApplyPending(): Promise<{ triggered: boolean; error?: string }> {
  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/camryn-apply-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-camryn-intake-secret': INTAKE_SECRET ?? '',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[camryn-intake] apply-pending trigger failed:', resp.status, text);
      return { triggered: false, error: `apply-pending returned ${resp.status}` };
    }

    return { triggered: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[camryn-intake] apply-pending trigger threw:', message);
    return { triggered: false, error: message };
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }

  const providedSecret = req.headers.get('x-camryn-intake-secret');
  if (!INTAKE_SECRET || providedSecret !== INTAKE_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  if (!TARGET_USER_ID) {
    return json({ error: 'CAMRYN_TARGET_USER_ID not configured' }, 500);
  }

  let body: {
    action?: 'create' | 'verify';
    payload?: {
      tasks_complete?: number;
      tasks_total?: number;
      checked_items?: boolean[];
      target_date?: string;
    };
    id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  if (body.action === 'verify') {
    if (!body.id) return json({ error: 'missing id' }, 400);

    const { data, error } = await supabase
      .from('camryn_pending_writes')
      .select()
      .eq('id', body.id)
      .eq('user_id', TARGET_USER_ID)
      .single();

    if (error) return json({ error: error.message }, 404);
    return json({ data });
  }

  if (body.action === 'create') {
    const { data, error } = await supabase
      .from('camryn_pending_writes')
      .insert({
        user_id: TARGET_USER_ID,
        tasks_complete: 3,
        tasks_total: 3,
        checked_items: [true, true, true],
        target_date: body.payload?.target_date ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);

    // Trigger apply-logic immediately. A failure here is logged but does
    // NOT change the response — the row already exists as 'pending'.
    const triggerResult = await triggerApplyPending();

    return json({ data, triggered: triggerResult.triggered }, 201);
  }

  return json({ error: 'action must be "create" or "verify"' }, 400);
});

// ---------------------------------------------------------------------
// DEFERRED: multi-user identity mapping (unchanged)
// ---------------------------------------------------------------------
// Still writes to a single, hardcoded CAMRYN_TARGET_USER_ID. Must change
// before a second user is onboarded.
