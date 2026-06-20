export interface DailyCard {
  headline: string;
  body: string;
  takeaway: string;
}

export interface WeeklyTheme {
  id: string;
  name: string;
  hook: string;
  cards: DailyCard[]; // 7 cards, indexed 0 (Sun) – 6 (Sat)
}

// ── Themes ─────────────────────────────────────────────────────────────────

const THEMES: WeeklyTheme[] = [

  // ── Water & Hydration ───────────────────────────────────────────────────
  {
    id: 'everything-water',
    name: 'Everything Water',
    hook: 'This week we go deep on hydration — what it actually does, and why most people are always slightly behind.',
    cards: [
      {
        headline: 'You are already dehydrated by the time you feel thirsty',
        body: 'Thirst is a late-stage signal. By the time your brain registers it, you are already 1–2% below optimal hydration — enough to reduce concentration, slow reaction time, and trigger false hunger. Your body prioritises other functions before it alerts you.',
        takeaway: 'This week, drink 500ml of water before you do anything else in the morning — before coffee, before your phone.',
      },
      {
        headline: 'Water and cortisol are directly linked',
        body: 'Even mild dehydration raises cortisol. When your cells are under-resourced, your body treats it as low-grade stress. This is why dehydrated days often feel harder emotionally, not just physically — your stress response is already elevated before anything happens.',
        takeaway: 'If you are feeling anxious or irritable today, drink a full glass of water first, before reaching for any other solution.',
      },
      {
        headline: 'Electrolytes are the missing half of hydration',
        body: 'Drinking large volumes of plain water without electrolytes can actually worsen fatigue and cause low-grade headaches. Sodium, potassium, and magnesium help water move into your cells. A pinch of sea salt in your morning water or an electrolyte sachet meaningfully changes absorption.',
        takeaway: 'Add a pinch of sea salt or an electrolyte supplement to one glass of water today and notice the difference in how you feel within 30 minutes.',
      },
      {
        headline: 'Gut health depends on water',
        body: 'Your gut uses water constantly — to produce digestive enzymes, to move food through the intestines, and to maintain the mucosal lining that protects your gut wall. Chronic low-level dehydration is one of the quietest contributors to constipation, bloating, and irregular digestion.',
        takeaway: 'Drink a glass of water 20 minutes before each meal this week — it prepares your gut lining and supports enzyme production.',
      },
      {
        headline: 'Hormones are transported in water',
        body: 'Estrogen, cortisol, and progesterone travel through your bloodstream in a water-based medium. Poor hydration slows the clearance of used hormones from your system — meaning yesterday\'s stress hormones or spent estrogen hang around longer than they should.',
        takeaway: 'Think of hitting your daily water target as helping your body clear yesterday out of your system — not just staying healthy.',
      },
      {
        headline: 'Why you get hungrier when dehydrated',
        body: 'The hypothalamus processes both hunger and thirst signals in overlapping areas. When you are mildly dehydrated, your brain often interprets the signal as hunger. This is why dehydrated days tend to involve more snacking and harder food choices — the craving is real, just misdirected.',
        takeaway: 'Before reaching for a snack today, drink a full glass of water and wait 10 minutes. This single habit can reduce unnecessary eating significantly.',
      },
      {
        headline: 'The compound effect of a week well-hydrated',
        body: 'One week of consistently hitting your water target — typically 2.5 to 3 litres — produces measurable improvements in skin clarity, digestion, morning energy, and cognitive sharpness. These are not dramatic but they are real, and they compound. The baseline you set this week carries into next.',
        takeaway: 'Reflect on this week: when did you feel best? What time of day did you drink the most? Use that insight to shape next week\'s default.',
      },
    ],
  },

  // ── Sleep Environment ────────────────────────────────────────────────────
  {
    id: 'sleep-environment',
    name: 'Your Sleep Environment',
    hook: 'This week is about the room you sleep in — the single most underrated lever for sleep quality.',
    cards: [
      {
        headline: 'Temperature is your sleep\'s on/off switch',
        body: 'Your core body temperature needs to drop by 1–2°C to initiate deep sleep. If your room is too warm, your body cannot complete this drop efficiently — you fall asleep but spend less time in the deep, restorative stages. The ideal room temperature for sleep is 16–19°C.',
        takeaway: 'This week, open a window or lower your thermostat before bed. Even 2 degrees cooler makes a measurable difference to sleep depth.',
      },
      {
        headline: 'Light is a biological signal, not just comfort',
        body: 'Your brain uses light to calibrate your circadian clock. Bright overhead lights after sunset tell your hypothalamus it is still daytime — suppressing melatonin by up to 90 minutes. Switching to dim, warm-toned lighting in the evening is one of the fastest ways to shift your sleep window earlier.',
        takeaway: 'After 8pm, switch your overhead lights off and use only lamps or warm side lights. Do this for just three nights and notice when you start feeling sleepy.',
      },
      {
        headline: 'Your phone is a sleep disruptor in two ways',
        body: 'Blue light from screens delays melatonin production. But the content is the second problem — emotionally activating content (social media, news, messages) raises cortisol and activates the threat-detection areas of your brain. Both effects make sleep onset harder and reduce REM quality.',
        takeaway: 'Put your phone in another room tonight — not face down, not on silent, but in another room. Notice whether you fall asleep faster.',
      },
      {
        headline: 'Sound shapes sleep architecture',
        body: 'Sudden noises during sleep — even ones that do not fully wake you — pull you out of deep and REM sleep into lighter stages. Over a night this fragments your sleep architecture significantly. White noise, a fan, or earplugs work by masking sudden spikes rather than eliminating all sound.',
        takeaway: 'If you live in a noisy environment, try a fan or white noise app tonight. Consistent background sound is fundamentally different from intermittent noise.',
      },
      {
        headline: 'Your bed should only mean sleep',
        body: 'Sleep science calls this stimulus control. If you regularly work, scroll, or eat in bed, your brain learns that the bed is an active environment rather than a sleep cue. Over time this weakens the automatic drowsiness you should feel when you lie down. Your bed is the most powerful sleep anchor you have — if you use it correctly.',
        takeaway: 'This week, get out of bed if you have been lying awake for more than 20 minutes. Sit somewhere dim and still until you feel sleepy, then return.',
      },
      {
        headline: 'Darkness activates your sleep biology',
        body: 'Even small amounts of light during sleep — the glow of a charger, streetlight through curtains — suppress melatonin and reduce slow-wave sleep. Blackout blinds are one of the highest-return sleep investments you can make. A sleep mask works equally well.',
        takeaway: 'Cover or remove any light sources in your bedroom tonight. One strip of light under a door can be enough to affect sleep quality measurably.',
      },
      {
        headline: 'The bedroom as a ritual container',
        body: 'Your sleep environment works as a cue system. When the temperature, light, sound, and smell of your room are consistent every night, your nervous system learns to begin its wind-down sequence as soon as you enter. This is why a good sleep environment compounds over time — the cues become biological triggers.',
        takeaway: 'Choose one bedroom change from this week that felt most impactful and lock it in as a permanent default. Small, permanent wins are how sleep transforms.',
      },
    ],
  },

  // ── Gut Foundation ───────────────────────────────────────────────────────
  {
    id: 'gut-foundation',
    name: 'Understanding Your Gut',
    hook: 'This week is about your gut — which turns out to be running far more of your life than you probably realise.',
    cards: [
      {
        headline: 'Your gut contains more neurons than your spinal cord',
        body: 'The enteric nervous system — sometimes called the second brain — lines your entire digestive tract with over 500 million neurons. It communicates constantly with your brain via the vagus nerve. This is not metaphorical: your gut literally influences your mood, stress response, and decision-making in real time.',
        takeaway: 'This week, eat at least one meal with no screens and no rushing — sitting down, chewing thoroughly. This directly activates the vagus nerve.',
      },
      {
        headline: '90% of your serotonin is made in your gut',
        body: 'Serotonin is commonly described as a brain chemical, but the vast majority of it is produced in your intestinal lining by specialised cells that respond to gut bacteria. Poor gut health reduces serotonin availability — which is why chronic digestive issues are so closely linked to low mood and anxiety.',
        takeaway: 'Add one fermented food today — yoghurt, kefir, kimchi, or sauerkraut. You are literally feeding the system that makes you feel better.',
      },
      {
        headline: 'Fiber is the food your bacteria eat',
        body: 'Your gut bacteria do not eat the food you eat — they eat the fiber that reaches your colon undigested. Different bacteria feed on different types of fiber, which is why variety matters more than quantity. Eating the same five vegetables every week starves diversity. Thirty different plant foods per week produces a measurably more diverse and resilient microbiome.',
        takeaway: 'Count how many different plant foods you have eaten this week so far. Aim to add at least two new ones today — seeds, legumes, and herbs all count.',
      },
      {
        headline: 'Inflammation starts in the gut',
        body: 'When the gut lining becomes permeable — often through low fiber, high sugar, chronic stress, or alcohol — inflammatory compounds pass into the bloodstream. This systemic inflammation is the upstream driver of skin issues, hormonal disruption, persistent fatigue, and increased PMS severity. Most people try to treat these symptoms downstream without addressing the source.',
        takeaway: 'For the rest of this week, swap one refined carbohydrate per day for a whole food version. This is the single highest-impact gut lining action.',
      },
      {
        headline: 'Stress shrinks your microbiome',
        body: 'Chronic stress directly alters the composition of your gut bacteria within days. High cortisol reduces the abundance of beneficial species and allows less beneficial ones to expand. The gut-stress connection runs in both directions: a disrupted gut amplifies cortisol, and high cortisol disrupts the gut.',
        takeaway: 'Do one minute of slow breathing before your largest meal today. This activates your parasympathetic system and switches your gut into proper digestion mode.',
      },
      {
        headline: 'Your gut bacteria influence your food cravings',
        body: 'Certain gut bacteria produce compounds that travel to your brain and influence what you want to eat next — in their favour. Bacteria that thrive on sugar send cravings for sugar. As you shift your diet toward fiber and fermented foods, the bacterial composition changes, and cravings often follow within two to four weeks.',
        takeaway: 'When you experience a craving today, ask yourself what you have been feeding your gut this week. The craving is often data about the current balance.',
      },
      {
        headline: 'The gut you build this week is the gut you have next month',
        body: 'The microbiome is remarkably plastic — it responds to dietary changes within 48 to 72 hours. A week of high-fiber, diverse eating noticeably shifts the bacterial population. A week of processed food and low variety can reverse that progress equally fast. The gut reflects your recent choices more honestly than almost any other system.',
        takeaway: 'Write down three gut habits you want to carry forward from this week. Consistency over the next month will produce results that feel significant.',
      },
    ],
  },

  // ── Cycle Awareness ─────────────────────────────────────────────────────
  {
    id: 'cycle-awareness',
    name: 'Your Cycle Is Data',
    hook: 'This week we use your cycle as information — not something to manage around, but something to work with.',
    cards: [
      {
        headline: 'Your cycle is a monthly report card',
        body: 'The quality of your period reflects the hormonal environment of the previous four to six weeks — not just the current week. Heavy flow, severe cramping, or significant PMS are all downstream signals of how well you have been sleeping, managing stress, and nourishing yourself. The period is the bill; the previous month was the spending.',
        takeaway: 'This week, note one thing about your last cycle that you want to improve. Track what you eat, sleep, and stress level in the lead-up to your next period.',
      },
      {
        headline: 'Estrogen is your learning hormone',
        body: 'In the follicular phase, rising estrogen improves neuroplasticity — your brain\'s ability to form and strengthen new neural pathways. This is your best window for building habits, learning new skills, or starting protocols. Your brain is literally more receptive to change during this phase.',
        takeaway: 'If you are in your follicular phase right now, use this week to install one new habit with full intention. If not, note when your follicular phase is and plan for it.',
      },
      {
        headline: 'Ovulation is a performance window',
        body: 'At ovulation, estrogen peaks and testosterone briefly rises alongside it. This produces your highest pain tolerance, strongest grip strength, best endurance, and most confident social presence. Athletes who train according to their cycle report meaningfully better performance in this window.',
        takeaway: 'Note when your next ovulation window is. Plan your hardest workout, most challenging conversation, or biggest presentation for that time.',
      },
      {
        headline: 'Progesterone asks for more from you',
        body: 'In the luteal phase, progesterone raises your resting body temperature and slightly increases your basal metabolic rate — you burn 100 to 300 more calories at rest. You also need slightly more sleep. Women who eat and sleep enough in the luteal phase consistently report less severe PMS.',
        takeaway: 'If you are in your luteal phase, eat a slightly larger dinner tonight, prioritise 8+ hours of sleep, and reduce your training intensity. You are not being lazy — you are being smart.',
      },
      {
        headline: 'PMS is not inevitable',
        body: 'PMS is not simply a feature of having a cycle. Its severity is directly amplified by low magnesium, disrupted sleep, high sugar intake, chronic stress, and poor gut health. Women who address these upstream factors consistently report a 50 to 80 percent reduction in PMS symptoms — without medication.',
        takeaway: 'Start magnesium glycinate (300mg) tonight before bed if you do not already. This single intervention is the most evidence-backed natural PMS intervention available.',
      },
      {
        headline: 'Your menstrual phase is a recovery phase',
        body: 'During menstruation, estrogen and progesterone are at their lowest. Your body is doing real physiological work — the uterine lining is being shed and rebuilt, inflammation is naturally elevated, and iron is being lost. This is the phase for rest, warmth, and nourishment — not pushing through.',
        takeaway: 'During menstruation, reduce training intensity, increase sleep, eat iron-rich foods, and treat yourself with the same care you would give someone recovering from mild illness.',
      },
      {
        headline: 'Tracking your cycle is tracking your health',
        body: 'Regular cycle tracking over two to three months reveals your personal patterns — when your energy peaks, when you sleep best, when you are most at risk of poor food choices, and when you need extra support. This is data you cannot get from any lab test. It is only available through observation.',
        takeaway: 'Commit to tracking your energy, mood, and sleep quality for the next full cycle. Even a simple 1–5 score each day gives you patterns you will find genuinely useful.',
      },
    ],
  },

  // ── Strength & Movement ──────────────────────────────────────────────────
  {
    id: 'strength-foundations',
    name: 'Why Strength Changes Everything',
    hook: 'This week we talk about muscle — and why building it is the single best thing you can do for your long-term health.',
    cards: [
      {
        headline: 'Muscle is your metabolic engine',
        body: 'Muscle tissue burns three to four times more energy at rest than fat tissue. Every kilogram of muscle you add raises your resting metabolic rate — meaning you burn more calories 24 hours a day, including during sleep. This is the biological mechanism behind why strength training has a different effect on body composition than cardio alone.',
        takeaway: 'This week, view every strength session not as burning calories in the moment, but as investing in a higher baseline metabolism for the next decade.',
      },
      {
        headline: 'Progressive overload is the only principle you need',
        body: 'Your body adapts to the stimulus you give it and then stops responding. To keep building muscle, your training must become progressively more demanding — more reps, more weight, less rest, or harder variations. Without progressive overload, you maintain. With it, you build. This is the entire science of strength training in one concept.',
        takeaway: 'In your next strength session, add one small progression to at least one exercise: one extra rep, one extra set, or 2.5kg more. That is all progress requires.',
      },
      {
        headline: 'Compound movements recruit the most muscle',
        body: 'Squats, hip hinges (deadlifts, Romanian deadlifts), pushing (push-ups, presses), and pulling (rows, pull-ups) each recruit multiple large muscle groups simultaneously. These movements produce the strongest hormonal response, the greatest metabolic effect, and the most useful functional strength. Isolation exercises have their place, but compound patterns are the foundation.',
        takeaway: 'Build your sessions around one compound movement per session minimum. Everything else is supplementary.',
      },
      {
        headline: 'Recovery is where strength is actually built',
        body: 'Training is the stimulus; sleep and nutrition are the response. Muscle protein synthesis — the process of building new muscle tissue — peaks in the 24 to 48 hours after training, not during. This is why women who sleep poorly and eat low protein often train hard without seeing results. The session is 40% of the equation at best.',
        takeaway: 'After your next strength session, prioritise protein within two hours and protect your sleep that night. This is where the session pays off.',
      },
      {
        headline: 'Strength training directly improves your hormones',
        body: 'Resistance training improves insulin sensitivity, reduces circulating cortisol over time, and supports healthy progesterone production. It also increases IGF-1 and growth hormone — both of which support lean tissue maintenance, skin quality, and bone density. You are not just building muscle; you are building a more functional endocrine system.',
        takeaway: 'Reframe your strength sessions this week: you are not training to look a certain way, you are training to make your hormones work better.',
      },
      {
        headline: 'You will not bulk accidentally',
        body: 'The fear of getting bulky from lifting weights is one of the most persistent myths in women\'s fitness. Women have 10 to 30 times less testosterone than men, making significant muscle mass gain extremely slow and difficult. The women who look very muscular have trained for years with that specific goal. Casual strength training produces lean, defined muscle — not bulk.',
        takeaway: 'If the fear of bulking has held you back, challenge that belief this week by lifting heavier than you normally would and observing what actually happens.',
      },
      {
        headline: 'Strength is the best long-term investment you can make',
        body: 'After 35, women lose approximately 1% of muscle mass per year without resistance training. After 50, this accelerates. The muscle you build in your 30s and 40s is the reserve you draw from in your 50s and 60s. Strength training is not just about now — it is about maintaining your capacity to live an active, independent, pain-free life for decades.',
        takeaway: 'Think of strength training as saving for retirement. The earlier and more consistently you invest, the richer the outcome. Start now, regardless of where you are starting from.',
      },
    ],
  },

  // ── Stress & Nervous System ──────────────────────────────────────────────
  {
    id: 'stress-nervous-system',
    name: 'Your Stress Response',
    hook: 'This week we look at how your body handles stress — and the surprisingly simple ways to reset it.',
    cards: [
      {
        headline: 'Cortisol is a tool, not a problem',
        body: 'Cortisol is not your enemy. It is your primary alerting hormone — it wakes you up in the morning, sharpens your focus under pressure, and mobilises energy when you need it. The problem is not cortisol itself but chronic elevation: when your body cannot switch the alarm off, every system downstream suffers.',
        takeaway: 'This week, distinguish between useful stress — a deadline, a hard workout, a difficult conversation — and background chronic stress that never resolves. They require different responses.',
      },
      {
        headline: 'The exhale is your reset button',
        body: 'Your nervous system has two modes: sympathetic (activated, alert, stressed) and parasympathetic (calm, restored, digesting). Your exhale activates the parasympathetic branch through the vagus nerve. A longer exhale than inhale — such as four counts in and six counts out — shifts your state within three to five breaths. This is not relaxation; it is physiology.',
        takeaway: 'Before your next stressful moment today — a difficult email, a meeting, a decision — do five slow extended exhales first. This takes 30 seconds and changes your cortisol trajectory.',
      },
      {
        headline: 'Chronic stress shrinks your brain',
        body: 'Prolonged high cortisol physically reduces the volume of grey matter in the hippocampus — the brain region responsible for memory, emotional regulation, and learning. This is why chronic stress makes you feel less sharp, more reactive, and less able to problem-solve. The damage is measurable and, importantly, largely reversible with sleep, movement, and consistent stress management.',
        takeaway: 'Protecting your sleep and doing 20 minutes of gentle movement today is not a nice-to-have — it is direct brain maintenance.',
      },
      {
        headline: 'Stress and gut health are in a feedback loop',
        body: 'High cortisol suppresses digestion, reduces stomach acid, slows gut motility, and alters your microbiome composition within days. A disrupted gut then amplifies stress reactivity by producing less GABA and serotonin — the calming neurotransmitters. This loop explains why stressful periods so often come with bloating, irregular digestion, and worsened mood simultaneously.',
        takeaway: 'During a high-stress period, eat slowly, chew thoroughly, and avoid eating while standing or distracted. Your digestion depends on parasympathetic activation.',
      },
      {
        headline: 'Your stress threshold is trainable',
        body: 'Cold exposure, breath training, progressive exercise, and regular fasting (in the right context) all work by exposing your body to controlled, short-term stress and allowing full recovery. Over time this lowers your baseline cortisol, raises your stress threshold, and improves your recovery speed. You become harder to trigger and faster to reset.',
        takeaway: 'End your shower with 30 seconds of cold water today. You do not have to enjoy it. The discomfort is the point — it is training your stress response.',
      },
      {
        headline: 'Sleep is the only true cortisol reset',
        body: 'Every other stress management technique — breathing, movement, nutrition — reduces cortisol. Only sleep fully resets it. During deep sleep, cortisol drops to its lowest point and the hypothalamus recalibrates the stress axis for the following day. A single night under six hours raises next-day cortisol significantly, impairs emotional regulation, and makes every stressor feel worse.',
        takeaway: 'This week, treat your sleep window as non-negotiable stress management. Going to bed on time is not passive — it is the most active recovery tool you have.',
      },
      {
        headline: 'Stress is only harmful when there is no recovery',
        body: 'Stress and recovery are not opposites — they are partners. Challenge without recovery produces burnout. Recovery without challenge produces stagnation. The goal is not to eliminate stress from your life but to build a recovery infrastructure strong enough to handle the stress you choose to take on. This week is about the infrastructure.',
        takeaway: 'Identify one recovery practice from this week that worked best for you. Schedule it into next week before anything else fills that time.',
      },
    ],
  },

  // ── Nutrition & Protein ──────────────────────────────────────────────────
  {
    id: 'protein-foundations',
    name: 'Protein: The Non-Negotiable',
    hook: 'This week we talk about protein — the macronutrient that most women still consistently undereat, with real consequences.',
    cards: [
      {
        headline: 'Most women eat half the protein they need',
        body: 'The recommended dietary allowance for protein is set at the minimum to prevent deficiency — not the amount for optimal muscle, hormones, or recovery. For active women, the evidence-based target is 1.6 to 2.2 grams per kilogram of bodyweight per day. Most people eating a standard Western diet consume approximately half this amount.',
        takeaway: 'Calculate your protein target this week: take your weight in kilograms and multiply by 1.6. That is your daily minimum. Track for three days to see where you actually land.',
      },
      {
        headline: 'Protein stabilises your blood sugar for hours',
        body: 'A protein-rich breakfast — 25 to 35 grams — produces a fundamentally different hormonal response to a carbohydrate-dominant breakfast. It slows glucose absorption, blunts the cortisol spike, and reduces appetite-driving hormones for three to five hours. This single change consistently reduces afternoon snacking, cravings, and impulsive food choices later in the day.',
        takeaway: 'This week, make protein the first nutrient you plan at every meal — not the afterthought. Build the meal around the protein source.',
      },
      {
        headline: 'Protein is essential for your hormones',
        body: 'Hormones are made from building blocks — many of them protein-derived. Thyroid hormones, insulin, growth hormone, and several key neurotransmitters including dopamine and serotonin are all synthesised from amino acids. Chronically low protein directly impairs hormonal production and signalling.',
        takeaway: 'Think of your protein target not as a fitness goal but as a hormone-support target. You are feeding your endocrine system as much as your muscles.',
      },
      {
        headline: 'Without enough protein, fat loss takes muscle with it',
        body: 'In a calorie deficit, your body needs sufficient protein to distinguish between breaking down fat and breaking down muscle. Without adequate protein — roughly 1.6 to 2g per kg — a meaningful portion of the weight you lose will be lean mass. This slows your metabolism and makes the results harder to maintain.',
        takeaway: 'If you are eating in a calorie deficit right now, your protein target becomes even more critical, not less. Protect your muscle as your first priority.',
      },
      {
        headline: 'Protein timing is a real lever',
        body: 'Muscle protein synthesis is maximally stimulated by single doses of 25 to 40 grams of leucine-rich protein, roughly every four to five hours. Spreading your protein across the day in evenly spaced servings produces better muscle retention and growth than eating the same total amount unevenly — such as a small breakfast and a very large dinner.',
        takeaway: 'Aim for roughly equal protein at each meal today rather than concentrating it at dinner. This one structural shift improves how your body uses what you eat.',
      },
      {
        headline: 'The best protein sources are predictable',
        body: 'Chicken breast, eggs, Greek yoghurt, cottage cheese, tuna, salmon, tofu, edamame, and legumes are the highest-return protein sources relative to calorie cost and satiety. You do not need elaborate meal planning. Having two or three go-to high-protein options per meal slot and repeating them consistently covers most of your needs.',
        takeaway: 'Identify your three highest-reliability protein sources and make sure at least one is available in your kitchen this week. Reliability matters more than variety.',
      },
      {
        headline: 'Protein needs increase in the luteal phase',
        body: 'Progesterone in the luteal phase slightly increases muscle protein breakdown. This means your protein requirements are genuinely higher in the two weeks before your period — not because of cravings, but because of real metabolic demand. Women who increase protein in the luteal phase consistently report better energy, less bloating, and reduced PMS severity.',
        takeaway: 'If you are in your luteal phase, add 10 to 20 grams of extra protein per day this week. A scoop of protein powder, an extra egg, or a serving of cottage cheese covers it.',
      },
    ],
  },

  // ── Space & Environment ──────────────────────────────────────────────────
  {
    id: 'your-space',
    name: 'Your Space, Your System',
    hook: 'This week we look at your physical environment — because your surroundings are silently shaping your habits, energy, and decisions every day.',
    cards: [
      {
        headline: 'Your environment makes decisions for you',
        body: 'Behavioural science consistently shows that your physical environment is a stronger predictor of your behaviour than your intentions. The food on your counter is eaten more than the food in a drawer. The running shoes by the door get used more than the ones in a cupboard. Your space is either working for you or against you — there is no neutral.',
        takeaway: 'This week, identify one thing in your physical environment that reliably leads to a behaviour you want to change. Move it, hide it, or replace it.',
      },
      {
        headline: 'Visual clutter raises cortisol',
        body: 'Studies on cortisol and home environment show that people who describe their homes as cluttered have measurably higher cortisol throughout the day compared to those in ordered spaces. The visual complexity of clutter requires continuous low-level cognitive processing — your brain cannot fully relax in a disorganised environment.',
        takeaway: 'Spend 10 minutes today clearing one surface that is currently cluttered. Not your whole home — one surface. Notice how the space feels afterwards.',
      },
      {
        headline: 'Your kitchen is your nutrition environment',
        body: 'What you eat is heavily determined by what is visible and accessible in your kitchen. A bowl of fruit on the counter is eaten. A bag of chips at eye level is eaten. Vegetables prepped and at the front of the fridge are eaten. You do not need better willpower — you need better kitchen architecture.',
        takeaway: 'Today, rearrange your fridge so that the food you want to eat most is at eye level and already washed or prepped. Inconvenience is the single greatest barrier to good food choices.',
      },
      {
        headline: 'Morning environments set your day\'s tone',
        body: 'The first environment you move through each morning — the lighting, the temperature, the order or disorder of your kitchen and bedroom — sets the emotional tone for the following hours. A calm, ordered morning environment activates a calmer nervous system. A chaotic one starts you in a mild stress state before anything has even happened.',
        takeaway: 'Spend 5 minutes tonight preparing your morning environment: lay out what you need, set the kettle ready, create one small order that greets you tomorrow.',
      },
      {
        headline: 'Natural light is a biological input',
        body: 'Light exposure is the primary signal your circadian clock uses to calibrate cortisol, melatonin, body temperature, and hunger hormones. Getting outside or near a window within 30 to 60 minutes of waking — even on a cloudy day — anchors your circadian rhythm in a way that affects your sleep, energy, and mood for the entire following day.',
        takeaway: 'Step outside or sit by a window for 10 minutes this morning without sunglasses. This is one of the highest-return things you can do for your energy and sleep.',
      },
      {
        headline: 'Your workspace shapes your focus capacity',
        body: 'A disordered desk increases cognitive load — the mental resources required to manage the visual environment — reducing the capacity available for actual work. Studies show people in tidier work environments make healthier food choices, persist longer on tasks, and experience less decision fatigue. Order is not aesthetic; it is functional.',
        takeaway: 'Before you start work today, clear your desk to only what you need for the current task. This is not procrastination — it is environmental preparation.',
      },
      {
        headline: 'The space you recover in matters as much as the space you perform in',
        body: 'Most people invest in their work environment but neglect their rest environment. Your bedroom, your reading corner, your bath routine — the spaces where you recover — directly determine how well you repair from the demands of the day. Recovery is not what happens despite your environment; it is shaped by it.',
        takeaway: 'Identify your primary recovery space this week and make one intentional upgrade to it: a diffuser, better lighting, a cleared surface, a comfortable blanket. Invest in recovery.',
      },
    ],
  },

  // ── Hormones & Cycle ─────────────────────────────────────────────────────
  {
    id: 'hormone-foundations',
    name: 'Your Hormones, Explained',
    hook: 'This week we go inside the hormonal system — what it actually is, and why it drives so much more than your mood.',
    cards: [
      {
        headline: 'Hormones are your body\'s messaging system',
        body: 'Hormones are chemical messengers produced by glands and released into the bloodstream to communicate with cells throughout the body. Estrogen, progesterone, cortisol, insulin, and thyroid hormones each control different functions — but they are deeply interconnected. A shift in one changes the others.',
        takeaway: 'This week, begin noticing how your energy, mood, and appetite shift across the week. These fluctuations are not random — they are your hormones communicating.',
      },
      {
        headline: 'Cortisol and sex hormones share the same building blocks',
        body: 'Cortisol and progesterone are both made from the same precursor — pregnenolone. Under chronic stress, your body prioritises cortisol production over progesterone. This is called the "pregnenolone steal" and it is one of the most common mechanisms behind low progesterone, irregular cycles, and PMS in otherwise healthy women.',
        takeaway: 'Managing your stress response is one of the most direct ways to support cycle hormone balance — not a nice-to-have but a physiological requirement.',
      },
      {
        headline: 'Insulin is the hormone most within your control',
        body: 'Insulin sensitivity — how efficiently your cells respond to insulin — is shaped daily by your food choices, sleep quality, movement, and stress level. Poor insulin sensitivity disrupts estrogen clearance, raises testosterone in PCOS, worsens PMS, and drives fat storage. It is the most modifiable hormone in the system.',
        takeaway: 'Eat protein before carbohydrates today. Walk after your largest meal. These two actions measurably improve insulin sensitivity within days.',
      },
      {
        headline: 'Thyroid function is downstream of nutrition',
        body: 'Your thyroid needs adequate calories, protein, selenium, zinc, and iodine to produce thyroid hormones. Chronic undereating — especially low-calorie dieting — suppresses thyroid output as a survival response, reducing metabolism, body temperature, and energy. Many women on restrictive diets have subclinical thyroid suppression without knowing it.',
        takeaway: 'Eating enough — consistently and with adequate protein — is thyroid support. This week, do not under-eat even on low-motivation days.',
      },
      {
        headline: 'Estrogen dominance is a clearance problem, not a production problem',
        body: 'When estrogen levels are relatively high compared to progesterone, symptoms include heavy periods, bloating, weight gain, and mood swings. This is usually not because the body is making too much estrogen, but because the liver and gut are not clearing used estrogen fast enough. Fiber, cruciferous vegetables, and good gut health directly support estrogen clearance.',
        takeaway: 'Add one cruciferous vegetable today — broccoli, cauliflower, kale, or Brussels sprouts. These contain compounds that actively support estrogen metabolism.',
      },
      {
        headline: 'Progesterone is the calming hormone',
        body: 'Progesterone acts on GABA receptors in the brain — the same receptors targeted by anti-anxiety medications. Adequate progesterone produces calm, improved sleep, and emotional steadiness in the luteal phase. Low progesterone produces anxiety, sleep disruption, and worsened PMS. Progesterone needs: adequate sleep, low chronic stress, and sufficient protein.',
        takeaway: 'Tonight, take magnesium glycinate 30 minutes before bed and protect 8 hours of sleep. These two actions directly support progesterone function.',
      },
      {
        headline: 'Hormone balance is a system, not a single target',
        body: 'There is no one supplement or action that fixes hormones. The system requires sleep, protein, gut health, stress management, movement, and micronutrient sufficiency operating together. Treating one part in isolation — such as taking progesterone cream while sleeping poorly and eating low protein — produces minimal results. The protocol approach is the hormonal approach.',
        takeaway: 'Review this week: which of the hormone foundations are you consistently doing? Pick the weakest link and make it your focus for the next seven days.',
      },
    ],
  },

  // ── Confidence & Identity ─────────────────────────────────────────────────
  {
    id: 'confidence-identity',
    name: 'Building Real Confidence',
    hook: 'This week we talk about confidence — what it actually is, where it comes from, and how to build it systematically.',
    cards: [
      {
        headline: 'Confidence is built from evidence, not thoughts',
        body: 'Confidence is not a feeling you generate from positive self-talk. It is a conclusion your brain draws from accumulated evidence — small, consistent proof points that you do what you say you will. Every completed protocol action is evidence. Every skipped one is counter-evidence. The ledger is always running.',
        takeaway: 'This week, pick one small thing you have been inconsistent on and do it every day. The goal is not the habit — it is the evidence.',
      },
      {
        headline: 'Identity change precedes behaviour change',
        body: 'The most durable behaviour change comes from identity shift, not willpower. "I am trying to eat healthily" and "I am someone who nourishes her body" produce different choices under pressure. Identity-based habits ask "what would someone like me do?" rather than "can I make myself do this?" The answer is almost always different.',
        takeaway: 'Write one sentence that begins "I am someone who..." and describes the person you are building through this protocol. Read it this morning.',
      },
      {
        headline: 'Self-criticism is not a motivator',
        body: 'Research on self-compassion consistently shows that people who treat themselves with kindness after a failure are more likely to try again — not less. Self-criticism activates the threat-detection system, increasing cortisol and reducing the cognitive flexibility needed to problem-solve. Harshness after a bad day makes the next day harder.',
        takeaway: 'When you notice self-critical language today, try this: "Of course I struggled with that — what would make it slightly easier next time?" Curiosity, not criticism.',
      },
      {
        headline: 'Your environment reflects and reinforces your identity',
        body: 'People unconsciously curate their environments to match their self-concept. If you see yourself as someone who is healthy and disciplined, you create environments that support that. If your self-concept is still "someone trying to get healthy," your environments will stay ambiguous. The identity shift changes the environment; the environment reinforces the identity.',
        takeaway: 'Make one environmental change this week that reflects the person you are becoming — not the person you used to be.',
      },
      {
        headline: 'Comparison is data, not judgement',
        body: 'Social comparison is a natural cognitive process — your brain uses others as reference points to assess your own progress. The problem is not comparison itself but the frame: comparison as judgement ("I\'m not as far along as her") versus comparison as information ("she\'s six months ahead of me — what can I learn?"). The frame is entirely under your control.',
        takeaway: 'When you compare yourself to someone today, ask one question: "What can I learn from where they are?" then return to your own path.',
      },
      {
        headline: 'Confidence in one domain transfers to others',
        body: 'Building genuine confidence in one area — your protocol, your fitness, your nutrition — activates a generalised sense of self-efficacy. People who succeed at one hard thing consistently report believing they can succeed at other hard things. Your protocol is not just about your body. It is building the psychological infrastructure for everything else.',
        takeaway: 'Notice this week whether you feel more capable or decisive in non-health areas of your life. This is real — and intentional.',
      },
      {
        headline: 'The stories you tell about yourself shape the results you get',
        body: 'The narrative you maintain about yourself — "I\'m not a morning person," "I can\'t stick to things," "I\'ve always struggled with food" — operates as a self-fulfilling script. These stories are not facts; they are historical interpretations that you can choose to update. The protocol is collecting new data. Your job is to update the story to match.',
        takeaway: 'Write down one old story you tell about yourself that your recent protocol actions contradict. That contradiction is the update.',
      },
    ],
  },

  // ── Sleep Depth & Quality ─────────────────────────────────────────────────
  {
    id: 'sleep-depth',
    name: 'Deep Sleep & Recovery',
    hook: 'This week we go deeper on sleep quality — not just hours, but what happens during those hours and how to make it count.',
    cards: [
      {
        headline: 'Deep sleep is where physical repair happens',
        body: 'Slow-wave sleep (deep sleep) is when growth hormone is released in its largest pulse, driving muscle repair, bone density maintenance, and immune function. This is the sleep stage most disrupted by alcohol, late eating, and high stress. Without adequate deep sleep, you can sleep eight hours and still wake exhausted.',
        takeaway: 'Avoid alcohol and large meals within 3 hours of bed this week. Both measurably reduce slow-wave sleep, even when total sleep time stays the same.',
      },
      {
        headline: 'REM sleep processes your emotional experience',
        body: 'REM sleep is when your brain processes and integrates the emotional content of the day, forming memories and reducing the emotional charge of difficult events. Chronic REM deprivation increases emotional reactivity, anxiety, and the sensation that everything feels harder. REM happens mostly in the second half of sleep — cutting sleep short disproportionately removes it.',
        takeaway: 'Protect the last 90 minutes of your sleep window this week — this is disproportionately REM-rich. Set your alarm 90 minutes later if you have been cutting it short.',
      },
      {
        headline: 'Sleep cycles are 90 minutes long',
        body: 'Your sleep moves through roughly 90-minute cycles of light sleep, deep sleep, and REM. Waking at the end of a cycle produces the freshest feeling; waking mid-cycle produces grogginess. While you cannot perfectly control this without a tracker, timing your alarm to a multiple of 90 minutes from when you fall asleep is a surprisingly effective low-tech hack.',
        takeaway: 'If you typically fall asleep within 15 minutes of lying down, set your alarm at 7.5 or 9 hours after your target sleep time rather than a round number.',
      },
      {
        headline: 'Your sleep quality peaks 6–8 hours before your natural wake time',
        body: 'Growth hormone release peaks in the first 2–3 cycles. REM peaks in the last 2–3 cycles. Sleep is not uniform — the timing of when you sleep matters as much as how long. People who sleep between 10pm and 6am get a fundamentally different quality of sleep than those who sleep 2am to 10am, even though the hours are identical.',
        takeaway: 'This week, try going to bed 30–60 minutes earlier than usual without changing your wake time. Observe the difference in how you feel.',
      },
      {
        headline: 'Napping has specific rules',
        body: 'A nap under 20 minutes (a "power nap") restores alertness without entering deep sleep — you wake feeling refreshed. A nap of 30–60 minutes enters slow-wave sleep and produces grogginess on waking (sleep inertia). A 90-minute nap completes a full cycle. The worst nap length is 30–60 minutes, and naps after 3pm reduce evening sleepiness.',
        takeaway: 'If you nap, keep it under 20 minutes and before 3pm, or commit to a full 90-minute recovery nap. Avoid the middle ground.',
      },
      {
        headline: 'Magnesium is the most evidence-backed sleep supplement',
        body: 'Magnesium glycinate crosses the blood-brain barrier and binds to GABA receptors, producing a calming effect that supports sleep onset and reduces sleep fragmentation. It also supports melatonin production. Most women are deficient — especially after stress, heavy exercise, alcohol, or a high-sugar period.',
        takeaway: 'Take 300–400mg magnesium glycinate tonight, 30–60 minutes before bed. This is a clinical dose, not a wellness gesture.',
      },
      {
        headline: 'Sleep debt is real and partially repayable',
        body: 'Chronic sleep restriction creates an accumulating sleep debt that affects cognitive function, hormone balance, and mood in measurable ways. Some of this debt can be recovered through extended sleep on low-obligation days — but not all of it, and not quickly. The best approach is a consistent sleep schedule that prevents debt from building.',
        takeaway: 'If you have had a hard week of sleep, give yourself permission to sleep an extra hour this weekend. One recovery night does not fix chronic deficit, but it meaningfully helps.',
      },
    ],
  },

  // ── Body Composition ──────────────────────────────────────────────────────
  {
    id: 'body-composition',
    name: 'Body Composition vs Weight',
    hook: 'This week we separate body composition — what your body is made of — from body weight, which tells you much less than you think.',
    cards: [
      {
        headline: 'Weight is not the metric that matters',
        body: 'Body weight is the sum of muscle, fat, water, bone, and everything else. Two women can weigh the same and look, feel, and function entirely differently. A woman who loses 5kg of muscle and gains 5kg of water weight after illness will be unhealthier despite no change on the scale. The scale measures one thing; your protocol is about something much more specific.',
        takeaway: 'This week, set aside the scale and choose one non-weight metric to track: energy level, strength progress, how clothes fit, or sleep quality.',
      },
      {
        headline: 'Muscle is denser than fat — and that\'s good',
        body: 'As you build muscle and reduce fat, your body may become smaller and firmer while the scale shows little change — because muscle is denser than fat, taking up less volume per kilogram. This is why women who strength train often look dramatically different without dramatic weight change. The scale actively misleads during body recomposition.',
        takeaway: 'If you are strength training consistently, take measurements or photos every 4 weeks instead of weighing yourself daily. The story they tell is more accurate.',
      },
      {
        headline: 'A calorie deficit depletes muscle as well as fat',
        body: 'Without adequate protein and strength training in a calorie deficit, approximately 25–40% of weight lost is lean mass, not fat. This lowers your resting metabolic rate, making it harder to maintain results. The combination of protein at 1.6–2g/kg and strength training signals to your body to preserve muscle while burning fat preferentially.',
        takeaway: 'Check your protein intake today. If you are not hitting at least 1.6g per kg of bodyweight, add one protein-rich meal or snack before addressing anything else.',
      },
      {
        headline: 'Hormonal fat distribution is not willpower-resistant — it is hormonal',
        body: 'Cortisol specifically drives visceral fat storage around the abdomen. High estrogen relative to progesterone drives fat storage on hips and thighs. Insulin resistance drives fat accumulation around the midsection. These patterns do not respond to more restriction — they respond to addressing the underlying hormone. This is why sleep and stress management change body composition even without changing calories.',
        takeaway: 'Identify which hormonal factor is most relevant for you and address that root cause, not the symptom.',
      },
      {
        headline: 'Body composition improves fastest when you eat enough',
        body: 'Severe calorie restriction triggers cortisol release, suppresses thyroid function, reduces muscle protein synthesis, and activates fat-storage mechanisms. The women who achieve the most significant body composition change are typically eating more than they think — specifically more protein and more calories than the average "diet." Eating enough while training consistently produces better results than under-eating.',
        takeaway: 'If you have been eating less than 1500 calories daily, try eating 200 more calories from protein this week and observe your energy, training quality, and body composition.',
      },
      {
        headline: 'Inflammation masquerades as body fat',
        body: 'Gut inflammation, food sensitivities, chronic stress, and poor sleep all produce systemic inflammation that causes water retention and puffiness indistinguishable from fat gain on the scale. Women who address gut health, reduce inflammatory foods, and improve sleep consistently report significant changes in how their body looks and feels without calorie restriction.',
        takeaway: 'Reduce your added sugar intake for the rest of this week and increase your fiber. This is an anti-inflammatory intervention that changes how your body holds weight.',
      },
      {
        headline: 'Body composition is a long game — and the long game wins',
        body: 'Significant body recomposition — gaining muscle while losing fat — takes six to twelve months of consistent training and nutrition. Dramatic fast results (crash diets, extreme protocols) produce rapid muscle loss and rapid regain. The women who have the best long-term outcomes are those who commit to three months of consistency without expecting dramatic early results.',
        takeaway: 'Set a six-month body composition goal, not a six-week one. Write it down. Your current protocol is already moving you towards it.',
      },
    ],
  },

  // ── Relationships & Social ────────────────────────────────────────────────
  {
    id: 'relationships-energy',
    name: 'Relationships & Your Energy',
    hook: 'This week we look at how your relationships affect your health — and how to protect your energy without isolation.',
    cards: [
      {
        headline: 'Social connection is a biological health driver',
        body: 'Loneliness is as dangerous as smoking 15 cigarettes a day — this is not hyperbole, it is the finding of a large meta-analysis of mortality data. Close social connection reduces cortisol, increases oxytocin, and improves immune function. Investing in relationships is as much a health practice as sleep or nutrition.',
        takeaway: 'Make one genuine connection this week — not a group activity, but a real one-to-one conversation with someone you care about.',
      },
      {
        headline: 'Oxytocin is your anti-stress hormone',
        body: 'Physical touch, genuine laughter, meaningful conversation, and acts of generosity all release oxytocin. Oxytocin directly suppresses cortisol, reduces blood pressure, and produces a sense of safety and calm. Your protocol already addresses most cortisol levers — this is the social one.',
        takeaway: 'Schedule one genuinely enjoyable social interaction this week — not an obligation. Your nervous system needs pleasure as much as rest.',
      },
      {
        headline: 'Your social environment shapes your health behaviours',
        body: 'Research consistently shows that health behaviours are socially contagious. People who have close friends who exercise are significantly more likely to exercise. People surrounded by those who eat well eat better. Your social environment is either amplifying or undermining your protocol — and it is worth assessing honestly.',
        takeaway: 'Identify one person in your life whose health habits you want to be more like. Could you do something health-related together this week?',
      },
      {
        headline: 'Some relationships drain your health',
        body: 'Chronically draining relationships — those that consistently leave you feeling depleted, anxious, or unworthy — produce a measurable cortisol response that accumulates over time. This is not about cutting people off. It is about recognising that relationship quality is a health variable, and that managing the energy cost of difficult relationships is legitimate self-care.',
        takeaway: 'Identify one relationship that consistently costs you more energy than it gives. You do not need to change it immediately — just name it clearly.',
      },
      {
        headline: 'Your cycle changes your social needs',
        body: 'At ovulation, social drive naturally peaks — you want to connect, share, and be seen. In late luteal and menstruation, the social battery is genuinely smaller — not a personality problem but a hormonal reality. Honouring lower social drive during these phases is not antisocial; it is cycle-literate self-management.',
        takeaway: 'Review your calendar this week. Are high-social commitments landing in your ovulation window? Can you shift anything to protect late luteal and menstrual rest?',
      },
      {
        headline: 'Communicating your needs changes your relationships',
        body: 'Many women manage their health quietly — changing habits without explaining why, declining invitations without context, feeling resentful when others do not support them. Clear, specific communication about your needs ("I need to be in bed by 10pm on weeknights") is far more effective than silent management and prevents the resentment that erodes relationships over time.',
        takeaway: 'Choose one protocol need that someone close to you could support better. Say it clearly and specifically this week — not as a complaint, but as a request.',
      },
      {
        headline: 'Community multiplies your results',
        body: 'Individual behaviour change has about a 10% success rate long-term. When done within a supportive community, this rate increases significantly. Sharing your protocol with even one person — a friend, a partner, or an online community — creates accountability, normalises the effort, and gives you a witness for your progress.',
        takeaway: 'Share one protocol win this week with someone — even a small one. Speaking your progress aloud makes it more real and more likely to continue.',
      },
    ],
  },

  // ── Joints & Longevity ────────────────────────────────────────────────────
  {
    id: 'joints-longevity',
    name: 'Joints & Moving for Life',
    hook: 'This week we focus on your joints — and why investing in them now pays dividends for decades.',
    cards: [
      {
        headline: 'Your joints determine your longevity more than your heart',
        body: 'Cardiovascular disease is the leading cause of death, but joint degeneration is the leading cause of disability and loss of independence in later life. People who lose hip or knee function in their 60s and 70s typically spent decades loading joints incorrectly, ignoring mobility, or accumulating chronic inflammation. Joint health is a long-game investment with a 20-year runway.',
        takeaway: 'This week, begin a 10-minute daily mobility practice. Start with hips, thoracic spine, and ankles — the three sites most commonly restricted in people who sit for long periods.',
      },
      {
        headline: 'Cartilage needs loading to stay healthy',
        body: 'Cartilage is avascular — it has no blood supply and gets nutrients only through compression and decompression during movement. Joints that are not regularly moved through their full range of motion gradually lose cartilage quality. Movement does not wear joints out. Lack of varied movement does.',
        takeaway: 'Take your hips, shoulders, and spine through their full range of motion today — not to stretch, but to nourish the cartilage with joint fluid.',
      },
      {
        headline: 'Omega-3 fatty acids are the most evidence-backed joint supplement',
        body: 'Omega-3 fatty acids — specifically EPA and DHA from fish oil — measurably reduce joint inflammation, decrease morning stiffness, and slow cartilage degradation in both healthy and arthritic joints. The effective daily dose is 2–3g combined EPA and DHA. This is typically two to three high-quality fish oil capsules or a concentrated omega-3 supplement.',
        takeaway: 'If you are not already taking omega-3, start today. If you are, check the label — are you actually getting 2–3g combined EPA and DHA, or just fish oil capsules of unknown potency?',
      },
      {
        headline: 'Collagen synthesis requires vitamin C',
        body: 'Your body cannot make collagen without adequate vitamin C — it is a co-factor in the enzymatic process. Taking collagen peptides while vitamin C deficient produces minimal results. The most effective protocol is 15–20g of collagen peptides taken with a vitamin C source 30–60 minutes before exercise, which directs the amino acids toward the exercised connective tissue.',
        takeaway: 'If you are supplementing collagen, take it with a glass of orange juice or a vitamin C supplement before your next workout. This is not optional — it is the mechanism.',
      },
      {
        headline: 'Mobility and flexibility are different things',
        body: 'Flexibility is the passive range of motion of a joint or muscle — how far you can be stretched by an external force. Mobility is the active range you can control under your own power. Flexibility without mobility produces unstable joints that are more injury-prone. Mobility training — moving through range of motion against resistance or with control — is more protective than static stretching.',
        takeaway: 'Replace your static stretching today with controlled active movement: slow, deliberate circles, hinges, and rotations through your full range under your own muscle power.',
      },
      {
        headline: 'Relaxin at ovulation increases injury risk',
        body: 'Relaxin is a hormone that increases joint laxity — it loosens ligaments in preparation for possible pregnancy. It peaks at ovulation and remains elevated through the luteal phase. Women are two to four times more likely to sustain ACL injuries in the pre-ovulatory phase than at other points in the cycle. This is not a reason to avoid training — it is a reason to warm up thoroughly and avoid maximal loads when pushing your output window.',
        takeaway: 'In your ovulation window, prioritise thorough warm-up and controlled technique over maximum load. Push hard, but move well.',
      },
      {
        headline: 'The best exercise for your joints is the one you do consistently',
        body: 'No single modality is uniquely best for joint health. Strength training builds the supporting musculature. Yoga and mobility work maintain range. Swimming removes compressive load. Walking maintains cartilage health. The pattern that produces the best long-term outcomes is varied, consistent movement across modalities — not specialisation in any single one.',
        takeaway: 'Add one type of movement to your week that you do not normally do. This week\'s novelty becomes next month\'s baseline joint health.',
      },
    ],
  },

  // ── Mindset & Growth ─────────────────────────────────────────────────────
  {
    id: 'growth-mindset',
    name: 'A Mind That Grows',
    hook: 'This week we look at how you think about difficulty, change, and failure — because it determines almost everything.',
    cards: [
      {
        headline: 'The growth mindset is a biological reality',
        body: 'Carol Dweck\'s research on mindset shows that people who believe their abilities can grow through effort — a "growth mindset" — outperform those who believe abilities are fixed, not just psychologically but neurologically. The belief that challenge and failure are learning inputs rather than evidence of limitation actually changes how the brain processes and retains information.',
        takeaway: 'When you encounter something difficult today, try adding "yet" — not "I can\'t do this" but "I can\'t do this yet." This is not positive thinking. It is brain architecture.',
      },
      {
        headline: 'Failure is data, not verdict',
        body: 'Every missed protocol day, every week where you did not hit your targets, every slip from a habit is data about what made consistency harder — not evidence that you cannot do this. The most effective performers in any domain fail more than average performers. They iterate faster. Reframing failure as iteration fuel is not just a mindset shift; it is a strategic advantage.',
        takeaway: 'Think of your last protocol miss. What made it hard? One constraint. Name it — not as a flaw but as information about what to change.',
      },
      {
        headline: 'Your brain changes based on what you practise',
        body: 'Neuroplasticity — your brain\'s ability to form new neural pathways — continues throughout life. Every time you practise a new behaviour, the neural pathway supporting it grows slightly stronger. Every time you choose the old pattern, the old pathway is reinforced instead. Habit formation is literally a competition between neural circuits. Consistency feeds the circuit you want to win.',
        takeaway: 'The habit you have found hardest to build is the one with the weakest neural pathway. It is not a character flaw — it is a training gap. Do it once today.',
      },
      {
        headline: 'Discomfort is the sign you are growing',
        body: 'Your brain\'s default function is to minimise energy expenditure. It resists new behaviours because new things are neurologically expensive — they require more attention and effort than automated habits. The discomfort of building a new habit is the felt experience of neurological construction. It does not mean you are doing it wrong; it means you are doing it.',
        takeaway: 'The next time you feel resistance to a protocol action, say to yourself: "This is what building feels like." Then do it anyway.',
      },
      {
        headline: 'Willpower is a resource that depletes — systems are not',
        body: 'Self-control draws on a limited cognitive resource that depletes with use. Decision fatigue is real — by evening, your capacity for disciplined choices is measurably lower than in the morning. This is not a character weakness; it is how the brain conserves energy. Systems — environmental design, pre-decisions, and routines — do not require willpower and therefore do not deplete.',
        takeaway: 'Identify one protocol action you consistently fail to do in the evening. Move it to the morning or pre-decide it the night before. Remove the choice.',
      },
      {
        headline: 'Values clarity reduces mental load',
        body: 'Decision fatigue is amplified by values confusion — when you are not clear on what you are prioritising, every decision requires re-weighing competing options from scratch. Clear values act as pre-made decisions. When someone offers you cake at 11pm, "I protect my sleep and digestion" resolves the decision faster than weighing it fresh every time.',
        takeaway: 'Write your top three health values today in one sentence each. Post them somewhere you will see them. Pre-made decisions reduce cognitive load.',
      },
      {
        headline: 'Progress feels slow and is actually fast',
        body: 'Human brains are poor at perceiving gradual change. You cannot see your body or your habits changing day to day, which creates the persistent feeling that nothing is working. The only way to perceive gradual change accurately is through comparison over a longer time frame. This is why tracking and periodic reviews are not motivational tricks — they are cognitive correctives for a genuinely poor default perception system.',
        takeaway: 'Compare yourself to where you were three months ago, not three days ago. Write three specific things that are different. This is the real feedback loop.',
      },
    ],
  },

  // ── Nutrition Foundations: Micronutrients ──────────────────────────────────
  {
    id: 'micronutrients',
    name: 'The Micronutrients That Matter',
    hook: 'This week we go beneath macros — into the vitamins and minerals that make everything else work.',
    cards: [
      {
        headline: 'Micronutrient deficiency is the hidden driver of fatigue',
        body: 'Most chronic fatigue in otherwise healthy women is not caused by low calories or poor sleep alone — it is compounded by micronutrient deficiencies that impair energy metabolism at the cellular level. Iron, vitamin D, magnesium, zinc, and B12 are the most common. Low levels of any one of these produce persistent tiredness that does not respond to more sleep or more caffeine.',
        takeaway: 'If fatigue is a recurring theme for you, request a blood panel this week that includes ferritin, vitamin D, B12, and magnesium RBC. These numbers change everything.',
      },
      {
        headline: 'Iron deficiency affects more than energy',
        body: 'Iron is required for haemoglobin (oxygen transport), thyroid function, immune response, and dopamine production. Women lose iron monthly through menstruation — heavy periods can create an ongoing deficit even with adequate dietary intake. Symptoms of low iron include fatigue, brain fog, cold intolerance, hair loss, and unusually intense cravings for ice or non-food items.',
        takeaway: 'Eat one source of haem iron today (meat, fish) or pair plant-based iron (lentils, spinach) with vitamin C to improve absorption. Avoid tea or coffee within an hour of iron-rich meals.',
      },
      {
        headline: 'Vitamin D is a hormone, not just a vitamin',
        body: 'Vitamin D functions as a hormone — it has receptors in virtually every cell and regulates immune function, mood, muscle strength, insulin sensitivity, and bone density. Deficiency is associated with increased PMS severity, increased risk of autoimmune conditions, reduced strength gains, and lower mood. Most people in northern latitudes are deficient for at least six months per year without supplementation.',
        takeaway: 'If you are not supplementing vitamin D (1000–4000 IU daily depending on baseline), start today. This is one of the most universally impactful supplements for women in most countries.',
      },
      {
        headline: 'Zinc is your immunity and skin mineral',
        body: 'Zinc supports immune function, wound healing, skin integrity, thyroid function, and is required for over 300 enzymatic processes. Women who use hormonal contraception are at higher risk of zinc depletion. Low zinc is associated with increased acne, poor wound healing, taste and smell changes, and increased susceptibility to infection.',
        takeaway: 'Include zinc-rich foods this week: pumpkin seeds, red meat, chickpeas, cashews, or oysters. A consistent dietary approach is preferable to high-dose supplementation for most women.',
      },
      {
        headline: 'B vitamins are your energy metabolism vitamins',
        body: 'B vitamins — especially B1, B2, B3, B5, B6, and B12 — are co-factors in cellular energy production, neurotransmitter synthesis, and red blood cell production. Vegans and vegetarians are at highest risk of B12 deficiency since it is found primarily in animal products. Stress also depletes B vitamins rapidly.',
        takeaway: 'If you eat a largely plant-based diet, ensure you are supplementing B12 — deficiency can develop over years without noticeable symptoms until neurological effects begin.',
      },
      {
        headline: 'Selenium supports thyroid and antioxidant function',
        body: 'Selenium is essential for the conversion of inactive thyroid hormone (T4) to the active form (T3) — the one that actually drives metabolic rate, body temperature, and energy. It is also the primary co-factor for glutathione — your body\'s master antioxidant. Brazil nuts are an exceptionally rich source: two per day covers your full requirement.',
        takeaway: 'Eat two Brazil nuts today. This is one of the most reliable whole-food micronutrient interventions available and takes approximately three seconds.',
      },
      {
        headline: 'Supplements support but cannot replace food',
        body: 'Isolated nutrients behave differently in the body than nutrients in whole foods — partly because whole foods contain synergistic compounds that improve absorption and partly because the dose in food is more moderate and sustained. Supplements fill gaps; they do not replace the biological complexity of eating real food consistently. The priority is always food first, supplements for documented or high-risk deficiencies.',
        takeaway: 'Review your supplement stack this week. Are you taking anything without knowing why? Identify the two most important and make sure you understand the evidence for them.',
      },
    ],
  },

  // ── Purpose & Meaning ────────────────────────────────────────────────────
  {
    id: 'purpose-meaning',
    name: 'What You\'re Building This For',
    hook: 'This week we go beyond the physical — into what drives lasting change and why it matters beyond looking and feeling better.',
    cards: [
      {
        headline: 'Purpose buffers against cortisol',
        body: 'People who report a strong sense of purpose in life have measurably lower cortisol reactivity, lower systemic inflammation, and better sleep quality than those who report low purpose — regardless of other health behaviours. Meaning does not eliminate stress, but it fundamentally changes the body\'s relationship to it. Purpose is physiology.',
        takeaway: 'Ask yourself one question today: "What am I building this body for?" Write the most honest answer you can. It does not need to be profound.',
      },
      {
        headline: 'Intrinsic motivation outlasts extrinsic motivation every time',
        body: 'Extrinsic motivation — doing something for a result, reward, or to avoid a consequence — produces short-term behaviour change. Intrinsic motivation — doing something because it aligns with your identity and values — produces durable behaviour change. The transition from "I\'m doing this to lose weight" to "I\'m doing this because this is who I am" is the single most important shift in long-term health.',
        takeaway: 'Revisit your original reason for starting this protocol. Has it evolved? Write an updated "why" that describes your current true motivation.',
      },
      {
        headline: 'The quality of your daily experience matters more than the goal',
        body: 'Research on wellbeing shows that people overestimate how much reaching goals improves their daily happiness and underestimate how much the process itself determines quality of life. If your protocol feels like punishment, it will not last. Building a version of healthy living that you actually enjoy — even if it is imperfect — produces better long-term outcomes than a perfect but miserable one.',
        takeaway: 'Identify one thing about your protocol you actually enjoy. That enjoyment is data about what is sustainable. Lean into it.',
      },
      {
        headline: 'Values clarify decisions',
        body: 'When your values are clear, difficult decisions become faster and less exhausting. If you know that health and longevity are priorities, the question "should I skip my walk today?" answers itself almost automatically. Values work as a pre-decision architecture — you make fewer choices from scratch and draw from more reliable internal guidance.',
        takeaway: 'Write your top three values — not what you think they should be, but what actually shows up when you observe your choices. Clarity here is clarifying everywhere.',
      },
      {
        headline: 'Your health is a platform, not a destination',
        body: 'The goal of this protocol is not to arrive at a better body and stop. It is to build a physiological platform capable of holding the life you want — the energy for your relationships, the strength for your ambitions, the clarity for your decisions. Health is a means, not an end. Keeping this distinction clear prevents the plateau that follows "arriving."',
        takeaway: 'Write one thing that a healthier, stronger, more energised version of you would be able to do that you cannot easily do now. That is your real goal.',
      },
      {
        headline: 'Rest is meaningful work',
        body: 'Dominant culture treats rest as a reward for productivity — something you earn after working hard enough. This is physiologically backwards. Rest is when adaptation happens, when the nervous system recovers, when creativity emerges, and when the meaning of your efforts integrates. Rest is not what you do when work is done. It is part of the work.',
        takeaway: 'Schedule one block of genuine rest this week — not entertainment, but true restoration. A walk in nature, a bath, stillness. Treat it with the same seriousness as a workout.',
      },
      {
        headline: 'The version of you on the other side of this is real',
        body: 'The person you are becoming through this protocol — more energised, more confident, more resilient, more in tune with your body — is not hypothetical. She is the natural result of the direction you are already moving. The gap between now and her is not character or potential. It is only time and consistency.',
        takeaway: 'Write a letter to yourself six months from now. Describe who you will be, what you will have built, and what will feel different. Put it somewhere you will find it.',
      },
    ],
  },

  // ── Cold Exposure & Recovery ─────────────────────────────────────────────
  {
    id: 'cold-exposure',
    name: 'Cold, Heat & Recovery',
    hook: 'This week we explore contrast therapy — how controlled cold and heat exposure train your stress response and accelerate recovery.',
    cards: [
      {
        headline: 'Cold exposure is stress training, not wellness theatre',
        body: 'Brief cold exposure — even a 30-second cold shower — triggers a norepinephrine release of 200–300%. Norepinephrine improves focus, elevates mood, and reduces baseline inflammation. With repeated exposure over weeks, your baseline cortisol decreases and your stress recovery speed increases. You become physiologically harder to disturb.',
        takeaway: 'End your shower with 30 seconds of cold water this morning. You do not need to enjoy it. The discomfort is the training.',
      },
      {
        headline: 'Cold reduces inflammatory markers',
        body: 'Cold immersion or cold showers after exercise reduce circulating inflammatory cytokines, decrease muscle soreness, and accelerate perceived recovery. The optimal protocol for post-exercise recovery is 11–15 minutes in 10–15°C water. This is not about toughness — it is about reducing the inflammation that slows adaptation between sessions.',
        takeaway: 'After your next strength session, try a cold shower or cold bath for at least 5 minutes. Notice the difference in how you feel 2 hours later.',
      },
      {
        headline: 'Heat exposure supports cardiovascular health',
        body: 'Regular sauna use (15–30 minutes, 80–100°C) produces cardiovascular adaptations similar to moderate aerobic exercise — improved cardiac output, lower resting heart rate, and reduced blood pressure. Finnish research shows that 4–7 sauna sessions per week are associated with a 40% reduction in all-cause mortality. Heat is not just relaxation; it is a cardiovascular training tool.',
        takeaway: 'If you have access to a sauna, use it this week. If not, a very hot bath produces similar — though less intense — cardiovascular effects.',
      },
      {
        headline: 'Sleep after sauna is measurably deeper',
        body: 'Your core body temperature needs to drop to initiate sleep. After a sauna or hot bath, your body undergoes a rapid post-heat temperature drop — which mimics and accelerates the natural sleep-onset temperature decline. Taking a hot bath or using a sauna 60–90 minutes before bed consistently improves both sleep onset speed and deep sleep duration.',
        takeaway: 'Take a hot bath 90 minutes before bed tonight and observe whether you fall asleep faster and feel more rested in the morning.',
      },
      {
        headline: 'Your breath controls your cold response',
        body: 'The distress response to cold exposure is mediated largely through the breath — gasping, rapid breathing, and tension amplify the cold stress. Slow, controlled breathing — especially extended exhales — activate the parasympathetic system and rapidly reduce the perceived intensity of cold. This is the Wim Hof principle in practice: breath control transforms cold from threat to manageable challenge.',
        takeaway: 'During cold exposure today, focus on slow exhales. Breathe out for twice as long as you breathe in. Notice how quickly the intensity becomes manageable.',
      },
      {
        headline: 'Contrast therapy combines both benefits',
        body: 'Alternating hot and cold exposure — hot shower then cold, or sauna then cold plunge — creates a vascular pumping effect as blood vessels repeatedly dilate and constrict. This produces more rapid waste clearance, improved lymph flow, and a combined neuroendocrine response including both norepinephrine and growth hormone release. Contrast therapy is the recovery tool used by elite athletes for exactly this reason.',
        takeaway: 'Try one round of contrast today: 3 minutes hot, 30–60 seconds cold, repeated twice. This takes 8 minutes and produces measurable recovery benefits.',
      },
      {
        headline: 'Recovery is where your results live',
        body: 'Training, nutrition, and sleep create the conditions for change. Recovery protocols — cold, heat, breath, rest, mobility — determine how fully your body utilises those inputs. People who train consistently but recover poorly plateau faster and feel worse doing it. Recovery is not what you do when you cannot train. It is the other half of training.',
        takeaway: 'Schedule one recovery session this week with the same intentionality as a workout: mark it in your calendar, prepare what you need, and protect the time.',
      },
    ],
  },

  // ── Skin & Inflammation ──────────────────────────────────────────────────
  {
    id: 'skin-inside-out',
    name: 'Skin From the Inside Out',
    hook: 'This week we look at your skin — not as a surface to treat, but as a reflection of what is happening internally.',
    cards: [
      {
        headline: 'Your skin is a window into your gut',
        body: 'The gut-skin axis is a well-documented communication pathway. Inflammation in the gut leaks compounds into the bloodstream that trigger inflammatory responses in the skin — acne, eczema, rosacea, and dullness are all frequently downstream of gut dysbiosis. Treating these conditions topically while ignoring gut health is addressing the symptom, not the cause.',
        takeaway: 'This week, add one fermented food or high-fiber food daily and observe whether you notice any changes in your skin over the following two to three weeks.',
      },
      {
        headline: 'Cortisol breaks down collagen',
        body: 'Chronic stress elevates cortisol, which directly inhibits collagen synthesis and accelerates collagen breakdown. This is why high-stress periods often produce dullness, loss of firmness, and increased fine lines — not just because of less sleep and worse food choices, but because cortisol is actively dismantling your skin\'s structure.',
        takeaway: 'Managing your stress response is skincare. Every breathing exercise, good night\'s sleep, and rest day is directly protecting your collagen.',
      },
      {
        headline: 'Sugar ages your skin through glycation',
        body: 'Glycation is a process where excess blood sugar binds to collagen and elastin fibres, making them stiff and brittle. This produces a loss of elasticity and an increase in fine lines that topical products cannot reverse. High glycaemic diets — frequent spikes from refined carbohydrates and sugar — accelerate this process visibly over time.',
        takeaway: 'Reduce your sugar intake for the rest of this week and eat protein or fat before any high-carbohydrate food. This blunts the blood sugar spike that drives glycation.',
      },
      {
        headline: 'Hydration affects your skin differently than you think',
        body: 'Drinking water does not directly hydrate your skin from the inside — it supports kidney function and waste clearance. What does directly affect skin hydration is omega-3 fatty acids, which support the lipid barrier that holds moisture in. Skin that loses water easily is often short on omega-3s, not just water intake.',
        takeaway: 'Add a source of omega-3 today: fatty fish, walnuts, flaxseed, or an omega-3 supplement. Your skin barrier uses these lipids to retain moisture.',
      },
      {
        headline: 'Your cycle changes your skin week by week',
        body: 'Estrogen in the follicular phase produces the plumpest, clearest skin of your cycle. Ovulation brings a temporary glow. The luteal phase increases sebum production as progesterone rises, making breakouts more likely in the two weeks before your period. This is normal — and it means your skincare can be adapted phase by phase rather than being static.',
        takeaway: 'Note where you are in your cycle and adjust your skincare accordingly. Lighter moisturisers and more targeted spot treatment in luteal; richer, more nourishing products in follicular and menstruation.',
      },
      {
        headline: 'SPF is your single most effective anti-ageing tool',
        body: 'UV radiation is responsible for approximately 80% of visible skin ageing — far more than any other factor including genetics. Daily SPF 30 or above prevents this damage regardless of skin tone. No serum, supplement, or treatment produces results comparable to consistent daily sun protection. Everything else is secondary.',
        takeaway: 'If you are not wearing SPF every morning, start today. This single habit has more impact on your skin at 50 than any product you will ever buy.',
      },
      {
        headline: 'Consistency beats complexity in skincare',
        body: 'The skincare industry profits from complexity. The evidence favours simplicity: a gentle cleanser, SPF in the morning, a vitamin A derivative at night, and consistent sleep and hydration outperform any elaborate routine. Introducing too many active ingredients too fast disrupts the skin barrier and causes more problems than it solves.',
        takeaway: 'Simplify your routine this week to the three non-negotiables: cleanse, protect, and sleep. Add back complexity only once your baseline is consistent.',
      },
    ],
  },
];

