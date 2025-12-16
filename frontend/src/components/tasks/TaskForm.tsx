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
  onSubmit: (data: TaskInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const { data: users = [] } = useUsers();

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
      assignedToId: (task?.assignedToId as any)?._id || (task?.assignedToId as string) || ''
    }
  });

  const priorityOptions = Object.values(Priority).map((p) => ({ value: p, label: p }));
  const statusOptions = Object.values(Status).map((s) => ({ value: s, label: s }));
  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({ value: u.id, label: u.name }))
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Add more details about this task..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Due Date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Select
          label="Assign To"
          options={userOptions}
          error={errors.assignedToId?.message}
          {...register('assignedToId')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={priorityOptions}
          error={errors.priority?.message}
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
