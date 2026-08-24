$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')
pnpm --filter @heban/mini build:mp-weixin
node scripts/verify-mini-build.mjs

Write-Host ''
Write-Host '请在微信开发者工具中导入以下目录：' -ForegroundColor Green
Write-Host (Join-Path (Get-Location) 'apps/mini') -ForegroundColor Cyan
Write-Host '也可以直接导入：apps/mini/dist/build/mp-weixin' -ForegroundColor Cyan