// ── Theme selection ─────────────────────────────────────────────────────────

const PHASE_CYCLE_THEME_MAP: Record<number, Record<string, string[]>> = {
  1: {
    'Follicular':    ['everything-water', 'gut-foundation', 'cycle-awareness'],
    'Ovulation':     ['everything-water', 'stress-nervous-system', 'cycle-awareness'],
    'Early luteal':  ['gut-foundation', 'sleep-environment', 'cycle-awareness'],
    'Late luteal':   ['sleep-environment', 'gut-foundation', 'cycle-awareness'],
    'Menstruation':  ['gut-foundation', 'everything-water', 'cycle-awareness'],
    'Not sure':      ['everything-water', 'sleep-environment', 'gut-foundation'],
  },
  2: {
    'Follicular':    ['protein-foundations', 'strength-foundations', 'cycle-awareness'],
    'Ovulation':     ['strength-foundations', 'protein-foundations', 'cycle-awareness'],
    'Early luteal':  ['protein-foundations', 'stress-nervous-system', 'cycle-awareness'],
    'Late luteal':   ['stress-nervous-system', 'sleep-environment', 'cycle-awareness'],
    'Menstruation':  ['sleep-environment', 'protein-foundations', 'cycle-awareness'],
    'Not sure':      ['protein-foundations', 'strength-foundations', 'stress-nervous-system'],
  },
  3: {
    'Follicular':    ['strength-foundations', 'skin-inside-out', 'cycle-awareness'],
    'Ovulation':     ['strength-foundations', 'body-composition', 'cycle-awareness'],
    'Early luteal':  ['skin-inside-out', 'hormone-foundations', 'cycle-awareness'],
    'Late luteal':   ['stress-nervous-system', 'joints-longevity', 'cycle-awareness'],
    'Menstruation':  ['your-space', 'sleep-depth', 'cycle-awareness'],
    'Not sure':      ['strength-foundations', 'hormone-foundations', 'joints-longevity'],
  },
  4: {
    'Follicular':    ['confidence-identity', 'growth-mindset', 'cycle-awareness'],
    'Ovulation':     ['confidence-identity', 'relationships-energy', 'cycle-awareness'],
    'Early luteal':  ['stress-nervous-system', 'cold-exposure', 'cycle-awareness'],
    'Late luteal':   ['growth-mindset', 'sleep-depth', 'cycle-awareness'],
    'Menstruation':  ['purpose-meaning', 'your-space', 'cycle-awareness'],
    'Not sure':      ['confidence-identity', 'stress-nervous-system', 'growth-mindset'],
  },
  5: {
    'Follicular':    ['purpose-meaning', 'micronutrients', 'cycle-awareness'],
    'Ovulation':     ['relationships-energy', 'body-composition', 'cycle-awareness'],
    'Early luteal':  ['joints-longevity', 'cold-exposure', 'cycle-awareness'],
    'Late luteal':   ['sleep-depth', 'stress-nervous-system', 'cycle-awareness'],
    'Menstruation':  ['purpose-meaning', 'micronutrients', 'cycle-awareness'],
    'Not sure':      ['joints-longevity', 'micronutrients', 'purpose-meaning'],
  },
  6: {
    'Follicular':    ['purpose-meaning', 'confidence-identity', 'cycle-awareness'],
    'Ovulation':     ['relationships-energy', 'growth-mindset', 'cycle-awareness'],
    'Early luteal':  ['cold-exposure', 'joints-longevity', 'cycle-awareness'],
    'Late luteal':   ['sleep-depth', 'purpose-meaning', 'cycle-awareness'],
    'Menstruation':  ['purpose-meaning', 'your-space', 'cycle-awareness'],
    'Not sure':      ['purpose-meaning', 'confidence-identity', 'relationships-energy'],
  },
};

export function getWeeklyFocus(
  phase: number,
  cyclePhaseName: string,
  protocolWeek: number,
): { theme: WeeklyTheme; card: DailyCard; weekNumber: number } {
  const phaseMap = PHASE_CYCLE_THEME_MAP[phase] ?? PHASE_CYCLE_THEME_MAP[1];

  // Normalise cycle phase name to match map keys
  const cycleKey = Object.keys(phaseMap).find(
    (k) => k.toLowerCase() === cyclePhaseName.toLowerCase()
  ) ?? 'Not sure';

  const themeIds = phaseMap[cycleKey] ?? phaseMap['Not sure'];

  // Rotate through the available themes as protocol weeks progress
  const themeId = themeIds[protocolWeek % themeIds.length];
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // Pick today's card by day-of-week (0 Sun – 6 Sat)
  const dayIndex = new Date().getDay();
  const card = theme.cards[dayIndex] ?? theme.cards[0];

  return { theme, card, weekNumber: protocolWeek + 1 };
}

export function protocolWeekFromSaveCount(saveCount: number): number {
  return Math.floor(Math.max(0, saveCount) / 7);
}
