$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

# 发布构建只保留一套产物；如正在运行开发监听，请先关闭开发窗口。
if (Test-Path 'apps/mini/dist/dev') {
  Remove-Item -Recurse -Force 'apps/mini/dist/dev'
}
node scripts/sync-illustrations.mjs
pnpm --filter @heban/mini build:mp-weixin
node scripts/verify-mini-build.mjs

Write-Host ''
Write-Host '发布预览请在微信开发者工具中导入以下目录：' -ForegroundColor Green
Write-Host (Join-Path (Get-Location) 'apps/mini/dist/build/mp-weixin') -ForegroundColor Cyan
Write-Host '日常开发请改用：./scripts/dev-mini.ps1，然后导入 apps/mini' -ForegroundColor Yellow
