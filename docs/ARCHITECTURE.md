# Architecture — 1x1 Trainer

## Overview

Offline mental-arithmetic trainer for children. One React Native codebase (Expo)
ships to Android (Play Store) and to the web as a PWA. No backend, no account —
all state lives on the device.

```
Player picks operation + difficulty
        ↓
useGameLogic  (task generation, validation, session tracking)
        ↓
AsyncStorage  (profiles, stats, badges, preferences)
        ↓
useBadges     (unlock rules) → BadgeUnlockToast
```

## Directory Structure

The repo root is the app root — there is no `src/`. Tests live next to the file
they cover (`useGameLogic.ts` / `useGameLogic.test.tsx`).

```
/                          # Repo root = app root
├── App.tsx                # Root component, providers, navigation state
├── index.js / index.ts    # Expo entry points (native / web)
├── components/            # UI components + their .test.tsx files
│                          #   GameCard, Chip, Badge, BadgesModal,
│                          #   BadgeUnlockToast, Header, FloatingStars, …
├── hooks/                 # Stateful logic, one concern each
│   ├── useGameLogic.ts    #   task generation, answer checking, session flow
│   ├── useBadges.ts       #   unlock rules and badge state
│   ├── usePreferences.ts  #   theme, language, sound, number range
│   ├── useKeyboardInput.ts
│   ├── useSounds.ts
│   └── useTheme.ts
├── utils/
│   ├── constants.ts       #   STORAGE_KEYS, task counts, challenge tuning
│   ├── storage.ts         #   AsyncStorage wrapper, profile CRUD, reset
│   ├── platform.ts        #   web/native branches (+ .native.ts variant)
│   ├── theme.ts, animations.ts, language.ts
├── types/game.ts          # GameMode, Operation, AnswerMode, DifficultyMode, …
├── i18n/translations.ts   # de / en strings
├── styles/modalStyles.ts  # shared modal styling
├── plugins/               # Expo config plugins (withResizeableActivity)
├── scripts/               # post-build.js, bump-version.sh, validate-release.sh
├── public/                # PWA manifest, icons, service worker, assetlinks.json
└── docs/                  # Project documentation
```

## Key Decisions

### No backend, no account

Everything is stored locally via `AsyncStorage`. This is a children's app — it
avoids privacy obligations around minors' data entirely and keeps the app fully
usable offline. The consequence: **there is no cross-device sync**, and clearing
app data is irreversible. Profile handling in `utils/storage.ts` is therefore the
one place where data loss can occur, and it is treated conservatively.

### Multiple local profiles instead of accounts

`STORAGE_KEYS.PROFILES` holds a list of named profiles with an
`ACTIVE_PROFILE_ID`. Per-profile keys (streak, task stats, badges, high score)
are namespaced through `profileKey(key, profileId)`, so switching profiles swaps
the whole progress set. Siblings can share one device without logins.

Profiles were added after release, so `migrateToProfiles()` runs once on first
launch and copies the pre-existing global keys into a default profile ("Kind 1").
Do not remove it — without it, existing users lose their progress on upgrade.

### Game variants are enums, not separate screens

`types/game.ts` models the variation space as orthogonal enums — `Operation`
(add/sub/mul/div) × `GameMode` (which operand is hidden) × `AnswerMode` (typed,
multiple choice, number sequence) × `DifficultyMode` × `NumberRange`. All of it
is resolved inside `useGameLogic`, so a new combination needs no new screen.

### One codebase for native and web

`utils/platform.ts` (with a `.native.ts` counterpart) isolates the branches
instead of scattering `Platform.OS` checks. Web builds go through
`expo export --platform web` plus `scripts/post-build.js`, which copies PWA
assets Expo does not emit (manifest, service worker, icons, `assetlinks.json`
for the TWA link).

### Crashlytics is native-only

`@react-native-firebase/crashlytics` is wired for the Android build; the web
build has no crash reporting.

## Data Flow

### Answering a task

```
useGameLogic.generateTask()      → task honouring operation/mode/range
  → user input (typed | choice | sequence)
  → useGameLogic.checkAnswer()   → correct? streak++ : lives--
  → session record updated       → TaskStat / SessionRecord
  → useBadges evaluates unlocks  → BadgeUnlockToast
  → AsyncStorage persists the active profile's progress
```

### Challenge mode

Runs on `ChallengeState` (lives, level, high score). Levels come from
`getChallengeLevel()` in `utils/constants.ts`; the run ends at zero lives and
writes `CHALLENGE_HIGHSCORE` if beaten.

## Environments

| Environment  | URL / Target                            | Build                     |
| ------------ | --------------------------------------- | ------------------------- |
| Production   | https://s540d.github.io/1x1_Trainer/    | `npm run deploy`          |
| Play Store   | `com.sven4321.trainer1x1`               | siehe unten               |
| Local web    | Expo dev server (port printed on start) | `npm run web`             |
| Local native | Android/iOS device or emulator          | `npm run android` / `ios` |

### Paketnamen

Es gibt zwei Android-Paketnamen, und das ist Absicht:

- `com.sven4321.trainer1x1` — der **Play-Store-Paketname**. Darauf ist auch
  `google-services.json` (Firebase/Crashlytics) registriert und darauf zeigt
  `assetlinks.json` für die Deep Links.
- `com.devsven.x1x1trainer` — der Default in `app.json`, nur für Dev-Builds.

`app.config.js` überschreibt den Namen zur Build-Zeit aus `APP_PACKAGE`:

```js
package: process.env.APP_PACKAGE || base.expo.android.package,
```

Store-Builds müssen die Variable also setzen — sonst entsteht ein AAB mit dem
Dev-Paketnamen, das der Play Store ablehnt und dem Firebase keine Daten
zuordnet:

```
APP_PACKAGE=com.sven4321.trainer1x1 npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease
```

In CI kommt `APP_PACKAGE` aus den Repo-Secrets (`build-android.yml`).
`npm run build:android` ruft `eas build` auf; die Store-AABs entstehen aktuell
lokal über den Weg oben. Hintergrund: Issue #233 / PR #244.

## Testing

Jest with `jest.config.js`; tests sit beside their sources. `npm test` runs the
suite, `npm run test:coverage` produces the report. `scripts/validate-release.sh`
gates a release build.
