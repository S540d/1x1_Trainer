# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- **Current Version in Play Store**: 1.0.9
- **Latest Version**: 1.0.10 (includes critical startup fix + major refactoring)
- **Build Status**: ✅ Successfully built and ready for Play Store deployment
- **EAS Build**: https://expo.dev/accounts/devsven/projects/1x1-trainer/builds
