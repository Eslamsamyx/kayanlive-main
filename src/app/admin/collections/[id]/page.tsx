'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useRouter, useParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Lock,
  Globe,
  Image as ImageIcon,
  Loader2,
  X,
  GripVertical,
  Calendar,
  User,
  Pin,
  FolderHeart,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SortableAssetCard from '@/components/collections/sortable-asset-card';

export default function AdminCollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [orderedAssets, setOrderedAssets] = useState<any[]>([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [removingAssetId, setRemovingAssetId] = useState<string | null>(null);
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    isPublic: false,
    isPinned: false,
  });

  const utils = api.useUtils();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch collection details with assets
  const { data: collection, isLoading, error, refetch } = api.collection.getById.useQuery(
    { id: collectionId },
    { enabled: !!collectionId }
  );

  // Fetch available assets for adding
  const { data: assetsData } = api.asset.list.useQuery({
    search: assetSearchQuery || undefined,
    limit: 50,
  });

  // Delete collection mutation
  const deleteMutation = api.collection.delete.useMutation({
    onSuccess: () => {
      router.push('/admin/collections');
    },
  });

  // Update collection mutation
  const updateMutation = api.collection.update.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
      setShowEditModal(false);
    },
  });

  // Remove asset from collection mutation
  const removeAssetMutation = api.collection.removeAsset.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
      setRemovingAssetId(null);
    },
    onError: () => {
      setRemovingAssetId(null);
    },
  });

  // Download mutation
  const downloadMutation = api.asset.getDownloadUrl.useMutation();

  // Add assets mutation
  const batchAddAssetsMutation = api.collection.batchAddAssets.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
      setShowAddAssetsModal(false);
      setSelectedAssetIds([]);
      setAssetSearchQuery('');
    },
  });

  // Reorder assets mutation
  const reorderMutation = api.collection.reorderAssets.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
    },
  });

  // Update ordered assets when collection data changes
  useEffect(() => {
    if (collection?.assets) {
      const sorted = [...collection.assets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setOrderedAssets(sorted);
    }
  }, [collection]);

  // Update edit form when collection loads
  useEffect(() => {
    if (collection) {
      setEditFormData({
        name: collection.name,
        description: collection.description || '',
        coverImage: collection.coverImage || '',
        isPublic: collection.isPublic,
        isPinned: collection.isPinned,
      });
    }
  }, [collection]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedAssets.findIndex((asset) => asset.id === active.id);
      const newIndex = orderedAssets.findIndex((asset) => asset.id === over.id);

      const newOrder = arrayMove(orderedAssets, oldIndex, newIndex);
      setOrderedAssets(newOrder);

      // Update positions in database
      const assetPositions = newOrder.map((asset, index) => ({
        assetId: asset.id,
        position: index,
      }));

      reorderMutation.mutate({
        collectionId,
        assetPositions,
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: collectionId });
  };

  const handleRemoveAsset = (assetId: string) => {
    setRemovingAssetId(assetId);
    removeAssetMutation.mutate({
      collectionId,
      assetId,
    });
  };

  const handleDownload = async (assetId: string) => {
    setDownloadingAssetId(assetId);
    try {
      const result = await downloadMutation.mutateAsync({ assetId });
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingAssetId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: collectionId,
      ...editFormData,
    });
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAddAssets = () => {
    if (selectedAssetIds.length === 0) return;

    batchAddAssetsMutation.mutate({
      collectionId,
      assetIds: selectedAssetIds,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Loading collection...
          </p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FolderHeart className="h-16 w-16 text-[#888888] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Collection not found</h2>
          <p className="text-[#888888] mb-4">The collection you're looking for doesn't exist.</p>
          <Link
            href="/admin/collections"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-2 text-[#7afdd6] hover:text-[#b8a4ff] transition-colors"
        style={{ fontFamily: '"Poppins", sans-serif' }}
      >
        <ArrowLeft size={20} />
        Back to Collections
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[25px] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)',
        }}
      >
        {/* Cover Image */}
        {collection.coverImage && (
          <div className="h-48 relative overflow-hidden">
            <img
              src={collection.coverImage}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {collection.name}
                </h1>
                {collection.isPinned && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                    <Pin size={12} />
                    Pinned
                  </span>
                )}
                {collection.isPublic ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/20 flex items-center gap-1">
                    <Globe size={12} />
                    Public
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/20 flex items-center gap-1">
                    <Lock size={12} />
                    Private
                  </span>
                )}
              </div>

              {collection.description && (
                <p className="text-[#888888] mb-4">{collection.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-[#888888]">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-[#7afdd6]" />
                  <span>{orderedAssets.length} assets</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#7afdd6]" />
                  <span>{collection.createdBy.name || collection.createdBy.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#7afdd6]" />
                  <span>{format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-3 rounded-xl bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors"
                title="Edit collection"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete collection"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assets Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Assets
          </h2>
          <button
            onClick={() => setShowAddAssetsModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Plus size={20} />
            Add Assets
          </button>
        </div>

        {orderedAssets.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedAssets.map(a => a.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orderedAssets.map((asset) => (
                  <SortableAssetCard
                    key={asset.id}
                    asset={asset}
                    onDownload={handleDownload}
                    onRemove={handleRemoveAsset}
                    isRemoving={removingAssetId === asset.id}
                    isDownloading={downloadingAssetId === asset.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className="rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            <ImageIcon size={64} className="mx-auto text-[#888888] mb-4" />
            <h3
              className="text-xl font-semibold text-white mb-2"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              No assets yet
            </h3>
            <p className="text-[#888888] mb-4">Add assets to this collection to get started</p>
            <button
              onClick={() => setShowAddAssetsModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Assets
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div
            className="relative w-full max-w-2xl rounded-[25px] p-8"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(42, 42, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Edit Collection
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#888888]" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-white mb-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-white mb-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors resize-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, isPublic: !editFormData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editFormData.isPublic ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]' : 'bg-[#3a3a3a]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editFormData.isPublic ? 'translate-x-6' : 'translate-x-1'
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
                    onClick={() => setEditFormData({ ...editFormData, isPinned: !editFormData.isPinned })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editFormData.isPinned ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]' : 'bg-[#3a3a3a]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editFormData.isPinned ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Pinned
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assets Modal */}
      {showAddAssetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddAssetsModal(false)}
          />
          <div
            className="relative w-full max-w-2xl rounded-[25px] p-8 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(42, 42, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Add Assets ({selectedAssetIds.length} selected)
              </h2>
              <button
                onClick={() => setShowAddAssetsModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-[#888888]" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={assetSearchQuery}
                onChange={(e) => setAssetSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full px-4 py-3 rounded-xl bg-[#3a3a3a] text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>

            {/* Asset List */}
            <div className="space-y-2 mb-6">
              {assetsData?.assets && assetsData.assets.length > 0 ? (
                assetsData.assets
                  .filter(asset => !orderedAssets.find(a => a.id === asset.id))
                  .map((asset) => (
                    <label
                      key={asset.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#3a3a3a] hover:bg-[#4a4a4a] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-[#2a2a2a]"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ImageIcon size={16} className="text-[#7afdd6] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{asset.name}</p>
                          <p className="text-xs text-[#888888]">{asset.type}</p>
                        </div>
                      </div>
                    </label>
                  ))
              ) : (
                <div className="text-center py-8 text-[#888888]">
                  {assetSearchQuery ? 'No assets found' : 'No available assets'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddAssetsModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAssets}
                disabled={selectedAssetIds.length === 0 || batchAddAssetsMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {batchAddAssetsMutation.isPending ? 'Adding...' : `Add ${selectedAssetIds.length} Assets`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div
            className="relative w-full max-w-md rounded-[25px] p-8"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(42, 42, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(255, 99, 71, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Delete Collection?
              </h2>
              <p className="text-[#888888]">
                Are you sure you want to delete "{collection.name}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
