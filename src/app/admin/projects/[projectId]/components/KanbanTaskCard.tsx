'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, User, Clock, AlertCircle, AlertTriangle, ArrowUp, Target } from 'lucide-react';
import { TaskStatus, Priority } from '@prisma/client';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface Task {
  id: string;
  name: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  tags: string[];
  milestoneId?: string | null;
  assignees: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
  _count: {
    comments: number;
  };
}

const priorityConfig = {
  [Priority.LOW]: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: null },
  [Priority.MEDIUM]: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: null },
  [Priority.HIGH]: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle },
  [Priority.URGENT]: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle },
};

export function KanbanTaskCard({
  task,
  onClick,
  isDragging = false,
}: {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && task.status !== TaskStatus.COMPLETED) {
      return { text: 'Overdue', color: 'text-red-400 bg-red-500/20' };
    }
    if (isToday(dueDate)) {
      return { text: 'Due today', color: 'text-orange-400 bg-orange-500/20' };
    }
    if (isTomorrow(dueDate)) {
      return { text: 'Due tomorrow', color: 'text-yellow-400 bg-yellow-500/20' };
    }
    return { text: format(dueDate, 'MMM dd'), color: 'text-[#888888] bg-white/5' };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group cursor-pointer rounded-xl p-4 transition-all duration-200
        ${isDragging || isSortableDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}
      `}
      style={{
        ...style,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(122, 253, 214, 0.15)',
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      {/* Priority Indicator */}
      {task.priority !== Priority.LOW && (
        <div className={`flex items-center gap-1.5 mb-2 ${priorityInfo.color}`}>
          {PriorityIcon && <PriorityIcon size={14} />}
          <span className="text-xs font-medium uppercase">{task.priority}</span>
        </div>
      )}

      {/* Task Title */}
      <h4 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-[#7afdd6] transition-colors">
        {task.name}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-[#888888] text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Milestone Badge */}
      {task.milestoneId && (
        <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit">
          <Target size={12} className="text-purple-400" />
          <span className="text-xs text-purple-400">Linked to Milestone</span>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-[#7afdd6]/10 text-[#7afdd6] text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-white/5 text-[#888888] text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee) => (
            <div
              key={assignee.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-xs font-semibold text-[#2c2c2b] border-2 border-[#2c2c2b]"
              title={assignee.name || 'Unassigned'}
            >
              {assignee.image ? (
                <img
                  src={assignee.image}
                  alt={assignee.name || ''}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (assignee.name?.[0] || 'U').toUpperCase()
              )}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white border-2 border-[#2c2c2b]">
              +{task.assignees.length - 3}
            </div>
          )}
          {task.assignees.length === 0 && (
            <div
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border-2 border-[#2c2c2b]"
              title="Unassigned"
            >
              <User size={12} className="text-[#888888]" />
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2">
          {task._count.comments > 0 && (
            <div className="flex items-center gap-1 text-[#888888]">
              <MessageSquare size={14} />
              <span className="text-xs">{task._count.comments}</span>
            </div>
          )}

          {dueDateStatus && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${dueDateStatus.color}`}>
              <Calendar size={12} />
              <span>{dueDateStatus.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
