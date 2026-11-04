const { withAppBuildGradle } = require('expo/config-plugins');

// Play Store Hinweis (Release 35/1.6.0): "Deine R8-Konfiguration könnte zu einer
// höheren Arbeitsspeichernutzung und einer geringeren Leistung führen."
// Das Expo-Template bindet proguard-android.txt ein, das -dontoptimize enthält -
// R8 kürzt dann nur, optimiert aber nicht. proguard-android-optimize.txt schaltet
// die Optimierung frei. android/ wird per prebuild generiert, daher Config-Plugin.
module.exports = function withR8Optimize(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /getDefaultProguardFile\(\s*["']proguard-android\.txt["']\s*\)/g,
      'getDefaultProguardFile("proguard-android-optimize.txt")'
    );
    return config;
  });
};
