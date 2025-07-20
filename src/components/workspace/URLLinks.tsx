'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { createBulletproofStorage } from '../../lib/bulletproofStorage';
import ContactDetails from './ContactDetails';
import { 
  Link, 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Tag,
  Globe,
  Image,
  Music,
  Settings,
  Bot,
  Wrench,
  Zap,
  Shield,
  Star,
  StarOff
} from 'lucide-react';

interface URLLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  dateAdded: string;
  lastAccessed?: string;
  accessCount: number;
}

interface URLCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const defaultCategories: URLCategory[] = [
  { id: 'web', name: 'Web', description: 'General websites', color: '#3B82F6', icon: 'Globe' },
  { id: 'image', name: 'Images', description: 'Image resources', color: '#10B981', icon: 'Image' },
  { id: 'media', name: 'Media', description: 'Video and audio', color: '#8B5CF6', icon: 'Music' },
  { id: 'admin', name: 'Admin', description: 'Admin panels', color: '#EF4444', icon: 'Settings' },
  { id: 'ai', name: 'AI', description: 'AI tools and services', color: '#F59E0B', icon: 'Bot' },
  { id: 'tools', name: 'Tools', description: 'Development tools', color: '#06B6D4', icon: 'Wrench' },
  { id: 'tech', name: 'Latest Tech', description: 'Latest technology', color: '#EC4899', icon: 'Zap' },
  { id: 'audit', name: 'Audit', description: 'Security and auditing', color: '#84CC16', icon: 'Shield' }
];

const iconMap = {
  Globe, Image, Music, Settings, Bot, Wrench, Zap, Shield, Tag
};

