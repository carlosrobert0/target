---
name: sqlite-migration
description: Use when changing the SQLite schema — adding/removing/renaming a column, adding a new table, changing a constraint, or backfilling data. The naive `CREATE TABLE IF NOT EXISTS` pattern in migrate.ts silently no-ops on upgrade devices, so column changes won't appear for existing users without explicit ALTER statements. This skill covers the safe pattern.
---

# Changing the SQLite schema

The migration story in this app is intentionally simple, but it has sharp edges. There is **no version tracking** — `src/database/migrate.ts` just runs idempotent DDL at app boot via `onInit={migrate}` on `SQLiteProvider`.

## What works without thinking

- **New table** → add `CREATE TABLE IF NOT EXISTS <name> (...)`. Safe everywhere.
- **New seed row** → `INSERT OR IGNORE INTO ... VALUES (...)`. Only inserts on first install; existing users keep their current data.

## What does NOT work

- **Adding a column with `CREATE TABLE IF NOT EXISTS`** — the statement is a no-op for users who already have the table. The column never appears on upgrade devices. You get a heisenbug where fresh installs work and updates don't.
- **Renaming a column** — same issue; SQLite < 3.25 doesn't support `ALTER TABLE RENAME COLUMN`.
- **Changing a type/constraint on an existing column** — SQLite doesn't support `ALTER COLUMN`. Requires table rebuild (see below).

## Safe pattern: add a column (`safeAlter`)

`migrate.ts` exports a private `safeAlter` helper that wraps any `ALTER TABLE` in a try/catch (SQLite throws if the column already exists; there is no `IF NOT EXISTS` for columns). **Use it at the bottom of `migrate()` after all `CREATE TABLE IF NOT EXISTS` blocks:**

```ts
// In src/database/migrate.ts, at the end of the migrate() function:
await safeAlter(database, `ALTER TABLE transactions ADD COLUMN my_field TEXT`)
await safeAlter(database, `ALTER TABLE targets ADD COLUMN some_flag INTEGER NOT NULL DEFAULT 0`)
```

The `safeAlter` function:

```ts
async function safeAlter(database: SQLiteDatabase, sql: string) {
  try {
    await database.execAsync(sql)
  } catch {
    // Column or object already exists — ignore
  }
}
```

This is the canonical pattern in the project. Do not add a `migrate()` method inside a database hook and call it from a screen — centralise all schema changes in `src/database/migrate.ts`.

## Safe pattern: rebuild a table

When you need to add a `NOT NULL` column with no default, add a constraint, or rename a column, rebuild the table inside a transaction:

```ts
await database.execAsync(`
  BEGIN TRANSACTION;

  CREATE TABLE transactions_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id INTEGER NOT NULL,
    amount FLOAT NOT NULL,
    new_required_col TEXT NOT NULL DEFAULT 'fallback',
    -- ...rest of new schema...
    CONSTRAINT fk FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
  );

  INSERT INTO transactions_v2 (id, target_id, amount, new_required_col)
    SELECT id, target_id, amount, 'fallback' FROM transactions;

  DROP TABLE transactions;
  ALTER TABLE transactions_v2 RENAME TO transactions;

  COMMIT;
`)
```

Always wrap in `BEGIN` / `COMMIT` so a failure rolls back cleanly.

## Foreign keys

`PRAGMA foreign_keys = ON` is set at the top of `migrate.ts`. The `transactions.target_id → targets.id` FK uses `ON DELETE CASCADE` — deleting a target wipes its transactions. Preserve this when rebuilding `transactions`.

`recurring_transactions.target_id → targets.id` also has `ON DELETE CASCADE`. Same rule.

`transaction_tags` has two FKs, both `ON DELETE CASCADE`. When rebuilding either referenced table, recreate these.

## Indexes

New indexes follow the pattern `CREATE INDEX IF NOT EXISTS idx_<table>_<column> ON <table> (<column>)`. Add them in the main `execAsync` block (safe to re-run). Conditional indexes (e.g. `WHERE is_active = 1`) are already used — same pattern.

## Seeded data

`analysis_categories` is seeded on first install via `INSERT OR IGNORE`. If you change the shape of a category row, also update:

- The `INSERT OR IGNORE` seed block in `migrate.ts`
- The `DEFAULT_CATEGORIES` constant in `src/database/useAnalysisCategoriesDatabase.ts` (used as fallback when the DB load fails)

## Adding a new table checklist

1. Add `CREATE TABLE IF NOT EXISTS` block to the big `execAsync` call.
2. Add `CREATE INDEX IF NOT EXISTS` lines if needed.
3. Add the TypeScript row type in `src/@types/<entity>.ts`.
4. Create `src/database/use<Entity>Database.ts` following the three-tier pattern.
5. Create service hooks in `src/hooks/services/<entity>/`.
6. If the table needs seed data, add `INSERT OR IGNORE`.

## Verification checklist

1. Test on a device with the **old schema** (do not uninstall): migration must run without error and the new column/table must exist.
2. Test on a **fresh install**: `CREATE TABLE IF NOT EXISTS` must produce the full new schema.
3. Run `npx tsc --noEmit` — any column name mismatch between SQL aliases and TypeScript types shows up here.
