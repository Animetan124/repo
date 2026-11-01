@echo off
setlocal
title Station panel server
set "SERVER_DIR="
for %%D in ("%~dp0server" "%~dp0station-panel-all\server" "%~dp0station-panel-all\station-panel-all\server") do (
  if not defined SERVER_DIR if exist "%%~D\server.mjs" set "SERVER_DIR=%%~D"
)
if not defined SERVER_DIR (
  echo Cannot find the server folder next to this file.
  echo Put this file into the station-panel-all folder, next to the folder named server.
  pause
  exit /b 1
)
cd /d "%SERVER_DIR%"
echo Server folder: %CD%

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
for /f "delims=" %%V in ('node -v') do echo Node.js %%V

if not exist "node_modules\ssh2" (
  echo Installing dependencies, wait 1-2 minutes...
  call npm install --omit=dev
  if errorlevel 1 (
    echo npm install failed. Send the text above to the assistant.
    pause
    exit /b 1
  )
)

if not exist "web\index.html" echo NOTE: no web folder, the simple fallback page will open. Run build-ui.ps1 for the full interface.

netstat -ano | findstr /R /C:":3100 .*LISTENING" >nul
if not errorlevel 1 (
  echo Port 3100 is already in use, the panel is probably running. Opening it.
  start "" "http://127.0.0.1:3100"
  pause
  exit /b 0
)

set HOST=127.0.0.1
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 4; Start-Process 'http://127.0.0.1:3100'"
echo.
echo Panel: http://127.0.0.1:3100
echo Close this window to stop the server.
echo.
node server.mjs
echo.
echo Server stopped. If there is an error above, send it to the assistant.
pause
