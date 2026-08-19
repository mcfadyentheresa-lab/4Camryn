import { useState } from 'react';
import ProtocolModal from './ProtocolModal';
import CamrynAvatar from './ui/CamrynAvatar';

export type AppView = 'today' | 'body' | 'food' | 'confidence' | 'space' | 'journal' | 'inspiration' | 'profile';

// Grouped by the cadence each section claims for itself -- Journal frames
// itself as a daily wind-down habit, Today is the daily anchor. Everything
// else explicitly says "no notification, visit whenever it feels right"
// (Confidence) or "no alarm, no reminder" (Space) in its own copy.
const DAILY_VIEWS: AppView[] = ['today', 'journal'];
const WHENEVER_VIEWS: AppView[] = ['profile', 'body', 'food', 'confidence', 'space', 'inspiration'];

interface HeaderProps {
  syncDot?: 'synced' | 'saving' | 'idle' | 'error';
  view: AppView;
  onViewChange: (view: AppView) => void;
  currentPhase?: number;
  displayName?: string | null;
  dayCount?: number;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export default function Header({ syncDot = 'idle', view, onViewChange, currentPhase, displayName, dayCount, theme = 'light', onThemeToggle }: HeaderProps) {
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
                    <div className="me-menu-label">Daily</div>
                    {DAILY_VIEWS.map((v) => (
                      <button
                        key={v}
                        className={`me-menu-item ${view === v ? 'active' : ''}`}
                        onClick={() => { onViewChange(v); setShowMe(false); }}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                    <div className="me-menu-divider" />
                    <div className="me-menu-label">Whenever</div>
                    {WHENEVER_VIEWS.map((v) => (
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

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onThemeToggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 9.3A6 6 0 0 1 6.7 2 6 6 0 1 0 14 9.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 1.3v1.6M8 13.1v1.6M2.6 8H1M15 8h-1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showProtocol && <ProtocolModal onClose={() => setShowProtocol(false)} currentPhase={currentPhase} />}
    </>
  );
}
