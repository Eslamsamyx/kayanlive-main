'use client';

import { useSession } from 'next-auth/react';
import { api } from '@/trpc/react';
import { Users, TrendingUp, Trophy, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: leadStats } = api.lead.getStats.useQuery();
  const { data: userStats } = api.user.getStats.useQuery();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2b]" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-[#888888] mt-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeadStatusBreakdown leadStats={leadStats} />
        <UserRoleBreakdown userStats={userStats} />
      </div>
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
    <div className="bg-white rounded-[25px] shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`bg-gradient-to-r ${gradient} text-[#2c2c2b] p-3 rounded-[15px]`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-[#2c2c2b]" style={{ fontFamily: '"Poppins", sans-serif' }}>
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
    { name: 'New', value: leadStats.new, color: 'bg-blue-100 text-blue-800' },
    { name: 'Contacted', value: leadStats.contacted, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Qualified', value: leadStats.qualified, color: 'bg-purple-100 text-purple-800' },
    { name: 'Won', value: leadStats.won, color: 'bg-green-100 text-green-800' },
    { name: 'Lost', value: leadStats.lost, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Breakdown</h3>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{status.name}</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">{status.value}</span>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
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
    { name: 'Admins', value: userStats.admins, color: 'bg-red-100 text-red-800' },
    { name: 'Moderators', value: userStats.moderators, color: 'bg-blue-100 text-blue-800' },
    { name: 'Content Creators', value: userStats.contentCreators, color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Breakdown</h3>
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{role.name}</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">{role.value}</span>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                {userStats.total > 0 ? Math.round((role.value / userStats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}