import { useState, useEffect, useRef } from 'react';
import { FOUNDATION_QUESTS } from '../lib/mastery';
import {
  getProtocolActionPick,
  saveProtocolActionPick,
  clearProtocolActionPick,
  getIntentionalAction,
  saveIntentionalAction,
  toggleIntentionalDone,
  type CycleProtocolAction,
  type CycleIntentionalAction,
} from '../lib/cycleActions';

interface CycleActionTileProps {
  taskTitle: string;
  taskBody: string;
  checked: boolean;
  infoOpen: boolean;
  phaseName: string;
  cyclePhase: string;
  onCheck: () => void;
  onToggleInfo: (e: React.MouseEvent) => void;
}

type PickerMode = 'none' | 'protocol' | 'intentional';

export default function CycleActionTile({
  taskTitle,
  taskBody,
  checked,
  infoOpen,
  phaseName,
  cyclePhase,
  onCheck,
  onToggleInfo,
}: CycleActionTileProps) {
  const [pickerMode, setPickerMode] = useState<PickerMode>('none');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('');
  const [intentionalText, setIntentionalText] = useState('');
  const [protocolPick, setProtocolPick] = useState<CycleProtocolAction | null>(null);
  const [intentionalAction, setIntentionalAction] = useState<CycleIntentionalAction | null>(null);
  const [intentionalDone, setIntentionalDone] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const [pick, intentional] = await Promise.all([
        getProtocolActionPick(),
        getIntentionalAction(),
      ]);
      setProtocolPick(pick);
      setIntentionalAction(intentional);
      setIntentionalDone(intentional?.done ?? false);
      if (pick) setSelectedProtocolId(pick.protocolActionId);
      if (intentional) setIntentionalText(intentional.text);
    };
    load();
  }, []);

  // Close picker on outside click
  useEffect(() => {
    if (pickerMode === 'none') return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerMode('none');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerMode]);

  const handleConfirmProtocol = async () => {
    if (!selectedProtocolId) return;
    await saveProtocolActionPick(cyclePhase, selectedProtocolId);
    setProtocolPick({ phase: cyclePhase, protocolActionId: selectedProtocolId });
    setPickerMode('none');
  };

  const handleClearProtocol = async () => {
    await clearProtocolActionPick();
    setProtocolPick(null);
    setSelectedProtocolId('');
  };

  const handleConfirmIntentional = async () => {
    const trimmed = intentionalText.trim();
    if (!trimmed) return;
    await saveIntentionalAction(cyclePhase, trimmed);
    setIntentionalAction({ phase: cyclePhase, text: trimmed, done: false });
    setIntentionalDone(false);
    setPickerMode('none');
  };

  const handleToggleIntentional = async () => {
    await toggleIntentionalDone();
    const updated = !intentionalDone;
    setIntentionalDone(updated);
    setIntentionalAction((prev) => prev ? { ...prev, done: updated } : prev);
  };

  const pickedQuest = FOUNDATION_QUESTS.find((q) => q.id === protocolPick?.protocolActionId);

  const isFollicular = cyclePhase === 'Follicular';

  return (
    <div className={`task-row ${checked ? 'done' : ''}`} onClick={onCheck}>
      {/* Main row */}
      <div className="task-row-main">
        <div className={`task-checkbox ${checked ? 'checked' : ''}`}>
          {checked && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="task-row-content">
          <div className="task-row-title">{taskTitle}</div>
        </div>
        <div className="task-tag">{phaseName}</div>
        <button
          type="button"
          className={`task-info-btn ${infoOpen ? 'active' : ''}`}
          onClick={onToggleInfo}
          aria-label="Why am I doing this?"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Info panel */}
      {infoOpen && (
        <div className="task-info-panel" onClick={(e) => e.stopPropagation()}>
          <p className="task-info-body">{taskBody}</p>
        </div>
      )}

      {/* Follicular action links */}
      {isFollicular && (
        <div
          className="cycle-tile-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`cycle-link ${protocolPick ? 'cycle-link-done' : ''}`}
            onClick={() => setPickerMode(pickerMode === 'protocol' ? 'none' : 'protocol')}
          >
            {protocolPick ? `Protocol: ${pickedQuest?.title ?? protocolPick.protocolActionId}` : 'Pick from the protocol'}
          </button>
          {protocolPick && (
            <button type="button" className="cycle-link-clear" onClick={handleClearProtocol} title="Clear">×</button>
          )}
          <span className="cycle-divider">·</span>
          <button
            type="button"
            className={`cycle-link ${intentionalAction ? 'cycle-link-done' : ''}`}
            onClick={() => setPickerMode(pickerMode === 'intentional' ? 'none' : 'intentional')}
          >
            {intentionalAction ? 'Edit intentional action' : 'Add an intentional action'}
          </button>
        </div>
      )}

      {/* Pickers */}
      {isFollicular && pickerMode !== 'none' && (
        <div
          ref={pickerRef}
          className="cycle-picker"
          onClick={(e) => e.stopPropagation()}
        >
          {pickerMode === 'protocol' && (
            <>
              <div className="cycle-picker-title">Pick a protocol action</div>
              <p className="cycle-picker-sub">
                Choose one action you want to begin or lean into during this phase.
              </p>
              <ul className="cycle-picker-list">
                {FOUNDATION_QUESTS.map((q) => (
                  <li key={q.id}>
                    <label className="cycle-picker-item">
                      <input
                        type="radio"
                        name="protocol-choice"
                        value={q.id}
                        checked={selectedProtocolId === q.id}
                        onChange={() => setSelectedProtocolId(q.id)}
                      />
                      <span>{q.title}</span>
                      <span className="cycle-picker-days">{q.targetDays}d quest</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="cycle-picker-footer">
                <button
                  type="button"
                  className="cycle-picker-confirm"
                  disabled={!selectedProtocolId}
                  onClick={handleConfirmProtocol}
                >
                  Confirm
                </button>
                <button type="button" className="cycle-picker-cancel" onClick={() => setPickerMode('none')}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {pickerMode === 'intentional' && (
            <>
              <div className="cycle-picker-title">Add an intentional action</div>
              <p className="cycle-picker-sub">
                This can be any small experiment that feels loving or important today, even if it's not part of the formal protocol.
              </p>
              <textarea
                className="cycle-picker-textarea"
                rows={3}
                value={intentionalText}
                onChange={(e) => setIntentionalText(e.target.value)}
                placeholder="e.g. Put my phone in the kitchen before bed, call my mom, wear a real outfit to work…"
              />
              <div className="cycle-picker-footer">
                <button
                  type="button"
                  className="cycle-picker-confirm"
                  disabled={!intentionalText.trim()}
                  onClick={handleConfirmIntentional}
                >
                  Save for today
                </button>
                <button type="button" className="cycle-picker-cancel" onClick={() => setPickerMode('none')}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chosen actions shown inline below the tile */}
      {isFollicular && (protocolPick || intentionalAction) && pickerMode === 'none' && (
        <div className="cycle-chosen-rows" onClick={(e) => e.stopPropagation()}>
          {protocolPick && pickedQuest && (
            <div className="cycle-chosen-row">
              <span className="cycle-chosen-badge follicular">Phase pick</span>
              <span className="cycle-chosen-text">{pickedQuest.title}</span>
            </div>
          )}
          {intentionalAction && (
            <label className="cycle-chosen-row cycle-intentional-row">
              <input
                type="checkbox"
                className="cycle-intentional-check"
                checked={intentionalDone}
                onChange={handleToggleIntentional}
              />
              <span className={`cycle-chosen-text ${intentionalDone ? 'cycle-chosen-done' : ''}`}>
                {intentionalAction.text}
              </span>
              <span className="cycle-chosen-badge intentional">Intentional ({cyclePhase})</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
