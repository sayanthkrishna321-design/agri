@echo off
TITLE AgriSentinel X + AgriLink AI — One-Click Launcher
CLS

ECHO ===============================================================================
ECHO   [SYS-AGRI] AGRISENTINEL X + AGRILINK AI PLATFORM LAUNCHER
ECHO ===============================================================================
ECHO   Starting Django DRF Backend (Port 8000)...
ECHO   Starting Frontend Industrial Web Server (Port 5173)...
ECHO ===============================================================================
ECHO.

REM Navigate to project root directory
CD /D "%~dp0"

REM Run migrations to ensure SQLite database is up-to-date
ECHO [1/3] Running database migrations...
python agrisentinel/agrisentinel/manage.py migrate --noinput
ECHO [1/3] Database migrations completed.
ECHO.

REM Start Django Backend in a separate window
ECHO [2/3] Launching Django REST Backend on http://localhost:8000/api/...
START "AgriSentinel Backend (Port 8000)" cmd /k "python agrisentinel/agrisentinel/manage.py runserver 0.0.0.0:8000"

REM Wait 2 seconds for backend initialization
TIMEOUT /T 2 /NOBREAK >NUL

REM Start Frontend Web Server in a separate window
ECHO [3/3] Launching Frontend Web Server on http://localhost:5173/...
START "AgriSentinel Frontend (Port 5173)" cmd /k "python -m http.server 5173 --directory frontend/dist"

REM Wait 1 second and open browser
TIMEOUT /T 1 /NOBREAK >NUL
ECHO.
ECHO ===============================================================================
ECHO   [SYS-ONLINE] AgriSentinel X Platform is running!
ECHO   Frontend URL: http://localhost:5173/
ECHO   Backend API:  http://localhost:8000/api/health/
ECHO ===============================================================================
ECHO Opening browser automatically...
START http://localhost:5173/

PAUSE
