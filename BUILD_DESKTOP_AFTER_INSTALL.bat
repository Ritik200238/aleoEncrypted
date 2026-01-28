@echo off
echo ======================================================
echo BUILDING DESKTOP .EXE APPLICATION
echo ======================================================
echo.

cd /d D:\buildathon\encrypted-social-aleo\frontend

echo Step 1: Refreshing environment variables...
call refreshenv

echo.
echo Step 2: Building desktop application...
echo This will take 3-5 minutes...
echo.

npm run tauri:build

echo.
echo ======================================================
echo BUILD COMPLETE!
echo ======================================================
echo.
echo Your .exe files are in:
echo   D:\buildathon\encrypted-social-aleo\frontend\src-tauri\target\release\
echo.
echo Installer files are in:
echo   D:\buildathon\encrypted-social-aleo\frontend\src-tauri\target\release\bundle\
echo.
pause
