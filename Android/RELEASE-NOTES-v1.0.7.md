# Release Notes v1.0.7

**Release Date:** December 6, 2024
**Version Code:** 8
**Version Name:** 1.0.7

## 🎉 New Features

### Theme Customization
- **Light/Dark/System Mode Toggle**: Users can now choose between light mode, dark mode, or follow system settings
- **Default Theme**: Light mode is now the default (previously system)
- **Improved Dark Mode**: Fixed visual issues on large screens (white bar removed)
- **Better Readability**: Points counter color now matches label color in dark mode (no more hard-to-read purple text)

### Settings Persistence
- **Operation Preference**: The selected operation (Addition/Multiplication) is now saved and restored on app restart
- **Theme Preference**: Theme selection persists across app sessions
- **Default Operation**: Multiplication is the default (as originally intended)

### User Experience
- **Motivation Messages**: After every 10 solved tasks, users receive an encouraging message to continue
- **Task Counter**: Total solved tasks are tracked and persisted across sessions

## 🐛 Bug Fixes

- Fixed white bar appearing at the bottom in dark mode on large screens
- Points color now uses theme-aware text color instead of fixed purple
- ScrollView background now correctly adapts to theme

## 🔧 Technical Changes

- Removed `expo-updates` dependency (incompatible with TWA build)
- Updated versionCode: 7 → 8
- Updated versionName: "1.0.6" → "1.0.7"
- Synchronized version numbers across app.json and build.gradle.kts
- Added `.nojekyll` to fix GitHub Pages deployment

## 📦 Build Information

- **Bundle Size:** 4.9 MB
- **Build Type:** bundleRelease (AAB)
- **Keystore:** 1x1-trainer-key.keystore
- **Min SDK:** 21
- **Target SDK:** 36

## 📱 Deployment

The app bundle is ready for Play Store upload at:
`Android/release/1x1-trainer-v1.0.7-signed.aab`

## 🌐 Web Version

Web version deployed to GitHub Pages with all new features:
https://s540d.github.io/1x1_Trainer

---

**Commits included in this release:**
- feat: Add light/dark mode toggle, persist operation setting, motivation messages
- fix: Restore default operation to multiplication
- fix: Remove OTA update config to fix build
- fix: Remove expo-updates code for TWA build
- build: Update Android versionCode to 8 and versionName to 1.0.7
