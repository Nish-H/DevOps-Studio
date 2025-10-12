# Back4App Migration Plan - All Modules

## Module Color Scheme

| Module | Icon | Color | Accent Color | Description |
|--------|------|-------|--------------|-------------|
| Claude AI | 🤖 | Default | `#ff073a` (Neon Red) | AI Assistant |
| Terminal | 💻 | Blue | `#3b82f6` | Terminal simulation |
| PowerShell | 🔷 | Cyan | `#06b6d4` | PowerShell execution |
| Dev (Files) | 🛠️ | Purple | `#a855f7` | Development files & projects |
| Prod (Scripts) | 🚀 | Orange | `#f97316` | Production scripts |
| File Browser | 🗂️ | Gray | `#6b7280` | Windows filesystem |
| Tasks | ✅ | Green | `#10b981` | Task management |
| Notes | 📝 | Yellow | `#eab308` | Notes & calendar |
| Prompts | 🧠 | Pink | `#ec4899` | Prompt engineering |
| Links | 🔗 | Indigo | `#6366f1` | URL bookmarks |
| Tools | ⚡ | Emerald | `#059669` | System utilities |
| Settings | ⚙️ | Slate | `#64748b` | Workspace settings |

## Data Models to Migrate

### 1. **Dev Module (Files)**
**localStorage keys:**
- `nishen-workspace-dev` (projects)
- `nishen-workspace-files` (legacy)
- `nishen-workspace-categories` (file categories)

**Data Structure:**
```typescript
interface Project {
  id: string
  name: string
  description: string
  files: ProjectFile[]
  totalTimeSpent: number
  created: Date
  isTimerRunning: boolean
  timerStartTime?: Date
}

interface ProjectFile {
  id: string
  name: string
  type: 'script' | 'html' | 'document' | 'code' | 'markdown' | 'other'
  category: string
  content: string
  versions: FileVersion[]
  created: Date
  modified: Date
  timeSpent: number
}
```

**Back4App Tables:**
- `Project` - Main projects
- `ProjectFile` - Files within projects
- `FileVersion` - Version history

---

### 2. **Prod Module (Scripts)**
**localStorage keys:**
- `nishen-workspace-prod` (scripts)
- `nishen-workspace-scripts` (legacy)
- `nishen-workspace-script-categories` (script categories)

**Data Structure:**
```typescript
interface Script {
  id: string
  name: string
  category: string
  language: string
  content: string
  description: string
  isActive: boolean
  isPinned: boolean
  lastRun?: Date
  runCount: number
  created: Date
  modified: Date
}
```

**Back4App Tables:**
- `Script` - Production scripts

---

### 3. **Notes Module**
**localStorage keys:**
- `nishen-workspace-notes` (notes)
- Notes categories (built-in)

**Data Structure:**
```typescript
interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPinned: boolean
  color?: string
  hasCalendarEvent: boolean
  eventDate?: Date
  created: Date
  modified: Date
}
```

**Back4App Tables:**
- `Note` - Already exists, needs enhancement for calendar

---

### 4. **Prompts Module (Prompt Engineering)**
**localStorage keys:**
- `nishen-workspace-prompts` (prompts)
- `nishen-workspace-prompt-categories` (categories)

**Data Structure:**
```typescript
interface Prompt {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  variables: string[]
  model?: string
  temperature?: number
  maxTokens?: number
  isPinned: boolean
  useCount: number
  lastUsed?: Date
  created: Date
  modified: Date
}
```

**Back4App Tables:**
- `Prompt` - Prompt templates

---

### 5. **Links Module (URL Links)**
**localStorage keys:**
- `devops-studio-url-links` (links)
- `devops-studio-url-categories` (categories)

**Data Structure:**
```typescript
interface URLLink {
  id: string
  title: string
  url: string
  category: string
  tags: string[]
  description?: string
  favicon?: string
  isPinned: boolean
  clickCount: number
  lastVisited?: Date
  created: Date
  modified: Date
}
```

**Back4App Tables:**
- `URLLink` - Bookmarked links

---

## Migration Features

### ✅ Must Have:
1. **Preserve all existing data** - No data loss during migration
2. **Import/Export functionality** - JSON export of all data
3. **Migration tool** - One-click localStorage → Back4App
4. **Shared authentication** - Single login for all modules
5. **Unique module colors** - Visual distinction
6. **Offline mode** - Continue working without internet
7. **Sync indicators** - Show sync status in real-time
8. **Rollback capability** - Revert to localStorage if needed

### 🎨 Color Implementation:
Each module will:
- Use its accent color for headers, buttons, highlights
- Keep consistent dark theme base
- Show module-specific color in sidebar when active
- Use color-coded sync status indicators

### 📦 Import/Export Format:
```json
{
  "version": "1.0",
  "exportDate": "2025-10-12T...",
  "modules": {
    "dev": { "projects": [...] },
    "prod": { "scripts": [...] },
    "notes": { "notes": [...] },
    "prompts": { "prompts": [...] },
    "links": { "links": [...] },
    "tasks": { "tasks": [...] }
  }
}
```

---

## Implementation Order

1. ✅ **Tasks** - COMPLETE
2. **Dev (Files)** - Most complex, sets pattern
3. **Prod (Scripts)** - Similar to Dev
4. **Notes** - Enhance existing Back4App integration
5. **Prompts** - Similar structure to Notes
6. **Links** - Simplest, good for testing
7. **Migration Tool** - Bulk import from localStorage
8. **Export Tool** - Backup all data

---

## Rollback Safety

**localStorage preserved as:**
- Primary data source until migration confirmed
- Backup before migration
- Can switch back via Settings toggle

**Migration Steps:**
1. Export current localStorage data (backup)
2. Upload to Back4App
3. Verify data integrity
4. Mark migration complete
5. Keep localStorage for 30 days (safety)

---

**Status:** Ready to begin migration
**Next:** Start with Dev module (Files)
