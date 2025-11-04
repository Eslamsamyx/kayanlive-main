'use client';

import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  HardDrive,
  FileType,
  Users,
  Upload,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ADMIN-only access check
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/en/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
  }, [session, status, router]);

  // Show loading or prevent render during auth check
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a19]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#333] border-t-[#7afdd6]" />
      </div>
    );
  }

  // Fetch overview data
  const { data: overview, isLoading: overviewLoading } =
    api.analytics.overview.useQuery();

  // Fetch trends data (last 30 days)
  const { data: trends, isLoading: trendsLoading } =
    api.analytics.trends.useQuery({ days: 30 });

  // Fetch file types distribution
  const { data: fileTypes, isLoading: fileTypesLoading } =
    api.analytics.fileTypes.useQuery();

  // Fetch top content
  const { data: topAssets, isLoading: topAssetsLoading } =
    api.analytics.topContent.useQuery({ metric: 'views', limit: 10 });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } =
    api.analytics.recentActivity.useQuery({ limit: 10 });

  const isLoading =
    overviewLoading ||
    trendsLoading ||
    fileTypesLoading ||
    topAssetsLoading ||
    activityLoading;

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Colors for charts
  const COLORS = ['#7afdd6', '#6ce7c3', '#5dd1b0', '#4ebb9d', '#3fa58a'];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a19]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#333] border-t-[#7afdd6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a19] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#7afdd6]" />
          <h1 className="text-3xl font-bold">Asset Analytics Dashboard</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Assets */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <FileType className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Total Assets</span>
            </div>
            <p className="text-3xl font-bold">{overview?.totalAssets ?? 0}</p>
          </div>

          {/* Total Views */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <Eye className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Total Views</span>
            </div>
            <p className="text-3xl font-bold">{overview?.totalViews ?? 0}</p>
          </div>

          {/* Total Downloads */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <Download className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Total Downloads</span>
            </div>
            <p className="text-3xl font-bold">
              {overview?.totalDownloads ?? 0}
            </p>
          </div>

          {/* Storage Used */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <HardDrive className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Storage Used</span>
            </div>
            <p className="text-3xl font-bold">
              {formatBytes(overview?.totalStorage ?? 0)}
            </p>
          </div>

          {/* Recent Uploads */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <Upload className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Last 30 Days</span>
            </div>
            <p className="text-3xl font-bold">
              {overview?.recentUploads ?? 0}
            </p>
          </div>

          {/* Active Users */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                <Users className="w-5 h-5 text-[#7afdd6]" />
              </div>
              <span className="text-sm text-[#b2b2b2]">Active Users</span>
            </div>
            <p className="text-3xl font-bold">
              {overview?.activeUsersCount ?? 0}
            </p>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#7afdd6]" />
            <h2 className="text-xl font-semibold">Activity Trends (30 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#b2b2b2" />
              <YAxis stroke="#b2b2b2" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2c2b',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#7afdd6"
                strokeWidth={2}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke="#6ce7c3"
                strokeWidth={2}
                name="Downloads"
              />
              <Line
                type="monotone"
                dataKey="uploads"
                stroke="#5dd1b0"
                strokeWidth={2}
                name="Uploads"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* File Types Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <h2 className="text-xl font-semibold mb-6">
              File Types Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypes ?? []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(fileTypes ?? []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2c2c2b',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
            <h2 className="text-xl font-semibold mb-6">Storage by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fileTypes ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="type" stroke="#b2b2b2" />
                <YAxis stroke="#b2b2b2" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2c2c2b',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatBytes(value)}
                />
                <Bar dataKey="totalSize" fill="#7afdd6" name="Storage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
          <h2 className="text-xl font-semibold mb-6">
            Top 10 Most Viewed Assets
          </h2>
          <div className="space-y-4">
            {topAssets?.map((asset, index) => (
              <div
                key={asset.id}
                className="flex items-center gap-4 p-4 bg-[#1a1a19] rounded-lg hover:bg-[#333] transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7afdd6]/10 flex items-center justify-center text-[#7afdd6] font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {asset.name || asset.fileName}
                  </p>
                  <p className="text-sm text-[#b2b2b2]">
                    {asset.type} • {formatBytes(Number(asset.fileSize))}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#b2b2b2]">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{asset.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{asset.downloadCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#2c2c2b] rounded-lg p-6 border border-[#333]">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-[#1a1a19] rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#7afdd6]/10 flex items-center justify-center">
                  {activity.type === 'ASSET_VIEWED' && (
                    <Eye className="w-5 h-5 text-[#7afdd6]" />
                  )}
                  {activity.type === 'ASSET_DOWNLOADED' && (
                    <Download className="w-5 h-5 text-[#7afdd6]" />
                  )}
                  {activity.type === 'ASSET_UPLOADED' && (
                    <Upload className="w-5 h-5 text-[#7afdd6]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {activity.user.name || activity.user.email}
                  </p>
                  <p className="text-sm text-[#b2b2b2]">
                    {activity.description}
                  </p>
                  {activity.asset && (
                    <p className="text-sm text-[#7afdd6] mt-1">
                      {activity.asset.name || activity.asset.fileName}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-[#b2b2b2]">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
