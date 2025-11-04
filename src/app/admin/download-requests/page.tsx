'use client';

import { api } from '@/trpc/react';
import { Download, Check, X, Clock, User, Package, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DownloadRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(undefined);

  const utils = api.useUtils();

  const { data: requests, isLoading } = api.downloadRequest.listAll.useQuery({
    status: statusFilter,
  });

  const reviewMutation = api.downloadRequest.review.useMutation({
    onSuccess: () => {
      utils.downloadRequest.listAll.invalidate();
    },
  });

  const handleApprove = async (requestId: string) => {
    try {
      await reviewMutation.mutateAsync({ id: requestId, approved: true });
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await reviewMutation.mutateAsync({ id: requestId, approved: false });
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading download requests...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'PENDING').length || 0,
    approved: requests?.filter(r => r.status === 'APPROVED').length || 0,
    rejected: requests?.filter(r => r.status === 'REJECTED').length || 0,
  };

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
          Download Requests
        </h1>
        <p className="text-[#888888] text-lg">
          Manage and approve asset download requests
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={stats.total} icon={<Download size={24} />} gradient="#7afdd6, #b8a4ff" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock size={24} />} gradient="#b8a4ff, #7afdd6" />
        <StatCard title="Approved" value={stats.approved} icon={<Check size={24} />} gradient="#7afdd6, #A095E1" />
        <StatCard title="Rejected" value={stats.rejected} icon={<X size={24} />} gradient="#A095E1, #7afdd6" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === undefined
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-[#3a3a3a] text-[#888888] hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Rejected
        </button>
      </div>

      {/* Requests Table */}
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
              <tr className="border-b border-[#7afdd6]/20">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7afdd6]/10">
              {requests?.map((request) => (
                <tr key={request.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center">
                        <User size={20} className="text-[#2c2c2b]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{request.user.name || request.user.email}</p>
                        <p className="text-xs text-[#888888]">{request.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#7afdd6]" />
                      <div>
                        <p className="text-sm text-white">{request.asset.name}</p>
                        <p className="text-xs text-[#888888]">{request.asset.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#888888] max-w-xs truncate">{request.reason}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#7afdd6]" />
                      <span className="text-sm text-[#888888]">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                          : request.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                          : 'bg-red-500/20 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={reviewMutation.isPending || request.status === 'APPROVED'}
                          className={`p-2 rounded-lg transition-all ${
                            request.status === 'APPROVED'
                              ? 'bg-green-500/30 text-green-300 border-2 border-green-500/50 cursor-not-allowed'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-transparent hover:border-green-500/30'
                          } disabled:opacity-50`}
                          title={request.status === 'APPROVED' ? 'Currently Approved' : 'Approve Request'}
                        >
                          {reviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={reviewMutation.isPending || request.status === 'REJECTED'}
                          className={`p-2 rounded-lg transition-all ${
                            request.status === 'REJECTED'
                              ? 'bg-red-500/30 text-red-300 border-2 border-red-500/50 cursor-not-allowed'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-transparent hover:border-red-500/30'
                          } disabled:opacity-50`}
                          title={request.status === 'REJECTED' ? 'Currently Rejected' : 'Reject Request'}
                        >
                          {reviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        </button>
                      </div>
                      {request.status !== 'PENDING' && request.reviewer && (
                        <div className="text-xs text-[#888888] flex items-center gap-1">
                          <User size={12} />
                          <span>by {request.reviewer.name || request.reviewer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!requests?.length && (
            <div className="text-center py-12">
              <Download size={48} className="mx-auto text-[#888888] mb-4" />
              <p className="text-[#888888]">No download requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: number; icon: React.ReactNode; gradient: string }) {
  return (
    <div
      className="rounded-[25px] p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" />

      <div className="flex items-center justify-between relative z-10">
        <div className="p-4 rounded-[18px]" style={{
          background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`,
          boxShadow: `0 8px 16px ${gradient.split(',')[0]}40`
        }}>
          <div className="text-[#1a1a19]">{icon}</div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
