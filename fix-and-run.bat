@echo off
echo ========================================
echo   Nishen's AI Workspace - Fix Script
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /f /im node.exe 2>nul
echo Done.

echo.
echo Step 2: Cleaning npm cache...
npm cache clean --force
echo Done.

echo.
echo Step 3: Removing old installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json 2>nul
)
echo Done.

echo.
echo Step 4: Installing dependencies with exact versions...
npm install --no-audit --no-fund

echo.
echo Step 5: Starting development server...
echo Opening browser at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm run dev

echo.
echo ========================================
echo If installation failed, try:
echo 1. Run as Administrator
echo 2. Update Node.js to latest LTS
echo 3. Disable antivirus temporarily
echo ========================================
pause