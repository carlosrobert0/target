---
name: add-screen
description: Use when adding a new screen/route to the app (e.g. "add a settings screen", "create a screen to edit transactions"). Expo Router is file-based — the file path under `src/app/` is the route. This skill captures the conventions specific to this app: Suspense for data screens, pt-BR strings, SafeAreaView usage, and which providers wrap which subtrees.
---

# Adding a screen

Routes are file-based under `src/app/`. The mapping:

| File path                          | URL                | Notes                                |
| ---------------------------------- | ------------------ | ------------------------------------ |
| `src/app/index.tsx`                | `/`                | Home                                 |
| `src/app/reports.tsx`              | `/reports`         | Wrapped in `AnalysisConfigProvider`  |
| `src/app/target/index.tsx`         | `/target`          | Create-target form                   |
| `src/app/target/[id].tsx`          | `/target/:id`      | Edit-target form                     |
| `src/app/transaction/[id].tsx`     | `/transaction/:id` | Create transaction for target `:id`  |
| `src/app/in-progress/[id].tsx`     | `/in-progress/:id` | Target detail + transactions list    |

## Template for a new screen

```tsx
import { StatusBar, View } from 'react-native'
import { Suspense } from 'react'

import { PageHeader } from '@/components/PageHeader'
import { Loading } from '@/components/Loading'

export default function MyScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" translucent />

      <Suspense fallback={<Loading />}>
        <View className="size-full">
          <PageHeader title="Título em pt-BR" />
          {/* ... */}
        </View>
      </Suspense>
    </>
  )
}
```

## Conventions

- **Default export only** — Expo Router uses the default export as the route component.
- **Wrap data screens in `<Suspense fallback={<Loading />}>`** — the SQLite provider is configured with `useSuspense`, so any component that calls `useQuery` synchronously can suspend.
- **No need to wrap in `SafeAreaView`** — `_layout.tsx` already does that with `edges={['bottom']}`. Top-edge safe area is handled per-screen if needed (`reports.tsx` wraps the loading state in its own `SafeAreaView`).
- **Navigation**: use `router` from `expo-router`, not `useNavigation`.
  - `router.push('/target')` — push new route
  - `router.navigate(`/in-progress/${id}`)` — replace if same route, push otherwise
  - `router.back()` — pop
- **Dynamic params** for `[id].tsx` come from `useLocalSearchParams<{ id: string }>()`.
- **All UI strings in pt-BR.**
- **Don't fetch with bare `useSQLiteContext`** — go through a service hook (`src/hooks/services/...`). See the `add-data-feature` skill.

## When you need a provider

The only screen-scoped provider so far is `AnalysisConfigProvider` (wraps `reports.tsx`). If your screen needs cross-component state that doesn't fit React Query, wrap the screen component itself, not `_layout.tsx` — keep root-level providers minimal.

## Linking from elsewhere

After adding the screen, wire navigation in from the appropriate place (usually a `<Button onPress={() => router.push('/your-route')} />` or a list-row press handler). Search for similar `router.push` / `router.navigate` calls to match the calling convention.

## Verify

```bash
yarn lint
yarn start   # then exercise the route manually — types don't catch navigation typos
```
