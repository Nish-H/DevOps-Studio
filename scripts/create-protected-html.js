#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function protectHtmlFile(filePath, password = 'Nlf263nish25!') {
    try {
        // Read the original HTML file
        const originalContent = fs.readFileSync(filePath, 'utf8');
        
        // Convert HTML to Base64
        const base64Html = Buffer.from(originalContent).toString('base64');
        
        // Create password hash
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Extract title from original HTML if possible
        const titleMatch = originalContent.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'Protected HTML Content';
        
        // Create protected HTML wrapper
        const protectedHtml = `<!DOCTYPE html>
<html>
<head>
    <title>🔒 ${title}</title>
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
        const encryptedContent = '${base64Html}';
        const validHash = '${passwordHash}';
        
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
</html>`;
        
        // Create backup
        const backupPath = filePath.replace(/\.html$/, '.original.html');
        fs.copyFileSync(filePath, backupPath);
        
        // Write protected content
        fs.writeFileSync(filePath, protectedHtml, 'utf8');
        
        console.log(`✅ HTML source code protection applied successfully!`);
        console.log(`🔑 Password: ${password}`);
        console.log(`📄 File: ${filePath}`);
        console.log(`📋 Backup: ${backupPath}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error protecting HTML file: ${error.message}`);
        return false;
    }
}

// Check if file path is provided
if (process.argv.length < 3) {
    console.log('Usage: node create-protected-html.js <file-path> [password]');
    process.exit(1);
}

const filePath = process.argv[2];
const password = process.argv[3] || 'Nlf263nish25!';

protectHtmlFile(filePath, password);