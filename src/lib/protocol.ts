export const PROTOCOL = {
  phases: [
    {
      id: 1,
      name: 'Foundation',
      weeks: '1–6',
      focus: 'Gut, sleep, hydration, baseline habits',
      promise: 'This phase is about creating safety and stability in your body.',
      why: 'Sleep, hydration, gut health, and stress regulation are the highest-leverage foundations because they shape hormones, energy, digestion, appetite, mood, and recovery.',
      modules: [
        {
          title: 'Sleep Protocol',
          why: 'Sleep is the recovery engine for hormones, hunger signals, skin repair, and energy.',
          actions: ['Wake up at your planned time', 'No screens 45 min before bed', 'Cool, dark, quiet room'],
        },
        {
          title: 'Hydration Protocol',
          why: 'Hydration reduces false hunger, brain fog, and low energy.',
          actions: ['500ml water on waking', 'Aim for 2.5–3L daily', 'Swap one caffeinated drink'],
        },
        {
          title: 'Gut Foundation',
          why: 'A healthier gut supports metabolism, inflammation balance, and steadier appetite.',
          actions: ['Aim for 25–35g fiber', 'One fermented food daily', 'Increase plant diversity'],
        },
      ],
      mastery: [
        'Fixed sleep/wake time for 21 consecutive days',
        'Morning hydration for 14 consecutive days',
        'Fiber goal met for 2 consecutive weeks',
        'Fermented food daily for 14 days',
        'Daily 5-minute check-in for 14 days',
      ],
    },
    {
      id: 2,
      name: 'Ignition',
      weeks: '7–12',
      focus: 'Nutrition, movement, skin & hair starts',
      promise: 'This is where your transformation starts to feel active.',
      why: 'Protein, structured meals, walking, early strength, skincare, and hair support create visible traction without demanding perfection.',
      modules: [
        {
          title: 'Nutrition Architecture',
          why: 'Protein, fiber, and meal structure support body composition and hormone steadiness.',
          actions: ['Set protein target', 'Use the plate model', 'Use an 8–10 hour eating window'],
        },
        {
          title: 'Movement Foundation',
          why: 'Walking and beginner strength create momentum and body trust.',
          actions: ['Walk daily', 'Add bodyweight strength twice weekly', 'Progress patiently'],
        },
        {
          title: 'Skin + Hair Start',
          why: 'Consistency beats complexity. Repetition creates payoff.',
          actions: ['AM skincare with SPF', 'PM skincare with retinol progression', 'Collagen + scalp massage'],
        },
      ],
      mastery: [
        'Protein target 5/7 days for 3 weeks',
        'Eating window maintained for 14 days',
        'Daily walk for 21 days',
        'Strength 2x/week for 3 weeks',
        'Skincare routine for 21 days',
      ],
    },
    {
      id: 3,
      name: 'Build',
      weeks: '13–22',
      focus: 'Body composition, hormone tuning, joints',
      promise: 'Now your body begins to adapt to your standards.',
      why: 'Strength training, hormone support, and joint care help your body become stronger, more resilient, and easier to maintain.',
      modules: [
        {
          title: 'Body Composition',
          why: 'Muscle changes metabolism, shape, and long-term maintenance capacity.',
          actions: ['Add a third strength day', 'Use progressive overload', 'Focus on compound patterns'],
        },
        {
          title: 'Hormone Balance',
          why: 'Hormones influence cravings, sleep, cycle quality, and fat storage.',
          actions: ['Add magnesium glycinate', 'Try seed cycling', 'Get baseline hormone labs'],
        },
        {
          title: 'Joint Health',
          why: 'Longevity matters. Joints determine how well you can keep going.',
          actions: ['Daily mobility routine', 'Omega-3 daily', 'Alternate high/low impact weeks'],
        },
      ],
      mastery: [
        'Cycle-adapted training for 6 weeks',
        'Joint mobility for 30 days',
        'Omega-3 for 42 days',
        'Hormone support stack for 42 days',
        'Hormone bloodwork completed',
      ],
    },
    {
      id: 4,
      name: 'Integrate',
      weeks: '23–32',
      focus: 'Confidence, identity, relationships, stress mastery',
      promise: 'The protocol becomes part of who you are, not what you do.',
      why: 'External changes are now visible. This phase is about making them permanent by shifting identity, social patterns, and stress capacity — the factors that determine whether results last.',
      modules: [
        {
          title: 'Identity Architecture',
          why: 'Identity change is more durable than willpower. You are consolidating a new self-concept built on the evidence of the past 52 weeks.',
          actions: ['Journal your transformation evidence weekly', 'Articulate your identity in one sentence', 'Notice old vs new default responses'],
        },
        {
          title: 'Stress Mastery',
          why: 'Your stress threshold is trainable. This phase deepens nervous system resilience so your protocol holds even when life is hard.',
          actions: ['Daily breathwork practice (4-7-8 or box breathing)', 'Cold exposure 3x/week', 'HRV or resting heart rate tracking'],
        },
        {
          title: 'Relationship & Environment Audit',
          why: 'Your environment and social circle either reinforce or erode what you have built. This is the time to align them.',
          actions: ['Audit who and what supports your protocol', 'Communicate your needs clearly in close relationships', 'Upgrade one recovery space intentionally'],
        },
      ],
      mastery: [
        'Daily breathwork for 30 days',
        'Cold exposure 3x/week for 6 weeks',
        'Weekly identity journal for 8 weeks',
        'One meaningful conversation about your needs with someone close',
        'Environment audit completed and one upgrade made',
        'Cycle-aligned social calendar for 4 weeks',
        'HRV or resting heart rate baseline established',
        'Stress response time under 5 minutes on 3 consecutive occasions',
        'Completed a hard thing in follicular/ovulation window intentionally',
        'Sustained full protocol through one difficult week',
      ],
    },
    {
      id: 5,
      name: 'Sustain',
      weeks: '33–44',
      focus: 'Longevity, purpose, resilience, maintenance',
      promise: 'You are now building for decades, not weeks.',
      why: 'Short-term compliance gives way to long-term sustainability. This phase addresses purpose, meaning, joint longevity, and the skills needed to maintain your protocol through real life — disruption, travel, stress, seasons.',
      modules: [
        {
          title: 'Purpose & Meaning',
          why: 'Intrinsic motivation sustains; extrinsic motivation fades. Connecting protocol actions to a larger purpose creates resilience that willpower cannot.',
          actions: ['Clarify your "why" in writing', 'Connect each protocol domain to something you deeply value', 'Begin one thing that expresses your growing health identity externally'],
        },
        {
          title: 'Longevity Foundation',
          why: 'Joints, bone density, cardiovascular health, and metabolic flexibility determine your quality of life at 50, 60, and beyond. The choices made now have a 20-year runway.',
          actions: ['Zone 2 cardio 2x/week for cardiovascular base', 'Bone-loading movements weekly', 'Annual bloodwork including metabolic and hormone panels'],
        },
        {
          title: 'Resilient Protocol Design',
          why: 'A protocol that only works under ideal conditions is fragile. This phase builds minimum effective dose strategies for disruption: travel, illness, stress, social obligations.',
          actions: ['Define your non-negotiable 3 habits for disrupted weeks', 'Practice protocol recovery after one intentional off-week', 'Build a travel protocol that is 80% of your normal'],
        },
      ],
      mastery: [
        'Zone 2 cardio 2x/week for 8 weeks',
        'Non-negotiable 3 habits maintained through one truly disrupted week',
        'Annual bloodwork completed and reviewed',
        'Purpose statement written and reviewed monthly for 3 months',
        'Bone-loading movement weekly for 8 weeks',
        'Travel or disruption protocol tested successfully once',
        'Minimum effective dose protocol documented',
        'One external expression of health identity (a choice, a conversation, a commitment)',
        'Review and rewrite goals for Arc 2',
        'Protocol maintained for 8 weeks with less than 20% missed days',
      ],
    },
    {
      id: 6,
      name: 'Thrive',
      weeks: '45–52',
      focus: 'Integration, expansion, Arc 2 preparation',
      promise: 'You are no longer becoming — you are being.',
      why: 'Phase 6 is the culmination of Arc 1. You review what worked, what transformed, and who you are now. You prepare the foundation for Arc 2 — which extends the protocol beyond 52 weeks into continued, deeper growth across all life domains.',
      modules: [
        {
          title: 'Full Integration Review',
          why: 'Comprehensive reflection on 52 weeks of protocol produces insight that drives Arc 2 effectively.',
          actions: ['Review mastery achievements across all phases', 'Write your Arc 1 story honestly', 'Identify the 3 domains with most remaining growth potential'],
        },
        {
          title: 'Expansion & Sharing',
          why: 'Sharing your progress and knowledge deepens your own integration and creates external accountability for Arc 2.',
          actions: ['Share your transformation with someone who matters', 'Mentor or support one person with their health', 'Build your Arc 2 vision with specificity'],
        },
        {
          title: 'Arc 2 Foundation',
          why: 'Arc 2 is not a new start — it is a deeper spiral. The habits are maintained; the focus shifts to performance, legacy, and mastery.',
          actions: ['Design your Arc 2 protocol priorities', 'Establish your maintenance minimums', 'Set one ambitious Arc 2 goal per domain'],
        },
      ],
      mastery: [
        'Arc 1 review written and reviewed',
        'All Phase 6 modules completed',
        'One person meaningfully supported in their health',
        'Arc 2 vision documented',
        'Arc 2 top 3 priorities defined',
        'Maintenance protocol defined and tested for 2 weeks',
        'All Phase 1–5 mastery quests completed',
        'Full year protocol completion celebrated',
        '52 weeks of at least partial protocol adherence completed',
        'Ready for Arc 2',
      ],
    },
  ],
  arc2: {
    name: 'Arc 2',
    description: 'Arc 2 begins after week 52. It is not a reset — it is a deepening. The protocol domains expand to include advanced performance, relationships, creativity, financial health, and legacy. The cycle-syncing, habit foundations, and identity shifts from Arc 1 become the platform. Arc 2 users define their own protocol priorities within Camryn\'s expanded framework.',
    focus: 'Performance, mastery, legacy, and expansion across all life domains.',
    promise: 'Arc 1 built the body. Arc 2 builds the life.',
  },
  quotes: [
    'A protocol becomes powerful when it feels like guidance, not punishment.',
    'Small proof every day is more powerful than dramatic effort once in a while.',
    'You are building a body that can hold the life you want.',
  ],
  energy: ['Low', 'Medium', 'High'],
  stress: ['Low', 'Moderate', 'High', 'Very high'],
};

