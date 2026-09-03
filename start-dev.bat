@echo off
chcp 65001 >nul
title Heshengxu Local Development
cd /d "%~dp0"

echo Starting the database, API, and WeChat mini program...
echo The first complete food import can take several minutes.
echo Later starts reuse the persistent database automatically.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-local-dev.ps1"
if errorlevel 1 (
  echo.
  echo Startup failed. Keep this window open and send the error above for diagnosis.
  pause
  exit /b 1
)
