import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { Task, TaskFilters as Filters } from '../types';
import { TaskInput } from '../lib/validations';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { TaskCardSkeleton } from '../components/ui/Skeleton';

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({ sortBy: 'dueDate', sortOrder: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const resetFilters = () => {
    setFilters({ sortBy: 'dueDate', sortOrder: 'asc' });
    setSearchQuery('');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Tasks</h1>
          <p className="text-gray-500">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} total
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTasks.length ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first task'}
          </p>
          <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}

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
