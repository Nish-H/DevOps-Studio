'use client';

import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Tag, Wrench, X, ArrowLeft, Star, FileCode, Filter } from 'lucide-react';
import { solutionsRegistry, getCategories, searchSolutions, filterByCategory, filterByDifficulty, type SolutionMetadata } from '../solutions/registry';
import SFTPConnectionGuide from '../solutions/SFTPConnectionGuide';
import SSHKeyGuide from '../solutions/SSHKeyGuide';

const TSXSolutions = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [activeSolution, setActiveSolution] = useState<SolutionMetadata | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', ...getCategories()];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filtered solutions based on search and filters
  const filteredSolutions = useMemo(() => {
    let results = solutionsRegistry;

    if (searchQuery) {
      results = searchSolutions(searchQuery);
    }

    if (selectedCategory !== 'All') {
      results = results.filter(s => s.category === selectedCategory);
    }

    if (selectedDifficulty !== 'All') {
      results = results.filter(s => s.difficulty === selectedDifficulty);
    }

    return results;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Dynamic component rendering
  const renderSolution = (solution: SolutionMetadata) => {
    switch (solution.component) {
      case 'SFTPConnectionGuide':
        return <SFTPConnectionGuide />;
      case 'SSHKeyGuide':
        return <SSHKeyGuide />;
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <FileCode size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Solution component not found</p>
          </div>
        );
    }
  };

  // Difficulty badge colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // If a solution is active, render it in full screen
  if (activeSolution) {
    return (
      <div className="h-full flex flex-col">
        {/* Solution Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={() => setActiveSolution(null)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Solutions</span>
          </button>
          <div className="text-right">
            <h2 className="font-bold text-white">{activeSolution.title}</h2>
            <p className="text-xs text-gray-400">{activeSolution.category} • v{activeSolution.version}</p>
          </div>
        </div>

        {/* Solution Content - Full Rendering */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {renderSolution(activeSolution)}
        </div>
      </div>
    );
  }

  // Solutions browser view
  return (
    <div className="h-full flex flex-col p-6 bg-gray-900">
      {/* Version Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench size={28} style={{ color: 'var(--primary-accent)' }} />
            TSX Solutions Library
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Interactive tools and guides for system administration and development
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>DevOps Studio v1.2.4</span>
          <span>•</span>
          <span>TSX Solutions</span>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search solutions by title, description, tags, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-accent)]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2.5 transition-colors ${
                viewMode === 'grid' ? 'bg-[var(--primary-accent)] text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2.5 transition-colors ${
                viewMode === 'list' ? 'bg-[var(--primary-accent)] text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-[var(--primary-accent)] border-[var(--primary-accent)] text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--primary-accent)]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--primary-accent)]"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-400">Active filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded flex items-center gap-1">
                    {selectedCategory}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedDifficulty !== 'All' && (
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded flex items-center gap-1">
                    {selectedDifficulty}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedDifficulty('All')} />
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded flex items-center gap-1">
                    Search: {searchQuery}
                    <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-400">
          {filteredSolutions.length} {filteredSolutions.length === 1 ? 'solution' : 'solutions'} found
        </div>
      </div>

      {/* Solutions Grid/List */}
      <div className="flex-1 overflow-auto">
        {filteredSolutions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCode size={48} className="mx-auto mb-4 text-gray-600" />
            <p>No solutions found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSolutions.map(solution => (
              <div
                key={solution.id}
                onClick={() => setActiveSolution(solution)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-[var(--primary-accent)] cursor-pointer transition-all hover:shadow-lg hover:shadow-[var(--primary-accent)]/20"
              >
                {/* Featured Badge */}
                {solution.featured && (
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mb-2">
                    <Star size={14} fill="currentColor" />
                    <span>Featured</span>
                  </div>
                )}

                {/* Title and Version */}
                <h3 className="font-bold text-white text-lg mb-2">{solution.title}</h3>
                <p className="text-xs text-gray-400 mb-3">v{solution.version}</p>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{solution.description}</p>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Tag size={14} />
                    <span>{solution.category}</span>
                  </div>
                  <div className={`inline-block px-2 py-1 text-xs border rounded ${getDifficultyColor(solution.difficulty)}`}>
                    {solution.difficulty}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {solution.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                  {solution.tags.length > 4 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{solution.tags.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSolutions.map(solution => (
              <div
                key={solution.id}
                onClick={() => setActiveSolution(solution)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-[var(--primary-accent)] cursor-pointer transition-all flex gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {solution.featured && <Star size={16} className="text-yellow-500" fill="currentColor" />}
                      <h3 className="font-bold text-white">{solution.title}</h3>
                      <span className="text-xs text-gray-500">v{solution.version}</span>
                    </div>
                    <div className={`px-2 py-1 text-xs border rounded ${getDifficultyColor(solution.difficulty)}`}>
                      {solution.difficulty}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{solution.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Tag size={14} />
                      <span>{solution.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {solution.tags.slice(0, 6).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                      {solution.tags.length > 6 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{solution.tags.length - 6}
                        </span>
                      )}
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

export default TSXSolutions;
