'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import {
  Building2,
  Calendar,
  DollarSign,
  User,
  Users,
  FileQuestion,
  Target,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ProjectStatus, TaskStatus, MilestoneStatus } from '@prisma/client';
import { useState } from 'react';

const statusColors = {
  [ProjectStatus.DRAFT]: 'bg-gray-500/20 text-gray-400',
  [ProjectStatus.PLANNING]: 'bg-purple-500/20 text-purple-400',
  [ProjectStatus.IN_PROGRESS]: 'bg-yellow-500/20 text-yellow-400',
  [ProjectStatus.REVIEW]: 'bg-blue-500/20 text-blue-400',
  [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
  [ProjectStatus.ARCHIVED]: 'bg-gray-500/20 text-gray-600',
};

export function ProjectOverview({ projectId }: { projectId: string }) {
  const [isAddCollaboratorOpen, setIsAddCollaboratorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'LEAD' | 'MANAGER' | 'MEMBER' | 'VIEWER'>('MEMBER');

  const utils = api.useUtils();
  const { data: project } = api.project.getById.useQuery({ id: projectId });
  const { data: tasks = [] } = api.task.list.useQuery({ projectId });
  const { data: milestones = [] } = api.milestone.list.useQuery({ projectId });

  // Fetch available collaborators from the same company
  const { data: availableUsers = [] } = api.project.getAvailableCollaborators.useQuery(
    {
      projectId,
      search: searchTerm || undefined,
    },
    { enabled: isAddCollaboratorOpen }
  );

  const addCollaboratorMutation = api.project.addCollaborator.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate({ id: projectId });
      setIsAddCollaboratorOpen(false);
      setSearchTerm('');
    },
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6]"></div>
      </div>
    );
  }

  // Calculate statistics
  const taskStats = {
    total: tasks.length,
    concept: tasks.filter(t => t.status === TaskStatus.CONCEPT).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    inReview: tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    approved: tasks.filter(t => t.status === TaskStatus.APPROVED).length,
  };

  const milestoneStats = {
    total: milestones.length,
    pending: milestones.filter(m => m.status === MilestoneStatus.PENDING).length,
    inProgress: milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS).length,
    inReview: milestones.filter(m => m.status === MilestoneStatus.IN_REVIEW).length,
    completed: milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
  };

  const averageProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[25px] p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(122, 253, 214, 0.2)',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 text-[#888888]">
                <Building2 size={16} />
                <span className="text-sm">{project.company.name}</span>
              </div>
            </div>
          </div>
          <button
            className="p-2 text-[#888888] hover:text-white transition-colors"
            title="Edit project"
          >
            <Edit3 size={20} />
          </button>
        </div>

        {project.description && (
          <p className="text-white/80 mb-6">{project.description}</p>
        )}

        {/* Project Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {project.startDate && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-[#888888] mb-2">
                <Calendar size={16} />
                <span className="text-xs">Start Date</span>
              </div>
              <p className="text-white font-semibold">
                {format(new Date(project.startDate), 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {project.endDate && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-[#888888] mb-2">
                <Calendar size={16} />
                <span className="text-xs">End Date</span>
              </div>
              <p className="text-white font-semibold">
                {format(new Date(project.endDate), 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {project.budget && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-[#888888] mb-2">
                <DollarSign size={16} />
                <span className="text-xs">Budget</span>
              </div>
              <p className="text-white font-semibold">${project.budget.toLocaleString()}</p>
            </div>
          )}

          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-[#888888] mb-2">
              <User size={16} />
              <span className="text-xs">Created By</span>
            </div>
            <p className="text-white font-semibold">{project.creator.name || project.creator.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[25px] p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#7afdd6]/20 to-[#b8a4ff]/20 rounded-xl">
              <ListTodo size={24} className="text-[#7afdd6]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tasks</h3>
              <p className="text-2xl font-bold text-white">{taskStats.total}</p>
            </div>
          </div>
          <div className="space-y-2">
            <StatRow label="Concept" value={taskStats.concept} color="text-gray-400" />
            <StatRow label="In Progress" value={taskStats.inProgress} color="text-yellow-400" />
            <StatRow label="In Review" value={taskStats.inReview} color="text-blue-400" />
            <StatRow label="Completed" value={taskStats.completed} color="text-green-400" />
            <StatRow label="Approved" value={taskStats.approved} color="text-[#7afdd6]" />
          </div>
        </motion.div>

        {/* Milestone Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[25px] p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <Target size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Milestones</h3>
              <p className="text-2xl font-bold text-white">{milestoneStats.total}</p>
            </div>
          </div>
          <div className="space-y-2">
            <StatRow label="Pending" value={milestoneStats.pending} color="text-gray-400" />
            <StatRow label="In Progress" value={milestoneStats.inProgress} color="text-yellow-400" />
            <StatRow label="In Review" value={milestoneStats.inReview} color="text-blue-400" />
            <StatRow label="Completed" value={milestoneStats.completed} color="text-green-400" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#888888]">Average Progress</span>
              <span className="text-sm font-semibold text-white">{averageProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Team & Briefs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[25px] p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                <Users size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Team</h3>
                <p className="text-2xl font-bold text-white">{(project as any)._count?.collaborators || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl">
                <FileQuestion size={24} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Briefs</h3>
                <p className="text-2xl font-bold text-white">{(project as any)._count?.questionnaires || 0}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-[#888888] mb-2">Created</p>
              <p className="text-sm text-white">
                {format(new Date(project.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-[25px] p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(122, 253, 214, 0.2)',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users size={20} />
            Team Members
          </h3>
          <button
            onClick={() => setIsAddCollaboratorOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Member
          </button>
        </div>

        {project.collaborators && project.collaborators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.collaborators.map((collaborator, index) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-lg font-semibold text-[#2c2c2b]">
                    {collaborator.user.name?.[0] || collaborator.user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {collaborator.user.name || collaborator.user.email}
                    </p>
                    <p className="text-xs text-[#888888]">{collaborator.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {collaborator.canEdit && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Edit
                    </span>
                  )}
                  {collaborator.canDelete && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Delete
                    </span>
                  )}
                  {collaborator.canInvite && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      Invite
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#888888]">No team members yet. Add some to get started!</p>
          </div>
        )}
      </motion.div>

      {/* Add Collaborator Modal */}
      <AnimatePresence>
        {isAddCollaboratorOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[25px] max-w-2xl w-full"
              style={{
                background: 'rgba(44, 44, 43, 0.98)',
                backdropFilter: 'blur(50px)',
                border: '2px solid rgba(122, 253, 214, 0.3)',
              }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Add Team Member</h2>
                  <button
                    onClick={() => setIsAddCollaboratorOpen(false)}
                    className="p-2 text-[#888888] hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-sm text-[#888888] mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'LEAD' | 'MANAGER' | 'MEMBER' | 'VIEWER')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  >
                    <option value="MEMBER" className="bg-[#2c2c2b]">Member - Can edit project content</option>
                    <option value="MANAGER" className="bg-[#2c2c2b]">Manager - Can edit and invite others</option>
                    <option value="LEAD" className="bg-[#2c2c2b]">Lead - Full control (edit, delete, invite)</option>
                    <option value="VIEWER" className="bg-[#2c2c2b]">Viewer - Read-only access</option>
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableUsers && availableUsers.length > 0 ? (
                    availableUsers.map((user) => {
                      // Define permissions based on role
                      const permissions = {
                        LEAD: { canEdit: true, canDelete: true, canInvite: true },
                        MANAGER: { canEdit: true, canDelete: false, canInvite: true },
                        MEMBER: { canEdit: true, canDelete: false, canInvite: false },
                        VIEWER: { canEdit: false, canDelete: false, canInvite: false },
                      };

                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            addCollaboratorMutation.mutate({
                              projectId,
                              userId: user.id,
                              role: selectedRole,
                              ...permissions[selectedRole],
                            });
                          }}
                          disabled={addCollaboratorMutation.isPending}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-sm font-semibold text-[#2c2c2b]">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">
                                {user.name || user.email}
                              </p>
                              <p className="text-xs text-[#888888] truncate">{user.email}</p>
                            </div>
                            {addCollaboratorMutation.isPending && (
                              <Loader2 size={20} className="animate-spin text-[#7afdd6]" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#888888]">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Questionnaires */}
      {project.questionnaires && project.questionnaires.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-[25px] p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileQuestion size={20} />
            Project Briefs
          </h3>
          <div className="space-y-3">
            {project.questionnaires.map((questionnaire, index) => (
              <motion.div
                key={questionnaire.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {questionnaire.isComplete ? (
                    <CheckCircle2 size={20} className="text-green-400" />
                  ) : (
                    <Clock size={20} className="text-yellow-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Brief #{questionnaire.questionnaireId}</p>
                    <p className="text-xs text-[#888888]">
                      {questionnaire.isComplete
                        ? `Submitted on ${format(new Date(questionnaire.submittedAt!), 'MMM dd, yyyy')}`
                        : 'Pending completion'}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors">
                  View
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#888888]">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
