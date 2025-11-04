'use client';

import { Heart } from 'lucide-react';
import { api } from '@/trpc/react';
import { useState } from 'react';

interface FavoriteButtonProps {
  assetId: string;
  initialIsFavorite?: boolean;
  size?: number;
  className?: string;
}

export default function FavoriteButton({
  assetId,
  initialIsFavorite = false,
  size = 20,
  className = '',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const utils = api.useUtils();

  const addFavoriteMutation = api.asset.addToFavorites.useMutation({
    onMutate: async () => {
      // Optimistic update
      setIsFavorite(true);
    },
    onError: () => {
      // Revert on error
      setIsFavorite(false);
    },
    onSuccess: () => {
      // Invalidate queries to update everywhere
      utils.asset.advancedSearch.invalidate();
      utils.asset.getFavorites.invalidate();
    },
  });

  const removeFavoriteMutation = api.asset.removeFromFavorites.useMutation({
    onMutate: async () => {
      // Optimistic update
      setIsFavorite(false);
    },
    onError: () => {
      // Revert on error
      setIsFavorite(true);
    },
    onSuccess: () => {
      // Invalidate queries to update everywhere
      utils.asset.advancedSearch.invalidate();
      utils.asset.getFavorites.invalidate();
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking favorite

    if (isFavorite) {
      removeFavoriteMutation.mutate({ assetId });
    } else {
      addFavoriteMutation.mutate({ assetId });
    }
  };

  const isPending = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <Heart
          size={size}
          className="fill-red-500 text-red-500"
        />
      ) : (
        <Heart
          size={size}
          className="text-gray-400 hover:text-red-500"
        />
      )}
    </button>
  );
}
