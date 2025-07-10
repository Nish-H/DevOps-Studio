# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nishen's AI Workspace** is a Next.js-based professional development environment designed for system engineering and automation workflows. The workspace features a distinctive **black background** with **dynamic accent theming** (Neon Red, British Silver, Neon Green), providing a modern AI-powered interface.

**Current Status**: FULLY FUNCTIONAL WEB APP - All core modules complete including Files (HTML/Markdown preview), Notes, Terminal, Tools, and Settings with global theming system. **SNAPSHOT TAKEN: 20250704_164121** - Ready for PowerShell integration phase.

**End Goal**: Marketable productivity tool for engineers and developers worldwide, featuring integrated Claude AI and multi-terminal support for enhanced daily workflows.

## Architecture

### Core Design Pattern
The application uses a **single-page workspace architecture** with:
- **SimpleWorkspace** component as the main orchestrator (`src/components/workspace/SimpleWorkspace.tsx`)
- **Sidebar navigation** with section-based routing (claude-ai, terminal, files, notes, tools, settings)
- **State-based component switching** rather than traditional routing
- **Demo mode Claude AI interface** with simulated responses

### Key Architectural Components

**Main Workspace Controller**: `SimpleWorkspace.tsx` manages the entire application state including:
- `activeSection` - Controls which workspace section is displayed
- `messages` - Chat interface state for Claude AI section (currently demo mode)
- Section-specific rendering logic using conditional components

**Global Settings System**: 
- `SettingsContext.tsx` - React Context for workspace-wide configuration
- Real-time theme switching with CSS custom properties
- localStorage persistence with auto-save functionality
- Dynamic color management (Red/Silver/Green accent switching)

**Theme System**: 
- CSS custom properties in `globals.css` define the color palette
- Tailwind configuration extends these colors for utility classes
- Real-time CSS variable injection for dynamic theming
- Hydration-safe timestamp handling to prevent SSR mismatches

**Completed Modules**:
- **Tools**: 20+ system administration utilities with real-time monitoring simulation
- **Settings**: 6-category configuration interface with export/import functionality
- **Files**: File management interface (functional UI)
- **Notes**: Note-taking system with categories (functional UI)

**Component Structure**:
- `workspace/` - Main workspace orchestration components
- `claude-ai/` - AI interface components (currently includes complex `ClaudeInterface.tsx` with framer-motion dependencies)
- Current active component: `SimpleWorkspace.tsx` (simplified version without external animation dependencies)

## Development Commands

```bash
# Start development server (current: Next.js 14.2.5)
npm run dev

# Production build
npm run build

# Start production server  
npm run start

# Lint code
npm run lint
```

## Critical Implementation Notes

### Dependency Management
- **Minimal dependency approach**: Current working state uses only essential packages (React 18.2.0, Next.js 14.2.5, lucide-react, clsx)
- **Avoid heavy dependencies**: Previous versions with framer-motion, @headlessui, @heroicons caused installation issues
- **Stable versions**: Uses exact version numbers, not semver ranges, to prevent version conflicts

### Hydration Handling
- **Timestamp issue**: Dynamic timestamps in initial state cause hydration mismatches
- **Solution pattern**: Initialize with empty timestamp, set in useEffect after mount
- **Location**: See `SimpleWorkspace.tsx` lines 17-22 for the implemented fix

### CSS Architecture
- **Tailwind + Custom CSS**: Uses @tailwind directives with custom CSS variables
- **Color system**: All theme colors defined in `:root` and mirrored in `tailwind.config.ts`
- **Fallback CSS**: `globals-fallback.css` exists as backup without Tailwind dependency

### Component Switching Logic
```tsx
// Current pattern in SimpleWorkspace.tsx
{activeSection === 'claude-ai' ? (
  <ClaudeAIInterface />
) : (
  <ComingSoonPlaceholder />
)}
```

## Extension Guidelines

### Adding New Sidebar Sections
1. Add new section to `menuItems` array in `SimpleWorkspace.tsx`
2. Create component in appropriate subdirectory under `src/components/`
3. Add conditional rendering logic to main content area
4. Follow established styling patterns using Tailwind utility classes

### Theme Consistency
- **Dynamic Accent Colors**: Uses CSS variables for real-time switching
  - Neon Red: `#ff073a` (primary red theme)
  - British Silver: `#8B9499` (professional silver theme) 
  - Neon Green: `#00CC33` (accent green theme)
