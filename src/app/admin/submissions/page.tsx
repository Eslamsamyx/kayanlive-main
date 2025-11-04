'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Edit3, Users, Loader2, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'draft'>('all');
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = api.questionnaire.getAllSubmissions.useQuery({
    limit: 50,
    isComplete: filter === 'all' ? undefined : filter === 'completed',
  });

  const { data: stats } = api.questionnaire.getStats.useQuery();

  const publicFormUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/en/questionnaire/project-brief`
    : '/en/questionnaire/project-brief';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-[25px] p-6"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-red-400" size={24} />
          <h3 className="text-red-400 font-semibold" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Error Loading Submissions
          </h3>
        </div>
        <p className="text-red-400/80">{error.message}</p>
      </div>
    );
  }

  const submissions = data?.submissions || [];

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
            lineHeight: '1.1',
          }}
        >
          Client Brief Submissions
        </h1>
        <p className="text-[#888888] text-lg mb-6">
          View and manage all client questionnaire submissions
        </p>

        {/* Link to Public Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/en/questionnaire/project-brief"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
              color: '#2c2c2b',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <FileText size={20} />
            <span>View Public Form</span>
            <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <button
            onClick={handleCopyLink}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg border-2"
            style={{
              background: copied ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: copied ? 'rgba(74, 222, 128, 0.5)' : 'rgba(122, 253, 214, 0.3)',
              color: copied ? '#4ade80' : 'white',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {copied ? (
              <>
                <Check size={20} />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <div
            className="hidden md:block px-4 py-2 rounded-xl text-xs text-[#888888]"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            💡 Share this link with clients
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Dashboard */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" style={{ background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)' }} />
            <div className="flex items-center justify-between relative z-10">
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
                  boxShadow: '0 8px 16px rgba(122, 253, 214, 0.4)'
                }}
              >
                <FileText className="text-[#1a1a19]" size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Total Submissions
                </p>
                <p className="text-4xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {stats.totalSubmissions.toLocaleString()}
                </p>
              </div>
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
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }} />
            <div className="flex items-center justify-between relative z-10">
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  boxShadow: '0 8px 16px rgba(74, 222, 128, 0.4)'
                }}
              >
                <CheckCircle className="text-[#1a1a19]" size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Completed
                </p>
                <p className="text-4xl font-bold text-green-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {stats.completedSubmissions.toLocaleString()}
                </p>
                <p className="text-xs text-[#888888] mt-1">{stats.completionRate}% rate</p>
              </div>
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
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }} />
            <div className="flex items-center justify-between relative z-10">
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                  boxShadow: '0 8px 16px rgba(250, 204, 21, 0.4)'
                }}
              >
                <Edit3 className="text-[#1a1a19]" size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Draft
                </p>
                <p className="text-4xl font-bold text-yellow-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {stats.draftSubmissions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-[25px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(168, 85, 247, 0.2)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
            <div className="flex items-center justify-between relative z-10">
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  boxShadow: '0 8px 16px rgba(168, 85, 247, 0.4)'
                }}
              >
                <Users className="text-[#1a1a19]" size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Total Clients
                </p>
                <p className="text-4xl font-bold text-purple-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {stats.totalClients.toLocaleString()}
                </p>
                <p className="text-xs text-[#888888] mt-1">{stats.recentSubmissions} in last 7 days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-[25px] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        <div className="flex border-b border-[#7afdd6]/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-medium transition-all ${
              filter === 'all'
                ? 'text-[#7afdd6] border-b-2 border-[#7afdd6]'
                : 'text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            All Submissions ({stats?.totalSubmissions || 0})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 font-medium transition-all ${
              filter === 'completed'
                ? 'text-[#7afdd6] border-b-2 border-[#7afdd6]'
                : 'text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Completed ({stats?.completedSubmissions || 0})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-6 py-3 font-medium transition-all ${
              filter === 'draft'
                ? 'text-[#7afdd6] border-b-2 border-[#7afdd6]'
                : 'text-[#888888] hover:text-white'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Drafts ({stats?.draftSubmissions || 0})
          </button>
        </div>
      </motion.div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {submissions.length === 0 ? (
          <div
            className="rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <FileText className="mx-auto h-16 w-16 text-[#888888] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              No submissions found
            </h3>
            <p className="text-[#888888]">There are no {filter !== 'all' && filter} submissions yet.</p>
          </div>
        ) : (
          <div
            className="rounded-[25px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#7afdd6]/20">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Industry
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#888888] uppercase tracking-wider" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7afdd6]/10">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
                            }}
                          >
                            <span className="text-[#1a1a19] font-semibold text-sm">
                              {submission.user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {submission.user.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-[#888888]">{submission.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {submission.companyName || <span className="text-[#888888] italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {submission.email || <span className="text-[#888888] italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {submission.industry || <span className="text-[#888888] italic">N/A</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#888888]">
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString()
                          : new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                            submission.isComplete
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {submission.isComplete ? 'Complete' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/submissions/${submission.id}`}
                          className="text-[#7afdd6] hover:text-[#b8a4ff] transition-colors"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
