'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/trpc/react';
import { FolderPlus, Check, Loader2, X } from 'lucide-react';

interface AddToCollectionButtonProps {
  assetId: string;
  size?: number;
  className?: string;
}

export default function AddToCollectionButton({
  assetId,
  size = 20,
  className = '',
}: AddToCollectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // Fetch user collections
  const { data: collectionsData } = api.collection.list.useQuery({});
  const collections = collectionsData?.collections || [];

  // Add asset to collection mutation
  const addAssetMutation = api.collection.addAsset.useMutation({
    onSuccess: () => {
      utils.collection.list.invalidate();
      utils.collection.getById.invalidate();
      setIsOpen(false);
      setSearchTerm('');
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAddToCollection = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    addAssetMutation.mutate({ collectionId, assetId });
  };

  // Filter collections by search term
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        disabled={addAssetMutation.isPending}
        className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${className}`}
        title="Add to collection"
      >
        {addAssetMutation.isPending ? (
          <Loader2 size={size} className="animate-spin text-blue-600" />
        ) : (
          <FolderPlus size={size} className="text-gray-600 hover:text-blue-600" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">Add to Collection</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Collections List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCollections.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? 'No collections found' : 'No collections yet'}
              </div>
            ) : (
              <div className="py-1">
                {filteredCollections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={(e) => handleAddToCollection(e, collection.id)}
                    disabled={addAssetMutation.isPending}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between disabled:opacity-50"
                  >
                    <span className="truncate flex-1">{collection.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {collection._count?.assets || 0} assets
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Collection Link */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to collections page to create new
                window.location.href = '/dashboard/collections';
              }}
              className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors text-center font-medium"
            >
              + Create New Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
