---
name: add-transaction-category
description: Use when adding, renaming, or removing a transaction category (e.g. "add Pets category", "rename Lazer to Entretenimento"). Categories are referenced from three places that must be kept in sync: the TypeScript enum, the SQLite seed, and the default budget allocation. Missing one of these causes silent breakage on first-install devices vs. upgrade devices.
---

# Adding / changing a transaction category

A transaction category lives in three places. All three MUST be updated together.

## 1. Source of truth — the enum

`src/utils/TransactionCategories.ts`:

```ts
export enum TransactionCategories {
  FOOD = 'Alimentação',
  // add new member — the string is what gets stored in SQLite `transactions.category`
  PETS = 'Animais de estimação',
}
```

The enum **value** (Portuguese label) is stored verbatim in the database. Don't change a value without a migration — old rows will keep the old string and won't match.

## 2. SQLite seed — budget grouping

`src/database/migrate.ts` seeds `analysis_categories` with the three budget buckets (essentials / wants / investments). The `categories` column is a JSON-stringified array of label strings. Add your new label to whichever bucket it belongs to, e.g.:

```sql
INSERT OR IGNORE INTO analysis_categories (key, name, percentage, color, categories, examples)
VALUES ('essentials', 'Essenciais', 50, 'green',
       '["Alimentação","Transporte","Moradia","Saúde","Animais de estimação"]',
       'Moradia, alimentação, transporte, saúde, pets');
```

**`INSERT OR IGNORE` only runs on first install.** Existing users will not get the new category in their bucket unless they re-add it via the in-app Reports → Configurações modal. If the rollout must be automatic for existing users, write a migration that updates the row.

## 3. Default in-memory fallback

`src/database/useAnalysisCategoriesDatabase.ts` has a `DEFAULT_CATEGORIES` constant used when the table load fails. Add the new enum member to the corresponding bucket's `categories: [...]` array so the fallback matches the seed.

## 4. Sanity check

- `yarn lint`
- Search for hard-coded category strings: `Grep` for the old label across `src/`. Any switch/if comparing to a category should use `TransactionCategories.FOO`, not the raw string.
- If the new category needs an icon or color in the Reports charts, also update `src/components/Reports/`.

## Renaming a category (extra step)

Renaming the string value breaks all existing rows. Either:

- Keep the enum **key** the same and write a one-time `UPDATE transactions SET category = 'New' WHERE category = 'Old'` migration in `migrate.ts`, OR
- Add a new enum member and leave the old one as deprecated until you can backfill.

Never change a value silently.
