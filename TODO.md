# Feature backlog

Ideas parked for later — not scheduled, add to when it comes up.

- **Other health tracking devices** — Vitals (Body tab) is currently Apple Watch-only: it works via an iOS Shortcut that POSTs resting heart rate/HRV/sleep to the `camryn-vitals` edge function with a shared secret. That endpoint's data model isn't inherently Apple-specific, so the gap is mainly the setup UI and instructions being written only for Shortcuts — worth adding support for other devices (Fitbit, Oura, Garmin, Whoop, Google Fit, etc.), likely via their own sync methods (many have webhooks or export APIs) feeding the same underlying vitals data.
