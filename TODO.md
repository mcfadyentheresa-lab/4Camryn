# Feature backlog

Ideas parked for later — not scheduled, add to when it comes up.

- **Reset button** — let a user reset their protocol progress and start over (phase, save count, mastery data, streaks). Needs a clear confirmation step since it's destructive. Add when it makes sense.
- **Loves feature cleanup** — intent is a spot for things you've saved (clothing ideas, recipes, things that inspired you) that Camryn can actually pull from. The data plumbing already works (saved items feed into the journal chat prompt via `lovesSnapshot`), but the UI is split into two disconnected copies of the same list — the standalone "Loves" tab and a separate "Things I love" widget inside Confidence, both reading/writing the same `camryn_likes` table. Worth merging into one, and nothing currently signals to the user that saving something here actually feeds Camryn's awareness. Address when it makes sense.
- **Rename "Loves"** — name doesn't quite land for what it is (saved inspiration Camryn can reference). Pick something clearer. Bundle with the cleanup above.
