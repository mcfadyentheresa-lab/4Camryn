// supabase/functions/camryn-intake/index.ts
//
// Inbound bridge: receives proposed check-ins FROM Front Door and writes
// them into camryn_pending_writes using the service-role key (bypasses
// RLS — the caller isn't a Camryn-authenticated user session, it's a
// server-to-server call authenticated by a shared secret instead).
//
// Mirrors Front Door's existing sync-intake pattern, in the opposite
// direction and for a different table.
//
// V1 SIMPLIFICATION (solo-user deployment): there is exactly one real
// Camryn user right now, so the target user_id comes from a fixed
// environment variable (CAMRYN_TARGET_USER_ID) rather than a real
// identity mapping between Front Door's and Camryn's separate Supabase
// Auth pools. This MUST change before a second user is onboarded — see
// the deferred note at the bottom of this file.

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
      energy_level?: string;
      symptom_notes?: string;
      reflection?: string;
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
      .eq('user_id', TARGET_USER_ID) // defense in depth beyond the service role
      .single();

    if (error) return json({ error: error.message }, 404);
    return json({ data });
  }

  if (body.action === 'create') {
    const p = body.payload;
    if (!p?.energy_level || !['low', 'medium', 'high'].includes(p.energy_level)) {
      return json({ error: 'energy_level must be low, medium, or high' }, 400);
    }

    const { data, error } = await supabase
      .from('camryn_pending_writes')
      .insert({
        user_id: TARGET_USER_ID,
        energy_level: p.energy_level,
        symptom_notes: p.symptom_notes ?? null,
        reflection: p.reflection ?? null,
        target_date: p.target_date ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ data }, 201);
  }

  return json({ error: 'action must be "create" or "verify"' }, 400);
});

// ---------------------------------------------------------------------
// DEFERRED: multi-user identity mapping
// ---------------------------------------------------------------------
// This function writes every pending check-in to a single, hardcoded
// CAMRYN_TARGET_USER_ID regardless of which Front Door user is calling.
// Safe only because there is exactly one real user today. Before a
// second user exists, this needs: (a) the incoming request authenticated
// as a specific Front Door user, not just a shared secret, and (b) a
// real table mapping Front Door user_id -> Camryn user_id, looked up
// here instead of hardcoded.
