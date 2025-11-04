'use client';

import { api } from '@/trpc/react';
import { Share2, Link as LinkIcon, Copy, Eye, EyeOff, Package, Calendar, User, Loader2, Lock, Download, AlertTriangle, Trash2, CheckCircle2, RefreshCw, Clock, Search, Filter, ChevronDown, ChevronUp, X, Edit, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SharedLinksPage() {
  // Basic state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [linkToRevoke, setLinkToRevoke] = useState<{id: string; token: string; assetName: string} | null>(null);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [linkToActivate, setLinkToActivate] = useState<{id: string; token: string; assetName: string} | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [hasPasswordFilter, setHasPasswordFilter] = useState<boolean | undefined>(undefined);
  const [expiryStatusFilter, setExpiryStatusFilter] = useState<'ALL' | 'EXPIRED' | 'EXPIRING_SOON' | 'NEVER'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<'createdAt' | 'expiresAt' | 'viewCount' | 'downloadCount' | 'assetName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [showAccessLogs, setShowAccessLogs] = useState(false);
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.assetShare.listAll.useQuery({
    isActive: filterActive,
    search: searchQuery || undefined,
    hasPassword: hasPasswordFilter,
    expiryStatus: expiryStatusFilter,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const revokeMutation = api.assetShare.delete.useMutation({
    onSuccess: () => {
      refetch();
      setShowRevokeConfirm(false);
      setLinkToRevoke(null);
    },
  });

  const reactivateMutation = api.assetShare.reactivate.useMutation({
    onSuccess: () => {
      refetch();
      setShowActivateConfirm(false);
      setLinkToActivate(null);
    },
  });

  const handleCopyLink = async (url: string, token: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = (linkId: string, token: string, assetName: string) => {
    setLinkToRevoke({ id: linkId, token, assetName });
    setShowRevokeConfirm(true);
  };

  const confirmRevoke = async () => {
    if (linkToRevoke) {
      try {
        await revokeMutation.mutateAsync({ id: linkToRevoke.id });
      } catch (error) {
        console.error('Failed to revoke link:', error);
      }
    }
  };

  const handleActivate = (linkId: string, token: string, assetName: string) => {
    setLinkToActivate({ id: linkId, token, assetName });
    setShowActivateConfirm(true);
  };

  const confirmActivate = async () => {
    if (linkToActivate) {
      try {
        await reactivateMutation.mutateAsync({ id: linkToActivate.id });
      } catch (error) {
        console.error('Failed to reactivate link:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading shared links...</p>
        </div>
      </div>
    );
  }

  const shareLinks = data?.shareLinks || [];
  const pagination = data?.pagination;
  const stats = {
    total: pagination?.totalCount || 0,
    active: shareLinks.filter(sl => sl.isActive).length,
    inactive: shareLinks.filter(sl => !sl.isActive).length,
    withPassword: shareLinks.filter(sl => sl.hasPassword).length,
  };

  // Helper functions
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterActive(undefined);
    setHasPasswordFilter(undefined);
    setExpiryStatusFilter('ALL');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || filterActive !== undefined || hasPasswordFilter !== undefined || expiryStatusFilter !== 'ALL';

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
          Shared Links
        </h1>
        <p className="text-[#888888] text-lg">
          Manage externally shared asset links
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Links" value={stats.total} icon={<Share2 size={24} />} gradient="#7afdd6, #b8a4ff" />
        <StatCard title="Active" value={stats.active} icon={<Eye size={24} />} gradient="#b8a4ff, #7afdd6" />
        <StatCard title="Inactive" value={stats.inactive} icon={<EyeOff size={24} />} gradient="#7afdd6, #A095E1" />
        <StatCard title="Protected" value={stats.withPassword} icon={<Lock size={24} />} gradient="#A095E1, #7afdd6" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterActive(undefined)}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            filterActive === undefined
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] shadow-lg'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white hover:bg-[#4a4a4a]'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          All Links
        </button>
        <button
          onClick={() => setFilterActive(true)}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            filterActive === true
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] shadow-lg'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white hover:bg-[#4a4a4a]'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Active
        </button>
        <button
          onClick={() => setFilterActive(false)}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
            filterActive === false
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] shadow-lg'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white hover:bg-[#4a4a4a]'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Inactive
        </button>
      </div>

      {/* Search and Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7afdd6]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              placeholder="Search by asset name, creator name or email..."
              className="w-full pl-12 pr-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[15px] font-semibold transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#2c2c2b]/80'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">●</span>}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-6 py-3 rounded-[15px] bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <X size={18} />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-[20px] p-6 bg-[#2c2c2b]/40 border border-[#7afdd6]/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Password Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Password Protection
                </label>
                <select
                  value={hasPasswordFilter === undefined ? 'ALL' : hasPasswordFilter ? 'YES' : 'NO'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHasPasswordFilter(val === 'ALL' ? undefined : val === 'YES');
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white">All Links</option>
                  <option value="YES" className="bg-[#1a1a19] text-white">Protected Only</option>
                  <option value="NO" className="bg-[#1a1a19] text-white">Unprotected Only</option>
                </select>
              </div>

              {/* Expiry Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Expiry Status
                </label>
                <select
                  value={expiryStatusFilter}
                  onChange={(e) => {
                    setExpiryStatusFilter(e.target.value as typeof expiryStatusFilter);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="ALL" className="bg-[#1a1a19] text-white">All Expiry</option>
                  <option value="EXPIRED" className="bg-[#1a1a19] text-white">Expired</option>
                  <option value="EXPIRING_SOON" className="bg-[#1a1a19] text-white">Expiring Soon (&lt;24h)</option>
                  <option value="NEVER" className="bg-[#1a1a19] text-white">Never Expires</option>
                </select>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-semibold text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Links Per Page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="10" className="bg-[#1a1a19] text-white">10</option>
                  <option value="25" className="bg-[#1a1a19] text-white">25</option>
                  <option value="50" className="bg-[#1a1a19] text-white">50</option>
                  <option value="100" className="bg-[#1a1a19] text-white">100</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Links Table */}
      <div
        className="rounded-[25px] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#7afdd6]/20 bg-[#2c2c2b]/30">
                {/* Sortable: Asset Name */}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider cursor-pointer hover:bg-[#7afdd6]/10 transition-colors select-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  onClick={() => handleSort('assetName')}
                >
                  <div className="flex items-center gap-2">
                    Asset
                    {sortBy === 'assetName' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                {/* Non-sortable: Created By */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Created By
                </th>
                {/* Non-sortable: Link */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Link
                </th>
                {/* Sortable: Stats (Views) */}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider cursor-pointer hover:bg-[#7afdd6]/10 transition-colors select-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  onClick={() => handleSort('viewCount')}
                >
                  <div className="flex items-center gap-2">
                    Stats
                    {sortBy === 'viewCount' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                {/* Sortable: Created Date */}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider cursor-pointer hover:bg-[#7afdd6]/10 transition-colors select-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortBy === 'createdAt' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                {/* Sortable: Expiry Date */}
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider cursor-pointer hover:bg-[#7afdd6]/10 transition-colors select-none"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  onClick={() => handleSort('expiresAt')}
                >
                  <div className="flex items-center gap-2">
                    Expires
                    {sortBy === 'expiresAt' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                {/* Non-sortable: Status */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Status
                </th>
                {/* Non-sortable: Actions */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#7afdd6] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7afdd6]/10">
              {shareLinks.map((link) => (
                <tr key={link.id} className="hover:bg-[#2c2c2b]/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package size={18} className="text-[#7afdd6] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate" style={{ fontFamily: '"Poppins", sans-serif' }}>{link.asset.name}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-[#888888]">{link.asset.type}</p>
                          {/* Visual Badges */}
                          {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              <AlertTriangle size={10} />
                              Expired
                            </span>
                          )}
                          {link.expiresAt && new Date(link.expiresAt) > new Date() && new Date(link.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400 font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              <Clock size={10} />
                              Expiring Soon
                            </span>
                          )}
                          {link.viewCount > 100 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7afdd6]/10 border border-[#7afdd6]/30 text-xs text-[#7afdd6] font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              <TrendingUp size={10} />
                              High Traffic
                            </span>
                          )}
                          {new Date().getTime() - new Date(link.createdAt).getTime() < 24 * 60 * 60 * 1000 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400 font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              <Zap size={10} />
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-[#2c2c2b]" />
                      </div>
                      <p className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>{link.createdBy.name || link.createdBy.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {link.hasPassword && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                          <Lock size={12} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400" style={{ fontFamily: '"Poppins", sans-serif' }}>Protected</span>
                        </div>
                      )}
                      <code className="text-xs text-[#7afdd6] bg-[#2c2c2b]/60 px-3 py-1.5 rounded-lg border border-[#7afdd6]/20 font-mono">
                        {link.token.substring(0, 12)}...
                      </code>
                      <button
                        onClick={() => handleCopyLink(link.url, link.token)}
                        className="p-2 rounded-lg hover:bg-[#7afdd6]/10 transition-colors"
                        title="Copy link"
                      >
                        {copiedToken === link.token ? (
                          <span className="text-sm text-green-400 font-semibold">✓</span>
                        ) : (
                          <Copy size={16} className="text-[#888888] hover:text-[#7afdd6]" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      <div className="flex items-center gap-1.5 text-[#888888]">
                        <Eye size={14} className="text-[#7afdd6]" />
                        <span className="font-medium">{link.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#888888]">
                        <Download size={14} className="text-[#b8a4ff]" />
                        <span className="font-medium">{link.downloadCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#7afdd6]" />
                      <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {link.expiresAt ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={
                          new Date(link.expiresAt) < new Date()
                            ? 'text-red-400'
                            : new Date(link.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
                            ? 'text-yellow-400'
                            : 'text-[#b8a4ff]'
                        } />
                        <span
                          className={`text-sm ${
                            new Date(link.expiresAt) < new Date()
                              ? 'text-red-400 font-semibold'
                              : new Date(link.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
                              ? 'text-yellow-400 font-semibold'
                              : 'text-[#888888]'
                          }`}
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {new Date(link.expiresAt) < new Date()
                            ? 'Expired'
                            : new Date(link.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#888888] italic" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          Never
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                        link.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* View Logs Button */}
                      <button
                        onClick={() => {
                          setSelectedLinkId(link.id);
                          setShowAccessLogs(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#7afdd6]/10 text-[#7afdd6] transition-all border border-[#7afdd6]/20 text-xs font-semibold"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                        title="View access logs"
                      >
                        <BarChart3 size={14} strokeWidth={2.5} />
                        <span>Logs</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedLinkId(link.id);
                          setShowEditSettings(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#b8a4ff]/10 text-[#b8a4ff] transition-all border border-[#b8a4ff]/20 text-xs font-semibold"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                        title="Edit settings"
                      >
                        <Edit size={14} strokeWidth={2.5} />
                        <span>Edit</span>
                      </button>

                      {/* Revoke/Activate Button */}
                      {link.isActive ? (
                        <button
                          onClick={() => handleRevoke(link.id, link.token, link.asset.name)}
                          disabled={revokeMutation.isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(link.id, link.token, link.asset.name)}
                          disabled={reactivateMutation.isPending}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 transition-all disabled:opacity-50"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          <RefreshCw size={14} strokeWidth={2.5} />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!shareLinks.length && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#7afdd6]/10 to-[#b8a4ff]/10 flex items-center justify-center">
                <Share2 size={40} className="text-[#7afdd6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                No shared links found
              </h3>
              <p className="text-[#888888] text-sm">
                {filterActive === undefined ? 'No assets have been shared yet' : filterActive ? 'No active share links' : 'No inactive share links'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalCount > 0 && (
          <div className="px-6 py-4 bg-[#2c2c2b]/20 border-t border-[#7afdd6]/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Showing{' '}
                <span className="text-[#7afdd6] font-semibold">
                  {(page - 1) * pageSize + 1}
                </span>
                {' '}-{' '}
                <span className="text-[#7afdd6] font-semibold">
                  {Math.min(page * pageSize, pagination.totalCount)}
                </span>
                {' '}of{' '}
                <span className="text-[#7afdd6] font-semibold">
                  {pagination.totalCount}
                </span>
                {' '}links
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:hover:bg-[#2c2c2b]/60"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:hover:bg-[#2c2c2b]/60"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                            : 'bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10'
                        }`}
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasMore}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:hover:bg-[#2c2c2b]/60"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:hover:bg-[#2c2c2b]/60"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeConfirm && linkToRevoke && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => setShowRevokeConfirm(false)}
        >
          <div
            className="rounded-[25px] max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{
              background: 'rgba(26, 26, 25, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/40">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: '"Poppins", sans-serif',
                color: '#fff',
              }}
            >
              Revoke Share Link?
            </h3>

            {/* Description */}
            <p
              className="text-center text-[#888888] mb-6 leading-relaxed"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              This will permanently revoke access to this share link for <span className="text-white font-semibold">{linkToRevoke.assetName}</span>. Anyone with this link will no longer be able to view or download the asset.
            </p>

            {/* Link Preview */}
            <div
              className="rounded-lg p-3 mb-6 border border-red-500/20"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon size={14} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Link to be revoked
                </span>
              </div>
              <code className="text-xs text-[#888888] break-all font-mono block">
                {typeof window !== 'undefined' && `${window.location.origin}/share/${linkToRevoke.token}`}
              </code>
            </div>

            {/* Warning Note */}
            <div className="flex items-start gap-3 p-3 rounded-lg mb-6 bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200/80" style={{ fontFamily: '"Poppins", sans-serif' }}>
                This action cannot be undone. You'll need to create a new share link if you want to share this asset again.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevokeConfirm(false);
                  setLinkToRevoke(null);
                }}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#7afdd6]/30 text-white hover:bg-[#7afdd6]/10 transition-all font-semibold disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {revokeMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Revoke Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateConfirm && linkToActivate && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => setShowActivateConfirm(false)}
        >
          <div
            className="rounded-[25px] max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{
              background: 'rgba(26, 26, 25, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/40">
                <CheckCircle2 className="text-green-400" size={32} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: '"Poppins", sans-serif',
                color: '#fff',
              }}
            >
              Activate Share Link?
            </h3>

            {/* Description */}
            <p
              className="text-center text-[#888888] mb-6 leading-relaxed"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              This will reactivate the share link for <span className="text-white font-semibold">{linkToActivate.assetName}</span>. The link will become accessible again and anyone with it will be able to view or download the asset.
            </p>

            {/* Link Preview */}
            <div
              className="rounded-lg p-3 mb-6 border border-green-500/20"
              style={{
                background: 'rgba(34, 197, 94, 0.05)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={14} className="text-green-400" />
                <span className="text-xs font-semibold text-green-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Link to be activated
                </span>
              </div>
              <code className="text-xs text-[#888888] break-all font-mono block">
                {typeof window !== 'undefined' && `${window.location.origin}/share/${linkToActivate.token}`}
              </code>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-3 rounded-lg mb-6 bg-[#7afdd6]/10 border border-[#7afdd6]/20">
              <CheckCircle2 size={16} className="text-[#7afdd6] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#7afdd6]/80" style={{ fontFamily: '"Poppins", sans-serif' }}>
                The link will use its original settings (expiration, password protection, etc.). Make sure these settings are still appropriate.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActivateConfirm(false);
                  setLinkToActivate(null);
                }}
                disabled={reactivateMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#7afdd6]/30 text-white hover:bg-[#7afdd6]/10 transition-all font-semibold disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmActivate}
                disabled={reactivateMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {reactivateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Activate Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Logs Modal */}
      {showAccessLogs && selectedLinkId && (
        <AccessLogsModal
          linkId={selectedLinkId}
          onClose={() => {
            setShowAccessLogs(false);
            setSelectedLinkId(null);
          }}
        />
      )}

      {/* Edit Settings Modal */}
      {showEditSettings && selectedLinkId && (
        <EditSettingsModal
          linkId={selectedLinkId}
          onClose={() => {
            setShowEditSettings(false);
            setSelectedLinkId(null);
          }}
          onSuccess={() => {
            refetch();
            setShowEditSettings(false);
            setSelectedLinkId(null);
          }}
        />
      )}
    </div>
  );
}

// Access Logs Modal Component
function AccessLogsModal({ linkId, onClose }: { linkId: string; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = api.assetShare.getAccessLogs.useQuery({
    shareLinkId: linkId,
    page,
    limit: 20,
  });

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[10000]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-[25px] max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(26, 26, 25, 0.98)',
          backdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#7afdd6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#7afdd6]/10 flex items-center justify-center">
                <BarChart3 className="text-[#7afdd6]" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Access Logs
                </h3>
                <p className="text-[#888888] text-sm">View all access history for this share link</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#7afdd6]/10 text-[#888888] hover:text-[#7afdd6] transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-[#7afdd6]" />
            </div>
          ) : data?.logs && data.logs.length > 0 ? (
            <div className="space-y-4">
              {data.logs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 rounded-[15px] bg-[#2c2c2b]/40 border border-[#7afdd6]/10 hover:border-[#7afdd6]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#7afdd6] font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {log.accessType === 'VIEW' ? '👁️ Viewed' : '⬇️ Downloaded'}
                        </span>
                        <span className="text-xs text-[#888888]">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#888888]">IP Address: </span>
                          <span className="text-white font-mono">{log.ipAddress || 'N/A'}</span>
                        </div>
                        {log.country && (
                          <div>
                            <span className="text-[#888888]">Country: </span>
                            <span className="text-white">{log.country}</span>
                          </div>
                        )}
                      </div>
                      {log.userAgent && (
                        <div className="text-xs">
                          <span className="text-[#888888]">User Agent: </span>
                          <span className="text-white truncate block">{log.userAgent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 size={48} className="text-[#7afdd6]/20 mx-auto mb-4" />
              <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                No access logs yet
              </p>
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {data?.pagination && data.pagination.total > 20 && (
          <div className="px-6 py-4 border-t border-[#7afdd6]/20 flex items-center justify-between">
            <div className="text-sm text-[#888888]">
              Page {data.pagination.currentPage} of {data.pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-3 py-2 rounded-lg bg-[#2c2c2b]/60 border border-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Edit Settings Modal Component
function EditSettingsModal({ linkId, onClose, onSuccess }: { linkId: string; onClose: () => void; onSuccess: () => void }) {
  const { data: shareLinks } = api.assetShare.listAll.useQuery({});
  const link = shareLinks?.shareLinks.find((l: any) => l.id === linkId);

  const [expiresAt, setExpiresAt] = useState<string>(
    link?.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [password, setPassword] = useState('');
  const [allowDownload, setAllowDownload] = useState(link?.allowDownload ?? true);
  const [clearPassword, setClearPassword] = useState(false);

  const updateMutation = api.assetShare.update.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSave = async () => {
    const data: any = {
      id: linkId,
      allowDownload,
    };

    if (expiresAt) {
      data.expiresAt = new Date(expiresAt);
    } else {
      data.expiresAt = null;
    }

    if (clearPassword) {
      data.password = '';
    } else if (password) {
      data.password = password;
    }

    await updateMutation.mutateAsync(data);
  };

  if (!link) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[10000]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-[25px] max-w-md w-full shadow-2xl"
        style={{
          background: 'rgba(26, 26, 25, 0.98)',
          backdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(184, 164, 255, 0.3)',
        }}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#b8a4ff]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#b8a4ff]/10 flex items-center justify-center">
                <Edit className="text-[#b8a4ff]" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Edit Link Settings
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#b8a4ff]/10 text-[#888888] hover:text-[#b8a4ff] transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Asset Info */}
          <div className="p-4 rounded-[15px] bg-[#2c2c2b]/40 border border-[#b8a4ff]/10">
            <p className="text-sm text-[#888888] mb-1">Editing link for:</p>
            <p className="text-white font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {link.asset.name}
            </p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-[#b8a4ff] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Expiry Date
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#b8a4ff]/20 text-white focus:outline-none focus:ring-2 focus:ring-[#b8a4ff] transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
            <p className="text-xs text-[#888888] mt-1">Leave empty for no expiry</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#b8a4ff] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Password Protection
            </label>
            {link.hasPassword && !clearPassword ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-[15px] bg-yellow-500/10 border border-yellow-500/20">
                  <Lock size={16} className="text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-semibold">Currently Protected</span>
                </div>
                <button
                  onClick={() => setClearPassword(true)}
                  className="text-sm text-red-400 hover:text-red-300 underline"
                >
                  Remove password protection
                </button>
              </div>
            ) : (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={clearPassword ? "Enter new password" : "Enter password to protect link"}
                className="w-full px-4 py-3 rounded-[15px] bg-[#2c2c2b]/60 border border-[#b8a4ff]/20 text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#b8a4ff] transition-all"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            )}
          </div>

          {/* Allow Download */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-5 h-5 rounded bg-[#2c2c2b]/60 border-2 border-[#b8a4ff]/20 checked:bg-[#b8a4ff] checked:border-[#b8a4ff] focus:ring-2 focus:ring-[#b8a4ff] transition-all"
              />
              <span className="text-sm font-semibold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Allow downloads
              </span>
            </label>
            <p className="text-xs text-[#888888] mt-1 ml-8">
              When disabled, users can only view the asset
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#b8a4ff]/20 flex gap-3">
          <button
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#b8a4ff]/30 text-white hover:bg-[#b8a4ff]/10 transition-all font-semibold disabled:opacity-50"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#b8a4ff] to-[#7afdd6] text-[#2c2c2b] hover:shadow-lg hover:shadow-[#b8a4ff]/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}


function StatCard({ title, value, icon, gradient }: { title: string; value: number; icon: React.ReactNode; gradient: string }) {
  return (
    <div
      className="rounded-[25px] p-6 relative overflow-hidden group hover:scale-[1.02] transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />

      <div className="flex items-center justify-between relative z-10">
        <div className="p-4 rounded-[18px] group-hover:scale-110 transition-transform" style={{
          background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`,
          boxShadow: `0 8px 16px ${gradient.split(',')[0]}40`
        }}>
          <div className="text-[#1a1a19]">{icon}</div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </p>
          <p className="text-4xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
