import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VITAMINS } from '../lib/constants';
import { CYCLE_PHASES, cyclePhaseFromName } from '../lib/protocol';
import { useSaveIndicator } from '../hooks/useSaveIndicator';
import CheckIcon from './ui/CheckIcon';
import SaveIndicator from './ui/SaveIndicator';
import CycleLearnModal from './CycleLearnModal';
import VitalsCard from './VitalsCard';

const CYCLE_STATUSES = [
  'Period day',
  'Post-period',
  'Ovulation-ish',
  'Luteal / PMS-ish',
  'Not sure',
];

const MOVEMENT_TYPES = [
  'Walk', 'Run', 'Strength', 'Yoga', 'Pilates', 'Cycling', 'Swim', 'HIIT', 'Stretch', 'Other',
] as const;

type MovementType = (typeof MOVEMENT_TYPES)[number];

interface ExerciseLog {
  id: string;
  movement_type: string;
  duration_min: number | null;
  intensity: string | null;
  notes: string;
}

interface ExerciseDraft {
  movement_type: MovementType;
  duration_min: string;
  intensity: 'low' | 'medium' | 'high';
  notes: string;
}

interface BodyEntry {
  weight: string;
  energy: number | null;
  symptoms: string;
  vitamins: Record<string, boolean>;
  cycle_status: string;
  cycle_note: string;
}

const EMPTY: BodyEntry = {
  weight: '',
  energy: null,
  symptoms: '',
  vitamins: {},
  cycle_status: '',
  cycle_note: '',
};

// Cycle phase guidance pulled from domain knowledge
const CYCLE_GUIDANCE: Record<string, { food: string; movement: string; energy: string }> = {
  Menstruation: {
    food: 'Prioritise iron-rich foods (red meat, lentils, spinach) and reduce inflammatory foods. Warm, easy-to-digest meals.',
    movement: 'Gentle movement reduces cramping — walk, yin yoga, light stretching. High intensity increases inflammation today.',
    energy: 'Both estrogen and progesterone are at their lowest. Rest is protocol, not weakness.',
  },
  Follicular: {
    food: 'Insulin sensitivity is at its highest — carbohydrates are used most efficiently now. Focus on protein and varied plant foods.',
    movement: 'Strength output and pain tolerance are highest. Good window for progressive overload and heavier lifts.',
    energy: 'Rising estrogen improves mood, neuroplasticity, and motivation. Tackle demanding tasks and new habits.',
  },
  Ovulation: {
    food: 'Maintain protein. Include anti-inflammatory omega-3 foods. Body temperature rises slightly — extra hydration matters.',
    movement: 'Peak performance window. Train harder, lift heavier. Note: relaxin hormone increases joint laxity — warm up well.',
    energy: 'Estrogen and testosterone peak together. Social energy, confidence, and drive are at their highest.',
  },
  'Early luteal': {
    food: 'Increase protein by 10–20g to counter progesterone-driven muscle protein breakdown. Complex carbs help with mood.',
    movement: 'Progesterone raises perceived exertion at the same effort. Honour that — slightly lighter intensity is smart, not lazy.',
    energy: 'Good energy early in this phase. Use the first luteal week before PMS window to finish demanding projects.',
  },
  'Late luteal': {
    food: 'Reduce refined sugar and alcohol — these directly amplify PMS severity. Magnesium-rich foods help (dark chocolate, leafy greens).',
    movement: 'Listen to your body. Gentle movement is often more supportive than pushing through. Stretching and walking are ideal.',
    energy: 'Stress tolerance is lower. The same stressors feel amplified. Protect sleep and reduce demands where possible.',
  },
  'Not sure': {
    food: 'Aim for protein at every meal and fiber from 3+ plant sources daily. This covers you wherever you are in your cycle.',
    movement: 'Consistent movement — even a daily walk — is the most reliable investment regardless of cycle phase.',
    energy: 'Tracking your first period date will unlock personalised cycle guidance here.',
  },
};

