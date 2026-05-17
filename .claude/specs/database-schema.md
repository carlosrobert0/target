# Database schema

Local SQLite via `expo-sqlite`. Database file: `cofrin.db`. Provider configured in `src/app/_layout.tsx`:

```tsx
<SQLiteProvider onInit={migrate} databaseName="cofrin.db" useSuspense>
```

Schema lives in `src/database/migrate.ts` and runs on every app boot (idempotent).

## Tables

### `targets`

A savings goal.

| Column     | Type      | Notes                                  |
| ---------- | --------- | -------------------------------------- |
| id         | INTEGER   | PK, AUTOINCREMENT                      |
| name       | TEXT      | NOT NULL                               |
| amount     | FLOAT     | NOT NULL — the goal amount             |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP              |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, set in code |

`updated_at` is updated explicitly in `useTargetDatabase.update()` via `updated_at = CURRENT_TIMESTAMP`. There is no trigger.

### `transactions`

Money in or out, attached to a target.

| Column      | Type      | Notes                                              |
| ----------- | --------- | -------------------------------------------------- |
| id          | INTEGER   | PK, AUTOINCREMENT                                  |
| target_id   | INTEGER   | NOT NULL, FK → targets(id) ON DELETE CASCADE       |
| amount      | FLOAT     | NOT NULL. **Sign matters**: > 0 income, < 0 expense |
| observation | TEXT      | Free-text note                                     |
| category    | TEXT      | One of `TransactionCategories` enum values (pt-BR) |
| created_at  | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP                          |
| updated_at  | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP                          |

`PRAGMA foreign_keys = ON` is set in `migrate.ts`, so deleting a target cascades to its transactions.

### `analysis_categories`

The three buckets of the 50/30/20 budget model. Seeded on first install.

| Column     | Type      | Notes                                                                 |
| ---------- | --------- | --------------------------------------------------------------------- |
| id         | INTEGER   | PK                                                                    |
| key        | TEXT      | UNIQUE — `essentials` / `wants` / `investments`                       |
| name       | TEXT      | pt-BR display name (`Essenciais`, `Desejos`, `Investimentos`)         |
| percentage | INTEGER   | Allocated % of budget. The three rows must sum to 100 (enforced in code) |
| color      | TEXT      | Color token name (`green`, `yellow`, `blue`)                          |
| categories | TEXT      | **JSON-stringified** array of `TransactionCategories` values          |
| examples   | TEXT      | Free-form pt-BR example list shown in UI                              |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP                                             |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP                                             |

`categories` is opaque to SQL — read/write only through `useAnalysisCategoriesDatabase` which `JSON.parse` / `JSON.stringify` it. Seed values are in `migrate.ts` (`INSERT OR IGNORE`).

## Key queries (canonical patterns)

### Targets sorted by progress (home screen)

`useTargetDatabase.listByClosestTarget()`:

```sql
SELECT
  targets.id,
  targets.name,
  targets.amount,
  COALESCE(SUM(transactions.amount), 0) AS current,
  COALESCE((SUM((transactions.amount) / targets.amount)) * 100, 0) AS percentage
FROM targets
LEFT JOIN transactions ON targets.id = transactions.target_id
GROUP BY targets.id, targets.name, targets.amount
ORDER BY percentage DESC
```

`LEFT JOIN` + `COALESCE` so targets with no transactions yet still appear at `current = 0` / `percentage = 0`.

### Income vs. expense summary

`useTransactionDatabase.summary()`:

```sql
SELECT
  COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS input,
  COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS output
FROM transactions
```

Note: `output` is negative.

### Spending by category (reports)

`useTransactionDatabase.summaryByCategory()`:

```sql
SELECT
  COALESCE(category, 'Sem categoria') as category,
  SUM(amount) as total
FROM transactions
WHERE amount < 0
GROUP BY category
ORDER BY total ASC
```

Filters to expenses only.

## Migration story

There is no version table — migrations rely entirely on `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE`. This works for new installs but **not** for upgrading existing devices when columns or constraints change. See the `sqlite-migration` skill for safe patterns when you must alter an existing table.

## Type bindings

Row shapes live in `src/@types/target.ts` and `src/@types/transaction.ts`. Database hooks pass these as generics to `getAllAsync<T>` / `getFirstAsync<T>`. Keep the TS types in sync when the schema changes — there's no runtime validation.
