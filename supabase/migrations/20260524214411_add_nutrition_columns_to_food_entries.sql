/*
  # Add nutrition data columns to food entries

  ## Changes

  ### Modified Tables
  - `camryn_food_entries`
    - `calories` (numeric) - kcal per entry
    - `carbs_g` (numeric) - carbohydrates in grams
    - `fat_g` (numeric) - fat in grams
    - `fiber_g` (numeric) - fiber in grams
    - `sugar_g` (numeric) - sugar in grams
    - `serving_size` (text) - e.g. "1 cup", "100g"
    - `brand_name` (text) - product brand
    - `barcode` (text) - UPC/EAN barcode used for lookup
    - `source` (text) - 'manual' | 'barcode' | 'search'

  ### Modified Tables
  - `camryn_food_daily`
    - `water_cups` (numeric) replaces water_ml — stored as cups (1 cup = 240ml)
    - Keep water_ml for backward compat but new code uses water_cups

  ## Notes
  - All new columns are nullable for backward compatibility with existing entries
  - No data is lost
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'calories'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN calories numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'carbs_g'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN carbs_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'fat_g'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN fat_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'fiber_g'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN fiber_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'sugar_g'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN sugar_g numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'serving_size'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN serving_size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'brand_name'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN brand_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN barcode text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_entries' AND column_name = 'source'
  ) THEN
    ALTER TABLE camryn_food_entries ADD COLUMN source text NOT NULL DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_daily' AND column_name = 'water_cups'
  ) THEN
    ALTER TABLE camryn_food_daily ADD COLUMN water_cups numeric NOT NULL DEFAULT 0;
  END IF;
END $$;
