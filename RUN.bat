@echo off
TITLE Vu UniVerse360 - Unified Controller
color 0B

:MENU
echo.
echo ========================================================
echo       Vu UniVerse360 - UNIFIED CONTROLLER
echo ========================================================
echo.
echo   [1] Start All Services (Frontend + Backend + AI Agent)
echo   [2] Stop All Services
echo   [3] Install Dependencies
echo   [4] Restart All Services
echo   [5] Exit
echo.
echo ========================================================
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto INSTALL
if "%choice%"=="4" goto RESTART
if "%choice%"=="5" goto EXIT
goto MENU

:START
echo.
echo ========================================================
echo       STARTING ALL SERVICES
echo ========================================================
echo.

:: Check prerequisites
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    goto MENU
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python first.
    pause
    goto MENU
)

:: Kill any leftover processes to free ports before starting
echo Stopping any existing services...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Use the unified Node.js runner
node run-all.js

echo.
echo Services started. Press Ctrl+C in the terminal to stop all services.
pause
goto MENU

:STOP
echo.
echo ========================================================
echo       STOPPING ALL SERVICES
echo ========================================================
echo.
echo Stopping Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo Stopping Python processes...
taskkill /F /IM python.exe /T >nul 2>&1
echo.
echo All services stopped successfully.
echo.
pause
goto MENU

:INSTALL
echo.
echo ========================================================
echo       INSTALLING DEPENDENCIES
echo ========================================================
echo.

:: Frontend
echo [1/3] Installing Frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend install failed.
    pause
    goto MENU
)
echo Done.
echo.

:: Backend
echo [2/3] Installing Backend dependencies...
cd backend-nest
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend install failed.
    cd ..
    pause
    goto MENU
)
cd ..
echo Done.
echo.

:: AI Agent
echo [3/3] Installing AI Agent dependencies (Python)...
cd ai-agent
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] AI Agent install failed.
    cd ..
    pause
    goto MENU
)
cd ..\..
echo Done.
echo.

echo ========================================================
echo       ALL DEPENDENCIES INSTALLED!
echo ========================================================
echo.
pause
goto MENU

:RESTART
echo.
echo ========================================================
echo       RESTARTING ALL SERVICES
echo ========================================================
echo.
echo Stopping services...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1
timeout /t 3 >nul
echo Services stopped. Starting again...
echo.
goto START

:EXIT
echo.
echo Goodbye!
echo.
timeout /t 1 >nul
exit
