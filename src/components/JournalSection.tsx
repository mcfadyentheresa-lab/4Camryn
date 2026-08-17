import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calcStreak, FOUNDATION_QUESTS, PHASE_QUESTS, isTodayCompleted, toggleToday, saveAllMastery, ensureDailyPick, type AllPhaseMastery, type Quest, type MasteryData } from '../lib/mastery';
import { getIntentionalAction } from '../lib/cycleActions';
import CamrynAvatar from './ui/CamrynAvatar';
import type { PersonalNote } from '../App';
import { upsertChatTask } from '../services/camrynSyncService';

interface JournalEntry {
  id: string;
  created_at: string;
  entry_date: string;
  user_text: string;
  camryn_reply: string;
  phase: string;
  protocol_phase: number;
  energy: string;
  body_snapshot: Record<string, any>;
  confidence_snapshot: Record<string, any>;
  mastery_snapshot: Record<string, any>;
  shared_links?: SharedLink[];
  reaction?: 'helpful' | 'not_quite' | null;
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  current_phase: number;
  cycle_phase_name: string;
  energy: string;
}

interface FirstTask {
  shortTitle: string;
  tag: string;
  body: string;
}

interface JournalSectionProps {
  userId: string;
  session: Session;
  focusInput?: boolean;
  displayName?: string | null;
  personalNotes?: PersonalNote[];
  isNightMode?: boolean;
  lastWinddown?: string | null;
  allMastery?: AllPhaseMastery;
  firstTask?: FirstTask | null;
  onNotesUpdate?: (notes: PersonalNote[]) => void;
  onWinddownUpdate?: (summary: string) => void;
  onMasteryUpdate?: (updated: AllPhaseMastery) => void;
}

function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function buildGreeting(name: string | null | undefined, isNightMode: boolean, timeOfDay: string): string {
  const first = name?.split(' ')[0] ?? null;
  const hey = first ? `Hey ${first}.` : 'Hey.';
  if (isNightMode) {
    return `${hey} How did today go?`;
  }
  const greetings: Record<string, string[]> = {
    morning: [
      `${hey} How are you feeling this morning?`,
      `${hey} What's the morning like so far?`,
      `${hey} How did you wake up?`,
    ],
    afternoon: [
      `${hey} How's your day going?`,
      `${hey} What's been on your mind today?`,
      `${hey} How are you holding up today?`,
    ],
    evening: [
      `${hey} How was your day?`,
      `${hey} What's been on your mind this evening?`,
      `${hey} How are you feeling as the day winds down?`,
    ],
    night: [
      `${hey} How did today go?`,
      `${hey} What's on your mind tonight?`,
    ],
  };
  const pool = greetings[timeOfDay] ?? greetings.afternoon;
  return pool[Math.floor(Math.random() * pool.length)];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Strips leading "1. " / "2. " numbered list prefixes from a paragraph
function stripNumberPrefix(text: string): string {
  return text.replace(/^\d+\.\s+/, '');
}

// Renders [text](url) markdown links inside a paragraph as <a> elements
function renderInlineLinks(text: string): React.ReactNode {
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const result: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) result.push(text.slice(last, m.index));
    result.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer" className="camryn-inline-link">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push(text.slice(last));
  return result.length > 0 ? result : text;
}

async function fetchFoodSnapshot(userId: string): Promise<Record<string, any>> {
  const today = new Date().toISOString().split('T')[0];
  const [entriesRes, dailyRes] = await Promise.all([
    supabase
      .from('camryn_food_entries')
      .select('meal_type, description, calories, protein_g, carbs_g, fat_g, fiber_g')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .order('created_at', { ascending: true }),
    supabase
      .from('camryn_food_daily')
      .select('water_cups, hunger_rating, energy_after_eating, notes')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle(),
  ]);
  return {
    entries: entriesRes.data ?? [],
    ...(dailyRes.data ?? {}),
  };
}

