import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LikeItem {
  id: string;
  title: string;
  category: string;
  note: string;
  url: string;
  image_url: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'food',     label: 'Food',     emoji: '🍽' },
  { id: 'movement', label: 'Movement', emoji: '🏃' },
  { id: 'place',    label: 'Place',    emoji: '📍' },
  { id: 'book',     label: 'Book',     emoji: '📖' },
  { id: 'music',    label: 'Music',    emoji: '🎵' },
  { id: 'idea',     label: 'Idea',     emoji: '💡' },
  { id: 'habit',    label: 'Habit',    emoji: '⚡' },
  { id: 'person',   label: 'Person',   emoji: '💛' },
  { id: 'other',    label: 'Other',    emoji: '✦' },
];

function catMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

const EMPTY_FORM = { title: '', category: 'other', note: '', url: '', image_url: '' };

export default function LovesSection({ userId }: { userId: string }) {
  const [items, setItems] = useState<LikeItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('camryn_likes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setItems(data as LikeItem[]);
    };
    load();
  }, [userId]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('loves-images').upload(path, file, { upsert: false });
    if (!error) {
      const { data: pub } = supabase.storage.from('loves-images').getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    }
    setUploadingImage(false);
  };

  const handleAdd = async () => {
    const isIdea = form.category === 'idea';
    if (!isIdea && !form.title.trim()) return;
    if (isIdea && !form.note.trim() && !form.title.trim()) return;

    setSaving(true);
    const title = form.title.trim() || (form.category === 'idea' ? form.note.trim().slice(0, 80) : '');
    const { data, error } = await supabase
      .from('camryn_likes')
      .insert([{
        user_id: userId,
        title,
        category: form.category,
        note: form.note.trim(),
        url: form.url.trim(),
        image_url: form.image_url,
      }])
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setItems((prev) => [data as LikeItem, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from('camryn_likes').delete().eq('id', id);
    if (error) {
      console.error('like delete failed:', error);
      // Removed it from view optimistically -- put it back since the
      // delete never actually landed, so the UI doesn't disagree with the DB.
      if (item) setItems((prev) => [item, ...prev]);
      return;
    }
    // Clean up storage image if there is one
    if (item?.image_url) {
      const path = item.image_url.split(`/loves-images/`)[1];
      if (path) supabase.storage.from('loves-images').remove([path]);
    }
  };

  const visible = filterCat ? items.filter((i) => i.category === filterCat) : items;
  const catCounts = Object.fromEntries(CATEGORIES.map((c) => [c.id, items.filter((i) => i.category === c.id).length]));
  const isIdea = form.category === 'idea';

  return (
    <section className="loves-section">
      <div className="loves-head">
        <div className="card-label" style={{ marginBottom: '2px' }}>Things I Love</div>
        <h2 className="loves-title">What makes life worth living</h2>
        <p className="loves-sub">
          A personal collection of what brings you joy — food, places, ideas, people, habits. Camryn uses this to get to know you and personalise the protocol.
        </p>
      </div>

      {/* Add button / inline form */}
      {!showForm ? (
        <button className="loves-add-btn" onClick={() => setShowForm(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add something you love
        </button>
      ) : (
        <div className="loves-form">
          <div className="loves-form-cat-row">
            <span className="loves-form-cat-label">Category</span>
            <div className="loves-form-cats">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`loves-cat-btn ${form.category === c.id ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {isIdea ? (
            <>
              <textarea
                className="loves-textarea loves-textarea--idea"
                placeholder="What's the idea? Describe it freely…"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                rows={4}
                autoFocus
              />
              <input
                className="loves-input"
                placeholder="Short title (optional)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </>
          ) : (
            <>
              <input
                className="loves-input"
                placeholder={`What ${catMeta(form.category).label.toLowerCase()} do you love?`}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                autoFocus
              />
              <textarea
                className="loves-textarea"
                placeholder="A note about why you love it (optional)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                rows={2}
              />
            </>
          )}

          <input
            className="loves-input"
            placeholder="Link (optional) — article, recipe, page…"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />

          {/* Image upload */}
          <div className="loves-img-row">
            {form.image_url ? (
              <div className="loves-img-preview-wrap">
                <img className="loves-img-preview" src={form.image_url} alt="Preview" />
                <button
                  type="button"
                  className="loves-img-remove"
                  onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                  aria-label="Remove image"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="loves-img-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <span className="loves-img-uploading">Uploading…</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M8 5.5l2 2.5 1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add image
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          <div className="loves-form-actions">
            <button className="loves-form-cancel" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>Cancel</button>
            <button
              className="loves-form-save"
              onClick={handleAdd}
              disabled={
                saving || uploadingImage ||
                (isIdea ? (!form.note.trim() && !form.title.trim()) : !form.title.trim())
              }
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Category filter pills */}
      {items.length > 0 && (
        <div className="loves-filters">
          <button
            className={`loves-filter-pill ${filterCat === null ? 'active' : ''}`}
            onClick={() => setFilterCat(null)}
          >
            All <span className="loves-filter-count">{items.length}</span>
          </button>
          {CATEGORIES.filter((c) => catCounts[c.id] > 0).map((c) => (
            <button
              key={c.id}
              className={`loves-filter-pill ${filterCat === c.id ? 'active' : ''}`}
              onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
            >
              {c.emoji} {c.label} <span className="loves-filter-count">{catCounts[c.id]}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 && !showForm && (
        <div className="loves-empty">
          <span className="loves-empty-icon">✦</span>
          <p className="loves-empty-text">Nothing here yet. Add the first thing you love.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="loves-grid">
          {visible.map((item) => {
            const meta = catMeta(item.category);
            const domain = item.url ? (() => { try { return new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`).hostname.replace('www.', ''); } catch { return item.url; } })() : '';

            return (
              <div key={item.id} className={`loves-card ${item.image_url ? 'loves-card--has-image' : ''} ${item.category === 'idea' ? 'loves-card--idea' : ''}`}>
                {item.image_url && (
                  <div className="loves-card-img-wrap">
                    <img className="loves-card-img" src={item.image_url} alt={item.title} loading="lazy" />
                  </div>
                )}
                <div className="loves-card-body">
                  <div className="loves-card-top">
                    <span className="loves-card-emoji">{meta.emoji}</span>
                    <div className="loves-card-content">
                      <span className="loves-card-title">{item.title}</span>
                      <span className="loves-card-cat">{meta.label}</span>
                    </div>
                    <button
                      className="loves-card-delete"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Remove"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  {item.note && <p className="loves-card-note">{item.note}</p>}
                  {item.url && (
                    <a className="loves-card-link" href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6M6 1h3m0 0v3m0-3L4.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {domain}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
