import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface FoodEntry {
  meal_type: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
}

interface FoodSnapshot {
  entries?: FoodEntry[];
  water_cups?: number;
  hunger_rating?: number | null;
  energy_after_eating?: number | null;
  notes?: string;
}

interface PersonalNote {
  type: "book" | "goal" | "task" | "other";
  text: string;
  mentioned_at: string;
}

interface QuestDef {
  id: string;
  title: string;
  description?: string;
}

interface FirstTask {
  shortTitle: string;
  tag: string;
  body: string;
}

// A logged action Camryn extracts from the user's message
export interface LogAction {
  type: "water" | "food" | "sleep" | "exercise" | "supplement" | "mood" | "weight";
  // water: amount_ml
  // food: meal_type, description, calories?, protein_g?, carbs_g?, fat_g?
  // sleep: hours, quality? (1-5)
  // exercise: activity, duration_minutes?, notes?
  // supplement: name
  // mood: note (freeform)
  // weight: value_kg
  [key: string]: any;
}

// An article/resource link Camryn shares
export interface SharedLink {
  url: string;
  label: string;  // short display text
  reason: string; // 1-sentence "this will help X make more sense"
}

interface VitalsSnapshot {
  today?: {
    resting_hr?: number | null;
    hrv_ms?: number | null;
    sleep_hours?: number | null;
    steps?: number | null;
  };
  avg7?: {
    resting_hr?: number | null;
    hrv_ms?: number | null;
    sleep_hours?: number | null;
  };
  hrv_deviation_pct?: number | null;
  days_logged: number;
}

interface LovesItem {
  category: string;
  title: string;
  note: string;
}

interface JournalRequest {
  userText: string;
  cyclePhase: string;
  protocolPhase: number;
  energy: string;
  bodySnapshot: Record<string, any>;
  confidenceSnapshot: Record<string, any>;
  masterySnapshot: Record<string, any>;
  foodSnapshot?: FoodSnapshot;
  intentionalAction?: string;
  history?: ConversationTurn[];
  userName?: string | null;
  personalNotes?: PersonalNote[];
  phaseQuests?: QuestDef[];
  firstTask?: FirstTask | null;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  hourOfDay?: number;
  isNightMode?: boolean;
  lastWinddown?: string | null;
  vitalsSnapshot?: VitalsSnapshot | null;
  recentContext?: string[];
  reactionSummary?: { helpful: number; not_quite: number; recentNotQuite: string[] } | null;
  lovesSnapshot?: LovesItem[];
}

interface JournalResponse {
  reply: string;
  fallback?: boolean;
  extractedNotes?: PersonalNote[];
  winddownSummary?: string | null;
  recognizedQuests?: string[];
  logActions?: LogAction[];
  sharedLinks?: SharedLink[];
  assignedTask?: string | null;
}

