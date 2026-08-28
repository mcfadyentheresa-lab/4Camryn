import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VITAMIN_LABELS, ENV_LABELS } from '../lib/constants';
import { resetAllCompletion } from '../lib/completion';
import type { AllPhaseMastery } from '../lib/mastery';
import { formatLocalDate } from '../lib/date';

function ProfileRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="profile-row">
      <span className="profile-row-key">{label}</span>
      <span className="profile-row-val">
        {value}{unit && <span className="profile-row-unit"> {unit}</span>}
      </span>
    </div>
  );
}

interface BodyRow {
  entry_date: string;
  energy: number | null;
  symptoms: string;
  vitamins: Record<string, boolean>;
  cycle_status: string;
  cycle_note: string;
}

interface ConfidenceRow {
  entry_date: string;
  confidence_note: string;
  rebrand_note: string;
}

interface SpaceRow {
  entry_date: string;
  space_wins: string;
  friction_note: string;
  systems_note: string;
  environment_check: Record<string, boolean>;
}

interface ProfileSectionProps {
  userId: string;
  onReset?: () => void | Promise<void>;
  onMasteryReset?: (mastery: AllPhaseMastery) => void;
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function daysAgo(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'i','my','me','it','is','are','was','be','do','one','this','that',
  'have','had','not','so','just','like','want','feel','really','very',
  'day','days','today','something','little','bit','more','some','when',
]);

