'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
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
  Copy,
  Archive,
  Monitor,
  Globe,
  Code,
  File,
  Zap,
  MessageSquare,
  Lightbulb,
  Target,
  Layers,
  Star,
  Hash
} from 'lucide-react'

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created: Date
  modified: Date
  isPinned: boolean
  isArchived: boolean
  type: 'system' | 'user' | 'assistant' | 'creative' | 'technical' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  usageCount: number
  rating: number
}

interface PromptCategory {
  id: string
  name: string
  color: string
  count: number
  description: string
}

export default function PromptEngineering() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<PromptCategory[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Modals
  const [showNewPromptModal, setShowNewPromptModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  
  // Form states
  const [newPromptTitle, setNewPromptTitle] = useState('')
  const [newPromptCategory, setNewPromptCategory] = useState('')
  const [newPromptTags, setNewPromptTags] = useState('')
  const [newPromptType, setNewPromptType] = useState<'system' | 'user' | 'assistant' | 'creative' | 'technical' | 'other'>('user')
  const [newPromptDifficulty, setNewPromptDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#ff073a')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // Load data from localStorage or demo data
  useEffect(() => {
    const savedPrompts = localStorage.getItem('nishen-workspace-prompts')
    const savedPromptCategories = localStorage.getItem('nishen-workspace-prompt-categories')
    
    if (savedPrompts && savedPromptCategories) {
      try {
        const parsedPrompts = JSON.parse(savedPrompts).map((p: any) => ({
          ...p,
          created: new Date(p.created),
          modified: new Date(p.modified)
        }))
        setPrompts(parsedPrompts)
        setCategories(JSON.parse(savedPromptCategories))
        return
      } catch (error) {
        console.error('Error loading saved prompts:', error)
      }
    }

    // Default demo data if no saved data
    const demoCategories: PromptCategory[] = [
      { id: 'cat-1', name: 'System Prompts', color: '#ff073a', count: 0, description: 'Core system instructions and personas' },
      { id: 'cat-2', name: 'Code Generation', color: '#cc5500', count: 0, description: 'Programming and development prompts' },
      { id: 'cat-3', name: 'Analysis & Research', color: '#0ea5e9', count: 0, description: 'Data analysis and research assistance' },
      { id: 'cat-4', name: 'Creative Writing', color: '#10b981', count: 0, description: 'Content creation and storytelling' },
      { id: 'cat-5', name: 'Problem Solving', color: '#8b5cf6', count: 0, description: 'Troubleshooting and solution design' },
      { id: 'cat-6', name: 'Documentation', color: '#f59e0b', count: 0, description: 'Technical writing and documentation' }
    ]

    const demoPrompts: Prompt[] = [
      {
        id: 'prompt-1',
        title: 'System Administrator Expert',
        content: `You are an expert system administrator with 15+ years of experience managing enterprise environments. You have deep knowledge of:

- Windows Server, Linux distributions, and networking
- PowerShell, Bash scripting, and automation
- Active Directory, Group Policy, and security frameworks
- Virtualization technologies (VMware, Hyper-V)
- Cloud platforms (Azure, AWS, GCP)
- Monitoring, backup, and disaster recovery

When responding:
1. Provide detailed, actionable solutions
2. Include relevant commands and scripts
3. Consider security implications
4. Suggest best practices and alternatives
5. Format responses clearly with code blocks

Always prioritize security, scalability, and maintainability in your recommendations.`,
        category: 'System Prompts',
        tags: ['sysadmin', 'expert', 'enterprise', 'security'],
        created: new Date('2025-07-01'),
        modified: new Date('2025-07-10'),
        isPinned: true,
        isArchived: false,
        type: 'system',
        difficulty: 'advanced',
        usageCount: 45,
        rating: 5
      },
      {
        id: 'prompt-2',
        title: 'PowerShell Script Generator',
        content: `Generate a PowerShell script that:

Requirements:
- [Specify the main functionality needed]
- Include error handling with try-catch blocks
- Add parameter validation
- Include help documentation with Get-Help support
- Use approved PowerShell verbs
- Follow PowerShell best practices

Output Format:
1. Script with full functionality
2. Usage examples
3. Parameter descriptions
4. Error scenarios covered

Additional Requirements:
- Support for WhatIf and Verbose parameters
- Pipeline input support where applicable
- Cross-platform compatibility notes`,
        category: 'Code Generation',
        tags: ['powershell', 'automation', 'scripting', 'best-practices'],
        created: new Date('2025-07-05'),
        modified: new Date('2025-07-10'),
        isPinned: false,
        isArchived: false,
        type: 'technical',
        difficulty: 'intermediate',
        usageCount: 23,
        rating: 4
      },
      {
        id: 'prompt-3',
        title: 'Code Review Assistant',
        content: `Review the following code and provide a comprehensive analysis:

Focus Areas:
1. **Security vulnerabilities** - Identify potential security issues
2. **Performance optimization** - Suggest improvements for efficiency
3. **Code quality** - Check for maintainability, readability, and best practices
4. **Error handling** - Evaluate robustness and edge case coverage
5. **Documentation** - Assess code comments and documentation quality

Review Format:
## Summary
[Overall assessment and key findings]

## Critical Issues
[Security, performance, or functional problems]

## Suggestions
[Specific improvements with code examples]

## Best Practices
[Adherence to language/framework conventions]

## Rating: [1-5 stars] ⭐

Provide specific line numbers and code snippets in your feedback.`,
        category: 'Code Generation',
        tags: ['code-review', 'quality', 'security', 'performance'],
        created: new Date('2025-07-03'),
        modified: new Date('2025-07-08'),
        isPinned: true,
        isArchived: false,
        type: 'technical',
        difficulty: 'advanced',
        usageCount: 67,
        rating: 5
      },
      {
        id: 'prompt-4',
        title: 'Technical Documentation Writer',
        content: `Create comprehensive technical documentation for the following:

Documentation Structure:
1. **Overview** - Purpose and scope
2. **Prerequisites** - Requirements and dependencies
3. **Installation/Setup** - Step-by-step instructions
4. **Configuration** - Settings and customization
5. **Usage Examples** - Practical implementation scenarios
6. **Troubleshooting** - Common issues and solutions
7. **API Reference** - Detailed parameter documentation
8. **Best Practices** - Recommended approaches

Writing Style:
- Clear, concise language
- Numbered steps for procedures
- Code examples with syntax highlighting
- Warning callouts for important notes
- Cross-references to related topics

Target Audience: [Specify: developers, admins, end-users]
Format: [Specify: Markdown, Wiki, PDF, etc.]`,
        category: 'Documentation',
        tags: ['technical-writing', 'documentation', 'user-guides', 'api'],
        created: new Date('2025-07-02'),
        modified: new Date('2025-07-07'),
        isPinned: false,
        isArchived: false,
        type: 'user',
        difficulty: 'intermediate',
        usageCount: 34,
        rating: 4
      },
      {
        id: 'prompt-5',
        title: 'Creative Problem Solving',
        content: `Approach this challenge using creative problem-solving techniques:

Problem Analysis Framework:
1. **Define the Problem**
   - What exactly needs to be solved?
   - Who are the stakeholders?
   - What are the constraints?

2. **Generate Solutions**
   - Brainstorm 5-10 different approaches
   - Consider unconventional methods
   - Think outside traditional boundaries

3. **Evaluate Options**
   - Pros and cons of each solution
   - Resource requirements
   - Risk assessment
   - Implementation difficulty

4. **Recommend Solution**
   - Best approach with justification
   - Implementation plan
   - Success metrics
   - Contingency plans

Use creative thinking methods like:
- SCAMPER technique
- Mind mapping
- Reverse thinking
- Analogical reasoning`,
        category: 'Problem Solving',
        tags: ['creativity', 'innovation', 'analysis', 'strategy'],
        created: new Date('2025-06-28'),
        modified: new Date('2025-07-06'),
        isPinned: false,
        isArchived: false,
        type: 'creative',
        difficulty: 'intermediate',
        usageCount: 19,
        rating: 4
      }
    ]

    setCategories(demoCategories)
    setPrompts(demoPrompts)
    updateCategoryCounts(demoPrompts, demoCategories)
  }, [])

  // Update category counts
  const updateCategoryCounts = (promptList: Prompt[], categoryList: PromptCategory[]) => {
    const updatedCategories = categoryList.map(category => ({
      ...category,
      count: promptList.filter((prompt: any) => !prompt.isArchived && prompt.category === category.name).length
    }))
    setCategories(updatedCategories)
  }

  // Save data to localStorage
  const saveToLocalStorage = (promptsData: Prompt[], categoriesData: PromptCategory[]) => {
    try {
      console.log(`🛡️ PROMPTS SAVE: ${promptsData.length} prompts, ${categoriesData.length} categories`)
      localStorage.setItem('nishen-workspace-prompts', JSON.stringify(promptsData))
      localStorage.setItem('nishen-workspace-prompt-categories', JSON.stringify(categoriesData))
      console.log('✅ Prompts saved successfully')
    } catch (error) {
      console.error('❌ Error saving prompt data:', error)
    }
  }

  // Auto-save whenever prompts or categories change
  useEffect(() => {
    if (prompts.length > 0 && categories.length > 0) {
      updateCategoryCounts(prompts, categories)
      saveToLocalStorage(prompts, categories)
    }
  }, [prompts, categories])

  const createPrompt = () => {
    if (!newPromptTitle.trim()) return
    
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      title: newPromptTitle,
      content: `# ${newPromptTitle}

Write your prompt content here...

## Purpose
[Describe what this prompt is designed to achieve]

## Usage
[Explain how to use this prompt effectively]

## Examples
[Provide specific examples of input/output]`,
      category: newPromptCategory || 'General',
      tags: newPromptTags ? newPromptTags.split(',').map(tag => tag.trim()) : [],
      created: new Date(),
      modified: new Date(),
      isPinned: false,
      isArchived: false,
      type: newPromptType,
      difficulty: newPromptDifficulty,
      usageCount: 0,
      rating: 0
    }
    
    setPrompts(prev => [...prev, newPrompt])
    
    setNewPromptTitle('')
    setNewPromptCategory('')
    setNewPromptTags('')
    setShowNewPromptModal(false)
  }

  const createCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: PromptCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor,
      count: 0,
      description: newCategoryDescription || 'Custom prompt category'
    }
    
    setCategories(prev => [...prev, newCategory])
    
    setNewCategoryName('')
    setNewCategoryDescription('')
    setShowNewCategoryModal(false)
  }

  const savePrompt = () => {
    if (!selectedPrompt) return
    
    setPrompts(prev => prev.map(prompt => 
      prompt.id === selectedPrompt
        ? { 
            ...prompt, 
            title: editTitle,
            content: editContent,
            modified: new Date(),
            usageCount: prompt.usageCount + 1
          }
        : prompt
    ))
    
    setIsEditing(false)
  }

  const deletePrompt = (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prev => prev.filter((prompt: any) => prompt.id !== promptId))
      if (selectedPrompt === promptId) {
        setSelectedPrompt(null)
      }
    }
  }

  const togglePin = (promptId: string) => {
    setPrompts(prev => prev.map(prompt => 
      prompt.id === promptId ? { ...prompt, isPinned: !prompt.isPinned } : prompt
    ))
  }

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Brain className="w-4 h-4 text-purple-400" />
      case 'user': return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'assistant': return <Zap className="w-4 h-4 text-green-400" />
      case 'creative': return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'technical': return <Code className="w-4 h-4 text-red-400" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
    ))
  }

  // Filter prompts based on search and category
  const filteredPrompts = prompts.filter((prompt: any) => {
    if (prompt.isArchived) return false
    
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prompt.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Sort prompts: pinned first, then by usage count, then by modified date
  const sortedPrompts = filteredPrompts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount
    return b.modified.getTime() - a.modified.getTime()
  })

  const selectedPromptData = prompts.find((p: any) => p.id === selectedPrompt)

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Categories & Prompts */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          {/* Version Info */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>DevOps Studio v0.1.2</span>
            <span>Prompts Module</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
              <Brain className="w-5 h-5 inline mr-2" />
              Prompt Engineering
            </h2>
            <button
              onClick={() => setShowNewPromptModal(true)}
              className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Prompt
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-red"
            />
          </div>
          
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Categories</span>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="text-xs text-gray-400 hover:text-neon-red"
              >
                <Plus className="w-3 h-3" />
              </button>
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
                <span>All Prompts</span>
                <span className="text-xs">{prompts.filter((p: any) => !p.isArchived).length}</span>
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
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
              ))}
            </div>
          </div>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {sortedPrompts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No prompts found</p>
              <p className="text-xs">Create your first prompt!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedPrompt === prompt.id 
                      ? 'bg-neon-red/20 border-neon-red/40' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                  onClick={() => {
                    setSelectedPrompt(prompt.id)
                    setEditTitle(prompt.title)
                    setEditContent(prompt.content)
                    setIsEditing(false)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(prompt.type)}
                      <h3 className="font-medium text-sm line-clamp-1">{prompt.title}</h3>
                      {prompt.isPinned && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    <div className="flex items-center justify-between">
                      <span>{prompt.category}</span>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(prompt.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Used {prompt.usageCount} times</span>
                    <span>{prompt.modified.toLocaleDateString()}</span>
                  </div>
                  
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prompt.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                      {prompt.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{prompt.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Prompt Editor */}
      <div className="flex-1 flex flex-col">
        {selectedPromptData ? (
          <>
            {/* Prompt Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedPromptData.type)}
                  <div>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-neon-red"
                      />
                    ) : (
                      <h3 className="font-semibold">{selectedPromptData.title}</h3>
                    )}
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <span>{selectedPromptData.category}</span>
                      <span>•</span>
                      <span className={getDifficultyColor(selectedPromptData.difficulty)}>
                        {selectedPromptData.difficulty}
                      </span>
                      <span>•</span>
                      <span>Used {selectedPromptData.usageCount} times</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(selectedPromptData.rating)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => copyPrompt(selectedPromptData.content)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                    title="Copy prompt to clipboard"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    Copy
                  </button>
                  
                  <button
                    onClick={() => togglePin(selectedPromptData.id)}
                    className={`p-2 rounded transition-colors ${
                      selectedPromptData.isPinned 
                        ? 'text-yellow-400 bg-yellow-400/20' 
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                    title={selectedPromptData.isPinned ? 'Unpin prompt' : 'Pin prompt'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={savePrompt}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(selectedPromptData.title)
                          setEditContent(selectedPromptData.content)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  
                  <button
                    onClick={() => deletePrompt(selectedPromptData.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
                  style={{ borderColor: 'var(--primary-accent)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Enter your prompt content here..."
                />
              ) : (
                <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {selectedPromptData.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Prompt Metadata */}
            <div className="border-t border-gray-800 bg-gray-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <div className="flex items-center mt-1">
                    {getTypeIcon(selectedPromptData.type)}
                    <span className="ml-2 capitalize">{selectedPromptData.type}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <div className="mt-1">{selectedPromptData.created.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-400">Modified:</span>
                  <div className="mt-1">{selectedPromptData.modified.toLocaleDateString()}</div>
                </div>
              </div>
              
              {selectedPromptData.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPromptData.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Prompt Selected</h3>
              <p className="text-gray-500">Select a prompt from the list to view and edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewPromptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>New Prompt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prompt Title</label>
                <input
                  type="text"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Enter prompt title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => setNewPromptCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newPromptType}
                  onChange={(e) => setNewPromptType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                >
                  <option value="user">User</option>
                  <option value="system">System</option>
                  <option value="assistant">Assistant</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={newPromptDifficulty}
                  onChange={(e) => setNewPromptDifficulty(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPromptTags}
                  onChange={(e) => setNewPromptTags(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="ai, automation, scripting"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPromptModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPrompt}
                className="px-4 py-2 rounded transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Create Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  rows={3}
                  placeholder="Category description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                />
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
                className="px-4 py-2 rounded transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}