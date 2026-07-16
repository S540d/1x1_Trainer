# 1x1 Trainer – Projektdokumentation für Claude

> **Zwei-Schichten-Dokumentation:**
> Diese Datei ist öffentlich im Repo. Sensible Infos (Keystore, Gerät-IDs, Secrets) liegen in `docs/private/CLAUDE.md` (gitignored, nur lokal).
> **Telefon-Workflow:** Notizen vom iPhone ans Ende dieser Datei schreiben → am Mac in die richtige Schicht einsortieren.

---

## Branch-Workflow

```
feature/issue-XXX → testing → main
```

`staging` wurde entfernt (2026-06-03, Issue #7).

| Branch              | Zweck                            |
| ------------------- | -------------------------------- |
| `main`              | Produktion (protected)           |
| `testing`           | Integration neuer Features/Fixes |
| `feature/issue-XXX` | Kurzlebige Feature-Branches      |

- PRs immer gegen `testing` öffnen, nicht `main`
- `gh pr merge <nr> --squash --delete-branch` für Feature→testing PRs
- `gh pr merge <nr> --squash` für testing→main (kein `--delete-branch`!)
- **Vor Push:** lokale Tests ausführen (`npm test`)
- **Kein Merge bei CI-Fail**

## Merge-Workflow (PR → staging → main)

```bash
gh pr merge <nr> --squash --delete-branch
git checkout main && git merge staging && git push origin main
git checkout staging && git merge main && git push origin staging
git checkout testing && git merge main && git push origin testing
git checkout main
```

---

## Versionsbump-Checkliste

Beim Erhöhen der Version IMMER alle drei Stellen aktualisieren:

1. `package.json` → `version`
2. `app.json` → `expo.version` + `android.versionCode` (+1)
3. `utils/constants.ts` → `APP_VERSION`

→ Wird `constants.ts` vergessen, schlägt der CI-Check "version consistency" fehl.
→ Skript: `./scripts/bump-version.sh patch|minor|major`

**bump Input bei CI:** IMMER `none` verwenden — Branch Protection blockiert Bot-Pushes auf `main`.

---

## Build-Workflow (Übersicht)

- **APK (Test):** Lokaler Build wieder lauffähig seit expo-audio-Migration (Issue #214, PR #215). **Wichtig: JDK 17 verwenden** (`export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`) — Default-Java ist 21/25 und bricht den Gradle-Build. Alternativ per GitHub Actions: `gh workflow run build-android.yml --ref testing -f profile=preview -f bump=none`
- **Lokaler AAB mit Store-Paketname:** `APP_PACKAGE=com.sven4321.trainer1x1 npx expo prebuild --platform android --clean && cd android && ./gradlew bundleRelease` — `app.config.js` injiziert den Paketnamen automatisch (Issue #233, PR #244 ✅)
- **AAB (Play Store):** GitHub Actions → `Build Android` → profile: `production`
- Workflow: `.github/workflows/build-android.yml`

---

## Testing

```bash
npm test              # Jest
npm run test:watch    # Watch-Modus
npm run test:coverage # Coverage
```

- Test-Runner: Jest + jsdom
- React Native → React Native Web (via `moduleNameMapper`)
- `@testing-library/react` (nicht react-native)
- `window.getComputedStyle` funktioniert für RN-Styles (jsdom + RNW)

### Jest-Konfiguration — Fallstricke

- `expo-linear-gradient`, `expo-font`, `expo-status-bar`, `expo-av`, `@expo-google-fonts` müssen in `transformIgnorePatterns` **und** `moduleNameMapper` eingetragen sein
- Neue Expo-Pakete immer in **beiden** Listen ergänzen
- Binäre Assets (`.wav`, `.mp3` etc.) brauchen `moduleNameMapper`-Eintrag → `__mocks__/fileMock.js` (gibt `1` zurück)

---

## Aktueller Stand (2026-07-12)

- Version: **1.4.1** / versionCode 31
- Branches: `testing` vorn (inkl. #278 Expo-SDK-57, #279 Wochenrückblick/Empty-States, #280 resizeableActivity, #281 Lernreise); `main` auf `91cf92d` (sync v1.3.8)
- Offene PRs: #272 (Fortschrittsbalken-Segmente + Durchlauf-Zähler), #245 (CLAUDE.md docs), gegen `testing`
- Offene Issues: #156, #231, #96, #276 (npm-audit-Vulnerabilities — SDK-Upgrade-Teilaufgabe erledigt, Rest bleibt offen, siehe unten), #275 (Code-Fix in #280 erledigt, letzter To-Do „Neubuild + AAB-Upload" bleibt manuell offen), #277 (Wachstumsplan — 1a/1d/2d erledigt, siehe unten)
- APK v1.3.8 via CI

### Zuletzt gemergt / gepusht

| PR / Commit  | Was                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------- |
| #281 ✅      | feat: Lernreise / Reihen-Meisterschaft mit Bronze/Silber/Gold — Issue #277 1a                  |
| #280 ✅      | fix: android:resizeableActivity="true" via Config-Plugin — Issue #275                          |
| #279 ✅      | feat: Wochenrückblick im Eltern-Dashboard + freundlicher Empty-State — Issue #277 1d/2d        |
| #278 ✅      | build: Expo SDK 55 → 57 (React Native 0.86, React 19.2.3) — Issue #276 (Teil 1/3 erledigt)     |
| #272 (offen) | feat: Fortschrittsbalken in 10 Segmente (grün/rot pro Aufgabe) + Durchlauf-Zähler statt Flamme |
| #247 ✅      | feat: Mehrere Kinderprofile (Issue #187 ✅ geschlossen)                                        |
| #246 ✅      | chore: Prettier + pre-push Hook (Issue #220 ✅ geschlossen)                                    |
| #245 (offen) | docs: CLAUDE.md 2026-06-18                                                                     |
| #244 ✅      | build: app.config.js für APP_PACKAGE env-var (Issue #233 ✅ geschlossen)                       |
| #243 ✅      | feat: Orientation "default" für Tablet/Foldable (Issue #235 ✅ geschlossen)                    |
| #242 ✅      | fix: Sounds sofort stoppen wenn deaktiviert (Issue #241 ✅ geschlossen)                        |
| #240 ✅      | ci: Cache-Cleanup-Workflow                                                                     |
| #239 ✅      | chore: Review-Modell v2                                                                        |
| #234 ✅      | sync: testing → main (v1.3.8 + googleServicesFile fix)                                         |

---

## Wichtige Dateien

| Datei                               | Inhalt                                                                                                                                                                                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/constants.ts`                | THEME_COLORS, DESIGN_TOKENS, STORAGE_KEYS, CHALLENGE_LEVELS, `THEMES` (alle 5 Farbthemes mit LIGHT/DARK-Varianten)                                                                                                                                                                                    |
| `utils/theme.ts`                    | `getThemeColors(isDarkMode, themeName?)` — themeName optional, Default `'sunset'`                                                                                                                                                                                                                     |
| `utils/storage.ts`                  | Storage-Helfer + Profile-Management (`migrateToProfiles`, `createProfile`, `deleteProfileData`, `getProfiles`/`saveProfiles`, `setActiveProfileId`). Alle per-Profil-Funktionen haben optionalen `profileId?`-Parameter (Suffix-Pattern `{key}-{profileId}`). `profileKey()` / `resolveKey()` intern. |
| `utils/animations.ts`               | `prefersReducedMotion()` — liest Accessibility-Einstellung                                                                                                                                                                                                                                            |
| `types/game.ts`                     | ThemeColors (inkl. `gradientPrimary`), GameState (inkl. `answerHistory`), Enums, SessionRecord (inkl. optionalem `durationMs`), `ThemeName`, `ChildProfile`, `RowMastery`/`RowMasteryStatus`                                                                                                          |
| `i18n/translations.ts`              | DE/EN Übersetzungen, `TranslationStrings`-Interface (inkl. 12 Profil-Strings)                                                                                                                                                                                                                         |
| `hooks/useGameLogic.ts`             | Gesamte Spiellogik, `onSessionComplete`-Callback                                                                                                                                                                                                                                                      |
| `hooks/usePreferences.ts`           | `usePreferences(profileId?)` — globale Prefs (Sprache, Theme, Sounds) + per-Profil-Prefs (Operations, NumberRange, TotalTasks, HighScore); lädt per-Profil-Daten neu bei Profilwechsel                                                                                                                |
| `hooks/useBadges.ts`                | `useBadges(profileId?)` — Badge-Lesen/Schreiben auf aktives Profil beschränkt                                                                                                                                                                                                                         |
| `hooks/useSounds.ts`                | Sound-Hook: `playSound(event)` — Web: AudioContext-Oszillatoren, Native: expo-audio (`createAudioPlayer`) + WAV-Assets                                                                                                                                                                                |
| `assets/sounds/`                    | WAV-Assets: correct / incorrect / perfect / level_up / badge_unlock (je 8–17 KB)                                                                                                                                                                                                                      |
| `scripts/generate-sounds.js`        | Generator für WAV-Assets (`node scripts/generate-sounds.js`)                                                                                                                                                                                                                                          |
| `components/PersonalizeModal.tsx`   | Aussehen-Modal (Light/Dark/System, Farbtheme-Picker, Sprache, Sound An/Aus + Lautstärke)                                                                                                                                                                                                              |
| `components/ParentDashboard.tsx`    | Eltern-Dashboard Modal (seit PR #279 kein „(Beta)"-Label mehr) inkl. Wochenrückblick (Trend, Übungszeit, Genauigkeit pro Malreihe, Übungsempfehlung) und freundlichem Empty-State                                                                                                                     |
| `components/ProfilePickerModal.tsx` | Bottom-Sheet-Modal für Profilauswahl/-erstellung/-löschung (max. 6 Profile, Farbauswahl, Bestätigungs-Alert bei Löschen)                                                                                                                                                                              |
| `components/GameCard.tsx`           | Hauptspielansicht (alle 3 Antwortmodi)                                                                                                                                                                                                                                                                |
| `components/Header.tsx`             | Score/Level/Lives, segmentierte `ProgressBar`, Durchlauf-Zähler (`roundsToday`, ersetzt seit PR #272 die Streak-Flamme)                                                                                                                                                                               |
| `components/ProgressBar.tsx`        | 10 Segmente statt Gradient-Fill; `history: (boolean \| null)[]` → grün/rot/grau pro Aufgabe                                                                                                                                                                                                           |
| `components/LernreiseModal.tsx`     | Lernreise / Reihen-Meisterschaft (PR #281, Issue #277 1a): Malreihen-Landkarte + Abschlusstest pro Reihe (Numpad/ProgressBar wiederverwendet) + Bronze/Silber/Gold-Ergebnis                                                                                                                           |
| `plugins/withResizeableActivity.js` | Lokales Expo-Config-Plugin (PR #280, Issue #275): setzt `android:resizeableActivity="true"` im generierten `AndroidManifest.xml`, da `android/` nicht versioniert wird                                                                                                                                |
| `styles/modalStyles.ts`             | Gemeinsame Modal-Styles                                                                                                                                                                                                                                                                               |
| `app.config.js`                     | Dynamische Expo-Konfiguration: überschreibt `android.package` via `APP_PACKAGE` env-var (Issue #233); hängt `withResizeableActivity` an die Plugin-Liste an (Issue #275)                                                                                                                              |
| `jest.config.js`                    | Jest-Konfiguration                                                                                                                                                                                                                                                                                    |
| `docs/private/CLAUDE.md`            | Sensible Build/Keystore-Details (gitignored)                                                                                                                                                                                                                                                          |

---

## Architektur-Fallstricke

- **`APP_VERSION` in `utils/constants.ts`** beim Versionsbump leicht vergessen → immer `bump-version.sh` verwenden
- **Animated-Wrapper brauchen flex:** `Pressable` > `Animated.View` → Pressable braucht `style={{ flex: 1 }}`, sonst füllen Buttons in flex-row nicht die Breite
- **Keine Early Returns vor Hooks!** React Error #310 — alle Hooks müssen immer in gleicher Reihenfolge aufgerufen werden
- **fontWeight auf Android:** Nur `'normal'`/`'bold'`/`'400'`/`'700'` verwenden — `'500'`/`'600'` werden auf älteren Geräten nicht interpoliert → Text unsichtbar (Issue #138)
- **elevation + transparent:** Kein `elevation > 0` bei `backgroundColor: 'transparent'` → weißer Kasten auf Android (Issue #138)
- **numpadRow braucht feste Höhe:** `height: 60` + `alignItems: 'stretch'` nötig
- **GameCard Layout:** `justifyContent: 'center'` + `gap: 16` statt `space-between`
- **Deploy Race Condition:** Alle 3 Deploy-Workflows müssen dieselbe `concurrency.group` teilen (`gh-pages-deploy`)
- **Number Sequence Grid:** 2-Spalten-Grid (`width: '48%'`, `flexWrap: 'wrap'`) für kleine Bildschirme
- **Merge-Konflikt staging→main:** temporäre Workflow-Dateien können kollidieren → staging-Version bevorzugen
- **Expo-Pakete in Jest:** Neue Pakete immer in `transformIgnorePatterns` **und** `moduleNameMapper` eintragen
- **expo-audio statt expo-av (gelöst, Issue #214 / PR #215):** expo-av brach auf SDK 55 (`resolveView` aus Legacy-UIManager entfernt). Migration auf `expo-audio ~55.0.14` behebt den lokalen Build. **JDK 17 zwingend** für `./gradlew assembleRelease` — Default-Java (21/25) bricht ab.
- **Expo SDK 55 → 57 (2026-07-12, PR #278, Issue #276):** Upgrade in zwei Schritten (55→56→57) anhand `bundledNativeModules.json` der jeweiligen `expo`-Version, da `expo install --fix` / `expo-doctor` in der CI/Remote-Umgebung durch den Proxy blockiert werden können (nur `registry.npmjs.org` erreichbar, nicht `exp.host`). React Native 0.83.2 → 0.86.0, React/React-DOM 19.2.0 → 19.2.3, `react-native-safe-area-context` ~5.6.2 → ~5.7.0, alle Expo-Pakete (`expo-audio`, `expo-font`, `expo-linear-gradient`, `expo-localization`, `expo-status-bar`) auf ~57.0.0. Keine Breaking Changes für dieses Projekt relevant (kein `@expo/vector-icons`, `expo-file-system`, `expo-router` oder `EXPO_PUBLIC_`-Env-Vars im Code). `npx expo config --type public` validiert `app.json` ohne Warnungen — keine Config-Änderungen nötig.
- **npm-audit-Findings NICHT durch SDK-Upgrade behoben (Issue #276):** `npm audit` zeigt nach dem Sprung auf SDK 57 weiterhin 12 moderate Vulnerabilities (vorher 11, `@expo/inline-modules` kam neu dazu) — Root-Ursache ist `uuid <11.1.1` als transitive Build-Time-Dependency von `xcode` → `@expo/config-plugins` → dem gesamten `@expo/*`-Toolchain-Baum, unabhängig von der installierten SDK-Version. `npm audit fix` (non-force) findet weiterhin 0 behebbare Treffer. Betrifft nur Prebuild/Config-Plugins, nicht den ausgelieferten App-Code. `@react-native-firebase/*` bleibt bei `^24.1.0` (Finding `>=17.4.3` betrifft praktisch jede Version). Fix liegt bei Expo/Firebase upstream — Issue #276 bleibt deshalb offen.
- **`android/` ist nicht versioniert (gitignored, per `expo prebuild` generiert):** Manifest-Änderungen wie `android:resizeableActivity="true"` (Issue #275, PR #280) können nicht direkt in einer Datei gepflegt werden, sondern brauchen ein Expo-Config-Plugin (`plugins/withResizeableActivity.js`, via `withAndroidManifest` aus `expo/config-plugins`, in `app.config.js` an die Plugin-Liste angehängt). Verifizieren mit `npx expo prebuild --platform android --clean` + `grep` im generierten `AndroidManifest.xml`; danach `android/` wieder löschen (gitignored). Für den lokalen Test wird zusätzlich eine (gitignorete) Platzhalter-`google-services.json` benötigt, sonst bricht der Firebase-Copy-Schritt des Prebuilds unabhängig von der eigentlichen Änderung ab.

---

## Eltern-Dashboard — Hinweise

- `SessionRecord` wird nach jeder Runde (Normal, Kreativ, Challenge) gespeichert
- Challenge-Sessions: `operations` kommt aus `getChallengeLevel(score).operations`, nicht aus `selectedOperations`
- `getSessionRecords()` bereinigt automatisch Einträge älter als 28 Tage und schreibt zurück
- `FOUR_WEEKS_MS` ist in `utils/storage.ts` exportiert — nicht duplizieren
- `isValidSessionRecord` validiert alle Felder gegen Enum-Werte
- **Seit PR #279 kein „(Beta)"-Label mehr** — Titel/Menüeintrag heißen schlicht „Eltern-Dashboard"; `parentDashboardMenu` in `i18n/translations.ts` entsprechend ohne Suffix
- **Wochenrückblick (PR #279, Issue #277 1d):** eigene Sektion oberhalb der 14-Tage-Charts in `ParentDashboard.tsx`
  - `SessionRecord.durationMs?: number` — optionales Feld, von `useGameLogic` pro Runde erfasst (`sessionStartRef`, zurückgesetzt bei jedem Rundenstart über `beginNewRound()` statt `emptyAnswerHistory()`); ältere Sessions ohne das Feld werden bei der Anzeige übersprungen statt falsche Werte zu zeigen
  - Einheiten diese Woche + Trend-Pfeil vs. Vorwoche: rollierende 7-Tage-Fenster (`recordsInLastNDays()`), keine Kalenderwochen
  - Genauigkeit pro Malreihe (1–10): All-Time-Aggregation aus `TaskStat` (`computeRowAccuracy()`), keine Wochenfilterung möglich (TaskStat hat keine Pro-Versuch-Zeitstempel)
  - Übungsempfehlung der Woche: schwächste Malreihe via `recommendWeakestRow()` (analog `getWeakTasks()`-Schwellen), freundlicher Fallback-Text wenn nichts schwach ist
- **Freundlicher Empty-State (PR #279, Issue #277 2d):** Emoji + Titel (`parentEmptyTitle`) + Text statt reinem Fließtext, wenn noch keine Sessions vorhanden sind

## Streak-Tracker — Hinweise

- `StreakData` (`types/game.ts`): `currentStreak`, `lastPlayedDate` (YYYY-MM-DD lokal), `longestStreak`
- Storage Key: `app-streak`
- `updateStreakAfterSession()` in `utils/storage.ts`: DST-sicherer Vergleich via `getLocalDateString()` — kein UTC-Offset-Problem
- Streak-Logik: gleicher Tag → kein Update; Folgetag → +1; Lücke → Reset auf 1 (longestStreak bleibt)
- `isNonNegInt` / `isLocalDateString`: Validatoren in storage.ts verhindern korrupte Werte (NaN, negativ, falsches Format)
- **Seit PR #272 kein 🔥-Badge mehr im Header** — dort steht jetzt der Durchlauf-Zähler (`roundsToday`), siehe eigener Abschnitt unten. Die Streak-Daten selbst laufen unverändert weiter und werden nur noch im ParentDashboard + der Abend-Warnung angezeigt
- Abend-Warnung: Modal bei App-Öffnung wenn `hour >= 20` + Streak aktiv + heute noch nicht gespielt
- ParentDashboard: currentStreak + longestStreak im Summary-Bar (inkl. korrekter Divider-Logik)
- `streakWarningMessage` enthält `{days}` Platzhalter → wird via `.replace('{days}', ...)` in App.tsx ersetzt

## Fortschrittsbalken / Durchlauf-Zähler — Hinweise (PR #272)

- `GameState.answerHistory: (boolean | null)[]` (`types/game.ts`) — Ergebnis pro Aufgabe der aktuellen Runde, Länge `TOTAL_TASKS` (10); `null` = noch nicht beantwortet
- `useGameLogic.checkAnswer()` schreibt `isCorrect` an Index `currentTask - 1`; `emptyAnswerHistory()` setzt bei jedem Rundenstart zurück (`restartGame`, `continueGame`, `changeGameMode`, `toggleOperation`, `changeAnswerMode`, `changeDifficultyMode`, Operationswechsel-Effect)
- `components/ProgressBar.tsx`: kein animierter Gradient-Fill mehr, sondern 10 einzelne Segmente (`history`-Prop); grün `#10B981` = richtig, rot `#EF4444` = falsch, grau `#E2E8F0` = offen
- Im Challenge-Modus wird statt der ProgressBar weiterhin die Lives-Anzeige gerendert (unverändert)
- `App.tsx`: neuer `roundsToday`-State — beim Profilwechsel aus `getSessionRecords()` (gefiltert auf `getLocalDateString()` == heute) geladen, bei jedem `onSessionComplete` hochgezählt; **kein eigener Storage-Key**, reine Ableitung aus SessionRecords, setzt sich also automatisch täglich zurück
- `i18n/translations.ts`: `roundsInfoTitle` / `roundsInfoBody` (DE/EN) ersetzen die entfernten `streakInfoTitle` / `streakInfoBody`

## Adaptives Lernen / Übungsmodus (PRACTICE) — Hinweise

- `TaskStat` (`types/game.ts`): pro konkreter Aufgabe (num1/num2/operation) correctCount + errorCount + lastSeen
- Storage Key: `app-task-stats` (separater Key, unabhängig von Session-Records)
- `recordTaskResult()` in `utils/storage.ts`: Race-Condition-sicher via Promise-Queue
- In App.tsx wird `taskStats` als Ref gehalten und per `useEffect` aktualisiert
- `DifficultyMode.PRACTICE`: 75% Chance schwache Aufgabe (Fehlerrate >30%, ≥3 Versuche), 25% zufällig; Aufgaben werden nach `effectiveMaxNumber` gefiltert (range-sicher)
- `getWeakTasks(stats)` in `utils/storage.ts`: reine Funktion, filtert + sortiert nach Fehlerrate absteigend
- ParentDashboard zeigt Top-5-Schwachstellen — unabhängig von vorhandenen Session-Records
- CI: `npm test --ci` läuft jetzt automatisch bei jedem PR (`.github/workflows/ci-cd.yml`, Job `test`)

## Lernreise / Reihen-Meisterschaft — Hinweise (PR #281, Issue #277 1a)

- Neuer Einstiegspunkt „Lernreise" im Einstellungsmenü (`onOpenLernreise`-Prop, `components/SettingsMenu.tsx`) → `components/LernreiseModal.tsx`
- `RowMastery` (`types/game.ts`): `{ row: number; bestScore: number; status: RowMasteryStatus | null }`, `RowMasteryStatus = 'bronze' | 'silver' | 'gold'`
- Storage Key: `app-row-mastery` (Suffix-Pattern, profilgetrennt); `getRowMastery`/`saveRowMastery`/`recordRowTestResult` in `utils/storage.ts`, immer 12 Einträge (`LERNREISE_ROW_COUNT` in `utils/constants.ts`)
- **Landkarte:** 12 Knoten (1er–12er-Reihe); Reihe 1 immer offen, Reihe N schaltet sich frei sobald Reihe N−1 mindestens einmal einen Status erreicht hat (`isRowUnlocked()`, reine Funktion)
- **Abschlusstest pro Reihe:** 10 Aufgaben mit gemischten Faktoren 1–10 (`shuffledFactors()`), UI nutzt die bestehenden `Numpad`- und `ProgressBar`-Komponenten aus dem Hauptspiel
- **Status-Schwellen** (`statusForRowScore()`): Gold = 10/10, Silber ≥ 8/10, Bronze ≥ 6/10, sonst kein Status. Ein einmal erreichter Status kann durch einen schwächeren späteren Versuch nicht sinken (`recordRowTestResult()` vergleicht Rang), `bestScore` wird aber immer aktualisiert
- Bewusste Design-Entscheidung: Status wird **pro Testversuch** vergeben, nicht aus der langfristig kumulierten `TaskStat`-Fehlerquote — macht das Freischalten nachvollziehbar (bestanden/nicht bestanden) statt von organischem Übungsverhalten außerhalb der Lernreise abhängig
- Jede Testantwort läuft trotzdem ganz normal über `recordTaskResult()` in die bestehende `TaskStat`-Infrastruktur ein → Übungsmodus und Eltern-Dashboard (Genauigkeit pro Malreihe) profitieren automatisch mit
- Bewusst noch nicht umgesetzt (siehe Issue #277 1a, „perspektivisch"): Ersetzen/Bündeln des separaten Übungsmodus (PRACTICE) durch die Lernreise

---

## Visuelle Themes / App-Skins — Hinweise

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

---

## Offene TODOs / Bekannte Einschränkungen

- ✅ **expo-av → expo-audio Migration erledigt** (Issue #214 / PR #215) — lokaler Build wieder lauffähig (mit JDK 17)
- ✅ **Paketname-Diskrepanz gelöst** (Issue #233 / PR #244) — `app.config.js` mit `APP_PACKAGE` env-var
- ✅ **Orientation auf `"default"` gesetzt** (Issue #235 / PR #243) — Tablet/Foldable Landscape-Support
- ✅ **Prettier + pre-push Hook** (Issue #220 / PR #246) — einheitliches Code-Formatting
- ✅ **Mehrere Kinderprofile** (Issue #187 / PR #247) — bis zu 6 Profile, je eigene Spieldaten
- ✅ **Wochenrückblick + Empty-States im Eltern-Dashboard** (Issue #277 1d/2d / PR #279) — „(Beta)"-Label entfernt
- ✅ **Large-Screen-Kompatibilität `resizeableActivity`** (Issue #275 / PR #280) — Code-Fix erledigt, letzter Schritt (Neubuild + AAB-Upload an den Play Store) bleibt manuell
- ✅ **Lernreise / Reihen-Meisterschaft** (Issue #277 1a / PR #281) — Malreihen-Landkarte mit Bronze/Silber/Gold
- Größere Dependency-Updates verschoben: react-native 0.84, react 19.2.4, async-storage 3.x
- Reanimated wurde durch `Animated` core ersetzt (Web-Kompatibilität) — Issue #131

## Sound-Effekte — Hinweise

- `SoundEvent = 'correct' | 'incorrect' | 'perfect' | 'level_up' | 'badge_unlock'`
- Storage Keys: `app-sounds-enabled` / `app-sounds-volume` (Default: true / 75)
- Web: `AudioContext`-Oszillatoren (`playWebTone`), keine Dateien nötig
- Native: `expo-audio` (`createAudioPlayer` → `player.seekTo(0)` + `player.play()`, `player.volume`, `player.remove()`) + WAV-Assets aus `assets/sounds/`; `setAudioModeAsync({ playsInSilentMode: false })`; bei `soundEnabled → false` werden alle Player sofort pausiert (PR #242)
- **`enableBackgroundPlayback: false`** in `app.json` bewusst gesetzt — verhindert `FOREGROUND_SERVICE_MEDIA_PLAYBACK` Permission im Play Store (die App nutzt nur kurze UI-Sounds, kein Hintergrund-Audio)
- Linting: `window.*` in `useSounds.ts` muss `// platform-safe` Kommentar tragen (CI-Check)
- WAV-Assets bei Bedarf neu generieren: `node scripts/generate-sounds.js`
- Hintergrundmusik: bewusst nicht implementiert (erfordert Lizenz-freie Loop-Audiodatei), separates Follow-up

## Mehrere Kinderprofile — Hinweise

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

## Firebase Crashlytics

- Initialisierung in `index.ts` via dynamischem Import (Web-Bundle bleibt sauber)
- `setCrashlyticsCollectionEnabled(!__DEV__)` — kein Dev-Traffic in Firebase Console
- `google-services.json` liegt im Projekt-Root, ist gitignored — muss nach `prebuild --clean` nicht neu abgelegt werden (kein Expo-Native-Ordner)
- **Paketname für Firebase**: `com.sven4321.trainer1x1` (Play-Store-Paketname, nicht `com.devsven.x1x1trainer` aus app.json!)

<!-- GLOBAL POLICY:START -->

## [GLOBAL POLICY]

> Automatisch synchronisiert aus project-templates (Issue #7). Nicht manuell editieren –
> Änderungen hier werden beim nächsten Sync überschrieben. Quelle anpassen statt lokal.

- PRs immer gegen `testing`, nie direkt gegen `staging` oder `main`
- Merge auf `main` nur mit expliziter schriftlicher Freigabe
- `--delete-branch` nur für Feature-Branches (nie staging/testing)
- **Lokales Branch-Cleanup:** `main` und `testing` NIE löschen — auch nicht beim Bulk-Delete verwaister `[gone]`-Branches. Ein fehlender `origin/main`/`origin/testing` ist ein **wiederherzustellender Defekt** (lokal behalten, nach origin zurückpushen), kein Aufräum-Signal.
- `--no-verify` nur auf explizite Bitte
- **Vor jedem Push: lokale Tests ausführen** (`npm test` bzw. projektspezifischer Test-Befehl) – kein Push ohne grüne lokale Tests
- **Kein Merge bei CI-Fail** – Branch Protection erzwingt das technisch; nie mit `--admin` umgehen außer auf explizite Bitte

## [ANDROID BUILD – PFLICHTREGELN]

- **Git-Tag** nach jedem Play-Store-Upload setzen: `git tag vX.Y.Z && git push origin vX.Y.Z` – der Tag markiert den tatsächlich veröffentlichten Stand und dient als Changelog-Baseline für den nächsten Build
- **EAS Local Build (DrawFromMemory):** Workingdir vor jedem Build leeren: `rm -rf ~/tmp/eas-build && mkdir -p ~/tmp/eas-build` – ein nicht-leeres Verzeichnis bricht den Build sofort ab
- **Disk-Check vor EAS Build:** Skia-Libraries benötigen ~5–8 GB. Bei < 5 GB frei: `npm cache clean --force && rm -rf ~/.npm/_npx` (~13 GB, sicher löschbar)
- **JAVA_HOME** für EAS/Expo-Builds explizit auf Android Studio JBR setzen: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`
- **Gradle-Lock nach Absturz:** Bei "Cannot lock file hash cache"-Fehler Daemons stoppen: `pkill -f GradleDaemon`, dann Workingdir leeren und neu starten
- **AAB-Archiv:** Gebaute Release-AABs in einem **gitignored** `aab-archive/`-Verzeichnis im Repo-Root ablegen (in `.gitignore` aufnehmen – AABs sind 3–110 MB und gehören nie in die Git-History). Benennung: `<Projekt>-vX.Y.Z-vc<versionCode>-YYYY-MM-DD.aab`. **Retention: max. 2 Dateien** (aktuelles Release + ein Vorgänger für schnelles Rollback); ältere AABs löschen. Der Git-Tag `vX.Y.Z` ist die eigentliche Release-Baseline – ältere AABs lassen sich daraus jederzeit neu bauen.

## [CI – CACHE-CLEANUP]

- **Cache-Cleanup-Workflow** (`.github/workflows/cache-cleanup.yml`) in jedem Repo mit GitHub-Actions-Caches: löscht wöchentlich (So 03:00 UTC) bzw. on-demand alle Action-Caches älter als der jeweils letzte Lauf. GitHub-Limit ist 10 GB pro Repo – ohne Cleanup laufen Build-Caches (node_modules, Gradle, Expo) voll und verdrängen frische Einträge. Vorlage: `cache-cleanup.yml` in project-templates.
<!-- GLOBAL POLICY:END -->
