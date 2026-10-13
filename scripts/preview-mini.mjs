import { setTimeout, clearTimeout } from 'node:timers';
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const repo = resolve(import.meta.dirname, '..');
const mini = resolve(repo, 'apps/mini');
const env = {
  ...process.env,
  VITE_MINI_API_BASE_URL:
    'https://api-heshengxu-prod.yellowsky-5fa044e1.eastasia.azurecontainerapps.io/api/v1',
  VITE_MINI_ASSET_BASE_URL: 'https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban',
};
const sync = spawnSync(process.execPath, [resolve(repo, 'scripts/sync-illustrations.mjs')], {
  cwd: repo,
  env,
  stdio: 'inherit',
  windowsHide: true,
});
if (sync.error || sync.status !== 0) {
  console.error(sync.error || 'Asset sync failed');
  process.exit(1);
}
console.log('微信开发者工具导入：' + mini);
console.log('仅开发预览，请保持窗口运行。');
const watcher = spawn(
  process.execPath,
  [resolve(mini, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js'), '-p', 'mp-weixin'],
  { cwd: mini, env, windowsHide: true, stdio: ['inherit', 'pipe', 'pipe'] },
);
let finalizeTimer;
let tail = '';
function output(chunk, stream) {
  stream.write(chunk);
  // Match terminal ANSI styles in compiler logs only.
  // eslint-disable-next-line no-control-regex
  tail += chunk.toString().replace(/\x1b\[[0-9;]*m/g, '');
  if (/Build complete|ready in/u.test(tail)) {
    clearTimeout(finalizeTimer);
    finalizeTimer = setTimeout(() => {
      const result = spawnSync(
        process.execPath,
        [resolve(repo, 'scripts/finalize-mini-build.mjs'), 'dist/dev/mp-weixin'],
        { cwd: mini, env, stdio: 'inherit', windowsHide: true },
      );
      if (result.error || result.status !== 0)
        console.error('开发预览资源检查未通过，请查看上方日志。');
    }, 1000);
    tail = '';
  } else tail = tail.slice(-300);
}
watcher.stdout.on('data', (chunk) => output(chunk, process.stdout));
watcher.stderr.on('data', (chunk) => output(chunk, process.stderr));
watcher.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
watcher.on('exit', (code) => {
  clearTimeout(finalizeTimer);
  process.exitCode = code || 0;
});
process.on('SIGINT', () => watcher.kill());
process.on('SIGTERM', () => watcher.kill());
