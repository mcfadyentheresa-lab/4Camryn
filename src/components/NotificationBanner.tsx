import { useEffect, useState } from 'react';
import { localToday } from '../lib/date';

const NOTIF_DISMISSED_KEY = 'camryn_notif_dismissed';
const NOTIF_TIME_KEY = 'camryn_notif_time';

function canRequestPermission(): boolean {
  return 'Notification' in window && Notification.permission === 'default';
}

function isAlreadyGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

function scheduleEveningReminder(hour: number) {
  // Store preferred hour; the check runs on app open
  localStorage.setItem(NOTIF_TIME_KEY, String(hour));
}

function checkAndFireReminder(savedToday: boolean) {
  if (!isAlreadyGranted()) return;
  if (savedToday) return;

  const stored = localStorage.getItem(NOTIF_TIME_KEY);
  if (!stored) return;

  const reminderHour = parseInt(stored, 10);
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour < reminderHour) return;

  // Only fire once per day
  const firedKey = `camryn_notif_fired_${localToday()}`;
  if (localStorage.getItem(firedKey)) return;

  localStorage.setItem(firedKey, '1');
  new Notification('Camryn', {
    body: "Today's still open. No pressure — but it's there.",
    icon: '/favicon.ico',
    silent: false,
  });
}

interface NotificationBannerProps {
  savedToday: boolean;
}

export default function NotificationBanner({ savedToday }: NotificationBannerProps) {
  const [show, setShow] = useState(false);
  const [granted, setGranted] = useState(false);
  const [selectedHour, setSelectedHour] = useState(20); // 8pm default

  useEffect(() => {
    if (localStorage.getItem(NOTIF_DISMISSED_KEY)) return;
    if (canRequestPermission()) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  // Check if we should fire a reminder on every render where savedToday changes
  useEffect(() => {
    checkAndFireReminder(savedToday);
  }, [savedToday]);

  const handleAllow = async () => {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      scheduleEveningReminder(selectedHour);
      setGranted(true);
      setTimeout(() => setShow(false), 2000);
    } else {
      dismiss();
    }
  };

  const dismiss = () => {
    localStorage.setItem(NOTIF_DISMISSED_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  const hourLabel = selectedHour === 18 ? '6pm' : selectedHour === 19 ? '7pm' : selectedHour === 20 ? '8pm' : '9pm';

  return (
    <div className="notif-banner">
      {granted ? (
        <p className="notif-banner-text">Done. Camryn will check in at {hourLabel}.</p>
      ) : (
        <>
          <p className="notif-banner-text">
            Want a reminder if you haven't saved by evening?
          </p>
          <div className="notif-banner-actions">
            <div className="notif-time-chips">
              {[18, 19, 20, 21].map((h) => (
                <button
                  key={h}
                  className={`notif-time-chip ${selectedHour === h ? 'active' : ''}`}
                  onClick={() => setSelectedHour(h)}
                >
                  {h === 18 ? '6pm' : h === 19 ? '7pm' : h === 20 ? '8pm' : '9pm'}
                </button>
              ))}
            </div>
            <div className="notif-banner-btns">
              <button className="notif-btn notif-btn--allow" onClick={handleAllow}>Allow</button>
              <button className="notif-btn notif-btn--dismiss" onClick={dismiss}>Not now</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
