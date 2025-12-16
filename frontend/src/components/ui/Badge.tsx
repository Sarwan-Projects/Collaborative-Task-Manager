import { Priority, Status } from '../../types';

interface BadgeProps {
  variant: 'priority' | 'status';
  value: Priority | Status;
}

export default function Badge({ variant, value }: BadgeProps) {
  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25';
      case Priority.HIGH:
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25';
      case Priority.MEDIUM:
        return 'bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 shadow-lg shadow-yellow-500/25';
      case Priority.LOW:
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusStyles = (status: Status) => {
    switch (status) {
      case Status.COMPLETED:
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25';
      case Status.REVIEW:
        return 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25';
      case Status.IN_PROGRESS:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25';
      case Status.TODO:
        return 'bg-gradient-to-r from-slate-400 to-gray-500 text-white shadow-lg shadow-slate-500/25';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const styles = variant === 'priority' 
    ? getPriorityStyles(value as Priority) 
    : getStatusStyles(value as Status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles}`}>
      {value}
    </span>
  );
}
