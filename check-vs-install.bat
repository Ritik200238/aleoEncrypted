@echo off
echo ========================================
echo CHECKING VS BUILD TOOLS INSTALLATION
echo ========================================
echo.

where cl.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] VS Build Tools are installed!
    echo.
    echo You can now build the desktop app:
    echo   cd D:\buildathon\encrypted-social-aleo\frontend
    echo   npm run tauri:build
    echo.
) else (
    echo [PENDING] VS Build Tools not yet installed
    echo.
    echo Installation is running in the background...
    echo This takes 10-15 minutes.
    echo.
    echo Run this script again in a few minutes to check status.
    echo.
)

pause
