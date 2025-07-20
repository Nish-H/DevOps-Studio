'use client'

import { useState, useEffect } from 'react'
import { createDataManager, DATA_VERSIONS } from '../../lib/dataManager'
import { createBulletproofStorage } from '../../lib/bulletproofStorage'
import ContactDetails from './ContactDetails'
import { 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  Search, 
  Calendar, 
  Tag,
  Trash2,
  Eye,
  Clock,
  BookOpen,
  StickyNote,
  Archive,
  Monitor,
  Globe,
  Code,
  File
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created: Date
  modified: Date
  isPinned: boolean
  isArchived: boolean
  type: 'markdown' | 'html' | 'document' | 'code' | 'other'
}

interface NoteCategory {
  id: string
  name: string
  color: string
  count: number
}

// Demo data for Notes
const DEMO_CATEGORIES: NoteCategory[] = [
  { id: 'cat-1', name: 'System Admin', color: '#ff073a', count: 0 },
  { id: 'cat-2', name: 'Development', color: '#cc5500', count: 0 },
  { id: 'cat-3', name: 'Documentation', color: '#0ea5e9', count: 0 },
  { id: 'cat-4', name: 'Ideas', color: '#10b981', count: 0 },
  { id: 'cat-5', name: 'Personal', color: '#8B9499', count: 0 }
]

