$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

if (-not $env:VITE_MINI_API_BASE_URL) {
  throw 'Set VITE_MINI_API_BASE_URL to the production API URL before building.'
}
if (-not $env:VITE_MINI_ASSET_BASE_URL -or -not $env:VITE_MINI_ASSET_BASE_URL.StartsWith('https://')) {
  throw 'Set VITE_MINI_ASSET_BASE_URL to an HTTPS asset CDN URL before building.'
}

node scripts/sync-illustrations.mjs
node scripts/export-mini-assets.mjs
Set-Location 'apps/mini'
npx uni build -p mp-weixin
node ../../scripts/finalize-mini-build.mjs dist/build/mp-weixin
node ../../scripts/verify-mini-build.mjs dist/build/mp-weixin
node ../../scripts/clean-mini-source-assets.mjs
Set-Location '../..'

Write-Host ''
Write-Host 'For release preview, import this directory in WeChat DevTools:' -ForegroundColor Green
Write-Host (Join-Path (Get-Location) 'apps/mini/dist/build/mp-weixin') -ForegroundColor Cyan
Write-Host 'For daily development run: ./scripts/dev-mini.ps1, then import apps/mini' -ForegroundColor Yellow