function buildSystemPrompt(
  userName?: string | null,
  personalNotes?: PersonalNote[],
  isNightMode?: boolean,
  lastWinddown?: string | null,
  timeOfDay?: string,
  phaseQuests?: QuestDef[],
  firstTask?: FirstTask | null,
  lovesSnapshot?: LovesItem[]
): string {
  const nameNote = userName
    ? ` The user's name is ${userName} — use it occasionally (not every message) to keep things warm.`
    : "";

  let memoryBlock = "";
  if (personalNotes && personalNotes.length > 0) {
    const noteLines = personalNotes
      .slice(-8)
      .map((n) => {
        const when = n.mentioned_at
          ? new Date(n.mentioned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "recently";
        return `- ${n.type === "book" ? "Reading" : n.type === "goal" ? "Goal" : n.type === "task" ? "Working on" : "Note"}: "${n.text}" (mentioned ${when})`;
      })
      .join("\n");
    memoryBlock = `\n\nThings you remember about this person:\n${noteLines}\n\nIf they haven't mentioned one of these for a while and the current message is relevant, ask a natural follow-up — e.g. "How's that book going?" Do this occasionally, not every message.`;
  }

  let questBlock = "";
  if (phaseQuests && phaseQuests.length > 0) {
    const questLines = phaseQuests.map((q) => {
      const descStr = q.description ? ` (matches: ${q.description})` : "";
      return `  - id: "${q.id}", habit: "${q.title}"${descStr}`;
    }).join("\n");
    questBlock = `\n\nCurrent phase habit quests (do NOT recite this list):\n${questLines}\n\nWhen the user mentions doing something matching one of these, acknowledge it briefly ("Sounds like you got your morning hydration in — that counts."). Then output <mastery>["quest-id"]</mastery> after your reply with IDs you're confident were completed. Output <mastery>[]</mastery> if nothing matches. Be conservative.`;
  }

  let lovesBlock = "";
  if (lovesSnapshot && lovesSnapshot.length > 0) {
    const loveLines = lovesSnapshot
      .slice(0, 30)
      .map((item) => {
        const noteStr = item.note ? ` — "${item.note}"` : "";
        return `  - [${item.category}] ${item.title}${noteStr}`;
      })
      .join("\n");
    lovesBlock = `\n\nThings she loves (from her personal collection — use this to personalise suggestions and notice connections):\n${loveLines}\n\nDon't recite this list. Use it to make the protocol feel personal: if a food she loves fits the phase, name it. If she mentions something that's already in this list, notice it. If she shares something new that fits the pattern of what she loves, engage with it as relationship-building context.`;
  }

  // Directive task block — the key behavioural shift
  let taskBlock = "";
  if (firstTask) {
    taskBlock = `\n\nTODAY'S ASSIGNMENT: "${firstTask.shortTitle}" (${firstTask.tag})\nContext: ${firstTask.body}\n\nThis is what you're directing her to do today. Lead with it directly — you're the manager here, not a suggester. Give the instruction clearly, then tell her exactly what to report back: what you want to know (amount, how it felt, any notes). Be specific, warm, and certain. Example: "First thing today: drink your water. Come back and tell me how much you had and whether it was hard to get through." Do not hedge, do not say "maybe" or "if you feel like it". She does it, reports back, you log it.`;
  }

  let morningBridge = "";
  if (timeOfDay === "morning" && lastWinddown) {
    morningBridge = `\n\nLast night's wind-down note: "${lastWinddown}"\nBrief natural check-in on how she's feeling this morning given what she shared last night.`;
  }

  // Logging extraction instructions
  const logInstructions = `

LOGGING: When the user's message contains something measurable that should be tracked — water consumed, food eaten, exercise done, supplements taken, sleep hours, mood — extract it into a <log>[...]</log> block after your reply. This is parsed programmatically and logged silently (the user never sees it). Format as a JSON array:

Water example: [{"type":"water","amount_ml":480}]
Food example: [{"type":"food","meal_type":"breakfast","description":"eggs and toast","calories":350,"protein_g":22}]
Exercise example: [{"type":"exercise","activity":"walk","duration_minutes":30}]
Sleep example: [{"type":"sleep","hours":7.5,"quality":3}]
Supplement example: [{"type":"supplement","name":"magnesium"}]
Mood example: [{"type":"mood","note":"feeling anxious, hard to focus"}]

Only extract what was clearly stated by the user in their current message. Do NOT re-extract food or actions that are already in the food snapshot (those are already logged). Omit fields you don't have. Output <log>[]</log> if nothing was logged.

LINKS: When sharing an article, resource, or reading that would genuinely help, output a <links>[...]</links> block after your reply. Only share links when you naturally say "here, read this" or "this is worth a look" in your reply. Format:
[{"url":"https://example.com/article","label":"Why morning hydration matters","reason":"It'll help make sense of why we start here"}]

Only share links you know exist and are genuinely relevant. Use real, well-known sources (pubmed, healthline, well-known wellness publications). Do not make up URLs. If you have nothing to share, output <links>[]</links>.

TASK ASSIGNMENT: When you give the user a specific, concrete action to do today — a "go do this now" directive, not a recap or a habit reminder — output <task>Short task title</task> after your reply. Plain text only, 8 words max, written as an action ("Drink your morning water", "Do your 5-minute breathwork"). Only output this when you are actively pushing (not holding space). Output it at most once per response. Omit it entirely if you are reflecting, checking in, or not assigning a concrete action.`;

  if (isNightMode) {
    return `You are Camryn — a calm, warm companion managing this person through a year-long wellness protocol. It is night-time.${nameNote}${memoryBlock}${lovesBlock}${questBlock}${morningBridge}

Tonight you're closing the day. Reflect, don't plan.

Night-time guidelines:
- 2–3 short paragraphs max.
- Quieter and more reflective than during the day — less action, more presence.
- Do NOT suggest new tasks unless she asks.
- Gently recap what she logged today as soft acknowledgement — "You got your hydration in."
- Ask one reflective question to help her close the day — about how it felt, not what's next.
- End with warmth. No action items.
- Do NOT open with a greeting — jump straight in.
${logInstructions}

After your reply: <extract>[personal notes array]</extract> then <winddown>1–2 sentence summary of her emotional state tonight</winddown> then <log>[...]</log> then <links>[...]</links>.`;
  }

  return `You are Camryn — the manager of this person's year-long wellness protocol. You direct, she executes, you log it for her. She doesn't manage the app — you do.${nameNote}${memoryBlock}${lovesBlock}${questBlock}${taskBlock}${morningBridge}

Your job is to run her day. You tell her what to do next, she comes back and reports, you acknowledge it, log it silently, and give her the next thing. Over a year she'll complete the protocol through this conversation — she never has to think about what's next.

This person has OCD with a tendency to ruminate. Keep this in mind:
- If she's caught in a loop — replaying something, catastrophising, seeking reassurance — gently name it without labelling. Interrupt with presence, not engagement.
- When you sense rumination, ask a grounding question that pulls her into the body or the immediate moment.
- Your most powerful tool: "What's something you've done lately that actually fed you — not the protocol, just something for your soul?" Use it when she seems stuck or depleted.
- Never reinforce a loop by engaging with its content. Redirect to what's real and present.
- Reassurance-seeking is part of OCD — if she's asking you to confirm something repeatedly, note gently that reassurance won't resolve it, and bring her back to the body.

WHEN TO PUSH vs. WHEN TO HOLD SPACE — read her message carefully before deciding:

Hold space (ask one grounding question, don't direct):
- Short or fragmented messages: "I don't know", "just tired", "feeling off" — she's not ready for direction, she needs to feel heard first.
- Emotionally flooded messages: long venting, multiple problems at once, crying-type language — reflect one thing back, ask what she needs right now.
- Messages that feel like they're waiting for permission: "is it okay that I…", "do you think I should…" — validate first, then gently redirect if it's reassurance-seeking.
- After a hard day where she didn't meet the protocol — don't lead with the miss. Lead with presence. One question. Then, only if she seems ready, the next step.

Push (give the next concrete direction):
- She reports completing something: "I drank my water", "I went for a walk" — confirm it, log it, and give the next specific thing immediately.
- She's asking what to do next: "what should I focus on?", "what's today?" — she's ready. Give the task directly and specifically.
- She seems energised or in a good phase (Follicular, Ovulation, early Luteal, good HRV) — match her energy, give her something worth doing.
- Multiple days of good reporting — she's in a rhythm. You can stretch the ask slightly.

The mistake to avoid: pushing direction at someone who hasn't been heard yet. If you sense she's in a hard emotional space, one wrong directive will make the protocol feel like another demand. Earn the direction with a moment of presence first.

NOTICING THE HUMAN IN THE MESSAGE — this is critical and often missed:
When her message contains a personal detail beyond the protocol report — a book she's reading, music she was listening to, something funny, a passing observation, something she noticed — STOP AND ENGAGE WITH IT before moving to the task.

Examples of moments you must not skip over:
- "I went for a walk and I was listening to a spicy book" → ask about the book. What is it? Is it good? Is it helping her zone out or is she secretly obsessed? This is relationship-building gold AND potentially useful context (what she reads when she unwinds tells you something real about her).
- "I had my smoothie, made it with that coconut thing I tried" → "Wait, what coconut thing?" — small details like this invite her in.
- "Did my morning routine but I was kind of distracted" → what distracted her? Don't skip it to get to the next task.

The rule: if her message has a protocol report AND a personal detail, acknowledge the detail with genuine curiosity FIRST, then pivot briefly to the protocol. Never let the task direction eat the human moment. These small exchanges build the relationship that makes the protocol sustainable for a year.

After engaging with the detail, extract it into <extract> for future memory. Books, shows she mentions, music, things she's working on, funny moments — all of it is relationship context you'll use later.

Conversation guidelines:
- 2–3 short paragraphs max.
- Sound like a warm, perceptive friend who knows her well — not a health coach.
- Never diagnose, prescribe, or give medical advice.
- NEVER open with a greeting — the UI already did that. Start with substance.
- When she reports back on a task, confirm it warmly and then give her the next specific thing to do.
- Be direct and certain. You're managing her, not suggesting. "Drink your water" not "you might want to try drinking water."
- Occasionally share a link when something genuinely relevant exists — say "here, read this — [label]" in your reply text when sharing.
- When she's done something well, tell her. When she's skipped something, be honest but not harsh.
- Use "you" not "one". Be specific to what she's shared.
- If food data is present, briefly confirm it in one sentence: "I can see you've logged breakfast — 45g protein so far."
${logInstructions}

After your reply: <extract>[personal notes array]</extract> then <mastery>[quest ids]</mastery> then <log>[...]</log> then <links>[...]</links> then <task>title if assigning one</task>.`;
}

const PHASE_PROFILES: Record<number, { name: string; weeks: string; tone: string; focus: string[] }> = {
  1: { name: "Foundation", weeks: "1–6",   tone: "Gentle, consistent, building safety in the body.", focus: ["Sleep", "Gut Health", "Hydration", "Stress regulation"] },
  2: { name: "Ignition",   weeks: "7–12",  tone: "Active, momentum-building, visible traction beginning.", focus: ["Protein & Nutrition", "Movement & Strength", "Skin & Hair"] },
  3: { name: "Build",      weeks: "13–22", tone: "Deepening, stronger, body adapting to standards.", focus: ["Body Composition", "Hormone Balance", "Joint Health"] },
  4: { name: "Integrate",  weeks: "23–32", tone: "Consolidating, inward, making the external internal.", focus: ["Confidence & Identity", "Stress Mastery", "Relationships & Environment"] },
  5: { name: "Sustain",    weeks: "33–44", tone: "Settled, resilient, building for decades not weeks.", focus: ["Purpose & Meaning", "Longevity", "Resilient Protocol Design"] },
  6: { name: "Thrive",     weeks: "45–52", tone: "Expansive, generous, living the protocol as identity.", focus: ["Full Integration", "Expansion & Sharing", "Arc 2 Foundation"] },
};

const CYCLE_ACTIONS: Record<string, string> = {
  Follicular: "Rising estrogen improves neuroplasticity — best window for new habits, learning, and challenge.",
  Ovulation: "Peak estrogen + testosterone = highest performance, confidence, and output window.",
  "Early luteal": "Progesterone supports steady focus — best for consistent effort and deep concentrated work.",
  "Late luteal": "Lowest stress tolerance — honour lower demands, prioritise magnesium, sleep, and warmth.",
  Menstruation: "Both hormones at baseline — rest, warmth, iron-rich foods, and gentle movement are the protocol.",
  "Not sure": "Phase protocol and energy level are primary guides — consistency on both produces strong results.",
};

function buildCamrynContext(protocolPhase: number, cyclePhase: string, energy: string): string {
  const profile = PHASE_PROFILES[protocolPhase] ?? PHASE_PROFILES[1];
  const cycleAction = CYCLE_ACTIONS[cyclePhase] ?? CYCLE_ACTIONS["Not sure"];
  return [
    `Protocol context: Phase ${protocolPhase} — ${profile.name} (weeks ${profile.weeks})`,
    `Phase tone: ${profile.tone}`,
    `Phase focus areas: ${profile.focus.join(", ")}`,
    `Cycle phase guidance (${cyclePhase}): ${cycleAction}`,
    `Energy level: ${energy}`,
  ].join("\n");
}

function buildContextBlock(req: JournalRequest): string {
  const lines: string[] = [];

  if (req.timeOfDay) {
    lines.push(req.isNightMode
      ? `It is night-time (${req.timeOfDay}).`
      : `Time of day: ${req.timeOfDay}.`);
  }

  lines.push(buildCamrynContext(req.protocolPhase, req.cyclePhase, req.energy));
  lines.push("");
  lines.push("Today's data:");

  if (req.cyclePhase && req.cyclePhase !== "Not sure") {
    lines.push(`- Cycle phase: ${req.cyclePhase}`);
  }
  lines.push(`- Protocol phase: ${req.protocolPhase}`);
  if (req.energy) lines.push(`- Session energy: ${req.energy}`);

  if (req.bodySnapshot && Object.keys(req.bodySnapshot).length > 0) {
    const b = req.bodySnapshot;
    if (b.energy != null) lines.push(`- Body energy score: ${b.energy}/5`);
    if (b.symptoms) lines.push(`- Symptoms noted: ${b.symptoms}`);
    if (b.cycle_status) lines.push(`- Cycle status: ${b.cycle_status}`);
    const vitsTaken = b.vitamins
      ? Object.entries(b.vitamins as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ")
      : "";
    if (vitsTaken) lines.push(`- Vitamins taken: ${vitsTaken}`);
  }

  if (req.confidenceSnapshot?.confidence_note) {
    lines.push(`- Confidence note: ${req.confidenceSnapshot.confidence_note}`);
  }

  if (req.masterySnapshot) {
    const streaks = Object.entries(req.masterySnapshot as Record<string, number>)
      .map(([k, v]) => `${k}: ${v} day streak`)
      .join(", ");
    if (streaks) lines.push(`- Active streaks: ${streaks}`);
  }

  if (req.foodSnapshot) {
    const f = req.foodSnapshot;
    const mealEntries = f.entries ?? [];
    if (mealEntries.length > 0) {
      const mealSummary = mealEntries
        .map((e) => {
          const parts: string[] = [];
          if (e.calories != null) parts.push(`${e.calories} kcal`);
          if (e.protein_g != null) parts.push(`${e.protein_g}g protein`);
          if (e.carbs_g != null) parts.push(`${e.carbs_g}g carbs`);
          if (e.fat_g != null) parts.push(`${e.fat_g}g fat`);
          if (e.fiber_g != null) parts.push(`${e.fiber_g}g fiber`);
          const macroStr = parts.length > 0 ? ` (${parts.join(", ")})` : "";
          return `${e.meal_type}: ${e.description}${macroStr}`;
        })
        .join("; ");
      lines.push(`- Food logged: ${mealSummary}`);

      const totals = mealEntries.reduce(
        (acc, e) => ({
          calories: acc.calories + (e.calories ?? 0),
          protein: acc.protein + (e.protein_g ?? 0),
          carbs: acc.carbs + (e.carbs_g ?? 0),
          fat: acc.fat + (e.fat_g ?? 0),
          fiber: acc.fiber + (e.fiber_g ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );
      const totalParts: string[] = [];
      if (totals.calories > 0) totalParts.push(`${Math.round(totals.calories)} kcal`);
      if (totals.protein > 0) totalParts.push(`${Math.round(totals.protein)}g protein`);
      if (totals.carbs > 0) totalParts.push(`${Math.round(totals.carbs)}g carbs`);
      if (totals.fat > 0) totalParts.push(`${Math.round(totals.fat)}g fat`);
      if (totals.fiber > 0) totalParts.push(`${Math.round(totals.fiber)}g fiber`);
      if (totalParts.length > 0) lines.push(`- Daily totals so far: ${totalParts.join(", ")}`);
    }
    if (f.water_cups && f.water_cups > 0) {
      lines.push(`- Water intake: ${f.water_cups} cup${f.water_cups !== 1 ? "s" : ""} (${Math.round(f.water_cups * 240)}ml)`);
    }
    if (f.hunger_rating != null) lines.push(`- Hunger/satiety rating: ${f.hunger_rating}/5`);
    if (f.energy_after_eating != null) lines.push(`- Post-meal energy: ${f.energy_after_eating}/5`);
    if (f.notes) lines.push(`- Food note: ${f.notes}`);
  }

  if (req.intentionalAction && !req.isNightMode) {
    lines.push(`- Today's intentional action (${req.cyclePhase} phase): "${req.intentionalAction}"`);
  }

  if (req.vitalsSnapshot) {
    const v = req.vitalsSnapshot;
    const daysLogged = v.days_logged ?? 0;

    if (daysLogged === 0) {
      // No data yet — don't add anything
    } else if (daysLogged < 7) {
      lines.push("");
      lines.push(`Apple Watch data (day ${daysLogged} of calibration — still watching, no baseline yet):`);
      if (v.today?.resting_hr != null) lines.push(`- Resting HR today: ${v.today.resting_hr} bpm`);
      if (v.today?.hrv_ms != null) lines.push(`- HRV today: ${v.today.hrv_ms} ms`);
      if (v.today?.sleep_hours != null) lines.push(`- Sleep last night: ${v.today.sleep_hours.toFixed(1)} hours`);
      if (v.today?.steps != null) lines.push(`- Steps yesterday: ${v.today.steps.toLocaleString()}`);
      lines.push("NOTE TO CAMRYN: You can see these numbers but do not have a personal baseline yet. Acknowledge the data is coming in but do not make strong claims about whether values are high or low. Day 7 is when you can start reading resting HR and sleep; day 14 is when HRV becomes meaningful.");
    } else if (daysLogged < 14) {
      lines.push("");
      lines.push(`Apple Watch data (${daysLogged} days logged — resting HR and sleep are readable, HRV baseline still forming):`);
      if (v.today?.resting_hr != null) lines.push(`- Resting HR today: ${v.today.resting_hr} bpm`);
      if (v.avg7?.resting_hr != null) lines.push(`- 7-day avg resting HR: ${v.avg7.resting_hr} bpm`);
      if (v.today?.hrv_ms != null) lines.push(`- HRV today: ${v.today.hrv_ms} ms (baseline still forming)`);
      if (v.today?.sleep_hours != null) lines.push(`- Sleep last night: ${v.today.sleep_hours.toFixed(1)} hours`);
      if (v.avg7?.sleep_hours != null) lines.push(`- 7-day avg sleep: ${v.avg7.sleep_hours.toFixed(1)} hours`);
      if (v.today?.steps != null) lines.push(`- Steps yesterday: ${v.today.steps.toLocaleString()}`);
      lines.push("NOTE TO CAMRYN: You can reference resting HR and sleep relative to 7-day average. Do not make strong claims about HRV yet — it needs 14 days for a personal baseline. Day 14 unlocks HRV deviation analysis.");
    } else if (daysLogged < 28) {
      lines.push("");
      lines.push(`Apple Watch data (${daysLogged} days logged — full baseline established):`);
      if (v.today?.resting_hr != null) lines.push(`- Resting HR today: ${v.today.resting_hr} bpm${v.avg7?.resting_hr != null ? ` (7-day avg: ${v.avg7.resting_hr} bpm)` : ""}`);
      if (v.today?.hrv_ms != null) {
        const hrvLine = `- HRV today: ${v.today.hrv_ms} ms${v.avg7?.hrv_ms != null ? ` (7-day avg: ${v.avg7.hrv_ms} ms)` : ""}`;
        const deviation = v.hrv_deviation_pct;
        if (deviation != null) {
          const sign = deviation >= 0 ? "+" : "";
          lines.push(`${hrvLine} — ${sign}${deviation}% from baseline`);
        } else {
          lines.push(hrvLine);
        }
      }
      if (v.today?.sleep_hours != null) lines.push(`- Sleep last night: ${v.today.sleep_hours.toFixed(1)} hours${v.avg7?.sleep_hours != null ? ` (7-day avg: ${v.avg7.sleep_hours.toFixed(1)} hrs)` : ""}`);
      if (v.today?.steps != null) lines.push(`- Steps yesterday: ${v.today.steps.toLocaleString()}`);
      if (v.hrv_deviation_pct != null) {
        if (v.hrv_deviation_pct <= -15) {
          lines.push("NOTE TO CAMRYN: HRV is meaningfully below baseline — recovery is compromised today. Treat this as a rest day regardless of what the protocol says. Direct her toward lower intensity, more hydration, and protecting tonight's sleep. Be specific about this.");
        } else if (v.hrv_deviation_pct >= 10) {
          lines.push("NOTE TO CAMRYN: HRV is above baseline — recovery is strong. You can push today's demands with confidence.");
        }
      }
      if (v.today?.sleep_hours != null && v.today.sleep_hours < 6) {
        lines.push("NOTE TO CAMRYN: Sleep was under 6 hours last night. Name this directly — do not ignore it. Reduced demands today are appropriate.");
      }
    } else {
      lines.push("");
      lines.push(`Apple Watch data (${daysLogged} days logged — full cycle-correlated baseline):`);
      if (v.today?.resting_hr != null) lines.push(`- Resting HR today: ${v.today.resting_hr} bpm${v.avg7?.resting_hr != null ? ` (7-day avg: ${v.avg7.resting_hr} bpm)` : ""}`);
      if (v.today?.hrv_ms != null) {
        const hrvLine = `- HRV today: ${v.today.hrv_ms} ms${v.avg7?.hrv_ms != null ? ` (7-day avg: ${v.avg7.hrv_ms} ms)` : ""}`;
        const deviation = v.hrv_deviation_pct;
        if (deviation != null) {
          const sign = deviation >= 0 ? "+" : "";
          lines.push(`${hrvLine} — ${sign}${deviation}% from baseline`);
        } else {
          lines.push(hrvLine);
        }
      }
      if (v.today?.sleep_hours != null) lines.push(`- Sleep last night: ${v.today.sleep_hours.toFixed(1)} hours${v.avg7?.sleep_hours != null ? ` (7-day avg: ${v.avg7.sleep_hours.toFixed(1)} hrs)` : ""}`);
      if (v.today?.steps != null) lines.push(`- Steps yesterday: ${v.today.steps.toLocaleString()}`);
      if (v.hrv_deviation_pct != null) {
        if (v.hrv_deviation_pct <= -15) {
          lines.push(`NOTE TO CAMRYN: HRV is meaningfully below baseline in the ${req.cyclePhase} phase. This combination is important — ${req.cyclePhase === "Late luteal" ? "late luteal already lowers HRV naturally; a further drop means the body needs extra support today" : "the data confirms the body needs recovery today"}. Be direct: lower intensity, protect sleep, extra hydration.`);
        } else if (v.hrv_deviation_pct >= 10) {
          lines.push(`NOTE TO CAMRYN: HRV is above baseline. Recovery is strong. Combined with ${req.cyclePhase} phase, you can push today's protocol with confidence.`);
        }
      }
      if (v.today?.sleep_hours != null && v.today.sleep_hours < 6) {
        lines.push("NOTE TO CAMRYN: Sleep was under 6 hours. Name it directly. Reduced demands today.");
      }
    }
  }

  // Cross-day memory: what she's been saying this week
  if (req.recentContext && req.recentContext.length > 0) {
    lines.push("");
    lines.push("What she's been talking about this week (most recent first — for continuity, not to reference directly unless relevant):");
    for (const msg of req.recentContext) {
      lines.push(`  • "${msg}"`);
    }
  }

  // Reaction feedback: what's been landing vs. not
  if (req.reactionSummary && (req.reactionSummary.helpful + req.reactionSummary.not_quite) > 0) {
    lines.push("");
    const { helpful, not_quite, recentNotQuite } = req.reactionSummary;
    lines.push(`Feedback on your recent responses (last 14 days): ${helpful} marked "landed", ${not_quite} marked "not quite".`);
    if (not_quite > 0 && recentNotQuite.length > 0) {
      lines.push("Responses that didn't land:");
      for (const r of recentNotQuite) {
        lines.push(`  • "${r}"`);
      }
      lines.push("NOTE TO CAMRYN: Study what didn't land. If responses that pushed hard got 'not quite', hold more space today. If reflective responses got 'not quite', she may need more direction. Adjust accordingly.");
    }
  }

  return lines.join("\n");
}

function buildMessages(req: JournalRequest): ConversationTurn[] {
  const contextBlock = buildContextBlock(req);
  const history = req.history ?? [];

  if (history.length === 0) {
    return [
      {
        role: "user",
        content: `${contextBlock}\n\nToday's first message:\n"${req.userText}"`,
      },
    ];
  }

  const messages: ConversationTurn[] = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  messages.push({ role: "user", content: req.userText });
  return messages;
}

function parseTag<T>(rawReply: string, tag: string, parser: (s: string) => T, fallback: T): { reply: string; value: T } {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  const match = re.exec(rawReply);
  const cleanReply = rawReply.replace(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "g"), "").trim();
  if (!match) return { reply: cleanReply, value: fallback };
  try {
    return { reply: cleanReply, value: parser(match[1].trim()) };
  } catch {
    return { reply: cleanReply, value: fallback };
  }
}

function parseExtractedNotes(rawReply: string, today: string): { reply: string; notes: PersonalNote[] } {
  const { reply, value } = parseTag(rawReply, "extract", (s) => {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [] as PersonalNote[];
    return parsed
      .filter((n) => n && typeof n.text === "string" && n.text.trim())
      .map((n) => ({
        type: (["book", "goal", "task", "other"].includes(n.type) ? n.type : "other") as PersonalNote["type"],
        text: String(n.text).trim().slice(0, 200),
        mentioned_at: today,
      }));
  }, [] as PersonalNote[]);
  return { reply, notes: value };
}

function parseWinddownSummary(rawReply: string): { reply: string; winddownSummary: string | null } {
  const { reply, value } = parseTag(rawReply, "winddown", (s) => {
    if (!s || s === "null") return null;
    return s.slice(0, 500);
  }, null);
  return { reply, winddownSummary: value };
}

function parseMasteryIds(rawReply: string): { reply: string; recognizedQuests: string[] } {
  const { reply, value } = parseTag(rawReply, "mastery", (s) => {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [] as string[];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }, [] as string[]);
  return { reply, recognizedQuests: value };
}

function parseLogActions(rawReply: string): { reply: string; logActions: LogAction[] } {
  const { reply, value } = parseTag(rawReply, "log", (s) => {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [] as LogAction[];
    return parsed.filter((x) => x && typeof x.type === "string") as LogAction[];
  }, [] as LogAction[]);
  return { reply, logActions: value };
}

function parseSharedLinks(rawReply: string): { reply: string; sharedLinks: SharedLink[] } {
  const { reply, value } = parseTag(rawReply, "links", (s) => {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [] as SharedLink[];
    return parsed.filter((x) => x && typeof x.url === "string" && typeof x.label === "string") as SharedLink[];
  }, [] as SharedLink[]);
  return { reply, sharedLinks: value };
}

function parseAssignedTask(rawReply: string): { reply: string; assignedTask: string | null } {
  const { reply, value } = parseTag(rawReply, "task", (s) => {
    const trimmed = s.trim().slice(0, 120);
    return trimmed.length > 0 ? trimmed : null;
  }, null);
  return { reply, assignedTask: value };
}

function generateFallbackReply(req: JournalRequest): string {
  if (req.isNightMode) {
    return "It sounds like today had its moments. Whatever it held, you showed up — that's worth something. Rest well tonight.";
  }
  const phaseLines: Record<string, string> = {
    Follicular: "You're in a window that's genuinely good for building new patterns — your brain is more receptive right now.",
    Ovulation: "This is a high-output window for you. Whatever felt strong today, it's worth noting.",
    "Early luteal": "The luteal phase rewards consistency over intensity. Showing up steadily matters more than pushing hard.",
    "Late luteal": "Late luteal asks for gentleness. Protecting your sleep and magnesium now will soften the next few days.",
    Menstruation: "Rest isn't passive during menstruation — it's what allows the next phase to feel strong.",
  };
  return phaseLines[req.cyclePhase] || "Your patterns are worth paying attention to — every entry builds a clearer picture.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: JournalRequest = await req.json();

    if (!body.userText?.trim()) {
      return new Response(JSON.stringify({ error: "userText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({
        reply: generateFallbackReply(body),
        fallback: true,
        extractedNotes: [],
        winddownSummary: null,
        recognizedQuests: [],
        logActions: [],
        sharedLinks: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const messages = buildMessages(body);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 900,
        system: buildSystemPrompt(
          body.userName,
          body.personalNotes,
          body.isNightMode,
          body.lastWinddown,
          body.timeOfDay,
          body.phaseQuests,
          body.firstTask,
          body.lovesSnapshot
        ),
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      return new Response(
        JSON.stringify({ reply: generateFallbackReply(body), fallback: true, extractedNotes: [], winddownSummary: null, recognizedQuests: [], logActions: [], sharedLinks: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let rawReply = data.content?.[0]?.text ?? generateFallbackReply(body);

    // Parse all structured blocks out
    const { reply: r1, recognizedQuests } = parseMasteryIds(rawReply);
    rawReply = r1;

    const { reply: r2, logActions } = parseLogActions(rawReply);
    rawReply = r2;

    const { reply: r3, sharedLinks } = parseSharedLinks(rawReply);
    rawReply = r3;

    const { reply: r4, assignedTask } = parseAssignedTask(rawReply);
    rawReply = r4;

    let winddownSummary: string | null = null;
    if (body.isNightMode) {
      const wd = parseWinddownSummary(rawReply);
      rawReply = wd.reply;
      winddownSummary = wd.winddownSummary;
    }

    const { reply, notes: extractedNotes } = parseExtractedNotes(rawReply, today);

    const result: JournalResponse = { reply, extractedNotes, winddownSummary, recognizedQuests, logActions, sharedLinks, assignedTask };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Journal edge function error:", err);
    return new Response(
      JSON.stringify({
        reply: "Camryn had trouble responding just now, but your entry is saved. Try again in a bit.",
        fallback: true,
        extractedNotes: [],
        winddownSummary: null,
        recognizedQuests: [],
        logActions: [],
        sharedLinks: [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
