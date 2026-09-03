param([switch]$SkipMiniWatcher)

$ErrorActionPreference = 'Stop'
$MinimumFoodCount = 10000
$RepositoryRoot = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $RepositoryRoot 'infra/docker/docker-compose.yml'
$EnvironmentFile = Join-Path $RepositoryRoot '.env'
$ApiHealthUrl = 'http://127.0.0.1:3000/health'
$RuntimeRoot = Join-Path $env:LOCALAPPDATA 'Heshengxu/dev-runtime'

Set-Location $RepositoryRoot

function Test-DockerReady {
  & docker info *> $null
  return $LASTEXITCODE -eq 0
}

function Start-DockerDesktop {
  if (Test-DockerReady) { return }

  $dockerDesktop = Join-Path $env:ProgramFiles 'Docker/Docker/Docker Desktop.exe'
  if (-not (Test-Path $dockerDesktop)) {
    throw 'Docker Desktop is not running and could not be found. Install or start Docker Desktop first.'
  }

  Write-Host '[1/6] Starting Docker Desktop...' -ForegroundColor Cyan
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    Start-Sleep -Seconds 2
    if (Test-DockerReady) { return }
  }

  throw 'Docker Desktop did not become ready within two minutes.'
}

function Wait-ApiHealth {
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $ApiHealthUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) { return }
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  throw 'The local API did not become healthy. Check the API process output.'
}

function Ensure-LocalNodeRuntime {
  $prismaCommand = Join-Path $RuntimeRoot 'node_modules/.bin/prisma.cmd'
  $tsxEntry = Join-Path $RuntimeRoot 'node_modules/tsx/dist/cli.mjs'
  $typescriptEntry = Join-Path $RuntimeRoot 'node_modules/typescript/bin/tsc'
  if (-not (Test-Path $prismaCommand) -or -not (Test-Path $tsxEntry) -or -not (Test-Path $typescriptEntry)) {
    Write-Host 'Preparing the npm development runtime (first start only)...' -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $RuntimeRoot | Out-Null
    if (-not (Test-Path (Join-Path $RuntimeRoot 'package.json'))) {
      & npm init -y --prefix $RuntimeRoot | Out-Null
    }
    & npm install --prefix $RuntimeRoot --no-save --package-lock=false `
      prisma@6.16.0 @prisma/client@6.16.0 tsx@4.20.5 typescript@5.9.3
    if ($LASTEXITCODE -ne 0) { throw 'The local npm development runtime could not be installed.' }
  }

  $clientTarget = Join-Path $RuntimeRoot 'node_modules/@prisma/client'
  foreach ($clientLink in @(
    (Join-Path $RepositoryRoot 'node_modules/@prisma/client'),
    (Join-Path $RepositoryRoot 'apps/api/node_modules/@prisma/client')
  )) {
    if (-not (Test-Path (Join-Path $clientLink 'package.json'))) {
      New-Item -ItemType Directory -Force -Path (Split-Path -Parent $clientLink) | Out-Null
      if (Test-Path -LiteralPath $clientLink) { Remove-Item -Force -LiteralPath $clientLink }
      New-Item -ItemType Junction -Path $clientLink -Target $clientTarget | Out-Null
    }
  }

  $env:NODE_PATH = Join-Path $RuntimeRoot 'node_modules'
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker CLI was not found. Install Docker Desktop first.'
}

if (-not (Test-Path $EnvironmentFile)) {
  Copy-Item (Join-Path $RepositoryRoot '.env.example') $EnvironmentFile
}

Start-DockerDesktop
Ensure-LocalNodeRuntime

Write-Host '[2/6] Starting persistent PostgreSQL and Redis...' -ForegroundColor Cyan
& docker compose --env-file $EnvironmentFile -f $ComposeFile up -d --wait --wait-timeout 120
if ($LASTEXITCODE -ne 0) { throw 'Docker services failed to start.' }

Write-Host '[3/6] Applying database migrations...' -ForegroundColor Cyan
& (Join-Path $RuntimeRoot 'node_modules/.bin/prisma.cmd') generate --schema apps/api/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw 'Prisma client generation failed.' }
& (Join-Path $RuntimeRoot 'node_modules/.bin/prisma.cmd') migrate deploy --schema apps/api/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }

$foodCountQuery = 'SELECT COUNT(*) FROM "FoodItem" WHERE "isActive" = true;'
$foodCountText = $foodCountQuery | & docker compose --env-file $EnvironmentFile -f $ComposeFile exec -T postgres `
  psql -U heban -d heban -tA
$foodCount = 0
$foodCountLine = $foodCountText | Select-Object -Last 1
if ($foodCountLine) {
  [void][int]::TryParse($foodCountLine.Trim(), [ref]$foodCount)
}

if ($foodCount -lt $MinimumFoodCount) {
  Write-Host "[4/6] Food catalog has $foodCount rows; importing the full catalog once..." -ForegroundColor Yellow
  & npm --prefix apps/api run food:import
  if ($LASTEXITCODE -ne 0) { throw 'Full food catalog import failed.' }
} else {
  Write-Host "[4/6] Food catalog is ready ($foodCount active rows); import skipped." -ForegroundColor Green
}

Write-Host '[5/6] Starting the local API...' -ForegroundColor Cyan
$apiIsHealthy = $false
try {
  $apiIsHealthy = (Invoke-WebRequest -UseBasicParsing -Uri $ApiHealthUrl -TimeoutSec 2).StatusCode -eq 200
} catch {}

if (-not $apiIsHealthy) {
  & node (Join-Path $RuntimeRoot 'node_modules/typescript/bin/tsc') -p apps/api/tsconfig.build.json
  if ($LASTEXITCODE -ne 0) { throw 'The local API build failed.' }
  Start-Process -FilePath 'node.exe' `
    -ArgumentList 'apps/api/dist/main.js' `
    -WorkingDirectory $RepositoryRoot -WindowStyle Hidden
  Wait-ApiHealth
}

Write-Host '[6/6] Starting the WeChat mini-program watcher...' -ForegroundColor Green
Write-Host 'Open apps/mini in WeChat DevTools. The full food catalog is served by the local API.' -ForegroundColor Yellow
if ($SkipMiniWatcher) {
  Write-Host 'Infrastructure verification complete; mini-program watcher skipped.' -ForegroundColor Green
  return
}
& npm --prefix apps/mini run dev:mp-weixin
