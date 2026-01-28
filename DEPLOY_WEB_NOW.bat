@echo off
echo ================================
echo EncryptedSocial - Web Deployment
echo ================================
echo.

cd /d "%~dp0frontend"

echo [1/3] Installing Vercel CLI...
call npm install -g vercel
echo.

echo [2/3] Building production version...
call npm run build
echo.

echo [3/3] Deploying to Vercel...
echo.
echo Follow the prompts:
echo - Login with GitHub/Email
echo - Confirm project settings
echo - Wait for deployment
echo.
call vercel --prod
echo.

echo ================================
echo ✅ Deployment Complete!
echo ================================
echo.
echo Your app is now live at the URL shown above.
echo Copy the URL and add it to your README.md
echo.
pause
