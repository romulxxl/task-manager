'use client'

import { Task } from '@/lib/types'
import PriorityBadge from '@/components/ui/PriorityBadge'
import { format, parseISO, isValid, isPast, isToday } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggleComplete: (task: Task) => void
}

const statusConfig = {
  todo: { label: 'To Do', className: 'text-gray-500 bg-gray-100' },
  in_progress: { label: 'In Progress', className: 'text-blue-600 bg-blue-50' },
  done: { label: 'Done', className: 'text-green-600 bg-green-50' },
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const isDone = task.status === 'done'

  const dueDateDisplay = (() => {
    if (!task.due_date) return null
    const d = parseISO(task.due_date)
    if (!isValid(d)) return null
    const overdue = !isDone && isPast(d) && !isToday(d)
    const today = isToday(d)
    return {
      text: today ? 'Today' : format(d, 'MMM d, yyyy'),
      overdue,
      today,
    }
  })()

  return (
    <div
      className={cn(
        'group bg-white rounded-xl border shadow-sm transition-all hover:shadow-md',
        isDone ? 'border-gray-100 opacity-70' : 'border-gray-200'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task)}
            aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
            className={cn(
              'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
              isDone
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 hover:border-indigo-500'
            )}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'text-sm font-medium leading-snug break-words',
                  isDone ? 'line-through text-gray-400' : 'text-gray-900'
                )}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
            </div>

            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Status badge */}
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-md',
                  statusConfig[task.status].className
                )}
              >
                {statusConfig[task.status].label}
              </span>

              {/* Due date */}
              {dueDateDisplay && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs',
                    dueDateDisplay.overdue
                      ? 'text-red-600 font-medium'
                      : dueDateDisplay.today
                      ? 'text-orange-600 font-medium'
                      : 'text-gray-400'
                  )}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {dueDateDisplay.overdue ? `Overdue · ${dueDateDisplay.text}` : dueDateDisplay.text}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons — always visible on mobile, hover-only on desktop */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task)}
              title="Delete task"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
