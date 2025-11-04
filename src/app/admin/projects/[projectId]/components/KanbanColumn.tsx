'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanTaskCard } from './KanbanTaskCard';
import { TaskStatus, Priority } from '@prisma/client';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  name: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  tags: string[];
  assignees: Array<{
    id: string;
    name: string | null;
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

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onCreateTask,
  index,
}: {
  column: Column;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
  index: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-80"
    >
      <div
        className={`
          rounded-[25px] p-4 min-h-[600px] transition-all duration-300
          ${isOver ? 'ring-2 ring-[#7afdd6] ring-opacity-50' : ''}
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(122, 253, 214, 0.2)',
        }}
      >
        {/* Column Header */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between mb-2 p-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${column.color})`,
            }}
          >
            <div>
              <h3
                className="font-semibold text-white text-sm"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {column.title}
              </h3>
              <span className="text-xs text-white/70">{tasks.length} tasks</span>
            </div>
            <button
              onClick={onCreateTask}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Add task"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div ref={setNodeRef} className="space-y-3">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task.id)}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div
              className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-white/10"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <p className="text-[#888888] text-sm">No tasks yet</p>
              <p className="text-[#888888] text-xs mt-1">Drag tasks here or click + to add</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
