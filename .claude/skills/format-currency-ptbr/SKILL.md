---
name: format-currency-ptbr
description: Use when displaying or accepting monetary values, or when reviewing code that does. The app stores raw FLOAT in SQLite and formats only at the presentation boundary. Skipping this convention produces mixed string/number bugs and inconsistent BRL formatting.
---

# Currency and number formatting

## The convention

- **Store**: raw `number` (FLOAT in SQLite). Both income and expense live in `transactions.amount` with sign — positive = income, negative = expense.
- **Compute**: keep as `number`. Aggregations (`SUM`, percentage calculations) happen in SQL.
- **Display**: format at the **last possible moment** — usually inside a service hook (`src/hooks/services/...`) or right before passing to a UI component.

## Helpers

`src/utils/numberToCurrency.ts` — turns `1234.5` into `'R$ 1.234,50'` (pt-BR locale, BRL).

```ts
import { numberToCurrency } from '@/utils/numberToCurrency'

const formatted = numberToCurrency(value)         // value: number → 'R$ 1.234,50'
```

Percentages use raw `toFixed(0) + '%'` — there is no helper. Pattern from `useFindAllTargets.ts`:

```ts
percentage: percentage.toFixed(0) + '%'
```

## Currency input

For user input, use `react-native-currency-input` (already a dep) — see `src/components/CurrencyInput.tsx` for the project's wrapper. It returns a `number` on change, not a string. Hand that number straight to the service hook without re-parsing.

## Common mistakes to avoid

- **Don't** format inside the database hook. Database hooks return raw numbers; that's how the rest of the app expects them.
- **Don't** call `numberToCurrency` on an already-formatted string. Type checking won't catch this because `numberToCurrency`'s signature accepts `number | undefined`.
- **Don't** compute percentages or sums in JS if you can do it in SQL. See the `targets` query in `useTargetDatabase.listByClosestTarget` for the pattern (`COALESCE`, `SUM`, division producing percentage).
- **Don't** store currency as a string. It will break aggregation queries silently — SQLite will compare/sum lexicographically.

## Negative amounts in the UI

Expense rows display the value with sign preserved (e.g. `-R$ 50,00`). `numberToCurrency` handles this. Don't `Math.abs()` for display unless the surrounding label already conveys direction (e.g. "Gastos" with a positive number).
