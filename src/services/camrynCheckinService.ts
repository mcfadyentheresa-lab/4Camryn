// src/services/camrynCheckinService.ts
//
// Task 3: Front Door's write path into camryn_pending_writes.
//
// IMPORTANT — call boundary:
// confirmCamrynCheckin() performs a real database write and must ONLY be
// called from the Confirm handler of the check-in confirmation card
// (Task 4) — never from the initial "propose" step. The propose step
// should render a preview from local component state only; nothing is
// written until the user explicitly confirms.
//
// Lifecycle mapping (see spec Section 3 for the full diagram):
//   proposed   -> draft held in UI state only, this file not yet touched
//   confirmed  -> user taps Confirm -> confirmCamrynCheckin() called
//   changed    -> NOTE: this does NOT mean Camryn's real data changed yet.
//                 It means the row exists in camryn_pending_writes with
//                 status='pending'. The actual change to Camryn's data
//                 (camryn_daily_saves) only happens once Task 5's
//                 apply-logic processes this row — asynchronously, not
//                 guaranteed to be instant. UI copy must reflect this
//                 (e.g. "Queued for Camryn", not "Logged in Camryn").
//   visible    -> UI shows the queued state, with the row id for tracking
//   verified   -> verifyCamrynCheckin() below re-reads the row; only once
//                 status has actually transitioned to 'applied' (set by
//                 Task 5, via service-role key) should the UI claim the
//                 check-in is truly logged in Camryn.

import { supabase } from '../lib/supabase';

export interface CamrynCheckinDraft {
  energyLevel: 'low' | 'medium' | 'high';
  symptomNotes?: string;
  reflection?: string;
  targetDate?: string; // ISO date string; defaults to today if omitted
}

export interface CamrynPendingWrite {
  id: string;
  user_id: string;
  energy_level: 'low' | 'medium' | 'high';
  symptom_notes: string | null;
  reflection: string | null;
  target_date: string;
  status: 'pending' | 'applied' | 'rejected';
  created_at: string;
  applied_at: string | null;
  applied_daily_save_id: string | null;
}

/**
 * Writes a CONFIRMED Camryn check-in draft to camryn_pending_writes.
 * Call this ONLY after the user has tapped Confirm on the check-in card.
 *
 * The insert uses the caller's own Supabase session — RLS on
 * camryn_pending_writes requires auth.uid() = user_id, so this fails for
 * anyone not signed in and cannot write on another user's behalf.
 */
export async function confirmCamrynCheckin(
  draft: CamrynCheckinDraft
): Promise<{ data: CamrynPendingWrite | null; error: string | null }> {
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return { data: null, error: 'Not signed in — cannot confirm this write.' };
  }

  const { data, error } = await supabase
    .from('camryn_pending_writes')
    .insert({
      user_id: userData.user.id,
      energy_level: draft.energyLevel,
      symptom_notes: draft.symptomNotes ?? null,
      reflection: draft.reflection ?? null,
      target_date: draft.targetDate ?? new Date().toISOString().slice(0, 10),
      // status intentionally omitted — defaults to 'pending' at the DB level
    })
    .select()
    .single();

  if (error) {
    // maps to status: blocked/unverified in the confirmation card
    return { data: null, error: error.message };
  }

  return { data: data as CamrynPendingWrite, error: null };
}

/**
 * Re-reads a specific pending write by id — this is Task 6's verify step.
 * Poll or re-call this after confirmCamrynCheckin() succeeds to find out
 * whether Task 5's apply-logic has actually processed it yet.
 *
 * Only when the returned row's status is 'applied' should the UI show a
 * final "Logged in Camryn" state. While status is still 'pending', the UI
 * should show "Queued for Camryn" — do not claim success early.
 */
export async function verifyCamrynCheckin(
  pendingWriteId: string
): Promise<{ data: CamrynPendingWrite | null; error: string | null }> {
  const { data, error } = await supabase
    .from('camryn_pending_writes')
    .select()
    .eq('id', pendingWriteId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as CamrynPendingWrite, error: null };
}
