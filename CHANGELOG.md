# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎨 Display mode optimization with configurable layouts
- ⚡ Performance improvements through memoization
- 🤖 Comprehensive automation system:
  - Pre-commit hooks for code quality
  - CI/CD pipeline with automated checks
  - Platform compatibility validation
  - Security audit integration
- 📱 Platform-safe Web API usage

### Changed
- 🔧 Optimized choice generation algorithm
- 📐 Improved display layout calculations
- 🧹 Code refactoring and dead code removal
- ✨ Enhanced constant extraction for better maintainability

### Fixed
- 🐛 Offset calculation in display logic
- 🔄 Duplicate logic in number sequence generation

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

## Upcoming Features (planned for 1.1.0)

- Code modularization (App.tsx refactoring)
- Updated Play Store screenshots
- Additional display mode improvements
- Performance optimizations

## Notes

- **Current Version in Play Store**: 1.0.9 (in review)
- **Current Development Version**: 1.0.9 + unreleased features
- **Next Planned Version**: 1.1.0
