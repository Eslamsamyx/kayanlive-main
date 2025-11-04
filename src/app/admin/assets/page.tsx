'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Upload,
  Trash2,
  Edit2,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Music,
  X,
  Plus,
  Building2,
  FolderKanban,
  Eye,
  Share2,
  Calendar,
  Filter,
  Download,
  HardDrive,
  Heart,
} from 'lucide-react';
import { AssetType } from '@prisma/client';
import { format } from 'date-fns';
import { AssetUploadModal } from '@/components/assets/AssetUploadModal';
import { FilePreviewModal } from '@/components/uploads/FilePreviewModal';
import ShareAssetModal from '@/components/assets/share-asset-modal';
import { toast } from 'sonner';

export default function AdminAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkCompanyModal, setShowLinkCompanyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAssetId, setShareAssetId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<any>(null);

  // Advanced filters
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [fileSizeFilter, setFileSizeFilter] = useState<string>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'name' | 'fileSize' | 'viewCount' | 'downloadCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Convert date range filter to dates
  const getDateRange = () => {
    const now = new Date();
    switch (dateRangeFilter) {
      case 'TODAY':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { uploadedAfter: today };
      case 'WEEK':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { uploadedAfter: weekAgo };
      case 'MONTH':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { uploadedAfter: monthAgo };
      case 'QUARTER':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return { uploadedAfter: quarterAgo };
      case 'YEAR':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { uploadedAfter: yearAgo };
      default:
        return {};
    }
  };

  // Convert file size filter to bytes
  const getFileSizeRange = () => {
    const MB = 1024 * 1024;
    switch (fileSizeFilter) {
      case 'SMALL':
        return { maxFileSize: MB };
      case 'MEDIUM':
        return { minFileSize: MB, maxFileSize: 10 * MB };
      case 'LARGE':
        return { minFileSize: 10 * MB, maxFileSize: 100 * MB };
      case 'XLARGE':
        return { minFileSize: 100 * MB };
      default:
        return {};
    }
  };

  const dateRange = getDateRange();
  const fileSizeRange = getFileSizeRange();

  const { data: assetsData, refetch, isLoading, isError, error } = api.asset.advancedSearch.useQuery({
    query: searchTerm || undefined,
    type: typeFilter === 'ALL' ? undefined : (typeFilter as AssetType),
    companyId: companyFilter === 'ALL' ? undefined : companyFilter,
    projectId: projectFilter === 'ALL' ? undefined : projectFilter,
    favoritesOnly: favoritesOnly || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 50,
    ...dateRange,
    ...fileSizeRange,
  });

  const { data: statsData } = api.asset.getStats.useQuery();
  const { data: assetDetails } = api.asset.getById.useQuery(
    { id: selectedAssetId! },
    { enabled: !!selectedAssetId }
  );

  const { data: companiesData } = api.company.getAll.useQuery({ page: 1, limit: 100 });
  const { data: projectsData } = api.project.getAll.useQuery({ page: 1, limit: 100 });

  const utils = api.useUtils();

  const deleteAssetMutation = api.asset.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedAssetId(null);
      toast.success('Asset deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete asset: ${error.message}`);
    },
  });

  const batchDeleteMutation = api.asset.batchDelete.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedAssets([]);
      setSelectedAssetId(null);
      toast.success(`${data.deletedCount} asset(s) deleted successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to delete assets: ${error.message}`);
    },
  });

  const linkToProjectMutation = api.asset.linkToProject.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedAssetId) {
        utils.asset.getById.invalidate({ id: selectedAssetId });
      }
      setShowLinkModal(false);
      toast.success('Asset linked to project');
    },
    onError: (error) => {
      toast.error(`Failed to link asset: ${error.message}`);
    },
  });

  const unlinkFromProjectMutation = api.asset.unlinkFromProject.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedAssetId) {
        utils.asset.getById.invalidate({ id: selectedAssetId });
      }
      toast.success('Asset unlinked from project');
    },
    onError: (error) => {
      toast.error(`Failed to unlink asset: ${error.message}`);
    },
  });

  const linkToCompanyMutation = api.asset.linkToCompany.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedAssetId) {
        utils.asset.getById.invalidate({ id: selectedAssetId });
      }
      setShowLinkCompanyModal(false);
      toast.success('Asset linked to company');
    },
    onError: (error) => {
      toast.error(`Failed to link asset: ${error.message}`);
    },
  });

  const unlinkFromCompanyMutation = api.asset.unlinkFromCompany.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedAssetId) {
        utils.asset.getById.invalidate({ id: selectedAssetId });
      }
      toast.success('Asset unlinked from company');
    },
    onError: (error) => {
      toast.error(`Failed to unlink asset: ${error.message}`);
    },
  });

  const assets = assetsData?.assets || [];
  const pagination = assetsData?.pagination || { total: 0, pages: 0, currentPage: 1, perPage: 50 };
  const stats = statsData || { total: 0, typeDistribution: { IMAGE: 0, VIDEO: 0, DOCUMENT: 0, AUDIO: 0, MODEL_3D: 0, DESIGN: 0, OTHER: 0 } };

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  // Bulk selection helpers
  const toggleSelectAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedAssets.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedAssets.length} asset(s)? This action cannot be undone.`)) {
      batchDeleteMutation.mutate({ assetIds: selectedAssets });
    }
  };

  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={20} className="text-blue-400" />;
      case 'VIDEO':
        return <Video size={20} className="text-purple-400" />;
      case 'DOCUMENT':
        return <FileText size={20} className="text-green-400" />;
      case 'AUDIO':
        return <Music size={20} className="text-yellow-400" />;
      case 'MODEL_3D':
        return <File size={20} className="text-pink-400" />;
      default:
        return <File size={20} className="text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Asset Management
          </h1>
          <p className="text-gray-400 mt-1">Manage files, images, videos, and documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 rounded-[25px] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Upload size={20} />
          Upload Asset
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div
          className="p-6 rounded-[25px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl" style={{ background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Total Assets
            </p>
            <p className="text-3xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {stats.total.toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded-[25px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(96, 165, 250, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Images
            </p>
            <p className="text-3xl font-bold text-blue-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {(stats.typeDistribution.IMAGE || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded-[25px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(192, 132, 252, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Videos
            </p>
            <p className="text-3xl font-bold text-purple-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {(stats.typeDistribution.VIDEO || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded-[25px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(74, 222, 128, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Documents
            </p>
            <p className="text-3xl font-bold text-green-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {(stats.typeDistribution.DOCUMENT || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="p-6 rounded-[25px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(250, 204, 21, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Other
            </p>
            <p className="text-3xl font-bold text-yellow-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {((stats.typeDistribution.AUDIO || 0) + (stats.typeDistribution.MODEL_3D || 0) + (stats.typeDistribution.OTHER || 0)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assets by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-[15px] bg-white/5 border border-[#7afdd6]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#7afdd6]/50"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              resetPage();
            }}
            className="px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
            style={{
              fontFamily: '"Poppins", sans-serif',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem',
            }}
          >
            <option value="ALL" className="bg-[#1a1a19] text-white py-2">All Types</option>
            <option value="IMAGE" className="bg-[#1a1a19] text-white py-2">Images</option>
            <option value="VIDEO" className="bg-[#1a1a19] text-white py-2">Videos</option>
            <option value="DOCUMENT" className="bg-[#1a1a19] text-white py-2">Documents</option>
            <option value="AUDIO" className="bg-[#1a1a19] text-white py-2">Audio</option>
            <option value="MODEL_3D" className="bg-[#1a1a19] text-white py-2">3D Models</option>
            <option value="OTHER" className="bg-[#1a1a19] text-white py-2">Other</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              resetPage();
            }}
            className="px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#b8a4ff]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#b8a4ff] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#b8a4ff]/40 transition-all"
            style={{
              fontFamily: '"Poppins", sans-serif',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23b8a4ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem',
            }}
          >
            <option value="createdAt-desc" className="bg-[#1a1a19] text-white py-2">Newest First</option>
            <option value="createdAt-asc" className="bg-[#1a1a19] text-white py-2">Oldest First</option>
            <option value="name-asc" className="bg-[#1a1a19] text-white py-2">Name (A-Z)</option>
            <option value="name-desc" className="bg-[#1a1a19] text-white py-2">Name (Z-A)</option>
            <option value="fileSize-desc" className="bg-[#1a1a19] text-white py-2">Largest First</option>
            <option value="fileSize-asc" className="bg-[#1a1a19] text-white py-2">Smallest First</option>
            <option value="downloadCount-desc" className="bg-[#1a1a19] text-white py-2">Most Downloaded</option>
            <option value="viewCount-desc" className="bg-[#1a1a19] text-white py-2">Most Viewed</option>
          </select>

          {/* Favorites Filter Toggle */}
          <button
            onClick={() => {
              setFavoritesOnly(!favoritesOnly);
              resetPage();
            }}
            className={`px-4 py-3 rounded-[15px] flex items-center gap-2 font-semibold transition-all ${
              favoritesOnly
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/5 border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
            title={favoritesOnly ? 'Show all assets' : 'Show favorites only'}
          >
            <Heart size={20} fill={favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2.5} />
            <span className="hidden sm:inline">
              {favoritesOnly ? 'Favorites' : 'Favorites'}
            </span>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-[15px] flex items-center gap-2 transition-all ${
              showAdvancedFilters
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-white/5 border border-[#7afdd6]/20 text-white hover:border-[#7afdd6]/50'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[15px] bg-white/5 border border-[#7afdd6]/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <Building2 size={16} className="inline mr-1" />
                  Company
                </label>
                <select
                  value={companyFilter}
                  onChange={(e) => {
                    setCompanyFilter(e.target.value);
                    setProjectFilter('ALL'); // Reset project filter when company changes
                    resetPage();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white py-2">All Companies</option>
                  {companiesData?.companies.map((company) => (
                    <option key={company.id} value={company.id} className="bg-[#1a1a19] text-white py-2">
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <FolderKanban size={16} className="inline mr-1" />
                  Project
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white py-2">All Projects</option>
                  {companyFilter !== 'ALL'
                    ? projectsData?.projects
                        .filter((project) => project.company.id === companyFilter)
                        .map((project) => (
                          <option key={project.id} value={project.id} className="bg-[#1a1a19] text-white py-2">
                            {project.name}
                          </option>
                        ))
                    : projectsData?.projects.map((project) => (
                        <option key={project.id} value={project.id} className="bg-[#1a1a19] text-white py-2">
                          {project.name} ({project.company.name})
                        </option>
                      ))
                  }
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <Calendar size={16} className="inline mr-1" />
                  Upload Date
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => {
                    setDateRangeFilter(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white py-2">All Time</option>
                  <option value="TODAY" className="bg-[#1a1a19] text-white py-2">Today</option>
                  <option value="WEEK" className="bg-[#1a1a19] text-white py-2">This Week</option>
                  <option value="MONTH" className="bg-[#1a1a19] text-white py-2">This Month</option>
                  <option value="QUARTER" className="bg-[#1a1a19] text-white py-2">This Quarter</option>
                  <option value="YEAR" className="bg-[#1a1a19] text-white py-2">This Year</option>
                </select>
              </div>

              {/* File Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <HardDrive size={16} className="inline mr-1" />
                  File Size
                </label>
                <select
                  value={fileSizeFilter}
                  onChange={(e) => {
                    setFileSizeFilter(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white py-2">All Sizes</option>
                  <option value="SMALL" className="bg-[#1a1a19] text-white py-2">&lt; 1 MB</option>
                  <option value="MEDIUM" className="bg-[#1a1a19] text-white py-2">1 MB - 10 MB</option>
                  <option value="LARGE" className="bg-[#1a1a19] text-white py-2">10 MB - 100 MB</option>
                  <option value="XLARGE" className="bg-[#1a1a19] text-white py-2">&gt; 100 MB</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setCompanyFilter('ALL');
                  setProjectFilter('ALL');
                  setDateRangeFilter('ALL');
                  setFileSizeFilter('ALL');
                  setSearchTerm('');
                  setTypeFilter('ALL');
                  setFavoritesOnly(false);
                  setSortBy('createdAt');
                  setSortOrder('desc');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-4 flex items-center justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.3)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {selectedAssets.length} asset(s) selected
            </span>
            <button
              onClick={() => setSelectedAssets([])}
              className="text-sm text-gray-400 hover:text-white transition-colors"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={batchDeleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Trash2 size={18} strokeWidth={2.5} />
            Delete Selected
          </button>
        </motion.div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div
          className="lg:col-span-2 rounded-[25px] p-6 max-h-[800px] overflow-y-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.3)',
          }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6]" />
              <p className="text-gray-400 mt-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Loading assets...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-red-400 font-semibold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Error loading assets
              </p>
              <p className="text-gray-400 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 rounded-lg bg-[#7afdd6]/10 text-[#7afdd6] hover:bg-[#7afdd6]/20 transition-all"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Try Again
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                No assets found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Header */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedAssets.length === assets.length && assets.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-transparent checked:bg-[#7afdd6] checked:border-[#7afdd6] cursor-pointer transition-all hover:border-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6]/50"
                />
                <span className="text-sm text-gray-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Select All ({assets.length})
                </span>
              </div>
              {assets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedAssetId(asset.id)}
                  onDoubleClick={() => {
                    setPreviewAsset(asset);
                    setShowPreviewModal(true);
                  }}
                  className={`group p-4 cursor-pointer transition-all duration-300 rounded-[15px] ${
                    selectedAssetId === asset.id
                      ? 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectAsset(asset.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-transparent checked:bg-[#7afdd6] checked:border-[#7afdd6] cursor-pointer transition-all hover:border-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6]/50"
                    />
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center relative">
                      {getAssetTypeIcon(asset.type)}
                      {/* Favorite Indicator */}
                      {(asset as any).isFavorite && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                          <Heart size={12} fill="white" className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{asset.name}</h3>
                        {(asset as any).isFavorite && (
                          <Heart size={16} fill="#f43f5e" className="text-pink-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span>{asset.type}</span>
                        <span>•</span>
                        <span>{formatFileSize(Number(asset.fileSize))}</span>
                        <span>•</span>
                        <span>{(asset as any)._count?.projects || 0} projects</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400">
                        {format(new Date(asset.createdAt), 'MMM dd, yyyy')}
                      </div>

                      {/* Quick Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareAssetId(asset.id);
                          setShowShareModal(true);
                        }}
                        className="p-2 rounded-lg bg-[#7afdd6]/10 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/20 hover:border-[#7afdd6]/40 hover:scale-110 hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all opacity-60 group-hover:opacity-100"
                        title="Create share link"
                      >
                        <Share2 size={16} strokeWidth={2.5} />
                      </button>

                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset(asset);
                          setShowPreviewModal(true);
                        }}
                        className="p-2 rounded-lg bg-[#b8a4ff]/10 border border-[#b8a4ff]/20 text-[#b8a4ff] hover:bg-[#b8a4ff]/20 hover:border-[#b8a4ff]/40 hover:scale-110 hover:shadow-lg hover:shadow-[#b8a4ff]/30 transition-all opacity-60 group-hover:opacity-100"
                        title="Preview asset"
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
                            deleteAssetMutation.mutate({ id: asset.id });
                          }
                        }}
                        disabled={deleteAssetMutation.isPending}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30 transition-all opacity-60 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete asset"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  {(asset as any).tags && (asset as any).tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(asset as any).tags.map((tag: any, i: number) => (
                        <span
                          key={tag.id || i}
                          className="px-2 py-1 bg-[#7afdd6]/10 text-[#7afdd6] text-xs rounded-full"
                        >
                          {tag.name || tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && !isError && assets.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#7afdd6]/20 pt-4">
              <div className="text-sm text-gray-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Showing page {pagination.currentPage} of {pagination.pages} ({pagination.total} total assets)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#1a1a19] font-bold'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        }`}
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Asset Details */}
        <div
          className="rounded-[25px] p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.3)',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {selectedAssetId && assetDetails ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white">{assetDetails.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareAssetId(assetDetails.id);
                      setShowShareModal(true);
                    }}
                    className="p-2 rounded-lg bg-[#7afdd6]/10 text-[#7afdd6] hover:bg-[#7afdd6]/20 transition-all"
                    title="Share asset"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this asset?')) {
                        deleteAssetMutation.mutate({ id: assetDetails.id });
                      }
                    }}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete asset"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Asset Preview Thumbnail */}
              <div className="space-y-4">
                {assetDetails.type === 'IMAGE' && (
                  <div className="rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={assetDetails.filePath || ''}
                      alt={assetDetails.name}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {assetDetails.type === 'MODEL_3D' && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <Package className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                      <div className="text-[#7afdd6] text-sm font-medium">3D Model</div>
                      <div className="text-[#b2b2b2] text-xs mt-1">{assetDetails.fileName}</div>
                    </div>
                  </div>
                )}

                {assetDetails.type === 'VIDEO' && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-video">
                    <div className="text-center">
                      <Video className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                      <div className="text-[#7afdd6] text-sm font-medium">Video File</div>
                      <div className="text-[#b2b2b2] text-xs mt-1">{assetDetails.fileName}</div>
                    </div>
                  </div>
                )}

                {assetDetails.type === 'DOCUMENT' && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                      <div className="text-[#7afdd6] text-sm font-medium">Document</div>
                      <div className="text-[#b2b2b2] text-xs mt-1">{assetDetails.fileName}</div>
                    </div>
                  </div>
                )}

                {assetDetails.type === 'AUDIO' && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <Music className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                      <div className="text-[#7afdd6] text-sm font-medium">Audio File</div>
                      <div className="text-[#b2b2b2] text-xs mt-1">{assetDetails.fileName}</div>
                    </div>
                  </div>
                )}

                {(assetDetails.type === 'OTHER' || assetDetails.type === 'DESIGN') && (
                  <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <File className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                      <div className="text-[#7afdd6] text-sm font-medium">{assetDetails.type}</div>
                      <div className="text-[#b2b2b2] text-xs mt-1">{assetDetails.fileName}</div>
                    </div>
                  </div>
                )}

                {/* Preview Button for All Asset Types */}
                <button
                  onClick={() => {
                    console.log('👁️ Preview button clicked for asset:', assetDetails.type);
                    setPreviewAsset(assetDetails);
                    setShowPreviewModal(true);
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#1a1a19] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Eye size={20} />
                  {assetDetails.type === 'MODEL_3D' ? 'Open 3D Viewer' : 'Open Viewer'}
                </button>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <DetailField label="Type" value={assetDetails.type} />
                <DetailField label="Size" value={formatFileSize(Number(assetDetails.fileSize))} />
                <DetailField label="MIME Type" value={assetDetails.mimeType} />
                <DetailField label="Uploaded By" value={(assetDetails as any).uploader?.name || (assetDetails as any).uploader?.email || 'Unknown'} />
                <DetailField label="Uploaded" value={format(new Date(assetDetails.createdAt), 'MMM dd, yyyy HH:mm')} />
                {assetDetails.description && (
                  <DetailField label="Description" value={assetDetails.description} />
                )}
              </div>

              {/* Linked Projects */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-[#7afdd6]">Linked Projects</h3>
                  <button
                    onClick={() => {
                      linkToProjectMutation.reset();
                      setShowLinkModal(true);
                    }}
                    className="text-[#7afdd6] hover:text-[#6ee8c5]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {(assetDetails as any).projects?.length === 0 || !(assetDetails as any).projects ? (
                  <p className="text-gray-400 text-sm">Not linked to any projects</p>
                ) : (
                  <div className="space-y-2">
                    {(assetDetails as any).projects.map((pa: any) => (
                      <div
                        key={pa.id}
                        className="p-3 bg-white/5 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <div className="text-white text-sm font-medium">{pa.project.name}</div>
                          <div className="text-gray-400 text-xs">{pa.project.company.name}</div>
                        </div>
                        <button
                          onClick={() =>
                            unlinkFromProjectMutation.mutate({
                              assetId: assetDetails.id,
                              projectId: pa.project.id,
                            })
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <Unlink size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Companies */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-[#b8a4ff]">Linked Companies</h3>
                  <button
                    onClick={() => {
                      linkToCompanyMutation.reset();
                      setShowLinkCompanyModal(true);
                    }}
                    className="text-[#b8a4ff] hover:text-[#a694ef]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {(assetDetails as any).companies?.length === 0 || !(assetDetails as any).companies ? (
                  <p className="text-gray-400 text-sm">Not linked to any companies</p>
                ) : (
                  <div className="space-y-2">
                    {(assetDetails as any).companies.map((ca: any) => (
                      <div
                        key={ca.id}
                        className="p-3 bg-white/5 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <div className="text-white text-sm font-medium">{ca.company.name}</div>
                        </div>
                        <button
                          onClick={() =>
                            unlinkFromCompanyMutation.mutate({
                              assetId: assetDetails.id,
                              companyId: ca.company.id,
                            })
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <Unlink size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AssetUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          refetch();
          setShowUploadModal(false);
        }}
      />

      {/* Link to Project Modal */}
      {showLinkModal && assetDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-[#2c2c2b] rounded-[25px] p-8 max-w-md w-full"
            style={{
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Link to Project</h3>
              <button onClick={() => {
                linkToProjectMutation.reset();
                setShowLinkModal(false);
              }}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {linkToProjectMutation.isPending && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6]"></div>
                  <p className="text-gray-400 text-sm mt-2">Linking asset...</p>
                </div>
              )}
              {!linkToProjectMutation.isPending && projectsData?.projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    linkToProjectMutation.mutate({
                      assetId: assetDetails.id,
                      projectId: project.id,
                    });
                  }}
                  disabled={linkToProjectMutation.isPending}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-white font-medium">{project.name}</div>
                  <div className="text-gray-400 text-sm">{project.company.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Link to Company Modal */}
      {showLinkCompanyModal && assetDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-[#2c2c2b] rounded-[25px] p-8 max-w-md w-full"
            style={{
              border: '2px solid rgba(184, 164, 255, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Link to Company</h3>
              <button onClick={() => {
                linkToCompanyMutation.reset();
                setShowLinkCompanyModal(false);
              }}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {linkToCompanyMutation.isPending && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8a4ff]"></div>
                  <p className="text-gray-400 text-sm mt-2">Linking asset...</p>
                </div>
              )}
              {!linkToCompanyMutation.isPending && companiesData?.companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    linkToCompanyMutation.mutate({
                      assetId: assetDetails.id,
                      companyId: company.id,
                    });
                  }}
                  disabled={linkToCompanyMutation.isPending}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-white font-medium">{company.name}</div>
                  <div className="text-gray-400 text-xs">{company.industry || 'No industry specified'}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewAsset(null);
        }}
        file={previewAsset ? {
          fileKey: previewAsset.fileKey,
          filePath: previewAsset.filePath,
          fileName: previewAsset.fileName, // Use fileName (with extension) not name
          mimeType: previewAsset.mimeType,
          fileSize: previewAsset.fileSize,
        } : null}
      />

      {/* Share Asset Modal */}
      {showShareModal && shareAssetId && (
        <ShareAssetModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareAssetId(null);
          }}
          assetId={shareAssetId}
        />
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-white text-sm">{value}</div>
    </div>
  );
}
