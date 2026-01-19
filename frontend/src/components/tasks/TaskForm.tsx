import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, Priority, Status } from '../../types';
import { taskSchema, TaskInput } from '../../lib/validations';
import { useUsers } from '../../hooks/useUsers';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskInput | Partial<TaskInput>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const { data: users = [] } = useUsers();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  // Determine permissions
  const creatorId = task?.creatorId 
    ? (typeof task.creatorId === 'string' ? task.creatorId : (task.creatorId as any)._id || (task.creatorId as any).id)
    : null;
  const assigneeId = task?.assignedToId
    ? (typeof task.assignedToId === 'string' ? task.assignedToId : (task.assignedToId as any)._id || (task.assignedToId as any).id)
    : null;
  
  // Use pending invitation user if no assignee yet
  const effectiveAssigneeId = assigneeId || task?.pendingInvitationUserId || '';
  
  const isCreator = creatorId === currentUserId;
  const isAssignee = assigneeId === currentUserId;
  
  // Assignee can only edit status, creator can edit all
  const isStatusOnlyMode = task && !isCreator && isAssignee;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task?.priority || Priority.MEDIUM,
      status: task?.status || Status.TODO,
      assignedToId: effectiveAssigneeId
    }
  });

  const priorityOptions = Object.values(Priority).map((p) => ({ value: p, label: p }));
  
  // Assignees can only change status to To Do, In Progress, or Review (not Completed)
  const statusOptions = isStatusOnlyMode 
    ? [
        { value: Status.TODO, label: Status.TODO },
        { value: Status.IN_PROGRESS, label: Status.IN_PROGRESS },
        { value: Status.REVIEW, label: Status.REVIEW }
      ]
    : Object.values(Status).map((s) => ({ value: s, label: s }));
  
  // Build user options - include "Unassigned" only for new tasks or when creator is editing
  const userOptions = [
    // Only show "Unassigned" option if no task exists or if creator is editing
    ...(!task || isCreator ? [{ value: '', label: 'Unassigned' }] : []),
    ...users.map((u) => ({ value: u.id, label: u.name }))
  ];

  return (
    <form onSubmit={handleSubmit((data) => {
      // If assignee (status-only mode), only send status field
      if (isStatusOnlyMode) {
        onSubmit({ status: data.status });
      } else {
        onSubmit(data);
      }
    })} className="space-y-5">
      {isStatusOnlyMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium">
            ℹ️ You can only update the status of this task. Contact the task creator to modify other details.
          </p>
        </div>
      )}

      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        disabled={isStatusOnlyMode}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Add more details about this task..."
        error={errors.description?.message}
        disabled={isStatusOnlyMode}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Due Date"
          error={errors.dueDate?.message}
          disabled={isStatusOnlyMode}
          {...register('dueDate')}
        />

        <Select
          label="Assign To"
          options={userOptions}
          error={errors.assignedToId?.message}
          disabled={isStatusOnlyMode}
          {...register('assignedToId')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={priorityOptions}
          error={errors.priority?.message}
          disabled={isStatusOnlyMode}
          {...register('priority')}
        />

        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
