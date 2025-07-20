# HTML Source Code Protection System

## Overview

This system protects HTML source code from unauthorized editing while maintaining full browser functionality for authorized users. The protection uses Base64 encoding and SHA256 password hashing to secure the HTML content.

## How It Works

1. **Original HTML** → Gets converted to Base64 encoded string
2. **Password** → Gets hashed using SHA256 
3. **Protected Wrapper** → Creates a new HTML file with password input screen
4. **User Access** → Enters password to decrypt and view original content

## Security Features

- ✅ **Source Code Encryption**: HTML is Base64 encoded and embedded in JavaScript
- ✅ **Password Protection**: SHA256 hashing prevents password discovery
- ✅ **Browser Functionality**: Original HTML works perfectly after decryption
- ✅ **Developer Tools Blocked**: F12, Ctrl+Shift+I, Ctrl+U disabled
- ✅ **Right-Click Disabled**: Context menu blocked for additional security
- ✅ **Professional UI**: Clean, modern password entry interface

## Standard Password

**All First Technology HTML tools use the same password:**
```
Nlf263nish25!
```

## Implementation Status

### ✅ Protected Files
- `Audit/Latest/Master-Infrastructure-Audit-ScriptV8.8.ps1` (PowerShell script generates protected reports)
- `Production Tools/P1 Notification Tool/RMS Major Incident NotificationV4.2.html` ✅ **Protected**

### Protection Scripts Available
- `scripts/Protect-HtmlFiles.ps1` - PowerShell version for Windows
- `scripts/create-protected-html.js` - Node.js version for cross-platform use

## Usage Instructions

### Method 1: Using Node.js Script (Recommended)
```bash
node scripts/create-protected-html.js "path/to/your/file.html"
```

### Method 2: Using PowerShell (Windows Only)
```powershell
.\scripts\Protect-HtmlFiles.ps1 -FilePath "path/to/your/file.html" -BackupOriginal
```

### Method 3: Manual Integration (for PowerShell scripts)
Add the `Protect-HtmlSource` function to your PowerShell script and call it before writing HTML output.

## What Users See

### Before Protection
- Users can open HTML files in text editors
- Source code is visible and editable
- No access control

### After Protection
- Users see a professional password entry screen
- Source code is encrypted and unreadable in text editors
- Password required to view actual content
- Browser functionality preserved after authentication

## Example Protected File Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>🔒 Protected HTML Tool</title>
    <!-- Modern CSS styling -->
</head>
<body>
    <div class="container">
        <h1>🔒 Secure Access</h1>
        <input type="password" id="passwordInput" />
        <button onclick="decryptContent()">Decrypt & Access</button>
    </div>
    <script>
        const encryptedContent = 'BASE64_ENCODED_ORIGINAL_HTML';
        const validHash = 'SHA256_HASH_OF_PASSWORD';
        // Decryption logic
    </script>
</body>
</html>
```

## Backup System

- Original files are automatically backed up with `.original.html` extension
- PowerShell script creates timestamped backups
- Safe to re-run protection scripts multiple times

## Technical Details

### Encryption Process
1. Read original HTML content
2. Convert to UTF-8 bytes
3. Encode as Base64 string
4. Generate SHA256 hash of password
5. Create protected wrapper with encrypted content
6. Write to original file location

### Decryption Process (Browser)
1. User enters password
2. Browser generates SHA256 hash
3. Compare with stored hash
4. If valid: decode Base64 content
5. Replace current document with original HTML

## Security Considerations

- Password cannot be recovered from protected files
- Base64 is encoding, not encryption (rely on obscurity + password)
- Client-side validation (sufficient for source code protection)
- Prevents casual editing, not advanced reverse engineering

## Future Enhancements

- Stronger encryption algorithms (AES-256)
- Server-side validation options
- Bulk protection utilities
- Password recovery mechanisms
- Audit logging for access attempts

## Troubleshooting

### Common Issues
1. **"Invalid password"** - Check password is exactly: `Nlf263nish25!`
2. **Blank screen** - Browser may not support crypto.subtle (use HTTPS)
3. **Protection fails** - Ensure file is valid HTML and accessible

### Recovery
- Use `.original.html` backup files
- Re-run protection script with `-BackupOriginal` flag
- Check file permissions and encoding (UTF-8 required)

---

**Security Level**: Medium (Source Code Protection)  
**Threat Model**: Prevents casual editing and unauthorized modifications  
**Compliance**: First Technology Security Framework v1.0