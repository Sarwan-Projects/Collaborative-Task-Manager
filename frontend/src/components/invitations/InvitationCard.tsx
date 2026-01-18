import { format } from 'date-fns';
import { Calendar, User, CheckCircle, XCircle } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{invitation.taskId.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{invitation.taskId.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          From: <span className="font-medium">{invitation.fromUserId.name}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(invitation.taskId.dueDate), 'MMM d, yyyy')}</span>
        </div>
        <Badge variant="priority" value={invitation.taskId.priority} />
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