async function fetchVitalsSnapshot(userId: string): Promise<Record<string, any> | null> {
  const today = new Date().toISOString().split('T')[0];
  const cutoff14 = new Date();
  cutoff14.setDate(cutoff14.getDate() - 14);
  const cutoff14str = cutoff14.toISOString().split('T')[0];

  const [latestRes, countRes, hrv14Res] = await Promise.all([
    supabase
      .from('camryn_vitals')
      .select('resting_hr, hrv_ms, sleep_hours, steps')
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
      .select('hrv_ms, resting_hr, sleep_hours')
      .eq('user_id', userId)
      .gte('entry_date', cutoff14str)
      .lte('entry_date', today)
      .not('hrv_ms', 'is', null),
  ]);

  const daysLogged = countRes.count ?? 0;
  if (daysLogged === 0) return null;

  const latest = latestRes.data as { resting_hr: number | null; hrv_ms: number | null; sleep_hours: number | null; steps: number | null } | null;
  const rows14 = (hrv14Res.data ?? []) as { hrv_ms: number | null; resting_hr: number | null; sleep_hours: number | null }[];

  const hrv14vals = rows14.map((r) => r.hrv_ms).filter((v): v is number => v != null);
  const hr14vals = rows14.map((r) => r.resting_hr).filter((v): v is number => v != null);
  const sleep14vals = rows14.map((r) => r.sleep_hours).filter((v): v is number => v != null);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const hrv14avg = avg(hrv14vals);
  const hr14avg = avg(hr14vals);
  const sleep14avg = avg(sleep14vals);

  const hrvDeviationPct = latest?.hrv_ms != null && hrv14avg != null && daysLogged >= 14
    ? Math.round(((latest.hrv_ms - hrv14avg) / hrv14avg) * 100)
    : null;

  return {
    today: latest ?? {},
    avg7: { resting_hr: hr14avg != null ? Math.round(hr14avg) : null, hrv_ms: hrv14avg, sleep_hours: sleep14avg },
    hrv_deviation_pct: hrvDeviationPct,
    days_logged: daysLogged,
  };
}


async function fetchRecentContext(userId: string, todayStr: string): Promise<string[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const { data } = await supabase
    .from('camryn_journal')
    .select('user_text, entry_date, created_at')
    .eq('user_id', userId)
    .lt('entry_date', todayStr)
    .gte('entry_date', cutoff.toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .limit(10);
  return ((data ?? []) as { user_text: string }[]).map((r) =>
    r.user_text.length > 160 ? r.user_text.slice(0, 160) + '…' : r.user_text
  );
}

async function fetchLovesSnapshot(userId: string): Promise<{ category: string; title: string; note: string }[]> {
  const { data } = await supabase
    .from('camryn_likes')
    .select('category, title, note')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);
  return ((data ?? []) as { category: string; title: string; note: string }[]);
}

async function fetchReactionSummary(userId: string): Promise<{ helpful: number; not_quite: number; recentNotQuite: string[] }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const { data } = await supabase
    .from('camryn_reactions')
    .select('reaction, journal_entry_id')
    .eq('user_id', userId)
    .gte('created_at', cutoff.toISOString());

  const rows = (data ?? []) as { reaction: string; journal_entry_id: string }[];
  const helpful = rows.filter((r) => r.reaction === 'helpful').length;
  const not_quite = rows.filter((r) => r.reaction === 'not_quite').length;

  // Fetch the Camryn replies for 'not_quite' reactions to pass as context
  const notQuiteIds = rows.filter((r) => r.reaction === 'not_quite').map((r) => r.journal_entry_id).slice(0, 3);
  let recentNotQuite: string[] = [];
  if (notQuiteIds.length > 0) {
    const { data: replies } = await supabase
      .from('camryn_journal')
      .select('camryn_reply')
      .in('id', notQuiteIds);
    recentNotQuite = ((replies ?? []) as { camryn_reply: string }[])
      .map((r) => r.camryn_reply.slice(0, 120) + (r.camryn_reply.length > 120 ? '…' : ''));
  }

  return { helpful, not_quite, recentNotQuite };
}

