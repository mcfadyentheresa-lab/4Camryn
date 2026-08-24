# Feature backlog

Ideas parked for later — not scheduled, add to when it comes up.

- **Backdate period start** — the Today-screen drop toggle only ever logs the tap date as the period start. If you open the app a day or two into your period (rather than the day it starts), there's no way to correct that from the toggle itself — it has to be fixed manually in the database. Add a way to backdate (long-press, or a date field that appears after tapping) so this doesn't require a manual correction.
- **Other health tracking devices** — Vitals (Body tab) is currently Apple Watch-only: it works via an iOS Shortcut that POSTs resting heart rate/HRV/sleep to the `camryn-vitals` edge function with a shared secret. That endpoint's data model isn't inherently Apple-specific, so the gap is mainly the setup UI and instructions being written only for Shortcuts — worth adding support for other devices (Fitbit, Oura, Garmin, Whoop, Google Fit, etc.), likely via their own sync methods (many have webhooks or export APIs) feeding the same underlying vitals data.
