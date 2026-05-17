-- Cofrin — PostgreSQL schema
-- Equivalente do schema SQLite, com tipos PG corretos e RLS-ready (user_id reservado).
-- Aplicar com:  psql "$DATABASE_URL" -f schema.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS targets (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID,
  name         TEXT NOT NULL,
  amount       NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  archived_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_categories (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID,
  key          TEXT NOT NULL,
  name         TEXT NOT NULL,
  percentage   INTEGER NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  color        TEXT NOT NULL,
  categories   JSONB NOT NULL,
  examples     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            UUID,
  target_id          BIGINT NOT NULL REFERENCES targets (id) ON DELETE CASCADE,
  amount             NUMERIC(14, 2) NOT NULL,
  observation        TEXT,
  category           TEXT,
  frequency          TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  day_of_month       INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week        INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_date         TIMESTAMPTZ NOT NULL,
  next_run           TIMESTAMPTZ NOT NULL,
  end_date           TIMESTAMPTZ,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  last_processed_at  TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID,
  target_id     BIGINT NOT NULL REFERENCES targets (id) ON DELETE CASCADE,
  amount        NUMERIC(14, 2) NOT NULL,
  observation   TEXT,
  category      TEXT,
  recurring_id  BIGINT REFERENCES recurring_transactions (id) ON DELETE SET NULL,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id BIGINT NOT NULL REFERENCES transactions (id) ON DELETE CASCADE,
  tag_id         BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id                    UUID PRIMARY KEY,
  daily_reminder_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  daily_reminder_hour        INTEGER NOT NULL DEFAULT 20 CHECK (daily_reminder_hour BETWEEN 0 AND 23),
  daily_reminder_minute      INTEGER NOT NULL DEFAULT 0  CHECK (daily_reminder_minute BETWEEN 0 AND 59),
  budget_alert_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  budget_alert_threshold     INTEGER NOT NULL DEFAULT 80 CHECK (budget_alert_threshold BETWEEN 0 AND 100),
  achievement_alert_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_log (
  id        BIGSERIAL PRIMARY KEY,
  user_id   UUID,
  kind      TEXT NOT NULL,
  payload   JSONB,
  fired_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user      ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_target    ON transactions (target_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred  ON transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions (recurring_id);
CREATE INDEX IF NOT EXISTS idx_targets_user           ON targets (user_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_due          ON recurring_transactions (next_run) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_tags_user              ON tags (user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_targets_updated
    BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_transactions_updated
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_recurring_updated
    BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_analysis_categories_updated
    BEFORE UPDATE ON analysis_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
