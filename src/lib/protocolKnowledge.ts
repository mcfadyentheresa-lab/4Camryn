// Full domain knowledge library for Camryn protocol.
// buildCamrynContext() assembles a structured string used as the system
// context block sent to the camryn-journal edge function.

export interface DomainKnowledge {
  domain: string;
  keyPrinciples: string[];
  cycleConnections: string[];
  phaseGuidance: Record<string, string>;
}

// ── Domain library ────────────────────────────────────────────────────────────

export const DOMAIN_LIBRARY: DomainKnowledge[] = [
  {
    domain: 'Sleep',
    keyPrinciples: [
      'Consistent wake time anchors circadian rhythm faster than consistent bedtime.',
      'Core body temperature must drop 1–2°C to initiate deep sleep.',
      'Cortisol awakening response (CAR) peaks in first 30–45 min after waking — morning light amplifies this.',
      'A single night under 6 hours raises cortisol, lowers leptin, and elevates ghrelin the next day.',
      'Blue light suppresses melatonin production — dim warm lighting after sunset shifts sleep earlier.',
      'The glymphatic system clears toxic waste from the brain almost exclusively during deep sleep — this is when amyloid, tau, and metabolic debris are flushed out via cerebrospinal fluid.',
    ],
    cycleConnections: [
      'Progesterone in luteal phase raises core temperature, making cool room even more important.',
      'Sleep quality directly determines PMS severity — disrupted sleep amplifies every luteal symptom.',
      'Menstruation: estrogen and progesterone at lowest — extra sleep reduces cramping and fatigue.',
    ],
    phaseGuidance: {
      Foundation: 'Fixed sleep/wake time. Room temperature 16–19°C. No screens 45 min before bed.',
      Ignition: 'Protect sleep as non-negotiable. Add magnesium glycinate to wind-down routine.',
      Build: 'Cycle-adapted sleep — add 30–60 min in luteal phase. Track sleep quality alongside energy.',
      Integrate: 'Sleep as performance tool. Optimize deep sleep with cold room, no alcohol, consistent timing.',
      Sustain: 'Maintain sleep architecture regardless of life disruption. Sleep is the one habit not to trade away.',
      Thrive: 'Sleep mastery — using sleep data to drive all other protocol decisions.',
    },
  },
  {
    domain: 'Nutrition',
    keyPrinciples: [
      'Protein target: 1.6–2.2g per kg bodyweight — most women eat half what they need.',
      'Protein-rich breakfast (25–35g) stabilises blood sugar and reduces afternoon cravings for 3–5 hours.',
      'Fiber diversity (30+ plant foods/week) feeds microbiome diversity more than quantity alone.',
      'Magnesium is depleted by stress, sugar, and alcohol — supports 300+ enzymatic processes.',
      'Blood sugar stability drives stable energy, mood, and hormonal balance.',
    ],
    cycleConnections: [
      'Luteal phase: protein needs increase by 10–20g due to progesterone-driven muscle protein breakdown.',
      'Follicular phase: insulin sensitivity is highest — carbohydrates used most efficiently.',
      'Menstruation: iron-rich foods support replenishment; reduce inflammatory foods.',
      'Late luteal: reducing refined sugar and alcohol directly reduces PMS severity.',
    ],
    phaseGuidance: {
      Foundation: 'Fiber 25–35g daily. One fermented food. Hydration 2.5–3L. Minimal processed food.',
      Ignition: 'Protein target at every meal. Structured eating window (8–10hr). Meal prep basics.',
      Build: 'Cycle-synced nutrition — adjust protein and carbs by phase. Omega-3 daily.',
      Integrate: 'Anti-inflammatory eating pattern. Periodic fasting consideration. Supplement stack optimized.',
      Sustain: 'Nutrition as maintenance. Flexibility without abandonment. Social eating with anchors.',
      Thrive: 'Nutritional mastery — intuitive eating within known principles, no tracking required.',
    },
  },
  {
    domain: 'Gut Health',
    keyPrinciples: [
      '90% of serotonin is made in the gut — gut health is mental health.',
      'The enteric nervous system has 500M+ neurons and communicates directly with the brain via vagus nerve.',
      'Microbiome diversity responds to dietary changes within 48–72 hours.',
      'Gut permeability drives systemic inflammation affecting skin, hormones, and mood.',
      'Chronic stress alters microbiome composition within days — gut-stress loop.',
    ],
    cycleConnections: [
      'Estrogen metabolism depends on gut microbiome — poor gut health causes estrogen reabsorption.',
      'Progesterone slows gut motility in luteal phase — constipation is a hormonal symptom.',
      'Inflammation from gut permeability amplifies PMS and cycle irregularity.',
    ],
    phaseGuidance: {
      Foundation: 'Fermented food daily. Fiber diversity. Prebiotic-rich foods (oats, onions, garlic).',
      Ignition: 'Establish probiotic routine. Reduce gut irritants (alcohol, processed food, excessive caffeine).',
      Build: 'Gut-hormone connection: track how gut improvements affect cycle quality.',
      Integrate: 'Advanced gut support — collagen, L-glutamine, targeted probiotics.',
      Sustain: 'Maintain microbiome diversity. Fermented foods as default, not optional.',
      Thrive: 'Gut as foundation of all other health outcomes — informed by lived data.',
    },
  },
  {
    domain: 'Hormones',
    keyPrinciples: [
      'Estrogen rises in follicular → peaks at ovulation → drops in luteal.',
      'Progesterone is the dominant luteal hormone — supports sleep, calms mood, needs protein.',
      'Cortisol and sex hormones compete for the same precursors — chronic stress steals from cycle hormones.',
      'Insulin resistance disrupts every other hormone — blood sugar stability is hormone stability.',
      'Thyroid function depends on adequate protein, selenium, zinc, and iodine.',
    ],
    cycleConnections: [
      'Follicular: rising estrogen improves mood, neuroplasticity, insulin sensitivity.',
      'Ovulation: estrogen peak + testosterone rise = peak performance window.',
      'Luteal: progesterone raises body temp (+0.3°C), increases metabolism 100–300 kcal/day.',
      'Menstruation: both hormones at lowest — inflammation naturally elevated, iron lost.',
    ],
    phaseGuidance: {
      Foundation: 'Address sleep and gut — primary disruptors of hormone balance.',
      Ignition: 'Strength training improves insulin sensitivity. Walking reduces cortisol baseline.',
      Build: 'Hormone support stack: magnesium, omega-3, vitamin D, zinc. Baseline bloodwork.',
      Integrate: 'Targeted testing and supplementation. Adaptogens if cortisol remains high.',
      Sustain: 'Long-term hormonal health: maintain muscle mass, sleep quality, and stress management.',
      Thrive: 'Hormonal mastery — living in alignment with natural hormone rhythms.',
    },
  },
  {
    domain: 'Fitness',
    keyPrinciples: [
      'Muscle burns 3–4x more energy at rest than fat — strength training changes baseline metabolism.',
      'Progressive overload is the only principle required for continued strength gains.',
      'Compound movements (squat, hinge, push, pull) produce greatest hormonal and metabolic response.',
      'Walking 30 min/day reduces all-cause mortality by 35% without recovery demands of intense cardio.',
      'Recovery is where adaptation happens — the session is 40% of the equation.',
    ],
    cycleConnections: [
      'Follicular/Ovulation: strength output and pain tolerance highest — train harder, lift heavier.',
      'Luteal: progesterone raises heart rate at same effort — perceived exertion is higher.',
      'Menstruation: gentle movement reduces cramping; high-intensity increases inflammation.',
      'Cycle-synced training produces better results than ignoring cycle phases.',
    ],
    phaseGuidance: {
      Foundation: 'Daily walk. Gentle movement. Build the habit before intensity.',
      Ignition: 'Bodyweight strength 2x/week. Walk daily. Introduce progressive overload concept.',
      Build: 'Strength 3x/week. Cycle-adapted training. Joint mobility daily.',
      Integrate: 'Periodized training plan. Power and endurance balance. Recovery protocols.',
      Sustain: 'Training minimum effective dose for maintenance. Prioritise longevity over performance.',
      Thrive: 'Athletic performance within a sustainable lifestyle — strength, mobility, and endurance integrated.',
    },
  },
  {
    domain: 'Skin',
    keyPrinciples: [
      'UV radiation causes ~80% of visible skin ageing — daily SPF 30+ is non-negotiable.',
      'Cortisol directly inhibits collagen synthesis — stress management is skincare.',
      'Glycation from excess blood sugar degrades collagen and elastin permanently.',
      'Gut-skin axis: gut inflammation directly triggers skin inflammation.',
      'Consistency over complexity — cleanser, SPF, vitamin A outperforms elaborate routines.',
    ],
    cycleConnections: [
      'Follicular: estrogen → plumpest, clearest skin of cycle.',
      'Ovulation: brief glow from estrogen peak.',
      'Luteal: progesterone increases sebum — breakout-prone phase.',
      'Menstruation: skin most sensitive and reactive — gentler products.',
    ],
    phaseGuidance: {
      Foundation: 'SPF every morning. Gentle cleanser. No new actives yet.',
      Ignition: 'AM: SPF + vitamin C. PM: gentle retinol introduction. Collagen supplementation.',
      Build: 'Cycle-adapted skincare. Targeted treatments in luteal for sebum control.',
      Integrate: 'Advanced actives (niacinamide, acids). Consistent routine embedded as default.',
      Sustain: 'Skincare as self-care ritual. Minimal effective routine maintained indefinitely.',
      Thrive: 'Skin health reflects internal health — gut, hormones, sleep all visible externally.',
    },
  },
  {
    domain: 'Stress & Mindset',
    keyPrinciples: [
      'Longer exhale than inhale activates parasympathetic nervous system within 3 breaths.',
      'Chronic cortisol shrinks hippocampal volume — measurable cognitive and emotional impact.',
      'Stress threshold is trainable — controlled exposures (cold, breath, exercise) raise resilience.',
      'The stress-recovery cycle is the unit of adaptation — challenge without recovery = burnout.',
      'Cognitive reframing changes cortisol output — perception of a stressor is as powerful as the stressor.',
    ],
    cycleConnections: [
      'Luteal phase reduces stress tolerance — same stressors feel amplified due to progesterone.',
      'Menstruation: highest vulnerability to emotional overwhelm — rest and boundaries matter more.',
      'Follicular/Ovulation: stress resilience highest — tackle difficult conversations or tasks now.',
    ],
    phaseGuidance: {
      Foundation: 'Identify your top stress driver. Begin one daily calming practice (breath, walk, journaling).',
      Ignition: 'Stress awareness and active management. Cold exposure introduction. Breathwork routine.',
      Build: 'Cycle-synced stress management — adapt demands to phase capacity.',
      Integrate: 'Nervous system regulation as daily practice. HRV awareness. Rest as performance tool.',
      Sustain: 'Sustainable stress load — boundaries, recovery, and meaning as long-term protection.',
      Thrive: 'Equanimity — stress as information, not threat. Rapid recovery from disruption.',
    },
  },
  {
    domain: 'Environment & Space',
    keyPrinciples: [
      'Physical environment is a stronger predictor of behaviour than intention.',
      'Visual clutter measurably raises cortisol throughout the day.',
      'Natural light within 60 min of waking anchors circadian rhythm for the whole day.',
      'Kitchen architecture determines nutrition quality more than willpower.',
      'Morning environment sets emotional tone for subsequent hours.',
    ],
    cycleConnections: [
      'Luteal phase heightens sensory sensitivity — environment disruptions feel more intense.',
      'Menstruation: warm, calm, ordered environment reduces physical and emotional symptoms.',
      'Follicular: energising environments support the neuroplasticity window.',
    ],
    phaseGuidance: {
      Foundation: 'Clear one surface. Set up morning water station. Prep sleep environment.',
      Ignition: 'Kitchen audit — front-load good choices, reduce friction on bad ones.',
      Build: 'Intentional environment design per phase. Recovery space investment.',
      Integrate: 'Full home audit — align environment to who you are becoming.',
      Sustain: 'Environment maintenance — regular resets to prevent entropy.',
      Thrive: 'Living and working environments fully aligned with your values and health goals.',
    },
  },
  {
    domain: 'Body & Movement',
    keyPrinciples: [
      'Lymph fluid has no pump — it moves only through muscle contraction and breathing.',
      'Joint health determines how long you can maintain an active protocol — invest early.',
      'Omega-3 fatty acids reduce joint inflammation and support the skin lipid barrier.',
      'Mobility and flexibility are different: mobility is active range, flexibility is passive.',
      'Walking barefoot and grounding practices support proprioception and nervous system regulation.',
    ],
    cycleConnections: [
      'Relaxin hormone rises at ovulation — increased joint laxity means more injury risk at peak output.',
      'Menstruation: gentle movement (yoga, walking) actively reduces inflammatory markers.',
      'Luteal: body temperature elevation supports stretching and flexibility work.',
    ],
    phaseGuidance: {
      Foundation: 'Daily gentle movement. Lymph support via walking and deep breathing.',
      Ignition: 'Introduce mobility routine. Omega-3 supplementation. Body scan awareness.',
      Build: 'Joint mobility 15 min/day. Posture and alignment awareness. Cold/heat contrast.',
      Integrate: 'Advanced mobility — thoracic spine, hip flexors, ankle mobility. Soft tissue care.',
      Sustain: 'Maintenance mobility to preserve gains. Body as long-term ally.',
      Thrive: 'Embodied movement — connection between body signals and protocol adaptations.',
    },
  },
  {
    domain: 'Confidence & Identity',
    keyPrinciples: [
      'Identity change precedes behaviour change — "I am someone who..." is more durable than willpower.',
      'Confidence is built through small, consistent proof points — not one dramatic transformation.',
      'Self-compassion outperforms self-criticism for long-term habit maintenance.',
      'Social proof and environment shape identity as much as internal narrative.',
      'Tracking progress creates evidence that rewires self-belief over time.',
    ],
    cycleConnections: [
      'Follicular/Ovulation: natural confidence peaks — use these windows for visible challenges.',
      'Luteal: inner critic is louder — self-compassion and gentleness are protocol, not indulgence.',
      'Menstruation: reflection and self-understanding are more accessible — use for identity work.',
    ],
    phaseGuidance: {
      Foundation: 'One consistent daily action builds identity. Journaling as self-witness.',
      Ignition: 'Notice evidence of change. Begin confidence tracking. One "stretch" moment per week.',
      Build: 'Cycle-adapted confidence — plan bold moves for follicular/ovulation windows.',
      Integrate: 'Identity consolidation — you are no longer becoming, you are being.',
      Sustain: 'Confidence as baseline — managing setbacks without identity collapse.',
      Thrive: 'Living fully in the identity you built — sharing, mentoring, expanding.',
    },
  },
  {
    domain: 'Relationships & Social',
    keyPrinciples: [
      'Social connection is a direct physiological health driver — not just emotional.',
      'Oxytocin reduces cortisol and inflammation — close relationships are protective.',
      'Energy management in relationships is as important as physical energy management.',
      'Boundaries are a health practice — protecting recovery time protects protocol adherence.',
      'Community and accountability multiply individual behaviour change.',
    ],
    cycleConnections: [
      'Ovulation: social energy and charisma peak — deepest connection available in this window.',
      'Late luteal: social battery depletes faster — honour lower social drive without guilt.',
      'Menstruation: solitude need is biological — withdrawing is not antisocial, it is recovery.',
    ],
    phaseGuidance: {
      Foundation: 'Identify one person who supports your protocol. Reduce one energy drain.',
      Ignition: 'Social eating strategy — navigate restaurants, events, and social pressure.',
      Build: 'Cycle-aware social calendar — high-output social events in follicular/ovulation.',
      Integrate: 'Communicate your needs clearly. Relationships that support growth vs. drain it.',
      Sustain: 'Relationship maintenance alongside personal growth — growth together, not away.',
      Thrive: 'Deep, reciprocal relationships grounded in shared values and mutual support.',
    },
  },
  {
    domain: 'Purpose & Meaning',
    keyPrinciples: [
      'Meaning buffers against cortisol — people with a strong sense of purpose have measurably lower stress.',
      'Values clarity reduces decision fatigue — fewer internal conflicts, less exhaustion.',
      'Long-term motivation is vision-driven, not willpower-driven.',
      'Intrinsic motivation (growth, mastery, meaning) sustains behaviour change; extrinsic does not.',
      'Regular reflection practices maintain alignment between actions and values.',
    ],
    cycleConnections: [
      'Menstruation and late luteal: deeper access to values and what truly matters.',
      'Follicular: best window for new vision-setting and goal clarification.',
      'Ovulation: sharing your purpose and vision comes most naturally here.',
    ],
    phaseGuidance: {
      Foundation: 'Why are you doing this? Write your real reason. Return to it when motivation drops.',
      Ignition: 'Connect daily protocol actions to your stated vision.',
      Build: 'Review values alignment — is who you are becoming who you want to be?',
      Integrate: 'Purpose as anchor through challenge. Meaning-making in setbacks.',
      Sustain: 'Living a values-aligned life as the sustainable motivation source.',
      Thrive: 'Purpose-driven living — protocol becomes expression of who you are, not what you do.',
    },
  },
];

