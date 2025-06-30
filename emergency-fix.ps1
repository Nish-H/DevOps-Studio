param(
    [switch]$UseCleanPackage
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Nishen's AI Workspace - Emergency Fix  " -ForegroundColor Cyan  
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Stop any Node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Remove old files
Write-Host "Removing old installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed node_modules" -ForegroundColor Gray
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "Removed package-lock.json" -ForegroundColor Gray
}
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Use clean package.json if requested or if install fails
if ($UseCleanPackage -or (Test-Path "package-clean.json")) {
    Write-Host "Using clean package.json with minimal dependencies..." -ForegroundColor Yellow
    Copy-Item "package-clean.json" "package.json" -Force
    Write-Host "Switched to minimal package.json" -ForegroundColor Green
}

Write-Host ""

# Configure npm for better network handling
Write-Host "Configuring npm for network stability..." -ForegroundColor Yellow
npm config set registry https://registry.npmjs.org/
npm config set timeout 60000
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
Write-Host "Done." -ForegroundColor Green

Write-Host ""

# Install dependencies with network retry
Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
$maxRetries = 3
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    Write-Host "Attempt $($retryCount + 1) of $maxRetries..." -ForegroundColor Cyan
    
    npm install --no-audit --no-fund --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Installation successful!" -ForegroundColor Green
        break
    } else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "Installation failed, retrying in 10 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            
            # Clean cache before retry
            npm cache clean --force
        } else {
            Write-Host "Installation failed after $maxRetries attempts." -ForegroundColor Red
            Write-Host ""
            Write-Host "Common solutions:" -ForegroundColor Yellow
            Write-Host "1. Check your internet connection" -ForegroundColor White
            Write-Host "2. Disable VPN/Proxy temporarily" -ForegroundColor White  
            Write-Host "3. Run as Administrator" -ForegroundColor White
            Write-Host "4. Try: npm config set registry https://registry.npm.taobao.org/" -ForegroundColor White
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
}

Write-Host ""

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Yellow
if (Test-Path "node_modules\.bin\next.cmd") {
    Write-Host "Next.js installed successfully!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Next.js executable not found!" -ForegroundColor Red
    Write-Host "Trying to install Next.js globally..." -ForegroundColor Yellow
    npm install -g next
}

Write-Host ""

# Start development server
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:3000" -ForegroundColor White
Write-Host "  Network: http://172.16.0.14:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

# Try to start the server
try {
    npm run dev
} catch {
    Write-Host "Failed to start with npm run dev, trying direct next command..." -ForegroundColor Yellow
    npx next dev
}