function getCycleGuidance(phaseName: string) {
  for (const key of Object.keys(CYCLE_GUIDANCE)) {
    if (phaseName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(phaseName.toLowerCase())) {
      return CYCLE_GUIDANCE[key];
    }
  }
  return CYCLE_GUIDANCE['Not sure'];
}

interface BodySectionProps {
  userId: string;
  cyclePhase?: string;
  cycleDay?: number | null;
  lastPeriodDate?: string | null;
  onCyclePhaseChange?: (name: string) => void;
  onCycleDateChange?: (dateStr: string) => void;
}

export default function BodySection({
  userId,
  cyclePhase = 'Not sure',
  cycleDay,
  lastPeriodDate,
  onCyclePhaseChange,
  onCycleDateChange,
}: BodySectionProps) {
  const today = new Date().toISOString().split('T')[0];
  const [entry, setEntry] = useState<BodyEntry>(EMPTY);
  const [saveLabel, startSave, doneSave, failSave] = useSaveIndicator();
  const pendingRef = useRef<BodyEntry>(EMPTY);
  const [showCycleLearning, setShowCycleLearning] = useState(false);
  const [showDateInput, setShowDateInput] = useState(!!lastPeriodDate);

  // Exercise state
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [exerciseDraft, setExerciseDraft] = useState<ExerciseDraft | null>(null);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [exerciseSave, startExSave, doneExSave, failExSave] = useSaveIndicator();

  const cyclePhaseInfo = cyclePhaseFromName(cyclePhase);
  const guidance = getCycleGuidance(cyclePhase);

  useEffect(() => {
    const load = async () => {
      const [bodyRes, exerciseRes] = await Promise.all([
        supabase
          .from('camryn_body')
          .select('weight, energy, symptoms, vitamins, cycle_status, cycle_note')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .maybeSingle(),
        supabase
          .from('camryn_exercise')
          .select('id, movement_type, duration_min, intensity, notes')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .order('created_at', { ascending: true }),
      ]);

      if (bodyRes.data) {
        setEntry({
          weight: bodyRes.data.weight != null ? String(bodyRes.data.weight) : '',
          energy: bodyRes.data.energy ?? null,
          symptoms: bodyRes.data.symptoms || '',
          vitamins: (bodyRes.data.vitamins as Record<string, boolean>) || {},
          cycle_status: bodyRes.data.cycle_status || '',
          cycle_note: bodyRes.data.cycle_note || '',
        });
      }
      if (exerciseRes.data) setExerciseLogs(exerciseRes.data as ExerciseLog[]);
    };

    load();
  }, [userId]);

  const persist = async (e: BodyEntry) => {
    startSave();
    const { error } = await supabase.from('camryn_body').upsert(
      {
        user_id: userId,
        entry_date: today,
        weight: e.weight !== '' ? parseFloat(e.weight) : null,
        energy: e.energy,
        symptoms: e.symptoms,
        vitamins: e.vitamins,
        cycle_status: e.cycle_status,
        cycle_note: e.cycle_note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    );
    if (error) {
      console.error('body entry save failed:', error);
      failSave();
      return;
    }
    doneSave();
  };

  const update = (patch: Partial<BodyEntry>) => {
    const next = { ...entry, ...patch };
    setEntry(next);
    pendingRef.current = next;
  };

  const handleBlur = () => persist(pendingRef.current);

  const [tappedVitamin, setTappedVitamin] = useState<string | null>(null);

  const toggleVitamin = (id: string) => {
    const next = { ...entry, vitamins: { ...entry.vitamins, [id]: !entry.vitamins[id] } };
    setEntry(next);
    pendingRef.current = next;
    persist(next);
    if (!entry.vitamins[id]) {
      setTappedVitamin(id);
      setTimeout(() => setTappedVitamin(null), 400);
    }
  };

  const selectCycleStatus = (status: string) => {
    const next = { ...entry, cycle_status: entry.cycle_status === status ? '' : status };
    setEntry(next);
    pendingRef.current = next;
    persist(next);
  };

  const handleAddExercise = async () => {
    if (!exerciseDraft) return;
    startExSave();
    const { data, error } = await supabase
      .from('camryn_exercise')
      .insert([{
        user_id: userId,
        entry_date: today,
        movement_type: exerciseDraft.movement_type,
        duration_min: exerciseDraft.duration_min ? parseInt(exerciseDraft.duration_min) : null,
        intensity: exerciseDraft.intensity,
        notes: exerciseDraft.notes.trim() || null,
      }])
      .select('id, movement_type, duration_min, intensity, notes')
      .maybeSingle();
    if (error) {
      console.error('exercise log save failed:', error);
      failExSave();
      return;
    }
    doneExSave();
    if (data) setExerciseLogs((prev) => [...prev, data as ExerciseLog]);
    setExerciseDraft(null);
  };

  const handleDeleteExercise = async (id: string) => {
    const { error } = await supabase.from('camryn_exercise').delete().eq('id', id);
    if (error) {
      console.error('exercise log delete failed:', error);
      failExSave();
      return;
    }
    setExerciseLogs((prev) => prev.filter((e) => e.id !== id));
  };

  const intensityLabel = (i: string | null) => {
    if (i === 'low') return 'Easy';
    if (i === 'medium') return 'Moderate';
    if (i === 'high') return 'Hard';
    return '';
  };

  return (
    <section className="body-section">
      <div className="body-section-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Body</div>
        <h2 className="body-section-title">What your body is doing today</h2>
        <p className="body-section-sub">
          Weight, energy, cycle status, vitamins, and movement — tracked quietly to support the protocol over time. All fields are optional.
        </p>
      </div>

      {/* ── Cycle phase card ── */}
      {onCyclePhaseChange && (
        <div className="cycle-card" style={{ marginBottom: '20px' }}>
          <div className="cycle-label">Cycle phase</div>
          {cycleDay && <div className="cycle-day-badge">Day {cycleDay}</div>}
          <div className="cycle-phase-name">{cyclePhaseInfo.name}</div>
          <div className="cycle-phase-desc">{cyclePhaseInfo.desc}</div>

          {showDateInput ? (
            <>
              <div className="cycle-input-label">First day of last period</div>
              <input
                type="date"
                className="cycle-date-input"
                value={lastPeriodDate || ''}
                onChange={(e) => onCycleDateChange?.(e.target.value)}
              />
              <button
                className="cycle-phase-btn"
                style={{ marginTop: '4px', fontSize: '0.78rem' }}
                onClick={() => setShowDateInput(false)}
              >
                Set phase manually instead
              </button>
            </>
          ) : (
            <>
              <div className="cycle-phase-buttons">
                {CYCLE_PHASES.filter((p) => p.name !== 'Not sure').map((p) => (
                  <button
                    key={p.name}
                    className={`cycle-phase-btn ${p.name === cyclePhase ? 'active' : ''}`}
                    onClick={() => onCyclePhaseChange(p.name)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                className="cycle-phase-btn"
                style={{ marginTop: '8px', fontSize: '0.78rem' }}
                onClick={() => setShowDateInput(true)}
              >
                Use period date instead
              </button>
            </>
          )}

          <button className="cycle-learn-btn" onClick={() => setShowCycleLearning(true)}>
            Learn about your phase →
          </button>

          {showCycleLearning && (
            <CycleLearnModal
              phaseName={cyclePhase}
              onClose={() => setShowCycleLearning(false)}
            />
          )}
        </div>
      )}

      {/* ── Apple Watch vitals card ── */}
      <VitalsCard userId={userId} />

      {/* ── Cycle guidance card ── */}
      <div className="body-card" style={{ marginBottom: '20px' }}>
        <div className="body-card-header">
          <h3 className="body-card-title">What this phase means for you</h3>
          <span className="body-pill sage">{cyclePhase}</span>
        </div>

        <div className="body-guidance-body">
          <div className="body-guidance-row">
            <span className="body-guidance-icon">🥗</span>
            <div>
              <div className="body-guidance-row-label">Food</div>
              <p className="body-guidance-text">{guidance.food}</p>
            </div>
          </div>
          <div className="body-guidance-row">
            <span className="body-guidance-icon">🏋️</span>
            <div>
              <div className="body-guidance-row-label">Movement</div>
              <p className="body-guidance-text">{guidance.movement}</p>
            </div>
          </div>
          <div className="body-guidance-row">
            <span className="body-guidance-icon">⚡</span>
            <div>
              <div className="body-guidance-row-label">Energy</div>
              <p className="body-guidance-text">{guidance.energy}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="body-grid">
        {/* Card 1 — Today's body snapshot */}
        <div className="body-card">
          <div className="body-card-header">
            <h3 className="body-card-title">Today's body snapshot</h3>
            <span className="body-pill">Body data</span>
          </div>

          <div className="body-field">
            <label className="field-label" htmlFor="body-weight">
              Weight <span className="body-optional">(optional)</span>
            </label>
            <input
              id="body-weight"
              type="number"
              step="0.1"
              className="body-input"
              value={entry.weight}
              onChange={(e) => update({ weight: e.target.value })}
              onBlur={handleBlur}
              placeholder="e.g. 145.2"
            />
          </div>

          <div className="body-field">
            <label className="field-label">
              Body energy <span className="body-optional">(optional — separate from today's protocol check-in)</span>
            </label>
            <div className="energy-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`energy-dot ${entry.energy === n ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...entry, energy: entry.energy === n ? null : n };
                    setEntry(next);
                    pendingRef.current = next;
                    persist(next);
                  }}
                  aria-label={`Energy ${n}`}
                >
                  {n}
                </button>
              ))}
              <span className="energy-label">
                {entry.energy === null ? '' :
                 entry.energy <= 2 ? 'Low' :
                 entry.energy === 3 ? 'Okay' : 'Good'}
              </span>
            </div>
          </div>

          <div className="body-field">
            <label className="field-label" htmlFor="body-symptoms">
              Hormone / body symptoms <span className="body-optional">(optional)</span>
            </label>
            <textarea
              id="body-symptoms"
              className="body-textarea"
              value={entry.symptoms}
              onChange={(e) => update({ symptoms: e.target.value })}
              onBlur={handleBlur}
              placeholder="Cramping, bloating, tenderness, anxiety, vivid dreams, etc."
            />
          </div>
        </div>

        {/* Card 2 — Vitamins & cycle */}
        <div className="body-card">
          <div className="body-card-header">
            <h3 className="body-card-title">Vitamins &amp; cycle</h3>
            <span className="body-pill teal">Supplements</span>
          </div>

          <div className="body-field">
            <div className="field-label" style={{ marginBottom: '8px' }}>
              Taken today <span className="body-optional">(tap to mark)</span>
            </div>
            <div className="vitamin-grid">
              {VITAMINS.map((v) => (
                <button
                  key={v.id}
                  className={`vitamin-btn ${entry.vitamins[v.id] ? 'checked' : ''} ${tappedVitamin === v.id ? 'vitamin-pop' : ''}`}
                  onClick={() => toggleVitamin(v.id)}
                >
                  <span className="vitamin-check">
                    {entry.vitamins[v.id] && <CheckIcon />}
                  </span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="body-field">
            <div className="field-label" style={{ marginBottom: '8px' }}>
              Cycle status <span className="body-optional">(optional)</span>
            </div>
            <div className="cycle-status-row">
              {CYCLE_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`seg-btn ${entry.cycle_status === s ? 'active' : ''}`}
                  onClick={() => selectCycleStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="body-field">
            <label className="field-label" htmlFor="body-cycle-note">
              Cycle note <span className="body-optional">(optional)</span>
            </label>
            <textarea
              id="body-cycle-note"
              className="body-textarea"
              value={entry.cycle_note}
              onChange={(e) => update({ cycle_note: e.target.value })}
              onBlur={handleBlur}
              placeholder="Day 2, medium flow, craving salt — whatever feels worth noting."
            />
          </div>
        </div>
      </div>

      {/* ── Exercise log ── */}
      <div className="body-card" style={{ marginTop: '20px' }}>
        <div className="body-card-header">
          <h3 className="body-card-title">Movement today</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {exerciseLogs.length > 0 && (
              <span className="body-pill teal">{exerciseLogs.length} logged</span>
            )}
            <button
              className={`food-add-meal-btn ${exerciseOpen ? 'open' : ''}`}
              onClick={() => {
                setExerciseOpen((v) => !v);
                if (!exerciseDraft) {
                  setExerciseDraft({ movement_type: 'Walk', duration_min: '', intensity: 'medium', notes: '' });
                }
              }}
              title="Log movement"
            >
              {exerciseOpen ? '✕' : '+'}
            </button>
          </div>
        </div>

        {exerciseLogs.length === 0 && !exerciseOpen && (
          <p className="body-guidance-preview" style={{ marginTop: '6px' }}>No movement logged yet today. Tap + to add.</p>
        )}

        {exerciseLogs.map((log) => (
          <div key={log.id} className="exercise-log-item">
            <div className="exercise-log-info">
              <span className="exercise-log-type">{log.movement_type}</span>
              {log.duration_min && <span className="exercise-log-meta">{log.duration_min} min</span>}
              {log.intensity && <span className={`exercise-intensity-badge ${log.intensity}`}>{intensityLabel(log.intensity)}</span>}
              {log.notes && <span className="exercise-log-note">{log.notes}</span>}
            </div>
            <button
              className="food-delete-btn"
              onClick={() => handleDeleteExercise(log.id)}
              aria-label="Remove"
            >✕</button>
          </div>
        ))}

        {exerciseOpen && exerciseDraft && (
          <div className="exercise-draft-form">
            <div className="exercise-type-grid">
              {MOVEMENT_TYPES.map((t) => (
                <button
                  key={t}
                  className={`seg-btn ${exerciseDraft.movement_type === t ? 'active' : ''}`}
                  onClick={() => setExerciseDraft((prev) => prev ? { ...prev, movement_type: t } : prev)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="exercise-draft-row">
              <div className="food-macro-field">
                <label className="food-macro-field-label">Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  className="body-input"
                  value={exerciseDraft.duration_min}
                  onChange={(e) => setExerciseDraft((prev) => prev ? { ...prev, duration_min: e.target.value } : prev)}
                  placeholder="e.g. 30"
                />
              </div>
              <div className="food-macro-field">
                <label className="food-macro-field-label">Intensity</label>
                <div className="food-profile-chips">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      className={`food-profile-chip ${exerciseDraft.intensity === level ? 'active' : ''}`}
                      onClick={() => setExerciseDraft((prev) => prev ? { ...prev, intensity: level } : prev)}
                    >
                      {intensityLabel(level)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              type="text"
              className="body-input"
              value={exerciseDraft.notes}
              onChange={(e) => setExerciseDraft((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
              placeholder="Note (optional)"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '8px' }}>
              <button
                className="food-save-meal-btn"
                onClick={handleAddExercise}
                disabled={!exerciseDraft.movement_type}
              >
                Log movement
              </button>
            </div>
            <SaveIndicator state={exerciseSave} className="body-save-indicator" />
          </div>
        )}
      </div>

      <SaveIndicator state={saveLabel} className="body-save-indicator" />
    </section>
  );
}