async function fetchExistingReactions(userId: string, entryIds: string[]): Promise<Record<string, 'helpful' | 'not_quite'>> {
  if (entryIds.length === 0) return {};
  const { data } = await supabase
    .from('camryn_reactions')
    .select('journal_entry_id, reaction')
    .eq('user_id', userId)
    .in('journal_entry_id', entryIds);
  const map: Record<string, 'helpful' | 'not_quite'> = {};
  for (const row of (data ?? []) as { journal_entry_id: string; reaction: string }[]) {
    map[row.journal_entry_id] = row.reaction as 'helpful' | 'not_quite';
  }
  return map;
}

async function fetchBodySnapshot(userId: string): Promise<Record<string, any>> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('camryn_body')
    .select('energy, symptoms, cycle_status, vitamins')
    .eq('user_id', userId)
    .eq('entry_date', today)
    .maybeSingle();
  return data ?? {};
}

async function fetchConfidenceSnapshot(userId: string): Promise<Record<string, any>> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('camryn_confidence')
    .select('confidence_note')
    .eq('user_id', userId)
    .eq('entry_date', today)
    .maybeSingle();
  return data ?? {};
}

interface LogAction {
  type: 'water' | 'food' | 'sleep' | 'exercise' | 'supplement' | 'mood' | 'weight';
  [key: string]: any;
}

interface SharedLink {
  url: string;
  label: string;
  reason: string;
}

async function applyLogActions(userId: string, actions: LogAction[]): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  for (const action of actions) {
    try {
      if (action.type === 'water' && action.amount_ml) {
        const cups = Math.round((action.amount_ml / 240) * 10) / 10;
        const { data: existing } = await supabase
          .from('camryn_food_daily')
          .select('id, water_cups')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .maybeSingle();
        if (existing) {
          await supabase
            .from('camryn_food_daily')
            .update({ water_cups: (existing.water_cups ?? 0) + cups })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('camryn_food_daily')
            .insert([{ user_id: userId, entry_date: today, water_cups: cups }]);
        }
      } else if (action.type === 'food') {
        const desc = (action.description ?? '').trim().toLowerCase();
        if (!desc) continue;
        const { count } = await supabase
          .from('camryn_food_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('entry_date', today)
          .ilike('description', desc);
        if ((count ?? 0) > 0) continue;
        await supabase.from('camryn_food_entries').insert([{
          user_id: userId,
          entry_date: today,
          meal_type: action.meal_type ?? 'snack',
          description: action.description?.trim() ?? '',
          calories: action.calories ?? null,
          protein_g: action.protein_g ?? null,
          carbs_g: action.carbs_g ?? null,
          fat_g: action.fat_g ?? null,
          fiber_g: action.fiber_g ?? null,
        }]);
      } else if (action.type === 'exercise') {
        // exercise_note column does not exist in camryn_body; exercise data
        // is tracked in camryn_exercise via BodySection. No-op here.
        void action;
      } else if (action.type === 'mood') {
        await supabase.from('camryn_confidence').upsert([{
          user_id: userId,
          entry_date: today,
          confidence_note: action.note ?? '',
        }], { onConflict: 'user_id,entry_date', ignoreDuplicates: false });
      }
    } catch {
      // silent — logging failures never block the conversation
    }
  }
}

function buildMasterySnapshot(phaseNumber: number, allMastery?: AllPhaseMastery): Record<string, number> {
  const pKey = `phase${phaseNumber}` as keyof AllPhaseMastery;
  const masteryData: MasteryData | undefined = allMastery?.[pKey];
  if (!masteryData) return {};
  const quests = PHASE_QUESTS[phaseNumber] ?? FOUNDATION_QUESTS;
  const snapshot: Record<string, number> = {};
  for (const q of quests) {
    const qs = masteryData.quests[q.id];
    if (!qs) continue;
    const streak = calcStreak(qs.completedDates, qs.targetDays);
    if (streak > 0) snapshot[q.title] = streak;
  }
  return snapshot;
}

