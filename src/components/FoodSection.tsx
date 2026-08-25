import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSaveIndicator } from '../hooks/useSaveIndicator';
import SaveIndicator from './ui/SaveIndicator';
import BarcodeScanner, { type NutritionData } from './BarcodeScanner';
import { calcMacroTargets, type FoodProfile, type Goal, type ActivityBaseline, type MacroTargets } from '../lib/macros';
import { localToday } from '../lib/date';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

interface FoodEntry {
  id: string;
  meal_type: string;
  description: string;
  brand_name: string | null;
  serving_size: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  barcode: string | null;
  source: string;
  notes: string;
}

interface DailySummary {
  water_cups: number;
  hunger_rating: number | null;
  energy_after_eating: number | null;
  notes: string;
  exercised: boolean;
}

const EMPTY_SUMMARY: DailySummary = {
  water_cups: 0,
  hunger_rating: null,
  energy_after_eating: null,
  notes: '',
  exercised: false,
};

const EMPTY_PROFILE: FoodProfile = {
  height_cm: null,
  weight_kg: null,
  age: null,
  goal: 'maintain',
  activity_baseline: 'lightly_active',
};

interface AddMealDraft {
  mealType: MealType;
  description: string;
  brand_name: string;
  serving_size: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
  notes: string;
  barcode: string | null;
  source: 'manual' | 'barcode';
}

function emptyDraft(mealType: MealType): AddMealDraft {
  return {
    mealType,
    description: '',
    brand_name: '',
    serving_size: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    notes: '',
    barcode: null,
    source: 'manual',
  };
}

function getMealContext(currentPhase: number, cyclePhase: string): string {
  if (currentPhase === 1) {
    return 'Phase 1: aim for 25–35g fiber from 3+ plant sources daily. Add one fermented food.';
  }
  if (currentPhase === 2) {
    if (cyclePhase === 'Late luteal' || cyclePhase === 'Menstruation') {
      return 'Luteal/menstrual: increase protein slightly, prioritise iron-rich foods, reduce added sugar.';
    }
    return 'Phase 2: aim for 25–30g protein at breakfast. Use an 8–10 hour eating window.';
  }
  return 'Phase 3: target 1.6–2.2g protein per kg bodyweight. Prioritise omega-3 rich foods daily.';
}

function pct(eaten: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((eaten / target) * 100), 100);
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface FoodSectionProps {
  userId: string;
  currentPhase?: number;
  cyclePhase?: string;
}

