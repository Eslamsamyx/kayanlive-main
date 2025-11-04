'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import ShareAssetModal from './share-asset-modal';

interface ShareButtonProps {
  assetId: string;
  size?: number;
  className?: string;
}

export default function ShareButton({
  assetId,
  size = 20,
  className = '',
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`transition-all duration-200 hover:scale-110 ${className}`}
        title="Share asset"
      >
        <Link2 size={size} className="text-[#888888] hover:text-[#7afdd6]" />
      </button>

      <ShareAssetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        assetId={assetId}
      />
    </>
  );
}
