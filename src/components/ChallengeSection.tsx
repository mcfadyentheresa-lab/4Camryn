import { useEffect, useState } from 'react';
import { CHALLENGE_LIBRARY, type ChallengeContent } from '../lib/challenges';
import { localToday } from '../lib/date';
import {
  evaluateStreakChallenge,
  evaluateCumulativeChallenge,
  evaluateAuditChallenge,
} from '../lib/challengeProgress';
import {
  fetchActiveInstances,
  fetchInstanceHistory,
  fetchStreakDays,
  fetchMoneyEntries,
  fetchAuditItems,
  startChallenge,
  logStreakDay,
  logMoneyEntry,
  removeMoneyEntry,
  addAuditItem,
  reviewAuditItem,
  pauseChallenge,
  resumeChallenge,
  abandonChallengeInstance,
  type ChallengeInstanceRow,
  type MoneyEntryRow,
  type AuditItemRow,
} from '../lib/challengeCompletion';

interface InstanceDetail {
  streakDays: string[];
  moneyEntries: MoneyEntryRow[];
  auditItems: AuditItemRow[];
}

const EMPTY_DETAIL: InstanceDetail = { streakDays: [], moneyEntries: [], auditItems: [] };

async function loadDetail(instance: ChallengeInstanceRow): Promise<InstanceDetail> {
  if (instance.completion_type === 'streak') {
    return { ...EMPTY_DETAIL, streakDays: await fetchStreakDays(instance.id) };
  }
  if (instance.completion_type === 'cumulative') {
    return { ...EMPTY_DETAIL, moneyEntries: await fetchMoneyEntries(instance.id) };
  }
  return { ...EMPTY_DETAIL, auditItems: await fetchAuditItems(instance.id) };
}

interface ChallengeSectionProps {
  userId: string;
}

