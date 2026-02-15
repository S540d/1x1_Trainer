# Claude Code Instructions - 1x1 Trainer

## Project Overview
1x1 Trainer - A cross-platform multiplication trainer for children with multiple game modes, built as a React Native app with PWA support.

**Tech Stack:**
- React Native with Expo SDK 54
- TypeScript
- React Native Web (PWA support)
- AsyncStorage (data persistence)
- EAS Build via eas-cli 18 (Android builds)
- GitHub Pages (web deployment)
- Jest (testing)
- **Node.js >= 20** required (enforced in package.json `engines`)

## Key Project Documents
- [Changelog](../CHANGELOG.md) - Version history
- [Documentation](../docs/README.md) - Documentation index
- [Testing Guide](../docs/TESTING.md) - Testing workflow and environments
- [Release Checklist](../docs/RELEASE_CHECKLIST.md) - Release process

## Development Guidelines

### Code Style
- Use **TypeScript** with strict typing
- Keep App.tsx as the main component
- Use custom hooks in `/hooks` for state management:
  - `useTheme.ts` - Theme management & dark mode
  - `usePreferences.ts` - User preferences with auto-save
  - `useGameLogic.ts` - Game state and logic
- Keep utility modules in `/utils`

### Game Modes
1. **Normal** - Result is missing (3 × 4 = ?)
2. **First missing** - First number missing (? × 4 = 12)
3. **Second missing** - Second number missing (3 × ? = 12)
4. **Mixed** - Random combination of all modes

### Difficulty Modes
1. **Simple** - Fixed number range, single operation
2. **Creative** - User-selected operations and range
3. **Challenge** - Endless mode with progressive difficulty (3 lives, 6 levels)
   - Levels escalate from multiplication 1-10 to mixed operations 1-100
   - Persistent high score across sessions
   - Config in `utils/constants.ts` (`CHALLENGE_LEVELS`, `CHALLENGE_MAX_LIVES`)

### Cross-Platform Considerations
- **Priority:** Android App + Web PWA
- Use `Platform.OS` checks for platform-specific code
- Use `utils/platform.ts` for Web API access
- PWA features: offline support, installable, service worker

### Pre-Commit Hooks
Validation rules enforced by Husky (`.husky/pre-commit`):
1. **No console.log/debug** (except in scripts/)
2. **Platform-safe Web API usage** (window.*, localStorage.*)
3. **Version consistency** (package.json vs app.json)

**Note:** grep pipes use `|| true` to prevent false failures under `set -e` when no TS/JS files are staged.

#### Testing & Environments (3-Tier Workflow)
| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| **Production** | https://s540d.github.io/1x1_Trainer/ | `main` | Stable release for end users |
| **Staging** | https://s540d.github.io/1x1_Trainer/staging/ | `staging` | Pre-production final review |
| **Testing** | https://s540d.github.io/1x1_Trainer/testing/ | `testing` | Development testing |

**Workflow:** `feature → testing → staging → main`
**Rule:** NEVER merge directly from `testing` to `main`! Always go through `staging`.

**Important:** All environments deploy to subdirectories in the `gh-pages` branch:
- Production deploys to root `/`
- Staging deploys to `/staging/` with path rewriting via sed
- Testing deploys to `/testing/` with path rewriting via sed
- After deployment, an empty commit triggers GitHub Pages rebuild (required for subdirectories)

### Test Coverage (Current)
- **Total Tests:** 337 (334 passing, 3 skipped)
- **Coverage:** ~90%
- **Test Files:** 8 suites
  - `useGameLogic.test.tsx` - 90.58% coverage (includes 26 challenge mode tests)
  - `usePreferences.test.tsx` - 100% coverage
  - `useTheme.test.ts` - 100% coverage
  - `storage.test.ts` - 96.66% coverage
  - `theme.test.ts` - 100% coverage
  - `platform.test.ts` - 55.76% coverage
  - `language.test.ts` - 100% coverage
  - `useGameLogic.numberRange.test.tsx` - Coverage included

## Critical Areas

1. **Game Logic (hooks/useGameLogic.ts):**
   - Generates problems for all 4 operations (Addition, Subtraction, Multiplication, Division)
   - Validates answers across all game modes
   - Tracks score and streaks
   - **Challenge Mode:** Lives system, level progression via `getChallengeLevel()`, high score tracking
   - **NUMBER_SEQUENCE Logic:** Critical! When asking for factors/operands (questionPart 0/1), shows 1-10. When asking for result (questionPart 2), shows appropriate range/multiples.
   - `getMaxNumber(range?)` accepts optional NumberRange parameter for challenge mode
   - Don't modify without extensive testing - 90.58% test coverage

2. **PWA Configuration (public/):**
   - `manifest.json` - PWA manifest
   - `service-worker.js` - Offline caching
   - `pwa-update.js` - Update notifications
   - Icons: 96px to 512px sizes

