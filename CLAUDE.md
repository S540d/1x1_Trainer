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

| Datei                        | Inhalt                              |
|------------------------------|-------------------------------------|
| `utils/constants.ts`         | Farben (THEME_COLORS), DESIGN_TOKENS |
| `utils/theme.ts`             | `getThemeColors(isDarkMode)`        |
| `types/game.ts`              | ThemeColors, GameState, Enums       |
| `jest.config.js`             | Jest-Konfiguration                  |
| `components/Chip.tsx`        | Chip-Button (theme-aware seit #171) |

## Letzte Änderungen

### PR #171 → testing (2026-05-06)
- `Chip.tsx`: Dark-Mode-Fix – hardcodierte Farben durch `colors.buttonInactive` / `colors.buttonInactiveText` ersetzt
- `PersonalizeModal.tsx`, `SettingsMenu.tsx`: Titel-Font `FONT_NUMBER` → `FONT_UI`
- `Chip.test.tsx`: Neuer Regressionstest für Dark-Mode-Kontrast

### PR #172 → staging (2026-05-06)
- Promotion von `testing` → `staging` (enthält #171)
