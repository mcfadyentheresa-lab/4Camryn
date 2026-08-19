import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITALS_ENDPOINT = `${SUPABASE_URL}/functions/v1/camryn-vitals`;
const VITALS_SECRET = import.meta.env.VITE_CAMRYN_VITALS_SECRET as string | undefined;

interface VitalsRow {
  entry_date: string;
  resting_hr: number | null;
  hrv_ms: number | null;
  sleep_hours: number | null;
  steps: number | null;
}

interface VitalsCardProps {
  userId: string;
}

type CalibrationStage = 'none' | 'watching' | 'early_read' | 'baseline' | 'cycle';

function getCalibrationStage(daysLogged: number): CalibrationStage {
  if (daysLogged === 0) return 'none';
  if (daysLogged < 7) return 'watching';
  if (daysLogged < 14) return 'early_read';
  if (daysLogged < 28) return 'baseline';
  return 'cycle';
}

const STAGE_LABELS: Record<CalibrationStage, { badge: string; headline: string; detail: string }> = {
  none: {
    badge: 'Not connected',
    headline: 'Connect your Apple Watch',
    detail: '',
  },
  watching: {
    badge: 'Calibrating',
    headline: 'Camryn is receiving your data',
    detail: 'She needs 7 days before she can tell what\'s normal for you. Right now she\'s just watching.',
  },
  early_read: {
    badge: 'Early read',
    headline: 'Resting HR and sleep are readable',
    detail: 'HRV needs 14 days for a reliable personal baseline. Camryn can reference your heart rate and sleep patterns now.',
  },
  baseline: {
    badge: 'Baseline ready',
    headline: 'Camryn has your HRV baseline',
    detail: 'She can now tell you when today looks different from your normal — and what that means for how to run the day.',
  },
  cycle: {
    badge: 'Fully calibrated',
    headline: 'A full cycle of data',
    detail: 'Camryn can now see how your HRV and sleep shift across your menstrual cycle. This is where the guidance gets personal.',
  },
};

const SHORTCUT_STEPS = [
  'Open the Shortcuts app on your iPhone.',
  'Tap the + icon to create a new shortcut.',
  'Add a "Get Health Samples" action. Set type to "Heart Rate Variability". Set date range to "Yesterday". Tap "Get Average".',
  'Add another "Get Health Samples" action. Set type to "Resting Heart Rate". Date range "Yesterday". Get average.',
  'Add another "Get Health Samples" action. Set type to "Sleep Analysis". Date range "Last night". Get total.',
  'Add another "Get Health Samples" action. Set type to "Step Count". Date range "Yesterday". Get sum.',
  'Add a "Dictionary" action. Set keys: date (use "Formatted Date" with format YYYY-MM-dd, date "Yesterday"), hrv_ms (from step 3), resting_hr (from step 4), sleep_hours (from step 5 ÷ 3600), steps (from step 6).',
  'Add a "Get Contents of URL" action. Set URL to your Camryn vitals endpoint. Method POST. Request Body: JSON. Pass the Dictionary from step 7. Under Headers, add one: key "x-camryn-vitals-secret", value is your vitals secret below.',
  'Name the shortcut "Camryn Morning Sync".',
  'Tap the shortcut info icon (i), enable "Add to Home Screen" and set it to run automatically at 7:00 AM using Automation.',
];

function fmt(n: number | null | undefined, decimals = 0): string {
  if (n == null) return '—';
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}

