'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  ListTodo,
  Calendar,
  FolderKanban,
  User,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Circle,
} from 'lucide-react';

type TaskStatus = 'CONCEPT' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'APPROVED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');

  // Fetch all tasks
  const { data: tasks, isLoading, error } = api.task.listAll.useQuery();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Tasks</h3>
          <p className="text-[#b2b2b2]">{error.message}</p>
        </div>
      </div>
    );
  }

  const allTasks = tasks || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const statusMatch = selectedStatus === 'ALL' || task.status === selectedStatus;
      const priorityMatch = selectedPriority === 'ALL' || task.priority === selectedPriority;
      return statusMatch && priorityMatch;
    });
  }, [allTasks, selectedStatus, selectedPriority]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const overdue = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED'
    ).length;
    const inProgress = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const todo = allTasks.filter((t) => t.status === 'CONCEPT').length;

    return { total: allTasks.length, overdue, inProgress, completed, todo };
  }, [allTasks]);

  // Status filter tabs
  const statusFilters: Array<{ label: string; value: TaskStatus | 'ALL'; count: number }> = [
    { label: 'All Tasks', value: 'ALL', count: allTasks.length },
    { label: 'To Do', value: 'CONCEPT', count: stats.todo },
    { label: 'In Progress', value: 'IN_PROGRESS', count: stats.inProgress },
    { label: 'In Review', value: 'IN_REVIEW', count: allTasks.filter((t) => t.status === 'IN_REVIEW').length },
    { label: 'Completed', value: 'COMPLETED', count: stats.completed },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-[#b2b2b2] text-lg">
            Manage and track your assigned tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<ListTodo className="w-6 h-6" />}
            color="text-[#7afdd6]"
            bgColor="bg-[#7afdd6]/10"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-6 h-6" />}
            color="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckSquare className="w-6 h-6" />}
            color="text-green-400"
            bgColor="bg-green-400/10"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="w-6 h-6" />}
            color="text-red-400"
            bgColor="bg-red-400/10"
          />
        </div>

        {/* Filters */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 mb-6">
          {/* Status Filter Tabs */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-[#7afdd6]" />
              <h3 className="text-sm font-semibold text-[#b2b2b2]">Filter by Status</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedStatus === filter.value
                      ? 'bg-[#7afdd6] text-[#2c2c2b]'
                      : 'bg-[#1a1a19] text-[#b2b2b2] hover:bg-[#333] border border-[#333]'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle className="w-4 h-4 text-[#7afdd6]" />
              <h3 className="text-sm font-semibold text-[#b2b2b2]">Filter by Priority</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority as Priority | 'ALL')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedPriority === priority
                      ? 'bg-[#7afdd6] text-[#2c2c2b]'
                      : 'bg-[#1a1a19] text-[#b2b2b2] hover:bg-[#333] border border-[#333]'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-12 text-center">
            <ListTodo className="w-16 h-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No tasks found</h3>
            <p className="text-[#b2b2b2]">
              {selectedStatus !== 'ALL' || selectedPriority !== 'ALL'
                ? 'Try adjusting your filters to see more tasks'
                : 'You don\'t have any tasks assigned yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
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

// Task Card Component
function TaskCard({ task }: { task: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCEPT':
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
      case 'IN_PROGRESS':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'IN_REVIEW':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'APPROVED':
        return 'bg-teal-900/30 text-teal-400 border-teal-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <ArrowUpCircle className="w-4 h-4 text-red-400" />;
      case 'HIGH':
        return <ArrowUpCircle className="w-4 h-4 text-orange-400" />;
      case 'MEDIUM':
        return <Circle className="w-4 h-4 text-yellow-400" />;
      case 'LOW':
        return <ArrowDownCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'LOW':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:shadow-xl hover:border-[#7afdd6] transition-all group">
      <div className="flex items-start gap-4">
        {/* Priority Indicator */}
        <div className="flex-shrink-0 mt-1">{getPriorityIcon(task.priority)}</div>

        <div className="flex-1 min-w-0">
          {/* Task Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-[#7afdd6] transition-colors mb-1">
                {task.name}
              </h3>
              {task.description && (
                <p className="text-[#b2b2b2] text-sm line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border flex-shrink-0 ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          {/* Task Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* Project */}
            {task.project && (
              <Link
                href={`/en/dashboard/projects/${task.project.id}`}
                className="flex items-center gap-1.5 text-[#999] hover:text-[#7afdd6] transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                <span>{task.project.name}</span>
              </Link>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-[#999]'}`}>
                <Calendar className="w-4 h-4" />
                <span>
                  {isOverdue && 'Overdue: '}
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Priority */}
            <div className={`flex items-center gap-1.5 ${getPriorityColor(task.priority)}`}>
              <span className="font-semibold text-xs uppercase">{task.priority}</span>
            </div>

            {/* Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center gap-1.5 text-[#999]">
                <User className="w-4 h-4" />
                <span>
                  {task.assignees.length === 1
                    ? task.assignees[0].name || task.assignees[0].email
                    : `${task.assignees.length} assignees`}
                </span>
              </div>
            )}

            {/* Comments Count */}
            {task._count?.comments > 0 && (
              <div className="flex items-center gap-1.5 text-[#999]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>{task._count.comments}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {task.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[#1a1a19] text-[#7afdd6] text-xs rounded-md border border-[#333]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
