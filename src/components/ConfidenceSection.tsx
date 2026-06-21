import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSaveIndicator } from '../hooks/useSaveIndicator';
import SaveIndicator from './ui/SaveIndicator';

// ── Likes ─────────────────────────────────────────────────────────────────────
interface Like {
  id: string;
  title: string;
  category: string;
  note: string;
  url: string;
  created_at: string;
}

const LIKE_CATEGORIES = ['Clothing', 'Tea', 'Skincare', 'Food', 'Other'] as const;
type LikeCategory = typeof LIKE_CATEGORIES[number];

const CATEGORY_EMOJI: Record<string, string> = {
  Clothing: '👗',
  Tea: '🍵',
  Skincare: '✨',
  Food: '🥗',
  Other: '♡',
};

function LikesCard({ userId }: { userId: string }) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', category: 'Other' as LikeCategory, note: '', url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase
      .from('camryn_likes')
      .select('id, title, category, note, url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setLikes(data as Like[]); });
  }, [userId, open]);

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from('camryn_likes')
      .insert({ user_id: userId, title: draft.title.trim(), category: draft.category, note: draft.note.trim(), url: draft.url.trim() })
      .select()
      .maybeSingle();
    if (data) setLikes((prev) => [data as Like, ...prev]);
    setDraft({ title: '', category: 'Other', note: '', url: '' });
    setAdding(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('camryn_likes').delete().eq('id', id);
    setLikes((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="conf-card conf-likes-card">
      <button className="conf-questions-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div>
          <h3 className="conf-card-title">Things I love</h3>
          <p className="conf-card-intro">Save things that work for you — clothing, teas, finds.</p>
        </div>
        <div className={`conf-chevron ${open ? 'open' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="conf-likes-body">
          {likes.length === 0 && !adding && (
            <p className="conf-likes-empty">Nothing saved yet. Add the first thing you love.</p>
          )}

          <div className="conf-likes-list">
            {likes.map((like) => (
              <div key={like.id} className="conf-like-row">
                <span className="conf-like-emoji">{CATEGORY_EMOJI[like.category] || '♡'}</span>
                <div className="conf-like-content">
                  <span className="conf-like-title">{like.title}</span>
                  {like.note && <span className="conf-like-note">{like.note}</span>}
                  <span className="conf-like-category">{like.category}</span>
                </div>
                <div className="conf-like-actions">
                  {like.url && (
                    <a
                      href={like.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="conf-like-link"
                      aria-label="Open link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 1h4v4M11 1 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  )}
                  <button className="conf-like-remove" onClick={() => handleDelete(like.id)} aria-label="Remove">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1 1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {adding ? (
            <div className="conf-like-form">
              <input
                className="conf-like-input"
                placeholder="What do you love?"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                autoFocus
              />
              <div className="conf-like-cats">
                {LIKE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`conf-like-cat ${draft.category === cat ? 'active' : ''}`}
                    onClick={() => setDraft((d) => ({ ...d, category: cat }))}
                  >
                    {CATEGORY_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>
              <input
                className="conf-like-input"
                placeholder="Short note (optional)"
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              />
              <input
                className="conf-like-input"
                placeholder="Link (optional — for future affiliate use)"
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
              />
              <div className="conf-like-form-actions">
                <button className="conf-like-save-btn" onClick={handleAdd} disabled={!draft.title.trim() || saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="conf-like-cancel-btn" onClick={() => { setAdding(false); setDraft({ title: '', category: 'Other', note: '', url: '' }); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="conf-like-add-btn" onClick={() => setAdding(true)}>
              + Add something you love
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DailyEntry {
  entry_date: string;
  confidence_note: string;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ entries }: { entries: DailyEntry[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="conf-sparkline">
      {days.map((date) => {
        const entry = entries.find((e) => e.entry_date === date);
        const hasEntry = !!(entry?.confidence_note?.trim());
        const isToday = date === today.toISOString().split('T')[0];
        const label = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' });
        return (
          <div key={date} className="conf-sparkline-col">
            <div className={`conf-sparkline-dot ${hasEntry ? 'filled' : ''} ${isToday ? 'today' : ''}`} title={date} />
            <span className="conf-sparkline-label">{label[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stylist questions ──────────────────────────────────────────────────────
const STYLIST_QUESTIONS = [
  {
    id: 'style_words' as const,
    prompt: 'Three words for how you want to look when you walk into a room.',
    placeholder: 'e.g. soft, competent, a little dangerous',
  },
  {
    id: 'lifestyle_context' as const,
    prompt: 'Where do you actually spend most of your week?',
    placeholder: 'e.g. school drop-offs, office two days, errands, couch at night',
  },
  {
    id: 'body_fit_dread' as const,
    prompt: 'One thing about getting dressed that you secretly dread.',
    placeholder: 'e.g. tight waistbands by 3pm, nothing fitting at the shoulder',
  },
  {
    id: 'closet_best_outfit' as const,
    prompt: 'Describe an outfit you reached for on a day you felt most like yourself.',
    placeholder: 'e.g. black wide-leg pants, white tee, leather jacket, gold hoops',
  },
  {
    id: 'closet_skip_piece' as const,
    prompt: "Name one piece you always skip and don't know why.",
    placeholder: "e.g. pink blazer I thought I should want but never wear",
  },
  {
    id: 'signal_wish' as const,
    prompt: 'What do you wish people sensed about you before you spoke?',
    placeholder: "e.g. that I'm warm and capable, not just tired or messy",
  },
  {
    id: 'style_influence' as const,
    prompt: "If you could borrow anyone's wardrobe for a month, whose would it be and why?",
    placeholder: 'e.g. Sade — polished but not stiff, always looks like herself',
  },
] as const;

type ProfileKey = typeof STYLIST_QUESTIONS[number]['id'];
type Profile = Record<ProfileKey, string>;

const EMPTY_PROFILE: Profile = {
  style_words: '',
  lifestyle_context: '',
  body_fit_dread: '',
  closet_best_outfit: '',
  closet_skip_piece: '',
  signal_wish: '',
  style_influence: '',
};

// ── Milestone logic ────────────────────────────────────────────────────────
const MAX_SCORE = 9; // 7 questions + 1 (3 days) + 1 (10 days)

function computeMilestone(profile: Profile, confDays: number): { score: number; label: string } {
  const answered = Object.values(profile).filter(v => v.trim().length > 0).length;
  const dailyPts = confDays >= 10 ? 2 : confDays >= 3 ? 1 : 0;
  const score = answered + dailyPts;

  let label = 'Just starting to remeet yourself.';
  if (score >= 6)      label = "You've given Camryn enough to act like your quiet stylist.";
  else if (score >= 4) label = "Camryn has a real feel for your style and confidence patterns.";
  else if (score >= 2) label = "You're getting to know how you like to show up.";

  return { score, label };
}

// ── Component ─────────────────────────────────────────────────────────────
interface ConfidenceSectionProps {
  userId: string;
}

export default function ConfidenceSection({ userId }: ConfidenceSectionProps) {
  const today = new Date().toISOString().split('T')[0];
  // Daily state
  const [confNote, setConfNote] = useState('');
  const [rebrandNote, setRebrandNote] = useState('');
  const dailyPending = useRef({ confidence_note: '', rebrand_note: '' });
  const [dailySave, startDailySave, doneDailySave] = useSaveIndicator();

  // Profile state
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const profilePending = useRef<Profile>(EMPTY_PROFILE);
  const [profileSave, startProfileSave, doneProfileSave] = useSaveIndicator();
  const [justSavedId, setJustSavedId] = useState<ProfileKey | null>(null);

  // Metadata
  const [confDays, setConfDays] = useState(0);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [rebrandPrompt, setRebrandPrompt] = useState('');
  const rebrandPendingRef = useRef('');
  const [rebrandSave, startRebrandSave, doneRebrandSave] = useSaveIndicator();

  // ── Load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const since = sevenDaysAgo.toISOString().split('T')[0];

      const [dailyRes, profileRes, daysRes, recentRes, rebrandRes] = await Promise.all([
        supabase
          .from('camryn_confidence')
          .select('confidence_note, rebrand_note')
          .eq('user_id', userId)
          .eq('entry_date', today)
          .maybeSingle(),
        supabase
          .from('camryn_confidence_profile')
          .select('style_words, lifestyle_context, body_fit_dread, closet_best_outfit, closet_skip_piece, signal_wish, style_influence')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('camryn_confidence')
          .select('entry_date', { count: 'exact', head: true })
          .eq('user_id', userId)
          .neq('confidence_note', ''),
        supabase
          .from('camryn_confidence')
          .select('entry_date, confidence_note')
          .eq('user_id', userId)
          .gte('entry_date', since)
          .order('entry_date', { ascending: true }),
        supabase
          .from('camryn_confidence_profile')
          .select('rebrand_prompt')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (dailyRes.data) {
        const cn = dailyRes.data.confidence_note || '';
        const rn = dailyRes.data.rebrand_note || '';
        setConfNote(cn);
        setRebrandNote(rn);
        dailyPending.current = { confidence_note: cn, rebrand_note: rn };
      }

      if (profileRes.data) {
        const p: Profile = {
          style_words:        profileRes.data.style_words        || '',
          lifestyle_context:  profileRes.data.lifestyle_context  || '',
          body_fit_dread:     profileRes.data.body_fit_dread     || '',
          closet_best_outfit: profileRes.data.closet_best_outfit || '',
          closet_skip_piece:  profileRes.data.closet_skip_piece  || '',
          signal_wish:        profileRes.data.signal_wish        || '',
          style_influence:    profileRes.data.style_influence    || '',
        };
        setProfile(p);
        profilePending.current = p;
      }

      setConfDays(daysRes.count || 0);
      if (recentRes.data) setRecentEntries(recentRes.data as DailyEntry[]);
      if (rebrandRes.data?.rebrand_prompt) {
        setRebrandPrompt(rebrandRes.data.rebrand_prompt);
        rebrandPendingRef.current = rebrandRes.data.rebrand_prompt;
      }
    };

    load();
  }, [userId]);

  // ── Daily save ────────────────────────────────────────────────────────
  const saveDaily = async () => {
    startDailySave();
    await supabase.from('camryn_confidence').upsert(
      {
        user_id: userId,
        entry_date: today,
        confidence_note: dailyPending.current.confidence_note,
        rebrand_note:    dailyPending.current.rebrand_note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    );
    doneDailySave();
    if (dailyPending.current.confidence_note.trim()) {
      setConfDays(d => Math.max(d, 1));
    }
  };

  // ── Profile save ──────────────────────────────────────────────────────
  const saveProfile = async (savedId?: ProfileKey) => {
    startProfileSave();
    await supabase.from('camryn_confidence_profile').upsert(
      {
        user_id: userId,
        ...profilePending.current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    doneProfileSave();
    if (savedId) {
      setJustSavedId(savedId);
      setTimeout(() => setJustSavedId(null), 2000);
    }
  };

  // ── Rebrand prompt save ───────────────────────────────────────────────
  const saveRebrandPrompt = async () => {
    startRebrandSave();
    await supabase.from('camryn_confidence_profile').upsert(
      {
        user_id: userId,
        rebrand_prompt: rebrandPendingRef.current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    doneRebrandSave();
  };

  // ── Milestone ─────────────────────────────────────────────────────────
  const { score, label } = computeMilestone(profile, confDays);
  const pct = Math.min((score / MAX_SCORE) * 100, 100);
  const answeredCount = Object.values(profile).filter(v => v.trim().length > 0).length;

  return (
    <section className="conf-section">

      {/* Header */}
      <div className="conf-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Confidence</div>
        <h2 className="conf-title">How you show up</h2>
        <p className="conf-sub">
          This lane follows you through every phase — collecting how you present yourself daily and the deeper style patterns that make you recognisably you.
        </p>
        <div className="section-how-it-works">
          <div className="section-how-title">How this works</div>
          <p className="section-how-text">
            There's no notification or scheduled check-in. You visit this tab whenever it feels right — even a few seconds counts.
            Each day gets its own entry, so what you write today won't be overwritten tomorrow.
            The stylist questions below are one-time and build your style profile over time — answer them slowly, one at a time, as things come to mind.
          </p>
          <div className="section-how-chips">
            <span className="section-how-chip">Visit any time of day</span>
            <span className="section-how-chip">Each day is saved separately</span>
            <span className="section-how-chip">Takes 30 seconds</span>
          </div>
        </div>
      </div>

      {/* Progress scale */}
      <div className="conf-progress-card">
        <div className="conf-progress-header">
          <span className="conf-progress-label">Confidence profile</span>
          <span className="conf-progress-count">
            {answeredCount} of {STYLIST_QUESTIONS.length} questions
          </span>
        </div>
        <div className="conf-progress-track">
          <div className="conf-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="conf-progress-caption">{label}</p>

        {/* 7-day check-in sparkline */}
        <div className="conf-sparkline-section">
          <span className="conf-sparkline-title">Last 7 days</span>
          <Sparkline entries={recentEntries} />
        </div>
      </div>

      {/* Rebrand narrative prompt */}
      <div className="conf-card">
        <div className="conf-card-header">
          <h3 className="conf-card-title">Your rebrand narrative</h3>
          <span className="conf-pill teal">Identity</span>
        </div>
        <p className="conf-card-intro" style={{ marginBottom: '8px' }}>
          What would the most confident, fully-realised version of you do today? How does she show up, speak, carry herself?
        </p>
        <textarea
          className="conf-textarea"
          value={rebrandPrompt}
          onChange={e => { setRebrandPrompt(e.target.value); rebrandPendingRef.current = e.target.value; }}
          onBlur={saveRebrandPrompt}
          placeholder="She walks in without apologising for the space she takes. She dressed for herself this morning, not for approval..."
          style={{ minHeight: '80px' }}
        />
        <SaveIndicator state={rebrandSave} className="conf-save-indicator" />
      </div>

      {/* Daily snapshot */}
      <div className="conf-card">
        <div className="conf-card-header">
          <h3 className="conf-card-title">Today's confidence snapshot</h3>
          <span className="conf-pill">Daily</span>
        </div>
        <p className="conf-card-intro">On the outside, how did you present yourself today?</p>
        <ul className="conf-anchors">
          <li>Clothes and shoes</li>
          <li>Hair, face, scent</li>
          <li>Any tiny upgrade you made for yourself</li>
        </ul>
        <textarea
          id="confidence-note"
          className="conf-textarea"
          value={confNote}
          onChange={e => { setConfNote(e.target.value); dailyPending.current.confidence_note = e.target.value; }}
          onBlur={saveDaily}
          placeholder="One detail that made you feel a little more confident, or one thing that felt off."
        />

        <div className="conf-divider" />

        <div className="conf-rebrand-header">
          <span className="conf-rebrand-label">Rebrand notes</span>
          <span className="conf-pill teal">Keep / retire</span>
        </div>
        <p className="conf-card-intro" style={{ marginBottom: '6px' }}>
          What are you keeping, retiring, or reconsidering? Filed quietly into your rebrand profile.
        </p>
        <textarea
          id="rebrand-note"
          className="conf-textarea"
          value={rebrandNote}
          onChange={e => { setRebrandNote(e.target.value); dailyPending.current.rebrand_note = e.target.value; }}
          onBlur={saveDaily}
          placeholder="e.g. retiring the chunky sneakers, keeping the gold hoops, want to try a blowout."
        />

        <SaveIndicator state={dailySave} className="conf-save-indicator" />
      </div>

      {/* Stylist questions */}
      <div className="conf-card conf-questions-card">
        <button
          className="conf-questions-toggle"
          onClick={() => setQuestionsOpen(o => !o)}
          aria-expanded={questionsOpen}
        >
          <div>
            <h3 className="conf-card-title">Reintroducing yourself</h3>
            <p className="conf-card-intro">
              Questions a good stylist would ask over coffee, answered slowly over time.
            </p>
          </div>
          <div className={`conf-chevron ${questionsOpen ? 'open' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {questionsOpen && (
          <div className="conf-questions-body">
            <p className="conf-questions-intro">
              There's no rush. Answer what feels easy first. Every answer gives Camryn a clearer picture of your style.
            </p>
            <div className="conf-questions-list">
              {STYLIST_QUESTIONS.map((q, idx) => {
                const val = profile[q.id];
                const filled = val.trim().length > 0;
                return (
                  <div key={q.id} className={`conf-q-item ${filled ? 'answered' : ''}`}>
                    <div className="conf-q-meta">
                      <span className="conf-q-num">{idx + 1}</span>
                      {filled && <span className="conf-q-dot" aria-label="answered" />}
                    </div>
                    <div className="conf-q-body">
                      <label className="conf-q-prompt" htmlFor={`sq-${q.id}`}>{q.prompt}</label>
                      <textarea
                        id={`sq-${q.id}`}
                        className="conf-textarea"
                        value={val}
                        onChange={e => {
                          const next = { ...profile, [q.id]: e.target.value };
                          setProfile(next);
                          profilePending.current = next;
                        }}
                        onBlur={() => saveProfile(q.id)}
                        placeholder={q.placeholder}
                      />
                      {justSavedId === q.id && profileSave !== 'idle' && (
                        <span className="conf-q-saved">Saved</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Things I Love */}
      <LikesCard userId={userId} />

    </section>
  );
}
