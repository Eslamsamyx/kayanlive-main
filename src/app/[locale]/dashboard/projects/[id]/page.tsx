'use client';

import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState } from 'react';
import {
  FolderKanban,
  Building2,
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  CalendarDays,
  Package,
  Activity,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Award,
  Upload,
  MessageSquare,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ApprovalsTab } from '@/components/approvals/ApprovalsTab';
import { FileUploadZone } from '@/components/uploads/FileUploadZone';
import { ClientUploadsList } from '@/components/uploads/ClientUploadsList';
import { CommentThread } from '@/components/comments/CommentThread';
import { MilestoneTimeline } from '@/components/projects/MilestoneTimeline';
import { ProjectDeliverables } from '@/components/projects/ProjectDeliverables';
import { ProjectActivity } from '@/components/projects/ProjectActivity';
import { ProjectMeetings } from '@/components/projects/ProjectMeetings';

type TabType = 'overview' | 'milestones' | 'tasks' | 'meetings' | 'deliverables' | 'activity' | 'approvals' | 'files' | 'comments';

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const projectId = params?.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch project details
  const { data: project, isLoading, error } = api.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  // Fetch project tasks
  const { data: tasks } = api.task.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Fetch project meetings
  const { data: meetings } = api.meeting.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Project</h3>
          <p className="text-[#b2b2b2]">{error?.message || 'Project not found'}</p>
          <Link
            href="/en/dashboard/projects"
            className="mt-4 inline-block px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const allTasks = tasks || [];
  const allMeetings = meetings || [];

  // Calculate stats
  const now = new Date();
  const daysUntilEnd = project.endDate ? differenceInDays(new Date(project.endDate), now) : null;
  const isOverdue = daysUntilEnd !== null && daysUntilEnd < 0 && project.status !== 'COMPLETED';
  const isApproachingDeadline = daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 7 && project.status !== 'COMPLETED';

  const taskStats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: allTasks.filter(t => t.status === 'CONCEPT').length,
  };

  const upcomingMeetings = allMeetings.filter(m => new Date(m.startTime) >= now);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'REVIEW':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'PLANNING':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Award className="w-4 h-4" /> },
    { id: 'deliverables', label: 'Deliverables', icon: <Package className="w-4 h-4" /> },
    { id: 'meetings', label: 'Meetings', icon: <CalendarDays className="w-4 h-4" />, count: allMeetings.length },
    { id: 'approvals', label: 'Approvals', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'files', label: 'Files', icon: <Upload className="w-4 h-4" /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, count: allTasks.length },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/en/dashboard/projects"
          className="inline-flex items-center gap-2 text-[#7afdd6] hover:text-[#6ee8c5] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-[#7afdd6]/20 to-[#7afdd6]/5 rounded-xl">
              <FolderKanban className="h-8 w-8 text-[#7afdd6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
                {isOverdue && (
                  <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-full bg-red-900/30 text-red-400 border border-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    OVERDUE
                  </span>
                )}
                {isApproachingDeadline && (
                  <span className="px-3 py-1.5 text-xs font-bold uppercase rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {daysUntilEnd} {daysUntilEnd === 1 ? 'DAY' : 'DAYS'} LEFT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[#b2b2b2] text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#7afdd6]" />
                  {project.company.name}
                </div>
              </div>
            </div>
          </div>

          {project.description && (
            <p className="text-[#b2b2b2] mb-4">{project.description}</p>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStat icon={<CheckSquare className="w-5 h-5" />} label="Tasks" value={`${taskStats.completed}/${taskStats.total}`} color="text-[#7afdd6]" />
            <QuickStat icon={<CalendarDays className="w-5 h-5" />} label="Meetings" value={upcomingMeetings.length} color="text-blue-400" />
            <QuickStat icon={<Users className="w-5 h-5" />} label="Team" value={project.collaborators?.length || 0} color="text-purple-400" />
            {project.budget && (
              <QuickStat icon={<DollarSign className="w-5 h-5" />} label="Budget" value={`$${(project.budget / 1000).toFixed(0)}k`} color="text-green-400" />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#7afdd6] text-[#7afdd6]'
                    : 'border-transparent text-[#b2b2b2] hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="font-semibold">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-[#7afdd6] text-[#2c2c2b]' : 'bg-[#333] text-[#b2b2b2]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab project={project} taskStats={taskStats} />}
          {activeTab === 'milestones' && <MilestonesTab projectId={projectId} />}
          {activeTab === 'deliverables' && <ProjectDeliverables projectId={projectId} />}
          {activeTab === 'meetings' && <ProjectMeetings projectId={projectId} />}
          {activeTab === 'approvals' && <ApprovalsTab projectId={projectId} />}
          {activeTab === 'activity' && <ProjectActivity projectId={projectId} limit={50} />}
          {activeTab === 'files' && <FilesTab projectId={projectId} />}
          {activeTab === 'comments' && <CommentsTab projectId={projectId} />}
          {activeTab === 'tasks' && <TasksTab tasks={allTasks} projectId={projectId} />}
        </div>
      </div>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-[#666] text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ project, taskStats }: { project: any; taskStats: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Project Dates & Budget */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {project.startDate && (
              <div>
                <p className="text-[#666] text-sm mb-1">Start Date</p>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4 text-[#7afdd6]" />
                  {format(new Date(project.startDate), 'MMM dd, yyyy')}
                </div>
              </div>
            )}
            {project.endDate && (
              <div>
                <p className="text-[#666] text-sm mb-1">End Date</p>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4 text-[#7afdd6]" />
                  {format(new Date(project.endDate), 'MMM dd, yyyy')}
                </div>
              </div>
            )}
            {project.budget && (
              <div>
                <p className="text-[#666] text-sm mb-1">Budget</p>
                <div className="flex items-center gap-2 text-white">
                  <DollarSign className="w-4 h-4 text-[#7afdd6]" />
                  ${project.budget.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Task Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[#b2b2b2]">Completed</span>
                <span className="text-[#7afdd6] font-semibold">{taskStats.completed}/{taskStats.total}</span>
              </div>
              <div className="w-full bg-[#1a1a19] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#7afdd6] to-[#6ee8c5] h-full rounded-full"
                  style={{ width: `${taskStats.total ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-[#1a1a19] rounded-lg border border-[#333]">
                <p className="text-2xl font-bold text-white">{taskStats.todo}</p>
                <p className="text-xs text-[#666]">To Do</p>
              </div>
              <div className="text-center p-3 bg-[#1a1a19] rounded-lg border border-[#333]">
                <p className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</p>
                <p className="text-xs text-[#666]">In Progress</p>
              </div>
              <div className="text-center p-3 bg-[#1a1a19] rounded-lg border border-[#333]">
                <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
                <p className="text-xs text-[#666]">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Team Members */}
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7afdd6]" />
              Team Members
            </h3>
            <div className="space-y-3">
              {project.collaborators.slice(0, 5).map((collab: any) => (
                <div key={collab.id} className="flex items-center gap-3">
                  {collab.user.image ? (
                    <img src={collab.user.image} alt={collab.user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#7afdd6] flex items-center justify-center text-[#2c2c2b] font-bold">
                      {(collab.user.name || collab.user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{collab.user.name || collab.user.email}</p>
                    <p className="text-[#666] text-xs">{collab.role}</p>
                  </div>
                </div>
              ))}
              {project.collaborators.length > 5 && (
                <p className="text-[#7afdd6] text-sm text-center pt-2">
                  +{project.collaborators.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tasks Tab
function TasksTab({ tasks, projectId }: { tasks: any[]; projectId: string }) {
  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <h3 className="text-lg font-bold text-white mb-4">Project Tasks</h3>
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#b2b2b2]">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-[#1a1a19] rounded-lg border border-[#333] hover:border-[#7afdd6] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{task.name}</h4>
                  {task.description && (
                    <p className="text-[#b2b2b2] text-sm mb-2 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#666]">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </span>
                    )}
                    {task.assignees && task.assignees.length > 0 && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignees.length}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  task.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-gray-900/30 text-gray-400'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Milestones Tab
function MilestonesTab({ projectId }: { projectId: string }) {
  return <MilestoneTimeline projectId={projectId} />;
}

// Files Tab
function FilesTab({ projectId }: { projectId: string }) {
  const [uploadsRefreshKey, setUploadsRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Upload Files</h3>
        <FileUploadZone
          projectId={projectId}
          onUploadComplete={() => setUploadsRefreshKey(prev => prev + 1)}
        />
      </div>

      <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Project Files</h3>
        <ClientUploadsList key={uploadsRefreshKey} projectId={projectId} />
      </div>
    </div>
  );
}

// Comments Tab
function CommentsTab({ projectId }: { projectId: string }) {
  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <CommentThread
        commentableType="PROJECT"
        commentableId={projectId}
        title="Project Comments"
      />
    </div>
  );
}
