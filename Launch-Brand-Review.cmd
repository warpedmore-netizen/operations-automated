@echo off
title Operations Automated Brand Review
powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0Start-Workbench.ps1" -InitialView brand
if errorlevel 1 (
  echo.
  echo The Brand Review area could not be started. Keep this window open and share the message above with Codex.
  pause
)