export interface DailyLearn {
  title: string;
  body: string;
  tag: string;
}

export const DAILY_LEARNS: DailyLearn[] = [
  { title: 'Estrogen rises in the follicular phase', body: 'During days 1–13 of your cycle, rising estrogen improves mood, neuroplasticity, and insulin sensitivity — your brain literally forms new habits more easily right now.', tag: 'Cycle' },
  { title: 'Ovulation boosts social energy', body: 'At ovulation, estrogen peaks and your voice pitch, confidence, and social drive naturally rise. Use this window for hard conversations, presentations, or anything requiring presence.', tag: 'Cycle' },
  { title: 'Progesterone asks for rest', body: 'In the luteal phase, progesterone raises your resting body temperature and metabolic rate slightly — you need 100–300 more calories and more sleep to feel even.', tag: 'Cycle' },
  { title: 'Late luteal is a signal, not a problem', body: 'PMS symptoms like bloating, irritability, and cravings are your body communicating. Low magnesium, poor sleep, and high stress amplify them significantly.', tag: 'Cycle' },
  { title: 'Menstruation is a monthly review', body: 'Your period quality reflects the hormonal environment of the past 4–6 weeks — not just the current week. Heavy, painful, or irregular periods are data worth tracking.', tag: 'Cycle' },
  { title: 'Cycle length varies more than you think', body: 'A "normal" cycle is 21–35 days. Only about 15% of people have a textbook 28-day cycle. Tracking your own pattern matters more than any average.', tag: 'Cycle' },
  { title: 'Sleep is your number one hormone regulator', body: 'A single night under 6 hours raises cortisol, lowers leptin (fullness hormone), and elevates ghrelin (hunger hormone) — making food choices significantly harder the next day.', tag: 'Sleep' },
  { title: 'Your cortisol should peak in the morning', body: 'Cortisol awakening response (CAR) is highest in the first 30–45 min after waking. Natural light exposure amplifies this, improving focus and suppressing evening cortisol.', tag: 'Sleep' },
  { title: 'Core body temp drives sleep onset', body: 'Your body needs to drop 1–2°C to fall asleep. A cool room (16–19°C), a warm bath 1–2 hrs before bed, or socks help speed this process.', tag: 'Sleep' },
  { title: 'Screens delay melatonin by 90 minutes', body: 'Blue light from phones suppresses melatonin production. Switching to dim, warm lighting after sunset can shift your natural sleep window earlier without effort.', tag: 'Sleep' },
  { title: 'Fiber feeds your gut microbiome', body: 'Different fibers feed different bacteria. Eating 30+ different plant foods per week produces a more diverse microbiome — associated with better mood, immunity, and hormonal balance.', tag: 'Gut' },
  { title: 'The gut-brain axis is bidirectional', body: '90% of serotonin is made in the gut. Chronic gut inflammation can dysregulate mood, energy, and stress response — gut health is mental health.', tag: 'Gut' },
  { title: 'Protein timing matters at breakfast', body: 'A protein-rich breakfast (25–35g) stabilises blood sugar, reduces cravings by midday, and supports lean mass. Skipping breakfast amplifies cortisol-driven hunger later.', tag: 'Nutrition' },
  { title: 'Magnesium is depleted by stress', body: 'Magnesium supports over 300 enzymatic processes including sleep, muscle relaxation, and PMS reduction. Chronic stress, sugar, and alcohol all accelerate depletion.', tag: 'Nutrition' },
  { title: 'Thirst is a late signal', body: 'By the time you feel thirsty, you are already 1–2% dehydrated — enough to reduce concentration, increase fatigue, and trigger false hunger. Morning hydration resets this.', tag: 'Hydration' },
  { title: 'Electrolytes matter as much as water', body: 'Drinking large amounts of plain water without electrolytes can dilute sodium and worsen bloating, fatigue, and headaches. A pinch of salt or electrolyte mineral helps absorption.', tag: 'Hydration' },
  { title: 'Chronic stress shrinks the hippocampus', body: 'Prolonged high cortisol reduces grey matter in the hippocampus — the memory and emotional regulation centre. Consistent sleep, movement, and magnesium are protective.', tag: 'Stress' },
  { title: 'Exhale length determines calm', body: 'A longer exhale than inhale activates the parasympathetic nervous system. A 4-count inhale and 6-count exhale is enough to reduce heart rate within 3 breaths.', tag: 'Stress' },
  { title: 'Cold exposure lowers baseline cortisol', body: 'Regular cold exposure (even 30-second cold showers) trains the stress response, reducing baseline cortisol and improving mood through norepinephrine release over time.', tag: 'Stress' },
  { title: 'Strength training is the best metabolic investment', body: 'Muscle tissue burns 3x more energy at rest than fat tissue. Adding muscle mass raises your baseline calorie burn 24 hours a day — not just during exercise.', tag: 'Fitness' },
  { title: 'Walking is underrated', body: "A daily 30-minute walk reduces all-cause mortality risk by 35%, improves insulin sensitivity, lowers cortisol, and doesn't spike recovery demands like intense cardio.", tag: 'Fitness' },
  { title: 'Protein preserves muscle during fat loss', body: 'Eating 1.6–2.2g of protein per kg of bodyweight while in a calorie deficit preserves lean mass. Without adequate protein, weight loss comes partly from muscle.', tag: 'Nutrition' },
  { title: 'Skin reflects internal inflammation', body: 'Breakouts, dullness, and puffiness are often downstream of gut inflammation, hormonal shifts, or high glycaemic load — not just a skincare problem.', tag: 'Skin' },
  { title: 'Lymph fluid moves with your muscles', body: 'Unlike blood, lymph has no pump. It relies entirely on movement and breathing to circulate. Gentle walking, stretching, or rebounding clears waste and reduces puffiness.', tag: 'Body' },
  { title: 'The glymphatic system cleans your brain during deep sleep', body: "Your brain has its own waste-clearance system — the glymphatic system — that activates almost exclusively during deep, slow-wave sleep. Cerebrospinal fluid flushes through brain tissue, removing toxic metabolic byproducts including amyloid and tau proteins. Chronic poor sleep is now understood to be a primary upstream driver of cognitive decline. Every habit that improves sleep quality is also brain maintenance.", tag: 'Sleep' },
  { title: 'Lymphatic drainage supports hormonal clearance', body: 'The lymphatic system carries excess estrogen metabolites and inflammatory compounds away from tissues. Poor lymph flow — from sedentary behaviour, tight clothing, or chronic stress — contributes to hormonal congestion, breast tenderness, and puffiness in the luteal phase. Dry brushing, rebounding, and diaphragmatic breathing all directly stimulate lymph circulation.', tag: 'Body' },

  // ── Cycle (extended) ─────────────────────────────────────────────────────
  { title: 'The follicular phase is your learning window', body: 'Rising estrogen in days 1–13 enhances neuroplasticity — your brain literally forms new connections more easily. Use this window deliberately: start new habits, take on challenges, and absorb information that requires retention.', tag: 'Cycle' },
  { title: 'Ovulation is not just a reproductive event', body: 'At ovulation, estrogen peaks and testosterone briefly rises. You get higher pain tolerance, sharper spatial reasoning, stronger grip strength, and elevated social confidence. This is biology supporting peak performance — not coincidence.', tag: 'Cycle' },
  { title: 'Early luteal is your steady phase', body: 'Progesterone rises in the first week after ovulation, producing calm, focus, and steady energy. This is your best window for deep, concentrated work — less social, more internal. Use it for execution, not inspiration.', tag: 'Cycle' },
  { title: 'Progesterone raises your calorie needs', body: 'Progesterone slightly increases your basal metabolic rate by 100–300 calories per day. This is why you are genuinely hungrier in the luteal phase — your body needs more fuel, not just more cravings. Eating enough protein protects against muscle breakdown.', tag: 'Cycle' },
  { title: 'Cycle tracking reveals your patterns over time', body: 'Two to three months of consistent cycle tracking produces data your doctor cannot get from a single appointment: when your energy peaks, when your skin reacts, when food cravings spike, and which phase is hardest. This data is irreplaceable.', tag: 'Cycle' },
  { title: 'Seed cycling supports the full cycle', body: 'Flaxseeds and pumpkin seeds in the follicular phase support estrogen metabolism; sesame seeds and sunflower seeds in the luteal phase support progesterone. The evidence is observational, but the mechanism is plausible and the seeds are nutritious regardless.', tag: 'Cycle' },
  { title: 'Hormonal headaches cluster around menstruation', body: 'The rapid drop in estrogen in the 2–3 days before menstruation is the most common trigger for hormonal headaches. Magnesium glycinate taken consistently reduces both frequency and intensity — more effectively than many medications for hormonally-driven migraine patterns.', tag: 'Cycle' },
  { title: 'Your cycle affects your skin week by week', body: 'Follicular phase: estrogen produces clear, plump skin. Ovulation: brief glow. Early luteal: skin quality holds. Late luteal: progesterone increases sebum, making breakouts more likely. This is not a skincare failure — it is a hormonal reality that a cycle-adapted routine can work with.', tag: 'Cycle' },
  { title: 'Relaxin at ovulation increases injury risk', body: 'Relaxin loosens ligaments at ovulation to prepare for possible pregnancy. It peaks in the pre-ovulatory window — making this a higher injury-risk period for intense training. Warm up thoroughly, prioritise form, and avoid maximal loads in this window.', tag: 'Cycle' },
  { title: 'The menstrual phase is an inflammation phase', body: 'Prostaglandins — inflammatory compounds — are released during menstruation to trigger uterine contractions. These same compounds cause cramping and systemic inflammation. Omega-3 fatty acids directly inhibit prostaglandin production. Consistent omega-3 supplementation measurably reduces period pain.', tag: 'Cycle' },
  { title: 'Cycle irregularity is a health signal', body: 'Missed, very light, or irregular cycles are the body\'s signal that something systemic is disrupted — usually inadequate calorie intake, excessive exercise, chronic stress, or thyroid dysfunction. Treating the period as a "fifth vital sign" gives you an ongoing read on your overall health status.', tag: 'Cycle' },
  { title: 'Your cycle and your gut are connected', body: 'Estrogen is metabolised and cleared through the gut. Poor gut health — specifically an imbalanced microbiome — allows enzymes to deconjugate estrogen, causing it to be reabsorbed rather than excreted. This is one mechanism behind estrogen dominance and irregular cycles.', tag: 'Cycle' },

  // ── Sleep (extended) ─────────────────────────────────────────────────────
  { title: 'Alcohol is not a sleep aid', body: 'Alcohol induces sleep by sedating the brain — not through the natural sleep cycle. It suppresses REM sleep, fragments the second half of the night, and produces fragmented, unrestorative sleep even when total hours appear normal. Even two drinks measurably worsen sleep architecture.', tag: 'Sleep' },
  { title: 'Your sleep window matters as much as your hours', body: 'Sleeping 11pm–7am produces fundamentally different hormonal outputs to 2am–10am — even though both are 8 hours. Growth hormone peaks in the first two cycles; REM peaks in the last two. Earlier sleep captures more slow-wave sleep. The body clock is anchored to the sun, not the clock.', tag: 'Sleep' },
  { title: 'The cortisol awakening response is a feature, not a flaw', body: 'Cortisol naturally spikes 50–100% in the 30–45 minutes after waking. This is the cortisol awakening response (CAR) — it primes alertness, mobilises energy, and anchors your circadian clock. Bright morning light amplifies it. Checking your phone first thing blunts it.', tag: 'Sleep' },
  { title: 'Sleep deprivation increases caloric intake by 300–500 kcal', body: 'A single night of poor sleep measurably increases appetite hormones and reduces satiety hormones the following day. Studies show people eat 300–500 more calories after a bad night, particularly from high-sugar and high-fat foods. Sleep is your most powerful appetite regulator.', tag: 'Sleep' },
  { title: 'Temperature predicts sleep onset', body: 'Your core body temperature follows a predictable daily curve — declining in the evening and reaching its lowest point around 4am. Anything that keeps your body temperature elevated (late exercise, hot rooms, warm food) delays this decline and delays sleep onset. A cool room or cool bath 90 minutes before bed accelerates the drop.', tag: 'Sleep' },
  { title: 'Naps under 20 minutes restore without grogginess', body: 'A power nap of 10–20 minutes restores alertness and cognitive performance without entering slow-wave sleep. Beyond 20 minutes, you enter deep sleep and wake feeling groggy (sleep inertia). If you must nap longer, complete a full 90-minute cycle to emerge from the natural end of a cycle.', tag: 'Sleep' },
  { title: 'Morning light is your most powerful circadian tool', body: 'Bright light exposure within 30–60 minutes of waking triggers the cortisol awakening response, suppresses residual melatonin, and anchors your sleep-wake cycle for the next 24 hours. Even 10 minutes outdoors on a cloudy day produces sufficient signal. This single habit improves sleep quality more than any supplement.', tag: 'Sleep' },
  { title: 'Consistent wake time beats consistent bedtime', body: 'If you can only standardise one end of your sleep window, standardise your wake time. A fixed wake time anchors your circadian rhythm and naturally regulates your sleep drive — making it progressively easier to fall asleep at your target time. Variable bedtimes with a fixed wake time outperform fixed bedtimes with variable wake times.', tag: 'Sleep' },
  { title: 'Sleep and insulin sensitivity are directly linked', body: 'Even partial sleep restriction (6 hours for 6 nights) produces insulin resistance equivalent to type 2 diabetes risk. Sleep is when insulin sensitivity is restored — glucose metabolism and fat storage are deeply regulated by sleep quality. This is why poor sleepers often struggle with body composition despite good nutrition.', tag: 'Sleep' },
  { title: 'REM sleep is your emotional processing system', body: 'REM sleep reduces the emotional charge of difficult memories by reprocessing them with lower norepinephrine. This is why sleep after a hard experience often makes it feel more manageable. Chronic REM deprivation produces emotional reactivity, anxiety, and the experience that stressors feel disproportionately large.', tag: 'Sleep' },
  { title: 'Late luteal sleep disruption is hormonal', body: 'Progesterone supports GABA receptors — the calming system. When progesterone drops sharply in late luteal, sleep quality often deteriorates: difficulty falling asleep, night waking, and vivid dreams are common. Magnesium glycinate and a cooler room are the most evidence-based interventions.', tag: 'Sleep' },

  // ── Gut (extended) ───────────────────────────────────────────────────────
  { title: 'The gut-brain axis is bidirectional', body: '90% of vagus nerve signals travel upward — from gut to brain — not brain to gut. Your gut constantly reports on its state, influencing stress response, mood, and decision-making in real time. A healthy gut literally changes your mental state.', tag: 'Gut' },
  { title: 'Prebiotics feed your bacteria — probiotics replace them', body: 'Probiotics introduce beneficial bacteria; prebiotics (fiber that ferments in the colon) are the food that lets them thrive. Without adequate prebiotic fiber — from oats, onions, garlic, leeks, and asparagus — probiotic supplements produce limited lasting benefit. Feed first, supplement second.', tag: 'Gut' },
  { title: 'Stress changes your microbiome within 24 hours', body: 'High cortisol alters gut permeability and microbiome composition within a day. Beneficial species decline; less desirable species expand. This is why stressful periods consistently produce digestive disruption — bloating, loose stools, or constipation — even when diet has not changed.', tag: 'Gut' },
  { title: 'Gut inflammation is the upstream driver of skin issues', body: 'The gut-skin axis is a documented communication pathway. Inflammatory compounds from a permeable gut wall enter the bloodstream and trigger skin inflammation — acne, eczema, and rosacea are all frequently downstream of gut dysbiosis. Healing the gut often resolves skin issues that topical treatments cannot.', tag: 'Gut' },
  { title: 'Fermented foods outperform most probiotic supplements', body: 'A Stanford study found that high-fiber diets and high-fermented-food diets both improve gut health, but fermented foods more consistently increased microbiome diversity than fiber alone. Kefir, kimchi, yoghurt, and kombucha contain hundreds of bacterial strains in living form — more complex than any capsule.', tag: 'Gut' },
  { title: 'Artificial sweeteners disrupt your microbiome', body: 'Saccharin, aspartame, and sucralose have been shown to alter microbiome composition and impair glucose tolerance — in some studies, more significantly than sugar itself. Zero-calorie does not mean metabolically neutral when your gut bacteria are processing it.', tag: 'Gut' },
  { title: 'Your gut microbiome is as individual as a fingerprint', body: 'No two people share the same gut microbiome composition. This is why the same probiotic, diet, or antibiotic protocol produces dramatically different outcomes in different people. Your gut responds to your history, genetics, stress patterns, sleep, and specific food exposures — all of which are unique.', tag: 'Gut' },
  { title: 'Antibiotics cause lasting microbiome disruption', body: 'A single course of antibiotics can alter microbiome composition for six months to two years. Some species may not return without dietary reintroduction. If you have recently taken antibiotics, prioritising fermented foods, prebiotic fiber, and a quality multi-strain probiotic is evidence-based microbiome recovery practice.', tag: 'Gut' },
  { title: 'Eating slowly improves digestion measurably', body: 'Chewing thoroughly activates cephalic phase digestion — the saliva, enzyme, and stomach acid production that begins before food reaches your stomach. People who eat quickly absorb fewer nutrients, produce less digestive enzymes, and report more bloating and discomfort. Eating slower is not a mindfulness exercise — it is a physiological upgrade.', tag: 'Gut' },
  { title: 'Constipation is often a hydration and fiber problem', body: 'The colon absorbs water from stool. Without adequate hydration (2.5–3L daily) and fiber (25–35g), stool becomes dry and slow-moving. Insoluble fiber (from wholegrains and vegetables) adds bulk; soluble fiber (from oats, legumes, fruit) draws water in. Both are needed — neither alone is sufficient.', tag: 'Gut' },

  // ── Nutrition (extended) ────────────────────────────────────────────────
  { title: 'The plate model beats calorie counting', body: 'Half your plate as vegetables and salad, a quarter as quality protein, a quarter as complex carbohydrates — with healthy fats added — consistently produces blood sugar stability, satiety, and adequate micronutrition without tracking. It scales to any meal or cuisine.', tag: 'Nutrition' },
  { title: 'Fat does not make you fat', body: 'Dietary fat does not directly cause fat storage. Excess calories — from any source — drive fat gain. Healthy fats from avocados, olive oil, nuts, and fatty fish support hormone production, brain function, and satiety. Low-fat products typically replace fat with sugar — a nutritionally worse trade.', tag: 'Nutrition' },
  { title: 'Iron absorption depends on what you pair it with', body: 'Non-haem iron from plants is poorly absorbed on its own. Vitamin C — from bell peppers, citrus, or berries eaten at the same meal — increases absorption by up to 300%. Tea, coffee, calcium, and phytates (from wholegrains) significantly reduce absorption. Pairing and timing matters enormously for iron status.', tag: 'Nutrition' },
  { title: 'Omega-3 to omega-6 ratio determines inflammation level', body: 'The modern diet contains approximately 15–20 times more omega-6 (from vegetable oils, processed food) than omega-3. Omega-6 in excess drives inflammation; omega-3 resolves it. Reducing seed oils and processed food while increasing fatty fish, walnuts, and flaxseed directly shifts this ratio toward lower systemic inflammation.', tag: 'Nutrition' },
  { title: 'Blood sugar stability is the foundation of even energy', body: 'Frequent blood sugar spikes followed by rapid drops produce the energy rollercoaster most people accept as normal: morning alert, mid-morning crash, lunch lethargy, afternoon slump. Protein and fiber at every meal blunts these swings. Stable blood sugar produces steady energy, clearer focus, and more reliable moods throughout the day.', tag: 'Nutrition' },
  { title: 'Collagen peptides target connective tissue when timed correctly', body: 'Collagen peptides taken with vitamin C 30–60 minutes before exercise are directed preferentially toward exercised connective tissue. Without vitamin C, the amino acids are used for general protein needs rather than collagen synthesis. Timing and cofactors determine whether supplementation works.', tag: 'Nutrition' },
  { title: 'Selenium supports thyroid and antioxidant function', body: 'Selenium is essential for converting T4 (inactive thyroid hormone) to T3 (active) and for producing glutathione — your master antioxidant. Two Brazil nuts provide your full daily requirement. Selenium deficiency impairs thyroid function, immune response, and antioxidant capacity simultaneously.', tag: 'Nutrition' },
  { title: 'Zinc deficiency produces hormonal disruption', body: 'Zinc is required for insulin receptor function, testosterone production, thyroid enzyme activity, and progesterone synthesis. Women using hormonal contraception have higher zinc depletion rates. Low zinc is associated with acne, irregular cycles, poor wound healing, and impaired immune function.', tag: 'Nutrition' },
  { title: 'Vitamin D functions as a hormone', body: 'Vitamin D3 has receptors in virtually every cell and regulates immune function, mood, insulin sensitivity, muscle strength, and bone density. Deficiency is endemic in northern latitudes from October to April. 1000–4000 IU daily is the typical evidence-based maintenance range for most adults without sun exposure.', tag: 'Nutrition' },
  { title: 'Eating enough is as important as eating well', body: 'Chronic undereating suppresses thyroid function, elevates cortisol, reduces progesterone production, impairs muscle repair, and produces immune dysfunction. Many women pursuing health inadvertently eat too little. Adequate calories — with enough protein — is the physiological foundation everything else depends on.', tag: 'Nutrition' },
  { title: 'Magnesium is the most commonly deficient mineral', body: 'It is estimated that 50–70% of people in developed countries are suboptimal in magnesium. Stress, sugar, alcohol, and caffeine all accelerate depletion. Magnesium supports sleep, muscle relaxation, PMS reduction, blood sugar regulation, and over 300 enzymatic reactions. Glycinate is the best-absorbed form for sleep support.', tag: 'Nutrition' },
  { title: 'Anti-inflammatory eating is not a diet', body: 'Anti-inflammatory eating is a pattern: high in vegetables, fruits, legumes, wholegrains, fatty fish, nuts, and olive oil; low in ultra-processed food, refined sugar, and seed oils. No elimination required. No extreme restriction. The Mediterranean dietary pattern is the most researched anti-inflammatory approach and is associated with reduced risk of almost every chronic disease.', tag: 'Nutrition' },

  // ── Hydration (extended) ────────────────────────────────────────────────
  { title: 'Coffee is not dehydrating at moderate amounts', body: 'The mild diuretic effect of caffeine is offset by the fluid in coffee at normal intake (up to 3–4 cups daily). Coffee contributes to your daily fluid total. The hydration problem for coffee drinkers is not the coffee — it is replacing water with coffee and not drinking enough of both.', tag: 'Hydration' },
  { title: 'Hydration affects cognitive function before physical performance', body: 'Even 1% dehydration — below the threshold of thirst — measurably reduces working memory, concentration, and reaction time. Your brain is 75% water. Cognitive tasks requiring sustained attention are among the first to suffer from mild dehydration, making this particularly relevant during work and study.', tag: 'Hydration' },
  { title: 'Your hydration needs vary across your cycle', body: 'Progesterone in the luteal phase causes fluid retention but also increases total body water requirements. Many women feel more thirsty and bloated simultaneously in the luteal phase — both are real. Consistent hydration prevents false hunger signals from being amplified by dehydration on top of hormonal fluid shifts.', tag: 'Hydration' },
  { title: 'Bone broth contains natural electrolytes', body: 'Bone broth provides sodium, potassium, calcium, and magnesium in naturally balanced ratios alongside collagen-supporting amino acids. It is one of the most nutrient-dense hydrating foods — particularly useful during menstruation, after intense exercise, or when recovering from illness.', tag: 'Hydration' },
  { title: 'Overhydration with plain water causes problems', body: 'Drinking excessive plain water without electrolytes dilutes sodium in the blood — a condition called hyponatraemia. Symptoms include nausea, headache, fatigue, and in extreme cases confusion. For most people, the risk is not overhydration itself but drinking large amounts of plain water while sweating heavily without replacing electrolytes.', tag: 'Hydration' },
  { title: 'Urine colour is your real-time hydration gauge', body: 'Pale yellow urine indicates adequate hydration. Dark yellow or amber indicates you need more fluid. Colourless urine may indicate you are over-drinking plain water. This is a more accurate and immediate signal than any formula — your body tells you in real time.', tag: 'Hydration' },

  // ── Stress (extended) ────────────────────────────────────────────────────
  { title: 'The parasympathetic state is your default health state', body: 'Your body only repairs, grows, digests, and reproduces in the parasympathetic (rest and digest) state. The sympathetic (fight or flight) state mobilises energy and suppresses repair. Chronic sympathetic activation — through work stress, news consumption, poor sleep, or relationship conflict — means your body is never in the state it needs for the protocol to work.', tag: 'Stress' },
  { title: 'Your phone keeps your cortisol elevated', body: 'Checking email and social media in the first 15 minutes of waking has been shown to maintain elevated cortisol for the rest of the morning. Notifications produce small cortisol spikes throughout the day. A 30-minute phone-free morning window measurably improves mood, focus, and cortisol patterns for the full day.', tag: 'Stress' },
  { title: 'Burnout is a recovery deficit accumulated over time', body: 'Burnout does not happen suddenly. It accumulates through repeated stress cycles that are never fully resolved. The most important early warning sign is reduced enjoyment of things that normally bring pleasure. The protocol for early burnout is not more effort — it is immediate and deliberate recovery: sleep, movement, and genuine social connection.', tag: 'Stress' },
  { title: 'Cold exposure trains your stress response', body: 'Regular cold exposure — 30-second cold showers, cold plunges — activates the same physiological stress pathway as psychological stressors but produces recovery 100% of the time. Over weeks, this trains your nervous system to recover from activation more quickly. You become measurably harder to perturb and faster to calm down.', tag: 'Stress' },
  { title: 'Box breathing is clinical-grade stress management', body: 'Box breathing — 4 counts in, 4 hold, 4 out, 4 hold — is used by US Navy SEALs and emergency surgeons to manage acute stress. It works by activating the parasympathetic system through extended breath holds, lowering heart rate and cortisol within 4–5 cycles. Three minutes of box breathing before a stressful event changes your physiological state measurably.', tag: 'Stress' },
  { title: 'Awe reduces inflammation', body: 'Experiences of awe — triggered by nature, music, art, or scale — measurably reduce pro-inflammatory cytokines in the blood within hours. Awe activates a sense of smallness and connection that directly suppresses the self-focused threat-detection system. Seeking out beauty and scale is a legitimate inflammation management tool.', tag: 'Stress' },
  { title: 'Perfectionism is a chronic stress generator', body: 'Perfectionism produces continuous low-grade threat activation: every task that falls short of the internal standard triggers a failure response. This is metabolically expensive — the same cortisol elevation as an acute stressor, running continuously. Self-compassion produces better performance outcomes than perfectionism in every studied domain.', tag: 'Stress' },
  { title: 'Gratitude changes brain chemistry measurably', body: 'Regular gratitude practice increases dopamine, serotonin, and oxytocin production while reducing cortisol. The neurological effect takes two to three weeks of consistent practice to establish. Writing three specific things you are grateful for each morning produces measurable mood and wellbeing improvements within 21 days.', tag: 'Stress' },

  // ── Fitness (extended) ─────────────────────────────────────────────────
  { title: 'Zone 2 cardio is your longevity base', body: 'Zone 2 cardio — where you can hold a conversation but find it slightly challenging — builds mitochondrial density, improves metabolic flexibility, and reduces cardiovascular risk more effectively than higher-intensity work. Two hours per week is the minimum effective dose for cardiovascular health longevity.', tag: 'Fitness' },
  { title: 'Grip strength predicts your long-term health better than most tests', body: 'Grip strength is one of the strongest independent predictors of all-cause mortality, cardiovascular events, and disability in older age — more predictive than blood pressure or BMI in several large studies. It is a proxy for overall muscle quality and neuromuscular function. Building and maintaining upper body strength from your 30s is a genuine longevity investment.', tag: 'Fitness' },
  { title: 'Post-exercise nutrition changes what your body does with the workout', body: 'Muscle protein synthesis peaks 0–2 hours after training. Consuming 25–40g of protein in this window, with some fast-digesting carbohydrate to restore glycogen, maximises the adaptation signal from your session. Without this, your body still adapts — just less efficiently.', tag: 'Fitness' },
  { title: 'Deload weeks are not laziness — they are how progress compounds', body: 'Strength adaptations happen during recovery, not during training. Progressive overload over 4–6 weeks followed by a reduced-volume week consistently produces better long-term results than training hard every week. The deload allows the nervous system and connective tissue to fully adapt before the next loading block.', tag: 'Fitness' },
  { title: 'The minimum effective dose of strength training is twice a week', body: 'Two full-body strength sessions per week, with progressive overload, produce most of the body composition and metabolic benefits of four or five sessions. For women who are time-constrained, two consistent sessions outperform three or four inconsistent ones — always. Consistency is the multiplier.', tag: 'Fitness' },
  { title: 'Cardio and strength training together outperform either alone', body: 'Research consistently shows that concurrent training — strength and cardiovascular work in the same program — produces better outcomes for body composition, metabolic health, and longevity than either in isolation. The ideal ratio depends on your goals, but most women benefit from more strength and less steady-state cardio than the average gym program offers.', tag: 'Fitness' },
  { title: 'Your muscles respond to the stimulus you give them', body: 'Without progressive overload — consistently making training more demanding — muscles stop adapting. The body is extraordinarily efficient at doing exactly what is asked of it and nothing more. Adding one rep, one set, or 2.5kg to one exercise per session is sufficient overload to drive continued adaptation.', tag: 'Fitness' },
  { title: 'Women respond to training differently across the cycle', body: 'In the follicular phase, estrogen and testosterone support higher strength output and faster recovery. In the luteal phase, perceived exertion is higher at the same workload and recovery is slower. Women who train to their cycle consistently report better results, fewer injuries, and more sustainable motivation than those who train the same way throughout.', tag: 'Fitness' },
  { title: 'Rest days are training days', body: 'Muscle growth happens on rest days, not training days. Training creates the stimulus; sleep and nutrition create the adaptation. A training plan without structured rest is a training plan without built-in progress. Rest days protected by adequate sleep and protein produce more muscle growth than extra training sessions that compromise recovery.', tag: 'Fitness' },
  { title: 'Walking counters the negative effects of sitting', body: 'Prolonged sitting reduces insulin sensitivity, increases inflammatory markers, and slows lymph circulation. These effects begin within 90 minutes of sitting. Breaking sitting time with 5-minute walks every hour — even without formal exercise — measurably mitigates metabolic harm. A daily walk does not offset 8 hours of sitting, but regular movement breaks do.', tag: 'Fitness' },

  // ── Skin (extended) ────────────────────────────────────────────────────
  { title: 'Retinol is the most evidence-backed anti-ageing topical ingredient', body: 'Vitamin A derivatives (retinol, retinoids) are the most extensively studied topical compounds for skin ageing. They stimulate collagen production, increase cell turnover, reduce fine lines, and improve skin texture. Start with a low-percentage retinol three nights a week and build tolerance over 4–6 weeks.', tag: 'Skin' },
  { title: 'Niacinamide works for almost every skin concern', body: 'Niacinamide (vitamin B3) reduces hyperpigmentation, minimises pore appearance, strengthens the skin barrier, reduces sebum production, and calms inflammation — with a strong safety profile and tolerance for daily use at 5–10%. It is one of the most versatile and evidence-backed skincare actives available.', tag: 'Skin' },
  { title: 'Your skin barrier is the most important thing you can protect', body: 'A healthy skin barrier — the outermost layer of skin cells and lipids — prevents water loss, blocks irritants, and keeps bacteria out. Over-cleansing, over-exfoliating, and using too many actives simultaneously damages this barrier. Ceramides, fatty acids, and adequate dietary fat support its repair.', tag: 'Skin' },
  { title: 'Collagen production declines from your mid-20s', body: 'Collagen production decreases approximately 1% per year from age 25. By 40, significant structural changes are visible. Consistent SPF use, adequate vitamin C, a diet rich in protein and antioxidants, and collagen peptide supplementation are the most evidence-backed tools for maintaining collagen synthesis.', tag: 'Skin' },
  { title: 'Vitamin C serum works best in the morning', body: 'Vitamin C (ascorbic acid) is an antioxidant that neutralises free radicals from UV exposure. Applied in the morning before SPF, it adds a second layer of UV protection and directly supports collagen synthesis. It is the highest-evidence active for brightening and skin quality alongside retinol.', tag: 'Skin' },
  { title: 'Sleep is when skin repairs itself', body: 'During deep sleep, growth hormone stimulates cell repair and turnover. Blood flow to skin increases, collagen production is most active, and inflammation decreases. Consistently poor sleep produces measurably worse skin — dullness, puffiness, fine lines — even with an excellent topical routine. Sleep is your most powerful skincare product.', tag: 'Skin' },
  { title: 'High GI diet accelerates skin ageing', body: 'High glycaemic load diets — frequent blood sugar spikes from refined carbs and sugar — accelerate glycation: a process where sugar molecules bind to collagen and elastin, making them stiff and degraded. This is visible as loss of elasticity and fine lines that topical products cannot reverse. Food choices are long-term skincare decisions.', tag: 'Skin' },
  { title: 'Omega-3 fats are the skin\'s internal moisturiser', body: 'Omega-3 fatty acids are incorporated into cell membranes, including skin cells, where they reduce inflammation and support the lipid barrier that retains moisture. Dry, reactive, or inflamed skin is frequently a sign of inadequate omega-3 intake. Dietary omega-3 (from fish, flaxseed, walnuts) produces skin improvements that topical moisturisers cannot replicate.', tag: 'Skin' },

  // ── Body (extended) ────────────────────────────────────────────────────
  { title: 'Your posture affects more than your back', body: 'Forward head posture and rounded shoulders reduce lung capacity, compress the vagus nerve (impairing parasympathetic function), increase cortisol, and reduce testosterone in research studies. Improving posture through thoracic extension exercises and neck stretching produces both physical and neurological benefits.', tag: 'Body' },
  { title: 'Bone density is built in your 30s and maintained after', body: 'Peak bone density is reached by approximately age 30. After that, the goal is maintenance. Weight-bearing exercise — especially strength training and impact activities like walking, running, or jumping — is the most powerful bone density stimulus available. Calcium and vitamin D are essential cofactors but do not build bone without the mechanical stimulus.', tag: 'Body' },
  { title: 'Your body temperature follows a daily rhythm', body: 'Core body temperature peaks in the late afternoon (around 5–7pm) — when strength output and reaction time are also highest. It reaches its lowest point around 4am. This is why afternoon workouts often feel easier and produce better performance. Aligning training with your temperature peak improves both output and recovery.', tag: 'Body' },
  { title: 'Breathing mechanics affect your core stability', body: 'Your diaphragm is not just a breathing muscle — it is a core stability muscle. Breathing with your chest rather than your belly reduces intra-abdominal pressure, weakens core stability, and overloads your neck and shoulder muscles. Diaphragmatic breathing — belly rises on inhale, falls on exhale — restores natural core function.', tag: 'Body' },
  { title: 'Your ankles determine your squat quality', body: 'Restricted ankle dorsiflexion is the most common cause of forward lean in squats, compensatory knee cave, and lower back loading. Spending 5 minutes daily on ankle mobility — calf stretching and weight-bearing ankle circles — directly improves squat depth, safety, and lower-body training effectiveness.', tag: 'Body' },
  { title: 'Muscle memory is real and protective', body: 'Muscles retain a "memory" through epigenetic changes — nuclei added during training remain even during periods of inactivity. Returning to training after a break produces faster strength gains than the original learning period. This means time off does not mean starting from zero — the investment is structural.', tag: 'Body' },
  { title: 'Pelvic floor health affects the whole body', body: 'The pelvic floor is not just a continence structure — it is part of the core pressure system, stabilises the lumbar spine, and supports pelvic organ function. Chronic tension (from stress) or weakness (from sedentary patterns, pregnancy, or impact sport) produces back pain, hip dysfunction, and pelvic discomfort. Pelvic floor health deserves the same attention as any other muscle group.', tag: 'Body' },

  // ── Mindset (new tag) ──────────────────────────────────────────────────
  { title: 'Identity shapes behaviour more than motivation', body: 'Motivation is temporary and fluctuating. Identity is stable and self-reinforcing. "I am someone who moves her body every day" produces more consistent behaviour than "I am trying to exercise more." Identity-based habits ask what someone like you would do — and the answer is usually clear without internal debate.', tag: 'Mindset' },
  { title: 'Every completed habit is a vote for your identity', body: 'James Clear\'s concept of "identity votes" captures how habits work biologically. Each time you follow through on a protocol action, you cast one vote for the identity "I am someone who takes care of herself." No single action is dramatic. The accumulation of thousands of small votes becomes your self-concept.', tag: 'Mindset' },
  { title: 'Self-compassion produces better results than self-criticism', body: 'Research by Kristin Neff and others shows that self-compassion — treating yourself with the same kindness you would give a friend — produces better protocol adherence, faster recovery from setbacks, and lower anxiety than self-critical motivation styles. Harshness is not effective accountability. It is counterproductive stress.', tag: 'Mindset' },
  { title: 'The best plan is the one you can sustain', body: 'A 100%-perfect protocol abandoned after 6 weeks produces worse outcomes than an 80%-good protocol sustained for 6 months. Sustainability is not a compromise — it is the mechanism of success. The right protocol is one that fits your actual life well enough to continue.', tag: 'Mindset' },
  { title: 'Tracking creates the perception of progress', body: 'Your brain cannot perceive gradual change in real time. Tracking — whether it is habit completion, strength numbers, or energy scores — creates the visible evidence of progress your brain needs to feel momentum. The act of tracking also increases completion rates: people who track habits are significantly more likely to maintain them.', tag: 'Mindset' },
  { title: 'Rest is not earned — it is required', body: 'The cultural belief that rest must be earned through sufficient productivity is physiologically backwards. Recovery is when adaptation happens, when creativity emerges, and when the nervous system resets. Treating rest as reward creates a system where you only rest after exhaustion — which is the physiological state in which rest is least effective.', tag: 'Mindset' },
  { title: 'Vulnerability is a strength, not a weakness', body: 'Asking for support, admitting difficulty, and being honest about where you struggle are correlated with better health outcomes — not worse. People who acknowledge what they find hard and seek help achieve their health goals more successfully than those who project certainty. The strongest practice is honest self-awareness.', tag: 'Mindset' },
  { title: 'Small consistent actions beat intense intermittent efforts', body: 'A 10-minute walk every day for a year produces more total movement than a 2-hour hike once a week. Ten minutes of mobility work daily for 90 days changes your body more than three intense flexibility sessions in a week. Frequency beats volume. Consistency beats intensity. Always.', tag: 'Mindset' },
  { title: 'Your habits are mostly automatic — design them accordingly', body: 'Research suggests that 40–50% of daily behaviours are habitual — running on autopilot without conscious decision. This is not a problem; it is the most powerful feature you can use. Designing your environment so that healthy defaults run automatically removes the need for willpower entirely. Build the automatic behaviour you want.', tag: 'Mindset' },
  { title: 'Growth requires discomfort — not suffering', body: 'There is a meaningful difference between productive discomfort (the difficulty of building something new) and suffering (pain that signals harm). Growth lives in the productive discomfort zone. Seeking out manageable challenge — a heavier lift, an earlier wake time, a harder conversation — trains the nervous system to function better under demand.', tag: 'Mindset' },
  { title: 'Comparison to your past self is the only useful comparison', body: 'Comparing yourself to others produces either false confidence or destructive inadequacy — both distort your actual trajectory. Comparing yourself to who you were 30, 60, or 90 days ago produces accurate, actionable information about your progress. You are running your own race. The only relevant benchmark is your own direction.', tag: 'Mindset' },
  { title: 'Done imperfectly is infinitely better than not done', body: 'A mediocre workout is better than no workout. A partially logged day is better than no log. An 80% week is better than no week. Perfectionism produces all-or-nothing thinking that treats any imperfection as failure. Progress lives in the imperfect middle — showing up on hard days, doing what you can with what you have.', tag: 'Mindset' },

  // ── Hormones (new tag) ────────────────────────────────────────────────
  { title: 'The hypothalamus runs your hormonal system', body: 'The hypothalamus is the master regulator of your hormonal system — it receives information about stress, light, food, and internal body state and adjusts the output of every major hormone accordingly. Disrupted sleep, chronic stress, and irregular eating all directly dysregulate hypothalamic function and downstream hormone production.', tag: 'Hormones' },
  { title: 'DHEA declines with age and stress', body: 'DHEA is a precursor hormone produced by the adrenal glands that supports estrogen and testosterone production. It peaks in your late 20s and declines with age — but chronic stress accelerates this decline significantly. Low DHEA is associated with fatigue, low libido, reduced muscle mass, and diminished stress resilience.', tag: 'Hormones' },
  { title: 'Thyroid function underpins everything else', body: 'Thyroid hormones regulate metabolic rate, body temperature, digestion, heart rate, muscle function, and brain development. Subclinical hypothyroidism — thyroid function that is below optimal but not in the clinical disease range — produces fatigue, weight gain, cold intolerance, hair loss, and depression that is frequently missed on standard TSH-only testing.', tag: 'Hormones' },
  { title: 'HRT in perimenopause is protective, not risky for most women', body: 'The 2002 WHI study that caused widespread HRT fear has been extensively critiqued for using synthetic progestins and starting treatment too late in older women. Body-identical hormones (estradiol and micronised progesterone) started in perimenopause reduce cardiovascular risk, preserve bone density, protect cognition, and improve quality of life for most women. The evidence has significantly shifted.', tag: 'Hormones' },
  { title: 'Leptin and ghrelin control hunger long-term', body: 'Leptin tells your brain you have enough stored energy; ghrelin signals hunger. Poor sleep raises ghrelin and suppresses leptin — producing genuine appetite increase the next day. Chronic calorie restriction eventually suppresses leptin, which drives the intense hunger of prolonged dieting. Both hormones respond better to adequacy than restriction.', tag: 'Hormones' },
  { title: 'Perimenopause can begin in your late 30s', body: 'Perimenopause — the hormonal transition before menopause — can begin 8–10 years before the final period. Early signs include cycle irregularity, worsened PMS, sleep disruption, anxiety, and brain fog. Most women are not told this. Understanding that these symptoms are hormonal — not psychological — changes the entire response.', tag: 'Hormones' },
  { title: 'Seed cycling supports cycle phases through lignans and fatty acids', body: 'Flaxseeds and pumpkin seeds contain lignans that support estrogen metabolism in the follicular phase; sesame seeds and sunflower seeds provide fatty acids that support progesterone production in the luteal phase. The evidence base is observational, but the nutritional profile supports use regardless of cycle outcomes.', tag: 'Hormones' },
  { title: 'Adaptogens work through the HPA axis', body: 'Adaptogens — herbs like ashwagandha, rhodiola, and maca — reduce cortisol output from the hypothalamic-pituitary-adrenal (HPA) axis under chronic stress. They are not stimulants; they are stress-axis modulators. Ashwagandha specifically has robust evidence for reducing cortisol, improving sleep quality, and supporting thyroid function.', tag: 'Hormones' },

  // ── Longevity (new tag) ───────────────────────────────────────────────
  { title: 'Muscle mass is the strongest predictor of longevity', body: 'After controlling for all other variables, muscle mass and strength are among the strongest independent predictors of lifespan and healthspan. Sarcopenia — age-related muscle loss — is estimated to affect 30% of people over 60 and is almost entirely preventable through consistent resistance training from earlier decades.', tag: 'Longevity' },
  { title: 'Zone 2 cardio builds the mitochondrial infrastructure of health', body: 'Mitochondria produce ATP — the energy currency of every cell. Zone 2 cardio (conversational pace) specifically signals mitochondrial biogenesis — the creation of new mitochondria — in muscle cells. More mitochondria means more efficient energy production, better fat burning, lower insulin resistance, and more metabolic resilience with age.', tag: 'Longevity' },
  { title: 'Chronic inflammation is the common driver of most chronic disease', body: 'Cardiovascular disease, type 2 diabetes, Alzheimer\'s, many cancers, and autoimmune conditions all involve chronic low-grade inflammation as a contributing mechanism. The most powerful anti-inflammatory lifestyle tools are: adequate sleep, regular movement, anti-inflammatory diet (high fiber, omega-3, low refined sugar), and stress management.', tag: 'Longevity' },
  { title: 'Your 30s are your decade to build bone capital', body: 'Peak bone density is typically reached between ages 25 and 30. After that, the goal is maintenance. The earlier and more consistently you build bone through weight-bearing exercise, vitamin D, calcium, and adequate protein, the greater your reserve for the natural decline that begins at perimenopause.', tag: 'Longevity' },
  { title: 'Grip strength is the biomarker to watch', body: 'Grip strength tests in your 40s and 50s predict outcomes in your 70s and 80s more accurately than most standard medical tests. It is a proxy for total neuromuscular function, lean mass quality, and overall physical reserve. The intervention is simple: regular strength training that includes pulling and gripping movements.', tag: 'Longevity' },
  { title: 'Flexibility losses begin in your 30s without intervention', body: 'Collagen in tendons and joint capsules becomes stiffer and less elastic with age, and active range of motion declines without regular training. Ten minutes of daily mobility work — moving joints through their full range under active control — maintains the joint health that determines your physical capacity into later decades.', tag: 'Longevity' },
  { title: 'Purpose extends lifespan measurably', body: 'Having a strong sense of purpose in life is associated with a 20–25% reduction in all-cause mortality across multiple large studies. The mechanism involves lower inflammatory markers, better sleep quality, more consistent health behaviours, and lower cortisol reactivity. Meaning is medicine — this is not metaphorical.', tag: 'Longevity' },
  { title: 'Social connection is a longevity factor equal to exercise', body: 'Robust social relationships reduce all-cause mortality risk by approximately 50% in large meta-analyses. The health effect of social isolation is equivalent to smoking 15 cigarettes a day. Close friendships, family connection, and community involvement are not supplements to health — they are core components of it.', tag: 'Longevity' },
  { title: 'Metabolic flexibility is the metabolic goal', body: 'Metabolic flexibility — the ability to switch between burning carbohydrates and fats according to what is available — declines with insulin resistance and sedentary behaviour. People with high metabolic flexibility have more stable energy, better body composition, and lower disease risk. Zone 2 cardio, strength training, adequate sleep, and reducing refined carbs all build metabolic flexibility.', tag: 'Longevity' },
  { title: 'Sleep is the longevity multiplier for everything else', body: 'No other health behaviour improves outcomes across as many longevity domains as sleep. Sleep improves insulin sensitivity, reduces inflammation, supports immune function, maintains hormonal balance, drives muscle repair, clears amyloid from the brain, and reduces cardiovascular risk. Every other protocol action compounds with consistent sleep — and is undermined without it.', tag: 'Longevity' },
];

