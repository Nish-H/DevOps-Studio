# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nishen's AI Workspace is a Next.js-based professional development environment designed for system engineering and automation workflows. The workspace features a distinctive black background with neon red (#ff073a) and burnt orange (#cc5500) accent theme, providing a modern AI-powered interface.

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
- `messages` - Chat interface state for Claude AI section
- Section-specific rendering logic using conditional components

**Theme System**: 
- CSS custom properties in `globals.css` define the color palette
- Tailwind configuration extends these colors for utility classes
- Hydration-safe timestamp handling to prevent SSR mismatches

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
- Primary actions: `bg-red-600` (neon red)
- Secondary actions: `bg-orange-600` (burnt orange)  
- Backgrounds: `bg-gray-900`, `bg-gray-800` for layered surfaces
- Text hierarchy: `text-white`, `text-gray-300`, `text-gray-400`

### State Management Approach
- Component-level useState for section-specific data
- Lift state to `SimpleWorkspace` level when data needs to be shared across sections
- Avoid external state management libraries to maintain minimal dependencies

## Backup and Recovery

**Git Repository**: Initialized with working state commit `8ff6817`
**File Backups**: Located in `backups/` directory with timestamps
**Recovery**: See `RESTORE-INSTRUCTIONS.md` for complete restoration procedures

## Known Issues and Limitations

- Claude AI interface is currently in demo mode with simulated responses
- All sidebar sections except "Claude AI" show "Coming soon" placeholders
- Complex components with animation dependencies (`ClaudeInterface.tsx`, `WorkspaceLayout.tsx`) exist but are not currently used due to dependency issues
- Next.js version 14.2.5 shows as outdated but is intentionally pinned for stability