'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter, useParams } from 'next/navigation';
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
  Video,
  FileText,
  File,
  Music,
  Loader2,
  Download,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { AssetType } from '@prisma/client';
import CollectionFormModal from '@/components/collections/collection-form-modal';
import SortableAssetCard from '@/components/collections/sortable-asset-card';

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddAssetsModal, setShowAddAssetsModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [orderedAssets, setOrderedAssets] = useState<any[]>([]);

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

  // Delete collection mutation
  const deleteMutation = api.collection.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/collections');
    },
  });

  // Remove asset from collection mutation
  const removeAssetMutation = api.collection.removeAsset.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
    },
  });

  // Download mutation
  const downloadMutation = api.asset.getDownloadUrl.useMutation();

  // Reorder assets mutation
  const reorderMutation = api.collection.reorderAssets.useMutation({
    onSuccess: () => {
      utils.collection.getById.invalidate({ id: collectionId });
    },
  });

  // Update ordered assets when collection data changes
  useEffect(() => {
    if (collection?.assets) {
      const sorted = [...collection.assets].sort((a, b) => a.position - b.position);
      setOrderedAssets(sorted);
    }
  }, [collection?.assets]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedAssets((items) => {
        const oldIndex = items.findIndex((item) => item.asset.id === active.id);
        const newIndex = items.findIndex((item) => item.asset.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Update backend with new order
        const assetPositions = newOrder.map((item, index) => ({
          assetId: item.asset.id,
          position: index,
        }));
        reorderMutation.mutate({ collectionId, assetPositions });

        return newOrder;
      });
    }
  };

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Collection</h3>
          <p className="text-red-600">{error?.message || 'Collection not found'}</p>
          <button
            onClick={() => router.push('/dashboard/collections')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const assets = collection.assets || [];

  const handleDownload = async (assetId: string, variant?: string) => {
    try {
      const result = await downloadMutation.mutateAsync({ assetId });
      window.open(result.url, '_blank');
    } catch (error) {
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    if (confirm('Remove this asset from the collection?')) {
      removeAssetMutation.mutate({ collectionId, assetId });
    }
  };

  const handleDeleteCollection = () => {
    deleteMutation.mutate({ id: collectionId });
  };

  const getAssetTypeIcon = (type: AssetType, size = 24) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={size} className="text-blue-600" />;
      case 'VIDEO':
        return <Video size={size} className="text-purple-600" />;
      case 'DOCUMENT':
        return <FileText size={size} className="text-green-600" />;
      case 'AUDIO':
        return <Music size={size} className="text-yellow-600" />;
      case 'MODEL_3D':
      case 'DESIGN':
        return <File size={size} className="text-pink-600" />;
      default:
        return <File size={size} className="text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: bigint | number): string => {
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    if (numBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/collections')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Collections
        </button>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  collection.isPublic
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {collection.isPublic ? (
                  <>
                    <Globe size={14} />
                    Public
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Private
                  </>
                )}
              </div>
            </div>
            {collection.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{collection.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created on {format(new Date(collection.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddAssetsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Add Assets
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <Edit size={18} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Assets</div>
            <div className="text-3xl font-bold text-gray-900">{assets.length}</div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated {format(new Date(collection.updatedAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {orderedAssets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No assets in this collection</h3>
          <p className="text-gray-600 mb-6">Add assets to start organizing your collection</p>
          <button
            onClick={() => setShowAddAssetsModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Assets
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedAssets.map((item) => item.asset.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orderedAssets.map((item) => (
                <SortableAssetCard
                  key={item.asset.id}
                  asset={item.asset}
                  onDownload={handleDownload}
                  onRemove={handleRemoveAsset}
                  isRemoving={removeAssetMutation.isPending}
                  isDownloading={downloadMutation.isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Collection Modal */}
      <CollectionFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        collectionId={collectionId}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Collection?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
              Assets in this collection will not be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollection}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Collection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Assets Modal - Placeholder */}
      {showAddAssetsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add Assets to Collection</h2>
              <button
                onClick={() => setShowAddAssetsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Asset picker will be implemented in the next step. You can add assets from the asset
              detail view.
            </p>
            <button
              onClick={() => setShowAddAssetsModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
