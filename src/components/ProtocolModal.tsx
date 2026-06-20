import { useState } from 'react';
import { PROTOCOL } from '../lib/protocol';

interface ProtocolModalProps {
  onClose: () => void;
  currentPhase?: number;
}

const PHASE_COLORS: Record<number, { accent: string; soft: string; border: string }> = {
  1: { accent: 'var(--phase-1)', soft: 'var(--phase-1-soft)', border: 'var(--phase-1-track)' },
  2: { accent: 'var(--phase-2)', soft: 'var(--phase-2-soft)', border: 'var(--phase-2-track)' },
  3: { accent: 'var(--phase-3)', soft: 'var(--phase-3-soft)', border: 'var(--phase-3-track)' },
  4: { accent: 'var(--phase-4)', soft: 'var(--phase-4-soft)', border: 'var(--phase-4-track)' },
  5: { accent: 'var(--phase-5)', soft: 'var(--phase-5-soft)', border: 'var(--phase-5-track)' },
  6: { accent: 'var(--phase-6)', soft: 'var(--phase-6-soft)', border: 'var(--phase-6-track)' },
};

const PHASE_DETAIL: Record<number, {
  tagline: string;
  commitment: string[];
  whatToExpect: { week: string; changes: string[] }[];
  benefits: { early: string[]; sustained: string[] };
  honestNote: string;
}> = {
  1: {
    tagline: 'Build the foundation everything else depends on.',
    commitment: [
      'Wake up at the same time every day — even weekends',
      'Drink 500ml of water within 10 minutes of waking',
      'Eat 25–35g of fiber from 3+ plant sources daily',
      'Add one fermented food (yogurt, kimchi, kefir, sauerkraut)',
      'No screens for 45 minutes before bed',
      'A 5-minute daily check-in (this app counts)',
    ],
    whatToExpect: [
      {
        week: 'Week 1–2',
        changes: [
          'Sleep may feel slightly worse before it improves — this is normal as your circadian rhythm recalibrates',
          'You will likely notice more consistent morning energy within 10–14 days of a fixed wake time',
          'Gut changes (bloating or shifts in digestion) are common as fiber increases — this settles within 1–2 weeks',
        ],
      },
      {
        week: 'Week 3–4',
        changes: [
          'Morning hydration starts to feel automatic rather than effortful',
          'Appetite signals begin to regularise — false hunger becomes easier to identify',
          'Mood steadiness improves noticeably as sleep quality compounds',
        ],
      },
      {
        week: 'Week 5–6',
        changes: [
          'Sleep becomes noticeably more restorative — you wake up feeling like sleep actually happened',
          'Gut microbiome diversity begins improving, supporting better hormone clearance and mood',
          'You have a baseline rhythm to build Phase 2 on top of — without it, Phase 2 would keep sliding',
        ],
      },
    ],
    benefits: {
      early: [
        'More consistent energy across the day within 2 weeks',
        'Reduced false hunger and cravings',
        'Calmer morning cortisol response',
        'Easier time falling asleep',
      ],
      sustained: [
        'Stable hormonal baseline that makes every other change easier',
        'Better skin hydration and clarity from improved gut and sleep',
        'Reduced inflammation markers over 6 weeks',
        'A circadian rhythm that works for you instead of against you',
        'The foundation for real body composition change in Phase 2',
      ],
    },
    honestNote: 'Phase 1 is often the most boring and the most important. Nothing looks dramatic from the outside. But sleep, hydration, and gut health are the hormonal infrastructure that determines how well everything else works. People who skip this phase — or rush it — almost always plateau in Phase 2. Give it the full 6 weeks.',
  },
  2: {
    tagline: 'Build momentum. Start to see and feel the shift.',
    commitment: [
      '25–30g of protein at breakfast within 60–90 minutes of waking',
      'An 8–10 hour eating window (e.g. 8am–6pm or 9am–7pm)',
      'A 20–30 minute walk daily — first 10 minutes without earphones',
      'Bodyweight strength training twice a week (squats, hinges, push-ups)',
      'AM skincare: cleanser + SPF. PM skincare: cleanser + moisture + retinol (start slowly)',
      'Daily collagen supplement + weekly scalp massage',
    ],
    whatToExpect: [
      {
        week: 'Week 7–8',
        changes: [
          'Hunger regulation improves significantly once protein at breakfast is consistent',
          'The eating window may feel restrictive at first — this normalises within 10–14 days',
          'First strength sessions will feel awkward; your body is learning the patterns, not yet building',
        ],
      },
      {
        week: 'Week 9–10',
        changes: [
          'Visible toning begins — not dramatic, but your clothes fit differently',
          'Energy crash in the afternoon reduces as blood sugar stabilises from meal structure',
          'Skin starts to feel more hydrated; SPF use protects existing collagen while retinol begins its work',
        ],
      },
      {
        week: 'Week 11–12',
        changes: [
          'Strength sessions feel less like effort and more like rhythm — this is when momentum is real',
          'Walking becomes a mood and cortisol regulation tool, not just exercise',
          'Retinol effects begin to show — smoother texture, more even tone',
          "You can feel body composition starting to shift even if the scale hasn't moved",
        ],
      },
    ],
    benefits: {
      early: [
        'Noticeably less afternoon energy crash within 2 weeks',
        'Fewer cravings by midday once protein breakfast is consistent',
        'Improved mood from daily walking (cortisol reduction is measurable)',
        'Better hydration and first signs of improved skin texture',
      ],
      sustained: [
        'Measurable body composition change — fat loss with muscle preservation',
        'Improved insulin sensitivity from movement and meal structure',
        'Skincare routine that genuinely changes skin quality over 90 days',
        'Hair health improvements from collagen and scalp care',
        'A movement habit that feels sustainable, not punishing',
      ],
    },
    honestNote: "Phase 2 is where most people start to feel it — and also where most people add too much too fast. The meal window and protein target are doing most of the metabolic work. The walks and strength sessions are amplifying it. Don't race ahead to six gym sessions a week. More is not better here. Consistent is better.",
  },
  3: {
    tagline: 'Your body adapts to your standards. This is where it compounds.',
    commitment: [
      'Add a third strength training day with progressive overload (add reps or weight each week)',
      'Focus on compound lifts: squats, deadlifts, hip hinges, rows, presses',
      '10–15 minutes of daily joint mobility (hips, thoracic spine, ankles)',
      '300–400mg magnesium glycinate before bed nightly',
      'Omega-3 supplement daily (1–2g EPA/DHA)',
      'Complete baseline hormone bloodwork (ask your GP for estrogen, progesterone, testosterone, thyroid)',
      'Try seed cycling: flaxseeds and pumpkin seeds days 1–14; sesame and sunflower seeds days 15–28',
    ],
    whatToExpect: [
      {
        week: 'Week 13–15',
        changes: [
          'Third strength day will feel hard initially — your recovery capacity is still adapting',
          'Sleep quality often improves within 1–2 weeks of consistent magnesium',
          'Joint mobility sessions feel uncomfortable at first; this is normal tightness releasing',
        ],
      },
      {
        week: 'Week 16–18',
        changes: [
          'Progressive overload starts producing visible muscle definition',
          'PMS severity typically begins to reduce with magnesium, omega-3, and cycle-aware training',
          'Bloodwork gives you actual data on what your hormones are doing — this changes how you interpret your body',
          'Energy levels become noticeably more stable across the full cycle',
        ],
      },
      {
        week: 'Week 19–22',
        changes: [
          'Body composition changes become undeniable — clothes, posture, how you move',
          'Joint mobility becomes a maintenance practice rather than an uncomfortable chore',
          'You feel the difference between cycle phases less dramatically — they still exist, but the extremes smooth out',
          'This phase ends with a body that is structurally different from where you started',
        ],
      },
    ],
    benefits: {
      early: [
        'Better sleep quality within 2 weeks of magnesium glycinate',
        'Reduced PMS severity — less bloating, irritability, and cramping',
        'Faster recovery between training sessions',
        'Improved joint comfort, especially in hips and knees',
      ],
      sustained: [
        'Measurable muscle gain that permanently raises resting metabolism',
        'Hormonal cycle that is more predictable and less extreme',
        'A structural body that moves well and holds strength for years',
        'Actual data on your hormonal baseline to guide future decisions',
        'The capacity to maintain these results without constant effort — because they are now your normal',
      ],
    },
    honestNote: "Phase 3 is where the protocol earns its reputation. The changes from here are the ones people notice and ask about. But they are only possible because of what was built in Phases 1 and 2. The biggest risk in Phase 3 is skipping the recovery work (mobility, sleep, magnesium) in favour of more training. Your adaptation happens during rest, not during effort.",
  },
  4: {
    tagline: 'Make the changes permanent by shifting who you are.',
    commitment: [
      'Daily breathwork practice (4-7-8 or box breathing — 5 minutes minimum)',
      'Cold exposure 3x/week (cold shower or cold water immersion)',
      'Weekly identity journal entry — evidence of your transformation',
      'Audit your relationships and environment for protocol alignment',
      'Communicate your needs clearly in at least one close relationship',
      'HRV or resting heart rate tracking daily',
    ],
    whatToExpect: [
      {
        week: 'Week 23–25',
        changes: [
          'Cold exposure feels extremely uncomfortable at first — this is the point; discomfort tolerance is trainable',
          'Breathwork begins producing measurable calm within 3–4 minutes once the technique is established',
          'Identity journaling may feel forced early on — push through; the insight compounds over weeks',
        ],
      },
      {
        week: 'Week 26–28',
        changes: [
          'Stress recovery time noticeably shortens — you return to baseline faster after difficult moments',
          'Your environment audit reveals more friction than expected; this is useful information',
          'HRV begins to trend upward as nervous system regulation improves',
        ],
      },
      {
        week: 'Week 29–32',
        changes: [
          'The protocol feels less like effort and more like identity — you are no longer doing it, you are it',
          'Relationships that do not support your standards become clearer',
          'Cold exposure becomes a deliberate stress inoculation tool rather than a challenge to endure',
        ],
      },
    ],
    benefits: {
      early: [
        'Measurable reduction in stress response intensity within 2 weeks of breathwork',
        'Improved sleep quality from nervous system downregulation',
        'Greater clarity on what and who is actually supporting your progress',
      ],
      sustained: [
        'A stress threshold that is structurally higher — hard things stop feeling as hard',
        'Identity-level change that makes protocol adherence automatic rather than willpower-dependent',
        'Relationships and environments that actively support your standards',
        'HRV improvements that reflect real autonomic nervous system health',
      ],
    },
    honestNote: 'Phase 4 is the phase most people underestimate. The physical changes are largely done. What remains is whether they last — and that is entirely determined by identity, stress capacity, and environment. People who skip the inner work here almost always regress within a year. The breathwork and journaling are not optional extras; they are the mechanism.',
  },
  5: {
    tagline: 'Build for decades, not just this year.',
    commitment: [
      'Zone 2 cardio 2x/week (conversational pace, 30–45 minutes)',
      'Bone-loading movements weekly (weighted carries, jumps, impact work)',
      'Annual bloodwork including metabolic and hormone panels',
      'Clarify your purpose — write it down and connect each protocol domain to it',
      'Define your non-negotiable 3 habits for disrupted weeks',
      'Build a travel protocol that maintains 80% of your normal',
    ],
    whatToExpect: [
      {
        week: 'Week 33–36',
        changes: [
          'Zone 2 cardio feels deceptively easy — this is correct; the adaptation is aerobic, not sweat-based',
          'Purpose writing may surface unexpected clarity or discomfort — both are productive',
          'Disruption week testing will reveal gaps in your minimum viable protocol',
        ],
      },
      {
        week: 'Week 37–40',
        changes: [
          'Cardiovascular efficiency visibly improves — same effort, better output',
          'Your non-negotiable 3 habits become truly automatic even under stress',
          'Bloodwork gives you a 12-month progress picture that validates the investment',
        ],
      },
      {
        week: 'Week 41–44',
        changes: [
          'The protocol feels genuinely sustainable rather than maintained by discipline',
          'Bone and joint resilience improvements become noticeable in how you move and recover',
          'You have a clear, tested system for disrupted life — this is a significant capability',
        ],
      },
    ],
    benefits: {
      early: [
        'Improved aerobic base within 4 weeks of consistent Zone 2',
        'Greater clarity and motivation from purpose articulation',
        'Confidence in protocol resilience after surviving a disrupted week',
      ],
      sustained: [
        'Cardiovascular health that meaningfully reduces long-term disease risk',
        'Bone density protection that pays dividends at 50, 60, and beyond',
        'A protocol that functions in the real world, not just ideal conditions',
        'Intrinsic motivation that does not require constant renewal',
      ],
    },
    honestNote: 'Phase 5 is where the protocol matures into a life practice. The longevity focus is not abstract — the choices made here have a measurable 20-year runway. Zone 2 is the single highest-return cardiovascular investment available. Bone loading is the most underestimated. Both require consistency over intensity. This is a phase for patience and trust in the process.',
  },
  6: {
    tagline: 'You are no longer becoming — you are being.',
    commitment: [
      'Review mastery achievements across all phases with honesty',
      'Write your Arc 1 story — what changed, what was hard, what surprised you',
      'Identify 3 domains with the most remaining growth potential',
      'Share your transformation with someone who matters to you',
      'Support one other person with their health (even informally)',
      'Design your Arc 2 protocol priorities with specificity',
    ],
    whatToExpect: [
      {
        week: 'Week 45–47',
        changes: [
          'The Arc 1 review will surface achievements you have already normalised — this is intentional',
          'Writing your story produces unexpected emotional integration of the year',
          'Sharing your transformation with someone close deepens your own understanding of it',
        ],
      },
      {
        week: 'Week 48–50',
        changes: [
          'Supporting another person in their health reinforces your own identity and knowledge',
          'Arc 2 planning produces clarity about what you genuinely want next',
          'The maintenance protocol testing confirms what is truly non-negotiable for you',
        ],
      },
      {
        week: 'Week 51–52',
        changes: [
          'The year in review carries a different quality than any previous week — it deserves to be marked',
          'Arc 2 vision feels grounded rather than aspirational because it is built on 52 weeks of evidence',
          'The protocol is no longer something you do. It is part of who you are.',
        ],
      },
    ],
    benefits: {
      early: [
        'Integration of the full year through structured reflection',
        'Deepened motivation from connection and contribution',
        'Clarity about your genuine Arc 2 priorities',
      ],
      sustained: [
        'A completed Arc 1 that permanently changes your health baseline',
        'An Arc 2 plan that builds on real evidence rather than aspiration',
        'The identity, skills, and systems to sustain and expand indefinitely',
        'A relationship to your health that is owned, not borrowed from willpower',
      ],
    },
    honestNote: 'Phase 6 is not just a finish line — it is the foundation for everything that follows. The work here is integration: making explicit what has become implicit, and translating it into the starting point for Arc 2. This phase rewards honesty. The people who do it well are not the ones who did everything perfectly; they are the ones who looked at what actually happened and learned from all of it.',
  },
};

