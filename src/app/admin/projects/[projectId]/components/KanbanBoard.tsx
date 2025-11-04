'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { api } from '@/trpc/react';
import { TaskStatus, Priority } from '@prisma/client';
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { CreateTaskModal } from './CreateTaskModal';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  name: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  estimatedTime?: number | null;
  actualTime?: number | null;
  order: number;
  tags: string[];
  completedAt?: Date | null;
  assignees: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  }>;
  _count: {
    comments: number;
  };
}

interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
}

const columns: Column[] = [
  { id: 'concept', title: 'Concept', status: TaskStatus.CONCEPT, color: 'from-gray-500/20 to-gray-600/20' },
  { id: 'in-progress', title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'from-yellow-500/20 to-orange-500/20' },
  { id: 'in-review', title: 'In Review', status: TaskStatus.IN_REVIEW, color: 'from-blue-500/20 to-purple-500/20' },
  { id: 'completed', title: 'Completed', status: TaskStatus.COMPLETED, color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'approved', title: 'Approved', status: TaskStatus.APPROVED, color: 'from-[#7afdd6]/20 to-[#b8a4ff]/20' },
];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>(TaskStatus.CONCEPT);

  const { data: tasks = [], refetch } = api.task.list.useQuery({ projectId });
  const updateOrderMutation = api.task.updateOrder.useMutation({
    onSuccess: () => refetch(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailsOpen(true);
  };

  const handleCreateTask = (status: TaskStatus) => {
    setCreateTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overColumn = columns.find((c) => c.id === over.id);

    if (!activeTask || !overColumn) return;

    if (activeTask.status !== overColumn.status) {
      // Optimistically update the UI
      const updatedTasks = tasks.map(t =>
        t.id === activeTask.id ? { ...t, status: overColumn.status } : t
      );

      // Update on server
      updateOrderMutation.mutate({
        tasks: [{ id: activeTask.id, order: activeTask.order, status: overColumn.status }]
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current || !over.data.current) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (activeTask.id !== overTask.id && activeTask.status === overTask.status) {
      const tasksInColumn = tasks.filter(t => t.status === activeTask.status);
      const activeIndex = tasksInColumn.findIndex((t) => t.id === activeTask.id);
      const overIndex = tasksInColumn.findIndex((t) => t.id === overTask.id);

      const reorderedTasks = arrayMove(tasksInColumn, activeIndex, overIndex);

      // Update order for all tasks in the column
      const updatedTasks = reorderedTasks.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status,
      }));

      updateOrderMutation.mutate({ tasks: updatedTasks });
    }

    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <>
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Task Board
            </h2>
            <p className="text-[#888888] text-sm">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
            </p>
          </div>
        </motion.div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((col, index) => {
            const columnTasks = getTasksByStatus(col.status);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={columnTasks}
                onTaskClick={handleTaskClick}
                onCreateTask={() => handleCreateTask(col.status)}
                index={index}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3">
              <KanbanTaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={isTaskDetailsOpen}
          onClose={() => {
            setIsTaskDetailsOpen(false);
            setSelectedTaskId(null);
          }}
          onUpdate={() => refetch()}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={projectId}
        initialStatus={createTaskStatus}
        onSuccess={() => {
          setIsCreateTaskOpen(false);
          refetch();
        }}
      />
    </>
  );
}
