import { format, isPast, formatDistanceToNow } from 'date-fns';
import { Calendar, Trash2, Edit, Clock, AlertCircle } from 'lucide-react';
import { Task, User, Status } from '../../types';
import Badge from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

export default function TaskCard({ task, onEdit, onDelete, currentUserId }: TaskCardProps) {
  const creator = task.creatorId as User;
  const assignee = task.assignedToId as User | null;
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== Status.COMPLETED;
  const isCreator = creator?.id === currentUserId || (creator as any)?._id === currentUserId;
  const dueDate = new Date(task.dueDate);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 p-5 card-hover shadow-sm hover:shadow-xl group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
            title="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          {isCreator && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="status" value={task.status} />
        <Badge variant="priority" value={task.priority} />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {isOverdue ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          <span className="font-medium">{format(dueDate, 'MMM d, yyyy')}</span>
          {isOverdue ? (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Overdue
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              ({formatDistanceToNow(dueDate, { addSuffix: true })})
            </span>
          )}
        </div>
        
        {assignee && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {(assignee.name || assignee.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <span>{assignee.name || assignee.email}</span>
          </div>
        )}
      </div>

      {/* Progress indicator for status */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                task.status === Status.COMPLETED ? 'w-full bg-gradient-to-r from-emerald-500 to-teal-500' :
                task.status === Status.REVIEW ? 'w-3/4 bg-gradient-to-r from-purple-500 to-violet-500' :
                task.status === Status.IN_PROGRESS ? 'w-1/2 bg-gradient-to-r from-blue-500 to-indigo-500' :
                'w-1/4 bg-gradient-to-r from-slate-400 to-gray-500'
              }`}
            />
          </div>
          <Clock className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
