$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

node scripts/sync-illustrations.mjs

# Keep only one development output so WeChat never reads an old release build.
if (Test-Path 'apps/mini/dist/build') {
  Remove-Item -Recurse -Force 'apps/mini/dist/build'
}

Write-Host 'Starting Heshengxu WeChat Mini Program development watcher...' -ForegroundColor Green
Write-Host 'Keep this window open. Save source files, then click Recompile in WeChat DevTools.' -ForegroundColor Cyan
Write-Host ''
Write-Host 'WeChat DevTools project: apps/mini' -ForegroundColor Yellow
Write-Host 'Development output: apps/mini/dist/dev/mp-weixin' -ForegroundColor Yellow
Write-Host ''

Set-Location 'apps/mini'
npm exec -- uni -p mp-weixin
