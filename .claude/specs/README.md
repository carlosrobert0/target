# `.claude/` — agent context

Project-specific context for Claude Code (or any agent). Two flavors:

## `skills/` — actionable workflows

Each skill is a `SKILL.md` with a `name` and `description`. The description tells the agent **when** to invoke the skill; the body tells it **how**. Skills should be triggered for specific kinds of tasks, not browsed manually.

| Skill                       | Trigger                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `add-data-feature`          | Adding a CRUD feature backed by SQLite — enforces the three-tier pattern |
| `add-transaction-category`  | Adding / renaming / removing a transaction category                     |
| `add-screen`                | Creating a new Expo Router route                                        |
| `sqlite-migration`          | Changing the SQLite schema (columns, constraints, table rebuilds)       |
| `eas-build`                 | Building or submitting via EAS                                          |
| `format-currency-ptbr`      | Touching code that displays or accepts monetary values                  |
| `pre-commit-check`          | Before committing or opening a PR                                       |

## `specs/` — reference documentation

Specs are markdown reference docs. Read them when you need to understand a concept, not when you're following a workflow.

| Spec                  | What it covers                                                          |
| --------------------- | ----------------------------------------------------------------------- |
| `data-layer.md`       | The three-tier (DB hook → service hook → UI) architecture and why      |
| `database-schema.md`  | All three tables, key queries, the no-version migration story           |
| `navigation.md`       | The Expo Router route map and the user flow between screens             |
| `budget-analysis.md`  | How the 50/30/20 model is stored, validated, and rendered               |
| `conventions.md`      | Language, naming, formatting, imports — things lint doesn't enforce     |

## Where else context lives

- `CLAUDE.md` (repo root) — the entry-point summary every agent invocation reads.
- `.claude/settings.json` + `settings.local.json` — permissions config.
- `.prettierrc`, `eslint.config.js`, `tsconfig.json` — tooling config (authoritative over anything in the specs).