- **Primary Actions**: `var(--primary-accent)` (dynamic based on user selection)
- **Backgrounds**: `bg-gray-900`, `bg-gray-800` for layered surfaces
- **Text Hierarchy**: `text-white`, `text-gray-300`, `text-gray-400`
- **Component Integration**: All components use `var(--primary-accent)` for consistent theming

### State Management Approach
- Component-level useState for section-specific data
- Lift state to `SimpleWorkspace` level when data needs to be shared across sections
- Avoid external state management libraries to maintain minimal dependencies

## Backup and Recovery

**Git Repository**: Initialized with working state commit `8ff6817`
**File Backups**: Located in `backups/` directory with timestamps
**Recovery**: See `RESTORE-INSTRUCTIONS.md` for complete restoration procedures

## Time Tracking & Project Management

**IMPORTANT**: This project requires detailed time tracking for billing purposes. All development sessions are logged in `TIME_TRACKING.md` with:
- Session duration and scope
- Phase-by-phase breakdown
- Bug fixes and optimization time
- Deliverables completed
- Weekly reporting schedule

**Current Total**: ~14 hours invested (July 1-2, 2025)
**Next Report Due**: July 9, 2025

## Current Implementation Status

### ✅ Completed Features (SNAPSHOT: 20250704_164121)
- **Claude AI Interface**: Demo mode with simulated responses and chat history
- **Terminal Component**: Full command simulation with history and Claude integration
- **Files Management System**: Complete CRUD operations with HTML/Markdown preview, version control, time tracking
- **Notes System**: Categories, search, tags, pin/unpin, markdown support with localStorage persistence  
- **Tools Module**: 20+ system administration utilities with monitoring simulation
- **Settings Module**: Real-time theme switching with 6 configuration categories and export/import
- **Dynamic Theming**: CSS variable-based color switching (Red/Silver/Green) with real-time updates
- **Responsive Design**: Mobile-friendly interface with proper contrast ratios
- **Data Persistence**: Full localStorage integration with auto-save functionality

### 🚧 In Progress / Next Phase  
- **PowerShell Web Terminal**: Full PowerShell functionality in web browser (NEXT IMPLEMENTATION)
- **Real Claude AI Integration**: Direct API calls with streaming responses (demo mode complete)
- **Multi-Terminal Support**: Tabbed terminal interface with session management

### 🎯 Future Goals (Market-Ready Features)
- **Real Claude AI Integration**: Direct API calls with streaming responses
- **Multi-Terminal Support**: Bash, PowerShell, and custom shell environments
- **Claude Code CLI Integration**: Execute `claude --code` commands within workspace
- **Advanced File Operations**: Real file system integration
- **Collaboration Features**: Multi-user workspace support
- **Plugin System**: Extensible architecture for third-party integrations

## Critical Lessons Learned & Mistakes to Avoid

### 🚨 SYNTAX ERRORS - Always Double-Check Switch Statements
**MISTAKE**: Duplicate `default:` cases in Terminal.tsx switch statement caused compilation failure
**IMPACT**: Prevented application from running entirely
**LESSON**: Always verify switch statement syntax, especially when merging code blocks
**PREVENTION**: Run `npm run build` after major code changes to catch syntax errors early

### 🚨 PLATFORM-SPECIFIC DEPENDENCIES - Test Environment Compatibility
**MISTAKE**: Linux Electron binary installed in development environment while targeting Windows
**IMPACT**: Desktop version couldn't run on target Windows platform
**LESSON**: Match development environment dependencies to target deployment platform
**PREVENTION**: Use platform-specific installs: `npm install electron --platform=win32`

### 🚨 PATH ISSUES - Don't Assume Global Commands Work
**MISTAKE**: Assumed `concurrently`, `cross-env`, and `electron` would be in PATH
**IMPACT**: npm scripts failed with "command not recognized" errors
**LESSON**: Always use npx or full node_modules paths for dev dependencies
**PREVENTION**: Use `npx command` or `./node_modules/.bin/command` in scripts

### 🚨 PREMATURE "TESTING COMPLETE" CLAIMS
**MISTAKE**: Claimed testing was complete without actually running the applications
**IMPACT**: User discovered critical issues that blocked functionality
**LESSON**: Never claim testing is complete without verifiable execution logs
**PREVENTION**: Always show actual command output and error messages