function topWords(texts: string[], n = 5): string[] {
  const freq: Record<string, number> = {};
  for (const t of texts) {
    const words = t.toLowerCase().replace(/[^a-z\s'-]/g, '').split(/\s+/);
    for (const w of words) {
      const clean = w.replace(/^[-']+|[-']+$/g, '');
      if (clean.length > 2 && !STOP_WORDS.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

const LANES = [
  { id: 'body', label: 'Body' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'space', label: 'Space & Systems' },
  { id: 'evidence', label: 'Evidence' },
] as const;

type LaneId = typeof LANES[number]['id'];

export default function ProfileSection({ userId, onReset, onMasteryReset }: ProfileSectionProps) {
  const [bodyRows, setBodyRows] = useState<BodyRow[]>([]);
  const [confRows, setConfRows] = useState<ConfidenceRow[]>([]);
  const [spaceRows, setSpaceRows] = useState<SpaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLane, setActiveLane] = useState<LaneId>('body');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    setResetError(null);

    // resetAllCompletion (src/lib/completion.ts) owns the mastery_data blank,
    // the save_count/phase_start_save_count snapshot (save_count is a
    // lifetime counter recomputed from camryn_daily_saves, so it can't be
    // forced to 0 and stay there -- see that function's own comment), today's
    // checked_items clear, and the Front Door daily_items reset -- all the
    // same work this handler used to do by hand across three separate calls.
    let mastery: AllPhaseMastery;
    try {
      const result = await resetAllCompletion(userId);
      mastery = result.mastery;
    } catch (err) {
      console.error('protocol reset failed (completion reset):', err);
      setResetting(false);
      setResetError('Could not reset — try again.');
      return;
    }
    onMasteryReset?.(mastery);

    const { error } = await supabase
      .from('camryn_sessions')
      .update({
        current_phase: 1,
        protocol_complete: false,
        protocol_completed_at: null,
      })
      .eq('user_id', userId);
    if (error) {
      setResetting(false);
      console.error('protocol reset failed:', error);
      setResetError('Could not reset — try again.');
      return;
    }

    setResetting(false);
    setShowResetConfirm(false);
    await onReset?.();
  };

  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = formatLocalDate(cutoff);

    const loadData = async () => {
      const [bodyRes, confRes, spaceRes] = await Promise.all([
        supabase
          .from('camryn_body')
          .select('entry_date, energy, symptoms, vitamins, cycle_status, cycle_note')
          .eq('user_id', userId)
          .gte('entry_date', cutoffStr)
          .order('entry_date', { ascending: false }),
        supabase
          .from('camryn_confidence')
          .select('entry_date, confidence_note, rebrand_note')
          .eq('user_id', userId)
          .gte('entry_date', cutoffStr)
          .order('entry_date', { ascending: false }),
        supabase
          .from('camryn_space')
          .select('entry_date, space_wins, friction_note, systems_note, environment_check')
          .eq('user_id', userId)
          .gte('entry_date', cutoffStr)
          .order('entry_date', { ascending: false }),
      ]);
      setBodyRows((bodyRes.data as BodyRow[]) || []);
      setConfRows((confRes.data as ConfidenceRow[]) || []);
      setSpaceRows((spaceRes.data as SpaceRow[]) || []);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  // Distinct calendar days touched across any lane -- summing row counts
  // (or taking the max of the three) either double-counts a day logged in
  // multiple lanes or ignores lanes the user favors less, understating real
  // engagement on the one page whose whole point is "show the receipts."
  const distinctLoggedDays = new Set<string>();
  for (const r of bodyRows) distinctLoggedDays.add(r.entry_date);
  for (const r of confRows) distinctLoggedDays.add(r.entry_date);
  for (const r of spaceRows) distinctLoggedDays.add(r.entry_date);
  const totalDays = distinctLoggedDays.size;
  const hasEnough = totalDays >= 3;

  // ── Body computations ──
  const energyLast7 = bodyRows.filter(r => daysAgo(r.entry_date) <= 7 && r.energy != null).map(r => r.energy!);
  const energyLast30 = bodyRows.filter(r => r.energy != null).map(r => r.energy!);
  const avg7 = avg(energyLast7);
  const avg30 = avg(energyLast30);
  const loggedDays = bodyRows.length;
  const vitaminCounts: Record<string, number> = {};
  for (const row of bodyRows) {
    for (const [k, v] of Object.entries(row.vitamins || {})) {
      if (v) vitaminCounts[k] = (vitaminCounts[k] || 0) + 1;
    }
  }
  const trackedVitamins = Object.keys(VITAMIN_LABELS).filter(k => vitaminCounts[k] > 0);
  const cycleCounts: Record<string, number> = {};
  for (const row of bodyRows) {
    if (row.cycle_status) cycleCounts[row.cycle_status] = (cycleCounts[row.cycle_status] || 0) + 1;
  }
  const cycleEntries = Object.entries(cycleCounts).sort((a, b) => b[1] - a[1]);
  const recentBodyNotes = bodyRows
    .filter(r => (r.symptoms || '').trim() || (r.cycle_note || '').trim())
    .slice(0, 4)
    .map(r => ({
      date: r.entry_date,
      text: [r.symptoms, r.cycle_note].filter(Boolean).join(' · ').trim(),
    }));

  // ── Confidence computations ──
  const recentConfNotes = confRows.filter(r => (r.confidence_note || '').trim()).slice(0, 5);
  const allRebrandTexts = confRows.map(r => r.rebrand_note).filter(Boolean);
  const rebrandWords = topWords(allRebrandTexts);
  const recentRebrandNotes = confRows.filter(r => (r.rebrand_note || '').trim()).slice(0, 4);

  // ── Space computations ──
  const envCheckCounts: Record<string, number> = {};
  for (const row of spaceRows) {
    for (const [k, v] of Object.entries(row.environment_check || {})) {
      if (v) envCheckCounts[k] = (envCheckCounts[k] || 0) + 1;
    }
  }
  const spaceDays = spaceRows.length;
  const trackedEnvChecks = Object.keys(ENV_LABELS).filter(k => envCheckCounts[k] > 0);
  const recentWins = spaceRows.filter(r => (r.space_wins || '').trim()).slice(0, 4);
  const recentFriction = spaceRows.filter(r => (r.friction_note || '').trim()).slice(0, 3);
  const frictionWords = topWords(spaceRows.map(r => r.friction_note).filter(Boolean));
  const winsWords = topWords(spaceRows.map(r => r.space_wins).filter(Boolean));

  // ── Evidence computations (cross-lane) ──
  const savedDays = totalDays;
  const energyTrend = energyLast7.length >= 2
    ? energyLast7[0] > energyLast7[energyLast7.length - 1] ? 'up'
    : energyLast7[0] < energyLast7[energyLast7.length - 1] ? 'down' : 'steady'
    : null;
  const envCheckRate = spaceDays > 0
    ? Math.round((Object.values(envCheckCounts).reduce((a, b) => a + b, 0) / (spaceDays * Object.keys(ENV_LABELS).length)) * 100)
    : null;
  const vitaminRate = loggedDays > 0 && trackedVitamins.length > 0
    ? Math.round((trackedVitamins.reduce((sum, k) => sum + vitaminCounts[k], 0) / (loggedDays * trackedVitamins.length)) * 100)
    : null;
  const confDays = confRows.filter(r => (r.confidence_note || '').trim()).length;

  if (loading) {
    return (
      <section className="profile-section">
        <div className="profile-head">
          <div className="card-label">Profile</div>
          <h2 className="profile-title">What Camryn is quietly noticing</h2>
        </div>
        <p className="profile-empty">Loading your patterns…</p>
      </section>
    );
  }

  return (
    <section className="profile-section">
      <div className="profile-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Profile</div>
        <h2 className="profile-title">What Camryn is quietly noticing</h2>
        <p className="profile-sub">
          A gentle summary across all four lanes — body, confidence, space, and evidence. Nothing here is a score or a verdict.
        </p>
      </div>

      {/* Lane tabs */}
      <div className="profile-lanes">
        {LANES.map(lane => (
          <button
            key={lane.id}
            className={`profile-lane-btn ${activeLane === lane.id ? 'active' : ''}`}
            onClick={() => setActiveLane(lane.id)}
          >
            {lane.label}
          </button>
        ))}
      </div>

      {!hasEnough ? (
        <div className="profile-empty-card">
          <p>Camryn is still getting to know your patterns. A few more days of logging will make this page more useful.</p>
        </div>
      ) : (
        <>
          {/* ── Body lane ── */}
          {activeLane === 'body' && (
            <div className="profile-lane-content">
              <div className="profile-grid">
                <div className="profile-col">
                  {(avg7 != null || avg30 != null) && (
                    <div className="profile-card">
                      <div className="profile-card-label">Energy trend</div>
                      <div className="profile-card-items">
                        {avg7 != null && <ProfileRow label="Last 7 days" value={avg7} unit="avg" />}
                        {avg30 != null && <ProfileRow label="Last 30 days" value={avg30} unit="avg" />}
                      </div>
                      <p className="profile-note">Out of 5. No judgment on the number.</p>
                    </div>
                  )}
                  {cycleEntries.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Cycle snapshots</div>
                      <div className="profile-card-items">
                        {cycleEntries.map(([status, count]) => (
                          <ProfileRow key={status} label={status} value={count} unit={`day${count !== 1 ? 's' : ''}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="profile-col">
                  {trackedVitamins.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Vitamins</div>
                      <div className="profile-card-items">
                        {trackedVitamins.map(k => (
                          <ProfileRow key={k} label={VITAMIN_LABELS[k]} value={vitaminCounts[k]} unit={`of ${loggedDays} days`} />
                        ))}
                      </div>
                    </div>
                  )}
                  {recentBodyNotes.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Recent body notes</div>
                      <div className="profile-notes-list">
                        {recentBodyNotes.map(n => (
                          <div key={n.date} className="profile-note-item">
                            <span className="profile-note-date">{formatDate(n.date)}</span>
                            <span className="profile-note-text">{n.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {avg7 == null && trackedVitamins.length === 0 && cycleEntries.length === 0 && (
                    <p className="profile-empty-inline">No body data logged yet. Start with energy or a symptom note.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Confidence lane ── */}
          {activeLane === 'confidence' && (
            <div className="profile-lane-content">
              <div className="profile-grid">
                <div className="profile-col">
                  {recentConfNotes.length > 0 ? (
                    <div className="profile-card">
                      <div className="profile-card-label">Confidence notes</div>
                      <p className="profile-card-intro">Things that have been showing up when you check in.</p>
                      <div className="profile-notes-list">
                        {recentConfNotes.map(r => (
                          <div key={r.entry_date} className="profile-note-item">
                            <span className="profile-note-date">{formatDate(r.entry_date)}</span>
                            <span className="profile-note-text">{r.confidence_note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="profile-empty-inline">No confidence notes yet.</p>
                  )}
                </div>
                <div className="profile-col">
                  {(rebrandWords.length > 0 || recentRebrandNotes.length > 0) ? (
                    <div className="profile-card">
                      <div className="profile-card-label">Rebrand notes</div>
                      {rebrandWords.length > 0 && (
                        <>
                          <p className="profile-card-intro">Words that keep appearing in your rebrand notes:</p>
                          <div className="profile-word-cloud">
                            {rebrandWords.map(w => (
                              <span key={w} className="profile-word-tag">{w}</span>
                            ))}
                          </div>
                        </>
                      )}
                      {recentRebrandNotes.length > 0 && (
                        <div className="profile-notes-list" style={{ marginTop: rebrandWords.length > 0 ? '12px' : 0 }}>
                          {recentRebrandNotes.map(r => (
                            <div key={r.entry_date} className="profile-note-item">
                              <span className="profile-note-date">{formatDate(r.entry_date)}</span>
                              <span className="profile-note-text">{r.rebrand_note}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="profile-empty-inline">No rebrand notes yet. They'll appear here as you log them.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Space & Systems lane ── */}
          {activeLane === 'space' && (
            <div className="profile-lane-content">
              <div className="profile-grid">
                <div className="profile-col">
                  {trackedEnvChecks.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Environment consistency</div>
                      <p className="profile-card-intro">How often each reset is showing up in your log.</p>
                      <div className="profile-card-items">
                        {trackedEnvChecks.map(k => (
                          <ProfileRow key={k} label={ENV_LABELS[k]} value={envCheckCounts[k]} unit={`of ${spaceDays} days`} />
                        ))}
                      </div>
                    </div>
                  )}
                  {winsWords.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">What keeps feeling set up well</div>
                      <div className="profile-word-cloud">
                        {winsWords.map(w => <span key={w} className="profile-word-tag">{w}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="profile-col">
                  {recentWins.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Recent wins</div>
                      <div className="profile-notes-list">
                        {recentWins.map(r => (
                          <div key={r.entry_date} className="profile-note-item">
                            <span className="profile-note-date">{formatDate(r.entry_date)}</span>
                            <span className="profile-note-text">{r.space_wins}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recentFriction.length > 0 && (
                    <div className="profile-card">
                      <div className="profile-card-label">Friction patterns</div>
                      {frictionWords.length > 0 && (
                        <div className="profile-word-cloud" style={{ marginBottom: '10px' }}>
                          {frictionWords.map(w => <span key={w} className="profile-word-tag friction">{w}</span>)}
                        </div>
                      )}
                      <div className="profile-notes-list">
                        {recentFriction.map(r => (
                          <div key={r.entry_date} className="profile-note-item">
                            <span className="profile-note-date">{formatDate(r.entry_date)}</span>
                            <span className="profile-note-text">{r.friction_note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {trackedEnvChecks.length === 0 && recentWins.length === 0 && (
                    <p className="profile-empty-inline">No space data logged yet. Start with the environment checklist.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Evidence lane ── */}
          {activeLane === 'evidence' && (
            <div className="profile-lane-content">
              <div className="profile-evidence-intro">
                <p>
                  Evidence is the receipts. This is a trendline built from everything you've logged — not to grade you, but so you can see that change is actually happening.
                </p>
              </div>
              <div className="profile-grid">
                <div className="profile-col">
                  <div className="profile-card evidence-card">
                    <div className="profile-card-label">At a glance</div>
                    <div className="evidence-stat-grid">
                      <div className="evidence-stat">
                        <div className="evidence-stat-val">{savedDays}</div>
                        <div className="evidence-stat-label">days logged</div>
                      </div>
                      <div className="evidence-stat">
                        <div className="evidence-stat-val">{confDays}</div>
                        <div className="evidence-stat-label">confidence entries</div>
                      </div>
                      <div className="evidence-stat">
                        <div className="evidence-stat-val">{spaceDays}</div>
                        <div className="evidence-stat-label">space &amp; systems days</div>
                      </div>
                      {avg30 != null && (
                        <div className="evidence-stat">
                          <div className="evidence-stat-val">{avg30}</div>
                          <div className="evidence-stat-label">avg energy (30d)</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {energyTrend && (
                    <div className="profile-card">
                      <div className="profile-card-label">Energy this week</div>
                      <div className={`evidence-trend-badge ${energyTrend}`}>
                        {energyTrend === 'up' && 'Trending higher than earlier in the week'}
                        {energyTrend === 'down' && 'A bit lower than earlier in the week — that happens'}
                        {energyTrend === 'steady' && 'Holding steady this week'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-col">
                  {vitaminRate != null && (
                    <div className="profile-card">
                      <div className="profile-card-label">Supplement consistency</div>
                      <div className="evidence-bar-row">
                        <div className="evidence-bar-track">
                          <div className="evidence-bar-fill" style={{ width: `${vitaminRate}%` }} />
                        </div>
                        <span className="evidence-bar-label">{vitaminRate}%</span>
                      </div>
                      <p className="profile-note">Across tracked vitamins on logged days.</p>
                    </div>
                  )}

                  {envCheckRate != null && (
                    <div className="profile-card">
                      <div className="profile-card-label">Environment resets</div>
                      <div className="evidence-bar-row">
                        <div className="evidence-bar-track">
                          <div className="evidence-bar-fill teal" style={{ width: `${envCheckRate}%` }} />
                        </div>
                        <span className="evidence-bar-label">{envCheckRate}%</span>
                      </div>
                      <p className="profile-note">Average across all environment checks on logged days.</p>
                    </div>
                  )}

                  <div className="profile-card">
                    <div className="profile-card-label">What Camryn sees</div>
                    <div className="evidence-observations">
                      {savedDays >= 7 && (
                        <p>You've been showing up consistently. That's the whole point.</p>
                      )}
                      {savedDays < 7 && savedDays >= 3 && (
                        <p>A few days in — the patterns are just starting to form. Keep going.</p>
                      )}
                      {trackedVitamins.length > 0 && vitaminRate != null && vitaminRate >= 70 && (
                        <p>Supplements are becoming a reliable part of your routine.</p>
                      )}
                      {cycleEntries.length >= 2 && (
                        <p>You're building a cycle picture over time. That context matters for everything else.</p>
                      )}
                      {confDays >= 3 && (
                        <p>Confidence notes are accumulating. The rebrand profile is taking shape quietly.</p>
                      )}
                      {winsWords.length >= 3 && (
                        <p>Your space wins are starting to show a pattern — certain setups keep working for you.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="profile-danger-zone">
        <div className="profile-danger-header">
          <h3 className="profile-danger-title">Reset protocol</h3>
          <p className="profile-danger-sub">
            Start over from Phase 1 — clears your phase, quest progress, and completion status.
          </p>
        </div>
        <button type="button" className="profile-danger-btn" onClick={() => setShowResetConfirm(true)}>
          Reset protocol
        </button>
      </div>

      {showResetConfirm && (
        <div className="reset-confirm-backdrop" onClick={() => !resetting && setShowResetConfirm(false)}>
          <div className="reset-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="reset-confirm-title">Reset your protocol?</h3>
            <p className="reset-confirm-body">
              This puts your phase back to 1, clears quest progress, and marks the protocol as not complete. It can&rsquo;t be undone.
            </p>
            <p className="reset-confirm-note">
              Your day-by-day save history and streak stay on record — that part can&rsquo;t be cleared from here.
            </p>
            {resetError && <p className="reset-confirm-error">{resetError}</p>}
            <div className="reset-confirm-actions">
              <button type="button" className="reset-confirm-cancel" onClick={() => setShowResetConfirm(false)} disabled={resetting}>
                Cancel
              </button>
              <button type="button" className="reset-confirm-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting…' : 'Yes, reset my protocol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
