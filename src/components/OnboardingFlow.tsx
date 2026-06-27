import { useState } from 'react';
import CamrynOrb from './ui/CamrynOrb';

const CYCLE_PHASES = [
  { name: 'Menstruation', emoji: '🌑', desc: 'Days 1–6 · Rest, nourishment, gentle movement' },
  { name: 'Follicular', emoji: '🌒', desc: 'Days 7–13 · Learning, new habits, rising energy' },
  { name: 'Ovulation', emoji: '🌕', desc: 'Days 14–16 · Peak output, connection, challenge' },
  { name: 'Early luteal', emoji: '🌖', desc: 'Days 17–24 · Deep practice, steady effort' },
  { name: 'Late luteal', emoji: '🌘', desc: 'Days 25–28 · Wind down, review, soothing rituals' },
  { name: 'Not sure', emoji: '○', desc: "I'll tell you as I figure it out" },
];

const GOALS = [
  { id: 'body', label: 'Body & fitness', desc: 'Body composition, strength, movement' },
  { id: 'energy', label: 'Energy & sleep', desc: 'Better sleep, steady energy, less exhaustion' },
  { id: 'hormone', label: 'Hormone balance', desc: 'Cycle regularity, PMS, overall balance' },
  { id: 'confidence', label: 'How I look & feel', desc: 'Style, skin, confidence, appearance' },
  { id: 'habits', label: 'Habits & environment', desc: 'Routines, space, structure' },
];

const FEATURES = [
  {
    nav: 'today',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Today with Camryn',
    body: 'Three actions a day — matched to your phase, cycle, and energy level. Tap them off as you go. This is your daily anchor.',
  },
  {
    nav: 'body',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Body',
    body: "Log weight, energy, cycle status, symptoms, and vitamins. Camryn uses this to adapt your daily tasks and track what's normal for you.",
  },
  {
    nav: 'food',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    title: 'Food & macros',
    body: 'Log meals by barcode scan or manually. Your daily macro targets adjust automatically based on whether you exercised, your cycle phase, and your goal.',
  },
  {
    nav: 'confidence',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: 'Confidence',
    body: 'A daily note on how you showed up — clothes, hair, presence. Plus a stylist profile that builds over time and helps Camryn understand your personal style.',
  },
  {
    nav: 'space',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Space & systems',
    body: 'End-of-day environment checks and habit notes. Small resets that make tomorrow easier — bedroom ready, bag packed, kitchen reset.',
  },
  {
    nav: 'journal',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Talk to Camryn',
    body: "Journal and chat about anything — what's hard, what's shifting, what you want. Camryn uses everything you've logged to reflect patterns back to you.",
  },
];

