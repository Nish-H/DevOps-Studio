'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Plus, Folder, Tag, Download, Upload, Eye, Edit2, Trash2, X, Save, Star, Archive, Clock, Filter, Grid, List, BookOpen, FileCode, Image as ImageIcon, File, Cloud, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import * as back4app from '../../lib/back4appService';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  type: 'SOP' | 'SOW' | 'Guide' | 'Diagram' | 'Template' | 'Technical' | 'Other';
  version: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Archived';
  lastModified: string;
  createdDate: string;
  isPinned: boolean;
  isArchived: boolean;
  author: string;
  thumbnail?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

const DocumentationHubCloud = () => {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from Back4App cloud
  const loadFromCloud = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const [cloudDocs, cloudCats] = await Promise.all([
        back4app.getDocuments(),
        back4app.getDocCategories()
      ]);

      if (cloudDocs.length > 0) {
        setDocuments(cloudDocs as any);
      }

      if (cloudCats.length > 0) {
        setCategories(cloudCats as any);
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //  Cloud data initialization
  useEffect(() => {
    if (isAuthenticated) {
      loadFromCloud();
    } else {
      // Fallback to localStorage for demo
      const savedDocs = localStorage.getItem('nishen-workspace-documentation');
      const savedCats = localStorage.getItem('nishen-workspace-doc-categories');

    let loadedDocs: Document[] = [];
    let loadedCats: Category[] = [];

    if (savedDocs) {
      loadedDocs = JSON.parse(savedDocs);
    }

    if (savedCats) {
      loadedCats = JSON.parse(savedCats);
    }

    // Ensure default categories exist
    const defaultCategories = [
      { id: 'cat-1', name: 'Operations', color: '#3B82F6', count: 0 },
      { id: 'cat-2', name: 'Projects', color: '#10B981', count: 0 },
      { id: 'cat-3', name: 'Technical', color: '#8B5CF6', count: 0 },
      { id: 'cat-4', name: 'Business', color: '#F59E0B', count: 0 },
      { id: 'cat-5', name: 'Templates', color: '#EC4899', count: 0 }
    ];

    defaultCategories.forEach(defaultCat => {
      if (!loadedCats.some(cat => cat.name === defaultCat.name)) {
        loadedCats.push(defaultCat);
      }
    });

    // Add demo documentation if none exists
    if (loadedDocs.length === 0) {
      const demoDocs: Document[] = [
        {
          id: 'doc-1',
          title: 'Server Maintenance SOP',
          content: `# Server Maintenance Standard Operating Procedure

## Purpose
This SOP defines the standard procedures for maintaining production servers.

## Scope
Applies to all Windows and Linux production servers.

## Procedure

### Daily Checks
1. Verify server uptime and availability
2. Check disk space usage (alert if >80%)
3. Review system logs for errors
4. Monitor CPU and memory usage

### Weekly Tasks
- Apply security patches
- Review backup logs
- Update documentation
- Performance analysis

### Monthly Reviews
- Capacity planning
- Security audit
- Disaster recovery testing

## Escalation
Contact DevOps Lead if critical issues arise.

**Last Updated:** ${new Date().toLocaleDateString()}
**Version:** 1.2.0`,
          category: 'Operations',
          tags: ['SOP', 'Servers', 'Maintenance', 'Infrastructure'],
          type: 'SOP',
          version: '1.2.0',
          status: 'Approved',
          lastModified: new Date().toISOString(),
          createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          isArchived: false,
          author: 'Nishen H.'
        },
        {
          id: 'doc-2',
          title: 'Cloud Migration Project - SOW',
          content: `# Statement of Work: Cloud Migration Project

## Project Overview
Migration of on-premises infrastructure to Azure cloud platform.

## Objectives
- Migrate 50+ VMs to Azure
- Implement high availability
- Reduce infrastructure costs by 30%
- Zero downtime migration

## Scope of Work

### Phase 1: Assessment (Weeks 1-2)
- Infrastructure inventory
- Dependency mapping
- Cost analysis
- Risk assessment

### Phase 2: Planning (Weeks 3-4)
- Architecture design
- Migration strategy
- Resource provisioning
- Security configuration

### Phase 3: Execution (Weeks 5-10)
- Pilot migration (10 VMs)
- Production migration
- Data synchronization
- Validation testing

### Phase 4: Optimization (Weeks 11-12)
- Performance tuning
- Cost optimization
- Documentation
- Knowledge transfer

## Deliverables
1. Migration runbook
2. Architecture diagrams
3. Cost analysis report
4. Post-migration support (30 days)

## Timeline
12 weeks from project kickoff

## Budget
$150,000 - $200,000

**Status:** In Progress
**Start Date:** ${new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
          category: 'Projects',
          tags: ['SOW', 'Cloud', 'Azure', 'Migration', 'Project'],
          type: 'SOW',
          version: '2.0.0',
          status: 'Review',
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          isArchived: false,
          author: 'Nishen H.'
        },
        {
          id: 'doc-3',
          title: 'PowerShell Automation Guide',
          content: `# PowerShell Automation Best Practices

## Introduction
Comprehensive guide for writing robust PowerShell automation scripts.

## Core Principles

### 1. Error Handling
\`\`\`powershell
try {
    # Your code here
    Get-Service -Name "NonExistent" -ErrorAction Stop
}
catch {
    Write-Error "Service not found: $_"
    # Logging logic
}
finally {
    # Cleanup code
}
\`\`\`

### 2. Parameter Validation
\`\`\`powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string]$ServerName,

    [ValidateRange(1,65535)]
    [int]$Port = 443
)
\`\`\`

### 3. Logging
Always implement comprehensive logging:
- Timestamp all events
- Log levels: INFO, WARN, ERROR
- Rotate log files
- Central log repository

### 4. Idempotency
Scripts should be safe to run multiple times.

### 5. Documentation
- Inline comments for complex logic
- Function documentation with examples
- README for script collections

## Common Patterns

### Service Management
\`\`\`powershell
$service = Get-Service -Name "MyService"
if ($service.Status -ne 'Running') {
    Start-Service -Name "MyService"
}
\`\`\`

### Remote Execution
\`\`\`powershell
Invoke-Command -ComputerName Server01 -ScriptBlock {
    Get-EventLog -LogName System -Newest 10
}
\`\`\`

## Security Guidelines
- Never hardcode credentials
- Use credential objects
- Implement least privilege
- Audit script execution

**Version:** 3.1.0
**Last Updated:** ${new Date().toLocaleDateString()}`,
          category: 'Technical',
          tags: ['PowerShell', 'Automation', 'Scripting', 'Guide', 'Best Practices'],
          type: 'Guide',
          version: '3.1.0',
          status: 'Approved',
          lastModified: new Date().toISOString(),
          createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: false,
          isArchived: false,
          author: 'Nishen H.'
        },
        {
          id: 'doc-4',
          title: 'Network Architecture Diagram Template',
          content: `# Network Architecture Diagram Template

## Usage
This template provides a standardized format for documenting network architectures.

## Required Components

### 1. Network Zones
- **DMZ**: Public-facing services
- **Internal**: Corporate network
- **Management**: Admin access only
- **Guest**: Visitor access

### 2. Security Layers
- Firewall rules documentation
- VPN configurations
- Access control lists
- Intrusion detection systems

### 3. IP Addressing
\`\`\`
Production VLAN: 10.10.10.0/24
Management VLAN: 10.10.20.0/24
Guest VLAN: 10.10.30.0/24
\`\`\`

### 4. Key Services
- DNS servers
- DHCP scope
- Load balancers
- Proxy servers

## Diagram Elements
Use standard symbols:
- 🔥 Firewall
- 🔀 Switch
- 📡 Router
- ☁️ Cloud services
- 🖥️ Servers
- 💻 Workstations

## Documentation Requirements
1. Logical topology
2. Physical topology
3. IP addressing scheme
4. VLAN configuration
5. Routing protocols
6. Security policies

**Template Version:** 1.0.0
**Use Case:** All network implementation projects`,
          category: 'Templates',
          tags: ['Template', 'Network', 'Architecture', 'Diagram', 'Infrastructure'],
          type: 'Template',
          version: '1.0.0',
          status: 'Approved',
          lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: false,
          isArchived: false,
          author: 'Nishen H.'
        }
      ];

      loadedDocs = demoDocs;
    }

    setDocuments(loadedDocs);
    setCategories(loadedCats);
  }, []);

  // Auth listener - reload on login
  useEffect(() => {
    if (isAuthenticated) {
      loadFromCloud();
    }
  }, [isAuthenticated]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let result = documents.filter(doc => !doc.isArchived);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
        doc.author.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(doc => doc.category === selectedCategory);
    }

    if (selectedType !== 'All') {
      result = result.filter(doc => doc.type === selectedType);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(doc => doc.status === selectedStatus);
    }

    // Pinned documents first
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

    return result;
  }, [documents, searchQuery, selectedCategory, selectedType, selectedStatus]);

  const handleCreateDocument = async () => {
    if (!isAuthenticated) {
      alert('Please log in to create documents');
      return;
    }

    setIsSyncing(true);
    try {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        title: 'New Document',
        content: '# New Document\n\nStart writing your documentation here...',
        category: selectedCategory === 'All' ? categories[0]?.name || 'Operations' : selectedCategory,
        tags: [],
        type: 'Other',
        version: '1.0.0',
        status: 'Draft',
        lastModified: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        isPinned: false,
        isArchived: false,
        author: user?.username || 'User'
      };

      const created = await back4app.createDocument(newDoc as any);
      setDocuments(prev => [created as any, ...prev]);
      setActiveDocument(created as any);
      setIsEditing(true);
      setEditContent(created.content);
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!activeDocument || !isAuthenticated) return;

    setIsSyncing(true);
    try {
      const updated = await back4app.updateDocument(activeDocument.id!, {
        content: editContent,
        lastModified: new Date().toISOString()
      });

      setDocuments(prev => prev.map(doc =>
        doc.id === activeDocument.id ? updated as any : doc
      ));
      setActiveDocument(updated as any);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    if (!isAuthenticated) return;

    setIsSyncing(true);
    try {
      await back4app.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      if (activeDocument?.id === docId) {
        setActiveDocument(null);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTogglePin = async (docId: string) => {
    if (!isAuthenticated) return;

    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setIsSyncing(true);
    try {
      const updated = await back4app.updateDocument(docId, {
        isPinned: !doc.isPinned
      });

      setDocuments(prev => prev.map(d =>
        d.id === docId ? updated as any : d
      ));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ documents, categories }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documentation-hub-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SOP': return <FileText className="text-blue-600" size={20} />;
      case 'SOW': return <FileCode className="text-green-600" size={20} />;
      case 'Guide': return <BookOpen className="text-purple-600" size={20} />;
      case 'Diagram': return <ImageIcon className="text-orange-600" size={20} />;
      case 'Template': return <File className="text-pink-600" size={20} />;
      case 'Technical': return <FileCode className="text-indigo-600" size={20} />;
      default: return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Review': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'Archived': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Document viewer
  if (activeDocument) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        {/* Document Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { setActiveDocument(null); setIsEditing(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
            >
              <X size={18} />
              Close
            </button>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white flex items-center gap-2"
                  >
                    <Eye size={18} />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </button>
                  <button
                    onClick={() => { setIsEditing(true); setEditContent(activeDocument.content); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => { setIsEditing(false); setEditContent(''); }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDocument}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-white flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{activeDocument.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  {getTypeIcon(activeDocument.type)}
                  {activeDocument.type}
                </span>
                <span>v{activeDocument.version}</span>
                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(activeDocument.status)}`}>
                  {activeDocument.status}
                </span>
                <span>{activeDocument.category}</span>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>Last modified: {new Date(activeDocument.lastModified).toLocaleString()}</div>
              <div>By: {activeDocument.author}</div>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full p-4 bg-white border border-gray-300 rounded font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
              placeholder="Write your documentation in Markdown..."
            />
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: activeDocument.content.replace(/\n/g, '<br>').replace(/#{1,6} /g, match => `<h${match.length - 1}>`).replace(/<h(\d)>/g, (_, level) => `<h${level} class="text-${4 - parseInt(level)}xl font-bold mt-6 mb-3 text-gray-800">`) }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main documentation list
  return (
    <div className="h-full flex flex-col p-6 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen size={28} style={{ color: 'var(--primary-accent)' }} />
            Documentation Hub
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Centralized repository for SOPs, SOWs, guides, and technical documentation
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>DevOps Studio v1.2.4</span>
          <span>•</span>
          <span>Documentation Hub</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search documentation by title, content, tags, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-accent)]"
            />
          </div>

          <button
            onClick={handleCreateDocument}
            className="px-4 py-2.5 bg-[var(--primary-accent)] hover:opacity-90 rounded-lg text-white font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            New Document
          </button>

          <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-accent)] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-[var(--primary-accent)] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border transition-colors ${showFilters ? 'bg-[var(--primary-accent)] border-[var(--primary-accent)] text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
          >
            <Filter size={18} />
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <Download size={18} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--primary-accent)]"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--primary-accent)]"
                >
                  <option value="All">All Types</option>
                  <option value="SOP">SOP</option>
                  <option value="SOW">SOW</option>
                  <option value="Guide">Guide</option>
                  <option value="Diagram">Diagram</option>
                  <option value="Template">Template</option>
                  <option value="Technical">Technical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--primary-accent)]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-400">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
        </div>
      </div>

      {/* Documents Grid/List */}
      <div className="flex-1 overflow-auto">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No documents found</p>
            <button
              onClick={handleCreateDocument}
              className="mt-4 px-4 py-2 bg-[var(--primary-accent)] hover:opacity-90 rounded transition-colors text-white"
            >
              Create First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => setActiveDocument(doc)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-[var(--primary-accent)] cursor-pointer transition-all hover:shadow-lg hover:shadow-[var(--primary-accent)]/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(doc.type)}
                    {doc.isPinned && <Star size={16} className="text-yellow-500" fill="currentColor" />}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(doc.id); }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Star size={16} className={doc.isPinned ? 'text-yellow-500 fill-current' : 'text-gray-500'} />
                  </button>
                </div>

                <h3 className="font-bold text-white text-lg mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{doc.content.substring(0, 100)}...</p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Folder size={14} />
                    <span>{doc.category}</span>
                  </div>
                  <div className={`inline-block px-2 py-1 text-xs border rounded ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={12} />
                  v{doc.version} • {new Date(doc.lastModified).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => setActiveDocument(doc)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-[var(--primary-accent)] cursor-pointer transition-all flex gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(doc.type)}
                      {doc.isPinned && <Star size={16} className="text-yellow-500" fill="currentColor" />}
                      <h3 className="font-bold text-white">{doc.title}</h3>
                      <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(doc.id); }}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Star size={16} className={doc.isPinned ? 'text-yellow-500 fill-current' : 'text-gray-500'} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{doc.content.substring(0, 150)}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Folder size={14} />
                      {doc.category}
                    </span>
                    <span>v{doc.version}</span>
                    <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {doc.tags.slice(0, 5).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationHubCloud;
