@echo off
title Operations Automated Workbench Launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Workbench.ps1"
if errorlevel 1 (
  echo.
  echo The Workbench could not be started. Keep this window open and share the message above with Codex.
  pause
)
