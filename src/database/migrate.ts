import { type SQLiteDatabase } from 'expo-sqlite'

export async function migrate(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount FLOAT NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp,
      updated_at timestamp NOT NULL DEFAULT current_timestamp
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_id INTEGER NOT NULL,
      amount FLOAT NOT NULL,
      observation TEXT,
      category TEXT,
      created_at timestamp NOT NULL DEFAULT current_timestamp,
      updated_at timestamp NOT NULL DEFAULT current_timestamp,

      CONSTRAINT fk_targets_transactions
      FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analysis_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      color TEXT NOT NULL,
      categories TEXT NOT NULL, -- JSON string com array de categorias
      examples TEXT,
      created_at timestamp NOT NULL DEFAULT current_timestamp,
      updated_at timestamp NOT NULL DEFAULT current_timestamp
    );

    -- Inserir dados padrão se a tabela estiver vazia
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
  `)
}