export default function ChallengeSection({ userId }: ChallengeSectionProps) {
  const [active, setActive] = useState<ChallengeInstanceRow[]>([]);
  const [history, setHistory] = useState<ChallengeInstanceRow[]>([]);
  const [details, setDetails] = useState<Record<string, InstanceDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyChallengeId, setBusyChallengeId] = useState<string | null>(null);

  const reload = async () => {
    const [activeRows, historyRows] = await Promise.all([fetchActiveInstances(userId), fetchInstanceHistory(userId)]);
    setActive(activeRows);
    setHistory(historyRows);
    const entries = await Promise.all(activeRows.map(async (i) => [i.id, await loadDetail(i)] as const));
    setDetails(Object.fromEntries(entries));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .catch((e) => !cancelled && setError(e.message ?? 'Failed to load challenges'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const refreshInstance = async (updated: ChallengeInstanceRow | null, instanceId: string) => {
    if (!updated) return; // guarded write no-op'd (already transitioned) -- reload to reconcile
    if (updated.status === 'active' || updated.status === 'paused') {
      setActive((prev) => prev.map((i) => (i.id === instanceId ? updated : i)));
      setDetails((prev) => ({ ...prev, [instanceId]: prev[instanceId] ?? EMPTY_DETAIL }));
    } else {
      setActive((prev) => prev.filter((i) => i.id !== instanceId));
      setHistory((prev) => [updated, ...prev]);
    }
  };

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyChallengeId(id);
    setError(null);
    try {
      await fn();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyChallengeId(null);
    }
  };

  const completedChallengeIds = new Set(history.filter((i) => i.status === 'completed').map((i) => i.challenge_id));
  const activeChallengeIds = new Set(active.map((i) => i.challenge_id));

  const handleAccept = (challenge: ChallengeContent, unlockLabel: string) =>
    withBusy(challenge.id, async () => {
      const instance = await startChallenge(userId, challenge, { unlockLabel: unlockLabel || undefined });
      setActive((prev) => [...prev, instance]);
      setDetails((prev) => ({ ...prev, [instance.id]: EMPTY_DETAIL }));
    });

  if (loading) {
    return (
      <section className="challenge-section">
        <p className="challenge-loading">Loading challenges…</p>
      </section>
    );
  }

  return (
    <section className="challenge-section">
      <div className="challenge-section-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Challenge library</div>
        <h2 className="challenge-section-title">Optional sprints, on top of the protocol</h2>
        <p className="challenge-section-sub">
          Short, bounded, and opt-in. Accept one when you have the energy for it — nothing here is required.
        </p>
      </div>

      {error && <div className="challenge-error">{error}</div>}

      {active.length > 0 && (
        <div className="challenge-group">
          <div className="challenge-group-label">Active</div>
          <div className="challenge-grid">
            {active.map((instance) => {
              const content = CHALLENGE_LIBRARY.find((c) => c.id === instance.challenge_id);
              if (!content) return null;
              return (
                <ActiveChallengeCard
                  key={instance.id}
                  userId={userId}
                  instance={instance}
                  content={content}
                  detail={details[instance.id] ?? EMPTY_DETAIL}
                  busy={busyChallengeId === instance.challenge_id}
                  onChange={(updated) => refreshInstance(updated, instance.id)}
                  onDetailChange={(detail) => setDetails((prev) => ({ ...prev, [instance.id]: detail }))}
                  withBusy={withBusy}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="challenge-group">
        <div className="challenge-group-label">Library</div>
        <div className="challenge-grid">
          {CHALLENGE_LIBRARY.filter((c) => !activeChallengeIds.has(c.id)).map((challenge) => {
            const missingPrereqs = (challenge.prerequisites ?? []).filter((id) => !completedChallengeIds.has(id));
            const missingTitles = missingPrereqs
              .map((id) => CHALLENGE_LIBRARY.find((c) => c.id === id)?.title ?? id)
              .join(', ');
            return (
              <ChallengeLibraryCard
                key={challenge.id}
                challenge={challenge}
                locked={missingPrereqs.length > 0}
                lockedReason={missingTitles ? `Requires: ${missingTitles}` : ''}
                busy={busyChallengeId === challenge.id}
                onAccept={(unlockLabel) => handleAccept(challenge, unlockLabel)}
              />
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div className="challenge-group">
          <div className="challenge-group-label">History</div>
          <div className="challenge-history-list">
            {history.map((instance) => {
              const content = CHALLENGE_LIBRARY.find((c) => c.id === instance.challenge_id);
              return (
                <div key={instance.id} className={`challenge-history-row challenge-history-row--${instance.status}`}>
                  <span className="challenge-history-title">{content?.title ?? instance.challenge_id}</span>
                  <span className="challenge-history-status">{instance.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Library card (discovery / acceptance) ──────────────────────────────────

interface ChallengeLibraryCardProps {
  challenge: ChallengeContent;
  locked: boolean;
  lockedReason: string;
  busy: boolean;
  onAccept: (unlockLabel: string) => void;
}

function ChallengeLibraryCard({ challenge, locked, lockedReason, busy, onAccept }: ChallengeLibraryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const needsRewardLabel = challenge.unlock?.kind === 'reward' && !challenge.unlock.label;
  const [rewardLabel, setRewardLabel] = useState('');

  return (
    <div className={`challenge-card ${locked ? 'challenge-card--locked' : ''}`}>
      <div className="card-title" style={{ marginBottom: '2px' }}>{challenge.title}</div>
      <p className="card-body">{challenge.why}</p>

      {expanded && (
        <div className="challenge-detail">
          <div className="challenge-detail-block">
            <div className="challenge-detail-label">What it involves</div>
            <p className="challenge-detail-text">{challenge.what}</p>
          </div>
          <div className="challenge-detail-block">
            <div className="challenge-detail-label">Rules</div>
            <ul className="challenge-rules-list">
              {challenge.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="challenge-detail-block">
            <div className="challenge-detail-label">Outcome</div>
            <p className="challenge-detail-text">{challenge.outcome}</p>
          </div>
        </div>
      )}

      <button className="challenge-link-btn" onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Show less' : 'Show details'}
      </button>

      {locked ? (
        <div className="challenge-locked-note">{lockedReason}</div>
      ) : (
        <div className="challenge-accept-row">
          {needsRewardLabel && (
            <input
              className="challenge-reward-input"
              placeholder="What are you working toward?"
              value={rewardLabel}
              onChange={(e) => setRewardLabel(e.target.value)}
            />
          )}
          <button
            className="challenge-btn-primary"
            disabled={busy || (needsRewardLabel && !rewardLabel.trim())}
            onClick={() => onAccept(rewardLabel.trim())}
          >
            {busy ? 'Starting…' : 'Accept challenge'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Active card (progress / logging) ────────────────────────────────────

interface ActiveChallengeCardProps {
  userId: string;
  instance: ChallengeInstanceRow;
  content: ChallengeContent;
  detail: InstanceDetail;
  busy: boolean;
  onChange: (updated: ChallengeInstanceRow | null) => void;
  onDetailChange: (detail: InstanceDetail) => void;
  withBusy: (id: string, fn: () => Promise<void>) => Promise<void>;
}

function ActiveChallengeCard({ userId, instance, content, detail, busy, onChange, onDetailChange, withBusy }: ActiveChallengeCardProps) {
  const isPaused = instance.status === 'paused';

  const handlePauseToggle = () =>
    withBusy(content.id, async () => {
      const updated = isPaused ? await resumeChallenge(instance, userId) : await pauseChallenge(instance.id, userId);
      onChange(updated);
    });

  const handleAbandon = () =>
    withBusy(content.id, async () => {
      const updated = await abandonChallengeInstance(instance.id, userId);
      onChange(updated);
    });

  return (
    <div className="challenge-card challenge-card--active">
      <div className="challenge-active-head">
        <div className="card-title" style={{ marginBottom: 0 }}>{content.title}</div>
        {isPaused && <span className="challenge-paused-pill">Paused</span>}
      </div>

      {instance.completion_type === 'streak' && (
        <StreakProgress
          instance={instance}
          detail={detail}
          busy={busy}
          isPaused={isPaused}
          onChange={onChange}
          onDetailChange={onDetailChange}
          withBusy={withBusy}
          userId={userId}
        />
      )}
      {instance.completion_type === 'cumulative' && (
        <MoneyProgress
          instance={instance}
          detail={detail}
          busy={busy}
          isPaused={isPaused}
          onChange={onChange}
          onDetailChange={onDetailChange}
          withBusy={withBusy}
          userId={userId}
        />
      )}
      {instance.completion_type === 'audit' && (
        <AuditProgress
          instance={instance}
          detail={detail}
          busy={busy}
          onChange={onChange}
          onDetailChange={onDetailChange}
          withBusy={withBusy}
          userId={userId}
        />
      )}

      <div className="challenge-active-actions">
        {instance.completion_type !== 'audit' && (
          <button className="challenge-link-btn" disabled={busy} onClick={handlePauseToggle}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button className="challenge-link-btn challenge-link-btn--danger" disabled={busy} onClick={handleAbandon}>
          Abandon
        </button>
      </div>
    </div>
  );
}

interface ProgressSubProps {
  instance: ChallengeInstanceRow;
  detail: InstanceDetail;
  busy: boolean;
  onChange: (updated: ChallengeInstanceRow | null) => void;
  withBusy: (id: string, fn: () => Promise<void>) => Promise<void>;
  userId: string;
}

function StreakProgress({ instance, detail, busy, isPaused, onChange, onDetailChange, withBusy, userId }: ProgressSubProps & { isPaused: boolean; onDetailChange: (d: InstanceDetail) => void }) {
  const params = instance.params as { durationDays: number; tolerance: 'strict' | number };
  const today = localToday();
  const evaluation = evaluateStreakChallenge(detail.streakDays, instance.accepted_date, params.durationDays, params.tolerance, today);
  const doneToday = detail.streakDays.includes(today);
  const pct = Math.min(100, Math.round((evaluation.daysCompleted / params.durationDays) * 100));

  const handleMark = () =>
    withBusy(instance.challenge_id, async () => {
      const result = await logStreakDay(userId, instance);
      onChange(result.instance);
      onDetailChange({ ...detail, streakDays: await fetchStreakDays(instance.id) });
    });

  return (
    <div className="challenge-progress-block">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-text">
        {evaluation.daysCompleted} / {params.durationDays} days
        {params.tolerance !== 'strict' && ` · ${evaluation.skipsUsed}/${params.tolerance} skips used`}
      </div>
      <button className="challenge-btn-primary" disabled={busy || isPaused || doneToday} onClick={handleMark}>
        {doneToday ? "Today's done" : 'Mark today done'}
      </button>
    </div>
  );
}

function MoneyProgress({ instance, detail, busy, isPaused, onChange, onDetailChange, withBusy, userId }: ProgressSubProps & { isPaused: boolean; onDetailChange: (d: InstanceDetail) => void }) {
  const params = instance.params as { target: number; unit: 'usd' | 'items' };
  const isUsd = params.unit !== 'items';
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState(false);
  const evaluation = evaluateCumulativeChallenge(
    detail.moneyEntries.map((e) => Number(e.amount)),
    params.target,
    instance.window_ends_date ?? localToday(),
  );

  const handleAdd = () =>
    withBusy(instance.challenge_id, async () => {
      const amt = isUsd ? Number(amount) : 1;
      if (!source.trim() || !(amt > 0)) return;
      const result = await logMoneyEntry(userId, instance, { source: source.trim(), amount: amt, recurring: isUsd && recurring });
      onChange(result.instance);
      onDetailChange({ ...detail, moneyEntries: await fetchMoneyEntries(instance.id) });
      setSource('');
      setAmount('');
      setRecurring(false);
    });

  const handleRemove = (entryId: string) =>
    withBusy(instance.challenge_id, async () => {
      await removeMoneyEntry(entryId, userId);
      onDetailChange({ ...detail, moneyEntries: await fetchMoneyEntries(instance.id) });
    });

  return (
    <div className="challenge-progress-block">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${evaluation.progressPct}%` }} />
      </div>
      <div className="progress-text">
        {isUsd ? `$${evaluation.total.toFixed(2)} / $${params.target.toFixed(2)}` : `${evaluation.total} / ${params.target}`}
        {evaluation.isExpired && ' · window expired'}
      </div>

      {detail.moneyEntries.length > 0 && (
        <div className="challenge-entry-list">
          {detail.moneyEntries.map((e) => (
            <div key={e.id} className="challenge-entry-row">
              <span>{e.source}{e.recurring ? ' (recurring)' : ''}</span>
              {isUsd && <span className="challenge-entry-amount">${Number(e.amount).toFixed(2)}</span>}
              <button className="challenge-entry-remove" disabled={busy} onClick={() => handleRemove(e.id)} aria-label="Remove entry">×</button>
            </div>
          ))}
        </div>
      )}

      {!isPaused && (
        <div className="challenge-form-row">
          <input
            className="challenge-input"
            placeholder={isUsd ? 'Source (e.g. sold bike)' : 'What did you log (e.g. Tuesday session)'}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          {isUsd && (
            <input className="challenge-input challenge-input--amount" type="number" min="0" step="0.01" placeholder="$" value={amount} onChange={(e) => setAmount(e.target.value)} />
          )}
          {isUsd && (
            <label className="challenge-checkbox-label">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              Recurring
            </label>
          )}
          <button className="challenge-btn-primary" disabled={busy} onClick={handleAdd}>Add</button>
        </div>
      )}
    </div>
  );
}

function AuditProgress({ instance, detail, busy, onChange, onDetailChange, withBusy, userId }: ProgressSubProps & { onDetailChange: (d: InstanceDetail) => void }) {
  const params = instance.params as { itemLabel?: string; hasCost?: boolean };
  const itemLabel = params.itemLabel ?? 'Item';
  const hasCost = params.hasCost ?? false;
  const [label, setLabel] = useState('');
  const [cost, setCost] = useState('');
  const evaluation = evaluateAuditChallenge(
    detail.auditItems.map((i) => ({ monthlyCost: i.monthly_cost !== null ? Number(i.monthly_cost) : null, usedRecently: i.used_recently })),
  );

  const handleAddItem = () =>
    withBusy(instance.challenge_id, async () => {
      if (!label.trim()) return;
      const item = await addAuditItem(userId, instance.id, label.trim(), hasCost && cost ? Number(cost) : undefined);
      onDetailChange({ ...detail, auditItems: [...detail.auditItems, item] });
      setLabel('');
      setCost('');
    });

  const handleReview = (itemId: string, used: boolean) =>
    withBusy(instance.challenge_id, async () => {
      const result = await reviewAuditItem(userId, instance, itemId, used);
      onChange(result.instance);
      onDetailChange({ ...detail, auditItems: await fetchAuditItems(instance.id) });
    });

  return (
    <div className="challenge-progress-block">
      <div className="progress-text">{evaluation.reviewedCount} / {evaluation.totalCount || 0} reviewed</div>
      {hasCost && evaluation.totalCount > 0 && evaluation.foundMonthlyTotal > 0 && (
        <div className="challenge-found-money">${evaluation.foundMonthlyTotal.toFixed(2)}/mo found so far</div>
      )}

      {detail.auditItems.length > 0 && (
        <div className="challenge-entry-list">
          {detail.auditItems.map((item) => (
            <div key={item.id} className="challenge-audit-row">
              <span className="challenge-audit-label">
                {item.label}{hasCost && item.monthly_cost != null ? ` — $${Number(item.monthly_cost).toFixed(2)}/mo` : ''}
              </span>
              <div className="challenge-audit-actions">
                <button
                  className={`challenge-audit-mark ${item.used_recently === true ? 'active' : ''}`}
                  disabled={busy}
                  onClick={() => handleReview(item.id, true)}
                >
                  Used
                </button>
                <button
                  className={`challenge-audit-mark challenge-audit-mark--unused ${item.used_recently === false ? 'active' : ''}`}
                  disabled={busy}
                  onClick={() => handleReview(item.id, false)}
                >
                  Unused
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="challenge-form-row">
        <input className="challenge-input" placeholder={itemLabel} value={label} onChange={(e) => setLabel(e.target.value)} />
        {hasCost && (
          <input className="challenge-input challenge-input--amount" type="number" min="0" step="0.01" placeholder="$/mo" value={cost} onChange={(e) => setCost(e.target.value)} />
        )}
        <button className="challenge-btn-primary" disabled={busy} onClick={handleAddItem}>Add</button>
      </div>
    </div>
  );
}
