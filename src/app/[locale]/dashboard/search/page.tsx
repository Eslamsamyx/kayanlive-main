'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/trpc/react';
import {
  Search,
  Filter,
  X,
  Clock,
  TrendingUp,
  FileType,
  Calendar,
  HardDrive,
  Download,
  Eye,
  Heart,
  Loader2,
} from 'lucide-react';
import { AssetType, Visibility, UsageType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [filters, setFilters] = useState({
    type: undefined as AssetType | undefined,
    category: '',
    visibility: undefined as Visibility | undefined,
    usage: undefined as UsageType | undefined,
    uploadedAfter: undefined as Date | undefined,
    uploadedBefore: undefined as Date | undefined,
    minFileSize: undefined as number | undefined,
    maxFileSize: undefined as number | undefined,
    favoritesOnly: false,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  });

  const [page, setPage] = useState(1);

  // Debounce query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search suggestions
  const { data: suggestions } = api.search.getSuggestions.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 && showSuggestions }
  );

  // Search history
  const { data: history } = api.search.getHistory.useQuery({ limit: 10 });

  // Trending searches
  const { data: trending } = api.search.getTrending.useQuery({ limit: 5 });

  // Advanced search
  const { data: searchResults, isLoading } = api.asset.advancedSearch.useQuery(
    {
      query: query || undefined,
      ...filters,
      page,
      limit: 20,
    },
    { enabled: query.length > 0 || Object.values(filters).some(Boolean) }
  );

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: undefined,
      category: '',
      visibility: undefined,
      usage: undefined,
      uploadedAfter: undefined,
      uploadedBefore: undefined,
      minFileSize: undefined,
      maxFileSize: undefined,
      favoritesOnly: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a19] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-[#7afdd6]" />
          <h1 className="text-3xl font-bold">Advanced Search</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search History */}
            <div className="bg-[#2c2c2b] rounded-lg p-4 border border-[#333]">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#7afdd6]" />
                <h3 className="font-semibold">Recent Searches</h3>
              </div>
              <div className="space-y-2">
                {history?.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearch(item.query)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#1a1a19] hover:bg-[#333] transition-colors text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.query}</span>
                      <span className="text-xs text-[#b2b2b2] ml-2">
                        {item.resultCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div className="bg-[#2c2c2b] rounded-lg p-4 border border-[#333]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#7afdd6]" />
                <h3 className="font-semibold">Trending</h3>
              </div>
              <div className="space-y-2">
                {trending?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item.query)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-[#1a1a19] hover:bg-[#333] transition-colors text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.query}</span>
                      <span className="text-xs text-[#b2b2b2] ml-2">
                        {item.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b2b2b2]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search assets by name, title, or description..."
                    className="w-full pl-12 pr-12 py-4 bg-[#1a1a19] border border-[#333] rounded-lg text-white placeholder-[#b2b2b2] focus:outline-none focus:border-[#7afdd6]"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b2b2b2] hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions && (suggestions.assetNames.length > 0 || suggestions.recentSearches.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-[#2c2c2b] border border-[#333] rounded-lg shadow-lg overflow-hidden"
                    >
                      {suggestions.recentSearches.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs text-[#b2b2b2] bg-[#1a1a19]">
                            Recent Searches
                          </div>
                          {suggestions.recentSearches.map((search, index) => (
                            <button
                              key={`recent-${index}`}
                              onClick={() => handleSearch(search)}
                              className="w-full px-4 py-2 text-left hover:bg-[#333] transition-colors flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4 text-[#7afdd6]" />
                              <span>{search}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {suggestions.assetNames.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs text-[#b2b2b2] bg-[#1a1a19]">
                            Asset Names
                          </div>
                          {suggestions.assetNames.map((name, index) => (
                            <button
                              key={`asset-${index}`}
                              onClick={() => handleSearch(name)}
                              className="w-full px-4 py-2 text-left hover:bg-[#333] transition-colors flex items-center gap-2"
                            >
                              <FileType className="w-4 h-4 text-[#7afdd6]" />
                              <span>{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a19] hover:bg-[#333] transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </button>
                {Object.values(filters).some(Boolean) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#7afdd6] hover:text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-[#333] grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* File Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">File Type</label>
                        <select
                          value={filters.type || ''}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value as AssetType || undefined })}
                          className="w-full px-3 py-2 bg-[#1a1a19] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#7afdd6]"
                        >
                          <option value="">All Types</option>
                          {Object.values(AssetType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Visibility */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Visibility</label>
                        <select
                          value={filters.visibility || ''}
                          onChange={(e) => setFilters({ ...filters, visibility: e.target.value as Visibility || undefined })}
                          className="w-full px-3 py-2 bg-[#1a1a19] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#7afdd6]"
                        >
                          <option value="">All</option>
                          {Object.values(Visibility).map((vis) => (
                            <option key={vis} value={vis}>{vis}</option>
                          ))}
                        </select>
                      </div>

                      {/* Favorites Only */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.favoritesOnly}
                          onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                          className="w-4 h-4 rounded bg-[#1a1a19] border-[#333]"
                        />
                        <label className="text-sm">Show Favorites Only</label>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Sort By</label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                          className="w-full px-3 py-2 bg-[#1a1a19] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#7afdd6]"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="updatedAt">Date Updated</option>
                          <option value="name">Name</option>
                          <option value="fileSize">File Size</option>
                          <option value="viewCount">Views</option>
                          <option value="downloadCount">Downloads</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#7afdd6] animate-spin" />
              </div>
            )}

            {!isLoading && searchResults && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#b2b2b2]">
                    Found {searchResults.pagination.total} results
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-[#2c2c2b] rounded-lg p-4 border border-[#333] hover:border-[#7afdd6] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {asset.name || asset.fileName}
                          </h3>
                          <p className="text-sm text-[#b2b2b2] mt-1">
                            {asset.type} " {formatBytes(Number(asset.fileSize))}
                          </p>
                        </div>
                        {asset.isFavorite && (
                          <Heart className="w-5 h-5 text-[#7afdd6] fill-[#7afdd6]" />
                        )}
                      </div>

                      {asset.description && (
                        <p className="text-sm text-[#b2b2b2] mb-3 line-clamp-2">
                          {asset.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-[#b2b2b2]">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{asset.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{asset.downloadCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-[#2c2c2b] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-[#b2b2b2]">
                      Page {page} of {searchResults.pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === searchResults.pagination.pages}
                      className="px-4 py-2 rounded-lg bg-[#2c2c2b] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !searchResults && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-[#b2b2b2] mx-auto mb-4" />
                <p className="text-[#b2b2b2]">Enter a search query or apply filters to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
