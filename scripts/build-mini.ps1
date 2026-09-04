$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

if (-not $env:VITE_MINI_API_BASE_URL) {
  throw '请先设置 VITE_MINI_API_BASE_URL 为生产 API 地址。'
}
if (-not $env:VITE_MINI_ASSET_BASE_URL -or -not $env:VITE_MINI_ASSET_BASE_URL.StartsWith('https://')) {
  throw '请先设置 HTTPS 的 VITE_MINI_ASSET_BASE_URL，并上传 dist/mini-assets。'
}

node scripts/sync-illustrations.mjs
node scripts/export-mini-assets.mjs
Set-Location 'apps/mini'
npx uni build -p mp-weixin
node ../../scripts/finalize-mini-build.mjs dist/build/mp-weixin
node ../../scripts/verify-mini-build.mjs dist/build/mp-weixin
Set-Location '../..'

Write-Host ''
Write-Host 'For release preview, import this directory in WeChat DevTools:' -ForegroundColor Green
Write-Host (Join-Path (Get-Location) 'apps/mini/dist/build/mp-weixin') -ForegroundColor Cyan
Write-Host 'For daily development run: ./scripts/dev-mini.ps1, then import apps/mini' -ForegroundColor Yellow
