# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**cofrin** — a personal savings/goal-tracking React Native (Expo) app in Portuguese (pt-BR). Users create financial "metas" (targets), record positive/negative transactions against them, and view spending reports grouped into a 50/30/20-style budget (Essenciais / Desejos / Investimentos). All data is local; there is no backend.

## Commands

```bash
yarn start          # expo start --dev-client (requires a custom dev client; bare `expo start` will not work because of expo-sqlite native module)
yarn android        # expo run:android
yarn ios            # expo run:ios
yarn web            # expo start --web
yarn lint           # expo lint (eslint-config-expo + prettier)
```

There is no test suite configured. Builds are done via EAS (`eas.json`): `development` / `preview` (APK, internal distribution) / `production` (auto-increments).

## Architecture

### Routing — Expo Router (file-based, `src/app/`)

- `_layout.tsx` is the root. It loads Inter fonts, mounts `SQLiteProvider` (database: `cofrin.db`, `onInit={migrate}`, `useSuspense`) inside `QueryClientProvider`, wires `useAppState` + `useOnlineManager` so React Query reacts to RN AppState + network changes, and renders a `<Slot />` inside a SafeAreaView.
- Route files: `index.tsx` (home), `target/index.tsx` + `target/[id].tsx` (create/edit target), `in-progress/[id].tsx` (target detail + its transactions), `transaction/[id].tsx` (create transaction for a target), `reports.tsx` (spending analysis).
- The path alias `@/*` → `src/*` is set in `tsconfig.json`. Use it for all internal imports.

### Data layer — three-tier pattern

There is a strict separation between **database hooks**, **service hooks**, and **components**. New data access must follow this pattern:

1. **`src/database/use*Database.ts`** — thin wrappers around `useSQLiteContext()` that expose raw async functions (`create`, `update`, `remove`, `show`, list/summary queries). They return plain rows; no React Query, no formatting, no UI side-effects. Example: `useTargetDatabase`, `useTransactionDatabase`, `useAnalysisCategoriesDatabase`.
2. **`src/hooks/services/<entity>/use*.ts`** — React Query hooks (`useQuery` / `useMutation`) that call the database hooks. This is where formatting (`numberToCurrency`, percentage strings), navigation side-effects (`router.back()`), and `Alert.alert` user feedback live. Query keys are flat strings like `['targets']`, `['summary']`, `['transactions', targetId]`.
3. **Components / route screens** consume only the service hooks — they should never import from `src/database/` directly.

### SQLite schema (`src/database/migrate.ts`)

Three tables, created on app start by `SQLiteProvider`'s `onInit`:

- `targets` (id, name, amount, created_at, updated_at)
- `transactions` (id, target_id FK → targets ON DELETE CASCADE, amount, observation, category, ...). Sign convention: **positive `amount` = income, negative = expense**. Summary queries split on `amount > 0` / `amount < 0`.
- `analysis_categories` — seeded with three rows (`essentials` 50%, `wants` 30%, `investments` 20%). The `categories` column is a JSON-stringified array of `TransactionCategories` enum values; load/update in `useAnalysisCategoriesDatabase.ts` parses/stringifies it. `update()` wraps DELETE+INSERTs in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`.

Categories: the enum in `src/utils/TransactionCategories.ts` is the source of truth for category names (Portuguese strings stored verbatim in the DB). When adding a category, update the enum AND the seed JSON in `migrate.ts`.

### Reports / analysis config

`src/contexts/AnalysisConfigContext.tsx` (`AnalysisConfigProvider` + `useAnalysisConfig`) is a React Context wrapped around `useAnalysisCategoriesDatabase`. It manages the 3-group budget allocation and exposes modal visibility flags (`isConfigModalVisible`, `isCategoriesModalVisible`). It enforces that the three percentages sum to 100 before saving. Only the reports screen is wrapped in this provider — do not depend on it elsewhere.

### Styling

NativeWind v4 (Tailwind for RN). `babel.config.js` sets `jsxImportSource: 'nativewind'`; `metro.config.js` wires `global.css` via `withNativeWind`. Use `className` on RN components. The custom color palette lives in `src/theme/colors.ts` and the Inter font family in `src/theme/fontFamily.ts` (re-exported from `src/theme/index.ts`).

### React Query integration

- `src/lib/query-client.ts` is a default `QueryClient` (no custom defaults).
- `useOnlineManager` (expo-network) and `useAppState` (RN AppState) keep `onlineManager` / `focusManager` in sync so queries refetch on reconnect / foreground.
- Mutations typically don't invalidate queries explicitly — they rely on `router.back()` + refocus-driven refetches. If you add a mutation whose result needs to appear on a screen that's already mounted and visible, invalidate the relevant query key explicitly.

## Conventions

- **Prettier**: `printWidth: 100`, `singleQuote: true`, `semi: false`, `tabWidth: 2`, `bracketSameLine: true`. Run `yarn lint` before finishing changes.
- **Language**: user-facing strings (Alerts, labels, errors) are Portuguese. Code identifiers are English. Keep this split.
- **User feedback** is via `Alert.alert` from `react-native` (not a toast library). Errors are caught in service hooks, not in components.
- **Currency**: monetary values are stored as raw `FLOAT` in SQLite. Format only at the presentation boundary with `numberToCurrency` from `src/utils/numberToCurrency.ts`.
- **Navigation**: use `router` from `expo-router` (`router.push`, `router.navigate`, `router.back`).