const OVERALL_COMMITMENT = [
  { icon: '⏱', label: '15–45 min/day', desc: 'Active time commitment. Most of it is habit, not extra effort.' },
  { icon: '📆', label: '52 weeks total', desc: 'Six phases across a full year. Results compound — the longer you stay, the more you get.' },
  { icon: '🔄', label: 'Adapts to your cycle', desc: 'Tasks shift based on where you are in your cycle and your energy each day.' },
  { icon: '📊', label: 'Tracked daily', desc: 'Small daily logs build the data Camryn uses to reflect your patterns back to you.' },
];

export default function ProtocolModal({ onClose, currentPhase }: ProtocolModalProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(currentPhase ?? 1);
  const [activeTab, setActiveTab] = useState<'overview' | 'commitment' | 'timeline' | 'benefits'>('overview');

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet protocol-modal-sheet" onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">The Camryn Protocol</h3>
            <p className="modal-subtitle">
              A 22-week body and lifestyle transformation built around phases, cycle awareness, and daily habits that compound.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Overall commitment strip */}
        <div className="protocol-commit-strip">
          {OVERALL_COMMITMENT.map((c) => (
            <div key={c.label} className="protocol-commit-item">
              <span className="protocol-commit-icon">{c.icon}</span>
              <span className="protocol-commit-label">{c.label}</span>
              <span className="protocol-commit-desc">{c.desc}</span>
            </div>
          ))}
        </div>

        {/* Is it worth it? */}
        <div className="protocol-worth-it">
          <h4 className="protocol-section-heading">Is it worth it?</h4>
          <p className="protocol-body-text">
            That depends on what you mean by worth it. If you want dramatic results in 30 days with minimal habit change, this is not that. If you want a body that works better, a cycle that is less disruptive, skin and hair that improve steadily, and a relationship with how you look and feel that you can actually sustain — then yes, completely.
          </p>
          <p className="protocol-body-text">
            The protocol is designed so that each phase builds genuine infrastructure. Phase 1 isn't just prep — it is doing real work on your hormones, gut, and sleep. By Phase 3, the changes are structural: more muscle, better hormone balance, a body that maintains results because the habits have become who you are.
          </p>
          <p className="protocol-body-text">
            Most people notice something within 2 weeks. Something they didn't expect within 6. And by week 12, they understand why the order matters.
          </p>
        </div>

        {/* Phase accordions */}
        <h4 className="protocol-section-heading" style={{ marginTop: '8px' }}>The three phases</h4>

        <div className="protocol-phases-list">
          {PROTOCOL.phases.map((phase) => {
            const isHere = phase.id === currentPhase;
            const isOpen = expandedPhase === phase.id;
            const colors = PHASE_COLORS[phase.id];
            const detail = PHASE_DETAIL[phase.id];

            return (
              <div
                key={phase.id}
                className={`protocol-phase-card ${isHere ? 'current' : ''}`}
                style={isHere ? { borderColor: colors.border, background: colors.soft } : {}}
              >
                {/* Phase header — always visible */}
                <button
                  className="protocol-phase-toggle"
                  onClick={() => setExpandedPhase(isOpen ? null : phase.id)}
                  aria-expanded={isOpen}
                >
                  <div className="protocol-phase-toggle-left">
                    <div
                      className="protocol-phase-num"
                      style={{ background: colors.soft, color: colors.accent, border: `1.5px solid ${colors.border}` }}
                    >
                      {phase.id}
                    </div>
                    <div>
                      <div className="protocol-phase-toggle-meta" style={{ color: colors.accent }}>
                        Phase {phase.id} · Weeks {phase.weeks}
                        {isHere && <span className="protocol-here-badge" style={{ background: colors.accent }}>You are here</span>}
                      </div>
                      <div className="protocol-phase-toggle-name">{phase.name}</div>
                      <div className="protocol-phase-toggle-focus">{detail.tagline}</div>
                    </div>
                  </div>
                  <svg
                    className={`protocol-chevron ${isOpen ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="protocol-phase-body">
                    {/* Tab bar */}
                    <div className="protocol-tabs">
                      {(['overview', 'commitment', 'timeline', 'benefits'] as const).map((tab) => (
                        <button
                          key={tab}
                          className={`protocol-tab ${activeTab === tab ? 'active' : ''}`}
                          style={activeTab === tab ? { color: colors.accent, borderBottomColor: colors.accent } : {}}
                          onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                      <div className="protocol-tab-content">
                        <p className="protocol-body-text">{phase.why}</p>
                        <div className="protocol-modules">
                          {phase.modules.map((mod) => (
                            <div key={mod.title} className="protocol-module">
                              <div
                                className="protocol-module-title"
                                style={{ color: colors.accent }}
                              >
                                {mod.title}
                              </div>
                              <p className="protocol-module-why">{mod.why}</p>
                              <ul className="protocol-module-actions">
                                {mod.actions.map((a) => (
                                  <li key={a}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="protocol-honest-note">
                          <div className="protocol-honest-label">Honest note</div>
                          <p>{detail.honestNote}</p>
                        </div>
                      </div>
                    )}

                    {/* Commitment tab */}
                    {activeTab === 'commitment' && (
                      <div className="protocol-tab-content">
                        <p className="protocol-body-text" style={{ marginBottom: '12px' }}>
                          These are the specific actions you are committing to in this phase. Not all of them every day — but all of them most days.
                        </p>
                        <ul className="protocol-commitment-list">
                          {detail.commitment.map((item, i) => (
                            <li key={i} className="protocol-commitment-item">
                              <span
                                className="protocol-commitment-dot"
                                style={{ background: colors.accent }}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="protocol-mastery-preview">
                          <div className="protocol-mastery-preview-label">Mastery unlocks this phase</div>
                          <ul className="protocol-mastery-list">
                            {phase.mastery.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Timeline tab */}
                    {activeTab === 'timeline' && (
                      <div className="protocol-tab-content">
                        <p className="protocol-body-text" style={{ marginBottom: '14px' }}>
                          What is actually happening week by week — what to look for, and what is normal.
                        </p>
                        {detail.whatToExpect.map((block) => (
                          <div key={block.week} className="protocol-timeline-block">
                            <div
                              className="protocol-timeline-week"
                              style={{ color: colors.accent, borderLeftColor: colors.border }}
                            >
                              {block.week}
                            </div>
                            <ul className="protocol-timeline-changes">
                              {block.changes.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Benefits tab */}
                    {activeTab === 'benefits' && (
                      <div className="protocol-tab-content">
                        <div className="protocol-benefits-section">
                          <div
                            className="protocol-benefits-heading"
                            style={{ color: colors.accent }}
                          >
                            Early wins (weeks 1–3)
                          </div>
                          <ul className="protocol-benefits-list">
                            {detail.benefits.early.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="protocol-benefits-section" style={{ marginTop: '16px' }}>
                          <div
                            className="protocol-benefits-heading"
                            style={{ color: colors.accent }}
                          >
                            Sustained outcomes (full phase)
                          </div>
                          <ul className="protocol-benefits-list">
                            {detail.benefits.sustained.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Closing statement */}
        <div className="protocol-closing">
          <p>
            The protocol works because the sequence matters. Phase 1 makes Phase 2 possible. Phase 2 makes Phase 3 pay off.
            Skipping ahead doesn't save time — it removes the foundation the later results depend on.
          </p>
          <p>
            What you're committing to is not a short-term fix. It is a system for becoming someone whose body, habits, and appearance are under her own direction.
          </p>
        </div>
      </div>
    </div>
  );
}
