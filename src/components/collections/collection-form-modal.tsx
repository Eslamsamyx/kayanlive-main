'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { X, Loader2 } from 'lucide-react';

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string; // For editing existing collection
  onSuccess?: () => void;
}

export default function CollectionFormModal({
  isOpen,
  onClose,
  collectionId,
  onSuccess,
}: CollectionFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const utils = api.useUtils();

  // Fetch existing collection if editing
  const { data: existingCollection } = api.collection.getById.useQuery(
    { id: collectionId! },
    { enabled: !!collectionId }
  );

  // Create mutation
  const createMutation = api.collection.create.useMutation({
    onSuccess: () => {
      utils.collection.list.invalidate();
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setErrors({ name: error.message });
    },
  });

  // Update mutation
  const updateMutation = api.collection.update.useMutation({
    onSuccess: () => {
      utils.collection.list.invalidate();
      utils.collection.getById.invalidate({ id: collectionId! });
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setErrors({ name: error.message });
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingCollection) {
      setName(existingCollection.name);
      setDescription(existingCollection.description || '');
      setIsPublic(existingCollection.isPublic);
    }
  }, [existingCollection]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setErrors({});
  };

  const handleClose = () => {
    if (!createMutation.isPending && !updateMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Collection name must be at least 3 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Collection name must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
    };

    if (collectionId) {
      updateMutation.mutate({ id: collectionId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {collectionId ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Photos, Brand Assets"
              disabled={isPending}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this collection contains..."
              rows={3}
              disabled={isPending}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isPending}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">Make this collection public</div>
                <div className="text-xs text-gray-500">
                  Anyone with the link can view this collection
                </div>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {collectionId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{collectionId ? 'Update' : 'Create'} Collection</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
