# Troubleshooting Guide

## ❌ Common Issues and Solutions

### 1. SWC Compilation Error
**Error**: `@next/swc-win32-x64-msvc is not a valid Win32 application`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

### 2. Turbopack Errors
**Error**: `turbo.createProject is not supported by the wasm bindings`

**Fixed**: Updated package.json to use standard Next.js development server instead of Turbopack.

### 3. Permission Denied Errors
**Error**: Cannot remove node_modules

**Solution**:
1. Close VS Code and all Node.js processes
2. Run Command Prompt as Administrator
3. Navigate to project directory
4. Run the fix script: `fix-and-run.bat`

### 4. Port Already in Use
**Error**: Port 3000 is already in use

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### 5. Module Not Found Errors
**Error**: Cannot resolve module

**Solution**:
```bash
# Reinstall dependencies
npm install

# Clear Next.js cache
npx next build --debug
```

## 🔧 Quick Fix Commands

### Complete Reset
```bash
# Run as Administrator
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
npm run dev
```

### Development Server
```bash
# Standard development
npm run dev

# With specific port
npm run dev -- --port 3001

# With verbose logging
npm run dev -- --verbose
```

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📋 System Requirements

- **Node.js**: 18.17.0 or later
- **NPM**: 9.0.0 or later
- **OS**: Windows 10/11, macOS, Linux
- **Memory**: 4GB+ RAM recommended
- **Storage**: 1GB+ free space

## 🆘 Still Having Issues?

1. **Check Node.js version**: `node --version`
2. **Check NPM version**: `npm --version`
3. **Update Node.js** if version is below 18.17
4. **Run as Administrator** on Windows
5. **Disable antivirus** temporarily during installation
6. **Contact**: nishen@mail.com for additional support

## 📖 Alternative Installation

If standard installation fails, try:

```bash
# Use Yarn instead of NPM
npm install -g yarn
yarn install
yarn dev

# Or use PNPM
npm install -g pnpm
pnpm install
pnpm dev
```

---

*Last updated: June 29, 2025*