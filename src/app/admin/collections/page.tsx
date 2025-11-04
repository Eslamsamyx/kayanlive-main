'use client';

import { api } from '@/trpc/react';
import { FolderHeart, Image, Users, Lock, Globe, Pin, Search, Loader2, Calendar, Eye, Plus, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublic, setFilterPublic] = useState<boolean | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    isPublic: false,
    isPinned: false,
    assetIds: [] as string[],
  });
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // Fetch available assets for selection
  const { data: assetsData } = api.asset.list.useQuery({
    search: assetSearchQuery || undefined,
    limit: 50,
  });

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingCover(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Set the uploaded image URL
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      setCoverImagePreview(data.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
    setCoverImagePreview(null);
  };

  const { data: collections, isLoading, refetch } = api.collection.listAll.useQuery({
    search: searchQuery || undefined,
    isPublic: filterPublic,
  });

  const { data: stats } = api.collection.getStats.useQuery();

  const createMutation = api.collection.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        coverImage: '',
        isPublic: false,
        isPinned: false,
        assetIds: [],
      });
      setAssetSearchQuery('');
      setCoverImagePreview(null);
    },
  });

  const toggleAssetSelection = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter(id => id !== assetId)
        : [...prev.assetIds, assetId]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading collections...</p>
        </div>
      </div>
    );
  }

  const collectionList = collections?.collections || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1
          className="text-4xl md:text-6xl font-normal mb-4 capitalize"
          style={{
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif',
            lineHeight: '1.1'
          }}
        >
          Collections
        </h1>
        <p className="text-[#888888] text-lg">
          Organize and manage asset collections
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Collections" value={stats?.total || 0} icon={<FolderHeart size={24} />} gradient="#7afdd6, #b8a4ff" />
        <StatCard title="Public" value={stats?.public || 0} icon={<Globe size={24} />} gradient="#b8a4ff, #7afdd6" />
        <StatCard title="Private" value={stats?.private || 0} icon={<Lock size={24} />} gradient="#7afdd6, #A095E1" />
        <StatCard title="Pinned" value={stats?.pinned || 0} icon={<Pin size={24} />} gradient="#A095E1, #7afdd6" />
      </div>

      {/* Create Button and Search/Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Create Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Plus size={20} />
          Create Collection
        </button>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterPublic(undefined)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              filterPublic === undefined
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            All
          </button>
          <button
            onClick={() => setFilterPublic(true)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              filterPublic === true
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Public
          </button>
          <button
            onClick={() => setFilterPublic(false)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              filterPublic === false
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Private
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectionList.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>

      {!collectionList.length && (
        <div
          className="rounded-[25px] p-12 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.2)'
          }}
        >
          <FolderHeart size={64} className="mx-auto text-[#888888] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
            No collections found
          </h3>
          <p className="text-[#888888]">
            {searchQuery ? 'Try adjusting your search' : 'Create your first collection to get started'}
          </p>
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl rounded-[25px] p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(42, 42, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Create Collection
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#888888]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Campaign 2024"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this collection..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors resize-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Cover Image
                  <span className="text-xs text-[#888888] ml-2">(Recommended: 1200x600px)</span>
                </label>

                {coverImagePreview || formData.coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#7afdd6]/20">
                    <img
                      src={coverImagePreview || formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white">
                      1200x600px recommended
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      disabled={isUploadingCover}
                      className="hidden"
                    />
                    <div
                      className="w-full h-48 rounded-xl border-2 border-dashed border-[#7afdd6]/30 bg-[#2a2a2a] hover:border-[#7afdd6] hover:bg-[#3a3a3a] transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 className="animate-spin text-[#7afdd6]" size={32} />
                          <p className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                            Uploading...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]">
                            <Upload size={24} className="text-[#2c2c2b]" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              Click to upload cover image
                            </p>
                            <p className="text-xs text-[#888888]">
                              Recommended: 1200x600px • Max 5MB
                            </p>
                            <p className="text-xs text-[#888888] mt-1">
                              JPG, PNG, WebP
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPublic ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]' : 'bg-[#3a3a3a]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Public
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPinned ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]' : 'bg-[#3a3a3a]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPinned ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Pinned
                  </span>
                </label>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Add Assets ({formData.assetIds.length} selected)
                </label>

                {/* Asset Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" size={16} />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#2a2a2a] text-white text-sm border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </div>

                {/* Asset List */}
                <div className="max-h-48 overflow-y-auto rounded-lg bg-[#2a2a2a] border border-[#7afdd6]/10">
                  {assetsData?.assets && assetsData.assets.length > 0 ? (
                    <div className="divide-y divide-[#7afdd6]/10">
                      {assetsData.assets.map((asset) => (
                        <label
                          key={asset.id}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              formData.assetIds.includes(asset.id)
                                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] border-transparent'
                                : 'border-[#7afdd6]/30 bg-[#3a3a3a]'
                            }`}
                            onClick={() => toggleAssetSelection(asset.id)}
                          >
                            {formData.assetIds.includes(asset.id) && (
                              <svg className="w-3 h-3 text-[#2c2c2b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Image size={14} className="text-[#7afdd6] flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{asset.name}</p>
                              <p className="text-xs text-[#888888] truncate">{asset.type}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-[#888888]">
                      {assetSearchQuery ? 'No assets found' : 'No assets available'}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.name.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionCard({ collection }: { collection: any }) {
  return (
    <Link href={`/admin/collections/${collection.id}`}>
      <div
        className="rounded-[25px] overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
        }}
      >
      {/* Cover Image or Placeholder */}
      <div
        className="h-48 relative overflow-hidden"
        style={{
          background: collection.coverImage
            ? `url(${collection.coverImage})`
            : 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)'
        }}
      >
        {!collection.coverImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderHeart size={64} className="text-[#2c2c2b] opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {collection.isPinned && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 backdrop-blur-sm flex items-center gap-1">
              <Pin size={12} />
              Pinned
            </span>
          )}
          {collection.isPublic ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20 backdrop-blur-sm flex items-center gap-1">
              <Globe size={12} />
              Public
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/20 backdrop-blur-sm flex items-center gap-1">
              <Lock size={12} />
              Private
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2 truncate" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {collection.name}
        </h3>

        {collection.description && (
          <p className="text-sm text-[#888888] mb-4 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-[#888888] mb-4">
          <div className="flex items-center gap-1">
            <Image size={14} className="text-[#7afdd6]" />
            <span>{collection._count.assets} assets</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-[#7afdd6]" />
            <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 pt-4 border-t border-[#7afdd6]/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center">
            <Users size={12} className="text-[#2c2c2b]" />
          </div>
          <span className="text-xs text-[#888888]">
            {collection.createdBy.name || collection.createdBy.email}
          </span>
        </div>
      </div>
      </div>
    </Link>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: number; icon: React.ReactNode; gradient: string }) {
  return (
    <div
      className="rounded-[25px] p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" />

      <div className="flex items-center justify-between relative z-10">
        <div className="p-4 rounded-[18px]" style={{
          background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`,
          boxShadow: `0 8px 16px ${gradient.split(',')[0]}40`
        }}>
          <div className="text-[#1a1a19]">{icon}</div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
