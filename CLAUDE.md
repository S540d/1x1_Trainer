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

- `expo-linear-gradient`, `expo-font`, `expo-status-bar`, `@expo-google-fonts` müssen in `transformIgnorePatterns` **und** `moduleNameMapper` eingetragen sein
- Neue Expo-Pakete immer in **beiden** Listen ergänzen
- `usePreferences.test.tsx` hat strukturelle React 19 `act()`-Warnung — Issue #160 (low priority)

---

## Aktueller Stand (2026-05-23)

- Version: **1.3.5** / versionCode 24
- Tests: 475 passed, 3 skipped, 14/14 Suites grün
- Branches: `testing` vorn (`3d52f56`); `staging` und `main` noch auf `1b551ea`
- Offene Issues: #165, #160, #156, #146, #131, #100, #96
- Security: 21 Vulnerabilities (alle über Expo-Tooling, build-time) → Issue #146

### Zuletzt gemergt (testing)

| PR  | Was |
|-----|-----|
| #200 | Täglicher Streak-Tracker (Issue #185) — StreakData, 🔥 Header-Badge, Abend-Warnung, ParentDashboard |
| #196 | fix: practiceModeFeedback im Übungsmodus in GameCard anzeigen + Tests |
| #195 | CI: Jest-Test-Job zu ci-cd.yml hinzufügen (läuft jetzt automatisch bei PRs) |
| #184 | Achievement & Badge System |
| #192 | Adaptives Lernen – Übungsmodus (PRACTICE) mit Schwachstellen-Fokus (Issue #188) |
| #183 | CI/CD ci-cd.yml-Startup-Failure beheben (Issue #152-Regression) |
| #177 | TypeScript-Fixes + isValidSessionRecord Enum-Validierung + Challenge-Ops Fix |

---

## Wichtige Dateien

| Datei | Inhalt |
|-------|--------|
| `utils/constants.ts` | THEME_COLORS, DESIGN_TOKENS, STORAGE_KEYS, CHALLENGE_LEVELS |
| `utils/theme.ts` | `getThemeColors(isDarkMode)` |
| `utils/storage.ts` | Storage-Helfer, `saveSessionRecord` / `getSessionRecords`, `recordTaskResult` / `getTaskStats` / `getWeakTasks`, `updateStreakAfterSession` / `getStreakData` / `saveStreakData`, `FOUR_WEEKS_MS` |
| `utils/animations.ts` | `prefersReducedMotion()` — liest Accessibility-Einstellung |
| `types/game.ts` | ThemeColors, GameState, Enums, SessionRecord |
| `i18n/translations.ts` | DE/EN Übersetzungen, `TranslationStrings`-Interface |
| `hooks/useGameLogic.ts` | Gesamte Spiellogik, `onSessionComplete`-Callback |
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

## Offene TODOs / Bekannte Einschränkungen

- Größere Dependency-Updates verschoben: react-native 0.84, jest 30, react 19.2.4, async-storage 3.x
- jest 30 würde 4x low Vulnerabilities (jest-environment-jsdom) beheben → Issue #146
- Reanimated wurde durch `Animated` core ersetzt (Web-Kompatibilität) — Issue #131
