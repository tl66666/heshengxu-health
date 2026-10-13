$ErrorActionPreference = 'Stop'
$previewRepo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $previewRepo
node scripts/preview-mini.mjs