### 🚨 DEPENDENCY MANAGEMENT - Minimal is Better
**MISTAKE**: Previous versions included heavy dependencies (framer-motion, @headlessui) causing installation issues
**IMPACT**: Unstable builds and dependency conflicts
**LESSON**: Use minimal, stable dependencies with exact version pinning
**SUCCESS**: Current working state uses only essential packages (React 18.2.0, Next.js 14.2.5, lucide-react, clsx)

### 🚨 HYDRATION ISSUES - Server/Client Mismatch
**MISTAKE**: Dynamic timestamps in initial state cause hydration mismatches
**IMPACT**: React hydration errors and inconsistent rendering
**LESSON**: Initialize dynamic values in useEffect after mount, not in initial state
**SOLUTION**: Set empty timestamp initially, populate in useEffect

### 🚨 UNUSED FILES WITH PROBLEMATIC DEPENDENCIES - Clean Codebase
**MISTAKE**: Both backup files AND unused source files with problematic dependencies (framer-motion) in build path
**IMPACT**: Production build fails with "Cannot find module 'framer-motion'" from unused ClaudeInterface.tsx
**LESSON**: Remove ALL unused files and directories, not just backups, before production builds
**PREVENTION**: Regularly audit and remove unused components, use `.gitignore` patterns for backups

### 🚨 MISSING IMPORTS - Always Import All Used Icons/Components
**MISTAKE**: Using `AlertTriangle` icon in JSX without importing it from lucide-react
**IMPACT**: TypeScript compilation fails with "Cannot find name 'AlertTriangle'"
**LESSON**: Ensure all used icons/components are properly imported
**PREVENTION**: Use TypeScript strict mode, regularly run `npm run build` to catch import issues

### 🚨 SYSTEMATIC DEPENDENCY CLEANUP - Fix ALL Files at Once, Not One-by-One
**MISTAKE**: Addressing framer-motion errors file by file instead of scanning entire codebase
**IMPACT**: Each build attempt reveals another file with same dependency issue - wastes time
**LESSON**: Always scan ENTIRE codebase for problematic dependencies before fixing
**PREVENTION**: Use `find src/ -name "*.tsx" -exec grep -l "framer-motion" {} \;` to find ALL files first
**EFFICIENT APPROACH**: Remove ALL problematic files/dependencies in single operation

### 🚨 SYSTEMATIC ERROR HANDLING - Apply Same Methodology to TypeScript Errors
**LESSON APPLIED**: When encountering TypeScript `error.message` issue, immediately scan entire codebase
**COMMANDS USED**: 
- `find src/ -name "*.tsx" -exec grep -l "error\.message" {} \;`
- `grep -r "catch.*error" src/ --include="*.tsx"`
**RESULT**: Found only 1 instance needing fix, saved time by checking systematically first
**PATTERN**: Apply this systematic scanning approach to ANY recurring error type

### 🚨 CSS CUSTOM PROPERTIES IN TYPESCRIPT - Systematic Scanning Applied Again
**ISSUE**: TypeScript error with `'--focus-color'` not assignable to CSS Properties type
**SYSTEMATIC APPROACH USED**:
- `grep -rn "'--" src/ --include="*.tsx"` to find ALL custom CSS properties
- Found only 1 instance in `SimpleWorkspace.tsx` needing fix
- Other instances in `SettingsContext.tsx` use `setProperty()` method (safe)
**FIX**: `['--focus-color' as any]: 'var(--primary-accent)' } as React.CSSProperties`
**RESULT**: Single targeted fix instead of trial-and-error approach

### 🚨 TYPESCRIPT IMPLICIT ANY VARIABLES - Systematic Approach Applied
**ISSUE**: Variable 'terminalInfo' implicitly has type 'any' in some locations
**SYSTEMATIC APPROACH ATTEMPTED**: Tried to scan for similar implicit any issues
**FINDING**: Only 1 instance in `TerminalReal.tsx` needed explicit typing
**FIX**: Added explicit type annotation `let terminalInfo: { id: number; shell: string }`
**PATTERN**: TypeScript strict mode catches implicit any - add explicit types for let declarations

### 🚨 TYPESCRIPT KEYOF ASSIGNMENTS - Systematic Scanning Applied
**ISSUE**: Type 'any' is not assignable to type 'never' with keyof casting
**SYSTEMATIC APPROACH USED**: `grep -rn "as keyof" src/ --include="*.tsx"`
**FINDING**: 3 instances in `SettingsContext.tsx` with complex nested object assignments
**FIX**: Cast to `any` then back to proper type: `{ ...prev } as any` → `return newSettings as WorkspaceSettings`
**PATTERN**: Complex dynamic property assignments need temporary any casting for TypeScript

