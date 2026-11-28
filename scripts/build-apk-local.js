#!/usr/bin/env node
/**
 * Compila un APK en local con el Android SDK / Android Studio instalado,
 * sin usar EAS.
 *
 * Pasos:
 * 1. Sincroniza el proyecto nativo con `npx expo prebuild` (si hace falta).
 * 2. Ejecuta el Gradle wrapper del proyecto `android/`.
 * 3. Copia el APK a `dist/apk-local/`.
 *
 * Requisitos: JDK 17+ y Android SDK. Si tienes Android Studio, el script
 * detecta su JBR y el SDK por defecto.
 *
 * Run with:
 *   npm run apk-local
 *   npm run apk-local -- --debug
 *   npm run apk-local -- --clean --abi arm64-v8a
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ANDROID_DIR = path.join(ROOT, 'android');
const OUTPUT_DIR = path.join(ROOT, 'dist', 'apk-local');
const IS_WINDOWS = process.platform === 'win32';
const JAVA_BIN = IS_WINDOWS ? 'java.exe' : 'java';

const APP_CONFIG = require(path.join(ROOT, 'app.json')).expo;
const APP_VERSION = APP_CONFIG.version;

const log = (message) => console.log(`\n[apk-local] ${message}`);
const warn = (message) => console.warn(`[apk-local] ${message}`);
const fail = (message) => {
  console.error(`\n[apk-local] ERROR: ${message}`);
  process.exit(1);
};

const printHelp = () => {
  console.log(`
Uso: npm run apk-local [-- opciones]

  --debug         Compila assembleDebug en vez de assembleRelease.
  --clean         Regenera la carpeta android/ desde app.json.
  --no-prebuild   Omite expo prebuild y usa la carpeta android/ existente.
  --ignore-long-paths  Windows: intenta compilar sin long paths habilitados.
  --version-code <n>   Fija el versionCode del APK (por defecto 1).
  --abi <abis>    Compila solo las ABIs indicadas, separadas por comas.
                  Ejemplo: --abi arm64-v8a,armeabi-v7a
  -h, --help      Muestra esta ayuda.

El APK final queda en dist/apk-local/.`);
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    debug: false,
    clean: false,
    prebuild: true,
    abi: null,
    versionCode: null,
    ignoreLongPaths: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const [name, inlineValue] = arg.startsWith('--')
      ? arg.slice(2).split('=')
      : [arg, undefined];

    switch (name) {
      case 'debug':
        options.debug = true;
        break;
      case 'clean':
        options.clean = true;
        break;
      case 'no-prebuild':
        options.prebuild = false;
        break;
      case 'ignore-long-paths':
        options.ignoreLongPaths = true;
        break;
      case 'version-code': {
        const value = inlineValue ?? args[index + 1];
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 2100000000) {
          fail('--version-code necesita un entero positivo (máximo 2100000000).');
        }
        options.versionCode = parsed;
        if (inlineValue === undefined) index += 1;
        break;
      }
      case 'abi': {
        const value = inlineValue ?? args[index + 1];
        if (value && !value.startsWith('--')) {
          options.abi = value.replace(/\s+/g, '');
          if (inlineValue === undefined) index += 1;
        }
        if (!options.abi) fail('La opción --abi necesita un valor.');
        break;
      }
      case 'help':
      case 'h':
        options.help = true;
        break;
      default:
        fail(`Opción desconocida: ${arg}. Usa --help.`);
    }
  }

  return options;
};

const options = parseArgs();

if (options.help) {
  printHelp();
  process.exit(0);
}

const variant = options.debug ? 'Debug' : 'Release';
const apkFile = options.debug ? 'app-debug.apk' : 'app-release.apk';
const apkRelative = path.join(
  'app',
  'build',
  'outputs',
  'apk',
  options.debug ? 'debug' : 'release',
  apkFile
);

const run = (command, commandArgs, runOptions = {}) => {
  // En Windows, npx y gradlew son .cmd/.bat: se invocan con cmd.exe en vez de
  // shell para no depender del escapado de argumentos de Node.
  const useCmd = IS_WINDOWS && /^(npx|gradlew\.bat)$/i.test(command);
  const result = spawnSync(
    useCmd ? 'cmd.exe' : command,
    useCmd ? ['/d', '/c', command, ...commandArgs] : commandArgs,
    {
      cwd: runOptions.cwd ?? ROOT,
      env: runOptions.env ?? process.env,
      stdio: 'inherit',
    }
  );

  if (result.error) {
    fail(`No se pudo ejecutar ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`${command} terminó con código ${result.status}.`);
  }
};

const commandExists = (command) => {
  const result = IS_WINDOWS
    ? spawnSync('cmd.exe', ['/d', '/c', 'where', command], { stdio: 'ignore' })
    : spawnSync('which', [command], { stdio: 'ignore' });

  return result.status === 0;
};

const hasWindowsLongPaths = () => {
  if (!IS_WINDOWS) return true;

  const result = spawnSync(
    'reg',
    [
      'query',
      'HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem',
      '/v',
      'LongPathsEnabled',
    ],
    { encoding: 'utf8' }
  );

  return result.status === 0 && /LongPathsEnabled\s+REG_DWORD\s+0x1\b/i.test(result.stdout ?? '');
};

const checkWindowsLongPaths = () => {
  if (hasWindowsLongPaths()) return;

  const message = [
    'Windows no tiene habilitados los long paths.',
    'React Native (New Architecture) genera rutas de CMake de más de 260 caracteres',
    'y la compilación nativa fallará con "ninja: error: mkdir(...)".',
    'Solución:',
    '  1. Ejecuta en PowerShell como administrador:',
    '     New-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force',
    '  2. Reinicia Windows.',
    '  3. Instala CMake 3.31.6 o superior en Android Studio > SDK Manager > SDK Tools.',
    '     El script lo detecta y lo usa automáticamente.',
    'Guía: https://docs.expo.dev/troubleshooting/windows-long-paths',
  ].join('\n');

  if (!options.ignoreLongPaths) {
    fail(`${message}\n\nUsa --ignore-long-paths para intentar compilar de todos modos.`);
  }

  warn(message);
};

const findAndroidStudioJbr = () => {
  const candidates = [
    process.env.ANDROID_STUDIO_JBR,
    process.env.ProgramFiles
      ? path.join(process.env.ProgramFiles, 'Android', 'Android Studio', 'jbr')
      : null,
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Android Studio', 'jbr')
      : null,
    '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    path.join(os.homedir(), 'android-studio', 'jbr'),
    '/opt/android-studio/jbr',
    '/usr/local/android-studio/jbr',
  ].filter(Boolean);

  return candidates.find((candidate) =>
    fs.existsSync(path.join(candidate, 'bin', JAVA_BIN))
  );
};

const readLocalProperties = () => {
  const file = path.join(ANDROID_DIR, 'local.properties');
  if (!fs.existsSync(file)) return {};

  const entries = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    entries[key] = value.replace(/\\(.)/g, '$1');
  }
  return entries;
};

const writeSdkDir = (sdkDir) => {
  const file = path.join(ANDROID_DIR, 'local.properties');
  const properties = readLocalProperties();
  const escaped = sdkDir.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
  const lines = [`sdk.dir=${escaped}`];

  for (const [key, value] of Object.entries(properties)) {
    if (key === 'sdk.dir') continue;
    lines.push(`${key}=${value.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}`);
  }

  fs.writeFileSync(file, `${lines.join('\n')}\n`, 'utf8');
};

const findDefaultSdk = () => {
  const candidates = [
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
      : null,
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    path.join(os.homedir(), 'Android', 'Sdk'),
    path.join(os.homedir(), 'android-sdk'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

const MIN_CMAKE_VERSION = '3.31.6';

const compareVersions = (a, b) => {
  const left = a.split('.').map((part) => Number(part));
  const right = b.split('.').map((part) => Number(part));

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
};

const findModernCmakeVersion = (sdkDir) => {
  const cmakeDir = path.join(sdkDir, 'cmake');
  if (!fs.existsSync(cmakeDir)) return null;

  return (
    fs
      .readdirSync(cmakeDir)
      .filter((name) => /^\d+\.\d+\.\d+$/.test(name))
      .filter((name) => compareVersions(name, MIN_CMAKE_VERSION) >= 0)
      .sort((a, b) => compareVersions(b, a))[0] ?? null
  );
};

const readGradleProperties = (file) => {
  if (!fs.existsSync(file)) return {};

  const entries = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    entries[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return entries;
};

const hasConfiguredCmakeVersion = () => {
  if (process.env['ORG_GRADLE_PROJECT_android.cmakeVersion']) return true;

  const gradleHome =
    process.env.GRADLE_USER_HOME ?? path.join(os.homedir(), '.gradle');

  return [
    path.join(ANDROID_DIR, 'gradle.properties'),
    path.join(gradleHome, 'gradle.properties'),
  ].some((file) => 'android.cmakeVersion' in readGradleProperties(file));
};

const readPackageJson = () =>
  JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const restoreDevScripts = (originalScripts) => {
  const pkg = readPackageJson();
  let changed = false;

  for (const name of ['android', 'ios']) {
    if (
      originalScripts[name] !== undefined &&
      pkg.scripts?.[name] !== originalScripts[name]
    ) {
      pkg.scripts[name] = originalScripts[name];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(
      path.join(ROOT, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
      'utf8'
    );
    log('Restaurados los scripts android/ios de package.json.');
  }
};

const readAppBuildGradle = () => {
  const file = path.join(ANDROID_DIR, 'app', 'build.gradle');
  if (!fs.existsSync(file)) {
    fail('No se encontró android/app/build.gradle. Regenera android/ con --clean.');
  }
  return { file, content: fs.readFileSync(file, 'utf8') };
};

const readVersionCode = () => {
  const { content } = readAppBuildGradle();
  return content.match(/^\s*versionCode\s+(\d+)/m)?.[1] ?? null;
};

const applyVersionCode = (versionCode) => {
  const { file, content } = readAppBuildGradle();
  const pattern = /^(\s*versionCode\s+)\d+(\s*)$/m;

  if (!pattern.test(content)) {
    fail(
      'No se encontró versionCode en android/app/build.gradle. Usa --clean y vuelve a intentarlo.'
    );
  }

  fs.writeFileSync(
    file,
    content.replace(pattern, (_, before, after) => `${before}${versionCode}${after}`),
    'utf8'
  );
  log(`versionCode: ${versionCode}`);
};

const prebuild = () => {
  const originalScripts = readPackageJson().scripts ?? {};

  if (fs.existsSync(ANDROID_DIR) && !options.clean) {
    log('Sincronizando android/ con app.json (usa --clean para regenerarlo).');
  } else {
    log('Generando android/ con expo prebuild.');
  }

  const prebuildArgs = ['expo', 'prebuild', '--platform', 'android', '--no-install'];
  if (fs.existsSync(ANDROID_DIR) && !options.clean) {
    prebuildArgs.push('--no-clean');
  }

  run('npx', prebuildArgs, {
    env: {
      ...process.env,
      // android/ está ignorado por git; no hace falta confirmar cambios sucios
      // antes de regenerar la carpeta nativa.
      EXPO_NO_GIT_STATUS: '1',
    },
  });

  // expo prebuild reemplaza `expo start --android` por `expo run:android`.
  // En este proyecto los scripts de desarrollo se mantienen como estaban.
  restoreDevScripts(originalScripts);
};

const resolveToolchain = () => {
  const env = { ...process.env };
  let javaHome = null;

  if (env.JAVA_HOME && fs.existsSync(path.join(env.JAVA_HOME, 'bin', JAVA_BIN))) {
    javaHome = env.JAVA_HOME;
  } else if (!commandExists('java')) {
    javaHome = findAndroidStudioJbr();
  }

  if (javaHome) {
    env.JAVA_HOME = javaHome;
    const pathKey =
      Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
    env[pathKey] = `${path.join(javaHome, 'bin')}${path.delimiter}${env[pathKey] ?? ''}`;
    log(`JDK: ${javaHome}`);
  } else if (!commandExists('java')) {
    fail(
      'No se encontró un JDK. Instala Android Studio o define JAVA_HOME apuntando a un JDK 17+.'
    );
  }

  const localProperties = readLocalProperties();
  const sdkFromEnv = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT].find(
    (candidate) => candidate && fs.existsSync(candidate)
  );
  const sdkFromLocalProperties =
    localProperties['sdk.dir'] && fs.existsSync(localProperties['sdk.dir'])
      ? localProperties['sdk.dir']
      : null;
  const sdkDir = sdkFromEnv ?? sdkFromLocalProperties ?? findDefaultSdk();

  if (!sdkDir) {
    fail(
      'No se encontró el Android SDK. Instala el SDK desde Android Studio o define ANDROID_HOME.'
    );
  }

  if (!sdkFromEnv && !sdkFromLocalProperties) {
    log(`Android SDK detectado en ${sdkDir}; guardando android/local.properties.`);
    writeSdkDir(sdkDir);
  } else {
    log(`Android SDK: ${sdkDir}`);
  }

  return { env, sdkDir };
};

const build = (env, sdkDir) => {
  if (!fs.existsSync(ANDROID_DIR)) {
    fail(
      'No existe android/. Ejecuta `npm run apk-local` sin --no-prebuild para generarlo.'
    );
  }

  if (options.versionCode) {
    applyVersionCode(options.versionCode);
  } else {
    const currentVersionCode = readVersionCode();
    if (currentVersionCode) {
      log(`versionCode: ${currentVersionCode} (usa --version-code para subirlo)`);
    }
  }

  const gradlew = IS_WINDOWS ? 'gradlew.bat' : './gradlew';
  if (!fs.existsSync(path.join(ANDROID_DIR, IS_WINDOWS ? 'gradlew.bat' : 'gradlew'))) {
    fail('No se encontró el Gradle wrapper en android/. Regenera con --clean.');
  }

  const gradleArgs = [`:app:assemble${variant}`, '--console=plain'];
  if (options.abi) {
    gradleArgs.push(`-PreactNativeArchitectures=${options.abi}`);
    log(`ABIs: ${options.abi}`);
  }

  if (IS_WINDOWS && !hasConfiguredCmakeVersion()) {
    const cmakeVersion = findModernCmakeVersion(sdkDir);
    if (cmakeVersion) {
      gradleArgs.push(`-Pandroid.cmakeVersion=${cmakeVersion}`);
      log(`CMake: ${cmakeVersion}`);
    } else {
      warn(
        `No se encontró CMake ${MIN_CMAKE_VERSION} o superior en el Android SDK. ` +
          'Si la compilación nativa falla, instálalo desde Android Studio > SDK Manager.'
      );
    }
  }

  log(`Compilando ${variant} con Gradle. La primera vez puede tardar varios minutos.`);
  run(gradlew, gradleArgs, { cwd: ANDROID_DIR, env });
};

const copyArtifact = () => {
  const apkPath = path.join(ANDROID_DIR, apkRelative);
  if (!fs.existsSync(apkPath)) {
    fail(`Gradle terminó pero no se encontró el APK en ${apkPath}.`);
  }

  const abiSuffix = options.abi ? `-${options.abi.replace(/,/g, '+')}` : '';
  const debugSuffix = options.debug ? '-debug' : '';
  const versionCodeSuffix = options.versionCode ? `-vc${options.versionCode}` : '';
  const targetName = `PocketTool-${APP_VERSION}${versionCodeSuffix}${abiSuffix}${debugSuffix}.apk`;
  const targetPath = path.join(OUTPUT_DIR, targetName);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.copyFileSync(apkPath, targetPath);

  const sizeMb = (fs.statSync(targetPath).size / (1024 * 1024)).toFixed(1);
  log(`APK listo: ${path.relative(ROOT, targetPath)} (${sizeMb} MB)`);
  console.log(`  adb install -r "${targetPath}"`);

  if (!options.debug) {
    warn(
      'El APK release local usa la firma debug de Expo: sirve para probar, no para publicar en Play.'
    );
  }

  return targetPath;
};

const startedAt = Date.now();

console.log('[apk-local] PocketTool');
console.log(`[apk-local] Versión ${APP_VERSION}`);
checkWindowsLongPaths();

if (options.prebuild) {
  prebuild();
}

const env = resolveToolchain();
build(env.env, env.sdkDir);
copyArtifact();

const seconds = Math.round((Date.now() - startedAt) / 1000);
log(`Listo en ${seconds}s.`);
