'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { TranslationRequestStatus, TranslationPriority } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Globe,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react';

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const statusColors: Record<TranslationRequestStatus, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
  ASSIGNED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: UserPlus },
  IN_PROGRESS: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: TrendingUp },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
  CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
};

const priorityColors: Record<TranslationPriority, { bg: string; text: string }> = {
  LOW: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  MEDIUM: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  URGENT: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export default function TranslationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TranslationRequestStatus | 'ALL'>('ALL');
  const [localeFilter, setLocaleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);

  // Fetch translation stats
  const { data: stats } = api.article.getTranslationStats.useQuery({});

  // Fetch translation requests
  const { data: requestsData, refetch } = api.article.getTranslationRequests.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    locale: localeFilter === 'ALL' ? undefined : (localeFilter as any),
    page: currentPage,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch translators for assignment
  const { data: translators } = api.user.getAll.useQuery({
    role: 'TRANSLATOR',
    isActive: true,
    limit: 100,
  });

  const assignMutation = api.article.assignTranslationRequest.useMutation({
    onSuccess: () => {
      refetch();
      setShowAssignModal(false);
      setAssignRequestId(null);
    },
  });

  const updateStatusMutation = api.article.updateTranslationRequestStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAssign = (translatorId: string) => {
    if (assignRequestId) {
      assignMutation.mutate({
        id: assignRequestId,
        assignedToId: translatorId,
      });
    }
  };

  const handleStatusChange = (requestId: string, status: TranslationRequestStatus) => {
    updateStatusMutation.mutate({
      id: requestId,
      status,
    });
  };

  return (
    <div className="p-6 md:p-8" style={{ fontFamily: '"Poppins", sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-3 rounded-[15px]"
            style={{
              background: 'linear-gradient(135deg, rgba(122, 253, 214, 0.2) 0%, rgba(184, 164, 255, 0.2) 100%)',
            }}
          >
            <Globe size={24} className="text-[#7afdd6]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Translation Management</h1>
        </div>
        <p className="text-[#888888]">Manage translation requests and track multilingual content</p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Translations"
            value={stats.totalTranslations}
            icon={Globe}
            color="blue"
          />
          <StatCard
            title="Published"
            value={stats.publishedTranslations}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Outdated"
            value={stats.outdatedCount}
            icon={AlertCircle}
            color="orange"
          />
          <StatCard
            title="Health Score"
            value={`${stats.healthScore}%`}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 p-6 rounded-[25px]"
        style={{
          background: 'rgba(44, 44, 43, 0.5)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-[#7afdd6]" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-[10px] bg-[#2c2c2b] border border-[#7afdd6]/20 text-white placeholder-[#888888] focus:outline-none focus:border-[#7afdd6]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-[10px] bg-[#2c2c2b] border border-[#7afdd6]/20 text-white focus:outline-none focus:border-[#7afdd6]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Locale Filter */}
          <select
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="px-4 py-2 rounded-[10px] bg-[#2c2c2b] border border-[#7afdd6]/20 text-white focus:outline-none focus:border-[#7afdd6]"
          >
            <option value="ALL">All Languages</option>
            {LOCALES.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.flag} {locale.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Translation Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {requestsData?.requests.map((request, index) => (
          <RequestCard
            key={request.id}
            request={request}
            index={index}
            onAssign={() => {
              setAssignRequestId(request.id);
              setShowAssignModal(true);
            }}
            onStatusChange={handleStatusChange}
          />
        ))}

        {requestsData?.requests.length === 0 && (
          <div className="text-center py-12">
            <Globe size={48} className="mx-auto mb-4 text-[#888888]" />
            <p className="text-[#888888]">No translation requests found</p>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {requestsData && requestsData.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-[10px] bg-[#2c2c2b] border border-[#7afdd6]/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7afdd6]/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-white px-4">
            Page {currentPage} of {requestsData.pages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(requestsData.pages, p + 1))}
            disabled={currentPage === requestsData.pages}
            className="p-2 rounded-[10px] bg-[#2c2c2b] border border-[#7afdd6]/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7afdd6]/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignModal
          translators={translators?.users || []}
          onAssign={handleAssign}
          onClose={() => {
            setShowAssignModal(false);
            setAssignRequestId(null);
          }}
          isLoading={assignMutation.isPending}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  };

  return (
    <div
      className="p-6 rounded-[20px]"
      style={{
        background: 'rgba(44, 44, 43, 0.5)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-[12px] ${colorClasses[color].bg}`}>
          <Icon size={20} className={colorClasses[color].text} />
        </div>
      </div>
      <p className="text-[#888888] text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

// Request Card Component
function RequestCard({
  request,
  index,
  onAssign,
  onStatusChange,
}: {
  request: any;
  index: number;
  onAssign: () => void;
  onStatusChange: (requestId: string, status: TranslationRequestStatus) => void;
}) {
  const StatusIcon = statusColors[request.status as TranslationRequestStatus].icon;
  const locale = LOCALES.find((l) => l.value === request.requestedLocale);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="p-6 rounded-[20px]"
      style={{
        background: 'rgba(44, 44, 43, 0.5)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section: Article Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{request.article.title}</h3>
            <span className="text-2xl">{locale?.flag}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888]">
            <div className="flex items-center gap-1">
              <FileText size={14} />
              <span>
                {request.article.locale.toUpperCase()} → {request.requestedLocale.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>Requested by {request.requestedBy.name || request.requestedBy.email}</span>
            </div>
            {request.assignedTo && (
              <div className="flex items-center gap-1">
                <UserPlus size={14} />
                <span>Assigned to {request.assignedTo.name || request.assignedTo.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {request.dueDate && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Due {format(new Date(request.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {request.notes && (
            <p className="mt-2 text-sm text-white/70 line-clamp-2">{request.notes}</p>
          )}
        </div>

        {/* Right Section: Status & Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-[10px] flex items-center gap-2 ${
              statusColors[request.status as TranslationRequestStatus].bg
            }`}
          >
            <StatusIcon
              size={16}
              className={statusColors[request.status as TranslationRequestStatus].text}
            />
            <span
              className={`text-sm font-medium ${
                statusColors[request.status as TranslationRequestStatus].text
              }`}
            >
              {request.status.replace('_', ' ')}
            </span>
          </div>

          {/* Priority Badge */}
          <div
            className={`px-3 py-1 rounded-[10px] text-xs font-medium ${
              priorityColors[request.priority as TranslationPriority].bg
            } ${priorityColors[request.priority as TranslationPriority].text}`}
          >
            {request.priority} PRIORITY
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {request.status === 'PENDING' && !request.assignedTo && (
              <button
                onClick={onAssign}
                className="px-4 py-2 rounded-[10px] bg-[#7afdd6]/20 text-[#7afdd6] hover:bg-[#7afdd6]/30 transition-colors text-sm font-medium"
              >
                Assign Translator
              </button>
            )}
            {request.status === 'ASSIGNED' && (
              <button
                onClick={() => onStatusChange(request.id, 'IN_PROGRESS')}
                className="px-4 py-2 rounded-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
              >
                Start Progress
              </button>
            )}
            {request.status === 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusChange(request.id, 'COMPLETED')}
                className="px-4 py-2 rounded-[10px] bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Assign Modal Component
function AssignModal({
  translators,
  onAssign,
  onClose,
  isLoading,
}: {
  translators: any[];
  onAssign: (translatorId: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [selectedTranslator, setSelectedTranslator] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md p-6 rounded-[25px] z-10"
        style={{
          background: 'rgba(44, 44, 43, 0.98)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Assign Translator</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#888888] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Translator List */}
        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
          {translators.map((translator) => (
            <button
              key={translator.id}
              onClick={() => setSelectedTranslator(translator.id)}
              className={`w-full p-4 rounded-[15px] text-left transition-all ${
                selectedTranslator === translator.id
                  ? 'bg-[#7afdd6]/20 border-2 border-[#7afdd6]'
                  : 'bg-[#2c2c2b] border-2 border-transparent hover:border-[#7afdd6]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{translator.name || 'Unknown'}</p>
                  <p className="text-sm text-[#888888]">{translator.email}</p>
                </div>
                {selectedTranslator === translator.id && (
                  <div className="w-5 h-5 rounded-full bg-[#7afdd6] flex items-center justify-center">
                    <X size={12} className="text-[#2c2c2b]" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                )}
              </div>
            </button>
          ))}

          {translators.length === 0 && (
            <div className="text-center py-8">
              <User size={48} className="mx-auto mb-4 text-[#888888]" />
              <p className="text-[#888888]">No translators available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-[10px] bg-[#2c2c2b] text-white hover:bg-[#3c3c3b] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedTranslator && onAssign(selectedTranslator)}
            disabled={!selectedTranslator || isLoading}
            className="flex-1 px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
