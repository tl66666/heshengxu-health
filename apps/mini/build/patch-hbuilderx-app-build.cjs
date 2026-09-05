const fs = require('node:fs');
const path = require('node:path');

const compilerPath = path.resolve(
  __dirname,
  '../node_modules/@dcloudio/vite-plugin-uni/bin/uni.js',
);
const oldMarker = '// HBuilderX App platform compatibility';
const marker = '// HBuilderX App platform compatibility v3';
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

const compatibilityBlock = `${marker}
// HBuilderX 5.x invokes this project's private uni CLI as \`uni build\` while
// keeping the legacy app-plus platform name. The Vite CLI needs \`-p app\`, but
// HBuilderX still reads the result from dist/build/app-plus.
if (
  process.argv[2] === 'build' &&
  !process.argv.some((arg) => /^(?:-p|--platform)$/.test(arg))
) {
  process.argv.push('-p', 'app')
  if (process.env.UNI_PLATFORM === 'app-plus' && !process.env.UNI_OUTPUT_DIR) {
    process.env.UNI_OUTPUT_DIR = require('node:path').resolve(
      process.cwd(),
      'dist/build/app-plus',
    )
  }
}`;

const oldBlockPattern = new RegExp(
  `${oldMarker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[\\s\\S]*?const \\{ performance \\}`,
);
const nextSource = source.includes(oldMarker)
  ? source.replace(oldBlockPattern, `${anchor}\n\n${compatibilityBlock}\n\nconst { performance }`)
  : source.replace(anchor, `${anchor}\n\n${compatibilityBlock}`);

if (nextSource === source) {
  console.error('[hbuilderx] existing compatibility block could not be upgraded.');
  process.exit(1);
}

fs.writeFileSync(compilerPath, nextSource, 'utf8');
console.log('[hbuilderx] App platform compatibility patch applied.');