export default function URLLinks() {
  const { settings } = useSettings();
  const [links, setLinks] = useState<URLLink[]>([]);
  const [categories, setCategories] = useState<URLCategory[]>(defaultCategories);
  
  // Use standard localStorage for consistency with other modules
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingLink, setEditingLink] = useState<URLLink | null>(null);
  const [editingCategory, setEditingCategory] = useState<URLCategory | null>(null);

  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    category: 'web',
    tags: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Tag'
  });

  useEffect(() => {
    const savedLinks = localStorage.getItem('nishen-workspace-url-links');
    const savedCategories = localStorage.getItem('nishen-workspace-url-categories');
    
    // Load saved links with safe parsing
    let parsedLinks: URLLink[] = [];
    if (savedLinks) {
      try {
        parsedLinks = JSON.parse(savedLinks);
      } catch (error) {
        console.warn('Failed to parse saved links, using empty array:', error);
        parsedLinks = [];
      }
    }
    
    // Load saved categories with safe parsing
    let parsedCategories: URLCategory[] = defaultCategories;
    if (savedCategories) {
      try {
        parsedCategories = JSON.parse(savedCategories);
        // Always ensure default categories exist
        const existingCategoryIds = new Set(parsedCategories.map(cat => cat.id));
        defaultCategories.forEach(defaultCat => {
          if (!existingCategoryIds.has(defaultCat.id)) {
            parsedCategories.push(defaultCat);
          }
        });
      } catch (error) {
        console.warn('Failed to parse saved categories, using defaults:', error);
        parsedCategories = defaultCategories;
      }
    }
    
    setLinks(parsedLinks);
    setCategories(parsedCategories);
  }, []);

  useEffect(() => {
    // Save links to localStorage whenever links change
    localStorage.setItem('nishen-workspace-url-links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('nishen-workspace-url-categories', JSON.stringify(categories));
  }, [categories]);

  const addLink = () => {
    if (newLink.title && newLink.url) {
      const link: URLLink = {
        id: Date.now().toString(),
        title: newLink.title,
        url: newLink.url,
        description: newLink.description,
        category: newLink.category,
        tags: newLink.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isFavorite: false,
        dateAdded: new Date().toISOString(),
        accessCount: 0
      };
      
      setLinks([...links, link]);
      setNewLink({ title: '', url: '', description: '', category: 'web', tags: '' });
      setIsAddingLink(false);
    }
  };

  const addCategory = () => {
    if (newCategory.name) {
      const category: URLCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon
      };
      
      setCategories([...categories, category]);
      setNewCategory({ name: '', description: '', color: '#3B82F6', icon: 'Tag' });
      setIsAddingCategory(false);
    }
  };

  const updateLink = (updatedLink: URLLink) => {
    setLinks(links.map(link => link.id === updatedLink.id ? updatedLink : link));
    setEditingLink(null);
  };

  const updateCategory = (updatedCategory: URLCategory) => {
    setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    setEditingCategory(null);
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const deleteCategory = (id: string) => {
    if (defaultCategories.find(cat => cat.id === id)) {
      alert('Cannot delete default categories');
      return;
    }
    setCategories(categories.filter(cat => cat.id !== id));
    setLinks(links.map(link => link.category === id ? { ...link, category: 'web' } : link));
  };

  const toggleFavorite = (id: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, isFavorite: !link.isFavorite } : link
    ));
  };

  const openURL = (link: URLLink) => {
    const updatedLink = {
      ...link,
      lastAccessed: new Date().toISOString(),
      accessCount: link.accessCount + 1
    };
    updateLink(updatedLink);
    window.open(link.url, '_blank');
  };

  const copyURL = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || link.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Tag;
    return IconComponent;
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <ContactDetails />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          DevOps Studio v0.1.1 - URL Links
        </h1>
        <p className="text-gray-400">
          Manage and organize your important URLs with categories and search functionality
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search links..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Favorites Only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const IconComponent = getCategoryIcon(category.icon);
                const categoryCount = links.filter(link => link.category === category.id).length;
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                      <span className="text-sm">{category.name}</span>
                      <span className="text-xs text-gray-400">({categoryCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      {!defaultCategories.find(cat => cat.id === category.id) && (
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 hover:bg-gray-700 rounded text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              URL Links ({filteredLinks.length})
            </h2>
            <button
              onClick={() => setIsAddingLink(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </button>
          </div>

          <div 
            className="space-y-3 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {filteredLinks.map(link => {
              const category = categories.find(cat => cat.id === link.category);
              const IconComponent = category ? getCategoryIcon(category.icon) : Tag;
              
              return (
                <div key={link.id} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Left side - Title and URL */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white truncate">{link.title}</h3>
                        <button
                          onClick={() => toggleFavorite(link.id)}
                          className={`p-1 rounded ${link.isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                        >
                          {link.isFavorite ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <IconComponent className="h-3 w-3" style={{ color: category?.color }} />
                          <span>{category?.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Link className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        <span className="text-blue-400 font-mono truncate">{link.url}</span>
                        {link.description && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-300 truncate">{link.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Stats and Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {/* Compact Stats */}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{link.accessCount}×</span>
                        <span>{new Date(link.dateAdded).toLocaleDateString()}</span>
                        {link.tags.length > 0 && (
                          <div className="flex gap-1">
                            {link.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-1 py-0.5 bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {link.tags.length > 2 && (
                              <span className="text-gray-500">+{link.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openURL(link)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                          title="Open URL"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => copyURL(link.url)}
                          className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded text-white"
                          title="Copy URL"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                          title="Edit Link"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                          title="Delete Link"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredLinks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Link className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No links found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters, or add a new link.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter link title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newLink.tags}
                  onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddingLink(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(iconMap).map(iconName => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input
                  type="url"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingLink.description}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editingLink.category}
                  onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingLink.tags.join(', ')}
                  onChange={(e) => setEditingLink({ 
                    ...editingLink, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingLink(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updateLink(editingLink)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Update Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={editingCategory.color}
                  onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <select
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(iconMap).map(iconName => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updateCategory(editingCategory)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}