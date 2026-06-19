import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

if (Platform.OS !== 'web') {
  // Lazy import so web build doesn't bundle native-only Firebase modules.
  // Disabled in dev to avoid polluting the Firebase console with dev traffic.
  void import('@react-native-firebase/crashlytics')
    .then(({ default: crashlytics }) => {
      crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
    })
    .catch(() => {
      // Silently ignore — Crashlytics unavailable in Expo Go or misconfigured builds
    });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
