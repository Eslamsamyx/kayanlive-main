'use client';

import { Heart } from 'lucide-react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  assetId: string;
  initialIsFavorited?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({
  assetId,
  initialIsFavorited = false,
  showLabel = false,
  size = 'md',
}: FavoriteButtonProps) {
  const utils = api.useUtils();

  // Check if favorited (with initial value)
  const { data: checkData } = api.favorite.check.useQuery(
    { assetId },
    {
      initialData: { isFavorited: initialIsFavorited },
    }
  );

  const isFavorited = checkData?.isFavorited ?? false;

  // Toggle favorite mutation
  const toggleFavorite = api.favorite.toggle.useMutation({
    onSuccess: (data) => {
      // Invalidate queries to update UI
      void utils.favorite.check.invalidate({ assetId });
      void utils.favorite.list.invalidate();

      // Show toast
      if (data.favorited) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    },
    onError: (error) => {
      toast.error('Failed to update favorite: ' + error.message);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate({ assetId });
  };

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      className={`${sizeClasses[size]} rounded-lg transition-colors ${
        isFavorited
          ? 'bg-[#7afdd6]/10 text-[#7afdd6] hover:bg-[#7afdd6]/20'
          : 'bg-[#2c2c2b] text-[#b2b2b2] hover:bg-[#333] hover:text-[#7afdd6]'
      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
      whileTap={{ scale: 0.95 }}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          isFavorited ? 'fill-[#7afdd6]' : ''
        }`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </motion.button>
  );
}
