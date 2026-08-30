$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

node scripts/sync-illustrations.mjs

# Keep only one development output so WeChat never reads an interrupted or old build.
foreach ($output in @('apps/mini/dist/dev', 'apps/mini/dist/build')) {
  if (Test-Path $output) {
    Remove-Item -Recurse -Force $output
  }
}

Write-Host 'Starting Heshengxu WeChat Mini Program development watcher...' -ForegroundColor Green
Write-Host 'Keep this window open. Save source files, then click Recompile in WeChat DevTools.' -ForegroundColor Cyan
Write-Host ''
Write-Host 'WeChat DevTools project: apps/mini' -ForegroundColor Yellow
Write-Host 'Development output: apps/mini/dist/dev/mp-weixin' -ForegroundColor Yellow
Write-Host ''

Set-Location 'apps/mini'
npm exec -- uni -p mp-weixin
