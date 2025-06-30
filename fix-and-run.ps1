Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Nishen's AI Workspace - Fix Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop Node processes
Write-Host "Step 1: Stopping Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Done." -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes found." -ForegroundColor Green
}

Write-Host ""

# Step 2: Clean npm cache
Write-Host "Step 2: Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Step 3: Remove old installation
Write-Host "Step 3: Removing old installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
}
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Step 4: Install dependencies
Write-Host "Step 4: Installing dependencies..." -ForegroundColor Yellow
npm install --no-audit --no-fund

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installation successful!" -ForegroundColor Green
} else {
    Write-Host "Installation failed. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Run PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Update Node.js: https://nodejs.org" -ForegroundColor White
    Write-Host "3. Check antivirus settings" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 5: Start development server
Write-Host "Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "Opening browser at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2
npm run dev