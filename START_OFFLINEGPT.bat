@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 was not found. Install Python from https://www.python.org/downloads/ and try again.
  pause
  exit /b 1
)
start "OfflineGPT server" cmd /k python server.py
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000"