3. **Theme System (hooks/useTheme.ts, utils/constants.ts):**
   - Light/Dark mode support
   - System theme detection
   - Persistent theme preference
   - **Light mode palette:** Indigo (#4F46E5) accent, Emerald (#10B981) secondary, Slate (#94A3B8) disabled
   - Theme colors defined in `THEME_COLORS` constant in `utils/constants.ts`

4. **Storage (utils/storage.ts):**
   - Cross-platform storage adapter
   - AsyncStorage (mobile) vs localStorage (web)
   - User preferences, scores, and challenge high scores

5. **Language Detection (utils/language.ts):**
   - Automatic device language detection on first launch
   - Uses expo-localization with fallback to English
   - Supports German (de) and English (en)
   - Auto-saves detected language for consistency
   - 100% test coverage with comprehensive edge case handling

## Common Tasks

### Adding a New Feature
1. Check if it affects game logic
2. Update translations in `i18n/translations.ts`
3. Test on both web and mobile (Expo Go)
4. Update CHANGELOG.md

### Testing
```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Building & Deploying
```bash
npm run build:web     # Web/PWA build
npm run deploy        # Deploy to GitHub Pages
npm run build:android # Android build via EAS
npm run validate      # Release validation
```

### Cleanup & Maintenance
When working on features, use this cleanup checklist at end of session:
- [ ] Stop any running local servers (http-server, etc.)
- [ ] Update CHANGELOG.md with changes
- [ ] Update .claude/CLAUDE.md if architecture changed
- [ ] Delete merged feature branches (local and remote)
- [ ] Ensure all changes are committed and pushed
- [ ] Clean up temporary files and test artifacts
- [ ] Verify git status is clean
- [ ] Sync documentation with code changes

### PWA Testing
```bash
npm run build:web
cd dist && npx http-server -p 8080
# Open http://localhost:8080
# Chrome DevTools → Application Tab → Check Manifest & Service Worker
```

## Known Issues & Gotchas

### PWA Installation
- Service worker must be at root level
- Icons need all required sizes (96-512px)
- manifest.json must have correct start_url

### Mobile vs Web Differences
- Touch feedback differs
- Keyboard input handling
- Storage API differences

### Jest & Testing
- expo-localization requires special handling as ES module
- Mock expo-localization before imports in test files
- Use `transformIgnorePatterns` for expo modules in jest.config.js
- Transform both `.tsx?` and `.jsx?` files for complete coverage

### Branch Workflow (3-Tier System)
1. Develop on feature branches from `testing`
2. Test locally with `npm run web`
3. Merge to `testing` for development testing
4. Merge to `staging` for pre-production review
5. Merge to `main` after successful staging tests
6. **IMPORTANT:** Never skip staging! 1x1 Trainer has most active users.

## Architecture Notes

### Module Structure
```
App.tsx                  # Main app component

hooks/
├── useTheme.ts          # Theme management
├── usePreferences.ts    # User preferences
└── useGameLogic.ts      # Game state & logic

types/
└── game.ts              # TypeScript definitions

i18n/
└── translations.ts      # DE/EN translations

utils/
├── constants.ts         # App constants, challenge config, theme colors
├── theme.ts             # Theme color mapping
├── storage.ts           # Cross-platform storage
├── platform.ts          # Platform detection
├── language.ts          # Language detection
└── calculations.ts      # Game calculations

components/
└── PersonalizeModal.tsx  # Settings/personalization modal

public/
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline caching
├── pwa-update.js        # Update manager
└── icon-*.png           # App icons

scripts/
├── post-build.js        # Build processing
├── test-pwa.sh          # PWA validation
├── generate-icons.py    # Icon generation
└── validate-release.sh  # Release checks
```

### Data Flow
1. User starts game → Initialize game state
2. Generate problem → Display on screen
3. User enters answer → Validate & show feedback
4. Update score → Save to storage
5. Continue or end game

## Do's and Don'ts

### ✅ Do:
- Use existing hooks for state management
- Test both DE and EN translations
- Validate PWA before deployment
- Update CHANGELOG.md for releases
- Test on actual mobile devices

### ❌ Don't:
- Modify service-worker.js without testing offline
- Skip PWA validation (Lighthouse)
- Break existing game modes
- Hardcode text strings (use i18n)
- Deploy without running validate script

## PWA Checklist

Before releasing PWA updates:
- [ ] manifest.json is valid
- [ ] All icon sizes present (96-512px)
- [ ] Service worker caches correctly
- [ ] Offline mode works
- [ ] Lighthouse PWA score ≥90
- [ ] Install prompt appears

## Questions?
Refer to documentation or check GitHub issues:
- [GitHub Issues](https://github.com/S540d/1x1_Trainer/issues)
- [PWA Optimization Guide](../PWA-OPTIMIZATION.md)
- [PWA Testing Guide](../PWA-TESTING.md)
