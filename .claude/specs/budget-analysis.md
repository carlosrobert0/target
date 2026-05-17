# Budget analysis (50/30/20)

The Reports screen groups spending into three buckets based on category, then compares actual spending against a configurable target percentage.

## The model

| Bucket key     | pt-BR name    | Default % | Default categories                                  |
| -------------- | ------------- | --------- | --------------------------------------------------- |
| `essentials`   | Essenciais    | 50        | Alimentação, Transporte, Moradia, Saúde             |
| `wants`        | Desejos       | 30        | Lazer, Entretenimento, Vestuário                    |
| `investments`  | Investimentos | 20        | Educação, Tecnologia, Outros                        |

These defaults come from the classic 50/30/20 budget. Both the percentages and the category assignments are user-editable via the in-app Configurações modal.

## Where it lives

| Concern                            | File                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| SQLite table + seed                | `src/database/migrate.ts` (table `analysis_categories`) |
| DB hook (load/update)              | `src/database/useAnalysisCategoriesDatabase.ts`         |
| React Context wrapping the screen  | `src/contexts/AnalysisConfigContext.tsx`                |
| Screen + modals                    | `src/app/reports.tsx`, `src/components/Reports/`        |
| Category enum                      | `src/utils/TransactionCategories.ts`                    |

## Invariants enforced in code

1. **Three buckets only.** The shape is hardcoded as `{ essentials, wants, investments }` in the context and in the `DEFAULT_CATEGORIES` fallback. Adding a fourth bucket requires schema + context + UI changes.
2. **Percentages must sum to 100.** `saveConfigurations()` in `AnalysisConfigContext` throws if `essentials.percentage + wants.percentage + investments.percentage !== 100`.
3. **A category belongs to at most one bucket.** `toggleCategory()` removes the category from all other buckets before adding it to the editing bucket. The `isCategoryUsedElsewhere` helper exists for UI hints.
4. **Categories are stored as JSON in one column.** This is a pragmatic choice — not a join table. The trade-off: you can't query "which bucket does category X belong to" in SQL, but the loads are cheap and the data is small (always 3 rows × ~5 categories).

## Update flow

The update function in `useAnalysisCategoriesDatabase` is destructive — it `DELETE`s all rows and re-`INSERT`s the new state, wrapped in a transaction:

```sql
BEGIN TRANSACTION;
DELETE FROM analysis_categories;
-- INSERT each bucket
COMMIT;  -- or ROLLBACK on error
```

This means: any external row in `analysis_categories` will be dropped on save. There are no extra rows today, but if you ever add per-user-custom buckets, redesign this.

## Reports rendering

`src/app/reports.tsx` does two things at once:

1. Fetches actual spending grouped by category (`useSummaryByCategory`).
2. Reads the user's bucket configuration (`useAnalysisConfig`).

If the user has no transactions yet, the screen falls back to a `mockData` array (defined inline in `reports.tsx`) so the layout still renders something — a `MockDataWarning` component informs the user. When real data arrives, the mock is replaced.

## Adding bucket-related features

- **New visualization on Reports**: add a component under `src/components/Reports/`, consume the context with `useAnalysisConfig()`.
- **New configurable field per bucket** (e.g. an icon): add column to `analysis_categories`, update seed in `migrate.ts`, update `AnalysisCategory` interface in `useAnalysisCategoriesDatabase.ts`, update the modal in `src/components/Reports/ConfigurationModal.tsx`. Watch the JSON column — it's just for `categories`, not new fields.
- **A new category**: see the `add-transaction-category` skill — the enum, the seed, and the fallback must move together.
