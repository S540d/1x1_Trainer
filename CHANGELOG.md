# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ **Challenge Mode** (Issue #100): New endless game mode with progressive difficulty
  - Play until 3 mistakes — difficulty increases every few correct answers
  - 6 levels: starts with multiplication 1-10, progresses to mixed operations up to 100
  - Lives display with hearts, level indicator, and score tracking
  - Persistent high score across sessions
  - Full DE/EN translation support
  - 26 new tests (337 total, 334 passing, 3 skipped)
- ✨ **Automatic Language Detection** (Issue #97, PR #98): Smart language detection on first launch
  - Created `utils/language.ts` with `getDeviceLanguage()` function
  - Detects device language using expo-localization with fallback to English
  - Auto-saves detected language on first app start for consistency
  - Comprehensive test suite with 8 test cases covering all edge cases
  - Based on proven DrawFromMemory implementation pattern
  - All 311 tests passing (308 passed, 3 skipped)

### Fixed
- 🐛 **Layout Spacing** (Issue #58, PR #90): Improved spacing between question and input field
  - Reduced excessive gaps on Android devices by adjusting flexbox layout
  - Changed `questionCard` to use `justifyContent: 'space-between'`
  - Reduced `questionRow` marginBottom from 24px to 16px
  - Changed `answerArea` from `flex: 1` to `flexShrink: 0`
  - Creates more balanced layout on small screens and older Android devices

### Added
- ✨ **iOS PWA Icon Support** (Issue #37, PR #91): Comprehensive iOS home screen support
  - Added multiple apple-touch-icon links with cache-busting (180x180, 192x192, 512x512)
  - Changed status bar style to `black-translucent` for native-like appearance
  - Added `purpose: any maskable` to icon-180.png in manifest.json
  - Reorganized meta tags with clear comments for better maintainability
  - Proper icon display when PWA is added to iOS home screen

### Changed
- 🎨 **Personalize Button Style** (Issue #93, PR #94): Improved button visibility
  - Updated Personalize button to match unselected operation button style
  - Added oval gray border (borderRadius: 20, borderWidth: 2)
  - Transparent background with theme-aware border color
  - Better visual prominence and consistency with app design

### Technical
- ⚙️ **Jest Configuration**: Enhanced test infrastructure for Issue #97
  - Added transform for `.jsx?` files to handle ES modules
  - Added `transformIgnorePatterns` for expo-localization compatibility
  - Updated test mocks for new language detection utility

## [1.1.0] - 2026-01-24

### Added
- ✨ **Flexible Number Range** (Issue #80, PR #80): Enhanced number range selection
  - Expanded from 2 ranges to 4 selectable ranges: 1-10, 1-20, 1-50, 1-100
  - Added NumberRange enum with values RANGE_10, RANGE_20, RANGE_50, RANGE_100
  - Implemented storage migration from old SMALL/MEDIUM/LARGE to new format
  - Added UI in PersonalizeModal with 2x2 grid layout for range selection
  - Updated translations for all ranges in English and German
  - All 272 tests passing
- 🎯 **Three-Tier Motivational Messages** (Issue #76, PR #77): Improved feedback system
  - Replaced binary scoring with three-tier system:
    - 1-3 points: "Schade, versuche es nochmal!" / "Keep Going!"
    - 4-6 points: "Fast geschafft!" / "Almost There!"
    - 7-10 points: "Super!" / "Great!"
  - More granular encouragement based on performance
  - Updated translations in both languages

### Fixed
- 🐛 **CRITICAL: Number Range Enforcement** (Issue #81, PR #82): Fixed range violations
  - Problem: Tasks like "42×32=?" appeared even with 1-20 range selected
  - Root cause: Division/multiplication could generate numbers beyond selected range
  - Solution: Implemented smart generation (Option A - pedagogically sound):
    - **Multiplication**: Factors limited to 1-10 (follows 1x1 trainer pedagogy)
    - **Division**: Divisor 1-10, dividend capped at 100
    - **Addition/Subtraction**: Use full selected range
  - Prevents invalid tasks from being generated (no validation overhead)
  - Better UX: Problems stay manageable and learnable
  - All 272 tests passing

### Changed
- 🔄 **Deployment Workflow**: Implemented 3-tier deployment strategy for safer releases
  - Added `staging` branch between `testing` and `main`
  - Workflow: `feature → testing → staging → main`
  - New staging environment: https://s540d.github.io/1x1_Trainer/staging/
  - Added automated deployment workflow for staging branch
  - Updated CI/CD to run on all three branches (testing, staging, main)
  - Enhanced TESTING.md with comprehensive 3-tier workflow documentation
  - Reason: 1x1 Trainer has most active users - extra safety layer needed

### Fixed
- 🐛 **CRITICAL: Number Range Enforcement - Complete Fix** (PR #88): Fixed remaining range violations
  - **Problem 1 - Operand Generation**: All operands AND results now stay within range
    - Example fixed: Range 1-20 no longer shows "80÷10=?" (dividend 80 > 20)
    - Fixed for all operations: Addition sum, Subtraction minuend, Multiplication product, Division dividend
  - **Problem 2 - NUMBER_SEQUENCE Bug**: Fixed incorrect answer sequence centering
    - Example fixed: "93-90=?" now shows sequence around answer (3) instead of around minuend (93)
    - Was showing: 89-98 (incorrect)
    - Now shows: 1-10 (correct, centered around 3)
    - Fixed for ADDITION (now centers around sum) and SUBTRACTION (now centers around difference)
  - **Testing**: Added comprehensive test suite with 400+ new tests
    - New file: `useGameLogic.numberRange.test.tsx`
    - Tests all 4 operations × 4 ranges × 100 iterations = 1,600 validations
    - All 300/303 tests passing (3 skipped)
- 🐛 **Deployment**: Fixed staging deployment path corrections (Issue #78)
  - Added preparation step to `deploy-staging.yml` matching `deploy-testing.yml` pattern
  - Fixed asset paths for staging subdirectory (`/1x1_Trainer/staging/`)
  - Fixed service worker and manifest.json paths for staging environment
  - Fixed pre-commit hook for macOS compatibility (xargs -r not supported)
  - Staging deployment now correctly processes paths before publishing to gh-pages
  - Files deployed to gh-pages successfully, URL verification pending (CDN propagation)

### Added
- 🎨 **Landscape Mode Blocking**: Added bilingual landscape orientation blocking
  - Shows overlay message when device is in landscape mode
  - Message: "📱 Bitte drehen Sie Ihr Gerät ins Hochformat / Please rotate your device to portrait mode"
  - Includes accessibility support with ARIA live region
  - Enhances mobile UX by enforcing portrait mode

### Fixed
- 🐛 **CRITICAL: Game Logic Bugs** (Issue #66): Fixed multiple critical bugs in game operations
  - Fixed initial operation: Now defaults to MULTIPLICATION instead of undefined
  - Fixed TypeError: `setOperation is not a function` by syncing useGameLogic with usePreferences
  - Fixed NUMBER_SEQUENCE for factors: When asking for factors (e.g., `9×?=36`), now correctly shows 1-10 instead of multiples
  - **CRITICAL:** Fixed division NUMBER_SEQUENCE: `20÷4=?` now shows 1-10 sequence (answer 5 is included!)
  - Fixed subtraction logic: No more impossible questions like `11-?=66`
  - Fixed number range violations in subtraction (e.g., `?-33=1683`)
  - Fixed favicon: Replaced incorrect EnergyPriceGermany icon with correct 1x1 Trainer icon
  - All 267 tests passing with 89.67% coverage
- 🐛 **Creative Mode - NUMBER_SEQUENCE Layout** (Issue #31): Fixed number buttons overflow on all devices
  - Removed `flex: 1` from ScrollView to prevent competing for parent flex space
  - ScrollView now sizes naturally to content and scrolls only when needed
  - Check button remains visible and accessible on phones, tablets, and desktop
  - When many number buttons exceed available space, ScrollView scrolls smoothly
  - Resolves off-screen check button issue across all screen sizes

### Added
- ✅ **Comprehensive Tests for useTheme Hook**: Added 26 new tests
  - Theme initialization (light/dark/system)
  - System dark mode detection on web
  - matchMedia listener setup and cleanup
  - Mobile platform handling (iOS/Android)
  - Achieved 100% coverage for useTheme.ts
  - Overall test coverage increased from 85.27% to 89.67%

## [1.0.12] - 2025-12-22

### Fixed
- 🐛 **Creative Mode** (Issue #30): Fixed answer mode randomization
  - Answer modes now randomize after each question in Creative Mode
  - NUMBER_SEQUENCE properly restricted to result questions only (questionPart === 2)
  - Ensures varied gameplay experience throughout Creative Mode sessions
- 📱 Updated Android versionCode to 13

## [1.0.11] - 2025-12-22

### Added
- ✨ **Modernized UI Design** ("Soft & Modern" style)
  - Updated theme colors for better visual cohesion
  - Improved dark mode with warmer tones
  - Enhanced light mode with softer contrasts
- 🎮 **Difficulty Mode** added to Settings menu
  - Simplified settings interface with new mode selector
  - Allows players to adjust challenge level
- 🔧 **Code Refactoring (Phase 2)**:
  - Custom Hooks optimization (useGameLogic improvements)
  - Better state management and performance

### Fixed
- 🐛 **Android Platform**:
  - Enabled Hermes JavaScript engine for better performance
  - Fixed orientation restrictions to support large displays
- 🔧 **Pre-commit Hook**: Fixed xargs bug when no staged TS/JS files

### Changed
- 📱 Updated Android versionCode to 12

### Build & Deployment
- Build artifact: https://expo.dev/artifacts/eas/9Pu5SgYYtkTsH3DdHBM2cW.aab
- React 19.1.0 confirmed as production-ready
- Ready for App Store deployment

### Repository Maintenance
- ✅ Merged `testing` branch into `main`
- 🧹 Cleaned up stale branches:
  - Deleted `testing` (merged into main on 2025-12-21)
  - Deleted `15-einheitliches-aussehen-auf-verschiedenen-bildschirmgrößen` (old feature branch)
  - Deleted `copilot/optimize-display-layout` (old copilot branch)
  - Deleted `feature/default-multiplication` (completed feature)

## [1.0.10] - 2024-12-15

### Fixed
- 🚨 **CRITICAL**: App startup issue in Play Store
  - Removed old native Android project that conflicted with EAS Build
  - EAS Build now generates native Android code correctly
  - Configured Hermes JavaScript engine explicitly in app.json
  - Fixed "Fix gradlew build phase" error in EAS Build
- 🐛 TypeScript compilation error in utils/storage.ts
  - Added proper type casting for Operation enum
- 🔧 CI/CD workflow fixes for EAS Build:
  - Removed local Android build job (handled by EAS Build)
  - Updated version check path from App.tsx to utils/constants.ts
  - Updated Android versionCode check to only validate app.json
  - Expanded code quality checks to include hooks/, utils/, types/, i18n/ directories
  - Excluded utils/platform.ts from Web API checks (it's the platform wrapper)
- 🐛 Offset calculation in display logic
- 🔄 Duplicate logic in number sequence generation
- 🎨 Dark Mode UI: Container now respects theme mode on all screen sizes
  - Removed hardcoded white background color
  - Theme background color now applied consistently across all viewports

### Added
- 🏗️ **Major Code Refactoring (Phase 1 & 2)**:
  - Created `types/` directory for all TypeScript type definitions
  - Created `i18n/` directory for translation management
  - Created `utils/` directory with utility modules:
    - `constants.ts` - All app constants and configuration
    - `theme.ts` - Theme color management
    - `storage.ts` - Cross-platform storage abstraction
    - `platform.ts` - Platform-safe Web API wrapper
    - `calculations.ts` - Game calculation utilities
  - Created `hooks/` directory with custom React hooks:
    - `useTheme.ts` - Theme state and system dark mode detection
    - `usePreferences.ts` - User preferences with auto-save/load
    - `useGameLogic.ts` - Complete game state and logic management
  - Reduced App.tsx from 1567 → 1044 lines (-33% reduction)
  - Improved code maintainability and separation of concerns
- 🎨 Display mode optimization with configurable layouts
- ⚡ Performance improvements through memoization
- 🤖 Comprehensive automation system:
  - Pre-commit hooks for code quality
  - CI/CD pipeline with automated checks
  - Platform compatibility validation
  - Security audit integration
- 📱 Platform-safe Web API usage with proper guards

### Changed
- 🏗️ **Build System Migration**: Switched from native Android project to EAS Build
  - Removed old Kotlin/Jetpack Compose Android project
  - Now using Expo Managed Workflow with EAS Build
  - Simplified build process and deployment
- 🔧 Build configuration updates:
  - Changed EAS Build credentials source to "local"
  - Explicitly configured Hermes engine in app.json
  - Updated .gitignore to exclude AAB/APK artifacts
- 🔧 Optimized choice generation algorithm
- 📐 Improved display layout calculations
- 🧹 Code refactoring and dead code removal
- ✨ Enhanced constant extraction for better maintainability
- 📱 Updated Android versionCode to 11

## [1.0.9] - 2024-12-13

### Fixed
- 🚨 **Critical**: Android crash when checking dark mode
  - Added Platform.OS check before using window.matchMedia
  - Prevents crash on Android native app launch
- 🔧 Removed expo-updates dependency for TWA build compatibility

### Changed
- 📱 Updated Android versionCode to 10
- 🔒 Improved build configuration for TWA

## [1.0.8] - Previous releases

See git history for older changes.

---

## Upcoming Features (planned for future versions)

- Updated Play Store screenshots
- Additional display mode improvements
- Performance optimizations
- Additional game modes

## Notes

- **Current Version in Play Store**: 1.0.9 (as of 2025-12-21)
- **Latest Version**: 1.0.12 (includes modernized UI, difficulty mode, Creative Mode bugfix)
- **Build Status**: ✅ Successfully built and ready for Play Store deployment
  - v1.0.11 Build artifact: https://expo.dev/artifacts/eas/9Pu5SgYYtkTsH3DdHBM2cW.aab
  - v1.0.12 Build artifact: https://expo.dev/artifacts/eas/5LYQE6yhp8ikXsi3xiU3e.aab
- **EAS Build**: https://expo.dev/accounts/devsven/projects/1x1-trainer/builds/00aab1ea-1999-4674-b102-0c05ec1314e9
- **Next Steps**: Submit v1.0.12 to Play Store
