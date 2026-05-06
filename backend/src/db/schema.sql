-- ============================================================
-- Habitscape — Initial Schema
-- Run once against your local PostgreSQL database.
-- ============================================================

-- Enable uuid generation (built into Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  password_hash    TEXT         NOT NULL,
  calorie_goal     INT          NOT NULL DEFAULT 2200,
  protein_goal_g   INT          NOT NULL DEFAULT 150,
  carbs_goal_g     INT          NOT NULL DEFAULT 250,
  fat_goal_g       INT          NOT NULL DEFAULT 70,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Keep updated_at in sync automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- FOOD_LOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_logs (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_name           VARCHAR(255) NOT NULL,
  calories_kcal       INT          NOT NULL DEFAULT 0,
  protein_g           NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_g             NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_g               NUMERIC(6,2) NOT NULL DEFAULT 0,
  image_url           TEXT,
  is_manual_override  BOOLEAN      NOT NULL DEFAULT FALSE,
  logged_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_logs_user_date_idx
  ON food_logs (user_id, logged_at DESC);

-- ------------------------------------------------------------
-- BMI_PREDICTIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bmi_predictions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bmi_value         NUMERIC(5,2) NOT NULL,
  bmi_status        VARCHAR(50)  NOT NULL,
  age               INT,
  gender            VARCHAR(10),
  daily_steps       INT,
  sleep_hours       NUMERIC(4,2),
  water_intake_l    NUMERIC(4,2),
  calories_consumed INT,
  smoker            BOOLEAN      NOT NULL DEFAULT FALSE,
  alcohol           BOOLEAN      NOT NULL DEFAULT FALSE,
  confidence_pct    NUMERIC(5,2),
  predicted_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bmi_predictions_user_idx
  ON bmi_predictions (user_id, predicted_at DESC);

-- ------------------------------------------------------------
-- DAILY_SUMMARIES  (AI cache)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_summaries (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_date     DATE        NOT NULL,
  summary_text     TEXT,
  recommendations  JSONB,
  smart_alerts     JSONB,
  hydration_pct    NUMERIC(5,2),
  metabolic_status VARCHAR(50),
  readiness_status VARCHAR(50),
  generated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, summary_date)
);
