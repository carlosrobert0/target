/**
 * Migração de dados SQLite (cofrin.db) → PostgreSQL.
 *
 * Uso:
 *   1. docker compose up -d
 *   2. cp .env.example .env  e ajuste se necessário
 *   3. SQLITE_PATH=/caminho/para/cofrin.db ts-node migrate-from-sqlite.ts
 *
 * Estratégia:
 *   - Lê tabelas do SQLite com better-sqlite3 (sync, mais previsível).
 *   - Escreve no Postgres em uma única transação por tabela, na ordem de FKs.
 *   - Preserva IDs (passa explicitamente) e reajusta as sequences ao final.
 *   - Idempotente: faz TRUNCATE ... RESTART IDENTITY CASCADE antes de inserir.
 */

import 'dotenv/config'
import Database from 'better-sqlite3'
import { Pool } from 'pg'
import * as path from 'node:path'
import * as fs from 'node:fs'

const SQLITE_PATH =
  process.env.SQLITE_PATH || path.resolve(process.cwd(), '../../cofrin.db')
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://cofrin:cofrin@localhost:5432/cofrin'

if (!fs.existsSync(SQLITE_PATH)) {
  console.error(`SQLite file not found at: ${SQLITE_PATH}`)
  console.error('Set SQLITE_PATH env var to point at your cofrin.db.')
  process.exit(1)
}

const sqlite = new Database(SQLITE_PATH, { readonly: true })
const pg = new Pool({ connectionString: DATABASE_URL })

async function main() {
  console.log(`[migrate] source: ${SQLITE_PATH}`)
  console.log(`[migrate] target: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`)

  await pg.query('BEGIN')
  try {
    await pg.query(`
      TRUNCATE
        notification_log,
        notification_settings,
        transaction_tags,
        tags,
        transactions,
        recurring_transactions,
        analysis_categories,
        targets
      RESTART IDENTITY CASCADE
    `)

    const counts: Record<string, number> = {}

    counts.targets = await copyTargets()
    counts.analysis_categories = await copyAnalysisCategories()
    counts.recurring = await copyRecurring()
    counts.transactions = await copyTransactions()
    counts.tags = await copyTags()
    counts.transaction_tags = await copyTransactionTags()
    counts.notification_settings = await copyNotificationSettings()
    counts.notification_log = await copyNotificationLog()

    await fixSequences()

    await pg.query('COMMIT')
    console.log('[migrate] done')
    console.table(counts)
  } catch (error) {
    await pg.query('ROLLBACK')
    console.error('[migrate] FAILED:', error)
    process.exit(1)
  } finally {
    await pg.end()
    sqlite.close()
  }
}

async function copyTargets(): Promise<number> {
  const rows = sqlite
    .prepare(
      `SELECT id, name, amount, archived_at, created_at, updated_at FROM targets`,
    )
    .all() as any[]

  for (const row of rows) {
    await pg.query(
      `INSERT INTO targets (id, name, amount, archived_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.id, row.name, row.amount, row.archived_at, row.created_at, row.updated_at],
    )
  }
  return rows.length
}

async function copyAnalysisCategories(): Promise<number> {
  const rows = sqlite
    .prepare(
      `SELECT id, key, name, percentage, color, categories, examples, created_at, updated_at
       FROM analysis_categories`,
    )
    .all() as any[]

  for (const row of rows) {
    await pg.query(
      `INSERT INTO analysis_categories
        (id, key, name, percentage, color, categories, examples, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)`,
      [
        row.id,
        row.key,
        row.name,
        row.percentage,
        row.color,
        row.categories,
        row.examples,
        row.created_at,
        row.updated_at,
      ],
    )
  }
  return rows.length
}

async function copyRecurring(): Promise<number> {
  const rows = sqlite
    .prepare(
      `SELECT id, target_id, amount, observation, category, frequency,
              day_of_month, day_of_week, start_date, next_run, end_date,
              is_active, last_processed_at, created_at, updated_at
       FROM recurring_transactions`,
    )
    .all() as any[]

  for (const row of rows) {
    await pg.query(
      `INSERT INTO recurring_transactions
        (id, target_id, amount, observation, category, frequency,
         day_of_month, day_of_week, start_date, next_run, end_date,
         is_active, last_processed_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        row.id,
        row.target_id,
        row.amount,
        row.observation,
        row.category,
        row.frequency,
        row.day_of_month,
        row.day_of_week,
        row.start_date,
        row.next_run,
        row.end_date,
        row.is_active === 1,
        row.last_processed_at,
        row.created_at,
        row.updated_at,
      ],
    )
  }
  return rows.length
}

async function copyTransactions(): Promise<number> {
  const rows = sqlite
    .prepare(
      `SELECT id, target_id, amount, observation, category,
              recurring_id, occurred_at, created_at, updated_at
       FROM transactions`,
    )
    .all() as any[]

  for (const row of rows) {
    await pg.query(
      `INSERT INTO transactions
        (id, target_id, amount, observation, category, recurring_id, occurred_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        row.id,
        row.target_id,
        row.amount,
        row.observation,
        row.category,
        row.recurring_id,
        row.occurred_at ?? row.created_at,
        row.created_at,
        row.updated_at,
      ],
    )
  }
  return rows.length
}

async function copyTags(): Promise<number> {
  const rows = sqlite.prepare(`SELECT id, name, color, created_at FROM tags`).all() as any[]
  for (const row of rows) {
    await pg.query(
      `INSERT INTO tags (id, name, color, created_at) VALUES ($1, $2, $3, $4)`,
      [row.id, row.name, row.color, row.created_at],
    )
  }
  return rows.length
}

async function copyTransactionTags(): Promise<number> {
  const rows = sqlite
    .prepare(`SELECT transaction_id, tag_id FROM transaction_tags`)
    .all() as any[]
  for (const row of rows) {
    await pg.query(
      `INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2)`,
      [row.transaction_id, row.tag_id],
    )
  }
  return rows.length
}

async function copyNotificationSettings(): Promise<number> {
  const row = sqlite
    .prepare(`SELECT * FROM notification_settings WHERE id = 1`)
    .get() as any
  if (!row) return 0
  await pg.query(
    `INSERT INTO notification_settings
      (user_id, daily_reminder_enabled, daily_reminder_hour, daily_reminder_minute,
       budget_alert_enabled, budget_alert_threshold, achievement_alert_enabled, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
    [
      row.daily_reminder_enabled === 1,
      row.daily_reminder_hour,
      row.daily_reminder_minute,
      row.budget_alert_enabled === 1,
      row.budget_alert_threshold,
      row.achievement_alert_enabled === 1,
      row.updated_at,
    ],
  )
  return 1
}

async function copyNotificationLog(): Promise<number> {
  const rows = sqlite
    .prepare(`SELECT id, kind, payload, fired_at FROM notification_log`)
    .all() as any[]
  for (const row of rows) {
    await pg.query(
      `INSERT INTO notification_log (id, kind, payload, fired_at)
       VALUES ($1, $2, $3::jsonb, $4)`,
      [row.id, row.kind, row.payload, row.fired_at],
    )
  }
  return rows.length
}

async function fixSequences(): Promise<void> {
  const tables = [
    'targets',
    'analysis_categories',
    'recurring_transactions',
    'transactions',
    'tags',
    'notification_log',
  ]
  for (const table of tables) {
    await pg.query(
      `SELECT setval(pg_get_serial_sequence($1, 'id'),
                     COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`,
      [table],
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
