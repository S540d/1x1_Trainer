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

## Dependency Upgrades

### Expo-SDK-Upgrades in Einzelschritten

Größere Expo-SDK-Sprünge (z. B. 55 → 57, PR #278/Issue #276) immer
schrittweise fahren (55→56→57), jeweils anhand `bundledNativeModules.json`
der jeweiligen `expo`-Version — nicht `expo install --fix` / `expo-doctor`
verlassen, da diese in der CI/Remote-Umgebung durch den Proxy blockiert
werden können (nur `registry.npmjs.org` erreichbar, nicht `exp.host`).
Nach jedem Schritt `npx expo config --type public` gegen Warnungen prüfen.

### Bekannte offene npm-audit-Findings (Issue #276)

`npm audit` zeigt dauerhaft moderate Vulnerabilities, unabhängig von der
installierten SDK-Version — Root-Ursache ist `uuid <11.1.1` als transitive
Build-Time-Dependency von `xcode` → `@expo/config-plugins`. Betrifft nur
Prebuild/Config-Plugins, nicht den ausgelieferten App-Code; Fix liegt
upstream bei Expo/Firebase. Volle Diagnose: `docs/private/INCIDENTS.md`.

## Android Config Plugins

`android/` ist nicht versioniert (gitignored, wird per `expo prebuild`
generiert). Manifest-Änderungen wie `android:resizeableActivity="true"`
(Issue #275, PR #280) können deshalb nicht direkt in einer Datei gepflegt
werden, sondern brauchen ein Expo-Config-Plugin
(`plugins/withResizeableActivity.js`, via `withAndroidManifest` aus
`expo/config-plugins`, in `app.config.js` an die Plugin-Liste angehängt).
Verifizieren mit `npx expo prebuild --platform android --clean` + `grep` im
generierten `AndroidManifest.xml`; danach `android/` wieder löschen
(gitignored). Für den lokalen Test wird zusätzlich eine (gitignorete)
Platzhalter-`google-services.json` benötigt, sonst bricht der
Firebase-Copy-Schritt des Prebuilds unabhängig von der eigentlichen
Änderung ab.

## Feature Notes

Detaildokumentation zu einzelnen Features — ausgelagert aus `CLAUDE.md`
(Issue #160), das dort nur noch Storage-Keys als Schnellreferenz behält.

### Eltern-Dashboard

- `SessionRecord` wird nach jeder Runde (Normal, Kreativ, Challenge) gespeichert
- Challenge-Sessions: `operations` kommt aus `getChallengeLevel(score).operations`, nicht aus `selectedOperations`
- `getSessionRecords()` bereinigt automatisch Einträge älter als 28 Tage und schreibt zurück
- `FOUR_WEEKS_MS` ist in `utils/storage.ts` exportiert — nicht duplizieren
- `isValidSessionRecord` validiert alle Felder gegen Enum-Werte
- Titel/Menüeintrag heißen schlicht „Eltern-Dashboard" (seit PR #279 kein „(Beta)"-Label mehr); `parentDashboardMenu` in `i18n/translations.ts` entsprechend ohne Suffix
- **Wochenrückblick** (PR #279, Issue #277 1d): eigene Sektion oberhalb der 14-Tage-Charts in `ParentDashboard.tsx`
  - `SessionRecord.durationMs?: number` — optionales Feld, von `useGameLogic` pro Runde erfasst (`sessionStartRef`, zurückgesetzt bei jedem Rundenstart über `beginNewRound()` statt `emptyAnswerHistory()`); ältere Sessions ohne das Feld werden bei der Anzeige übersprungen statt falsche Werte zu zeigen
  - Einheiten diese Woche + Trend-Pfeil vs. Vorwoche: rollierende 7-Tage-Fenster (`recordsInLastNDays()`), keine Kalenderwochen
  - Genauigkeit pro Malreihe (1–10): All-Time-Aggregation aus `TaskStat` (`computeRowAccuracy()`), keine Wochenfilterung möglich (TaskStat hat keine Pro-Versuch-Zeitstempel)
  - Übungsempfehlung der Woche: schwächste Malreihe via `recommendWeakestRow()` (analog `getWeakTasks()`-Schwellen), freundlicher Fallback-Text wenn nichts schwach ist
- **Freundlicher Empty-State** (PR #279, Issue #277 2d): Emoji + Titel (`parentEmptyTitle`) + Text statt reinem Fließtext, wenn noch keine Sessions vorhanden sind

### Kalendereintrags-Generator (PR #382, Issue #381, ersetzt #256)

- Ersetzt den verworfenen Ansatz einer lokalen Streak-Push-Notification (#256) — zu aufdringlich, hätte eine Permission gebraucht. Stattdessen erzeugen Eltern im Eltern-Dashboard einen wiederkehrenden Kalendereintrag über ihre eigene Kalender-App; keine App-seitige Benachrichtigungslogik
- `utils/calendarReminder.ts` → `buildReminderPlan({ hour, minute, cadence, title, description, uid })`: reine Funktion ohne Seiteneffekte, liefert `{ icsContent, googleCalendarUrl }`
- Taktung als `RRULE`: `daily` → `FREQ=DAILY`, `everyTwoDays` → `FREQ=DAILY;INTERVAL=2`, `weekend` → `FREQ=WEEKLY;BYDAY=SA,SU`
- **Kein neues natives Modul:** bewusst gegen `expo-file-system`/`expo-sharing` entschieden (Rebuild-Aufwand). Stattdessen `Platform.OS`-Split in `components/ReminderPlannerCard.tsx`:
  - **Web:** `.ics`-Datei als Blob-Download (`window.URL.createObjectURL`, `// platform-safe`-Kommentare für den Pre-Commit-Hook), importierbar in jeden Kalender
  - **Android:** Google-Calendar-„Quick Add"-Deeplink via `Linking.openURL()`, vorausgefüllt mit Titel/Uhrzeit/`RRULE` — kein Permission-Dialog
- **UID-Wahl bewusst nicht `profileId`:** `profileId` wird über `Math.random()` erzeugt (`generateId()` in `utils/storage.ts`) — CodeQL markiert das als „insecure randomness" (high), sobald es in einen Kalender-/URL-Kontext fließt. Die UID nutzt stattdessen `profile.createdAt` (ISO-Timestamp, `Date.now()`-basiert): weiterhin stabil pro Profil (re-importieren aktualisiert den bestehenden Eintrag statt zu duplizieren), aber ohne Math.random in der Kette
- Presets: Uhrzeit 16–20 Uhr (Chips), Taktung täglich/alle 2 Tage/Wochenende (Chips) — bewusst keine freie Uhrzeiteingabe, um keinen neuen Time-Picker-Dependency einzuführen

### Streak-Tracker

- `StreakData` (`types/game.ts`): `currentStreak`, `lastPlayedDate` (YYYY-MM-DD lokal), `longestStreak`
- Storage Key: `app-streak`
- `updateStreakAfterSession()` in `utils/storage.ts`: DST-sicherer Vergleich via `getLocalDateString()` — kein UTC-Offset-Problem
- Streak-Logik: gleicher Tag → kein Update; Folgetag → +1; Lücke → Reset auf 1 (longestStreak bleibt)
- `isNonNegInt` / `isLocalDateString`: Validatoren in storage.ts verhindern korrupte Werte (NaN, negativ, falsches Format)
- Seit PR #272 kein 🔥-Badge mehr im Header — dort steht jetzt der Durchlauf-Zähler (`roundsToday`, siehe unten). Die Streak-Daten selbst laufen unverändert weiter und werden nur noch im ParentDashboard + der Abend-Warnung angezeigt
- Abend-Warnung: Modal bei App-Öffnung wenn `hour >= 20` + Streak aktiv + heute noch nicht gespielt
- ParentDashboard: currentStreak + longestStreak im Summary-Bar (inkl. korrekter Divider-Logik)
- `streakWarningMessage` enthält `{days}` Platzhalter → wird via `.replace('{days}', ...)` in App.tsx ersetzt

### Fortschrittsbalken / Durchlauf-Zähler (PR #272)

- `GameState.answerHistory: (boolean | null)[]` (`types/game.ts`) — Ergebnis pro Aufgabe der aktuellen Runde, Länge `TOTAL_TASKS` (10); `null` = noch nicht beantwortet
- `useGameLogic.checkAnswer()` schreibt `isCorrect` an Index `currentTask - 1`; `emptyAnswerHistory()` setzt bei jedem Rundenstart zurück (`restartGame`, `continueGame`, `changeGameMode`, `toggleOperation`, `changeAnswerMode`, `changeDifficultyMode`, Operationswechsel-Effect)
- `components/ProgressBar.tsx`: kein animierter Gradient-Fill mehr, sondern 10 einzelne Segmente (`history`-Prop); grün `#10B981` = richtig, rot `#EF4444` = falsch, grau `#E2E8F0` = offen
- Im Challenge-Modus wird statt der ProgressBar weiterhin die Lives-Anzeige gerendert (unverändert)
- `App.tsx`: `roundsToday`-State — beim Profilwechsel aus `getSessionRecords()` (gefiltert auf `getLocalDateString()` == heute) geladen, bei jedem `onSessionComplete` hochgezählt; **kein eigener Storage-Key**, reine Ableitung aus SessionRecords, setzt sich also automatisch täglich zurück
- `i18n/translations.ts`: `roundsInfoTitle` / `roundsInfoBody` (DE/EN) ersetzen die entfernten `streakInfoTitle` / `streakInfoBody`

### Adaptives Lernen / Übungsmodus (PRACTICE)

- `TaskStat` (`types/game.ts`): pro konkreter Aufgabe (num1/num2/operation) correctCount + errorCount + lastSeen
- Storage Key: `app-task-stats` (separater Key, unabhängig von Session-Records)
- `recordTaskResult()` in `utils/storage.ts`: Race-Condition-sicher via Promise-Queue
- In App.tsx wird `taskStats` als Ref gehalten und per `useEffect` aktualisiert
- `DifficultyMode.PRACTICE`: 75% Chance schwache Aufgabe (Fehlerrate >30%, ≥3 Versuche), 25% zufällig; Aufgaben werden nach `effectiveMaxNumber` gefiltert (range-sicher)
- `getWeakTasks(stats)` in `utils/storage.ts`: reine Funktion, filtert + sortiert nach Fehlerrate absteigend
- ParentDashboard zeigt Top-5-Schwachstellen — unabhängig von vorhandenen Session-Records

### Lernreise / Reihen-Meisterschaft (PR #281, Issue #277 1a)

- Neuer Einstiegspunkt „Lernreise" im Einstellungsmenü (`onOpenLernreise`-Prop, `components/SettingsMenu.tsx`) → `components/LernreiseModal.tsx`
- `RowMastery` (`types/game.ts`): `{ row: number; bestScore: number; status: RowMasteryStatus | null }`, `RowMasteryStatus = 'bronze' | 'silver' | 'gold'`
- Storage Key: `app-row-mastery` (Suffix-Pattern, profilgetrennt); `getRowMastery`/`saveRowMastery`/`recordRowTestResult` in `utils/storage.ts`, immer 12 Einträge (`LERNREISE_ROW_COUNT` in `utils/constants.ts`)
- **Landkarte:** 12 Knoten (1er–12er-Reihe); Reihe 1 immer offen, Reihe N schaltet sich frei sobald Reihe N−1 mindestens einmal einen Status erreicht hat (`isRowUnlocked()`, reine Funktion)
- **Abschlusstest pro Reihe:** 10 Aufgaben mit gemischten Faktoren 1–10 (`shuffledFactors()`), UI nutzt die bestehenden `Numpad`- und `ProgressBar`-Komponenten aus dem Hauptspiel
- **Status-Schwellen** (`statusForRowScore()`): Gold = 10/10, Silber ≥ 8/10, Bronze ≥ 6/10, sonst kein Status. Ein einmal erreichter Status kann durch einen schwächeren späteren Versuch nicht sinken (`recordRowTestResult()` vergleicht Rang), `bestScore` wird aber immer aktualisiert
- Bewusste Design-Entscheidung: Status wird **pro Testversuch** vergeben, nicht aus der langfristig kumulierten `TaskStat`-Fehlerquote — macht das Freischalten nachvollziehbar (bestanden/nicht bestanden) statt von organischem Übungsverhalten außerhalb der Lernreise abhängig
- Jede Testantwort läuft trotzdem ganz normal über `recordTaskResult()` in die bestehende `TaskStat`-Infrastruktur ein → Übungsmodus und Eltern-Dashboard (Genauigkeit pro Malreihe) profitieren automatisch mit
- Bewusst noch nicht umgesetzt (siehe Issue #277 1a, „perspektivisch"): Ersetzen/Bündeln des separaten Übungsmodus (PRACTICE) durch die Lernreise

### Visuelle Themes / App-Skins

- `ThemeName = 'sunset' | 'ocean' | 'space' | 'forest' | 'candy'` in `types/game.ts`
- `THEMES` in `utils/constants.ts`: jedes Theme hat `label`, `LIGHT` und `DARK` (je alle ThemeColors-Felder + `GRADIENT_PRIMARY`)
- `getThemeColors(isDarkMode, themeName?)` — zweiter Parameter optional, Default `'sunset'`; ungültiger Name fällt auf sunset zurück
- Storage Key: `app-theme-name` (`STORAGE_KEYS.THEME_NAME`)
- `saveThemeName` / `getThemeName` in `utils/storage.ts`; `getThemeName` validiert gegen bekannte Werte, gibt `null` zurück wenn unbekannt
- `usePreferences` lädt `getThemeName()` beim Mount, speichert bei Änderung automatisch
- `useTheme(themeMode, themeName)` — erhält `themeName` als zweiten Parameter von `App.tsx`
- `ThemeColors.gradientPrimary: readonly [string, string]` — alle Komponenten nutzen diesen statt statischer Konstanten
- Aktive Zustände (Chips, Buttons, Badges) verwenden `colors.gradientPrimary[0]` inline (kein statisches `ACTIVE_COLOR`)
- `PersonalizeModal` zeigt Gradient-Swatches; aktiver Swatch-Border nutzt `themeData.LIGHT.GRADIENT_PRIMARY[0]` (theme-spezifisch)

### Sound-Effekte

- `SoundEvent = 'correct' | 'incorrect' | 'perfect' | 'level_up' | 'badge_unlock'`
- Storage Keys: `app-sounds-enabled` / `app-sounds-volume` (Default: true / 75)
- Web: `AudioContext`-Oszillatoren (`playWebTone`), keine Dateien nötig
- Native: `expo-audio` (`createAudioPlayer` → `player.seekTo(0)` + `player.play()`, `player.volume`, `player.remove()`) + WAV-Assets aus `assets/sounds/`; `setAudioModeAsync({ playsInSilentMode: false })`; bei `soundEnabled → false` werden alle Player sofort pausiert (PR #242)
- `enableBackgroundPlayback: false` in `app.json` bewusst gesetzt — verhindert `FOREGROUND_SERVICE_MEDIA_PLAYBACK` Permission im Play Store (die App nutzt nur kurze UI-Sounds, kein Hintergrund-Audio)
- Linting: `window.*` in `useSounds.ts` muss `// platform-safe` Kommentar tragen (CI-Check)
- WAV-Assets bei Bedarf neu generieren: `node scripts/generate-sounds.js`
- Hintergrundmusik: bewusst nicht implementiert (erfordert Lizenz-freie Loop-Audiodatei), separates Follow-up

### Mehrere Kinderprofile

- `ChildProfile` (`types/game.ts`): `id`, `name`, `avatarColor`, `createdAt`
- Storage Keys: `app-profiles` (Liste), `app-active-profile-id` (aktives Profil)
- `AVATAR_COLORS` (6 Farben) + `MAX_PROFILES = 6` in `utils/constants.ts`
- **Suffix-Pattern:** alle per-Profil-Daten unter `{storageKey}-{profileId}` (z. B. `app-streak-abc123`); globale Keys (Sprache, Theme, Sounds) bleiben unverändert
- `resolveKey(baseKey, profileId?)` intern: mit profileId → Suffix, ohne → globaler Key (Rückwärtskompatibilität)
- **Migration** `migrateToProfiles()`: kopiert 8 globale Keys auf profil-spezifische Keys beim ersten Start; idempotent (kehrt sofort zurück wenn Profile bereits existieren)
- **Stale-Closure-Vermeidung:** `activeProfileIdRef.current = activeProfile?.id` wird jeden Render synchron aktualisiert (nicht in useEffect); Callbacks lesen `ref.current` statt captured value
- **usePreferences(profileId?):** zwei Load-Effects — globale Prefs `[]` einmalig; per-Profil-Prefs `[profileId]` mit Cancellation-Token; Auto-Save nutzt `profileIdRef.current`
- **useBadges(profileId?):** Badge-Load/-Write per Profil; `useCallback([profileId])` stellt sicher dass Checks auf richtiges Profil schreiben
- **ProfilePickerModal:** Bottom-Sheet (animationType="slide"); Profilwechsel setzt `activeProfile` + `setActiveProfileId()`; Löschen mit `Alert.alert`-Bestätigung
- **SettingsMenu:** "Profile"-Button öffnet `ProfilePickerModal` via `onOpenProfiles`-Prop
- `usePreferences` setzt `isLoaded = false` bei Profilwechsel → verhindert Auto-Save-Race zwischen altem und neuem Profil
- Aufgabenstatistiken, Streak, Badges, HighScore, Operations, NumberRange, SessionRecords — alle per Profil getrennt

### Firebase Crashlytics

- Initialisierung in `index.ts` via dynamischem Import (Web-Bundle bleibt sauber)
- `setCrashlyticsCollectionEnabled(!__DEV__)` — kein Dev-Traffic in Firebase Console
- `google-services.json` liegt im Projekt-Root, ist gitignored — muss nach `prebuild --clean` nicht neu abgelegt werden (kein Expo-Native-Ordner)
- **Paketname für Firebase**: `com.sven4321.trainer1x1` (Play-Store-Paketname, nicht `com.devsven.x1x1trainer` aus app.json!)
