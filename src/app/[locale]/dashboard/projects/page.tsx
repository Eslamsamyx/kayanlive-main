'use client';

import { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Building2,
  Users,
  Calendar,
  DollarSign,
  FileQuestion,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { ProjectStatus } from '@prisma/client';
import { format, differenceInDays } from 'date-fns';

export default function ClientProjectsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    searchParams.get('companyId') || 'ALL'
  );

  const { data: projectsData, isLoading, error } = api.project.getMyProjects.useQuery();
  const { data: companiesData } = api.company.getMyCompanies.useQuery();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-[#b2b2b2]">{error.message}</p>
        </div>
      </div>
    );
  }

  const projects = projectsData || [];
  const companies = companiesData || [];

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const matchesCompany = selectedCompanyId === 'ALL' || project.companyId === selectedCompanyId;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  // Calculate stats with safety checks
  const totalProjects = filteredProjects?.length ?? 0;
  const inProgressCount = filteredProjects?.filter(p => p.status === 'IN_PROGRESS').length ?? 0;
  const completedCount = filteredProjects?.filter(p => p.status === 'COMPLETED').length ?? 0;
  const draftCount = filteredProjects?.filter(p => p.status === 'DRAFT').length ?? 0;

  // Calculate projects with approaching deadlines
  const approachingDeadlines = useMemo(() => {
    if (!filteredProjects || filteredProjects.length === 0) return 0;
    const now = new Date();
    return filteredProjects.filter(p => {
      if (!p.endDate || p.status === 'COMPLETED') return false;
      const daysUntilEnd = differenceInDays(new Date(p.endDate), now);
      return daysUntilEnd >= 0 && daysUntilEnd <= 7;
    }).length;
  }, [filteredProjects]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'REVIEW':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
      case 'PLANNING':
        return 'bg-purple-900/30 text-purple-400 border-purple-700';
      case 'DRAFT':
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
      case 'ARCHIVED':
        return 'bg-gray-900/30 text-gray-600 border-gray-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const calculateProgress = (project: any) => {
    // Simple progress calculation based on status
    switch (project.status) {
      case 'DRAFT':
        return 0;
      case 'PLANNING':
        return 20;
      case 'IN_PROGRESS':
        return 50;
      case 'REVIEW':
        return 80;
      case 'COMPLETED':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-[#b2b2b2] text-lg">
            View and manage projects you're collaborating on
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={totalProjects}
            icon={<FolderKanban className="w-6 h-6" />}
            color="text-[#7afdd6]"
            bgColor="bg-[#7afdd6]/10"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock className="w-6 h-6" />}
            color="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="text-green-400"
            bgColor="bg-green-400/10"
          />
          <StatCard
            title="Deadlines Soon"
            value={approachingDeadlines}
            icon={<AlertCircle className="w-6 h-6" />}
            color="text-yellow-400"
            bgColor="bg-yellow-400/10"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a1a19] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-[#7afdd6] text-white placeholder-[#666]"
              />
            </div>

            <div className="flex gap-4">
              {/* Company Filter */}
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="px-4 py-3 bg-[#1a1a19] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] text-white"
              >
                <option value="ALL">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-[#1a1a19] border border-[#333] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] text-white"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-12 text-center">
            <FolderKanban className="w-16 h-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No projects found
            </h3>
            <p className="text-[#b2b2b2] mb-6">
              {searchTerm || statusFilter !== 'ALL' || selectedCompanyId !== 'ALL'
                ? 'Try adjusting your filters'
                : "You haven't been assigned to any projects yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project);
              const now = new Date();
              const daysUntilEnd = project.endDate
                ? differenceInDays(new Date(project.endDate), now)
                : null;
              const isApproachingDeadline = daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 7 && project.status !== 'COMPLETED';
              const isOverdue = daysUntilEnd !== null && daysUntilEnd < 0 && project.status !== 'COMPLETED';

              return (
                <div
                  key={project.id}
                  className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:shadow-xl hover:border-[#7afdd6] transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      {/* Project Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-[#7afdd6]/20 to-[#7afdd6]/5 rounded-lg">
                          <FolderKanban className="h-6 w-6 text-[#7afdd6]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Link
                              href={`/en/dashboard/projects/${project.id}`}
                              className="text-xl font-semibold text-white hover:text-[#7afdd6] transition-colors"
                            >
                              {project.name}
                            </Link>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                            {isOverdue && (
                              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-red-900/30 text-red-400 border border-red-700 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                OVERDUE
                              </span>
                            )}
                            {isApproachingDeadline && (
                              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {daysUntilEnd} {daysUntilEnd === 1 ? 'DAY' : 'DAYS'} LEFT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#b2b2b2]">
                            <Building2 className="h-4 w-4" />
                            <span>{project.company.name}</span>
                            {project.myRole && (
                              <>
                                <span className="text-[#666]">•</span>
                                <span className="px-2 py-0.5 bg-[#1a1a19] text-[#7afdd6] text-xs rounded-full border border-[#333]">
                                  {project.myRole}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-[#b2b2b2] mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#b2b2b2]">Progress</span>
                          <span className="text-sm font-semibold text-[#7afdd6]">{progress}%</span>
                        </div>
                        <div className="w-full bg-[#1a1a19] rounded-full h-2 border border-[#333]">
                          <div
                            className="bg-gradient-to-r from-[#7afdd6] to-[#6ee8c5] h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {project.startDate && (
                          <div>
                            <p className="text-xs text-[#666] mb-1">Start Date</p>
                            <div className="flex items-center gap-1 text-sm text-white">
                              <Calendar className="h-3 w-3 text-[#7afdd6]" />
                              <span>{format(new Date(project.startDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        )}
                        {project.endDate && (
                          <div>
                            <p className="text-xs text-[#666] mb-1">End Date</p>
                            <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                              <Calendar className="h-3 w-3 text-[#7afdd6]" />
                              <span>{format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        )}
                        {project.budget && (
                          <div>
                            <p className="text-xs text-[#666] mb-1">Budget</p>
                            <div className="flex items-center gap-1 text-sm text-white">
                              <DollarSign className="h-3 w-3 text-[#7afdd6]" />
                              <span>${project.budget.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-[#666] border-t border-[#333] pt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#7afdd6]" />
                          <span className="text-[#b2b2b2]">{project._count.collaborators} collaborators</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileQuestion className="h-4 w-4 text-[#7afdd6]" />
                          <span className="text-[#b2b2b2]">{project._count.questionnaires} briefs</span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start">
                      <Link
                        href={`/en/dashboard/projects/${project.id}`}
                        className="px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-sm flex items-center gap-2 group"
                      >
                        View Details
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
  // Ensure value is always a valid number for rendering
  const displayValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:border-[#7afdd6] transition-all">
      <div className="mb-4">
        <div className={`p-3 rounded-lg ${bgColor} inline-block`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-[#b2b2b2] text-sm font-semibold mb-1">{title}</p>
        <p
          className="text-3xl font-bold"
          style={{
            color: '#ffffff',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            position: 'relative',
            zIndex: 10
          }}
        >
          {displayValue.toString()}
        </p>
      </div>
    </div>
  );
}
