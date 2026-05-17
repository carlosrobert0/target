import { type SQLiteDatabase } from 'expo-sqlite'

export async function migrate(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount FLOAT NOT NULL,
      target_date TIMESTAMP,
      archived_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL DEFAULT 'credit-card',
      color TEXT NOT NULL DEFAULT 'blue',
      archived_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_id INTEGER NOT NULL,
      wallet_id INTEGER,
      amount FLOAT NOT NULL,
      observation TEXT,
      category TEXT,
      receipt_uri TEXT,
      recurring_id INTEGER,
      occurred_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,

      CONSTRAINT fk_targets_transactions
      FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE,

      CONSTRAINT fk_wallets_transactions
      FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS analysis_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      color TEXT NOT NULL,
      categories TEXT NOT NULL,
      examples TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_id INTEGER NOT NULL,
      amount FLOAT NOT NULL,
      observation TEXT,
      category TEXT,
      frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly','yearly')),
      day_of_month INTEGER,
      day_of_week INTEGER,
      start_date TIMESTAMP NOT NULL,
      next_run TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,

      CONSTRAINT fk_targets_recurring
      FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT 'blue',
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (transaction_id, tag_id),
      FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      daily_reminder_hour INTEGER NOT NULL DEFAULT 20,
      daily_reminder_minute INTEGER NOT NULL DEFAULT 0,
      budget_alert_enabled INTEGER NOT NULL DEFAULT 1,
      budget_alert_threshold INTEGER NOT NULL DEFAULT 80,
      achievement_alert_enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      payload TEXT,
      fired_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS achievements (
      key TEXT PRIMARY KEY,
      unlocked_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_wallet_id INTEGER NOT NULL,
      to_wallet_id INTEGER NOT NULL,
      amount FLOAT NOT NULL CHECK (amount > 0),
      observation TEXT,
      occurred_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,

      CONSTRAINT fk_transfers_from FOREIGN KEY (from_wallet_id) REFERENCES wallets (id) ON DELETE CASCADE,
      CONSTRAINT fk_transfers_to   FOREIGN KEY (to_wallet_id)   REFERENCES wallets (id) ON DELETE CASCADE,
      CONSTRAINT chk_different_wallets CHECK (from_wallet_id <> to_wallet_id)
    );

    CREATE INDEX IF NOT EXISTS idx_transfers_from ON transfers (from_wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transfers_to   ON transfers (to_wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transfers_when ON transfers (occurred_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transactions_target ON transactions (target_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_occurred ON transactions (occurred_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
    CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions (recurring_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_next_run ON recurring_transactions (next_run) WHERE is_active = 1;
    CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag ON transaction_tags (tag_id);

    INSERT OR IGNORE INTO analysis_categories (key, name, percentage, color, categories, examples)
    VALUES
      ('essentials', 'Essenciais', 50, 'green',
       '["Alimentação","Transporte","Moradia","Saúde"]',
       'Moradia, alimentação, transporte, saúde'),
      ('wants', 'Desejos', 30, 'yellow',
       '["Lazer","Entretenimento","Vestuário"]',
       'Lazer, entretenimento, compras pessoais'),
      ('investments', 'Investimentos', 20, 'blue',
       '["Educação","Tecnologia","Outros"]',
       'Poupança, reserva de emergência, aplicações');

    INSERT OR IGNORE INTO notification_settings (id) VALUES (1);

    INSERT OR IGNORE INTO wallets (name, icon, color) VALUES
      ('Carteira',          'dollar-sign', 'green'),
      ('Conta corrente',    'credit-card', 'blue'),
      ('Cartão de crédito', 'credit-card', 'red');
  `)

  // colunas adicionadas em versões posteriores — upgrade-safe via safeAlter
  await safeAlter(database, `ALTER TABLE targets ADD COLUMN archived_at TIMESTAMP`)
  await safeAlter(database, `ALTER TABLE targets ADD COLUMN target_date TIMESTAMP`)
  await safeAlter(database, `ALTER TABLE transactions ADD COLUMN recurring_id INTEGER`)
  await safeAlter(database, `ALTER TABLE transactions ADD COLUMN wallet_id INTEGER`)
  await safeAlter(database, `ALTER TABLE transactions ADD COLUMN receipt_uri TEXT`)
  await safeAlter(
    database,
    `ALTER TABLE transactions ADD COLUMN occurred_at TIMESTAMP NOT NULL DEFAULT current_timestamp`,
  )
}

async function safeAlter(database: SQLiteDatabase, sql: string) {
  try {
    await database.execAsync(sql)
  } catch {
    // coluna ou objeto já existe — ignorar
  }
}
