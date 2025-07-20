# Simple syntax validation
$ErrorActionPreference = 'Stop'
try {
    $scriptContent = Get-Content './Master-Infrastructure-Audit-ScriptV8.1.ps1' -Raw
    [System.Management.Automation.PSParser]::Tokenize($scriptContent, [ref]$null) | Out-Null
    Write-Host "✅ Syntax validation passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Syntax error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}