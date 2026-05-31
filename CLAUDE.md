# 1x1 Trainer – Projektdokumentation für Claude

> **Zwei-Schichten-Dokumentation:**
> Diese Datei ist öffentlich im Repo. Sensible Infos (Keystore, Gerät-IDs, Secrets) liegen in `docs/private/CLAUDE.md` (gitignored, nur lokal).
> **Telefon-Workflow:** Notizen vom iPhone ans Ende dieser Datei schreiben → am Mac in die richtige Schicht einsortieren.

---

## Branch-Workflow

```
feature/fix → testing → staging → main
```

| Branch    | Zweck                              |
|-----------|------------------------------------|
| `main`    | Produktion (protected)             |
| `staging` | Pre-Release, Qualitätssicherung    |
| `testing` | Integration neuer Features/Fixes   |

- PRs von Copilot/Claude immer gegen `testing` öffnen, nicht `main`
- Copilot öffnet PRs automatisch gegen `main` → vor Merge: `gh pr edit <nr> --base testing`
- `gh pr merge` erlaubt kein `--base`-Flag — Basis muss vorher im PR geändert werden
- Nach jedem main-Merge: staging und testing synchronisieren

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

- **APK (Test):** Lokal bauen — Details in `docs/private/CLAUDE.md`
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

## Aktueller Stand (2026-05-31)

- Version: **1.3.6** / versionCode 26
- Tests: 494 passed, 3 skipped, 15/15 Suites grün
- Branches: `testing` und `staging` synchron (`3a22613`); `main` noch auf `cac8a3c`
- Offene PRs: #212 (staging → main, bereit zum Merge nach Staging-Tests)
- Offene Issues: #165, #156, #187, #100, #96
- Security: 17 Vulnerabilities (alle build-time über Expo-Tooling)

### Zuletzt gemergt / gepusht

| PR / Branch | Was |
|-------------|-----|
| #212 (offen) | staging → main: wartet auf Staging-Tests |
| #211 | testing → staging: Sound-Effekte, Visuelle Themes, Charts, UX, Jest 30 |
| Hotfix | Accessibility-Labels Score/Streak-Badge (Header.tsx), PersonalizeModal ScrollView-Höhe, useSounds-Tests (9 Tests), .wav-Mock in Jest |
| Hotfix | Fehlerquote-Chart zeigt 0%-Tage (barH=0 → 2px); useSounds überspringt AudioContext bei volume=0 |
| #210 | Sound-Effekte – useSounds-Hook, 5 WAV-Assets, expo-av, UI in PersonalizeModal (Issue #186) |
| #208 | Visuelle Themes / App-Skins – 5 Farbthemes (Issue #190) |
| #207 | Fortschritts-Charts im Parent Dashboard – Sessions + Fehlerquote (Issue #191) |

---

## Wichtige Dateien

| Datei | Inhalt |
|-------|--------|
| `utils/constants.ts` | THEME_COLORS, DESIGN_TOKENS, STORAGE_KEYS, CHALLENGE_LEVELS, `THEMES` (alle 5 Farbthemes mit LIGHT/DARK-Varianten) |
| `utils/theme.ts` | `getThemeColors(isDarkMode, themeName?)` — themeName optional, Default `'sunset'` |
| `utils/storage.ts` | Storage-Helfer, `saveSessionRecord` / `getSessionRecords`, `recordTaskResult` / `getTaskStats` / `getWeakTasks`, `updateStreakAfterSession` / `getStreakData` / `saveStreakData`, `saveThemeName` / `getThemeName`, `saveSoundsEnabled` / `getSoundsEnabled`, `saveSoundsVolume` / `getSoundsVolume`, `FOUR_WEEKS_MS` |
| `utils/animations.ts` | `prefersReducedMotion()` — liest Accessibility-Einstellung |
| `types/game.ts` | ThemeColors (inkl. `gradientPrimary`), GameState, Enums, SessionRecord, `ThemeName` |
| `i18n/translations.ts` | DE/EN Übersetzungen, `TranslationStrings`-Interface |
| `hooks/useGameLogic.ts` | Gesamte Spiellogik, `onSessionComplete`-Callback |
| `hooks/usePreferences.ts` | Persistierte User-Einstellungen (Sprache, ThemeMode, ThemeName, soundEnabled, soundVolume) |
| `hooks/useSounds.ts` | Sound-Hook: `playSound(event)` — Web: AudioContext-Oszillatoren, Native: expo-av + WAV-Assets |
| `assets/sounds/` | WAV-Assets: correct / incorrect / perfect / level_up / badge_unlock (je 8–17 KB) |
| `scripts/generate-sounds.js` | Generator für WAV-Assets (`node scripts/generate-sounds.js`) |
| `components/PersonalizeModal.tsx` | Aussehen-Modal (Light/Dark/System, Farbtheme-Picker, Sprache, Sound An/Aus + Lautstärke) |
| `components/ParentDashboard.tsx` | Eltern-Dashboard Modal (Beta) |
| `components/GameCard.tsx` | Hauptspielansicht (alle 3 Antwortmodi) |
| `styles/modalStyles.ts` | Gemeinsame Modal-Styles |
| `jest.config.js` | Jest-Konfiguration |
| `docs/private/CLAUDE.md` | Sensible Build/Keystore-Details (gitignored) |

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

- Größere Dependency-Updates verschoben: react-native 0.84, react 19.2.4, async-storage 3.x
- Reanimated wurde durch `Animated` core ersetzt (Web-Kompatibilität) — Issue #131

## Sound-Effekte — Hinweise

- `SoundEvent = 'correct' | 'incorrect' | 'perfect' | 'level_up' | 'badge_unlock'`
- Storage Keys: `app-sounds-enabled` / `app-sounds-volume` (Default: true / 75)
- Web: `AudioContext`-Oszillatoren (`playWebTone`), keine Dateien nötig
- Native: `expo-av` + WAV-Assets aus `assets/sounds/`; `playsInSilentModeIOS: false`
- Linting: `window.*` in `useSounds.ts` muss `// platform-safe` Kommentar tragen (CI-Check)
- WAV-Assets bei Bedarf neu generieren: `node scripts/generate-sounds.js`
- Hintergrundmusik: bewusst nicht implementiert (erfordert Lizenz-freie Loop-Audiodatei), separates Follow-up
