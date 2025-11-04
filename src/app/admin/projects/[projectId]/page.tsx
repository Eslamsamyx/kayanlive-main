'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react';
import {
  ArrowLeft,
  ListTodo,
  Target,
  Bell,
  Calendar,
  Presentation,
  FolderOpen,
  Users,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard, MilestonesSection, ProjectOverview, MeetingsSection, PresentationsSection, AssetsSection } from './components';

type TabType = 'overview' | 'tasks' | 'milestones' | 'meetings' | 'presentations' | 'assets';

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: FolderOpen },
  { id: 'tasks' as TabType, label: 'Tasks', icon: ListTodo },
  { id: 'milestones' as TabType, label: 'Milestones', icon: Target },
  { id: 'meetings' as TabType, label: 'Meetings', icon: Calendar },
  { id: 'presentations' as TabType, label: 'Presentations', icon: Presentation },
  { id: 'assets' as TabType, label: 'Assets', icon: FolderOpen },
];

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { data: project, isLoading } = api.project.getById.useQuery({ id: projectId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#888888]">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
          <p className="text-[#888888] mb-4">The project you're looking for doesn't exist.</p>
          <Link
            href="/admin/projects"
            className="px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-[#7afdd6] hover:text-[#b8a4ff] transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{
                background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {project.name}
            </h1>
            <p className="text-[#888888]">{project.company.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div
          className="inline-flex p-1 rounded-[25px] gap-1"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 rounded-[20px] font-medium transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? 'text-[#2c2c2b]'
                      : 'text-[#888888] hover:text-white'
                  }
                `}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-[20px]"
                    style={{
                      background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={18} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <ProjectOverview projectId={projectId} />}
        {activeTab === 'tasks' && <KanbanBoard projectId={projectId} />}
        {activeTab === 'milestones' && <MilestonesSection projectId={projectId} />}
        {activeTab === 'meetings' && <MeetingsSection projectId={projectId} />}
        {activeTab === 'presentations' && <PresentationsSection projectId={projectId} />}
        {activeTab === 'assets' && <AssetsSection projectId={projectId} />}
      </motion.div>
    </div>
  );
}
