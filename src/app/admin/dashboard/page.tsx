'use client';

import { useSession } from 'next-auth/react';
import { api } from '@/trpc/react';
import {
  Users,
  TrendingUp,
  Trophy,
  Building2,
  FolderKanban,
  Package,
  FileText,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '@/app/admin/companies/components';

export default function AdminDashboard() {
  const { data: session } = useSession();

  // Fetch all stats
  const { data: leadStats, isLoading: leadLoading } = api.lead.getStats.useQuery();
  const { data: userStats, isLoading: userLoading } = api.user.getStats.useQuery();
  const { data: companyStats, isLoading: companyLoading } = api.company.getStats.useQuery();
  const { data: projectStats, isLoading: projectLoading } = api.project.getStats.useQuery();
  const { data: assetStats, isLoading: assetLoading } = api.asset.getStats.useQuery();
  const { data: submissionStats, isLoading: submissionLoading } = api.questionnaire.getStats.useQuery();

  const isLoading = leadLoading || userLoading || companyLoading || projectLoading || assetLoading || submissionLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
          Admin Dashboard
        </h1>
        <p className="text-[#888888] text-lg">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </motion.div>

      {/* Platform Overview - Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Companies"
            value={companyStats?.total || 0}
            icon={<Building2 size={24} strokeWidth={2} />}
            gradient="#7afdd6, #b8a4ff"
          />
          <StatCard
            title="Total Projects"
            value={projectStats?.total || 0}
            icon={<FolderKanban size={24} strokeWidth={2} />}
            gradient="#b8a4ff, #7afdd6"
          />
          <StatCard
            title="Total Users"
            value={userStats?.total || 0}
            icon={<Users size={24} strokeWidth={2} />}
            gradient="#7afdd6, #A095E1"
          />
        </div>
      </motion.div>

      {/* Content & Assets - Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Content & Assets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Assets"
            value={assetStats?.total || 0}
            icon={<Package size={24} strokeWidth={2} />}
            gradient="#A095E1, #7afdd6"
          />
          <StatCard
            title="Submissions"
            value={submissionStats?.totalSubmissions || 0}
            icon={<FileText size={24} strokeWidth={2} />}
            gradient="#7afdd6, #b8a4ff"
          />
          <StatCard
            title="Completed Briefs"
            value={submissionStats?.completedSubmissions || 0}
            icon={<CheckCircle size={24} strokeWidth={2} />}
            gradient="#b8a4ff, #7afdd6"
          />
        </div>
      </motion.div>

      {/* Sales & Leads - Row 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Sales & Leads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={leadStats?.total || 0}
            icon={<TrendingUp size={24} strokeWidth={2} />}
            gradient="#7afdd6, #A095E1"
          />
          <StatCard
            title="New Leads"
            value={leadStats?.new || 0}
            icon={<Clock size={24} strokeWidth={2} />}
            gradient="#A095E1, #7afdd6"
          />
          <StatCard
            title="Won Deals"
            value={leadStats?.won || 0}
            icon={<Trophy size={24} strokeWidth={2} />}
            gradient="#7afdd6, #b8a4ff"
          />
          <StatCard
            title="In Progress"
            value={projectStats?.statusDistribution?.IN_PROGRESS || 0}
            icon={<Loader2 size={24} strokeWidth={2} />}
            gradient="#b8a4ff, #7afdd6"
          />
        </div>
      </motion.div>

      {/* Detailed Breakdowns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <LeadStatusBreakdown leadStats={leadStats} />
        <ProjectStatusBreakdown projectStats={projectStats} />
        <UserRoleBreakdown userStats={userStats} />
        <AssetTypeBreakdown assetStats={assetStats} />
      </motion.div>
    </div>
  );
}


interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  won: number;
  lost: number;
}

function LeadStatusBreakdown({ leadStats }: { leadStats: LeadStats | undefined }) {
  if (!leadStats) return null;

  const statuses = [
    { name: 'New', value: leadStats.new, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { name: 'Contacted', value: leadStats.contacted, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' },
    { name: 'Qualified', value: leadStats.qualified, color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    { name: 'Won', value: leadStats.won, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { name: 'Lost', value: leadStats.lost, color: 'bg-red-500/20 text-red-400 border-red-500/20' },
  ];

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
        Lead Status Breakdown
      </h3>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {status.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {status.value}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                {leadStats.total > 0 ? Math.round((status.value / leadStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface UserStats {
  total: number;
  roleDistribution: Record<string, number>;
}

// Helper to format role names
const formatRoleName = (role: string): string => {
  return role
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper to get color for role
const getRoleColor = (index: number): string => {
  const colors = [
    'bg-red-500/20 text-red-400 border-red-500/20',
    'bg-blue-500/20 text-blue-400 border-blue-500/20',
    'bg-green-500/20 text-green-400 border-green-500/20',
    'bg-purple-500/20 text-purple-400 border-purple-500/20',
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    'bg-pink-500/20 text-pink-400 border-pink-500/20',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    'bg-orange-500/20 text-orange-400 border-orange-500/20',
    'bg-teal-500/20 text-teal-400 border-teal-500/20',
  ];
  return colors[index % colors.length]!;
};

function UserRoleBreakdown({ userStats }: { userStats: UserStats | undefined }) {
  if (!userStats) return null;

  // Convert roleDistribution to array and sort by count
  const roles = Object.entries(userStats.roleDistribution)
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([role, count], index) => ({
      name: formatRoleName(role),
      value: count,
      color: getRoleColor(index),
    }));

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
        User Role Breakdown
      </h3>
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {role.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {role.value}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${role.color}`}>
                {userStats.total > 0 ? Math.round((role.value / userStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProjectStats {
  total: number;
  statusDistribution: {
    DRAFT?: number;
    IN_PROGRESS?: number;
    COMPLETED?: number;
    ON_HOLD?: number;
  };
}

function ProjectStatusBreakdown({ projectStats }: { projectStats: ProjectStats | undefined }) {
  if (!projectStats) return null;

  const statuses = [
    { name: 'Draft', value: projectStats.statusDistribution.DRAFT || 0, color: 'bg-gray-500/20 text-gray-400 border-gray-500/20' },
    { name: 'In Progress', value: projectStats.statusDistribution.IN_PROGRESS || 0, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { name: 'Completed', value: projectStats.statusDistribution.COMPLETED || 0, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { name: 'On Hold', value: projectStats.statusDistribution.ON_HOLD || 0, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' },
  ];

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
        Project Status Breakdown
      </h3>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {status.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {status.value}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                {projectStats.total > 0 ? Math.round((status.value / projectStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AssetStats {
  total: number;
  typeDistribution: {
    IMAGE?: number;
    VIDEO?: number;
    DOCUMENT?: number;
    AUDIO?: number;
    MODEL_3D?: number;
    DESIGN?: number;
    OTHER?: number;
  };
}

function AssetTypeBreakdown({ assetStats }: { assetStats: AssetStats | undefined }) {
  if (!assetStats) return null;

  const types = [
    { name: 'Images', value: assetStats.typeDistribution.IMAGE || 0, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { name: 'Videos', value: assetStats.typeDistribution.VIDEO || 0, color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    { name: 'Documents', value: assetStats.typeDistribution.DOCUMENT || 0, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { name: 'Audio', value: assetStats.typeDistribution.AUDIO || 0, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' },
    { name: '3D Models', value: assetStats.typeDistribution.MODEL_3D || 0, color: 'bg-pink-500/20 text-pink-400 border-pink-500/20' },
  ];

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
        Asset Type Breakdown
      </h3>
      <div className="space-y-3">
        {types.map((type) => (
          <div key={type.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {type.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {type.value}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${type.color}`}>
                {assetStats.total > 0 ? Math.round((type.value / assetStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}