export default function FoodSection({ userId, currentPhase = 1, cyclePhase = 'Not sure' }: FoodSectionProps) {
  const today = localToday();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [summary, setSummary] = useState<DailySummary>(EMPTY_SUMMARY);
  const [profile, setProfile] = useState<FoodProfile>(EMPTY_PROFILE);
  const [profileOpen, setProfileOpen] = useState(false);
  const [draft, setDraft] = useState<AddMealDraft | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [saveLabel, startSave, doneSave, failSave] = useSaveIndicator();
  const pendingRef = useRef<DailySummary>(EMPTY_SUMMARY);
  const profilePendingRef = useRef<FoodProfile>(EMPTY_PROFILE);

  useEffect(() => {
    const load = async () => {
      const [entriesRes, summaryRes, profileRes] = await Promise.all([
        supabase
          .from('camryn_food_entries')
          .select('id, meal_type, description, brand_name, serving_size, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, barcode, source, notes')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .order('created_at', { ascending: true }),
        supabase
          .from('camryn_food_daily')
          .select('water_cups, hunger_rating, energy_after_eating, notes, exercised')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .maybeSingle(),
        supabase
          .from('camryn_food_profile')
          .select('height_cm, weight_kg, age, goal, activity_baseline')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (entriesRes.data) setEntries(entriesRes.data as FoodEntry[]);
      if (summaryRes.data) {
        const s: DailySummary = {
          water_cups: summaryRes.data.water_cups ?? 0,
          hunger_rating: summaryRes.data.hunger_rating ?? null,
          energy_after_eating: summaryRes.data.energy_after_eating ?? null,
          notes: summaryRes.data.notes ?? '',
          exercised: summaryRes.data.exercised ?? false,
        };
        setSummary(s);
        pendingRef.current = s;
      }
      if (profileRes.data) {
        const p: FoodProfile = {
          height_cm: profileRes.data.height_cm ?? null,
          weight_kg: profileRes.data.weight_kg ?? null,
          age: profileRes.data.age ?? null,
          goal: (profileRes.data.goal as Goal) ?? 'maintain',
          activity_baseline: (profileRes.data.activity_baseline as ActivityBaseline) ?? 'lightly_active',
        };
        setProfile(p);
        profilePendingRef.current = p;
      }
    };
    load();
  }, [userId]);

  const persistSummary = async (s: DailySummary) => {
    startSave();
    const { error } = await supabase.from('camryn_food_daily').upsert(
      { user_id: userId, entry_date: today, ...s, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,entry_date' }
    );
    if (error) {
      console.error('food daily summary save failed:', error);
      failSave();
      return;
    }
    doneSave();
  };

  const persistProfile = async (p: FoodProfile) => {
    startSave();
    const { error } = await supabase.from('camryn_food_profile').upsert(
      { user_id: userId, ...p, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) {
      console.error('food profile save failed:', error);
      failSave();
      return;
    }
    doneSave();
  };

  const updateSummary = (patch: Partial<DailySummary>) => {
    const next = { ...summary, ...patch };
    setSummary(next);
    pendingRef.current = next;
  };

  const num = (v: string) => (v !== '' ? parseFloat(v) : null);

  const handleSaveEntry = async () => {
    if (!draft || !draft.description.trim()) return;
    const { data, error } = await supabase
      .from('camryn_food_entries')
      .insert([{
        user_id: userId,
        entry_date: today,
        meal_type: draft.mealType.toLowerCase(),
        description: draft.description.trim(),
        brand_name: draft.brand_name.trim() || null,
        serving_size: draft.serving_size.trim() || null,
        calories: num(draft.calories),
        protein_g: num(draft.protein_g),
        carbs_g: num(draft.carbs_g),
        fat_g: num(draft.fat_g),
        fiber_g: num(draft.fiber_g),
        notes: draft.notes.trim(),
        barcode: draft.barcode,
        source: draft.source,
      }])
      .select('id, meal_type, description, brand_name, serving_size, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, barcode, source, notes')
      .maybeSingle();

    if (error) {
      console.error('food entry save failed:', error);
      failSave();
      return;
    }
    if (data) setEntries((prev) => [...prev, data as FoodEntry]);
    setDraft(null);
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from('camryn_food_entries').delete().eq('id', id);
    if (error) {
      console.error('food entry delete failed:', error);
      failSave();
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleScanResult = (nutrition: NutritionData) => {
    const mealType = draft?.mealType ?? 'Snack';
    setShowScanner(false);
    setDraft({
      mealType: mealType as MealType,
      description: nutrition.productName,
      brand_name: nutrition.brandName,
      serving_size: nutrition.servingSize,
      calories: nutrition.calories != null ? String(nutrition.calories) : '',
      protein_g: nutrition.protein_g != null ? String(nutrition.protein_g) : '',
      carbs_g: nutrition.carbs_g != null ? String(nutrition.carbs_g) : '',
      fat_g: nutrition.fat_g != null ? String(nutrition.fat_g) : '',
      fiber_g: nutrition.fiber_g != null ? String(nutrition.fiber_g) : '',
      notes: '',
      barcode: nutrition.barcode,
      source: 'barcode',
    });
  };

  // Derived totals
  const eaten = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      protein: acc.protein + (e.protein_g ?? 0),
      carbs: acc.carbs + (e.carbs_g ?? 0),
      fat: acc.fat + (e.fat_g ?? 0),
      fiber: acc.fiber + (e.fiber_g ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const targets: MacroTargets = calcMacroTargets(profile, {
    phase: currentPhase,
    cyclePhase,
    exercised: summary.exercised,
  });

  const hasProfileData = !!(profile.weight_kg && profile.height_cm && profile.age);

  const grouped: Record<string, FoodEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.meal_type]) grouped[e.meal_type] = [];
    grouped[e.meal_type].push(e);
  }

  const mealContext = getMealContext(currentPhase, cyclePhase);
  const MAX_CUPS = 12;

  return (
    <section className="food-section">
      {showScanner && (
        <BarcodeScanner
          onResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="body-section-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Food</div>
        <h2 className="body-section-title">What you ate today</h2>
        <p className="body-section-sub">
          Scan a barcode or log manually — all nutrition is optional.
        </p>
      </div>

      {/* Protocol context banner */}
      <div className="food-context-banner">
        <span className="food-context-dot" />
        <span>{mealContext}</span>
      </div>

      {/* ── Macro Targets Panel ── */}
      <div className="food-targets-card">
        <div className="food-targets-header">
          <div className="food-targets-header-left">
            <h3 className="food-water-card-title">Daily macro targets</h3>
            {!hasProfileData && (
              <span className="food-targets-setup-hint">Add your stats for personalised targets</span>
            )}
          </div>
          <div className="food-targets-header-right">
            {/* Exercise toggle */}
            <button
              className={`food-exercise-toggle ${summary.exercised ? 'active' : ''}`}
              onClick={() => {
                const next = { ...summary, exercised: !summary.exercised };
                setSummary(next);
                pendingRef.current = next;
                persistSummary(next);
              }}
              title={summary.exercised ? 'Exercised today (tap to remove)' : 'Log exercise today'}
            >
              <ExerciseIcon active={summary.exercised} />
              {summary.exercised ? 'Exercised' : 'No exercise'}
            </button>

            <button
              className={`food-targets-setup-btn ${profileOpen ? 'open' : ''}`}
              onClick={() => setProfileOpen((v) => !v)}
              title="Set up your profile for personalised targets"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>

        {/* Profile setup form */}
        {profileOpen && (
          <div className="food-profile-form">
            <p className="food-profile-intro">
              Your stats are used to calculate a personalised calorie and macro target — adjusted daily for exercise, cycle phase, and protocol phase. Nothing is shared.
            </p>
            <div className="food-profile-grid">
              <div className="food-macro-field">
                <label className="food-macro-field-label">Weight (kg)</label>
                <input
                  type="number"
                  min="30" max="200"
                  className="body-input"
                  value={profile.weight_kg ?? ''}
                  onChange={(e) => {
                    const p = { ...profile, weight_kg: e.target.value ? parseFloat(e.target.value) : null };
                    setProfile(p);
                    profilePendingRef.current = p;
                  }}
                  onBlur={() => persistProfile(profilePendingRef.current)}
                  placeholder="e.g. 65"
                />
              </div>
              <div className="food-macro-field">
                <label className="food-macro-field-label">Height (cm)</label>
                <input
                  type="number"
                  min="130" max="220"
                  className="body-input"
                  value={profile.height_cm ?? ''}
                  onChange={(e) => {
                    const p = { ...profile, height_cm: e.target.value ? parseFloat(e.target.value) : null };
                    setProfile(p);
                    profilePendingRef.current = p;
                  }}
                  onBlur={() => persistProfile(profilePendingRef.current)}
                  placeholder="e.g. 165"
                />
              </div>
              <div className="food-macro-field">
                <label className="food-macro-field-label">Age</label>
                <input
                  type="number"
                  min="16" max="80"
                  className="body-input"
                  value={profile.age ?? ''}
                  onChange={(e) => {
                    const p = { ...profile, age: e.target.value ? parseInt(e.target.value) : null };
                    setProfile(p);
                    profilePendingRef.current = p;
                  }}
                  onBlur={() => persistProfile(profilePendingRef.current)}
                  placeholder="e.g. 32"
                />
              </div>
            </div>
            <div className="food-profile-selects">
              <div className="food-profile-select-group">
                <label className="food-macro-field-label">Goal</label>
                <div className="food-profile-chips">
                  {(['lose', 'maintain', 'build'] as Goal[]).map((g) => (
                    <button
                      key={g}
                      className={`food-profile-chip ${profile.goal === g ? 'active' : ''}`}
                      onClick={() => {
                        const p = { ...profile, goal: g };
                        setProfile(p);
                        profilePendingRef.current = p;
                        persistProfile(p);
                      }}
                    >
                      {g === 'lose' ? 'Lose fat' : g === 'maintain' ? 'Maintain' : 'Build muscle'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="food-profile-select-group">
                <label className="food-macro-field-label">Typical activity (outside exercise days)</label>
                <div className="food-profile-chips">
                  {([
                    { id: 'sedentary', label: 'Mostly sitting' },
                    { id: 'lightly_active', label: 'Some walking' },
                    { id: 'active', label: 'On feet a lot' },
                  ] as { id: ActivityBaseline; label: string }[]).map((a) => (
                    <button
                      key={a.id}
                      className={`food-profile-chip ${profile.activity_baseline === a.id ? 'active' : ''}`}
                      onClick={() => {
                        const p = { ...profile, activity_baseline: a.id };
                        setProfile(p);
                        profilePendingRef.current = p;
                        persistProfile(p);
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exercise day note */}
        {!summary.exercised && (
          <div className="food-rest-day-note">
            <span className="food-rest-day-icon">—</span>
            Rest day: calories and carbs pulled back. Tap "No exercise" to mark this as a training day.
          </div>
        )}

        {/* Macro progress bars */}
        <div className="food-macro-bars">
          <MacroBar
            label="Calories"
            unit="kcal"
            eaten={Math.round(eaten.calories)}
            target={targets.calories}
            colorClass="food-bar-cal"
          />
          <MacroBar
            label="Protein"
            unit="g"
            eaten={Math.round(eaten.protein)}
            target={targets.protein_g}
            colorClass="food-bar-protein"
          />
          <MacroBar
            label="Carbs"
            unit="g"
            eaten={Math.round(eaten.carbs)}
            target={targets.carbs_g}
            colorClass="food-bar-carbs"
          />
          <MacroBar
            label="Fat"
            unit="g"
            eaten={Math.round(eaten.fat)}
            target={targets.fat_g}
            colorClass="food-bar-fat"
          />
          <MacroBar
            label="Fiber"
            unit="g"
            eaten={Math.round(eaten.fiber)}
            target={targets.fiber_g}
            colorClass="food-bar-fiber"
          />
        </div>

        <p className="food-targets-note">{targets.note}</p>
      </div>

      {/* Meal cards */}
      <div className="food-meals-list">
        {MEAL_TYPES.map((mealType) => {
          const key = mealType.toLowerCase();
          const mealEntries = grouped[key] ?? [];
          const mealCals = mealEntries.reduce((acc, e) => acc + (e.calories ?? 0), 0);
          const isDraftOpen = draft?.mealType === mealType;

          return (
            <div key={mealType} className="food-meal-card">
              <div className="food-meal-card-header">
                <div className="food-meal-card-left">
                  <span className="food-meal-card-name">{mealType}</span>
                  {mealCals > 0 && (
                    <span className="food-meal-card-kcal">{Math.round(mealCals)} kcal</span>
                  )}
                </div>
                <div className="food-meal-card-actions">
                  <button
                    className="food-scan-btn"
                    title="Scan barcode"
                    onClick={() => {
                      if (!isDraftOpen) setDraft(emptyDraft(mealType));
                      setShowScanner(true);
                    }}
                  >
                    <BarcodeIcon />
                  </button>
                  <button
                    className={`food-add-meal-btn ${isDraftOpen ? 'open' : ''}`}
                    onClick={() => setDraft(isDraftOpen ? null : emptyDraft(mealType))}
                    title="Add food manually"
                  >
                    {isDraftOpen ? '✕' : '+'}
                  </button>
                </div>
              </div>

              {mealEntries.map((entry) => (
                <div key={entry.id} className="food-entry-item">
                  <div className="food-entry-info">
                    <div className="food-entry-name">
                      {entry.description}
                      {entry.source === 'barcode' && <span className="food-barcode-badge">scanned</span>}
                    </div>
                    {entry.brand_name && <div className="food-entry-brand">{entry.brand_name}</div>}
                    {entry.serving_size && <div className="food-entry-serving">{entry.serving_size}</div>}
                    <div className="food-entry-macros">
                      {entry.calories != null && <span>{Math.round(entry.calories)} kcal</span>}
                      {entry.protein_g != null && <span className="food-macro-protein">{entry.protein_g}g P</span>}
                      {entry.carbs_g != null && <span className="food-macro-carbs">{entry.carbs_g}g C</span>}
                      {entry.fat_g != null && <span className="food-macro-fat">{entry.fat_g}g F</span>}
                    </div>
                    {entry.notes && <div className="food-entry-note">{entry.notes}</div>}
                  </div>
                  <button
                    className="food-delete-btn"
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label="Remove"
                  >✕</button>
                </div>
              ))}

              {mealEntries.length === 0 && !isDraftOpen && (
                <div className="food-meal-empty">Tap + to add {mealType.toLowerCase()}</div>
              )}

              {isDraftOpen && draft && (
                <div className="food-add-form">
                  <div className="food-form-row">
                    <input
                      type="text"
                      className="body-input"
                      style={{ flex: 1 }}
                      value={draft.description}
                      onChange={(e) => setDraft((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                      placeholder="Food name *"
                      autoFocus
                    />
                  </div>
                  <div className="food-form-row">
                    <input
                      type="text"
                      className="body-input"
                      style={{ flex: 1 }}
                      value={draft.brand_name}
                      onChange={(e) => setDraft((prev) => prev ? { ...prev, brand_name: e.target.value } : prev)}
                      placeholder="Brand (optional)"
                    />
                    <input
                      type="text"
                      className="body-input"
                      style={{ width: '120px' }}
                      value={draft.serving_size}
                      onChange={(e) => setDraft((prev) => prev ? { ...prev, serving_size: e.target.value } : prev)}
                      placeholder="Serving size"
                    />
                  </div>
                  <div className="food-macros-grid">
                    {(
                      [
                        { key: 'calories', label: 'Calories', placeholder: 'kcal' },
                        { key: 'protein_g', label: 'Protein', placeholder: 'g' },
                        { key: 'carbs_g', label: 'Carbs', placeholder: 'g' },
                        { key: 'fat_g', label: 'Fat', placeholder: 'g' },
                        { key: 'fiber_g', label: 'Fiber', placeholder: 'g' },
                      ] as { key: keyof AddMealDraft; label: string; placeholder: string }[]
                    ).map(({ key, label, placeholder }) => (
                      <div key={key} className="food-macro-field">
                        <label className="food-macro-field-label">{label}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="body-input"
                          value={draft[key] as string}
                          onChange={(e) => setDraft((prev) => prev ? { ...prev, [key]: e.target.value } : prev)}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="body-input"
                    value={draft.notes}
                    onChange={(e) => setDraft((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                    placeholder="Note (how it felt, cravings, etc.)"
                  />
                  <div className="food-form-footer">
                    <button
                      className="food-scan-inline-btn"
                      onClick={() => setShowScanner(true)}
                      type="button"
                    >
                      <BarcodeIcon /> Scan barcode to fill
                    </button>
                    <button
                      className="food-save-meal-btn"
                      onClick={handleSaveEntry}
                      disabled={!draft.description.trim()}
                    >
                      Add {mealType.toLowerCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Water tracker */}
      <div className="food-water-card">
        <div className="food-water-card-header">
          <h3 className="food-water-card-title">Water</h3>
          <span className="food-water-total">
            {summary.water_cups > 0
              ? `${summary.water_cups} cup${summary.water_cups !== 1 ? 's' : ''} · ${Math.round(summary.water_cups * 240)}ml`
              : 'Not logged yet'}
          </span>
        </div>
        <div className="food-cups-grid">
          {Array.from({ length: MAX_CUPS }).map((_, i) => {
            const cup = i + 1;
            const filled = cup <= summary.water_cups;
            return (
              <button
                key={cup}
                className={`food-cup-btn ${filled ? 'filled' : ''}`}
                onClick={() => {
                  const next = { ...summary, water_cups: summary.water_cups === cup ? cup - 1 : cup };
                  setSummary(next);
                  pendingRef.current = next;
                  persistSummary(next);
                }}
                aria-label={`${cup} cup${cup !== 1 ? 's' : ''}`}
              >
                <CupIcon filled={filled} />
              </button>
            );
          })}
        </div>
        <div className="food-cups-labels">
          <span>0</span>
          <span>4 cups (1L)</span>
          <span>8 cups (2L)</span>
          <span>12 cups (3L)</span>
        </div>
      </div>

      {/* Daily feel */}
      <div className="food-feel-card">
        <h3 className="food-water-card-title" style={{ marginBottom: '14px' }}>How food felt today</h3>
        <div className="body-field">
          <label className="field-label">
            Hunger/satiety <span className="body-optional">(1 = always hungry · 5 = well fed)</span>
          </label>
          <div className="energy-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`energy-dot ${summary.hunger_rating === n ? 'active' : ''}`}
                onClick={() => {
                  const next = { ...summary, hunger_rating: summary.hunger_rating === n ? null : n };
                  setSummary(next);
                  pendingRef.current = next;
                  persistSummary(next);
                }}
              >{n}</button>
            ))}
          </div>
        </div>
        <div className="body-field" style={{ marginTop: '12px' }}>
          <label className="field-label">
            Post-meal energy <span className="body-optional">(1 = crash · 5 = steady)</span>
          </label>
          <div className="energy-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`energy-dot ${summary.energy_after_eating === n ? 'active' : ''}`}
                onClick={() => {
                  const next = { ...summary, energy_after_eating: summary.energy_after_eating === n ? null : n };
                  setSummary(next);
                  pendingRef.current = next;
                  persistSummary(next);
                }}
              >{n}</button>
            ))}
          </div>
        </div>
        <div className="body-field" style={{ marginTop: '12px' }}>
          <label className="field-label" htmlFor="food-daily-note">
            Daily note <span className="body-optional">(optional)</span>
          </label>
          <textarea
            id="food-daily-note"
            className="body-textarea"
            value={summary.notes}
            onChange={(e) => updateSummary({ notes: e.target.value })}
            onBlur={() => persistSummary(pendingRef.current)}
            placeholder="Cravings, patterns, anything worth noting"
          />
        </div>
      </div>

      <SaveIndicator state={saveLabel} className="body-save-indicator" />
    </section>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  unit: string;
  eaten: number;
  target: number;
  colorClass: string;
}

function MacroBar({ label, unit, eaten, target, colorClass }: MacroBarProps) {
  const progress = pct(eaten, target);
  const remaining = Math.max(0, target - eaten);
  const over = eaten > target;

  return (
    <div className="food-macro-bar-row">
      <div className="food-macro-bar-header">
        <span className="food-macro-bar-label">{label}</span>
        <span className={`food-macro-bar-values ${over ? 'over' : ''}`}>
          <span className="food-macro-bar-eaten">{eaten}</span>
          <span className="food-macro-bar-sep"> / </span>
          <span className="food-macro-bar-target">{target}{unit}</span>
          {!over && remaining > 0 && (
            <span className="food-macro-bar-remaining"> · {remaining}{unit} left</span>
          )}
          {over && <span className="food-macro-bar-over"> · {eaten - target}{unit} over</span>}
        </span>
      </div>
      <div className="food-macro-bar-track">
        <div
          className={`food-macro-bar-fill ${colorClass} ${over ? 'over' : ''}`}
          style={{ width: `${clamp(progress, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function BarcodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9V6a1 1 0 011-1h3M15 5h3a1 1 0 011 1v3M21 15v3a1 1 0 01-1 1h-3M9 19H6a1 1 0 01-1-1v-3"/>
      <line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/>
      <line x1="13" y1="8" x2="13" y2="16"/><line x1="16" y1="8" x2="16" y2="16"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function ExerciseIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {active ? (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="none"/>
      ) : (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      )}
    </svg>
  );
}

function CupIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h14l-2 16H6L4 4z"
        fill={filled ? 'var(--teal)' : 'transparent'}
        stroke={filled ? 'var(--teal)' : 'var(--line)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M2 4h18" stroke={filled ? 'var(--teal)' : 'var(--line)'} strokeWidth="1.5" strokeLinecap="round"/>
      {filled && (
        <path d="M6 14 C6 14, 8.5 12, 11 14 C13.5 16, 16 14, 16 14" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      )}
    </svg>
  );
}
