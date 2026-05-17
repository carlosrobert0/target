# Navigation

Expo Router (file-based) — every `.tsx` file under `src/app/` is a route. The default export of each file is the screen component.

## Route map

| File                              | URL                  | Purpose                                                      |
| --------------------------------- | -------------------- | ------------------------------------------------------------ |
| `src/app/_layout.tsx`             | (root layout)        | Mounts providers (SQLite, QueryClient, SafeAreaView)         |
| `src/app/index.tsx`               | `/`                  | Home — list of targets, summary header, "Nova meta" button   |
| `src/app/target/index.tsx`        | `/target`            | Form: create a new target                                    |
| `src/app/target/[id].tsx`         | `/target/:id`        | Form: edit an existing target                                |
| `src/app/in-progress/[id].tsx`    | `/in-progress/:id`   | Target detail + its transactions list                        |
| `src/app/transaction/[id].tsx`    | `/transaction/:id`   | Form: add a transaction to target `:id`                      |
| `src/app/reports.tsx`             | `/reports`           | Spending analysis (wrapped in `AnalysisConfigProvider`)      |

## The user flow

```
/  (home)
├──→ /target                              "Nova meta" button
│    └──(submit)→ back to /
│
├──→ /in-progress/:id                     tap a target card
│    ├──→ /transaction/:id                "Nova transação" button
│    │    └──(submit)→ back to /in-progress/:id
│    └──→ /target/:id                     "Editar meta" button
│         └──(submit/delete)→ back to /
│
└──→ /reports                             tap reports icon
     └── modals: Configurações, Categorias (in-screen, not routes)
```

## Conventions

- **Use `router` from `expo-router`**, not `useNavigation`:
  - `router.push('/target')` — push a new route.
  - `router.navigate(\`/in-progress/\${id}\`)` — replace if same route, push otherwise. Used when navigating from a list row.
  - `router.back()` — pop. Used after successful mutations.
- **Dynamic params** come from `useLocalSearchParams<{ id: string }>()`. They arrive as strings — convert to `number` before passing to a database hook.
- **Back navigation on mutation success is wired in the service hook**, not the screen. See `useCreateTarget` for the canonical pattern: success → `Alert.alert` → `router.back()` in the alert's button.

## Layout providers

`_layout.tsx` mounts everything that needs to live above every screen:

1. `<Suspense fallback={<Loading />}>` — required because of `useSuspense` on SQLiteProvider.
2. `<QueryClientProvider client={queryClient}>` — React Query.
3. `<SQLiteProvider onInit={migrate} databaseName="cofrin.db" useSuspense>` — DB.
4. `<SafeAreaView edges={['bottom']}>` — bottom safe area only; top is per-screen.

Screen-scoped providers (only one so far): `AnalysisConfigProvider` wraps the `reports.tsx` screen contents. Keep this pattern — don't promote screen-specific providers to `_layout.tsx`.

## Status bar

Each screen sets its own `<StatusBar>` (from `react-native`). Most use `barStyle="light-content" translucent`. There is no central status-bar config.

## Modals

Reports has two modals (`ConfigurationModal`, `CategoriesModal`) implemented as RN `Modal` components, not as Expo Router modal routes. They're visibility-controlled by booleans on `useAnalysisConfig()`. If you add modals elsewhere, follow that pattern unless the modal needs to be deep-linkable.

## Adding a screen

See the `add-screen` skill for the template and gotchas.
