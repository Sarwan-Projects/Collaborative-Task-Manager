import { useState } from 'react';
import { ClipboardList, Clock, AlertTriangle, Plus, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useDashboard, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { Task, Status } from '../types';
import { TaskInput } from '../lib/validations';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleSubmit = (formData: TaskInput) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask._id, data: formData },
        { onSuccess: () => { setIsModalOpen(false); setEditingTask(null); } }
      );
    } else {
      createTask.mutate(formData, {
        onSuccess: () => { setIsModalOpen(false); }
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (isLoading) return <DashboardSkeleton />;

  const completedCount = data?.assignedToMe?.filter(t => t.status === Status.COMPLETED).length || 0;
  const totalAssigned = data?.assignedToMe?.length || 0;
  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  const stats = [
    { 
      label: 'Assigned to Me', 
      value: totalAssigned, 
      icon: ClipboardList, 
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    { 
      label: 'Created by Me', 
      value: data?.createdByMe?.length || 0, 
      icon: Clock, 
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50'
    },
    { 
      label: 'Overdue', 
      value: data?.overdue?.length || 0, 
      icon: AlertTriangle, 
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50'
    }
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">Here's what's happening with your tasks today.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-white/50 card-hover`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
        
        {/* Completion Rate Card */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-white/50 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-purple-600">{completionRate}%</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned to Me */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Assigned to Me</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
              {data?.assignedToMe?.length || 0}
            </span>
          </div>
          <div className="space-y-4">
            {data?.assignedToMe?.length ? (
              data.assignedToMe.slice(0, 5).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?.id}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned to you</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Overdue Tasks</h2>
            {(data?.overdue?.length || 0) > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                {data?.overdue?.length || 0}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {data?.overdue?.length ? (
              data.overdue.slice(0, 5).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?.id}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500">No overdue tasks. Great job! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask || undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={createTask.isPending || updateTask.isPending}
        />
      </Modal>
    </div>
  );
}
