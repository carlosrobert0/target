---
name: eas-build
description: Use when the user asks to build the app, ship a build, generate an APK, or run an EAS command (e.g. "build android preview", "submit to play store", "check build status"). Captures the three profiles configured in eas.json and the right command for each.
---

# Running an EAS build

The project uses EAS Build (cloud) — there is no local Gradle/Xcode build script in `package.json`. EAS CLI is required (`npm i -g eas-cli`) and the user must be logged in (`eas login`).

## Profiles (defined in `eas.json`)

| Profile       | Use case                                      | Notes                                         |
| ------------- | --------------------------------------------- | --------------------------------------------- |
| `development` | Custom dev client for `yarn start`            | `developmentClient: true`, internal distrib   |
| `preview`     | Internal-share APK for QA / testing           | Android = APK (not AAB), internal distrib     |
| `production`  | Store-ready build                             | `autoIncrement: true` bumps version automatically |

App identity (`app.json`): `bundleIdentifier` / `package` is `com.carlos.cofrin`. EAS project id is in `app.json` under `extra.eas.projectId`.

## Common commands

```bash
eas build --platform android --profile preview        # APK for QA
eas build --platform android --profile production     # AAB for Play Store
eas build --platform ios --profile production         # iOS production
eas build --platform all --profile production         # Both at once

eas build:list                                        # Recent builds
eas build:view <id>                                   # Details for a specific build
eas build:log --id <id>                               # Tail logs (or open in browser)

eas submit --platform android --latest                # Submit most recent build
```

## Before kicking off a production build

- Bump `version` in `app.json` if it's a user-visible release (EAS auto-increments `versionCode` / `buildNumber` because of `autoIncrement: true`, but the semver string `version` is manual).
- Run `yarn lint` and exercise the app via `yarn start` first — EAS builds take ~10–20 min, so don't waste a build on a typo.
- For Android, confirm the icon assets (`assets/adaptive-icon.png`) and splash (`assets/splash.png`) are up to date — these are baked into the build.

## Costs / caveats

- Builds are billed against the EAS account. Don't kick one off speculatively.
- The first build on a new machine prompts for credentials (keystore for Android, certificates for iOS). EAS stores these in the cloud after the first run.
- `iOS` builds require an Apple Developer account.

## When NOT to run a build

If the user is just iterating on JS code, point them to `yarn start` with the dev client — that's the inner loop. EAS builds are for distribution, not development.
