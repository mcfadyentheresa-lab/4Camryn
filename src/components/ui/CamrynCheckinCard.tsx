// src/components/CamrynCheckinCard.tsx
//
// Task 4: confirmation UI for a proposed Camryn check-in.
//
// Shape follows ProposedPlanPanel's existing propose -> confirm pattern
// (document action items: Approve/Dismiss, status flag), extended so
// Confirm actually triggers a real write via camrynCheckinService.ts —
// ProposedPlanPanel's own "Approve" does not create anything downstream
// today; this component's "Confirm" does.
//
// Lifecycle shown in the UI (see camrynCheckinService.ts header for the
// full status mapping):
//   draft      -> Confirm / Edit / Discard shown, nothing written yet
//   confirming -> Confirm tapped, write in flight
//   queued     -> row exists in camryn_pending_writes, status='pending'
//                 (NOT the same as logged — Camryn hasn't applied it yet)
//   logged     -> verifyCamrynCheckin() confirmed status='applied'
//   blocked    -> write failed, OR stayed 'pending' past the poll window

import { useState, useEffect, useRef } from 'react';
import {
  confirmCamrynCheckin,
  verifyCamrynCheckin,
  type CamrynCheckinDraft,
} from '../services/camrynCheckinService';

type CardState = 'draft' | 'confirming' | 'queued' | 'logged' | 'blocked' | 'discarded';

// How long to keep polling for Task 5's apply-logic before telling the
// user honestly that it hasn't landed yet, rather than polling forever.
const VERIFY_TIMEOUT_MS = 30_000;
const VERIFY_POLL_INTERVAL_MS = 3_000;

interface CamrynCheckinCardProps {
  draft: CamrynCheckinDraft;
  onDiscard: () => void;
  onEdit: () => void;
}

export function CamrynCheckinCard({ draft, onDiscard, onEdit }: CamrynCheckinCardProps) {
  const [state, setState] = useState<CardState>('draft');
  const [pendingWriteId, setPendingWriteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollDeadline = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  async function handleConfirm() {
    setState('confirming');
    setErrorMessage(null);

    const { data, error } = await confirmCamrynCheckin(draft);

    if (error || !data) {
      setState('blocked');
      setErrorMessage(error ?? 'Something went wrong saving this.');
      return;
    }

    // Row written successfully — but this is "queued," not "logged."
    // Camryn's real check-in data doesn't exist yet; Task 5 hasn't run.
    setPendingWriteId(data.id);
    setState('queued');
    startVerifyPolling(data.id);
  }

  function startVerifyPolling(id: string) {
    pollDeadline.current = Date.now() + VERIFY_TIMEOUT_MS;

    pollTimer.current = setInterval(async () => {
      const { data } = await verifyCamrynCheckin(id);

      if (data?.status === 'applied') {
        clearPolling();
        setState('logged');
        return;
      }

      if (data?.status === 'rejected') {
        clearPolling();
        setState('blocked');
        setErrorMessage('Camryn could not apply this check-in.');
        return;
      }

      if (pollDeadline.current && Date.now() > pollDeadline.current) {
        clearPolling();
        setState('blocked');
        setErrorMessage(
          'Still queued — Camryn hasn\u2019t confirmed this yet. It may still land shortly.'
        );
      }
    }, VERIFY_POLL_INTERVAL_MS);
  }

  function clearPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function handleDiscard() {
    setState('discarded');
    onDiscard();
  }

  async function handleRetryVerify() {
    if (!pendingWriteId) return;
    setState('queued');
    setErrorMessage(null);
    startVerifyPolling(pendingWriteId);
  }

  if (state === 'discarded') return null;

  return (
    <div className="camryn-checkin-card" role="group" aria-label="Camryn check-in">
      <div className="camryn-checkin-card__body">
        <p className="camryn-checkin-card__title">Log today&apos;s check-in</p>
        <dl className="camryn-checkin-card__fields">
          <dt>Energy</dt>
          <dd>{draft.energyLevel}</dd>
          {draft.symptomNotes && (
            <>
              <dt>Notes</dt>
              <dd>{draft.symptomNotes}</dd>
            </>
          )}
          {draft.reflection && (
            <>
              <dt>Reflection</dt>
              <dd>{draft.reflection}</dd>
            </>
          )}
        </dl>
      </div>

      {state === 'draft' && (
        <div className="camryn-checkin-card__actions">
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={onEdit}>Edit</button>
          <button onClick={handleDiscard}>Discard</button>
        </div>
      )}

      {state === 'confirming' && (
        <p className="camryn-checkin-card__status">Saving…</p>
      )}

      {state === 'queued' && (
        <p className="camryn-checkin-card__status">
          Queued for Camryn — waiting for it to apply this check-in.
        </p>
      )}

      {state === 'logged' && (
        <p className="camryn-checkin-card__status camryn-checkin-card__status--success">
          ✓ Logged in Camryn
          {/* TODO: wire to Camryn's real deep-link scheme once known */}
        </p>
      )}

      {state === 'blocked' && (
        <div className="camryn-checkin-card__status camryn-checkin-card__status--error">
          <p>{errorMessage ?? 'Couldn\u2019t confirm this saved.'}</p>
          <button onClick={handleRetryVerify}>Check again</button>
          {/* TODO: "Open in Camryn" link once deep-link scheme known */}
        </div>
      )}
    </div>
  );
}
