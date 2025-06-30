@echo off
echo ==========================================
echo    Nishen's AI Workspace - Simple Fix
echo ==========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Step 1: Using clean package.json...
copy package-clean.json package.json >nul 2>&1
echo Done.

echo.
echo Step 2: Cleaning installation...
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
npm cache clean --force >nul 2>&1
echo Done.

echo.
echo Step 3: Configuring npm...
npm config set registry https://registry.npmjs.org/
npm config set timeout 60000
echo Done.

echo.
echo Step 4: Installing dependencies...
echo This may take several minutes...
npm install --no-audit --no-fund

if errorlevel 1 (
    echo.
    echo Installation failed! Trying alternative registry...
    npm config set registry https://registry.npm.taobao.org/
    npm install --no-audit --no-fund
    
    if errorlevel 1 (
        echo.
        echo Installation still failed. Please:
        echo 1. Check your internet connection
        echo 2. Run as Administrator  
        echo 3. Disable antivirus temporarily
        pause
        exit /b 1
    )
)

echo.
echo Step 5: Starting workspace...
echo Opening http://localhost:3000
echo Press Ctrl+C to stop
echo.
timeout /t 2 /nobreak >nul

npm run dev

if errorlevel 1 (
    echo.
    echo Trying alternative start method...
    npx next dev
)