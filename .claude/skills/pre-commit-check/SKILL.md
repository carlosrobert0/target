---
name: pre-commit-check
description: Use before committing or opening a PR — runs the project's lint, manually checks the conventions this codebase enforces that lint can't catch (pt-BR strings, no database-hook imports from screens, query-key shape, Suspense wrapping). Run this instead of trusting a green lint output, which is necessary but not sufficient here.
---

# Pre-commit checklist

`yarn lint` is the only automated check. It catches Prettier formatting and a few ESLint rules. Everything below is enforced by convention only — check it manually.

## 1. Lint

```bash
yarn lint
```

If it fails on Prettier formatting, the message usually points at the file/line. There is no `--fix` script wired up; let Prettier rewrite via your editor or run `npx prettier --write <file>`.

## 2. Three-tier integrity

Screens and components must NOT import from `src/database/...`. Verify:

```
Grep -n "from '@/database/" src/components src/app
```

Any match outside `src/hooks/services/...` is a bug — move the call into a service hook.

## 3. pt-BR for user-facing strings

User-visible strings (Alert titles/messages, button labels, headers, empty-state copy) are Portuguese. Code identifiers, query keys, type names are English.

```
Grep -n "Alert.alert\(" src
```

Scan results: if you see English in arg 1 or 2 of `Alert.alert`, fix it.

## 4. Query keys

React Query keys are flat string arrays: `['targets']`, `['summary']`, `['transactions', targetId]`. Don't introduce nested objects or arbitrary structures — the conventions in `src/hooks/services/...` rely on simple invalidation patterns.

## 5. Suspense wrapping

Data-fetching screens must have a `<Suspense fallback={<Loading />}>` somewhere up the tree, because `SQLiteProvider` is configured with `useSuspense`. Either rely on the one in `_layout.tsx` or add one to your screen for finer-grained loading UI. Verify the screen renders with the loading state before its data is ready.

## 6. Sign convention on amounts

If you added new SQL that touches `transactions.amount`:

- Income / "Entradas" → `amount > 0`
- Expense / "Saídas" → `amount < 0`
- Total → `SUM(amount)` (don't `ABS` it).

See `useTransactionDatabase.summary()` for the canonical pattern.

## 7. No raw category strings

If you added code that compares to a category, it should use `TransactionCategories.X`, not the literal Portuguese string. Raw strings will silently drift from the enum if a label is ever renamed.

```
Grep -n "'Alimentação'\|'Transporte'\|'Lazer'\|'Saúde'" src
```

Only `migrate.ts` and `useAnalysisCategoriesDatabase.ts` should match (those store/parse the labels). Anywhere else, route through the enum.

## 8. Commit message style

Repo history uses lowercase Portuguese imperative with conventional-commits prefixes: `feat:`, `fix:`. Examples from `git log`:

```
feat: adjust components and icons and splash screen
feat: deploy
```

Keep the style — short, lowercase, prefix + colon + space.