// ── Phase metadata ────────────────────────────────────────────────────────────

export interface PhaseProfile {
  id: number;
  name: string;
  weeks: string;
  arc: number;
  primaryFocus: string[];
  secondaryFocus: string[];
  tone: string;
}

export const PHASE_PROFILES: PhaseProfile[] = [
  {
    id: 1, name: 'Foundation', weeks: '1–6', arc: 1,
    primaryFocus: ['Sleep', 'Gut Health', 'Nutrition'],
    secondaryFocus: ['Stress & Mindset', 'Environment & Space'],
    tone: 'Gentle, consistent, building safety in the body.',
  },
  {
    id: 2, name: 'Ignition', weeks: '7–12', arc: 1,
    primaryFocus: ['Nutrition', 'Fitness', 'Skin'],
    secondaryFocus: ['Hormones', 'Stress & Mindset'],
    tone: 'Active, momentum-building, visible traction beginning.',
  },
  {
    id: 3, name: 'Build', weeks: '13–22', arc: 1,
    primaryFocus: ['Fitness', 'Hormones', 'Body & Movement'],
    secondaryFocus: ['Nutrition', 'Confidence & Identity'],
    tone: 'Deepening, stronger, body beginning to adapt to standards.',
  },
  {
    id: 4, name: 'Integrate', weeks: '23–32', arc: 1,
    primaryFocus: ['Confidence & Identity', 'Relationships & Social', 'Stress & Mindset'],
    secondaryFocus: ['Hormones', 'Fitness'],
    tone: 'Consolidating, inward, making the external internal.',
  },
  {
    id: 5, name: 'Sustain', weeks: '33–44', arc: 1,
    primaryFocus: ['Purpose & Meaning', 'Environment & Space', 'Body & Movement'],
    secondaryFocus: ['Relationships & Social', 'Nutrition'],
    tone: 'Settled, resilient, building for decades not weeks.',
  },
  {
    id: 6, name: 'Thrive', weeks: '45–52', arc: 1,
    primaryFocus: ['Purpose & Meaning', 'Confidence & Identity', 'Relationships & Social'],
    secondaryFocus: ['All domains at maintenance'],
    tone: 'Expansive, generous, living the protocol as identity.',
  },
];

