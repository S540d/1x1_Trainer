# 1x1 Trainer – Claude Memory

## Branch-Workflow

```
feature/fix → testing → staging → main
```

| Branch    | Zweck                              | Status    |
|-----------|------------------------------------|-----------|
| `main`    | Produktion (protected)             | stabil    |
| `staging` | Pre-Release, Qualitätssicherung    | aktuell   |
| `testing` | Integration neuer Features/Fixes   | aktuell   |

- PRs von Copilot/Claude landen zunächst gegen `testing`, nicht `main`
- Nach Review und CI-Grün: `testing → staging` per Squash-Merge
- `staging → main` nur für echte Releases

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

## Wichtige Dateien

| Datei                              | Inhalt                                          |
|------------------------------------|-------------------------------------------------|
| `utils/constants.ts`               | Farben (THEME_COLORS), DESIGN_TOKENS, STORAGE_KEYS |
| `utils/theme.ts`                   | `getThemeColors(isDarkMode)`                    |
| `utils/storage.ts`                 | Storage-Helfer inkl. `saveSessionRecord` / `getSessionRecords` |
| `types/game.ts`                    | ThemeColors, GameState, Enums, `SessionRecord`  |
| `jest.config.js`                   | Jest-Konfiguration                              |
| `components/Chip.tsx`              | Chip-Button (theme-aware seit #171)             |
| `components/ParentDashboard.tsx`   | Eltern-Dashboard Modal (neu seit #174)          |

## Letzte Änderungen

### PR #174 → testing (2026-05-08) – offen, CI pending
Schließt Issue #169 – Eltern-Dashboard
- `types/game.ts`: Neues `SessionRecord`-Interface (timestamp, operations, correctTasks, errors, errorRate, difficultyMode, numberRange)
- `utils/constants.ts`: Storage-Key `app-parent-stats` ergänzt
- `utils/storage.ts`: `saveSessionRecord()` + `getSessionRecords()` – Einträge älter als 28 Tage werden automatisch bereinigt
- `hooks/useGameLogic.ts`: Optionaler `onSessionComplete`-Callback; wird nach jeder Runde (Normal, Kreativ, Challenge) aufgerufen – außerhalb des `setGameState`-Updaters
- `components/ParentDashboard.tsx`: Neues Modal – Sitzungsliste nach Tag gruppiert, Fehlerquote farbcodiert (grün ≤10%, gelb ≤30%, rot >30%), 7-Tage-Zusammenfassung, Challenge-Badge ⚡
- `components/SettingsMenu.tsx`: „Eltern-Dashboard"-Button neben „Personalisieren"; neues Prop `onOpenParentDashboard`
- `i18n/translations.ts`: 10 neue Keys (DE/EN) – `parentDashboard`, `parentDashboardSubtitle`, `parentNoData`, `parentSessions`, `parentAvgError`, `parentToday`, `parentYesterday`, `parentCorrect`, `parentErrors`
- `App.tsx`: `saveSessionRecord` in `onSessionComplete`; `parentDashboardVisible`-State; `<ParentDashboard>`-Einbindung

### PR #171 → testing (2026-05-06)
- `Chip.tsx`: Dark-Mode-Fix – hardcodierte Farben durch `colors.buttonInactive` / `colors.buttonInactiveText` ersetzt
- `PersonalizeModal.tsx`, `SettingsMenu.tsx`: Titel-Font `FONT_NUMBER` → `FONT_UI`
- `Chip.test.tsx`: Neuer Regressionstest für Dark-Mode-Kontrast

### PR #172 → staging (2026-05-06)
- Promotion von `testing` → `staging` (enthält #171)
