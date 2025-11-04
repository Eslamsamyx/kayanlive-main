'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { ProjectStatus, type Project } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  FolderKanban,
  Users,
  Building2,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileQuestion,
  UserPlus,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { StatCard, Toast } from '../companies/components';
import {
  ProjectItem,
  ProjectDetails,
  CreateProjectModal,
  DeleteConfirmModal,
  AddCollaboratorModal,
  LinkQuestionnaireModal,
} from './components';

type ExtendedProject = Project & {
  company: { id: string; name: string };
  creator: { id: string; name: string | null; email: string };
  _count?: { collaborators?: number; questionnaires?: number; assets?: number };
};

type ProjectDetailsType = ExtendedProject & {
  collaborators: Array<{
    id: string;
    role: string;
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  }>;
  questionnaires: Array<{
    id: string;
    questionnaireId: string;
    isComplete: boolean;
    submittedAt: Date | null;
    createdAt: Date;
  }>;
};

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ExtendedProject | null>(null);

  const { data: session } = useSession();

  const { data: projectsData, refetch } = api.project.getAll.useQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as ProjectStatus),
    page: currentPage,
    limit: 20,
  });

  const { data: projectDetails } = api.project.getById.useQuery(
    { id: selectedProject! },
    { enabled: !!selectedProject }
  );

  const { data: projectStats } = api.project.getStats.useQuery();
  const { data: companies } = api.company.getAll.useQuery({ limit: 100 });

  const utils = api.useUtils();

  const createProjectMutation = api.project.create.useMutation({
    onSuccess: () => {
      refetch();
      utils.project.getStats.invalidate();
      setShowCreateModal(false);
      addToast('Project created successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to create project', 'error');
    },
  });

  const updateProjectMutation = api.project.update.useMutation({
    onSuccess: () => {
      refetch();
      utils.project.getById.invalidate({ id: selectedProject! });
      addToast('Project updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update project', 'error');
    },
  });

  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: () => {
      refetch();
      utils.project.getStats.invalidate();
      setShowDeleteModal(false);
      setProjectToDelete(null);
      if (selectedProject === projectToDelete?.id) {
        setSelectedProject(null);
      }
      addToast('Project deleted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete project', 'error');
    },
  });

  const addCollaboratorMutation = api.project.addCollaborator.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate({ id: selectedProject! });
      setShowCollaboratorModal(false);
      addToast('Collaborator added successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to add collaborator', 'error');
    },
  });

  const removeCollaboratorMutation = api.project.removeCollaborator.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate({ id: selectedProject! });
      addToast('Collaborator removed successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to remove collaborator', 'error');
    },
  });

  const linkQuestionnaireMutation = api.project.linkQuestionnaire.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate({ id: selectedProject! });
      utils.project.getAvailableQuestionnaires.invalidate({ projectId: selectedProject! });
      setShowQuestionnaireModal(false);
      addToast('Questionnaire linked successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to link questionnaire', 'error');
    },
  });

  const unlinkQuestionnaireMutation = api.project.unlinkQuestionnaire.useMutation({
    onSuccess: () => {
      utils.project.getById.invalidate({ id: selectedProject! });
      utils.project.getAvailableQuestionnaires.invalidate({ projectId: selectedProject! });
      addToast('Questionnaire unlinked successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to unlink questionnaire', 'error');
    },
  });

  const { data: availableQuestionnaires } = api.project.getAvailableQuestionnaires.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject && showQuestionnaireModal }
  );

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const filteredProjects = projectsData?.projects || [];

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
            lineHeight: '1.1',
          }}
        >
          Project Management
        </h1>
        <p className="text-[#888888] text-lg">
          Manage projects, assign collaborators, and track progress
        </p>
      </motion.div>

      {/* Stats Cards */}
      {projectStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Projects"
            value={projectStats.total}
            icon={<FolderKanban size={24} />}
            gradient="#7afdd6, #b8a4ff"
          />
          <StatCard
            title="In Progress"
            value={projectStats.statusDistribution.IN_PROGRESS || 0}
            icon={<Loader2 size={24} className="animate-spin" />}
            gradient="#b8a4ff, #7afdd6"
          />
          <StatCard
            title="Completed"
            value={projectStats.statusDistribution.COMPLETED || 0}
            icon={<Check size={24} />}
            gradient="#7afdd6, #A095E1"
          />
          <StatCard
            title="Draft"
            value={projectStats.statusDistribution.DRAFT || 0}
            icon={<Edit3 size={24} />}
            gradient="#A095E1, #7afdd6"
          />
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>

        <div className="flex gap-4 items-center">
          {/* Create Project Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Plus size={16} />
            Create Project
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            style={{ fontFamily: '"Poppins", sans-serif' }}
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div
            className="rounded-[25px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="px-6 py-4 border-b border-[#7afdd6]/20">
              <h3
                className="text-lg font-medium text-[#7afdd6]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Projects ({filteredProjects.length})
              </h3>
            </div>
            <div className="divide-y divide-[#7afdd6]/10">
              {filteredProjects.map((project, index) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isSelected={selectedProject === project.id}
                  onSelect={() => setSelectedProject(project.id)}
                  onDelete={() => {
                    setProjectToDelete(project);
                    setShowDeleteModal(true);
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {projectsData && projectsData.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: projectsData.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold'
                        : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-[#7afdd6]'
                    }`}
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Project Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-1"
        >
          {selectedProject && projectDetails ? (
            <ProjectDetails
              project={projectDetails}
              onUpdate={(data) => updateProjectMutation.mutate({ id: selectedProject, ...data })}
              onAddCollaborator={() => setShowCollaboratorModal(true)}
              onRemoveCollaborator={(userId) =>
                removeCollaboratorMutation.mutate({ projectId: selectedProject, userId })
              }
              onLinkQuestionnaire={() => setShowQuestionnaireModal(true)}
              onUnlinkQuestionnaire={(submissionId) =>
                unlinkQuestionnaireMutation.mutate({ projectId: selectedProject, submissionId })
              }
            />
          ) : (
            <div
              className="rounded-[25px] p-8 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(50.5px)',
                WebkitBackdropFilter: 'blur(50.5px)',
                border: '2px solid rgba(122, 253, 214, 0.3)',
              }}
            >
              <FolderKanban className="mx-auto mb-4 text-[#7afdd6]" size={48} />
              <p
                className="text-[#888888]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Select a project to view details
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && companies && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createProjectMutation.mutate(data)}
          isLoading={createProjectMutation.isPending}
          companies={companies.companies}
        />
      )}

      {showDeleteModal && projectToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
          onConfirm={() => deleteProjectMutation.mutate({ id: projectToDelete.id })}
          isLoading={deleteProjectMutation.isPending}
          project={projectToDelete}
        />
      )}

      {showCollaboratorModal && projectDetails && selectedProject && (
        <AddCollaboratorModal
          isOpen={showCollaboratorModal}
          onClose={() => setShowCollaboratorModal(false)}
          onSubmit={(data) =>
            addCollaboratorMutation.mutate({ projectId: selectedProject, ...data })
          }
          isLoading={addCollaboratorMutation.isPending}
          companyId={projectDetails.companyId}
          projectId={selectedProject}
        />
      )}

      {showQuestionnaireModal && (
        <LinkQuestionnaireModal
          isOpen={showQuestionnaireModal}
          onClose={() => setShowQuestionnaireModal(false)}
          onSubmit={(submissionId) =>
            linkQuestionnaireMutation.mutate({ projectId: selectedProject!, submissionId })
          }
          isLoading={linkQuestionnaireMutation.isPending}
          questionnaires={availableQuestionnaires || []}
        />
      )}
    </div>
  );
}

