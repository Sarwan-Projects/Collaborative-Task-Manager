import { Filter, RotateCcw } from 'lucide-react';
import { Priority, Status, TaskFilters as Filters } from '../../types';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface TaskFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export default function TaskFilters({ filters, onChange, onReset }: TaskFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(Status).map((s) => ({ value: s, label: s }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.values(Priority).map((p) => ({ value: p, label: p }))
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'priority', label: 'Priority' }
  ];

  const orderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  const hasActiveFilters = filters.status || filters.priority;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Filter className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
            Active
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value as Status || undefined })}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={filters.priority || ''}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as Priority || undefined })}
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={filters.sortBy || 'dueDate'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
        />

        <Select
          label="Order"
          options={orderOptions}
          value={filters.sortOrder || 'asc'}
          onChange={(e) => onChange({ ...filters, sortOrder: e.target.value as any })}
        />

        <div className="flex items-end">
          <Button variant="secondary" onClick={onReset} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
