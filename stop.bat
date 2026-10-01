@echo off
TITLE AgriSentinel X — Stop Services
CLS

ECHO ===============================================================================
ECHO   Stopping AgriSentinel X Backend & Frontend Servers...
ECHO ===============================================================================
ECHO.

powershell -Command "Get-NetTCPConnection -LocalPort 8000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

ECHO.
ECHO [SYS-SHUTDOWN] Services on ports 8000 and 5173 have been stopped.
PAUSE
