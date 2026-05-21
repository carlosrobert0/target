---
name: eas-update
description: Use when shipping a JS/asset-only fix without a new Play Store build — i.e. anything that doesn't touch native code. Triggers include "push an OTA", "hotfix", "send update to testers", "publish update", "rollback the bad release". For native changes (new expo-* module, SDK bump, manifest edit), use the `eas-build` skill instead.
---

# Shipping an OTA update with EAS Update

After a build with `expo-updates` installed is in the wild, JS and asset changes can be pushed in seconds via `eas update`. The app checks the configured channel on startup, downloads the new bundle in the background, and applies it on the next launch.

## What you CAN ship via OTA

✅ TypeScript / JavaScript code (components, hooks, services, utilities)
✅ Assets that ship with the JS bundle (images, fonts via `require`, JSON)
✅ Tailwind / NativeWind class changes
✅ SQL queries (they're just strings in JS calling the local SQLite)
✅ React Query keys, mutations, query functions
✅ Route changes inside `src/app/` (Expo Router)

## What you CANNOT ship via OTA — requires a new build

❌ Adding / removing native modules (`expo-camera`, `react-native-mmkv`, etc.)
❌ Bumping the Expo SDK (53 → 54)
❌ Changes to `app.json` plugins, permissions, manifest, or `expo-build-properties`
❌ ProGuard / R8 rules, splash screen config, icon, package name
❌ **Bumping `version` in `app.json`** — runtimeVersion policy is `appVersion`, so a version bump breaks compatibility with existing installs (they keep listening on the old runtime)
❌ Any change that would alter the native fingerprint

If you're unsure whether something needs a build, check `eas update --help` and look for "fingerprint" — when it changes, OTA can't reach the old binary.

## Channels and binaries

Each EAS Build profile is wired to a channel in `eas.json`:

| Profile       | Channel       | Targets                          |
| ------------- | ------------- | -------------------------------- |
| `development` | `development` | dev-client APKs                  |
| `preview`     | `preview`     | preview APKs (internal testing)  |
| `production`  | `production`  | AABs in Play Store / closed test |

A binary only listens for updates on its channel. Pushing to `preview` doesn't touch production users.

## Common commands

```bash
# Push an update to production (closed-test users + Play Store users)
eas update --channel production --message "fix: descrição do que mudou"

# Push to preview only (your QA APK)
eas update --channel preview --message "test: ..."

# Push to all channels at once (rare — use carefully)
eas update --branch main --message "..."

# List recent updates
eas update:list
eas update:list --branch <branch>

# View a specific update
eas update:view <update-id>

# Channel ↔ branch mapping (advanced)
eas channel:view production           # which branch is `production` pointing at
eas channel:edit production --branch hotfix-2026-05-21
```

## How a typical OTA fix looks

```bash
# 1. Make the JS change locally, commit
git add src/...
git commit -m "fix: button overflow on small screens"

# 2. (optional) Test on the preview channel first
eas update --channel preview --message "fix: button overflow"
# Reopen the preview APK on your device → confirm fix landed.

# 3. Push to production
eas update --channel production --message "fix: button overflow on small screens"
```

The update is on the Expo CDN in ~30 seconds. Users who open the app within the next few hours will get it on their next launch. There's **no Play Store review** for OTA.

## Rolling back a bad update

If you shipped something broken, two options in increasing severity:

```bash
# Option A — point the channel back at an older branch/update
eas update:list --branch production         # find the previous good update
eas channel:edit production --branch <previous-branch>

# Option B — emergency: revert all installs to the JS bundle that was
# embedded in the AAB they originally downloaded
eas update:roll-back-to-embedded --channel production --message "rollback: critical bug"
```

Option B is the safest disaster recovery — it ignores all OTAs and forces clients back to the JS that shipped with the binary itself. Use when an OTA broke startup and you can't push a real fix in time.

## runtimeVersion policy

Currently configured as `"appVersion"` in `app.json`. This means:

- Any change to the `version` string in `app.json` (e.g. `1.1.0` → `1.2.0`) creates a new runtime. OTAs published before the bump won't reach installs on the new version, and vice versa.
- Trade-off: simpler mental model. Cost: have to think about whether a version bump is needed.

If we ever migrate to `"fingerprint"`: Expo computes a hash of the native fingerprint and uses that. Native changes invalidate updates; non-native changes (even version bumps) don't. It's more flexible but adds setup complexity. Not needed for the current scale.

## Don't ship via OTA when

- The change requires native code execution that isn't yet in the app (will crash on old installs that don't have it).
- The change breaks data shape consumed by existing screens (older opened screens may keep using cached props/state — a JS-only update can race with mounted views).
- Major refactors that change SQLite schema — the `migrate.ts` runs on app startup, so by the time the new JS is active the schema may not match yet. For schema changes, prefer a fresh AAB so the migration runs deterministically.

## Don't run an update speculatively

Each `eas update` creates a manifest on the Expo server and counts against your monthly active user quota (1k MAU free tier). Don't push trivial things like commented-out code. Bundle multiple JS fixes into a single update when possible.
