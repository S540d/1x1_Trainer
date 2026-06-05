# 1x1 Trainer - Cross-Platform (React Native + PWA)

A cross-platform multiplication table trainer for Android and Web (PWA) built with React Native.

## Live

- **Web App:** [https://s540d.github.io/1x1_Trainer/](https://s540d.github.io/1x1_Trainer/)
- **Testing:** [https://s540d.github.io/1x1_Trainer/testing/](https://s540d.github.io/1x1_Trainer/testing/)

[![Play Store](https://img.shields.io/badge/Google_Play-Download-green?logo=google-play)](https://play.google.com/store/apps/details?id=com.devsven.x1x1trainer)

## Tech Stack

| Technology | Role |
|---|---|
| React Native + Expo | Cross-platform framework |
| TypeScript | Type-safe JavaScript |
| React Native Web | Web support |
| Hermes | Optimized JavaScript engine |
| Service Worker | PWA offline support |

## Setup

### Prerequisites
```bash
npm install
```

### Android development
```bash
npm run android
```

### Web/PWA development
```bash
npm run web
```

### iOS development (Mac + Xcode required)
```bash
npm run ios
```

### Web/PWA Build
```bash
npm run build:web
```

### PWA testing locally
```bash
npm run build:web
cd dist
npx http-server -p 8080
# Open browser: http://localhost:8080
```

## Features

- ✅ **4 game modes**:
  - Normal tasks (result unknown)
  - First number missing
  - Second number missing
  - Mixed

- ✅ **Cross-Platform**:
  - Native Android app
  - Progressive Web App (PWA)
  - iOS (experimental)

- ✅ Score system
- ✅ Visual feedback (green/red)
- ✅ Installable as PWA

## PWA Installation

The web version can be installed as an app on mobile devices and desktops:

1. Open the web app in a browser
2. Tap "Add to Home Screen" (mobile) or the install icon in the address bar (desktop)
3. The app is installed like a native app

### PWA Features
- ✅ **Installable** - As a real app on the home screen
- ✅ **Offline-capable** - Works without internet
- ✅ **App icons** - Fully optimized for all devices (96px-512px)
- ✅ **Fast** - Intelligent caching & performance
- ✅ **Responsive** - Perfect on all screen sizes

## Project Structure

```
1x1_Trainer/
├── App.tsx                      # Main app component
├── hooks/                       # Custom React Hooks
│   ├── useTheme.ts             # Theme management & dark mode
│   ├── usePreferences.ts       # User preferences with auto-save
│   └── useGameLogic.ts         # Game state & logic
├── types/                       # TypeScript type definitions
├── i18n/                        # Internationalization (DE/EN)
├── utils/                       # Utility modules
├── public/                      # PWA assets & web config
├── scripts/                     # Build and validation scripts
└── playstore-assets/            # Play Store marketing assets
```

## Tech Stack

- **React Native** - Cross-platform framework
- **Expo** - Build & development tools (managed workflow)
- **React Native Web** - Web support
- **TypeScript** - Type safety
- **Hermes** - JavaScript engine for optimized performance

## Build Process

### Android Production Builds

This project uses **Expo Managed Workflow** with local builds:

```bash
# Generate Android project
EXPO_ENV=production npx expo prebuild --platform android --clean

# Build signed AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

## Migration from Android Project

The original Android project (Kotlin + Jetpack Compose) was ported to React Native with Expo Managed Workflow:
- ✅ One shared codebase for Android and Web
- ✅ PWA support out of the box
- ✅ Simpler maintenance through Expo infrastructure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
