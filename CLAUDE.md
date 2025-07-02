# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nishen's AI Workspace** is a Next.js-based professional development environment designed for system engineering and automation workflows. The workspace features a distinctive **black background** with **dynamic accent theming** (Neon Red, British Silver, Neon Green), providing a modern AI-powered interface.

**Current Status**: Tools and Settings modules complete with global theming system. Ready for Claude AI and Terminal integration phase.

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

## Current Implementation Status

### ✅ Completed Features
- **Global Settings System**: Real-time theme switching with 6 configuration categories
- **Tools Module**: 20+ system administration utilities with monitoring simulation
- **Files Module**: File management interface with folder navigation
- **Notes Module**: Note-taking system with category organization
- **Dynamic Theming**: CSS variable-based color switching (Red/Silver/Green)
- **Responsive Design**: Mobile-friendly interface with proper contrast ratios

### 🚧 In Progress / Next Phase
- **Claude AI Integration**: Currently demo mode, needs real API integration
- **Terminal Functionality**: Placeholder component, needs web-based terminal implementation
- **PowerShell Support**: Multi-tab terminal with PowerShell integration planned

### 🎯 Future Goals (Market-Ready Features)
- **Real Claude AI Integration**: Direct API calls with streaming responses
- **Multi-Terminal Support**: Bash, PowerShell, and custom shell environments
- **Claude Code CLI Integration**: Execute `claude --code` commands within workspace
- **Advanced File Operations**: Real file system integration
- **Collaboration Features**: Multi-user workspace support
- **Plugin System**: Extensible architecture for third-party integrations

## Known Technical Limitations

- Claude AI interface is currently in demo mode with simulated responses
- Terminal component is placeholder (shows "Coming soon")
- Complex components with animation dependencies exist but unused due to dependency conflicts
- Next.js version 14.2.5 intentionally pinned for stability over latest features