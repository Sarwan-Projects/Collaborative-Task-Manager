import { format } from 'date-fns';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { TaskInvitation } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface InvitationCardProps {
  invitation: TaskInvitation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export default function InvitationCard({ invitation, onAccept, onReject, isLoading }: InvitationCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-lg">📋</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{invitation.taskId.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{invitation.taskId.description}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-lg">👤</span>
          <span className="text-gray-700">
            <span className="font-semibold text-indigo-600">{invitation.fromUserId.name}</span>
            <span className="text-gray-500"> wants to assign you this task</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {format(new Date(invitation.taskId.dueDate), 'MMM d, yyyy')}</span>
          </div>
          <Badge variant="priority" value={invitation.taskId.priority} />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button
          variant="gradient"
          size="sm"
          onClick={() => onAccept(invitation._id)}
          isLoading={isLoading}
          className="flex-1"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Accept
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onReject(invitation._id)}
          isLoading={isLoading}
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
}
