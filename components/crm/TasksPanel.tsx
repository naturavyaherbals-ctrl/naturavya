import { Task, TaskPriority, UserRole } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface TasksPanelProps {
  tasks: Task[];
  userRole: UserRole;
  onCompleteTask: (taskId: string) => Promise<void>;
  onAddTask: () => void;
}

const priorityConfig: Record<TaskPriority, { icon: typeof AlertCircle; color: string; bg: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Urgent' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  medium: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medium' },
  low: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Low' },
};

export function TasksPanel({ tasks, userRole, onCompleteTask, onAddTask }: TasksPanelProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await onCompleteTask(taskId);
    } finally {
      setCompletingId(null);
    }
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    } else {
      return { text: `Due in ${diffDays}d`, isOverdue: false };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          Pending Tasks
          {pendingTasks.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {pendingTasks.length}
            </span>
          )}
        </h2>
        {(userRole === 'manager' || userRole === 'superadmin') && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>

      <div className="p-4">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No pending tasks for this lead</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const priority = priorityConfig[task.priority] || priorityConfig.medium;
              const PriorityIcon = priority.icon;
              const dueInfo = formatDueDate(task.due_at);

              return (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-sm',
                    task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  )}
                >
                  {/* Complete Button */}
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={completingId === task.id}
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      'hover:bg-green-100 hover:border-green-500 hover:text-green-600',
                      completingId === task.id ? 'border-gray-300' : 'border-gray-300 text-transparent'
                    )}
                  >
                    {completingId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                      <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', priority.bg, priority.color)}>
                        <PriorityIcon className="w-3 h-3" />
                        {priority.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {dueInfo && (
                        <span className={cn(
                          'flex items-center gap-1',
                          dueInfo.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                        )}>
                          <Clock className="w-3 h-3" />
                          {dueInfo.text}
                        </span>
                      )}
                      {task.assigned_agent_name && (
                        <span className="text-gray-400">
                          → {task.assigned_agent_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Tasks Summary */}
        {completedTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {completedTasks.length} task{completedTasks.length > 1 ? 's' : ''} completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
