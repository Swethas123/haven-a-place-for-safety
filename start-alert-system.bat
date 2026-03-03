@echo off
REM HAVEN Admin Alert System Startup Script for Windows

echo Starting HAVEN Admin Alert System...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules\express" (
    echo Installing server dependencies...
    call npm install express cors
    echo.
)

REM Start the alert server
echo Starting Admin Alert Server on port 3001...
start "HAVEN Alert Server" node server.js

echo.
echo Server started successfully!
echo.
echo Webhook endpoint: http://localhost:3001/admin-alert
echo SSE stream: http://localhost:3001/admin-alert-stream
echo.
echo To stop the server, close the "HAVEN Alert Server" window
echo.
pause
