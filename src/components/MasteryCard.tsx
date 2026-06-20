import { useCallback, useState } from 'react';
import {
  PHASE_QUESTS,
  calcStreak,
  isTodayCompleted,
  type MasteryData,
} from '../lib/mastery';

interface QuestRowProps {
  id: string;
  title: string;
  targetDays: number;
  completedDates: string[];
  isPick: boolean;
  isHighlighted: boolean;
  onToggle: (id: string) => void;
  onPickClick: () => void;
}

function QuestRow({ id, title, targetDays, completedDates, isPick, isHighlighted, onToggle, onPickClick }: QuestRowProps) {
  const streak = calcStreak(completedDates, targetDays);
  const doneToday = isTodayCompleted(completedDates);
  const done = streak >= targetDays;
  const dotCount = Math.min(targetDays, 21);
  const filledDots = done ? dotCount : Math.min(streak, dotCount);
  const [bursting, setBursting] = useState(false);

  const handleToggle = () => {
    if (!doneToday && !done) {
      setBursting(true);
      setTimeout(() => setBursting(false), 700);
    }
    onToggle(id);
  };

  return (
    <div
      id={`quest-row-${id}`}
      className={[
        'quest-row',
        doneToday ? 'quest-today-done' : '',
        done ? 'quest-complete' : '',
        isPick && !done ? 'quest-pick' : '',
        isHighlighted ? 'quest-highlighted' : '',
        streak >= 7 && !done ? 'quest-milestone' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="quest-row-body">
        <div className="quest-title-line">
          <span className="quest-title">{title}</span>
          {isPick && !done && (
            <button
              className="quest-pick-pill"
              onClick={onPickClick}
              title="Go to today's tasks"
            >
              Camryn's pick for today
            </button>
          )}
          {done && (
            <span className="quest-done-pill">Complete</span>
          )}
          {!done && streak >= 7 && (
            <span className="quest-streak-badge">{streak} day streak</span>
          )}
        </div>

        <div className="quest-sub">
          {done
            ? `${targetDays} / ${targetDays} days · All done`
            : streak === 0
            ? `0 / ${targetDays} days · Ready when you are`
            : `${streak} / ${targetDays} days · ${targetDays - streak} to go`}
        </div>

        <div className="quest-dots" aria-hidden>
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`quest-dot ${i < filledDots ? (done ? 'quest-dot-done' : id === 'morning-hydration' ? 'quest-dot-hydration' : 'quest-dot-filled') : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="quest-mark-wrap">
        {bursting && (
          <div className="quest-burst" aria-hidden>
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`quest-burst-particle quest-burst-p${i}`} />
            ))}
          </div>
        )}
        <button
          className={`quest-mark-btn ${doneToday ? 'marked' : ''} ${done ? 'complete' : ''} ${bursting ? 'bursting' : ''}`}
          onClick={handleToggle}
          title={doneToday ? 'Unmark today' : 'Mark today done'}
          disabled={done && !doneToday}
        >
          {doneToday || done ? (
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
              <path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

interface MasteryCardProps {
  phaseNumber: number;
  phaseName: string;
  data: MasteryData;
  highlightedId?: string | null;
  onToggle: (id: string) => void;
  onPickClick: () => void;
}

export default function MasteryCard({ phaseNumber, phaseName, data, highlightedId, onToggle, onPickClick }: MasteryCardProps) {
  const handleToggle = useCallback((id: string) => onToggle(id), [onToggle]);
  const quests = PHASE_QUESTS[phaseNumber] ?? PHASE_QUESTS[1];

  return (
    <div className="mastery-card">
      <div className="card-label" style={{ marginBottom: '4px' }}>Mastery unlocks</div>
      <div className="card-title" style={{ marginBottom: '4px' }}>{phaseName} phase progress</div>
      <p className="mastery-invite">
        You don't have to do everything at once. Start with one, and Camryn will quietly track the streak.
      </p>

      <div className="quest-list">
        {quests.map((q) => (
          <QuestRow
            key={q.id}
            id={q.id}
            title={q.title}
            targetDays={q.targetDays}
            completedDates={data.quests[q.id]?.completedDates ?? []}
            isPick={data.pickId === q.id}
            isHighlighted={highlightedId === q.id}
            onToggle={handleToggle}
            onPickClick={onPickClick}
          />
        ))}
      </div>
    </div>
  );
}
