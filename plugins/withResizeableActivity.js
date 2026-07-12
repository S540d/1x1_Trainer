const { withAndroidManifest } = require('expo/config-plugins');

// Play Store Warnung (Android 16, Issue #275): ohne resizeableActivity="true"
// stuft der Play Store die App als größenänderungs-/orientierungsbeschränkt ein.
// android/ wird per prebuild generiert (nicht versioniert) - der Fix muss daher
// hier als Config-Plugin leben statt direkt im Manifest.
module.exports = function withResizeableActivity(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const activities = application?.activity ?? [];
    for (const activity of activities) {
      activity.$['android:resizeableActivity'] = 'true';
    }
    return config;
  });
};
