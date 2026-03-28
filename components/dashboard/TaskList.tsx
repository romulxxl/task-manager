'use client'

import { Task, View } from '@/lib/types'
import TaskCard from './TaskCard'
import TaskFilters from './TaskFilters'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  statusFilter: string
  priorityFilter: string
  sortBy: 'due_date' | 'created_at'
  view: View
  onStatusFilterChange: (value: string) => void
  onPriorityFilterChange: (value: string) => void
  onSortChange: (value: 'due_date' | 'created_at') => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggleComplete: (task: Task) => void
  onRetry: () => void
}

const emptyMessages: Record<View, { title: string; description: string }> = {
  all: {
    title: 'No tasks yet',
    description: 'Create your first task to get started.',
  },
  today: {
    title: 'Nothing due today',
    description: 'No tasks are scheduled for today.',
  },
  upcoming: {
    title: 'No upcoming tasks',
    description: 'No tasks are scheduled for the future.',
  },
  completed: {
    title: 'No completed tasks',
    description: 'Tasks you complete will appear here.',
  },
}

export default function TaskList({
  tasks,
  loading,
  error,
  statusFilter,
  priorityFilter,
  sortBy,
  view,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortChange,
  onEdit,
  onDelete,
  onToggleComplete,
  onRetry,
}: TaskListProps) {
  if (loading) {
    return (
      <div>
        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortBy={sortBy}
          view={view}
          onStatusFilterChange={onStatusFilterChange}
          onPriorityFilterChange={onPriorityFilterChange}
          onSortChange={onSortChange}
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Failed to load tasks</h3>
        <p className="text-xs text-gray-500 mb-4 max-w-xs">{error}</p>
        <button
          onClick={onRetry}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    )
  }

  const { title, description } = emptyMessages[view]

  return (
    <div>
      <TaskFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        sortBy={sortBy}
        view={view}
        onStatusFilterChange={onStatusFilterChange}
        onPriorityFilterChange={onPriorityFilterChange}
        onSortChange={onSortChange}
      />

      {tasks.length === 0 ? (
        <EmptyState title={title} description={description} />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
