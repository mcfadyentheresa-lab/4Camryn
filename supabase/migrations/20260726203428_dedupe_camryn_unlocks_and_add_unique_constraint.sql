/*
# Dedupe camryn_unlocks and add unique constraint on (user_id, phase_id, unlock_index)

## Why
A duplicate-check query (2026-07-26) found 5 pairs of duplicate rows in
camryn_unlocks, all for user f47fbc4f-83fe-4933-a913-cc6a2dd843d2, phase_id=1,
unlock_index 0..4. Each (user_id, phase_id, unlock_index) group had exactly two
rows: an earlier "active" row created at ~2026-05-26 19:31:19 and a later
"paused" row created ~34 seconds later at ~2026-05-26 19:31:53. This looks like
a double-fire of the same insert rather than a deliberate second record.

The schema had NO uniqueness protection on the natural key
(user_id, phase_id, unlock_index) — only a surrogate primary key on id — so
nothing prevented these duplicates, and future double-fires would create more.

## Changes

### 1. Delete the 5 duplicate ("paused") rows
Deletes exactly these 5 rows by id (the later-created "paused" duplicates):
- 5614606b-d961-4a78-af5e-a00d984992bd  (phase_id=1, unlock_index=0)
- d69f2f06-071b-4d17-97b9-3f7d26e0ee09  (phase_id=1, unlock_index=1)
- d35d6023-80b0-4e0c-96ad-230a52bece17  (phase_id=1, unlock_index=2)
- c5f0bf45-a327-4e0f-b53d-6fd761e9eff4  (phase_id=1, unlock_index=3)
- 3ded28be-109e-414f-8698-565f2b3e66bb  (phase_id=1, unlock_index=4)

The earlier "active" rows for each (phase_id, unlock_index) pair are kept.
This is a targeted, id-listed delete — not a broad WHERE clause — so it cannot
accidentally affect any other user or any other rows. Re-running the migration
is safe: the DELETE matches 0 rows the second time.

### 2. Add UNIQUE constraint on (user_id, phase_id, unlock_index)
Prevents any future duplicate of the natural key. Wrapped in a DO $$ ...
IF NOT EXISTS ... END $$ guard so the migration is idempotent — re-running
will not error with "constraint already exists" if a prior attempt committed
server-side before a timeout returned.

## Data safety
- The DELETE removes 5 rows that the user explicitly identified as the
  duplicates to drop (the "paused" set). The canonical "active" rows remain.
- No columns are dropped, no types changed, no tables renamed.
- User count for f47fbc4f-...cc6a2dd843d2 goes from 10 -> 5 (one row per
  unlock_index 0..4, as intended).

## Security
No RLS or policy changes. The existing camryn_unlocks_user_id_fkey foreign
key and camryn_unlocks_pkey primary key are untouched.

## Post-migration verification
1. SELECT count(*) FROM camryn_unlocks WHERE user_id = 'f47fbc4f-...cc6a2dd843d2'
   should return 5 (was 10).
2. The constraint camryn_unlocks_user_phase_unlock_unique should appear in
   pg_constraint with contype='u'.
3. A test insert duplicating an existing (user_id, phase_id, unlock_index)
   should be rejected with a unique-violation error.
*/

DELETE FROM camryn_unlocks
WHERE id IN (
  '5614606b-d961-4a78-af5e-a00d984992bd',
  'd69f2f06-071b-4d17-97b9-3f7d26e0ee09',
  'd35d6023-80b0-4e0c-96ad-230a52bece17',
  'c5f0bf45-a327-4e0f-b53d-6fd761e9eff4',
  '3ded28be-109e-414f-8698-565f2b3e66bb'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'camryn_unlocks_user_phase_unlock_unique'
      AND conrelid = 'public.camryn_unlocks'::regclass
  ) THEN
    ALTER TABLE public.camryn_unlocks
      ADD CONSTRAINT camryn_unlocks_user_phase_unlock_unique
      UNIQUE (user_id, phase_id, unlock_index);
  END IF;
END
$$;
