---
name: eas-build
description: Use when the user asks to build a new binary, ship to Play Store, generate an APK/AAB, or run any `eas build` / `eas submit` command. For JS-only fixes that don't need a new binary, see the `eas-update` skill instead.
---

# Running an EAS build

The project uses EAS Build (cloud) — there is no local Gradle/Xcode setup. EAS CLI is required (`npm i -g eas-cli`) and the user must be logged in (`eas login`).

## Profiles (defined in `eas.json`)

| Profile       | Output             | OTA channel   | Notes                                                |
| ------------- | ------------------ | ------------- | ---------------------------------------------------- |
| `development` | Dev client APK     | `development` | `developmentClient: true`, internal distribution     |
| `preview`     | Internal-share APK | `preview`     | Android `buildType: apk`, internal distribution      |
| `production`  | Store-ready AAB    | `production`  | `buildType: app-bundle`, R8 + ProGuard enabled       |

Each profile is wired to a matching OTA channel via `channel: "..."` — that's how EAS Update knows which binary to target. **Don't change channel names** without coordinating with `eas update:list` history.

`cli.appVersionSource` is set to `"remote"`: **`android.versionCode` in `app.json` is ignored**. EAS keeps the source of truth on the server and auto-increments on each production build. The semver `version` string in `app.json` is still manual.

App identity (`app.json`): package / bundleId is `com.carlos.cofrin`. EAS project id is in `extra.eas.projectId`.

## Common commands

```bash
# Build
eas build --platform android --profile preview                 # APK for QA
eas build --platform android --profile production              # AAB for Play Store
eas build --platform android --profile production --no-wait    # fire and return (recommended in interactive sessions)

# Inspect
eas build:list                              # recent builds
eas build:list --platform android --limit 5
eas build:view <id>                         # details (status, URL, fingerprint)

# Cancel a queued/in-progress build
eas build:cancel <id>

# Submit (Play Store)
eas submit --platform android --latest      # uploads the most recent finished AAB
```

`eas submit` needs a Google Service Account JSON the first time (see [creating a service account](https://expo.fyi/creating-google-service-account)). Once uploaded, EAS stores it on the account — future submits don't prompt.

## R8 / ProGuard and mapping

The `production` profile builds with R8 obfuscation + resource shrinking enabled via `expo-build-properties` (see `app.json` `plugins`). The `mapping.txt` is **embedded inside the AAB** at `BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map`. Google Play Console usually detects it automatically; if it doesn't, extract via `unzip` and upload manually under **App Bundle Explorer → Downloads → Deobfuscation files**.

`extraProguardRules` in `app.json` already keeps Hermes Unicode, JNI and `expo-sqlite` classes. If you add a new native lib that uses reflection (e.g. Firebase, certain image processors) and the release build crashes on startup, that's the first place to extend.

## Before kicking off a production build

- **Bump `version` in `app.json` only for user-visible releases.** Bumping it invalidates OTA updates for existing installs (runtimeVersion policy is `appVersion`). For internal fixes, ship via `eas update` instead — see the `eas-update` skill.
- Run `yarn lint` and exercise the app via the dev client first. EAS builds take ~12–18 min — don't waste a slot on a typo.
- Confirm icon (`assets/adaptive-icon.png`) and splash (`assets/splash.png`) are up to date — these are baked into the binary.
- **Make sure there's no `android/` or `ios/` folder in the project root.** Their presence forces EAS into bare workflow and silently ignores `app.json` (including the `expo-build-properties` plugin → R8/ProGuard won't apply). They're now in `.gitignore` but `expo prebuild` / `npx expo run:android` will recreate them locally. Delete with `rm -rf android ios` before disparing a production build.

## When NOT to run a build

If the change is JS, assets, or anything that doesn't touch native code (no new `expo-*` lib, no Expo SDK bump, no manifest/permission edit, no version bump), **use EAS Update instead** — see the `eas-update` skill. OTA push takes ~30s vs ~15min + Play review for a fresh build.

If the user is iterating locally, point to `yarn start` (the dev client) — EAS builds are for distribution, not development.

## Costs / caveats

- Builds are billed against the EAS account. Don't kick one off speculatively.
- The first build on a new machine prompts for credentials (keystore on Android, certificates on iOS). EAS stores them on the cloud after the first run.
- iOS builds require an Apple Developer account.
- The first Play Store submission of a brand new app **must be done manually via the web UI**. `eas submit` only works for subsequent releases (Google API restriction).

## Build artifacts and project size

Don't commit AAB/APK/mapping files — `.gitignore` covers `*.aab`, `*.apk`, `mapping*.txt`. A leftover AAB in the project root inflates every `eas build` upload from ~1.4MB to ~60MB.
