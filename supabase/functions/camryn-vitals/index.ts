// supabase/functions/camryn-vitals/index.ts
//
// SECURITY FIX: this function previously had no auth check at all and
// wrote to whatever user_id was passed in the request body -- anyone who
// had (or found) a user's UUID could write arbitrary vitals data to their
// account indefinitely. Brought in line with the same pattern already
// used by camryn-intake / camryn-apply-pending / camryn-status: a shared
// secret header, plus the same hardcoded CAMRYN_TARGET_USER_ID every
// other bridge function in this project uses (multi-user identity mapping
// is deliberately deferred project-wide, per those functions' own
// comments). The request no longer needs to send user_id at all -- it's
// resolved server-side, so a caller with the secret can only ever write
// to the one real account, never target another user's data.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const VITALS_SECRET = Deno.env.get("CAMRYN_VITALS_SECRET");
const TARGET_USER_ID = Deno.env.get("CAMRYN_TARGET_USER_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-camryn-vitals-secret",
};

interface VitalsPayload {
  date?: string;
  resting_hr?: number | null;
  hrv_ms?: number | null;
  sleep_hours?: number | null;
  steps?: number | null;
  source?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const providedSecret = req.headers.get("x-camryn-vitals-secret");
  if (!VITALS_SECRET || providedSecret !== VITALS_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!TARGET_USER_ID) {
    return new Response(JSON.stringify({ error: "CAMRYN_TARGET_USER_ID not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey);

    const body: VitalsPayload = await req.json();
    const entryDate = body.date ?? new Date().toISOString().split("T")[0];

    const { error: upsertError } = await db
      .from("camryn_vitals")
      .upsert(
        {
          user_id: TARGET_USER_ID,
          entry_date: entryDate,
          resting_hr: body.resting_hr ?? null,
          hrv_ms: body.hrv_ms ?? null,
          sleep_hours: body.sleep_hours ?? null,
          steps: body.steps ?? null,
          source: body.source ?? "apple_watch",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,entry_date" }
      );

    if (upsertError) throw upsertError;

    // Count how many days of vitals this user has so the Shortcut can display calibration progress
    const { count } = await db
      .from("camryn_vitals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", TARGET_USER_ID);

    const daysLogged = count ?? 0;
    let calibrationStage: string;
    if (daysLogged < 7) {
      calibrationStage = "watching";
    } else if (daysLogged < 14) {
      calibrationStage = "early_read";
    } else if (daysLogged < 28) {
      calibrationStage = "baseline_established";
    } else {
      calibrationStage = "cycle_correlated";
    }

    return new Response(
      JSON.stringify({
        success: true,
        days_logged: daysLogged,
        calibration_stage: calibrationStage,
        entry_date: entryDate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("camryn-vitals error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
