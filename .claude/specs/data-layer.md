# Data layer

The three-tier rule is the single most important architectural decision in this app. Every data-backed feature must follow it. New code that mixes tiers is the most common form of inconsistency.

## The three tiers

```
┌──────────────────────────────────────────┐
│ UI (src/app/, src/components/)           │
│   - JSX, NativeWind className            │
│   - Imports service hooks only           │
│   - Wraps data screens in <Suspense>     │
└─────────────────┬────────────────────────┘
                  │ imports
                  ▼
┌──────────────────────────────────────────┐
│ Service hooks (src/hooks/services/<e>/)  │
│   - useQuery / useMutation               │
│   - Formats values (numberToCurrency)    │
│   - Side-effects: router.*, Alert.alert  │
│   - Query keys: ['targets'], etc.        │
└─────────────────┬────────────────────────┘
                  │ imports
                  ▼
┌──────────────────────────────────────────┐
│ Database hooks (src/database/use*DB.ts)  │
│   - useSQLiteContext()                   │
│   - prepareAsync + executeAsync          │
│   - Returns raw rows (number, Date, str) │
│   - No formatting, no React Query, no UI │
└──────────────────────────────────────────┘
```

## Tier 1: database hook

Files: `src/database/use<Entity>Database.ts`.

What it does:
- Calls `useSQLiteContext()` to get the active connection.
- Exposes async functions: `create`, `update`, `remove`, `show`, list/summary queries.
- Uses parameterized statements (`$name`, `$amount`) for writes.
- Uses `getAllAsync<Row>()` / `getFirstAsync<Row>()` with the row type as a generic.

What it does NOT do:
- No `useQuery` / `useMutation`.
- No `numberToCurrency` or string formatting.
- No `router.push` / `router.back`.
- No `Alert.alert`.

Error handling: either `console.error` + return `[]` (when the caller can tolerate empty), or let it throw and handle upstream. Don't both swallow and return — that hides bugs.

## Tier 2: service hook

Files: `src/hooks/services/<entity>/use<Action>.ts` — one file per logical action.

What it does:
- Wraps a database-hook call in `useQuery` (reads) or `useMutation` (writes).
- Formats outputs for UI consumption (currency strings, percentage strings, `id: String(id)`).
- On mutation success: shows `Alert.alert(...)` in pt-BR, then `router.back()` or navigates.
- On mutation error: shows a pt-BR alert, `console.log` the error for debugging.
- Defines query keys as **flat string arrays**: `['targets']`, `['summary']`, `['transactions', targetId]`. No nested objects.

Query invalidation: usually NOT explicit. The app's data flow relies on `focusManager` (`src/hooks/query/useAppState.tsx`) — when a screen regains focus after navigation, React Query refetches stale queries automatically. Only invalidate manually when the data must appear without a focus/blur cycle (e.g. a mutation triggered from a modal on the same screen).

## Tier 3: UI

Files: `src/app/**` and `src/components/**`.

What it does:
- Imports service hooks. **Never** imports from `src/database/`.
- Renders the data. Wraps the data path in `<Suspense fallback={<Loading />}>` because the SQLite provider uses `useSuspense`.
- Triggers mutations via the `mutate(...)` returned by the service hook.

## Why this matters

- **Testability**: the database hook is pure SQL access; the service hook is pure formatting + side-effects; the UI is pure presentation. Each layer can be reasoned about in isolation.
- **Consistency**: every screen in the app already follows this. Mixing tiers produces a "weird" feature that looks different from everything else.
- **Migration safety**: when the DB schema changes, you only have to look at `src/database/` to find every SQL query in the app.

## Anti-patterns seen in other React Native projects (avoid here)

- Calling `useSQLiteContext()` directly from a component.
- Formatting currency inside a database hook ("just this once").
- Passing already-formatted strings into a mutation, then parsing them back.
- Putting `Alert.alert` inside a database hook.
- Query keys like `['target', 'list', { filter: 'all' }]` — keep them flat.
