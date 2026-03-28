'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task, View } from '@/lib/types'
import { isToday, isFuture, parseISO, isValid } from 'date-fns'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import TaskList from '@/components/dashboard/TaskList'
import TaskForm from '@/components/dashboard/TaskForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  // View & filter state
  const [view, setView] = useState<View>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at'>('created_at')

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filteredTasks = (() => {
    let result = [...tasks]

    // View filter
    switch (view) {
      case 'today':
        result = result.filter((t) => {
          if (!t.due_date) return false
          const d = parseISO(t.due_date)
          return isValid(d) && isToday(d)
        })
        break
      case 'upcoming':
        result = result.filter((t) => {
          if (!t.due_date) return false
          const d = parseISO(t.due_date)
          return isValid(d) && isFuture(d) && !isToday(d)
        })
        break
      case 'completed':
        result = result.filter((t) => t.status === 'done')
        break
    }

    // Status filter (ignored when view is 'completed')
    if (statusFilter !== 'all' && view !== 'completed') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return result
  })()

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', deletingTask.id)
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id))
    }
    setDeletingTask(null)
  }

  const handleOpenCreate = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const viewTitle: Record<View, string> = {
    all: 'All Tasks',
    today: 'Today',
    upcoming: 'Upcoming',
    completed: 'Completed',
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar view={view} onViewChange={setView} tasks={tasks} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header user={user} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{viewTitle[view]}</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>

            <TaskList
              tasks={filteredTasks}
              loading={loading}
              error={error}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              view={view}
              onStatusFilterChange={setStatusFilter}
              onPriorityFilterChange={setPriorityFilter}
              onSortChange={setSortBy}
              onEdit={handleOpenEdit}
              onDelete={setDeletingTask}
              onToggleComplete={handleToggleComplete}
              onRetry={fetchTasks}
            />
          </div>
        </main>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
          onSuccess={fetchTasks}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  )
}