export function dailyLearnForToday(cyclePhaseName: string): DailyLearn {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const phasePrefer: Record<string, string[]> = {
    'Follicular':   ['Cycle', 'Nutrition', 'Fitness', 'Mindset', 'Hormones'],
    'Ovulation':    ['Cycle', 'Stress', 'Fitness', 'Mindset', 'Longevity'],
    'Early luteal': ['Cycle', 'Stress', 'Sleep', 'Hormones', 'Mindset'],
    'Late luteal':  ['Cycle', 'Nutrition', 'Gut', 'Sleep', 'Hormones'],
    'Menstruation': ['Cycle', 'Sleep', 'Body', 'Mindset', 'Nutrition'],
    'Not sure':     ['Sleep', 'Hydration', 'Gut', 'Stress', 'Longevity', 'Mindset'],
  };
  const preferred = phasePrefer[cyclePhaseName] || [];
  const pool = preferred.length
    ? DAILY_LEARNS.filter(l => preferred.includes(l.tag))
    : DAILY_LEARNS;

  return pool[seed % pool.length] || DAILY_LEARNS[0];
}

export const CYCLE_PHASES = [
  { name: 'Menstruation', desc: 'rest, gentle movement, nourishment' },
  { name: 'Follicular', desc: 'learning, new habits, moderate workouts' },
  { name: 'Ovulation', desc: 'challenge, connection, higher output' },
  { name: 'Early luteal', desc: 'deep practice, steadier effort' },
  { name: 'Late luteal', desc: 'wind-down, soothing rituals, review' },
  { name: 'Not sure', desc: 'cycle-neutral guidance based on energy and phase' },
];