function buildHistory(todayEntries: JournalEntry[]): ConversationTurn[] {
  // Build ordered history from oldest to newest, max last 6 exchanges (12 turns)
  const ordered = [...todayEntries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const recent = ordered.slice(-6);
  const turns: ConversationTurn[] = [];
  for (const e of recent) {
    turns.push({ role: 'user', content: e.user_text });
    if (e.camryn_reply) turns.push({ role: 'assistant', content: e.camryn_reply });
  }
  return turns;
}

// Group entries by date for the list view
function groupByDate(entries: JournalEntry[]): Map<string, JournalEntry[]> {
  const map = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const d = e.entry_date;
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }
  return map;
}

export default function JournalSection({ userId, session, focusInput, displayName, personalNotes = [], isNightMode = false, lastWinddown = null, allMastery, firstTask, onNotesUpdate, onWinddownUpdate, onMasteryUpdate }: JournalSectionProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const [reactions, setReactions] = useState<Record<string, 'helpful' | 'not_quite'>>({});
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  // Chat replies resolve after an await; by then `allMastery` (captured from
  // the render active when the message was sent) can be behind whatever the
  // "today" tab has since done. Read this ref instead of the prop when
  // merging quest completions, so the merge is against the current state.
  const latestAllMasteryRef = useRef(allMastery);
  useEffect(() => {
    latestAllMasteryRef.current = allMastery;
  }, [allMastery]);

  const hourOfDayNow = new Date().getHours();
  const timeOfDayNow = getTimeOfDay(hourOfDayNow);
  const greeting = buildGreeting(displayName, isNightMode, timeOfDayNow);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        setText((prev) => (prev.trim() ? prev + ' ' + transcript.trim() : transcript.trim()));
        // resize textarea
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
          }
        });
      }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.entry_date === today);
  const pastEntries = entries.filter((e) => e.entry_date !== today);

  useEffect(() => {
    loadEntries();
  }, [userId]);

  useEffect(() => {
    if (focusInput && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focusInput]);

  // Jump to bottom instantly on initial load, smooth on new messages
  useEffect(() => {
    if (loadingEntries) return;
    bottomRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, [loadingEntries]);

  useEffect(() => {
    if (loadingEntries) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries.length, sending]);

  const loadEntries = async () => {
    setLoadingEntries(true);
    const { data } = await supabase
      .from('camryn_journal')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100);
    const loaded = (data as JournalEntry[]) ?? [];
    setEntries(loaded);
    if (loaded.length > 0) {
      const ids = loaded.map((e) => e.id);
      const reactionMap = await fetchExistingReactions(userId, ids);
      setReactions(reactionMap);
    }
    setLoadingEntries(false);
  };

  const handleReaction = async (entryId: string, reaction: 'helpful' | 'not_quite') => {
    const existing = reactions[entryId];
    if (existing === reaction) {
      // Toggle off
      await supabase.from('camryn_reactions').delete().eq('user_id', userId).eq('journal_entry_id', entryId);
      setReactions((prev) => { const next = { ...prev }; delete next[entryId]; return next; });
    } else {
      await supabase.from('camryn_reactions').upsert(
        { user_id: userId, journal_entry_id: entryId, reaction },
        { onConflict: 'user_id,journal_entry_id' }
      );
      setReactions((prev) => ({ ...prev, [entryId]: reaction }));
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);

    const phaseQuests: Quest[] = PHASE_QUESTS[session.current_phase] ?? FOUNDATION_QUESTS;

    const [bodySnapshot, confidenceSnapshot, foodSnapshot, intentional, vitalsSnapshot, recentContext, reactionSummary, lovesSnapshot] = await Promise.all([
      fetchBodySnapshot(userId),
      fetchConfidenceSnapshot(userId),
      fetchFoodSnapshot(userId),
      getIntentionalAction(),
      fetchVitalsSnapshot(userId),
      fetchRecentContext(userId, today),
      fetchReactionSummary(userId),
      fetchLovesSnapshot(userId),
    ]);
    const masterySnapshot = buildMasterySnapshot(session.current_phase, allMastery);
    let pendingLinks: SharedLink[] = [];
    const history = buildHistory(todayEntries);

    const hourOfDay = new Date().getHours();
    const timeOfDay = getTimeOfDay(hourOfDay);
    const morningWinddown = timeOfDay === 'morning' ? lastWinddown : null;

    let camrynReply = '';
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/camryn-journal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: trimmed,
          cyclePhase: session.cycle_phase_name,
          protocolPhase: session.current_phase,
          energy: session.energy,
          bodySnapshot,
          confidenceSnapshot,
          masterySnapshot,
          foodSnapshot,
          intentionalAction: intentional?.text ?? '',
          history,
          userName: displayName ?? null,
          personalNotes,
          timeOfDay,
          hourOfDay,
          isNightMode,
          lastWinddown: morningWinddown,
          phaseQuests: phaseQuests.map((q) => ({ id: q.id, title: q.title, description: q.description })),
          firstTask: history.length === 0 && firstTask ? firstTask : null,
          vitalsSnapshot: vitalsSnapshot ?? null,
          recentContext: recentContext.length > 0 ? recentContext : undefined,
          reactionSummary: (reactionSummary.helpful + reactionSummary.not_quite) > 0 ? reactionSummary : undefined,
          lovesSnapshot: lovesSnapshot.length > 0 ? lovesSnapshot : undefined,
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        camrynReply = json.reply ?? '';

        // Silently log anything Camryn extracted from the user's message
        if (Array.isArray(json.logActions) && json.logActions.length > 0) {
          applyLogActions(userId, json.logActions); // fire-and-forget, never blocks chat
        }

        // Push a concrete task to the front door app when Camryn assigns one
        if (typeof json.assignedTask === 'string' && json.assignedTask.trim()) {
          upsertChatTask(userId, json.assignedTask.trim(), session.energy); // fire-and-forget
        }

        // Attach shared links to this entry for rendering
        if (Array.isArray(json.sharedLinks) && json.sharedLinks.length > 0) {
          pendingLinks = json.sharedLinks as SharedLink[];
        }

        // Apply recognized quest completions to mastery. Reads from the ref
        // (not the `allMastery` prop) so this merges against whatever the
        // "today" tab has done since this message was sent, not a snapshot
        // from before the await for Camryn's reply.
        const currentAllMastery = latestAllMasteryRef.current;
        if (
          Array.isArray(json.recognizedQuests) &&
          json.recognizedQuests.length > 0 &&
          currentAllMastery &&
          onMasteryUpdate
        ) {
          const pKey = session.current_phase === 2 ? 'phase2'
            : session.current_phase === 3 ? 'phase3'
            : session.current_phase === 4 ? 'phase4'
            : session.current_phase === 5 ? 'phase5'
            : session.current_phase === 6 ? 'phase6'
            : 'phase1';
          let phaseData = ensureDailyPick(currentAllMastery[pKey as keyof AllPhaseMastery], phaseQuests);
          let changed = false;
          for (const questId of json.recognizedQuests as string[]) {
            const qs = phaseData.quests[questId];
            if (!qs) continue;
            if (isTodayCompleted(qs.completedDates)) continue;
            phaseData = {
              ...phaseData,
              quests: {
                ...phaseData.quests,
                [questId]: { ...qs, completedDates: toggleToday(qs.completedDates) },
              },
            };
            changed = true;
          }
          if (changed) {
            const updated: AllPhaseMastery = { ...currentAllMastery, [pKey]: phaseData };
            onMasteryUpdate(updated);
            saveAllMastery(userId, updated).catch((err) => {
              console.error('[journal] mastery save failed:', err);
            });
          }
        }

        if (isNightMode && json.winddownSummary && onWinddownUpdate) {
          onWinddownUpdate(json.winddownSummary);
        }
        if (Array.isArray(json.extractedNotes) && json.extractedNotes.length > 0 && onNotesUpdate) {
          const existing = new Set(personalNotes.map((n) => n.text.toLowerCase()));
          const fresh = (json.extractedNotes as PersonalNote[]).filter(
            (n) => !existing.has(n.text.toLowerCase())
          );
          if (fresh.length > 0) {
            onNotesUpdate([...personalNotes, ...fresh].slice(-20));
          }
        }
      } else {
        camrynReply = "Camryn had trouble responding just now, but your entry is saved. Try again in a bit.";
      }
    } catch {
      camrynReply = "Camryn had trouble responding just now, but your entry is saved. Try again in a bit.";
    }

    const { data: saved } = await supabase
      .from('camryn_journal')
      .insert([{
        user_id: userId,
        entry_date: today,
        user_text: trimmed,
        camryn_reply: camrynReply,
        phase: session.cycle_phase_name,
        protocol_phase: session.current_phase,
        energy: session.energy,
        body_snapshot: bodySnapshot,
        confidence_snapshot: confidenceSnapshot,
        mastery_snapshot: masterySnapshot,
      }])
      .select()
      .maybeSingle();

    if (saved) {
      const entry = saved as JournalEntry;
      if (pendingLinks.length > 0) entry.shared_links = pendingLinks;
      setEntries((prev) => [...prev, entry]);
    }

    setText('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const pastGroups = groupByDate(pastEntries);
  const isOpenState = !loadingEntries && todayEntries.length === 0 && pastGroups.size === 0;
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="imsg-screen" data-open={isOpenState ? 'true' : undefined}>
      {/* Contact header — hidden in open/greeting state */}
      {!isOpenState && (
      <div className="imsg-header">
        <div className="imsg-header-avatar-wrap">
          <CamrynAvatar size={44} className="imsg-header-avatar" />
          <span className="imsg-presence-dot" />
        </div>
        <div className="imsg-header-info">
          <div className="imsg-header-name">Camryn</div>
          {isNightMode ? (
            <div className="imsg-night-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Wind-down mode
            </div>
          ) : (
            <div className="imsg-header-sub">
              <span className="imsg-active-dot" />
              Active now
            </div>
          )}
        </div>
      </div>
      )}

      {/* Thread */}
      <div className="imsg-thread" ref={threadRef}>
        {loadingEntries ? (
          <div className="imsg-loading">Loading…</div>
        ) : (
          <>
            {/* Past days — collapsed behind a subtle toggle */}
            {pastGroups.size > 0 && (
              <div className="imsg-history-section">
                <button className="imsg-history-toggle" onClick={() => setHistoryOpen((v) => !v)}>
                  <svg className={`imsg-history-chevron ${historyOpen ? 'open' : ''}`} width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{historyOpen ? 'Hide history' : `${pastGroups.size} previous ${pastGroups.size === 1 ? 'day' : 'days'}`}</span>
                </button>
                {historyOpen && (
                  <div className="imsg-past-days">
                    {Array.from(pastGroups.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, dayEntries]) => (
                        <PastDayThread key={date} date={date} entries={dayEntries} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Today date stamp */}
            {todayEntries.length === 0 ? (
              <div className="camryn-open-state">
                <div className="camryn-open-text">{greeting}</div>
              </div>
            ) : (
              <div className="imsg-date-stamp">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            )}

            {todayEntries.map((entry) => (
              <div key={entry.id} className="imsg-turn">
                {/* User bubble */}
                <div className="imsg-row imsg-row--user">
                  <div className="imsg-bubble imsg-bubble--user">
                    {entry.user_text}
                  </div>
                </div>

                {/* Camryn bubble */}
                {entry.camryn_reply && (
                  <div className="imsg-row imsg-row--camryn">
                    <CamrynAvatar size={26} className="imsg-bubble-avatar" />
                    <div className="imsg-bubble imsg-bubble--camryn">
                      {entry.camryn_reply.split('\n\n').map((para, pi) => (
                        <p key={pi}>{renderInlineLinks(stripNumberPrefix(para))}</p>
                      ))}
                      {entry.shared_links && entry.shared_links.length > 0 && (
                        <div className="camryn-link-cards">
                          {entry.shared_links.map((link, li) => (
                            <a
                              key={li}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="camryn-link-card"
                            >
                              <span className="camryn-link-card-label">{link.label}</span>
                              <span className="camryn-link-card-reason">{link.reason}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="imsg-reaction-row">
                        <span className="imsg-time">{formatTime(entry.created_at)}</span>
                        <div className="imsg-reactions">
                          <button
                            className={`imsg-react-btn ${reactions[entry.id] === 'helpful' ? 'active-helpful' : ''}`}
                            onClick={() => handleReaction(entry.id, 'helpful')}
                            title="This landed"
                          >
                            {reactions[entry.id] === 'helpful' ? '✓ landed' : 'landed'}
                          </button>
                          <button
                            className={`imsg-react-btn ${reactions[entry.id] === 'not_quite' ? 'active-not-quite' : ''}`}
                            onClick={() => handleReaction(entry.id, 'not_quite')}
                            title="Not quite"
                          >
                            {reactions[entry.id] === 'not_quite' ? '✕ not quite' : 'not quite'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="imsg-row imsg-row--camryn">
                <CamrynAvatar size={26} className="imsg-bubble-avatar" />
                <div className="imsg-bubble imsg-bubble--camryn imsg-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="imsg-input-bar">
        <div className="imsg-input-wrap">
          <textarea
            ref={textareaRef}
            className="imsg-textarea"
            rows={1}
            value={text}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening…' : 'Message Camryn…'}
            disabled={sending}
          />
          {speechSupported && (
            <button
              className={`imsg-mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={sending}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              title={isRecording ? 'Tap to stop' : 'Speak to Camryn'}
            >
              {isRecording ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="5" width="2" height="6" rx="1" fill="currentColor"/>
                  <rect x="4.5" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                  <rect x="8" y="4" width="2" height="8" rx="1" fill="currentColor"/>
                  <rect x="11.5" y="1" width="2" height="14" rx="1" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                  <rect x="4" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M1.5 7.5A5.5 5.5 0 0 0 12.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="7" y1="13" x2="7" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="4.5" y1="15" x2="9.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          )}
          <button
            className="imsg-send-btn"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            aria-label="Send"
          >
            {sending ? (
              <span className="imsg-send-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PastDayThread({ date, entries }: { date: string; entries: JournalEntry[] }) {
  const [open, setOpen] = useState(false);

  const d = new Date(date + 'T12:00:00');
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const msgCount = entries.length;
  // Preview: first user message, truncated
  const preview = entries[0]?.user_text ?? '';
  const previewTrunc = preview.length > 72 ? preview.slice(0, 72) + '…' : preview;

  return (
    <div className={`imsg-past-day ${open ? 'open' : ''}`}>
      <button className="imsg-past-toggle" onClick={() => setOpen((v) => !v)}>
        <div className="imsg-past-toggle-left">
          <div className="imsg-past-date-block">
            <span className="imsg-past-day-label">{dayLabel}</span>
            <span className="imsg-past-date-label">{dateLabel}</span>
          </div>
          <div className="imsg-past-preview-col">
            <span className="imsg-past-preview">{previewTrunc}</span>
            <span className="imsg-past-meta">{msgCount} {msgCount === 1 ? 'message' : 'messages'}</span>
          </div>
        </div>
        <svg
          className={`imsg-past-chevron ${open ? 'open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
        >
          <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="imsg-past-thread">
          {entries.map((entry) => (
            <div key={entry.id} className="imsg-turn">
              <div className="imsg-row imsg-row--user">
                <div className="imsg-bubble imsg-bubble--user">{entry.user_text}</div>
              </div>
              {entry.camryn_reply && (
                <div className="imsg-row imsg-row--camryn">
                  <CamrynAvatar size={26} className="imsg-bubble-avatar" />
                  <div className="imsg-bubble imsg-bubble--camryn">
                    {entry.camryn_reply.split('\n\n').map((para, pi) => (
                      <p key={pi}>{stripNumberPrefix(para)}</p>
                    ))}
                    <span className="imsg-time">{new Date(entry.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
