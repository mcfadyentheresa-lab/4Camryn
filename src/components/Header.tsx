import { useState } from 'react';
import ProtocolModal from './ProtocolModal';
import CamrynAvatar from './ui/CamrynAvatar';

export type AppView = 'today' | 'body' | 'food' | 'confidence' | 'space' | 'journal' | 'inspiration' | 'profile';

interface HeaderProps {
  syncDot?: 'synced' | 'saving' | 'idle' | 'error';
  view: AppView;
  onViewChange: (view: AppView) => void;
  currentPhase?: number;
  displayName?: string | null;
  dayCount?: number;
}

export default function Header({ syncDot = 'idle', view, onViewChange, currentPhase, displayName, dayCount }: HeaderProps) {
  const [showProtocol, setShowProtocol] = useState(false);
  const [showMe, setShowMe] = useState(false);

  return (
    <>
      <nav className="topnav">
        <div className="topnav-bar">
          <div className="brand">
            <div className="mark brand-avatar">
              <CamrynAvatar size={32} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Camryn</span>
              {displayName && (
                <span className="brand-greeting">Hi, {displayName}</span>
              )}
            </div>
          </div>

          <div className="nav-actions">
            {/* Day counter — proof the protocol is accumulating */}
            {dayCount != null && dayCount >= 0 && (
              <span className="header-day-count">
                Day {dayCount}
                <span className={`sync-dot sync-dot--${syncDot}`} title={syncDot === 'synced' ? 'Synced to cloud' : syncDot === 'saving' ? 'Saving...' : syncDot === 'error' ? 'Save failed' : ''} />
              </span>
            )}
            <button className="nav-btn" onClick={() => setShowProtocol(true)}>Protocol</button>
{/* Me menu */}
            <div className="me-menu-wrap">
              <button
                className={`nav-btn me-btn ${showMe ? 'active' : ''}`}
                onClick={() => setShowMe((v) => !v)}
                aria-label="Profile and settings"
              >
                Me
              </button>
              {showMe && (
                <>
                  <div className="me-menu-backdrop" onClick={() => setShowMe(false)} />
                  <div className="me-menu">
                    {(['today', 'profile', 'journal', 'body', 'food', 'confidence', 'space', 'inspiration'] as AppView[]).map((v) => (
                      <button
                        key={v}
                        className={`me-menu-item ${view === v ? 'active' : ''}`}
                        onClick={() => { onViewChange(v); setShowMe(false); }}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showProtocol && <ProtocolModal onClose={() => setShowProtocol(false)} currentPhase={currentPhase} />}
    </>
  );
}