interface OnboardingFlowProps {
  onComplete: (data: {
    name: string;
    cyclePhase: string;
    lastPeriodDate: string | null;
    goals: string[];
  }) => Promise<void>;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cyclePhase, setCyclePhase] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [featureIdx, setFeatureIdx] = useState(0);

  const TOTAL_STEPS = 5;

  const handleFinish = async () => {
    setSaving(true);
    await onComplete({
      name: name.trim(),
      cyclePhase: cyclePhase || 'Not sure',
      lastPeriodDate: lastPeriodDate || null,
      goals: selectedGoals,
    });
    setSaving(false);
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const canNext = (s: number) => {
    if (s === 0) return true;
    if (s === 1) return name.trim().length >= 2;
    if (s === 2) return !!cyclePhase;
    if (s === 3) return true;
    if (s === 4) return true;
    return true;
  };

  return (
    <div className="ob-backdrop">
      <div className="ob-shell">

        {/* Progress dots */}
        <div className="ob-dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`ob-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="ob-step ob-step--center ob-animate">
            <div className="ob-orb-wrap">
              <CamrynOrb size={80} />
              <div className="ob-orb-ring" />
            </div>
            <h1 className="ob-headline">Hi, I'm Camryn.</h1>
            <p className="ob-body">
              I'm a year of focused work — 52 weeks, six phases — built specifically around how a woman's body works. Hormones, cycle, energy, and what you actually want to change.
            </p>
            <p className="ob-body">
              This isn't a quick fix. It's a protocol that compounds. By week 52, you'll have built something that lasts.
            </p>
            <p className="ob-body ob-body--soft">
              I'll take about 90 seconds to get to know you, then I'll show you how everything works.
            </p>
            <button className="ob-btn-primary" onClick={() => setStep(1)}>
              Let's start
            </button>
          </div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="ob-step ob-animate">
            <div className="ob-step-num">1 of {TOTAL_STEPS}</div>
            <h2 className="ob-step-title">What should I call you?</h2>
            <p className="ob-step-sub">Just your first name is perfect.</p>
            <input
              type="text"
              className="ob-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              maxLength={40}
              onKeyDown={(e) => e.key === 'Enter' && canNext(1) && setStep(2)}
            />
            <div className="ob-nav">
              <button className="ob-btn-ghost" onClick={() => setStep(0)}>Back</button>
              <button
                className="ob-btn-primary"
                disabled={!canNext(1)}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Cycle phase ── */}
        {step === 2 && (
          <div className="ob-step ob-animate">
            <div className="ob-step-num">2 of {TOTAL_STEPS}</div>
            <h2 className="ob-step-title">Where are you in your cycle right now?</h2>
            <p className="ob-step-sub">
              This shapes your daily actions immediately. You can update it any time, and it advances automatically if you enter your last period date.
            </p>
            <div className="ob-cycle-list">
              {CYCLE_PHASES.map((p) => (
                <button
                  key={p.name}
                  className={`ob-cycle-item ${cyclePhase === p.name ? 'selected' : ''}`}
                  onClick={() => setCyclePhase(p.name)}
                >
                  <span className="ob-cycle-emoji">{p.emoji}</span>
                  <div className="ob-cycle-text">
                    <span className="ob-cycle-name">{p.name}</span>
                    <span className="ob-cycle-desc">{p.desc}</span>
                  </div>
                  {cyclePhase === p.name && (
                    <svg className="ob-cycle-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {cyclePhase && cyclePhase !== 'Not sure' && (
              <div className="ob-period-row">
                <label className="ob-period-label">
                  Last period start date <span className="ob-optional">(optional — lets the app auto-advance your phase)</span>
                </label>
                <input
                  type="date"
                  className="ob-input"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="ob-nav">
              <button className="ob-btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button
                className="ob-btn-primary"
                disabled={!canNext(2)}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Goals ── */}
        {step === 3 && (
          <div className="ob-step ob-animate">
            <div className="ob-step-num">3 of {TOTAL_STEPS}</div>
            <h2 className="ob-step-title">What matters most to you right now?</h2>
            <p className="ob-step-sub">
              Pick everything that resonates — this helps Camryn prioritise what to surface. You can change this any time.
            </p>
            <div className="ob-goals-list">
              {GOALS.map((g) => {
                const on = selectedGoals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    className={`ob-goal-item ${on ? 'selected' : ''}`}
                    onClick={() => toggleGoal(g.id)}
                  >
                    <div className="ob-goal-text">
                      <span className="ob-goal-label">{g.label}</span>
                      <span className="ob-goal-desc">{g.desc}</span>
                    </div>
                    <span className={`ob-goal-check ${on ? 'visible' : ''}`}>
                      <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                        <path d="M1 5.5l4 4.5 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="ob-nav">
              <button className="ob-btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="ob-btn-primary" onClick={() => setStep(4)}>
                {selectedGoals.length === 0 ? 'Skip for now' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Feature tour ── */}
        {step === 4 && (
          <div className="ob-step ob-animate">
            <div className="ob-step-num">4 of {TOTAL_STEPS} · App tour</div>
            <h2 className="ob-step-title">Here's how the app works</h2>
            <p className="ob-step-sub">
              Six sections, each serving a different part of your transformation.
            </p>

            {/* Feature cards — swipeable */}
            <div className="ob-feature-cards">
              {FEATURES.map((f, i) => (
                <button
                  key={f.nav}
                  className={`ob-feature-card ${featureIdx === i ? 'active' : ''} ${featureIdx > i ? 'past' : ''}`}
                  onClick={() => setFeatureIdx(i)}
                  aria-label={f.title}
                >
                  <div className={`ob-feature-icon ${featureIdx === i ? 'active' : ''}`}>
                    {f.icon}
                  </div>
                  <div className="ob-feature-text">
                    <div className="ob-feature-title">{f.title}</div>
                    {featureIdx === i && (
                      <div className="ob-feature-body">{f.body}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Nav dots for feature cards */}
            <div className="ob-feature-dots">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  className={`ob-feature-dot ${featureIdx === i ? 'active' : ''}`}
                  onClick={() => setFeatureIdx(i)}
                  aria-label={`Feature ${i + 1}`}
                />
              ))}
            </div>

            <div className="ob-nav">
              <button className="ob-btn-ghost" onClick={() => setStep(3)}>Back</button>
              <button className="ob-btn-primary" onClick={() => setStep(5)}>
                I'm ready
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Final / Protocol intro ── */}
        {step === 5 && (
          <div className="ob-step ob-step--center ob-animate">
            <div className="ob-orb-wrap">
              <CamrynOrb size={72} />
            </div>
            <h2 className="ob-headline ob-headline--sm">
              {name.trim() ? `Welcome, ${name.trim()}.` : "You're all set."}
            </h2>
            <p className="ob-body">
              This is a <strong>52-week commitment</strong> — three phases that build on each other. You don't need to be perfect. You need to show up most days and let the protocol do its work.
            </p>
            <div className="ob-phase-preview">
              <div className="ob-phase-row">
                <div className="ob-phase-pill ob-phase-pill--1">Phase 1</div>
                <div className="ob-phase-row-text">
                  <strong>Foundation</strong> — weeks 1–6
                  <span className="ob-phase-row-sub">Sleep, hydration, gut health</span>
                </div>
              </div>
              <div className="ob-phase-row">
                <div className="ob-phase-pill ob-phase-pill--2">Phase 2</div>
                <div className="ob-phase-row-text">
                  <strong>Ignition</strong> — weeks 7–12
                  <span className="ob-phase-row-sub">Nutrition, movement, skin & hair</span>
                </div>
              </div>
              <div className="ob-phase-row">
                <div className="ob-phase-pill ob-phase-pill--3">Phase 3</div>
                <div className="ob-phase-row-text">
                  <strong>Build</strong> — weeks 13–22
                  <span className="ob-phase-row-sub">Body composition, hormones, longevity</span>
                </div>
              </div>
              <div className="ob-phase-row ob-phase-row--maintain">
                <div className="ob-phase-pill ob-phase-pill--maintain">Year 1+</div>
                <div className="ob-phase-row-text">
                  <strong>Maintain & deepen</strong> — weeks 23–52
                  <span className="ob-phase-row-sub">Your new standard, sustained for life</span>
                </div>
              </div>
            </div>
            <p className="ob-body ob-body--soft">
              You're starting today. Week 1 of 52.
            </p>
            <button
              className="ob-btn-primary"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? 'Setting up your account…' : "Start my year"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
