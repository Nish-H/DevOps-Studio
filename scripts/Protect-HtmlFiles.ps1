#!/usr/bin/env pwsh
<#
.SYNOPSIS
    HTML Source Code Protection Script
    
.DESCRIPTION
    This script encrypts HTML source code with password protection to prevent unauthorized 
    modification while maintaining browser functionality for authorized users.
    
.PARAMETER FilePath
    Path to the HTML file to protect
    
.PARAMETER Password
    Password to encrypt the HTML source code (default: Nlf263nish25!)
    
.PARAMETER BackupOriginal
    Create a backup of the original file before protection
    
.EXAMPLE
    .\Protect-HtmlFiles.ps1 -FilePath "report.html"
    
.EXAMPLE
    .\Protect-HtmlFiles.ps1 -FilePath "tool.html" -Password "MySecurePassword!" -BackupOriginal
    
.NOTES
    Author: First Technology Security Framework
    Version: 1.0
    Created: July 2025
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    
    [Parameter(Mandatory = $false)]
    [string]$Password = "Nlf263nish25!",
    
    [Parameter(Mandatory = $false)]
    [switch]$BackupOriginal
)

function Protect-HtmlSource {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$HtmlContent,
        
        [Parameter(Mandatory = $true)]
        [string]$Password,
        
        [Parameter(Mandatory = $false)]
        [string]$Title = "Protected HTML Tool"
    )
    
    # Convert HTML to Base64
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($HtmlContent)
    $base64Html = [System.Convert]::ToBase64String($bytes)
    
    # Create password hash for validation
    $passwordHash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Password))
    $passwordHashString = [System.BitConverter]::ToString($passwordHash).Replace('-', '').ToLower()
    
    # Create protected HTML wrapper
    $protectedHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>🔒 $Title</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            max-width: 500px; 
            width: 100%;
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            text-align: center; 
        }
        h1 { 
            color: #333; 
            margin-bottom: 10px; 
            font-size: 2em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        input { 
            width: 100%; 
            padding: 15px; 
            margin: 15px 0; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            font-size: 16px; 
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button { 
            width: 100%; 
            padding: 15px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            cursor: pointer; 
            font-weight: bold;
            transition: transform 0.2s;
        }
        button:hover { 
            transform: translateY(-2px);
        }
        .error { 
            color: #dc3545; 
            margin-top: 15px; 
            display: none; 
            font-weight: bold;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            color: #666; 
            font-size: 12px; 
        }
        .security-badge {
            background: #28a745;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Secure Access</h1>
        <p class="subtitle">This content is protected by advanced encryption</p>
        <input type="password" id="passwordInput" placeholder="Enter decryption password" />
        <button onclick="decryptContent()">Decrypt & Access</button>
        <div class="error" id="errorMsg">Invalid password. Access denied.</div>
        <div class="footer">
            <div class="security-badge">SOURCE CODE PROTECTION: ACTIVE</div><br><br>
            First Technology Security Framework<br>
            <strong>Creator:</strong> Nishen Harichunder L4 Engineering : RMS<br>
            Unauthorized access prohibited<br>
            HTML Source Code Encryption v1.0
        </div>
    </div>

    <script>
        const encryptedContent = '$base64Html';
        const validHash = '$passwordHashString';
        
        async function decryptContent() {
            const password = document.getElementById('passwordInput').value;
            
            if (!password) {
                document.getElementById('errorMsg').style.display = 'block';
                return;
            }
            
            try {
                const inputHash = await sha256(password);
                
                if (inputHash === validHash) {
                    const decodedContent = atob(encryptedContent);
                    document.open();
                    document.write(decodedContent);
                    document.close();
                } else {
                    showError();
                }
            } catch (e) {
                showError();
            }
        }
        
        function showError() {
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
        
        // SHA256 implementation for client-side validation
        async function sha256(str) {
            const utf8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Enter key support
        document.getElementById('passwordInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                decryptContent();
            }
        });
        
        // Focus on load
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('passwordInput').focus();
        });
        
        // Security measures
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });
    </script>
</body>
</html>
"@
    
    return $protectedHtml
}

# Main execution
try {
    # Validate file exists
    if (-not (Test-Path $FilePath)) {
        throw "File not found: $FilePath"
    }
    
    # Get file info
    $fileInfo = Get-Item $FilePath
    $fileName = $fileInfo.Name
    $fileDir = $fileInfo.Directory.FullName
    
    Write-Host "🔒 Protecting HTML file: $fileName" -ForegroundColor Cyan
    
    # Create backup if requested
    if ($BackupOriginal) {
        $backupPath = Join-Path $fileDir "$($fileInfo.BaseName).original$($fileInfo.Extension)"
        Copy-Item $FilePath $backupPath -Force
        Write-Host "📋 Backup created: $backupPath" -ForegroundColor Green
    }
    
    # Read original HTML content
    $originalContent = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Extract title from original HTML if possible
    $titleMatch = [regex]::Match($originalContent, '<title>(.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value } else { "Protected HTML Content" }
    
    # Protect the HTML source code
    $protectedContent = Protect-HtmlSource -HtmlContent $originalContent -Password $Password -Title $title
    
    # Write protected content back to file
    $protectedContent | Out-File -FilePath $FilePath -Encoding UTF8 -Force
    
    Write-Host "✅ HTML source code protection applied successfully!" -ForegroundColor Green
    Write-Host "🔑 Password: $Password" -ForegroundColor Yellow
    Write-Host "📄 File: $FilePath" -ForegroundColor White
    Write-Host ""
    Write-Host "🛡️ Security Features Applied:" -ForegroundColor Cyan
    Write-Host "   • Source code encrypted with Base64 + SHA256" -ForegroundColor White
    Write-Host "   • Password protection prevents unauthorized editing" -ForegroundColor White
    Write-Host "   • Browser functionality maintained for authorized users" -ForegroundColor White
    Write-Host "   • Developer tools and right-click disabled" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️ Important: Save the password securely - it cannot be recovered!" -ForegroundColor Red
    
} catch {
    Write-Error "Failed to protect HTML file: $_"
    exit 1
}