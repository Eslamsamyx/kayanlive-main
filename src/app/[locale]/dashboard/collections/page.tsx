'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import {
  FolderOpen,
  Plus,
  Lock,
  Globe,
  Image as ImageIcon,
  Loader2,
  Search,
  Grid3x3,
} from 'lucide-react';
import { format } from 'date-fns';
import CollectionFormModal from '@/components/collections/collection-form-modal';

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch collections
  const { data: collectionsData, isLoading, error, refetch } = api.collection.list.useQuery({});
  const collections = collectionsData?.collections || [];

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
            <p className="text-gray-600">Loading your collections...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Collections</h3>
          <p className="text-red-600">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter collections by search term
  const filteredCollections = (collections || []).filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCollectionClick = (collectionId: string) => {
    router.push(`/dashboard/collections/${collectionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-2">
            Organize your assets into collections for easy access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          New Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Collections</div>
              <div className="text-3xl font-bold text-gray-900">{collections?.length || 0}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Public</div>
              <div className="text-3xl font-bold text-green-600">
                {collections?.filter((c) => c.isPublic).length || 0}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Private</div>
              <div className="text-3xl font-bold text-orange-600">
                {collections?.filter((c) => !c.isPublic).length || 0}
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No collections found' : 'No collections yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Create your first collection to organize your assets'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create Collection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => handleCollectionClick(collection.id)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Collection Preview - Show first 4 assets */}
              <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {collection._count?.assets && collection._count.assets > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-full h-full">
                    {/* Placeholder for asset thumbnails - will be populated with actual assets */}
                    {[...Array(Math.min(4, collection._count.assets))].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-200 flex items-center justify-center"
                      >
                        <ImageIcon className="text-gray-400" size={32} />
                      </div>
                    ))}
                    {[...Array(Math.max(0, 4 - (collection._count?.assets || 0)))].map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="bg-gray-50 flex items-center justify-center"
                      >
                        <Grid3x3 className="text-gray-300" size={24} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <FolderOpen className="text-gray-300" size={64} />
                )}

                {/* Privacy Badge */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      collection.isPublic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {collection.isPublic ? (
                      <>
                        <Globe size={12} />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        Private
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate mb-2">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{collection._count?.assets || 0} assets</span>
                  <span>{format(new Date(collection.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <CollectionFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
