@echo off
chcp 65001 > nul
cd app
call npm install
echo.
echo Server started: http://localhost:3000
echo Press Ctrl+C to stop
echo.
node server.js
pause
