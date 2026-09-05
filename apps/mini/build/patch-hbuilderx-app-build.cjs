const fs = require('node:fs');
const path = require('node:path');

const compilerPath = path.resolve(
  __dirname,
  '../node_modules/@dcloudio/vite-plugin-uni/bin/uni.js',
);
const marker = '// HBuilderX App platform compatibility';
const anchor = 'process.env.VITE_CJS_IGNORE_WARNING = true';

if (!fs.existsSync(compilerPath)) {
  console.warn('[hbuilderx] vite-plugin-uni is not installed; skipped compatibility patch.');
  process.exit(0);
}

const source = fs.readFileSync(compilerPath, 'utf8');

if (source.includes(marker)) {
  process.exit(0);
}

if (!source.includes(anchor)) {
  console.error('[hbuilderx] unsupported vite-plugin-uni entry; compatibility patch not applied.');
  process.exit(1);
}

const compatibilityBlock = `${anchor}

${marker}
// HBuilderX 5.x may invoke a Vue 3 CLI project as \`uni build\` while its
// environment still identifies an Android/iOS App release. The uni CLI then
// defaults to H5 before vite.config.ts is loaded, producing an empty App wgt.
if (
  process.argv[2] === 'build' &&
  !process.argv.some((arg) => /^(?:-p|--platform)$/.test(arg)) &&
  process.env.UNI_HBUILDERX_PLUGINS &&
  (process.env.UNI_APP_PLATFORM === 'android' ||
    process.env.UNI_APP_PLATFORM === 'ios')
) {
  process.argv.push('-p', 'app')
}`;

fs.writeFileSync(compilerPath, source.replace(anchor, compatibilityBlock), 'utf8');
console.log('[hbuilderx] App platform compatibility patch applied.');