// ── Context builder ───────────────────────────────────────────────────────────

export interface CamrynContextInput {
  protocolPhase: number;
  cyclePhase: string;
  energy: string;
  stress?: string;
  userName?: string | null;
}

export function buildCamrynContext(input: CamrynContextInput): string {
  const { protocolPhase, cyclePhase, energy } = input;

  const profile = PHASE_PROFILES.find((p) => p.id === protocolPhase) ?? PHASE_PROFILES[0];

  const cycleDomains = DOMAIN_LIBRARY.map((d) => {
    const cycleConn = d.cycleConnections.find((c) =>
      c.toLowerCase().includes(cyclePhase.toLowerCase().split(' ')[0])
    );
    return cycleConn ? `${d.domain}: ${cycleConn}` : null;
  }).filter(Boolean);

  const primaryDomainDetails = DOMAIN_LIBRARY
    .filter((d) => profile.primaryFocus.includes(d.domain))
    .map((d) => {
      const guidance = d.phaseGuidance[profile.name] ?? '';
      return `${d.domain} (Phase ${profile.name} focus): ${guidance}`;
    });

  const lines: string[] = [
    `Protocol context: Phase ${protocolPhase} — ${profile.name} (${profile.weeks})`,
    `Phase tone: ${profile.tone}`,
    `Primary domains this phase: ${profile.primaryFocus.join(', ')}`,
    '',
    'Phase-specific guidance:',
    ...primaryDomainDetails.map((l) => `  • ${l}`),
  ];

  if (cycleDomains.length > 0) {
    lines.push('');
    lines.push(`Cycle phase (${cyclePhase}) connections:`);
    cycleDomains.slice(0, 4).forEach((c) => lines.push(`  • ${c}`));
  }

  lines.push('');
  lines.push(`Energy level: ${energy}`);

  return lines.join('\n');
}

// ── Cycle phase action guidance (used by edge function) ───────────────────────

export const CYCLE_ACTIONS: Record<string, string> = {
  Follicular: 'Rising estrogen improves neuroplasticity and habit formation — this is your best window for introducing new behaviours.',
  Ovulation: 'Peak estrogen + testosterone creates highest performance window — strength, output, and social confidence all elevated.',
  'Early luteal': 'Progesterone supports steady, consistent effort — maintain structure and protect sleep and protein.',
  'Late luteal': 'Lowest stress tolerance of cycle — honour this by reducing demands and prioritising magnesium, sleep, and warm foods.',
  Menstruation: 'Both hormones at baseline — rest, warmth, iron-rich foods, and gentle movement are the protocol, not the exception.',
  'Not sure': 'Without cycle data, phase protocol and energy level are your primary guides — consistency on both produces strong results.',
};

export function getCycleAction(cyclePhase: string): string {
  return CYCLE_ACTIONS[cyclePhase] ?? CYCLE_ACTIONS['Not sure'];
}