const DEMO_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'PowerShell Best Practices',
    content: `# PowerShell Best Practices for System Administration

## Key Guidelines:
- Always use approved verbs (Get-, Set-, New-, Remove-)
- Use proper error handling with try/catch blocks
- Implement parameter validation
- Use Write-Output instead of Write-Host for data
- Always test scripts in development environment first

## Security Considerations:
- Use execution policies appropriately
- Avoid hardcoded credentials
- Implement proper logging
- Use constrained endpoints when possible

## Performance Tips:
- Use pipeline efficiently
- Avoid unnecessary object creation
- Filter left, format right
- Use specific property selection`,
    category: 'System Admin',
    tags: ['powershell', 'best-practices', 'security'],
    created: new Date('2025-06-15'),
    modified: new Date('2025-06-30'),
    isPinned: true,
    isArchived: false,
    type: 'markdown'
  },
  {
    id: 'note-2',
    title: 'Next.js 14 Project Setup',
    content: `# Next.js 14 Project Setup Notes

## Installation:
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features in v14:
- App Router (stable)
- Server Components by default
- Improved TypeScript support
- Turbopack (beta)

## Essential Dependencies:
- tailwindcss
- @types/node
- lucide-react for icons

## Configuration Tips:
- Use exact versions to avoid compatibility issues
- Configure tailwind.config.ts for custom colors
- Set up proper ESLint rules`,
    category: 'Development',
    tags: ['nextjs', 'react', 'setup'],
    created: new Date('2025-06-20'),
    modified: new Date('2025-06-28'),
    isPinned: false,
    isArchived: false,
    type: 'markdown'
  },
  {
    id: 'note-3',
    title: 'Workspace Color Scheme',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nishen's AI Workspace Color Palette</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .color-swatch {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
        }
        .color-box {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            margin-right: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .neon-red { background: #ff073a; }
        .burnt-orange { background: #cc5500; }
        .british-silver { background: #8B9499; }
        .neon-green { background: #00CC33; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Nishen's AI Workspace Color Palette</h1>
        
        <div class="color-swatch">
            <div class="color-box neon-red"></div>
            <div>
                <strong>Neon Red</strong> - #ff073a<br>
                <small>Primary actions, highlights, active states</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box burnt-orange"></div>
            <div>
                <strong>Burnt Orange</strong> - #cc5500<br>
                <small>Secondary actions, accents, hover states</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box british-silver"></div>
            <div>
                <strong>British Silver</strong> - #8B9499<br>
                <small>Professional silver theme, neutral accents</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box neon-green"></div>
            <div>
                <strong>Neon Green</strong> - #00CC33<br>
                <small>Success states, accent green theme</small>
            </div>
        </div>
        
        <h2>🎯 Usage Guidelines</h2>
        <ul>
            <li>Use neon red for primary CTAs and active states</li>
            <li>Burnt orange for secondary actions and hover states</li>
            <li>Gray scale for text hierarchy</li>
            <li>Maintain WCAG contrast ratios</li>
        </ul>
    </div>
</body>
</html>`,
    category: 'Documentation',
    tags: ['design', 'colors', 'branding'],
    created: new Date('2025-06-25'),
    modified: new Date('2025-06-25'),
    isPinned: false,
    isArchived: false,
    type: 'html'
  },
  {
    id: 'note-skills-development',
    title: 'Nishen\'s Skills Development and Knowledge Gained on the Job and in R&D',
    content: `# Nishen's Skills Development and Knowledge Gained on the Job and in R&D

## Project Portfolio & Technical Skills

### 🚀 Nishen's AI Workspace (July 2025 - Ongoing)
**Status**: Production Ready | **Time Invested**: 17.5+ hours | **Category**: Full-Stack Web/Desktop Application

#### Technologies Mastered:
- **Frontend**: React 18.2.0, Next.js 14.2.5, TypeScript, Tailwind CSS
- **Desktop**: Electron (cross-platform Windows/macOS/Linux)
- **State Management**: React Context API, localStorage persistence
- **UI/UX**: Dynamic theming system, responsive design, accessibility (WCAG)
- **Build Tools**: npm, webpack, electron-builder
- **Development**: VS Code, ESLint, Hot reload, TypeScript strict mode

#### Architecture Patterns Learned:
- **Single-page workspace architecture** with state-based routing
- **Component composition** with conditional rendering
- **CSS custom properties** for dynamic theming
- **Hydration-safe rendering** for SSR/CSR compatibility
- **Systematic error handling** and dependency management
- **Minimal dependency approach** for stability
- **Production build optimization** and static export configuration

#### Advanced Features Implemented:
- **Real-time settings system** with 6 configuration categories
- **Multi-format file preview** (HTML/Markdown rendering)
- **Terminal simulation** with command history and Claude integration
- **Note-taking system** with categories, search, tags, pin/unpin functionality
- **Professional prompt engineering database** with usage tracking
- **20+ system administration tools** with monitoring simulation
- **Cross-platform desktop packaging** with native menu integration

#### Key Problem-Solving Skills Developed:
- **Systematic debugging methodology** using scanning approaches
- **Production deployment troubleshooting** (Electron static export issues)
- **TypeScript error resolution** with proper type casting
- **CSS architecture design** for maintainable theming systems
- **Performance optimization** for smooth user experience
- **Version control management** with meaningful commit messages

### 🛠️ Development Environment Expertise

#### Platforms Mastered:
- **Ubuntu Linux** (WSL2 on Windows) - Primary development environment
- **Windows PowerShell** - Cross-platform scripting and terminal management
- **VS Code** - Advanced configuration, extensions, integrated terminal usage
- **Git** - Version control, branching strategies, commit message standards

#### Command Line Proficiency:
- **Node.js/npm** - Package management, script automation, dependency resolution
- **Bash/PowerShell** - File system operations, process management, environment setup
- **Build tools** - npm scripts, webpack configuration, production optimization
- **System administration** - Process monitoring, resource management, troubleshooting

### 📊 Technical Documentation & Project Management

#### Skills Developed:
- **Comprehensive time tracking** with detailed session logs
- **Technical documentation** writing (README files, API docs, user guides)
- **Project planning** with phase-based development approaches
- **Code review methodologies** and systematic testing approaches
- **Backup and recovery procedures** with versioned snapshots
- **Performance monitoring** and resource optimization

#### Professional Development Practices:
- **Agile methodology** application in solo development
- **Test-driven development** mindset for reliability
- **Security-first approach** in authentication and data handling
- **User experience design** with accessibility considerations
- **Cross-browser compatibility** testing and optimization

### 🎯 Current Expertise Level Assessment

#### Advanced Skills:
- React/Next.js full-stack development
- TypeScript advanced type system usage
- Electron desktop application development
- CSS architecture and dynamic theming
- Component-based UI design patterns

#### Intermediate Skills:
- System administration and monitoring
- Build tool configuration and optimization
- Cross-platform development considerations
- Performance profiling and optimization
- API design and integration patterns

#### Growing Skills:
- Advanced Node.js backend development
- Database design and management
- DevOps and CI/CD pipeline setup
- Cloud deployment and scaling
- Advanced security implementation

### 📈 Learning & Development Goals

#### Short-term (Next 30 days):
- Real Claude AI API integration with streaming responses
- Advanced terminal emulation with multiple shell support
- File system integration for real file operations
- Performance optimization and memory management

#### Medium-term (Next 90 days):
- Backend API development with authentication
- Database integration (PostgreSQL/MongoDB)
- Real-time collaboration features
- Advanced DevOps and deployment automation

#### Long-term (Next 6 months):
- Cloud-native architecture design
- Microservices development patterns
- Advanced security and compliance implementation
- Team leadership and code review processes

---

**Last Updated**: July 12, 2025  
**Auto-Update Schedule**: Every 2 days  
**Total Projects Completed**: 1 major (Nishen's AI Workspace)  
**Total Development Hours**: 17.5+ hours  
**Current Focus**: Real-time features and Claude AI integration`,
    category: 'Personal',
    tags: ['skills', 'development', 'career', 'projects', 'learning'],
    created: new Date('2025-07-12'),
    modified: new Date('2025-07-12'),
    isPinned: true,
    isArchived: false,
    type: 'markdown'
  }
]

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<NoteCategory[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  
  // BULLETPROOF STORAGE - ENTERPRISE GRADE
  const bulletproofStorage = createBulletproofStorage('NOTES', 'nishen-workspace-notes')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Modals
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)
  
  // Form states
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [newNoteType, setNewNoteType] = useState<'markdown' | 'html' | 'document' | 'code' | 'other'>('markdown')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#ff073a')

  // BULLETPROOF DATA LOADING - ENTERPRISE GRADE
  useEffect(() => {
    // Load with automatic recovery from multiple storage layers
    const loadedNotes = bulletproofStorage.loadData(DEMO_NOTES)
    const savedCategories = localStorage.getItem('nishen-workspace-categories')
    
    if (loadedNotes && savedCategories) {
      try {
        const parsedNotes = loadedNotes.map((n: any) => ({
          ...n,
          created: new Date(n.created),
          modified: new Date(n.modified)
        }))
        let parsedCategories = JSON.parse(savedCategories)
        
        // Clean up any unwanted categories and ensure Personal category exists
        parsedCategories = parsedCategories.filter((cat: any) => cat.name !== 'Personal Notes' && cat.name !== 'personal notes')
        
        const hasPersonalCategory = parsedCategories.some((cat: any) => cat.name === 'Personal')
        if (!hasPersonalCategory) {
          parsedCategories.push({ id: 'cat-5', name: 'Personal', color: '#8B9499', count: 0 })
        }
        
        // Always ensure Skills Development note exists
        const hasSkillsNote = parsedNotes.some((note: any) => note.title.includes('Skills Development'))
        if (!hasSkillsNote) {
          const skillsNote = {
            id: 'note-skills-' + Date.now(),
            title: 'Nishen\'s Skills Development and Knowledge Gained on the Job and in R&D',
            content: `# Nishen's Skills Development and Knowledge Gained on the Job and in R&D

## Project Portfolio & Technical Skills

### 🚀 Nishen's AI Workspace (July 2025 - Ongoing)
**Status**: Production Ready | **Time Invested**: 17.5+ hours | **Category**: Full-Stack Web/Desktop Application

#### Technologies Mastered:
- **Frontend**: React 18.2.0, Next.js 14.2.5, TypeScript, Tailwind CSS
- **Desktop**: Electron (cross-platform Windows/macOS/Linux)
- **State Management**: React Context API, localStorage persistence
- **UI/UX**: Dynamic theming system, responsive design, accessibility (WCAG)
- **Build Tools**: npm, webpack, electron-builder
- **Development**: VS Code, ESLint, Hot reload, TypeScript strict mode

#### Architecture Patterns Learned:
- **Single-page workspace architecture** with state-based routing
- **Component composition** with conditional rendering
- **CSS custom properties** for dynamic theming
- **Hydration-safe rendering** for SSR/CSR compatibility
- **Systematic error handling** and dependency management
- **Minimal dependency approach** for stability
- **Production build optimization** and static export configuration

#### Advanced Features Implemented:
- **Real-time settings system** with 6 configuration categories
- **Multi-format file preview** (HTML/Markdown rendering)
- **Terminal simulation** with command history and Claude integration
- **Note-taking system** with categories, search, tags, pin/unpin functionality
- **Professional prompt engineering database** with usage tracking
- **20+ system administration tools** with monitoring simulation
- **Cross-platform desktop packaging** with native menu integration

#### Key Problem-Solving Skills Developed:
- **Systematic debugging methodology** using scanning approaches
- **Production deployment troubleshooting** (Electron static export issues)
- **TypeScript error resolution** with proper type casting
- **CSS architecture design** for maintainable theming systems
- **Performance optimization** for smooth user experience
- **Version control management** with meaningful commit messages

### 🛠️ Development Environment Expertise

#### Platforms Mastered:
- **Ubuntu Linux** (WSL2 on Windows) - Primary development environment
- **Windows PowerShell** - Cross-platform scripting and terminal management
- **VS Code** - Advanced configuration, extensions, integrated terminal usage
- **Git** - Version control, branching strategies, commit message standards

#### Command Line Proficiency:
- **Node.js/npm** - Package management, script automation, dependency resolution
- **Bash/PowerShell** - File system operations, process management, environment setup
- **Build tools** - npm scripts, webpack configuration, production optimization
- **System administration** - Process monitoring, resource management, troubleshooting

### 📊 Technical Documentation & Project Management

#### Skills Developed:
- **Comprehensive time tracking** with detailed session logs
- **Technical documentation** writing (README files, API docs, user guides)
- **Project planning** with phase-based development approaches
- **Code review methodologies** and systematic testing approaches
- **Backup and recovery procedures** with versioned snapshots
- **Performance monitoring** and resource optimization

#### Professional Development Practices:
- **Agile methodology** application in solo development
- **Test-driven development** mindset for reliability
- **Security-first approach** in authentication and data handling
- **User experience design** with accessibility considerations
- **Cross-browser compatibility** testing and optimization

### 🎯 Current Expertise Level Assessment

#### Advanced Skills:
- React/Next.js full-stack development
- TypeScript advanced type system usage
- Electron desktop application development
- CSS architecture and dynamic theming
- Component-based UI design patterns

#### Intermediate Skills:
- System administration and monitoring
- Build tool configuration and optimization
- Cross-platform development considerations
- Performance profiling and optimization
- API design and integration patterns

#### Growing Skills:
- Advanced Node.js backend development
- Database design and management
- DevOps and CI/CD pipeline setup
- Cloud deployment and scaling
- Advanced security implementation

### 📈 Learning & Development Goals

#### Short-term (Next 30 days):
- Real Claude AI API integration with streaming responses
- Advanced terminal emulation with multiple shell support
- File system integration for real file operations
- Performance optimization and memory management

#### Medium-term (Next 90 days):
- Backend API development with authentication
- Database integration (PostgreSQL/MongoDB)
- Real-time collaboration features
- Advanced DevOps and deployment automation

#### Long-term (Next 6 months):
- Cloud-native architecture design
- Microservices development patterns
- Advanced security and compliance implementation
- Team leadership and code review processes

---

**Last Updated**: July 12, 2025  
**Auto-Update Schedule**: Every 2 days  
**Total Projects Completed**: 1 major (Nishen's AI Workspace)  
**Total Development Hours**: 17.5+ hours  
**Current Focus**: Real-time features and Claude AI integration`,
            category: 'Personal',
            tags: ['skills', 'development', 'career', 'projects', 'learning'],
            created: new Date('2025-07-12'),
            modified: new Date('2025-07-12'),
            isPinned: true,
            isArchived: false,
            type: 'markdown'
          }
          parsedNotes.unshift(skillsNote) // Add at beginning so it's prominent
        }
        
        setNotes(parsedNotes)
        setCategories(parsedCategories)
        return
      } catch (error) {
        console.error('Error loading saved notes:', error)
      }
    }

    // Default demo data if no saved data
    const demoCategories: NoteCategory[] = [
      { id: 'cat-1', name: 'System Admin', color: '#ff073a', count: 0 },
      { id: 'cat-2', name: 'Development', color: '#cc5500', count: 0 },
      { id: 'cat-3', name: 'Documentation', color: '#0ea5e9', count: 0 },
      { id: 'cat-4', name: 'Ideas', color: '#10b981', count: 0 },
      { id: 'cat-5', name: 'Personal', color: '#8B9499', count: 0 }
    ]

    const demoNotes: Note[] = [
      {
        id: 'note-1',
        title: 'PowerShell Best Practices',
        content: `# PowerShell Best Practices for System Administration

## Key Guidelines:
- Always use approved verbs (Get-, Set-, New-, Remove-)
- Use proper error handling with try/catch blocks
- Implement parameter validation
- Use Write-Output instead of Write-Host for data
- Always test scripts in development environment first

## Security Considerations:
- Use execution policies appropriately
- Avoid hardcoded credentials
- Implement proper logging
- Use constrained endpoints when possible

## Performance Tips:
- Use pipeline efficiently
- Avoid unnecessary object creation
- Filter left, format right
- Use specific property selection`,
        category: 'System Admin',
        tags: ['powershell', 'best-practices', 'security'],
        created: new Date('2025-06-15'),
        modified: new Date('2025-06-30'),
        isPinned: true,
        isArchived: false,
        type: 'markdown'
      },
      {
        id: 'note-2',
        title: 'Next.js 14 Project Setup',
        content: `# Next.js 14 Project Setup Notes

## Installation:
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features in v14:
- App Router (stable)
- Server Components by default
- Improved TypeScript support
- Turbopack (beta)

## Essential Dependencies:
- tailwindcss
- @types/node
- lucide-react for icons

## Configuration Tips:
- Use exact versions to avoid compatibility issues
- Configure tailwind.config.ts for custom colors
- Set up proper ESLint rules`,
        category: 'Development',
        tags: ['nextjs', 'react', 'setup'],
        created: new Date('2025-06-20'),
        modified: new Date('2025-06-28'),
        isPinned: false,
        isArchived: false,
        type: 'markdown'
      },
      {
        id: 'note-3',
        title: 'Workspace Color Scheme',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nishen's AI Workspace Color Palette</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .color-swatch {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
        }
        .color-box {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            margin-right: 15px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .neon-red { background: #ff073a; }
        .burnt-orange { background: #cc5500; }
        .british-silver { background: #8B9499; }
        .neon-green { background: #00CC33; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Nishen's AI Workspace Color Palette</h1>
        
        <div class="color-swatch">
            <div class="color-box neon-red"></div>
            <div>
                <strong>Neon Red</strong> - #ff073a<br>
                <small>Primary actions, highlights, active states</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box burnt-orange"></div>
            <div>
                <strong>Burnt Orange</strong> - #cc5500<br>
                <small>Secondary actions, accents, hover states</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box british-silver"></div>
            <div>
                <strong>British Silver</strong> - #8B9499<br>
                <small>Professional silver theme, neutral accents</small>
            </div>
        </div>
        
        <div class="color-swatch">
            <div class="color-box neon-green"></div>
            <div>
                <strong>Neon Green</strong> - #00CC33<br>
                <small>Success states, accent green theme</small>
            </div>
        </div>
        
        <h2>🎯 Usage Guidelines</h2>
        <ul>
            <li>Use neon red for primary CTAs and active states</li>
            <li>Burnt orange for secondary actions and hover states</li>
            <li>Gray scale for text hierarchy</li>
            <li>Maintain WCAG contrast ratios</li>
        </ul>
    </div>
</body>
</html>`,
        category: 'Documentation',
        tags: ['design', 'colors', 'branding'],
        created: new Date('2025-06-25'),
        modified: new Date('2025-06-25'),
        isPinned: false,
        isArchived: false,
        type: 'html'
      },
      {
        id: 'note-4',
        title: 'Nishen\'s Skills Development and Knowledge Gained on the Job and in R&D',
        content: `# Nishen's Skills Development and Knowledge Gained on the Job and in R&D

## Project Portfolio & Technical Skills

### 🚀 Nishen's AI Workspace (July 2025 - Ongoing)
**Status**: Production Ready | **Time Invested**: 17.5+ hours | **Category**: Full-Stack Web/Desktop Application

#### Technologies Mastered:
- **Frontend**: React 18.2.0, Next.js 14.2.5, TypeScript, Tailwind CSS
- **Desktop**: Electron (cross-platform Windows/macOS/Linux)
- **State Management**: React Context API, localStorage persistence
- **UI/UX**: Dynamic theming system, responsive design, accessibility (WCAG)
- **Build Tools**: npm, webpack, electron-builder
- **Development**: VS Code, ESLint, Hot reload, TypeScript strict mode

#### Architecture Patterns Learned:
- **Single-page workspace architecture** with state-based routing
- **Component composition** with conditional rendering
- **CSS custom properties** for dynamic theming
- **Hydration-safe rendering** for SSR/CSR compatibility
- **Systematic error handling** and dependency management
- **Minimal dependency approach** for stability
- **Production build optimization** and static export configuration

#### Advanced Features Implemented:
- **Real-time settings system** with 6 configuration categories
- **Multi-format file preview** (HTML/Markdown rendering)
- **Terminal simulation** with command history and Claude integration
- **Note-taking system** with categories, search, tags, pin/unpin functionality
- **Professional prompt engineering database** with usage tracking
- **20+ system administration tools** with monitoring simulation
- **Cross-platform desktop packaging** with native menu integration

#### Key Problem-Solving Skills Developed:
- **Systematic debugging methodology** using scanning approaches
- **Production deployment troubleshooting** (Electron static export issues)
- **TypeScript error resolution** with proper type casting
- **CSS architecture design** for maintainable theming systems
- **Performance optimization** for smooth user experience
- **Version control management** with meaningful commit messages

### 🛠️ Development Environment Expertise

#### Platforms Mastered:
- **Ubuntu Linux** (WSL2 on Windows) - Primary development environment
- **Windows PowerShell** - Cross-platform scripting and terminal management
- **VS Code** - Advanced configuration, extensions, integrated terminal usage
- **Git** - Version control, branching strategies, commit message standards

#### Command Line Proficiency:
- **Node.js/npm** - Package management, script automation, dependency resolution
- **Bash/PowerShell** - File system operations, process management, environment setup
- **Build tools** - npm scripts, webpack configuration, production optimization
- **System administration** - Process monitoring, resource management, troubleshooting

### 📊 Technical Documentation & Project Management

#### Skills Developed:
- **Comprehensive time tracking** with detailed session logs
- **Technical documentation** writing (README files, API docs, user guides)
- **Project planning** with phase-based development approaches
- **Code review methodologies** and systematic testing approaches
- **Backup and recovery procedures** with versioned snapshots
- **Performance monitoring** and resource optimization

#### Professional Development Practices:
- **Agile methodology** application in solo development
- **Test-driven development** mindset for reliability
- **Security-first approach** in authentication and data handling
- **User experience design** with accessibility considerations
- **Cross-browser compatibility** testing and optimization

### 🎯 Current Expertise Level Assessment

#### Advanced Skills:
- React/Next.js full-stack development
- TypeScript advanced type system usage
- Electron desktop application development
- CSS architecture and dynamic theming
- Component-based UI design patterns

#### Intermediate Skills:
- System administration and monitoring
- Build tool configuration and optimization
- Cross-platform development considerations
- Performance profiling and optimization
- API design and integration patterns

#### Growing Skills:
- Advanced Node.js backend development
- Database design and management
- DevOps and CI/CD pipeline setup
- Cloud deployment and scaling
- Advanced security implementation

### 📈 Learning & Development Goals

#### Short-term (Next 30 days):
- Real Claude AI API integration with streaming responses
- Advanced terminal emulation with multiple shell support
- File system integration for real file operations
- Performance optimization and memory management

#### Medium-term (Next 90 days):
- Backend API development with authentication
- Database integration (PostgreSQL/MongoDB)
- Real-time collaboration features
- Advanced DevOps and deployment automation

#### Long-term (Next 6 months):
- Cloud-native architecture design
- Microservices development patterns
- Advanced security and compliance implementation
- Team leadership and code review processes

---

**Last Updated**: July 12, 2025  
**Auto-Update Schedule**: Every 2 days  
**Total Projects Completed**: 1 major (Nishen's AI Workspace)  
**Total Development Hours**: 17.5+ hours  
**Current Focus**: Real-time features and Claude AI integration`,
        category: 'Personal',
        tags: ['skills', 'development', 'career', 'projects', 'learning'],
        created: new Date('2025-07-12'),
        modified: new Date('2025-07-12'),
        isPinned: true,
        isArchived: false,
        type: 'markdown'
      }
    ]

    setNotes(demoNotes)
    setCategories(demoCategories)
  }, [])

  // BULLETPROOF SAVE - ENTERPRISE GRADE
  const saveToLocalStorage = () => {
    try {
      bulletproofStorage.saveData(notes, 'USER_SAVE')
      localStorage.setItem('nishen-workspace-categories', JSON.stringify(categories))
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  // Auto-save whenever notes or categories change
  useEffect(() => {
    if (notes.length > 0 || categories.length > 0) {
      saveToLocalStorage()
    }
  }, [notes, categories])

  // Update category counts
  useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: notes.filter(note => note.category === cat.name && !note.isArchived).length
    })))
  }, [notes])

  // Helper function to get file type icon
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'html': return <Globe className="w-4 h-4 text-blue-400" />
      case 'markdown': return <BookOpen className="w-4 h-4 text-purple-400" />
      case 'code': return <Code className="w-4 h-4 text-green-400" />
      case 'document': return <FileText className="w-4 h-4 text-gray-400" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  // Simple markdown renderer (copied from Files component)
  const renderMarkdown = (content: string): string => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-purple-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 text-purple-200">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em class="text-yellow-300">$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="text-gray-300 italic">$1</em>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)\n```/gim, '<pre class="bg-gray-800 p-4 rounded mb-4 overflow-x-auto"><code class="text-green-400 text-sm">$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-700 px-2 py-1 rounded text-green-300">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-green-400 mr-2">✅</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-gray-500 mr-2">☐</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- (.*$)/gim, '<div class="flex items-start mb-1"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">$1</span></div>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 mb-4 text-gray-300 italic bg-gray-800/50 py-2">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-gray-600 my-6">')
      
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-300">')
      .replace(/\n/gim, '<br>')

    // Wrap in paragraph tags
    if (!html.startsWith('<')) {
      html = '<p class="mb-4 text-gray-300">' + html + '</p>'
    }

    return html
  }

  const createNote = () => {
    if (!newNoteTitle.trim()) return
    
    // Generate default content based on type
    let defaultContent = ''
    switch (newNoteType) {
      case 'html':
        defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newNoteTitle}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 { color: #fff; text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${newNoteTitle}</h1>
        <p>Start building your HTML content here...</p>
    </div>
</body>
</html>`
        break
      case 'markdown':
        defaultContent = `# ${newNoteTitle}

> **Created in Nishen's AI Workspace** | ${new Date().toLocaleDateString()}

## 📋 Overview

Start writing your markdown content here...

## 🔧 Features

- **Rich formatting** with markdown syntax
- **Code blocks** with syntax highlighting
- **Lists and tables**
- **Links and images**

## 📝 Notes

Add your notes and documentation here.`
        break
      case 'code':
        defaultContent = `// ${newNoteTitle}
// Created in Nishen's AI Workspace

/**
 * ${newNoteTitle} - Description
 */

function main() {
    console.log("Hello from ${newNoteTitle}!");
    // Add your code here
}

main();`
        break
      case 'document':
        defaultContent = `${newNoteTitle}
${'='.repeat(newNoteTitle.length)}

Created in Nishen's AI Workspace on ${new Date().toLocaleDateString()}

Overview:
---------
Document description here.

Contents:
---------
- Section 1
- Section 2
- Section 3

Notes:
------
Add your documentation content here.`
        break
      default:
        defaultContent = `# ${newNoteTitle}

Start writing your note here...`
    }
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: defaultContent,
      category: newNoteCategory || 'General',
      tags: newNoteTags ? newNoteTags.split(',').map(tag => tag.trim()) : [],
      created: new Date(),
      modified: new Date(),
      isPinned: false,
      isArchived: false,
      type: newNoteType
    }
    
    setNotes(prev => [newNote, ...prev])
    setSelectedNote(newNote.id)
    setNewNoteTitle('')
    setNewNoteCategory('')
    setNewNoteTags('')
    setNewNoteType('markdown')
    setShowNewNoteModal(false)
  }

  const createCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: NoteCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor,
      count: 0
    }
    
    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
    setNewCategoryColor('#ff073a')
    setShowNewCategoryModal(false)
  }

  const deleteCategory = (categoryName: string) => {
    // Don't delete if there are notes in this category
    const notesInCategory = notes.filter(note => note.category === categoryName && !note.isArchived)
    if (notesInCategory.length > 0) {
      alert(`Cannot delete category "${categoryName}" because it contains ${notesInCategory.length} note(s). Please move or delete the notes first.`)
      return
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
      return
    }
    
    setCategories(prev => prev.filter(cat => cat.name !== categoryName))
    
    // If the deleted category was selected, switch to 'all'
    if (selectedCategory === categoryName) {
      setSelectedCategory('all')
    }
  }

  const saveNote = () => {
    if (!selectedNote) return
    
    setNotes(prev => prev.map(note => 
      note.id === selectedNote
        ? { ...note, title: editTitle, content: editContent, modified: new Date() }
        : note
    ))
    
    setIsEditing(false)
  }

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId))
      if (selectedNote === noteId) {
        setSelectedNote(null)
      }
    }
  }

  const togglePin = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    if (note.isArchived) return false
    
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Sort notes: pinned first, then by modified date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.modified.getTime() - a.modified.getTime()
  })

  const selectedNoteData = notes.find(n => n.id === selectedNote)

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <ContactDetails />
      <div className="flex h-full bg-black text-white">
      {/* Sidebar - Categories & Notes */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          {/* Version Info */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>DevOps Studio v0.1.1</span>
            <span>Notes Module</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>Notes</h2>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Note
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-red"
            />
          </div>
          
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Categories</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                  className="text-xs text-gray-400 hover:text-neon-red"
                  title="Manage Categories"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowNewCategoryModal(true)}
                  className="text-xs text-gray-400 hover:text-neon-red"
                  title="Add Category"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-neon-red/20 text-neon-red' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>All Notes</span>
                <span className="text-xs">{notes.filter(n => !n.isArchived).length}</span>
              </button>
              
              {categories.map(category => (
                <div key={category.id} className="flex items-center group">
                  <button
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-1 flex items-center justify-between p-2 rounded text-sm transition-colors ${
                      selectedCategory === category.name 
                        ? 'bg-neon-red/20 text-neon-red' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs">{category.count}</span>
                  </button>
                  {showCategoryManagement && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCategory(category.name)
                      }}
                      className="ml-1 p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title={`Delete ${category.name} category`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {sortedNotes.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes found</p>
              <p className="text-xs">Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedNote === note.id 
                      ? 'bg-neon-red/20 border-neon-red/40' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                  onClick={() => {
                    setSelectedNote(note.id)
                    setEditTitle(note.title)
                    setEditContent(note.content)
                    setIsEditing(false)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                    {note.isPinned && (
                      <div className="text-burnt-orange ml-2">
                        <StickyNote className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                    {note.content.replace(/#+\s/g, '').substring(0, 100)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: categories.find(c => c.name === note.category)?.color + '20',
                          color: categories.find(c => c.name === note.category)?.color
                        }}
                      >
                        {note.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getFileTypeIcon(note.type)}
                        {(note.type === 'html' || note.type === 'markdown') && (
                          <Monitor className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {note.modified.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNoteData ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-neon-red" />
                  <div>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-neon-red"
                      />
                    ) : (
                      <h3 className="font-semibold">{selectedNoteData.title}</h3>
                    )}
                    <div className="text-sm text-gray-400">
                      {selectedNoteData.category} • Modified: {selectedNoteData.modified.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Preview Button for HTML/Markdown */}
                  {(selectedNoteData.type === 'html' || selectedNoteData.type === 'markdown') && !isEditing && (
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                        isPreviewMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : selectedNoteData.type === 'html' 
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {selectedNoteData.type === 'markdown' ? (
                        <BookOpen className="w-4 h-4 inline mr-1" />
                      ) : (
                        <Monitor className="w-4 h-4 inline mr-1" />
                      )}
                      {isPreviewMode ? 'Show Code' : selectedNoteData.type === 'markdown' ? 'Render' : 'Preview'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => togglePin(selectedNoteData.id)}
                    className={`p-2 rounded transition-colors ${
                      selectedNoteData.isPinned 
                        ? 'text-burnt-orange bg-burnt-orange/20' 
                        : 'text-gray-400 hover:text-burnt-orange hover:bg-gray-800'
                    }`}
                    title={selectedNoteData.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveNote}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(selectedNoteData.title)
                          setEditContent(selectedNoteData.content)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-neon-red hover:bg-neon-red-bright px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNote(selectedNoteData.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-neon-red"
                  placeholder="Write your note here... You can use Markdown formatting!"
                />
              ) : selectedNoteData.type === 'html' && isPreviewMode ? (
                <div className="w-full h-full bg-white border border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={selectedNoteData.content}
                    className="w-full h-full border-0"
                    title={`Preview of ${selectedNoteData.title}`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    style={{ minHeight: '500px' }}
                  />
                </div>
              ) : selectedNoteData.type === 'markdown' && isPreviewMode ? (
                <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg p-6 overflow-auto">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(selectedNoteData.content) 
                    }}
                  />
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      📘 <strong>Markdown Rendering:</strong> This is a basic markdown renderer. 
                      For full Mermaid diagram support, consider integrating a complete markdown library.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {selectedNoteData.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Note Metadata */}
            <div className="border-t border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Created: {selectedNoteData.created.toLocaleString()}</span>
                  <span>•</span>
                  <span>Modified: {selectedNoteData.modified.toLocaleString()}</span>
                </div>
                
                {selectedNoteData.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <div className="flex space-x-1">
                      {selectedNoteData.tags.map(tag => (
                        <span key={tag} className="bg-gray-700 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Note Selected</h3>
              <p className="text-gray-500">Select a note from the sidebar to view and edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New Note</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note Title</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="Enter note title"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Note Type</label>
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="code">Code</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
                disabled={!newNoteTitle.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex space-x-2">
                  {['#ff073a', '#cc5500', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded border-2 ${
                        newCategoryColor === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCategory}
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
                disabled={!newCategoryName.trim()}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}