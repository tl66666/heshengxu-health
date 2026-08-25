$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

Write-Host '正在启动和生序微信小程序开发监听...' -ForegroundColor Green
Write-Host '请保持此窗口运行。源码保存后，微信开发者工具点击“重新编译”即可更新。' -ForegroundColor Cyan
Write-Host ''
Write-Host '微信开发者工具项目：apps/mini' -ForegroundColor Yellow
Write-Host '开发产物目录：apps/mini/dist/dev/mp-weixin' -ForegroundColor Yellow
Write-Host ''

pnpm --filter @heban/mini dev:mp-weixin
