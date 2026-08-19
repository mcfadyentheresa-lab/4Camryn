import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ENV_CHECKS } from '../lib/constants';
import { useSaveIndicator } from '../hooks/useSaveIndicator';
import CheckIcon from './ui/CheckIcon';
import SaveIndicator from './ui/SaveIndicator';

interface SpaceEntry {
  space_wins: string;
  friction_note: string;
  systems_note: string;
  environment_check: Record<string, boolean>;
}

const EMPTY: SpaceEntry = {
  space_wins: '',
  friction_note: '',
  systems_note: '',
  environment_check: {},
};

interface SpaceSectionProps {
  userId: string;
}

export default function SpaceSection({ userId }: SpaceSectionProps) {
  const today = new Date().toISOString().split('T')[0];
  const [entry, setEntry] = useState<SpaceEntry>(EMPTY);
  const [saveLabel, startSave, doneSave, failSave] = useSaveIndicator();
  const pendingRef = useRef<SpaceEntry>(EMPTY);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('camryn_space')
        .select('space_wins, friction_note, systems_note, environment_check')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .maybeSingle();

      if (data) {
        setEntry({
          space_wins: data.space_wins || '',
          friction_note: data.friction_note || '',
          systems_note: data.systems_note || '',
          environment_check: (data.environment_check as Record<string, boolean>) || {},
        });
      }
    };

    load();
  }, [userId]);

  const persist = async (e: SpaceEntry) => {
    startSave();
    const { error } = await supabase.from('camryn_space').upsert(
      {
        user_id: userId,
        entry_date: today,
        space_wins: e.space_wins,
        friction_note: e.friction_note,
        systems_note: e.systems_note,
        environment_check: e.environment_check,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    );
    if (error) {
      console.error('space entry save failed:', error);
      failSave();
      return;
    }
    doneSave();
  };

  const update = (patch: Partial<SpaceEntry>) => {
    const next = { ...entry, ...patch };
    setEntry(next);
    pendingRef.current = next;
  };

  const handleBlur = () => persist(pendingRef.current);

  const toggleCheck = (id: string) => {
    const next: SpaceEntry = {
      ...entry,
      environment_check: { ...entry.environment_check, [id]: !entry.environment_check[id] },
    };
    setEntry(next);
    pendingRef.current = next;
    persist(next);
  };

  const checkedCount = ENV_CHECKS.filter(c => entry.environment_check[c.id]).length;

  return (
    <section className="space-section">
      <div className="space-section-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Space &amp; Systems</div>
        <h2 className="space-section-title">The environment you're building</h2>
        <p className="space-section-sub">
          Small environmental resets and steady routines are what make the upgraded version of you feel normal, not exhausting — especially on low-energy days.
        </p>
        <div className="section-how-it-works">
          <div className="section-how-title">How this works</div>
          <p className="section-how-text">
            No alarm, no reminder. Visit this tab at the end of your day — even a quick glance before bed is enough.
            The environment checklist resets each morning so you start fresh. The notes capture what worked and what created friction,
            giving Camryn a pattern to reflect back to you over time.
          </p>
          <div className="section-how-chips">
            <span className="section-how-chip">Best done in the evening</span>
            <span className="section-how-chip">Checklist resets daily</span>
            <span className="section-how-chip">Notes are saved per day</span>
          </div>
        </div>
      </div>

      <div className="space-grid">
        {/* Card 1 — Environment check */}
        <div className="space-card">
          <div className="space-card-header">
            <h3 className="space-card-title">Environment check</h3>
            <span className="space-pill">
              {checkedCount}/{ENV_CHECKS.length} done
            </span>
          </div>
          <p className="space-card-intro">
            Small resets that make tomorrow easier. None of these are required.
          </p>
          <div className="space-checklist">
            {ENV_CHECKS.map(c => (
              <button
                key={c.id}
                className={`space-check-row ${entry.environment_check[c.id] ? 'checked' : ''}`}
                onClick={() => toggleCheck(c.id)}
              >
                <span className="space-check-box">
                  {entry.environment_check[c.id] && <CheckIcon />}
                </span>
                {c.label}
              </button>
            ))}
          </div>
          <div className="space-checklist-footer">
            <div className="space-progress-bar">
              <div
                className="space-progress-fill"
                style={{ width: `${(checkedCount / ENV_CHECKS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2 — Notes */}
        <div className="space-card">
          <div className="space-card-header">
            <h3 className="space-card-title">Space &amp; systems notes</h3>
            <span className="space-pill teal">Today's log</span>
          </div>

          <div className="space-field">
            <label className="field-label" htmlFor="space-wins">
              What felt set up well today
            </label>
            <textarea
              id="space-wins"
              className="space-textarea"
              value={entry.space_wins}
              onChange={e => update({ space_wins: e.target.value })}
              onBlur={handleBlur}
              placeholder="e.g. Coffee ready the night before, gym bag packed, clean desk."
            />
          </div>

          <div className="space-field">
            <label className="field-label" htmlFor="space-friction">
              What created friction
            </label>
            <textarea
              id="space-friction"
              className="space-textarea"
              value={entry.friction_note}
              onChange={e => update({ friction_note: e.target.value })}
              onBlur={handleBlur}
              placeholder="e.g. Couldn't find keys, kitchen was a mess, no clean clothes."
            />
          </div>

          <div className="space-field">
            <label className="field-label" htmlFor="space-systems">
              Routine or system you ran (or want to run)
            </label>
            <textarea
              id="space-systems"
              className="space-textarea"
              value={entry.systems_note}
              onChange={e => update({ systems_note: e.target.value })}
              onBlur={handleBlur}
              placeholder="e.g. 10-min evening reset, weekly Sunday prep, morning capsule routine."
            />
          </div>
        </div>
      </div>

      <SaveIndicator state={saveLabel} className="space-save-indicator" />
    </section>
  );
}
