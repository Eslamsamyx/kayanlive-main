'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { FolderKanban, Building2 } from 'lucide-react';

export default function ClientBriefsPage() {
  const t = useTranslations('dashboard');
  const { data: session, status } = useSession();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  const { data, isLoading, error } = api.questionnaire.getMySubmissions.useQuery({
    limit: 20,
  });

  const { data: projectsData } = api.project.getMyProjects.useQuery();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your briefs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Briefs</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const submissions = data?.submissions || [];
  const projects = projectsData || [];

  // Filter submissions by project
  const filteredSubmissions = submissions.filter(submission => {
    if (selectedProjectId === 'ALL') return true;
    return submission.projectId === selectedProjectId;
  });

  return (
    <div className="container mx-auto px-6 py-8 bg-[#1a1a19] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            My Project Briefs
          </h1>
          <p className="text-[#b2b2b2] mt-2 font-medium">
            View and manage your submitted questionnaires
          </p>
        </div>
        <Link
          href="/questionnaire/project-brief"
          className="group px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-xl hover:bg-[#6ee8c5] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Brief
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg p-6 border border-[#333] hover:border-[#7afdd6] hover:shadow-xl transition-all">
          <div className="text-sm font-semibold text-[#7afdd6] mb-1">Total Submissions</div>
          <div className="text-3xl font-bold text-white">{filteredSubmissions.length}</div>
        </div>
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg p-6 border border-[#333] hover:border-green-400 hover:shadow-xl transition-all">
          <div className="text-sm font-semibold text-green-400 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-400">
            {filteredSubmissions.filter(s => s.isComplete).length}
          </div>
        </div>
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg p-6 border border-[#333] hover:border-yellow-400 hover:shadow-xl transition-all">
          <div className="text-sm font-semibold text-yellow-400 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-yellow-400">
            {filteredSubmissions.filter(s => !s.isComplete).length}
          </div>
        </div>
      </div>

      {/* Project Filter */}
      {projects.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#b2b2b2] mb-2">
            Filter by Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-3 border border-[#333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-[#7afdd6] w-full md:w-auto bg-[#2c2c2b] shadow-lg hover:border-[#444] transition-colors font-medium text-white"
          >
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.company.name})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-12 text-center">
          <div className="text-[#7afdd6] mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {submissions.length === 0 ? 'No briefs yet' : 'No briefs found'}
          </h3>
          <p className="text-[#b2b2b2] mb-6 font-medium">
            {submissions.length === 0
              ? 'Get started by creating your first project brief'
              : 'Try adjusting your filters to see more results'}
          </p>
          <Link
            href="/questionnaire/project-brief"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-xl hover:bg-[#6ee8c5] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Brief
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((submission) => {
            const submissionProject = projects.find(p => p.id === submission.projectId);
            return (
            <div
              key={submission.id}
              className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:shadow-xl hover:border-[#7afdd6] transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {submission.companyName || 'Untitled Brief'}
                    </h3>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        submission.isComplete
                          ? 'bg-green-900/30 text-green-400 border border-green-700'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                      }`}
                    >
                      {submission.isComplete ? 'Complete' : 'Draft'}
                    </span>
                  </div>

                  {/* Project Information */}
                  {submissionProject && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <div className="flex items-center gap-1 text-[#7afdd6]">
                        <FolderKanban className="h-4 w-4" />
                        <span className="font-medium">{submissionProject.name}</span>
                      </div>
                      <span className="text-[#666]">•</span>
                      <div className="flex items-center gap-1 text-[#b2b2b2]">
                        <Building2 className="h-4 w-4" />
                        <span>{submissionProject.company.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 mb-4">
                    {submission.contactPerson && (
                      <p className="text-[#b2b2b2]">
                        <span className="font-medium text-white">Contact:</span> {submission.contactPerson}
                      </p>
                    )}
                    {submission.email && (
                      <p className="text-[#b2b2b2]">
                        <span className="font-medium text-white">Email:</span> {submission.email}
                      </p>
                    )}
                    {submission.industry && (
                      <p className="text-[#b2b2b2]">
                        <span className="font-medium text-white">Industry:</span> {submission.industry}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#999]">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {submission.submittedAt
                        ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
                        : `Created ${new Date(submission.createdAt).toLocaleDateString()}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {submission.answers.length} answers
                    </span>
                    {submission.uploadedFiles.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        {submission.uploadedFiles.length} files
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/dashboard/briefs/${submission.id}`}
                  className="group px-5 py-2.5 text-[#7afdd6] hover:bg-[#7afdd6]/10 rounded-xl transition-all duration-200 font-semibold border border-transparent hover:border-[#7afdd6] hover:shadow-sm flex items-center gap-2"
                >
                  View Details
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
