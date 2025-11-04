'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  Package,
  FileText,
  Bell,
} from 'lucide-react';
import { PendingApprovalsWidget } from '@/components/approvals/PendingApprovalsWidget';
import { UpcomingMilestonesWidget } from '@/components/dashboard/UpcomingMilestonesWidget';
import { UpcomingMeetingsWidget } from '@/components/dashboard/UpcomingMeetingsWidget';
import { NotificationsPreviewWidget } from '@/components/dashboard/NotificationsPreviewWidget';
import { RecentDeliverablesWidget } from '@/components/dashboard/RecentDeliverablesWidget';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect non-clients to appropriate dashboards
  if (status !== 'loading' && session) {
    const userRole = session.user?.role;
    if (userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'CONTENT_CREATOR') {
      redirect('/admin/dashboard');
    }
    if (!userRole || (userRole !== 'CLIENT' && userRole !== 'PROJECT_MANAGER')) {
      redirect('/en/login');
    }
  }

  // Fetch data for dashboard widgets
  const { data: projectsData, isLoading: projectsLoading } = api.project.getMyProjects.useQuery();
  const { data: briefsData, isLoading: briefsLoading } = api.questionnaire.getMySubmissions.useQuery({ limit: 5 });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a19]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const projects = projectsData || [];
  const briefs = briefsData?.submissions || [];

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const pendingBriefs = briefs.filter(b => !b.isComplete).length;

  // Get recent/active projects (limit to 3)
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session.user?.name || 'there'}! 👋
          </h1>
          <p className="text-[#b2b2b2] text-lg">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={<FolderKanban className="w-6 h-6" />}
            color="text-[#7afdd6]"
            bgColor="bg-[#7afdd6]/10"
          />
          <StatCard
            title="Completed"
            value={completedProjects}
            icon={<CheckSquare className="w-6 h-6" />}
            color="text-green-400"
            bgColor="bg-green-400/10"
          />
          <StatCard
            title="Total Projects"
            value={projects.length}
            icon={<TrendingUp className="w-6 h-6" />}
            color="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <StatCard
            title="Pending Briefs"
            value={pendingBriefs}
            icon={<FileText className="w-6 h-6" />}
            color="text-yellow-400"
            bgColor="bg-yellow-400/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Projects Widget */}
          <div className="lg:col-span-2 bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#7afdd6]" />
                Active Projects
              </h2>
              <Link
                href="/en/dashboard/projects"
                className="text-[#7afdd6] hover:text-[#6ee8c5] text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-[#666] mx-auto mb-3" />
                <p className="text-[#b2b2b2] mb-4">No projects yet</p>
                <Link
                  href="/en/questionnaire/project-brief"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-sm"
                >
                  Create Project Brief
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#7afdd6]" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <QuickActionButton
                icon={<FileText className="w-5 h-5" />}
                label="Start New Project"
                href="/en/questionnaire/project-brief"
              />
              <QuickActionButton
                icon={<FolderKanban className="w-5 h-5" />}
                label="View Projects"
                href="/en/dashboard/projects"
              />
              <QuickActionButton
                icon={<Package className="w-5 h-5" />}
                label="Browse Deliverables"
                href="/en/dashboard/assets"
              />
              <QuickActionButton
                icon={<CheckSquare className="w-5 h-5" />}
                label="Pending Approvals"
                href="/en/dashboard/approvals"
              />
              <QuickActionButton
                icon={<CalendarDays className="w-5 h-5" />}
                label="Schedule Meeting"
                href="/en/dashboard/meetings"
              />
            </div>

            {/* Recent Activity */}
            <div className="mt-8 pt-6 border-t border-[#333]">
              <h3 className="text-sm font-semibold text-[#b2b2b2] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                {briefs.slice(0, 3).map((brief) => (
                  <div key={brief.id} className="flex items-start gap-2 text-[#999]">
                    <div className="w-1.5 h-1.5 bg-[#7afdd6] rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-[#b2b2b2]">
                        {brief.isComplete ? 'Submitted' : 'Updated'} brief:{' '}
                        <span className="text-white font-medium">
                          {brief.companyName || 'Untitled'}
                        </span>
                      </p>
                      <p className="text-xs text-[#666] mt-0.5">
                        {new Date(brief.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {briefs.length === 0 && (
                  <p className="text-[#666] text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Milestones and Meetings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingMilestonesWidget />
          <UpcomingMeetingsWidget />
        </div>

        {/* Deliverables Widget */}
        <div className="mb-8">
          <RecentDeliverablesWidget />
        </div>

        {/* Notifications Widget */}
        <div className="mb-8">
          <NotificationsPreviewWidget />
        </div>

        {/* Pending Approvals Widget */}
        <div className="mb-8">
          <PendingApprovalsWidget />
        </div>

        {/* Action Items Section */}
        {pendingBriefs > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Action Required
                </h3>
                <p className="text-[#b2b2b2] mb-4">
                  You have {pendingBriefs} incomplete brief{pendingBriefs !== 1 ? 's' : ''} that need{pendingBriefs === 1 ? 's' : ''} your attention.
                </p>
                <Link
                  href="/en/dashboard/briefs"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-[#2c2c2b] rounded-lg hover:bg-yellow-300 transition-all font-semibold text-sm"
                >
                  Complete Briefs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:border-[#7afdd6] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-[#b2b2b2] text-sm font-semibold mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'ON_HOLD':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  return (
    <Link
      href={`/en/dashboard/projects/${project.id}`}
      className="block p-4 rounded-lg border border-[#333] hover:border-[#7afdd6] bg-[#1a1a19] transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold group-hover:text-[#7afdd6] transition-colors flex-1">
          {project.name}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(
            project.status
          )}`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>
      {project.description && (
        <p className="text-[#b2b2b2] text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-[#666]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        {project.company && (
          <span className="flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {project.company.name}
          </span>
        )}
      </div>
    </Link>
  );
}

// Quick Action Button Component
function QuickActionButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-[#333] hover:border-[#7afdd6] hover:bg-[#7afdd6]/5 transition-all group"
    >
      <div className="text-[#666] group-hover:text-[#7afdd6] transition-colors">
        {icon}
      </div>
      <span className="text-[#b2b2b2] group-hover:text-white transition-colors font-medium text-sm">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#7afdd6] ml-auto transition-all group-hover:translate-x-1" />
    </Link>
  );
}
