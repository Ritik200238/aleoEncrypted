@echo off
echo ========================================
echo INSTALLING C++ BUILD TOOLS
echo ========================================
echo.
echo This will install the C++ workload needed for desktop .exe build
echo Installation takes 5-10 minutes
echo.

"C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe" modify --installPath "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --quiet --norestart

echo.
echo ========================================
echo INSTALLATION COMPLETE!
echo ========================================
echo.
echo Checking if C++ tools are now available...
where cl.exe
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] C++ Build Tools installed!
    echo.
    echo Now building desktop .exe...
    cd /d D:\buildathon\encrypted-social-aleo\frontend
    npm run tauri:build
    echo.
    echo ========================================
    echo DESKTOP APP BUILD COMPLETE!
    echo ========================================
    echo.
    echo Your .exe files are in:
    echo   D:\buildathon\encrypted-social-aleo\frontend\src-tauri\target\release\
    echo.
) else (
    echo.
    echo [INFO] You may need to restart your terminal for the tools to be available
    echo.
    echo After restarting, run:
    echo   cd D:\buildathon\encrypted-social-aleo\frontend
    echo   npm run tauri:build
    echo.
)

pause
