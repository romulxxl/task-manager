'use client'

import { View, Status, Priority, SortBy } from '@/lib/types'
import { clsx } from 'clsx'

interface TaskFiltersProps {
  statusFilter: Status | 'all'
  priorityFilter: Priority | 'all'
  sortBy: SortBy
  view: View
  onStatusFilterChange: (value: Status | 'all') => void
  onPriorityFilterChange: (value: Priority | 'all') => void
  onSortChange: (value: SortBy) => void
}

export default function TaskFilters({
  statusFilter,
  priorityFilter,
  sortBy,
  view,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortChange,
}: TaskFiltersProps) {
  const selectClass =
    'text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer'

  const hasFilters =
    statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'created_at'

  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      {view !== 'completed' && (
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as Status | 'all')}
            className={selectClass}
          >
            <option value="all">All</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as Priority | 'all')}
          className={selectClass}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className={selectClass}
        >
          <option value="created_at">Date Created</option>
          <option value="due_date">Due Date</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            onStatusFilterChange('all')
            onPriorityFilterChange('all')
            onSortChange('created_at')
          }}
          className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Reset filters
        </button>
      )}
    </div>
  )
}
