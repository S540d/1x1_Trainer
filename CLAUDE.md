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

## Aktueller Stand (2026-06-20)

- Version: **1.3.8** / versionCode 28
- Branches: `testing` vorn (inkl. #242, #243, #246, #247); `main` auf `91cf92d` (sync v1.3.8)
- Offene PRs: #245 (CLAUDE.md docs), gegen `testing`
- Offene Issues: #156, #231, #96
- APK v1.3.8 via CI

### Zuletzt gemergt / gepusht

| PR / Commit  | Was                                                                              |
| ------------ | -------------------------------------------------------------------------------- |
| #247 ✅      | feat: Mehrere Kinderprofile (Issue #187 ✅ geschlossen)                          |
| #246 ✅      | chore: Prettier + pre-push Hook (Issue #220 ✅ geschlossen)                      |
| #245 (offen) | docs: CLAUDE.md 2026-06-18                                                       |
| #244 ✅      | build: app.config.js für APP_PACKAGE env-var (Issue #233 ✅ geschlossen)         |
| #243 ✅      | feat: Orientation "default" für Tablet/Foldable (Issue #235 ✅ geschlossen)      |
| #242 ✅      | fix: Sounds sofort stoppen wenn deaktiviert (Issue #241 ✅ geschlossen)          |
| #240 ✅      | ci: Cache-Cleanup-Workflow                                                       |
| #239 ✅      | chore: Review-Modell v2                                                          |
| #234 ✅      | sync: testing → main (v1.3.8 + googleServicesFile fix)                           |

---

## Wichtige Dateien

| Datei                             | Inhalt                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/constants.ts`              | THEME_COLORS, DESIGN_TOKENS, STORAGE_KEYS, CHALLENGE_LEVELS, `THEMES` (alle 5 Farbthemes mit LIGHT/DARK-Varianten)                                                                                                                                                                                                    |
| `utils/theme.ts`                  | `getThemeColors(isDarkMode, themeName?)` — themeName optional, Default `'sunset'`                                                                                                                                                                                                                                     |
| `utils/storage.ts`                | Storage-Helfer + Profile-Management (`migrateToProfiles`, `createProfile`, `deleteProfileData`, `getProfiles`/`saveProfiles`, `setActiveProfileId`). Alle per-Profil-Funktionen haben optionalen `profileId?`-Parameter (Suffix-Pattern `{key}-{profileId}`). `profileKey()` / `resolveKey()` intern. |
| `utils/animations.ts`             | `prefersReducedMotion()` — liest Accessibility-Einstellung                                                                                                                                                                                                                                            |
| `types/game.ts`                   | ThemeColors (inkl. `gradientPrimary`), GameState, Enums, SessionRecord, `ThemeName`, `ChildProfile`                                                                                                                                                                                                   |
| `i18n/translations.ts`            | DE/EN Übersetzungen, `TranslationStrings`-Interface (inkl. 12 Profil-Strings)                                                                                                                                                                                                                         |
| `hooks/useGameLogic.ts`           | Gesamte Spiellogik, `onSessionComplete`-Callback                                                                                                                                                                                                                                                      |
| `hooks/usePreferences.ts`         | `usePreferences(profileId?)` — globale Prefs (Sprache, Theme, Sounds) + per-Profil-Prefs (Operations, NumberRange, TotalTasks, HighScore); lädt per-Profil-Daten neu bei Profilwechsel                                                                                                               |
| `hooks/useBadges.ts`              | `useBadges(profileId?)` — Badge-Lesen/Schreiben auf aktives Profil beschränkt                                                                                                                                                                                                                        |
| `hooks/useSounds.ts`              | Sound-Hook: `playSound(event)` — Web: AudioContext-Oszillatoren, Native: expo-audio (`createAudioPlayer`) + WAV-Assets                                                                                                                                                                               |
| `assets/sounds/`                  | WAV-Assets: correct / incorrect / perfect / level_up / badge_unlock (je 8–17 KB)                                                                                                                                                                                                                                      |
| `scripts/generate-sounds.js`      | Generator für WAV-Assets (`node scripts/generate-sounds.js`)                                                                                                                                                                                                                                                          |
| `components/PersonalizeModal.tsx` | Aussehen-Modal (Light/Dark/System, Farbtheme-Picker, Sprache, Sound An/Aus + Lautstärke)                                                                                                                                                                                                                              |
| `components/ParentDashboard.tsx`  | Eltern-Dashboard Modal (Beta)                                                                                                                                                                                                                                                                                         |
| `components/ProfilePickerModal.tsx` | Bottom-Sheet-Modal für Profilauswahl/-erstellung/-löschung (max. 6 Profile, Farbauswahl, Bestätigungs-Alert bei Löschen)                                                                                                                                                                                           |
| `components/GameCard.tsx`         | Hauptspielansicht (alle 3 Antwortmodi)                                                                                                                                                                                                                                                                                |
| `styles/modalStyles.ts`           | Gemeinsame Modal-Styles                                                                                                                                                                                                                                                                                               |
| `app.config.js`                   | Dynamische Expo-Konfiguration: überschreibt `android.package` via `APP_PACKAGE` env-var (Issue #233)                                                                                                                                                                                                                  |
| `jest.config.js`                  | Jest-Konfiguration                                                                                                                                                                                                                                                                                                    |
| `docs/private/CLAUDE.md`          | Sensible Build/Keystore-Details (gitignored)                                                                                                                                                                                                                                                                          |

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

---

## Eltern-Dashboard (Beta) — Hinweise

- `SessionRecord` wird nach jeder Runde (Normal, Kreativ, Challenge) gespeichert
- Challenge-Sessions: `operations` kommt aus `getChallengeLevel(score).operations`, nicht aus `selectedOperations`
- `getSessionRecords()` bereinigt automatisch Einträge älter als 28 Tage und schreibt zurück
- `FOUR_WEEKS_MS` ist in `utils/storage.ts` exportiert — nicht duplizieren
- `isValidSessionRecord` validiert alle Felder gegen Enum-Werte

## Streak-Tracker — Hinweise

- `StreakData` (`types/game.ts`): `currentStreak`, `lastPlayedDate` (YYYY-MM-DD lokal), `longestStreak`
- Storage Key: `app-streak`
- `updateStreakAfterSession()` in `utils/storage.ts`: DST-sicherer Vergleich via `getLocalDateString()` — kein UTC-Offset-Problem
- Streak-Logik: gleicher Tag → kein Update; Folgetag → +1; Lücke → Reset auf 1 (longestStreak bleibt)
- `isNonNegInt` / `isLocalDateString`: Validatoren in storage.ts verhindern korrupte Werte (NaN, negativ, falsches Format)
- Header zeigt 🔥 {n} Badge wenn `currentStreak > 0` (via `currentStreak`-Prop in Header.tsx)
- Abend-Warnung: Modal bei App-Öffnung wenn `hour >= 20` + Streak aktiv + heute noch nicht gespielt
- ParentDashboard: currentStreak + longestStreak im Summary-Bar (inkl. korrekter Divider-Logik)
- `streakWarningMessage` enthält `{days}` Platzhalter → wird via `.replace('{days}', ...)` in App.tsx ersetzt

## Adaptives Lernen / Übungsmodus (PRACTICE) — Hinweise

- `TaskStat` (`types/game.ts`): pro konkreter Aufgabe (num1/num2/operation) correctCount + errorCount + lastSeen
- Storage Key: `app-task-stats` (separater Key, unabhängig von Session-Records)
- `recordTaskResult()` in `utils/storage.ts`: Race-Condition-sicher via Promise-Queue
- In App.tsx wird `taskStats` als Ref gehalten und per `useEffect` aktualisiert
- `DifficultyMode.PRACTICE`: 75% Chance schwache Aufgabe (Fehlerrate >30%, ≥3 Versuche), 25% zufällig; Aufgaben werden nach `effectiveMaxNumber` gefiltert (range-sicher)
- `getWeakTasks(stats)` in `utils/storage.ts`: reine Funktion, filtert + sortiert nach Fehlerrate absteigend
- ParentDashboard zeigt Top-5-Schwachstellen — unabhängig von vorhandenen Session-Records
- CI: `npm test --ci` läuft jetzt automatisch bei jedem PR (`.github/workflows/ci-cd.yml`, Job `test`)

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
