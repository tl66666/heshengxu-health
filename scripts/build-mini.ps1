$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

# Keep only one release output. Stop the development watcher before release builds.
if (Test-Path 'apps/mini/dist/dev') {
  Remove-Item -Recurse -Force 'apps/mini/dist/dev'
}
node scripts/sync-illustrations.mjs
pnpm --filter @heban/mini build:mp-weixin
node scripts/verify-mini-build.mjs

Write-Host ''
Write-Host 'For release preview, import this directory in WeChat DevTools:' -ForegroundColor Green
Write-Host (Join-Path (Get-Location) 'apps/mini/dist/build/mp-weixin') -ForegroundColor Cyan
Write-Host 'For daily development run: ./scripts/dev-mini.ps1, then import apps/mini' -ForegroundColor Yellow
