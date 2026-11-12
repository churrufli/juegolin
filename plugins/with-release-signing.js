// Firma de la versión release fuera de EAS (GitHub Actions).
// Si existe JUEGOLIN_KEYSTORE_PATH, Gradle firma con esa clave; si no, con la de depuración.
// ANDROID_VERSION_CODE (opcional) sustituye al versionCode de app.json.
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_SIGNING = `
        release {
            if (System.getenv('JUEGOLIN_KEYSTORE_PATH')) {
                storeFile file(System.getenv('JUEGOLIN_KEYSTORE_PATH'))
                storePassword System.getenv('JUEGOLIN_KEYSTORE_PASSWORD')
                keyAlias System.getenv('JUEGOLIN_KEY_ALIAS')
                keyPassword System.getenv('JUEGOLIN_KEY_PASSWORD')
            }
        }`;

module.exports = function withReleaseSigning(config) {
  const versionCode = Number(process.env.ANDROID_VERSION_CODE);
  if (Number.isInteger(versionCode) && versionCode > 0) {
    config.android = { ...config.android, versionCode };
  }
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes('JUEGOLIN_KEYSTORE_PATH')) return cfg;
    const releaseBlock = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
    if (!releaseBlock.test(gradle) || !/signingConfigs\s*\{/.test(gradle)) {
      throw new Error('with-release-signing: no se reconoce android/app/build.gradle');
    }
    gradle = gradle.replace(
      releaseBlock,
      "$1signingConfig System.getenv('JUEGOLIN_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug",
    );
    gradle = gradle.replace(/signingConfigs\s*\{/, (m) => m + RELEASE_SIGNING);
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
