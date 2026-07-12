// supabase/functions/camryn-write-proxy/index.ts
//
// Front Door's outbound half of the Camryn write bridge. The frontend
// calls THIS function (same project, normal user-session auth) rather
// than trying to write to camryn_pending_writes directly — that table
// lives in Camryn's separate Supabase project and is not reachable from
// Front Door's client at all.
//
// This function holds the shared secret server-side (Deno.env). A
// client-side call embedding the secret directly would let anyone with
// browser dev tools extract it and forge writes into Camryn — this is
// the entire reason this proxy exists rather than a direct client call.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CAMRYN_INTAKE_URL = Deno.env.get('CAMRYN_INTAKE_URL');
// e.g. https://iejpkrzqilqzyhltbbgc.supabase.co/functions/v1/camryn-intake
const CAMRYN_INTAKE_SECRET = Deno.env.get('CAMRYN_INTAKE_SECRET');
// must match the value set on Camryn's project, not Front Door's own secrets
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

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

  // Front Door's own "no silent writes" gate: confirm this is a real,
  // signed-in Front Door user before forwarding anything to Camryn.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'not signed in' }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    return json({ error: 'not signed in' }, 401);
  }

  if (!CAMRYN_INTAKE_URL || !CAMRYN_INTAKE_SECRET) {
    return json({ error: 'Camryn bridge not configured' }, 500);
  }

  let body: {
    action?: 'create' | 'verify';
    draft?: {
      energyLevel?: string;
      symptomNotes?: string;
      reflection?: string;
      targetDate?: string;
    };
    id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const forwardBody =
    body.action === 'verify'
      ? { action: 'verify', id: body.id }
      : {
          action: 'create',
          payload: {
            energy_level: body.draft?.energyLevel,
            symptom_notes: body.draft?.symptomNotes ?? null,
            reflection: body.draft?.reflection ?? null,
            target_date: body.draft?.targetDate ?? new Date().toISOString().slice(0, 10),
          },
        };

  const resp = await fetch(CAMRYN_INTAKE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-camryn-intake-secret': CAMRYN_INTAKE_SECRET,
    },
    body: JSON.stringify(forwardBody),
  });

  const responseBody = await resp.json();
  return json(responseBody, resp.status);
});
