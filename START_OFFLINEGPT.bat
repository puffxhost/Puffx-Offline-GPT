@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  start "Puffx Ofline GPT server" cmd /k py -3 server.py
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3 was not found. Install it from https://www.python.org/downloads/ and try again.
    pause
    exit /b 1
  )
  start "Puffx Ofline GPT server" cmd /k python server.py
)
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000"