### 🚨 UNUSED FILES WITH MISSING DEPENDENCIES - Systematic Scanning Applied
**ISSUE**: Cannot find module 'tailwind-merge' in `src/lib/utils.ts`
**SYSTEMATIC APPROACH USED**: 
- `find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "tailwind-merge"`
- `grep -r "from.*utils\|import.*cn" src/` to check usage
**FINDING**: File exists but is completely unused - no imports anywhere
**FIX**: Removed entire `src/lib/utils.ts` file (safe deletion)
**PATTERN**: Remove unused utility files rather than installing missing dependencies

### 🚨 ELECTRON-BUILDER PATH ISSUES - Windows-Specific Fix Applied
**ISSUE**: 'electron-builder' is not recognized in Windows PowerShell (npx failed)
**SYSTEMATIC APPROACH USED**: `grep -rn "electron-builder" package.json` to find ALL instances
**FINDING**: 8 script commands - npx didn't work on Windows PowerShell
**FIX**: Used direct Windows path `node_modules\\.bin\\electron-builder` for ALL commands
**PATTERN**: Windows PowerShell requires escaped backslashes in npm scripts for node_modules paths

### 🚨 ELECTRON-BUILDER CONFIGURATION SCHEMA ERRORS - Systematic Fix Applied
**ISSUE**: Invalid configuration object with unknown properties in package.json "build" field
**SYSTEMATIC APPROACH**: Fixed ALL validation errors reported by electron-builder
**ERRORS FIXED**:
- Missing "description" and "author" fields in package.json
- `configuration.win.publisherName` → removed (not supported in v26)
- `configuration.linux.desktop.Name/Comment/Keywords/StartupWMClass` → removed entire desktop object (API changed)
**PATTERN**: electron-builder v26 has stricter schema validation than earlier versions

### 🚨 ELECTRON BLANK INTERFACE - Next.js Static Export Missing
**ISSUE**: Electron app builds and launches but shows blank content area (screenshot analyzed)
**DIAGNOSIS**: Electron trying to load `file://../out/index.html` but Next.js not creating static export
**ROOT CAUSE**: Next.js configuration missing `output: 'export'` for static file generation
**SYSTEMATIC FIX**: Added static export configuration to `next.config.js`:
- `output: 'export'` - Generate static HTML files
- `trailingSlash: true` - Fix routing for static files
- `images: { unoptimized: true }` - Disable image optimization for static export
**PATTERN**: Electron production requires static files, not server-side rendering

### 🚨 ELECTRON WEB DEMO MODE - Static Export Timing Issue
**ISSUE**: UI loads but shows "Web Demo" instead of "CLI Ready" in Electron app (screenshot 2 analyzed)
**DIAGNOSIS**: Static HTML hardcodes initial state, `electronAPI` detection happens after hydration
**ROOT CAUSE**: Timing issue between preload script and React component initialization
**SYSTEMATIC FIX**: Added retry logic and dynamic message updates:
- Console logging for debugging detection
- 100ms retry timeout for `electronAPI` detection
- Dynamic welcome message updates when detection changes
**PATTERN**: Production Electron apps need retry logic for API detection timing

### 🚨 VARIABLE REFERENCE ERRORS AFTER REFACTORING - Systematic Scanning Applied
**ISSUE**: Cannot find name 'electronCheck' after refactoring detection logic
**SYSTEMATIC APPROACH**: `grep -rn "electronCheck" src/components/workspace/SimpleWorkspace.tsx`
**FINDING**: 3 references to old variable name (lines 110, 118) after refactoring
**FIX**: Replace `electronCheck` with `isElectronDetected` in cleanup functions
**PATTERN**: Always scan for old variable references after major refactoring

### 🚨 TESTING METHODOLOGY - Verify Before Claiming
**BEST PRACTICE**: Always run these verification steps before claiming completion:
1. `npm run dev` - Verify web version compiles and runs
2. `npm run build` - Verify production build succeeds (after cleaning backups)
3. `npm run electron:dev` - Verify desktop version launches (platform-dependent)
4. Show actual terminal output, not assumptions

## Known Technical Limitations

- Claude AI interface is currently in demo mode with simulated responses  
- Complex components with animation dependencies exist but unused due to dependency conflicts
- Next.js version 14.2.5 intentionally pinned for stability over latest features
- Cross-platform Electron testing requires platform-specific binary installation