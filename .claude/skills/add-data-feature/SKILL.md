---
name: add-data-feature
description: Use when adding a new CRUD feature backed by SQLite (a new entity/table or new operations on targets/transactions). Walks through the project's mandatory three-tier pattern — database hook → service hook → screen — so the new feature stays consistent with the rest of the codebase.
---

# Adding a data-backed feature

This project has a strict three-tier separation. Skipping a tier or mixing layers will create inconsistencies with every other feature. Follow this checklist in order.

## 1. Schema (only if you need a new table or column)

Edit `src/database/migrate.ts`. The `migrate()` function is idempotent (`CREATE TABLE IF NOT EXISTS`, `INSERT OR IGNORE`). For schema changes on an existing user device, **`CREATE TABLE IF NOT EXISTS` will not add new columns** — you must either:

- For dev: uninstall/reinstall the app so the table is dropped, OR
- For prod-safe migrations: add an `ALTER TABLE ... ADD COLUMN` block guarded by a version check or try/catch (see `useTransactionDatabase.migrate()` for the pattern).

Sign convention reminder: `transactions.amount > 0` = income, `< 0` = expense. Preserve this in any new aggregate query.

## 2. Types

Add or extend the type in `src/@types/<entity>.ts`. Conventions:

- `<Entity>Create` — input shape for inserts (no `id`, no timestamps).
- `<Entity>Response` — row shape returned by SELECT (`id: number`, dates as `Date`).
- `<Entity>Props` — formatted shape for UI (strings, with `id: string`).

## 3. Database hook — `src/database/use<Entity>Database.ts`

Wraps `useSQLiteContext()`. Each function returns raw rows. **No** React Query, **no** `numberToCurrency`, **no** `router`, **no** `Alert`. Use `database.prepareAsync()` + `$param` placeholders for writes; `database.getAllAsync()` / `getFirstAsync()` for reads. Catch errors with `console.error` and return `[]` / `null` if the caller can tolerate it; otherwise let them throw.

## 4. Service hook — `src/hooks/services/<entity>/use<Action>.ts`

One file per action. Use `useQuery` for reads, `useMutation` for writes. This is where:

- Currency formatting via `numberToCurrency(...)` and percentage formatting (`(n).toFixed(0) + '%'`)
- `Alert.alert('Título', 'Mensagem em pt-BR', [...])` for success and error
- `router.back()` / `router.navigate(...)` side-effects on success
- Query keys as flat strings: `['targets']`, `['summary']`, `['transactions', targetId]`

Mutations generally do **not** invalidate queries — the app relies on `focusManager` (wired in `_layout.tsx` via `useAppState`) to refetch when a screen regains focus. Only call `queryClient.invalidateQueries({ queryKey: [...] })` if the consuming screen is already mounted and visible at the moment the mutation completes.

## 5. UI

Screens import **only** the service hook, never the database hook. Wrap data-fetching screens in `<Suspense fallback={<Loading />}>` (the SQLite provider uses `useSuspense`). All user-visible strings are pt-BR.

## 6. Verify

```bash
yarn lint
```

Then run the app (`yarn start` requires the custom dev client — `npx expo start` alone will fail because of `expo-sqlite`). Exercise the feature; the UI is the source of truth for "done", not type checks.