export default function VitalsCard({ userId }: VitalsCardProps) {
  const [latest, setLatest] = useState<VitalsRow | null>(null);
  const [daysLogged, setDaysLogged] = useState(0);
  const [hrv7avg, setHrv7avg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [copied, setCopied] = useState<'secret' | 'url' | null>(null);

  const copyToClipboard = (text: string, key: 'secret' | 'url') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];
      const cutoff14 = new Date();
      cutoff14.setDate(cutoff14.getDate() - 14);
      const cutoff14str = cutoff14.toISOString().split('T')[0];

      const [latestRes, countRes, hrv7Res] = await Promise.all([
        supabase
          .from('camryn_vitals')
          .select('entry_date, resting_hr, hrv_ms, sleep_hours, steps')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('camryn_vitals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('camryn_vitals')
          .select('hrv_ms')
          .eq('user_id', userId)
          .gte('entry_date', cutoff14str)
          .lte('entry_date', today)
          .not('hrv_ms', 'is', null),
      ]);

      setLatest((latestRes.data as unknown as VitalsRow) || null);
      setDaysLogged(countRes.count ?? 0);

      const hrvVals = ((hrv7Res.data ?? []) as { hrv_ms: number }[]).map((r) => r.hrv_ms);
      setHrv7avg(hrvVals.length > 0 ? hrvVals.reduce((a, b) => a + b, 0) / hrvVals.length : null);

      setLoading(false);
    };
    load();
  }, [userId]);

  const stage = getCalibrationStage(daysLogged);
  const stageInfo = STAGE_LABELS[stage];

  const deviationPct = latest?.hrv_ms != null && hrv7avg != null && daysLogged >= 14
    ? Math.round(((latest.hrv_ms - hrv7avg) / hrv7avg) * 100)
    : null;

  if (loading) return null;

  return (
    <div className="body-card vitals-card" style={{ marginBottom: '20px' }}>
      <div className="body-card-header">
        <h3 className="body-card-title">Apple Watch</h3>
        <span className={`body-pill ${stage === 'none' ? '' : stage === 'watching' ? 'amber' : 'teal'}`}>
          {stageInfo.badge}
        </span>
      </div>

      {stage === 'none' ? (
        <div className="vitals-empty">
          <p className="vitals-empty-text">
            Connect your Apple Watch to give Camryn real recovery data — resting heart rate, HRV, and sleep — so her guidance can be specific to what your body is actually doing.
          </p>
          <div className="vitals-timeline">
            <div className="vitals-timeline-row">
              <span className="vitals-timeline-days">Day 1</span>
              <span className="vitals-timeline-label">Data starts flowing. Camryn is watching.</span>
            </div>
            <div className="vitals-timeline-row">
              <span className="vitals-timeline-days">Day 7</span>
              <span className="vitals-timeline-label">Resting HR and sleep become readable.</span>
            </div>
            <div className="vitals-timeline-row">
              <span className="vitals-timeline-days">Day 14</span>
              <span className="vitals-timeline-label">HRV baseline established. Camryn can flag recovery days.</span>
            </div>
            <div className="vitals-timeline-row">
              <span className="vitals-timeline-days">Day 28+</span>
              <span className="vitals-timeline-label">A full cycle of data. Guidance becomes cycle-specific.</span>
            </div>
          </div>
          <button
            className="vitals-setup-btn"
            onClick={() => setSetupOpen((v) => !v)}
            aria-expanded={setupOpen}
          >
            {setupOpen ? 'Hide setup steps' : 'How to connect — iOS Shortcut setup'}
          </button>
          {setupOpen && (
            <div className="vitals-shortcut-steps">
              <p className="vitals-shortcut-intro">
                This takes about 10 minutes once. After that it runs silently every morning at 7am — no action required.
              </p>
              <ol className="vitals-steps-list">
                {SHORTCUT_STEPS.map((step, i) => (
                  <li key={i} className="vitals-step-item">
                    <span className="vitals-step-num">{i + 1}</span>
                    <span className="vitals-step-text">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="vitals-copy-block">
                <div className="vitals-copy-row">
                  <span className="vitals-copy-label">Vitals endpoint URL</span>
                  <div className="vitals-copy-value-wrap">
                    <code className="vitals-copy-value">{VITALS_ENDPOINT}</code>
                    <button
                      className="vitals-copy-btn"
                      onClick={() => copyToClipboard(VITALS_ENDPOINT, 'url')}
                    >
                      {copied === 'url' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                {VITALS_SECRET ? (
                  <div className="vitals-copy-row">
                    <span className="vitals-copy-label">Vitals secret (header value)</span>
                    <div className="vitals-copy-value-wrap">
                      <code className="vitals-copy-value">{VITALS_SECRET}</code>
                      <button
                        className="vitals-copy-btn"
                        onClick={() => copyToClipboard(VITALS_SECRET, 'secret')}
                      >
                        {copied === 'secret' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="vitals-shortcut-note">
                    Vitals secret isn't configured in this environment yet — the Shortcut won't be able to sync until it is.
                  </p>
                )}
                <p className="vitals-shortcut-note">
                  Paste the URL into step 8, and add the secret as the "x-camryn-vitals-secret" header value in that same step. Keep the secret private — it's what gives the Shortcut write access to your data.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="vitals-calibration-headline">{stageInfo.headline}</p>
          {stageInfo.detail && (
            <p className="vitals-calibration-detail">{stageInfo.detail}</p>
          )}

          {daysLogged < 14 && (
            <div className="vitals-progress-track">
              <div
                className="vitals-progress-fill"
                style={{ width: `${Math.min((daysLogged / 14) * 100, 100)}%` }}
              />
            </div>
          )}
          <p className="vitals-progress-label">
            {daysLogged < 14
              ? `${daysLogged} of 14 days to full HRV baseline`
              : daysLogged < 28
              ? `${daysLogged} of 28 days to cycle-correlated data`
              : `${daysLogged} days of data`}
          </p>

          {latest && (
            <div className="vitals-metrics">
              {latest.resting_hr != null && (
                <div className="vitals-metric">
                  <span className="vitals-metric-val">{fmt(latest.resting_hr)}</span>
                  <span className="vitals-metric-label">Resting HR</span>
                  <span className="vitals-metric-unit">bpm</span>
                </div>
              )}
              {latest.hrv_ms != null && (
                <div className="vitals-metric">
                  <span className="vitals-metric-val">{fmt(latest.hrv_ms, 0)}</span>
                  <span className="vitals-metric-label">HRV</span>
                  <span className="vitals-metric-unit">
                    ms{deviationPct != null ? ` (${deviationPct >= 0 ? '+' : ''}${deviationPct}%)` : ''}
                  </span>
                </div>
              )}
              {latest.sleep_hours != null && (
                <div className="vitals-metric">
                  <span className="vitals-metric-val">{fmt(latest.sleep_hours, 1)}</span>
                  <span className="vitals-metric-label">Sleep</span>
                  <span className="vitals-metric-unit">hrs</span>
                </div>
              )}
              {latest.steps != null && (
                <div className="vitals-metric">
                  <span className="vitals-metric-val">{fmt(latest.steps)}</span>
                  <span className="vitals-metric-label">Steps</span>
                  <span className="vitals-metric-unit">yesterday</span>
                </div>
              )}
            </div>
          )}

          {deviationPct != null && (
            <div className={`vitals-hrv-signal ${deviationPct <= -15 ? 'low' : deviationPct >= 10 ? 'high' : 'normal'}`}>
              {deviationPct <= -15 && 'Recovery is below your baseline today. Camryn will treat this as a rest day.'}
              {deviationPct >= 10 && 'Recovery is above your baseline. Camryn knows you can push today.'}
              {deviationPct > -15 && deviationPct < 10 && 'HRV is within your normal range today.'}
            </div>
          )}

          {latest?.sleep_hours != null && latest.sleep_hours < 6 && (
            <div className="vitals-hrv-signal low">
              Under 6 hours last night. Camryn has noted this and will adjust today's demands.
            </div>
          )}

          <p className="vitals-source-note">
            Synced via iOS Shortcut · {latest?.entry_date ?? 'no recent sync'}
          </p>
        </>
      )}
    </div>
  );
}
