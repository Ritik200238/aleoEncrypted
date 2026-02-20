# EncryptedSocial - Production Build Script
# Builds complete Windows .exe application

param(
    [switch]$SkipDeploy,
    [switch]$FastBuild,
    [string]$PrivateKey
)

Write-Host "🚀 EncryptedSocial - Production Build Pipeline" -ForegroundColor Cyan
Write-Host "=" * 60

# Configuration
$ErrorActionPreference = "Stop"
$ProjectRoot = "D:\buildathon\encrypted-social-aleo"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# Step 1: Check Prerequisites
Write-Host "`n📋 Step 1: Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust not found! Install from rustup.rs" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Install Dependencies
if (-not $FastBuild) {
    Write-Host "`n📦 Step 2: Installing Dependencies..." -ForegroundColor Yellow

    # Root dependencies (Aleo SDK)
    Write-Host "Installing root dependencies..."
    Set-Location $ProjectRoot
    npm install 2>&1 | Out-Null

    # Frontend dependencies
    Write-Host "Installing frontend dependencies..."
    Set-Location $FrontendDir
    npm install --legacy-peer-deps 2>&1 | Out-Null

    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "`n⏩ Step 2: Skipping dependency installation (--FastBuild)" -ForegroundColor Gray
}

# Step 3: Deploy Smart Contracts
if (-not $SkipDeploy) {
    Write-Host "`n⛓️  Step 3: Deploying Smart Contracts..." -ForegroundColor Yellow

    Set-Location $ProjectRoot

    if ($PrivateKey) {
        $env:ALEO_PRIVATE_KEY = $PrivateKey
        Write-Host "Using provided private key" -ForegroundColor Gray
    }

    if ($env:ALEO_PRIVATE_KEY) {
        Write-Host "Deploying contracts to Aleo testnet..."
        try {
            node deploy-all-contracts.mjs
            Write-Host "✅ Contracts deployed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Contract deployment failed (continuing anyway)" -ForegroundColor Yellow
            Write-Host "   App will run in demo mode" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  No ALEO_PRIVATE_KEY found" -ForegroundColor Yellow
        Write-Host "   Skipping contract deployment. App will run in demo mode." -ForegroundColor Gray
        Write-Host "   To deploy, set ALEO_PRIVATE_KEY env variable or use -PrivateKey flag" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏩ Step 3: Skipping contract deployment (--SkipDeploy)" -ForegroundColor Gray
}

# Step 4: Build Frontend
Write-Host "`n🏗️  Step 4: Building Frontend..." -ForegroundColor Yellow

Set-Location $FrontendDir

Write-Host "Running TypeScript compiler..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 5: Build Tauri Desktop App
Write-Host "`n🖥️  Step 5: Building Tauri Desktop Application..." -ForegroundColor Yellow

Write-Host "This may take 5-15 minutes on first build..." -ForegroundColor Gray

npm run tauri:build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tauri build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Desktop application built successfully" -ForegroundColor Green

# Step 6: Locate Build Artifacts
Write-Host "`n📦 Step 6: Locating Build Artifacts..." -ForegroundColor Yellow

$BuildDir = Join-Path $FrontendDir "src-tauri\target\release\bundle"
$NsisDir = Join-Path $BuildDir "nsis"
$MsiDir = Join-Path $BuildDir "msi"

Write-Host "`n📁 Build Artifacts:" -ForegroundColor Cyan

if (Test-Path $NsisDir) {
    $nsisFiles = Get-ChildItem -Path $NsisDir -Filter "*.exe"
    foreach ($file in $nsisFiles) {
        Write-Host "   ✅ NSIS Installer: $($file.FullName)" -ForegroundColor Green
    }
}

if (Test-Path $MsiDir) {
    $msiFiles = Get-ChildItem -Path $MsiDir -Filter "*.msi"
    foreach ($file in $msiFiles) {
        Write-Host "   ✅ MSI Installer: $($file.FullName)" -ForegroundColor Green
    }
}

$ExePath = Join-Path $FrontendDir "src-tauri\target\release\encrypted-social.exe"
if (Test-Path $ExePath) {
    Write-Host "   ✅ Portable EXE: $ExePath" -ForegroundColor Green
}

# Step 7: Create Release Package
Write-Host "`n📦 Step 7: Creating Release Package..." -ForegroundColor Yellow

$ReleaseDir = Join-Path $ProjectRoot "releases\v1.0.0"
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

# Copy installers
if (Test-Path $NsisDir) {
    Copy-Item -Path "$NsisDir\*.exe" -Destination $ReleaseDir -Force
}
if (Test-Path $MsiDir) {
    Copy-Item -Path "$MsiDir\*.msi" -Destination $ReleaseDir -Force
}

# Copy documentation
Copy-Item -Path "$ProjectRoot\README_FINAL.md" -Destination "$ReleaseDir\README.md" -Force
Copy-Item -Path "$ProjectRoot\COMPLETE_DEPLOYMENT_GUIDE.md" -Destination $ReleaseDir -Force

Write-Host "✅ Release package created: $ReleaseDir" -ForegroundColor Green

# Step 8: Generate Checksums
Write-Host "`n🔐 Step 8: Generating Checksums..." -ForegroundColor Yellow

$ChecksumFile = Join-Path $ReleaseDir "checksums.txt"
$ReleaseFiles = Get-ChildItem -Path $ReleaseDir -Filter "*.exe","*.msi"

foreach ($file in $ReleaseFiles) {
    $hash = Get-FileHash -Path $file.FullName -Algorithm SHA256
    "$($hash.Hash)  $($file.Name)" | Add-Content -Path $ChecksumFile
}

Write-Host "✅ Checksums saved to: $ChecksumFile" -ForegroundColor Green

# Final Summary
Write-Host "`n" + ("=" * 60)
Write-Host "🎉 BUILD COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 60)

Write-Host "`n📊 Build Summary:" -ForegroundColor Cyan
Write-Host "   • Frontend: Built and optimized"
Write-Host "   • Desktop App: Windows .exe ready"
Write-Host "   • Release Package: Created in releases/v1.0.0"
Write-Host "   • Documentation: Included"

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test the installer:"
Write-Host "      $ReleaseDir\EncryptedSocial_1.0.0_x64-setup.exe"
Write-Host "   2. Install and launch the app"
Write-Host "   3. Connect your Aleo wallet"
Write-Host "   4. Start messaging!"

Write-Host "`n💡 Tips:" -ForegroundColor Cyan
Write-Host "   • App works in demo mode without blockchain deployment"
Write-Host "   • Deploy contracts later with: node deploy-all-contracts.mjs"
Write-Host "   • Get testnet credits from: https://faucet.aleo.org"

Write-Host "`n✅ Build pipeline completed successfully!`n" -ForegroundColor Green
