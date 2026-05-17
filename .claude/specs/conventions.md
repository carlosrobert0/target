# Conventions

The things that are enforced by code review or "feel", not by tooling. If something here is wrong, the codebase will look subtly off — but lint and TypeScript will both pass.

## Language

- **User-facing strings**: Portuguese (pt-BR). This includes Alert titles, button labels, empty-state messages, screen headers, error messages, examples in seed data.
- **Code identifiers**: English. Type names, variable names, function names, query keys.
- **Comments**: prefer English. There are some pt-BR comments today (`-- Inserir dados padrão`); don't sweep them up, but don't add more.

## Currency

- Stored as raw `number` (FLOAT in SQLite).
- Formatted only at the boundary, via `numberToCurrency` from `src/utils/numberToCurrency.ts`.
- Sign matters: `transactions.amount > 0` is income, `< 0` is expense.
- User input via `react-native-currency-input` (see `src/components/CurrencyInput.tsx`) — returns a `number`, not a string.

## Naming

- React Query keys: flat string arrays. `['targets']`, `['summary']`, `['transactions', targetId]`. Don't nest objects.
- Hook files: `use<Verb><Entity>.ts` for service hooks (`useCreateTarget.ts`, `useListTransactionsByTargetId.ts`).
- DB hook files: `use<Entity>Database.ts` (`useTargetDatabase.ts`).
- Types: `<Entity>Create` (insert input), `<Entity>Response` (raw row), `<Entity>Props` (formatted for UI).

## Formatting (Prettier)

`.prettierrc`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "bracketSameLine": true,
  "semi": false,
  "endOfLine": "auto"
}
```

There is no `lint:fix` script. Run `yarn lint` to check; rely on editor-on-save Prettier or `npx prettier --write <file>` to fix.

## Styling

- NativeWind v4 — use `className` on React Native components.
- Custom colors in `src/theme/colors.ts` are not exported as Tailwind tokens by default; they're for inline `style={{ color: colors.blue[500] }}` use. Most components use raw Tailwind palette via `className`.
- Inter font is loaded in `_layout.tsx` (`Inter_400Regular`, `Inter_500Medium`, `Inter_700Bold`). Font family helpers are in `src/theme/fontFamily.ts`.

## Path alias

`@/*` → `src/*`. Always use the alias for internal imports — relative imports (`../../../components/...`) are out of style here.

## Error handling

- Database hooks: catch with `console.error` and return `[]` or `null` when the caller can degrade; otherwise let it throw.
- Service hooks: handle in `onError` of the mutation/query with `Alert.alert('Erro', '<pt-BR message>')` + `console.log(error)`.
- Components: don't try/catch — let the service hook handle it.

## Imports order

By convention (not enforced):

1. React / React Native primitives
2. Third-party libs (`@tanstack/react-query`, `expo-router`, etc.)
3. `@/components/...`
4. `@/hooks/...`
5. `@/utils/...`, `@/theme/...`, `@/@types/...`
6. Blank line, then CSS / asset imports

## Commits

Conventional-commits prefixes, lowercase, Portuguese imperative:

- `feat: add ...`
- `fix: ...`
- `refactor: ...`
- `feat: deploy` (used when shipping a build)

Keep messages short — the diff is the source of truth.

## What goes in `_layout.tsx`

Only providers and bootstrapping that every screen needs:

- Font loading + SplashScreen control
- `useAppState` + `useOnlineManager` (React Query lifecycle)
- `QueryClientProvider`
- `SQLiteProvider` (with `onInit={migrate}`, `useSuspense`)
- A bottom-edge `SafeAreaView`

Per-screen concerns (`StatusBar`, headers, screen-specific contexts) stay in the screen file.

## What does NOT belong in this repo

- A backend or API layer — everything is local SQLite.
- A test suite — there isn't one. Don't introduce one piecemeal without discussion; if added, set up the runner config (jest, vitest) properly and update `package.json` scripts.
- A state-management library beyond React Query + Context. The Context pattern in `AnalysisConfigContext` is the upper limit of complexity here.
