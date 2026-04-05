import { isToday, isFuture, parseISO, isValid } from 'date-fns'
import type { Task, View, SortBy, Status, Priority } from './types'

/** Filter tasks by the current sidebar view. */
export function filterByView(tasks: Task[], view: View): Task[] {
  switch (view) {
    case 'today':
      return tasks.filter((t) => {
        if (!t.due_date) return false
        const d = parseISO(t.due_date)
        return isValid(d) && isToday(d)
      })
    case 'upcoming':
      return tasks.filter((t) => {
        if (!t.due_date) return false
        const d = parseISO(t.due_date)
        return isValid(d) && isFuture(d) && !isToday(d)
      })
    case 'completed':
      return tasks.filter((t) => t.status === 'done')
    default:
      return tasks
  }
}

/** Filter tasks by status. Status filter is ignored when view is 'completed'. */
export function filterByStatus(
  tasks: Task[],
  statusFilter: Status | 'all',
  view: View
): Task[] {
  if (statusFilter === 'all' || view === 'completed') return tasks
  return tasks.filter((t) => t.status === statusFilter)
}

/** Filter tasks by priority. */
export function filterByPriority(tasks: Task[], priorityFilter: Priority | 'all'): Task[] {
  if (priorityFilter === 'all') return tasks
  return tasks.filter((t) => t.priority === priorityFilter)
}

/**
 * Sort tasks.
 * - 'due_date': ascending, nulls last
 * - 'created_at': descending (newest first)
 */
export function sortTasks(tasks: Task[], sortBy: SortBy): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'due_date') {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/** Apply all filters and sorting in order. */
export function applyFilters(
  tasks: Task[],
  view: View,
  statusFilter: Status | 'all',
  priorityFilter: Priority | 'all',
  sortBy: SortBy
): Task[] {
  let result = filterByView(tasks, view)
  result = filterByStatus(result, statusFilter, view)
  result = filterByPriority(result, priorityFilter)
  result = sortTasks(result, sortBy)
  return result
}
