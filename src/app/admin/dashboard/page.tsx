'use client';

import { useSession } from 'next-auth/react';
import { api } from '@/trpc/react';
import { Users, TrendingUp, Trophy, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: leadStats } = api.lead.getStats.useQuery();
  const { data: userStats } = api.user.getStats.useQuery();

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

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Leads"
          value={leadStats?.total || 0}
          icon={<TrendingUp size={24} strokeWidth={2} />}
          gradient="from-[#7afdd6] to-[#b8a4ff]"
        />
        <StatCard
          title="New Leads"
          value={leadStats?.new || 0}
          icon={<UserPlus size={24} strokeWidth={2} />}
          gradient="from-[#b8a4ff] to-[#7afdd6]"
        />
        <StatCard
          title="Won Deals"
          value={leadStats?.won || 0}
          icon={<Trophy size={24} strokeWidth={2} />}
          gradient="from-[#7afdd6] to-[#A095E1]"
        />
        <StatCard
          title="Total Users"
          value={userStats?.total || 0}
          icon={<Users size={24} strokeWidth={2} />}
          gradient="from-[#A095E1] to-[#7afdd6]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <LeadStatusBreakdown leadStats={leadStats} />
        <UserRoleBreakdown userStats={userStats} />
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '1px solid rgba(122, 253, 214, 0.2)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className={`bg-gradient-to-r ${gradient} text-[#2c2c2b] p-3 rounded-[15px]`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
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
  admins: number;
  moderators: number;
  contentCreators: number;
}

function UserRoleBreakdown({ userStats }: { userStats: UserStats | undefined }) {
  if (!userStats) return null;

  const roles = [
    { name: 'Admins', value: userStats.admins, color: 'bg-red-500/20 text-red-400 border-red-500/20' },
    { name: 'Moderators', value: userStats.moderators, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { name: 'Content Creators', value: userStats.contentCreators, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
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