export function cyclePhaseFromName(name: string) {
  return CYCLE_PHASES.find((p) => p.name === name) || CYCLE_PHASES[3];
}

export function dayOfCycleFromDate(dateStr: string): number | null {
  if (!dateStr) return null;
  // Parse date components directly to avoid UTC-vs-local timezone offset shifting the day
  const [year, month, day] = dateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  if (diff < 1) return null;
  return ((diff - 1) % 28) + 1;
}

export function phaseFromDay(day: number) {
  if (day <= 6) return CYCLE_PHASES[0];
  if (day <= 13) return CYCLE_PHASES[1];
  if (day <= 16) return CYCLE_PHASES[2];
  if (day <= 24) return CYCLE_PHASES[3];
  return CYCLE_PHASES[4];
}

export function dailyTasks(
  phase: number,
  energy: string,
  stress: string,
  cyclePhaseName: string
) {
  const cyc = cyclePhaseFromName(cyclePhaseName);
  const e = energy;
  const s = stress;

  const phaseTasks: Record<string, Record<string, any[]>> = {
    1: {
      Low: [
        {
          shortTitle: 'Drink your morning water',
          title: 'Drink 500ml of water within 10 minutes of waking — before coffee, before your phone.',
          body: 'Cortisol is naturally elevated on waking and dehydration amplifies it. This one act sets your hormonal tone for the morning and is the single highest-return action in Phase 1.',
          tag: 'Foundation · Hydration',
        },
        {
          shortTitle: 'Add a fermented food today',
          title: 'Eat one serving of a fermented food today — yogurt, kefir, sauerkraut, kimchi, or miso.',
          body: 'Fermented foods introduce live cultures that directly support the gut microbiome changes already underway from your fiber intake. This is a small, single action with an outsized effect on the gut work Phase 1 is building.',
          tag: 'Foundation · Gut',
        },
      ],
      Medium: [
        {
          shortTitle: 'Eat 3 plant sources today',
          title: 'Eat 25–35g of fiber today from at least 3 different plant sources (legumes, vegetables, fruit, or wholegrains).',
          body: 'Fiber diversity feeds your gut microbiome, which directly regulates estrogen clearance, inflammation, and appetite signals. More variety means more benefit — this is not Optional in Phase 1.',
          tag: 'Foundation · Gut',
        },
        {
          shortTitle: 'Take your 5-minute check-in',
          title: 'Spend 5 minutes today writing down: how did you sleep, what did you eat, how is your energy right now.',
          body: 'You can\'t adjust what you don\'t track. This isn\'t about perfection — it\'s building the habit of noticing your own patterns before Phase 2 asks you to act on them.',
          tag: 'Foundation · Awareness',
        },
      ],
      High: [
        {
          shortTitle: 'Lock in your wake time',
          title: 'Set one fixed wake time for the rest of this week and hold it regardless of bedtime.',
          body: 'A consistent wake time anchors your circadian rhythm faster than a consistent bedtime. It regulates cortisol, melatonin, and hunger hormones within days. This is the foundation all other habits depend on.',
          tag: 'Foundation · Sleep',
        },
      ],
    },
    2: {
      Low: [
        {
          shortTitle: 'Protein-first breakfast',
          title: 'Eat a protein-anchored breakfast within 60–90 minutes of waking. Aim for at least 25–30g of protein.',
          body: 'Morning protein blunts the cortisol spike, stabilises blood sugar, and reduces afternoon cravings. This is the highest-return nutrition move in Phase 2 and the one most people underdo.',
          tag: 'Ignition · Nutrition',
        },
        {
          shortTitle: 'Hold your eating window',
          title: 'Keep all your meals today within a consistent daily window — most people find 10–12 hours works well.',
          body: 'A consistent eating window supports the insulin sensitivity gains from Phase 1 and gives your gut a real overnight rest. This isn\'t about restriction — it\'s about consistency.',
          tag: 'Ignition · Eating Window',
        },
      ],
      Medium: [
        {
          shortTitle: 'Take your daily walk',
          title: 'Complete a 20–30 minute walk today, ideally outside. For the first 10 minutes, no earphones.',
          body: 'Walking is a direct cortisol reducer and insulin sensitiser. Unstructured outdoor movement also improves mood regulation and reduces mental noise — it is not just exercise, it is nervous system care.',
          tag: 'Ignition · Movement',
        },
      ],
      High: [
        {
          shortTitle: 'Do your strength session',
          title: 'Complete your bodyweight strength session: 3 sets of squats, hip hinges, and push-ups. Rest 90 seconds between sets.',
          body: 'Compound strength training twice a week is the minimum effective dose for body composition change. Squats, hinges, and push-ups recruit the most muscle and produce the strongest hormonal response. Do not skip this session.',
          tag: 'Ignition · Strength',
        },
        {
          shortTitle: 'Do your skincare routine',
          title: 'Complete your full skincare routine tonight — cleanse, treat, moisturize, in that order.',
          body: 'Consistency matters more than product complexity here. Skin renewal happens overnight, and a steady routine is what actually produces visible change over the weeks ahead — not any single ingredient.',
          tag: 'Ignition · Skincare',
        },
      ],
    },
    3: {
      Low: [
        {
          shortTitle: 'Take your magnesium tonight',
          title: 'Take 300–400mg of magnesium glycinate tonight, 30–60 minutes before bed.',
          body: 'Magnesium glycinate is the most bioavailable form and directly supports sleep quality, muscle recovery, and progesterone function in the luteal phase. It is the most evidence-backed supplement in this protocol.',
          tag: 'Build · Hormones',
        },
      ],
      Medium: [
        {
          shortTitle: 'Add progressive overload',
          title: 'Add a third strength session this week. Focus on progressive overload — add one rep or 2.5–5kg to at least one lift.',
          body: 'Progress requires a clear signal. Progressive overload is that signal — it tells your body to build more muscle, which changes your metabolism, shape, and hormonal health. Without it, you maintain. With it, you build.',
          tag: 'Build · Body Composition',
        },
        {
          shortTitle: 'Log your cycle-adapted training',
          title: 'Note how you adjusted today\'s training for your current cycle phase — intensity, type, or just deciding to rest.',
          body: 'Training that respects your cycle isn\'t about doing less — it\'s about applying effort where your body can actually use it. A quick log turns this into a real, trackable habit instead of a vague intention.',
          tag: 'Build · Cycle-Adapted Training',
        },
        {
          shortTitle: 'Take your omega-3 today',
          title: 'Take your omega-3 supplement (or eat a fatty-fish serving) with a meal today.',
          body: 'Omega-3s work directly against the inflammation this phase\'s training load creates, and they\'re only effective with consistent daily intake — a missed day here isn\'t recovered by doubling up tomorrow.',
          tag: 'Build · Hormones',
        },
      ],
      High: [
        {
          shortTitle: 'Complete your mobility work',
          title: 'Complete 10–15 minutes of joint mobility: hips, thoracic spine, and ankles. Use slow, controlled movement through full range of motion.',
          body: 'Joints that move well allow you to train harder, recover faster, and sustain this protocol for years. Skipping mobility work is borrowing against your future capacity — do this even when it feels unnecessary.',
          tag: 'Build · Longevity',
        },
      ],
    },
    4: {
      Low: [{
        shortTitle: 'Do your daily breathwork',
        title: 'Complete 5–10 minutes of structured breathwork today — box breathing or 4-7-8, whichever calms you fastest.',
        body: 'Breathwork is the lowest-effort, highest-leverage regulation tool in this phase. On a low-energy day, this is the one action that keeps your nervous system building capacity instead of just surviving.',
        tag: 'Integrate · Regulation',
      }],
      Medium: [{
        shortTitle: 'Write one identity line',
        title: 'Write one sentence today that starts with "I am becoming someone who..." — just one sentence, in your own words.',
        body: 'Identity change happens through repeated small votes, not big declarations. A single honest sentence today is a real vote toward who you\'re building yourself into.',
        tag: 'Integrate · Identity',
      }],
      High: [{
        shortTitle: 'Take your cold exposure',
        title: 'Complete 1–3 minutes of cold exposure today — a cold shower finish, ice bath, or cold plunge.',
        body: 'Cold exposure builds real stress-response capacity — the same system this phase is training to recover faster under pressure. Discomfort tolerated on purpose, in a safe context, is the whole point.',
        tag: 'Integrate · Resilience',
      }],
    },
    5: {
      Low: [{
        shortTitle: 'Do your bone-loading movement',
        title: 'Complete 10–15 minutes of weight-bearing movement today — a weighted vest walk, stair climbing, or bodyweight step-ups.',
        body: 'Bone density responds to mechanical load, not cardio alone. This phase is about protecting the gains you\'ve built — a bone-loading habit is the single most overlooked piece of long-term health most protocols skip.',
        tag: 'Sustain · Bone Health',
      }],
      Medium: [{
        shortTitle: 'Do your zone 2 cardio',
        title: 'Complete 20–30 minutes of zone 2 cardio today — a pace where you can hold a conversation but not sing.',
        body: 'Zone 2 training builds mitochondrial density and metabolic flexibility that high-intensity work can\'t replicate. This is the quiet, unglamorous work that makes everything else in this phase sustainable.',
        tag: 'Sustain · Metabolic Health',
      }],
      High: [{
        shortTitle: 'Test your minimum effective dose',
        title: 'Today, do only the smallest version of your protocol non-negotiables — the version you could sustain even on your worst week.',
        body: 'Sustain phase isn\'t about doing more, it\'s about knowing your floor. Deliberately testing your minimum effective dose tells you exactly what to protect when life gets disrupted.',
        tag: 'Sustain · Resilience',
      }],
    },
    6: {
      Low: [{
        shortTitle: 'Reflect on your arc',
        title: 'Write 2–3 sentences today on how far you\'ve come since Phase 1 — be specific, not just "better."',
        body: 'Thrive phase is where the work gets integrated into who you are, not just what you do. Naming your progress concretely is what makes it durable.',
        tag: 'Thrive · Reflection',
      }],
      Medium: [{
        shortTitle: 'Support someone else\'s health',
        title: 'Do one small thing today that supports someone else\'s health — share what worked for you, check in on them, or just listen.',
        body: 'Health that only serves you individually is fragile. Extending what you\'ve built outward is both a real contribution and a way of reinforcing your own identity as someone who has changed.',
        tag: 'Thrive · Contribution',
      }],
      High: [{
        shortTitle: 'Define your next priority',
        title: 'Spend 10 minutes today refining your top 3 priorities for the next arc — what matters most now that this one is nearly complete.',
        body: 'Thriving isn\'t an endpoint — it\'s a new starting line. Getting specific about what\'s next keeps momentum from dissolving into vague good intentions.',
        tag: 'Thrive · Vision',
      }],
    },
  };

  const pk = String(phase);
  const today = new Date().toISOString().split('T')[0];
  const phaseSeed = today.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const phaseTaskPool = (phaseTasks[pk] || phaseTasks['1'])[e] || (phaseTasks[pk] || phaseTasks['1']).Medium;
  const phaseTask = phaseTaskPool[phaseSeed % phaseTaskPool.length];

  let cycleTask: any;
  if (cyc.name === 'Menstruation') {
    cycleTask = {
      shortTitle: 'Rest & replenish today',
      title: e === 'Low'
        ? 'Gentle movement only today: a slow walk, stretching, or yoga. Eat warm, iron-rich foods (lentils, spinach, red meat if you eat it). Rest is not optional — it is protocol.'
        : 'Keep movement gentle today. A light walk or slow yoga is appropriate. Avoid high-intensity training — inflammation is naturally elevated and recovery is slower during menstruation.',
      body: 'Estrogen and progesterone are at their lowest point in your cycle. Your body is doing real physiological work. Supporting it with rest, warmth, and iron-rich nutrition is the scientifically correct response — not the easy way out.',
      tag: 'Cycle · Menstruation',
    };
  } else if (cyc.name === 'Follicular') {
    cycleTask = {
      shortTitle: 'Use your cycle window',
      title: e === 'Low'
        ? 'Start one new protocol habit today. Write down exactly when and how you will do it — specificity is what makes it stick.'
        : 'Follicular phase is your best window for learning and habit installation. Introduce one new protocol action today with full intention — this is when new behaviours form most easily.',
      body: 'Rising estrogen in the follicular phase improves insulin sensitivity, mood, and neuroplasticity. Your brain is literally more receptive to forming new patterns right now. Use this window deliberately.',
      tag: 'Cycle · Follicular',
    };
  } else if (cyc.name === 'Ovulation') {
    cycleTask = {
      shortTitle: 'Push your output today',
      title: e === 'Low'
        ? 'Even on a lower energy day, ovulation is a high-performance window. Do at least one thing today that stretches your effort — a longer walk, a heavier lift, or a harder task.'
        : 'Push harder in your workout today — add weight, extend duration, or increase intensity. Ovulation is your highest-output window and training harder here produces a stronger adaptation signal.',
      body: 'Estrogen peaks at ovulation and testosterone briefly rises. Strength output, endurance, and pain tolerance are all at their highest during this window. This is not a coincidence — it is your biology supporting peak performance.',
      tag: 'Cycle · Ovulation',
    };
  } else if (cyc.name === 'Early luteal') {
    cycleTask = {
      shortTitle: 'Hold your structure today',
      title: e === 'Low'
        ? 'Maintain your protocol today — do not skip your non-negotiables. Eat enough protein (target 100–120g total) and protect your sleep window.'
        : 'Stay consistent with strength work but increase recovery focus. Add 15 minutes of extra sleep and slightly increase protein to support progesterone production.',
      body: 'Progesterone rises in the luteal phase, increasing body temperature, resting heart rate, and protein needs. Maintaining structure here prevents the energy and mood crash that many people experience in the second half of their cycle.',
      tag: 'Cycle · Early Luteal',
    };
  } else if (cyc.name === 'Not sure') {
    cycleTask = {
      shortTitle: 'Anchor to the basics',
      title: e === 'Low'
        ? 'No cycle tracking today: focus on your phase protocol action and keep your protein and hydration targets as your anchors.'
        : 'No cycle tracking: your daily tasks are driven entirely by your protocol phase and energy level. Use this as a consistent baseline day.',
      body: 'When you are not tracking your cycle, your protocol phase and energy level are your two strongest guides. Consistency on these two inputs alone produces meaningful results.',
      tag: 'Cycle · Not Tracking',
    };
  } else {
    cycleTask = {
      shortTitle: 'Protect your late luteal',
      title: e === 'Low' || s === 'High' || s === 'Very high'
        ? 'Late luteal non-negotiables today: sleep, magnesium, and cut added sugar and alcohol. These three actions directly reduce PMS severity — do not skip them because you feel worse. That is exactly when they matter most.'
        : 'Wind down training intensity today. Complete your mobility work, review this week in the protocol, and make tomorrow morning easy by prepping your water and supplements tonight.',
      body: 'What you do in late luteal determines how bad next week feels. Sleep, magnesium, and lower sugar are not mood-boosters — they are direct interventions on the hormonal drop that causes PMS. The worse you feel, the more these matter.',
      tag: 'Cycle · Late Luteal',
    };
  }

  let supportTask: any;
  if (s === 'Very high' || s === 'High') {
    supportTask = {
      shortTitle: 'Breathe before you eat',
      title: 'Before your next meal: do 4 rounds of 4-7-8 breathing (inhale 4 counts, hold 7, exhale 8 slowly). Then eat slowly and without screens.',
      body: 'High cortisol suppresses digestion, disrupts blood sugar regulation, and blocks progesterone production. Activating the parasympathetic nervous system before eating directly changes what your body does with the food. This is not a wellness suggestion — it is a physiological intervention.',
      tag: 'Stress Response · Regulation',
    };
  } else if (e === 'Low') {
    supportTask = {
      shortTitle: 'Protect your protein today',
      title: 'On a low energy day, your one non-negotiable is protein at every meal. Even if nothing else goes to plan today, hit your protein target.',
      body: 'Protein is the most protective macro on a hard day. It stabilises blood sugar, prevents muscle breakdown, and prevents the mid-afternoon crash that derails the rest of the day. Everything else is optional today. Protein is not.',
      tag: 'Low Energy · Priority',
    };
  } else {
    supportTask = {
      shortTitle: 'Review your progress honestly',
      title: 'Review one mastery marker from your current phase and honestly assess your progress. What is working? What single thing is most likely to block you?',
      body: 'Protocol progress is built through honest self-assessment, not motivation. Identifying your real friction point lets you solve the right problem — which is almost never "not trying hard enough." It is usually a structure, environment, or knowledge gap.',
      tag: 'Protocol · Self-Assessment',
    };
  }

  return [phaseTask, cycleTask, supportTask];
}
