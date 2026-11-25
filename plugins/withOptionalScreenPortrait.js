const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

/**
 * Keep the app locked to portrait at runtime, but do not make portrait a
 * required hardware feature. Google Play otherwise hides the app from devices
 * that do not report portrait support (including some tablets, desktop/XR).
 */
module.exports = function withOptionalScreenPortrait(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    const manifest = configWithManifest.modResults.manifest;
    const features = Array.isArray(manifest['uses-feature'])
      ? manifest['uses-feature']
      : [];
    const existing = features.find(
      (feature) => feature?.$?.['android:name'] === FEATURE
    );

    if (existing) {
      existing.$['android:required'] = 'false';
    } else {
      features.push({
        $: {
          'android:name': FEATURE,
          'android:required': 'false',
        },
      });
    }

    manifest['uses-feature'] = features;
    return configWithManifest;
  });
};
