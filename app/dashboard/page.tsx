'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task, View, SortBy, Status, Priority } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { applyFilters } from '@/lib/task-filters'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import TaskList from '@/components/dashboard/TaskList'
import TaskForm from '@/components/dashboard/TaskForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // View & filter state
  const [view, setView] = useState<View>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('created_at')

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  // Ref so the real-time closure always sees the current set without recreating the channel
  const togglingIdsRef = useRef<Set<string>>(new Set())

  const supabase = useMemo(() => createClient(), [])

  // Auto-clear mutation error after 5s
  useEffect(() => {
    if (!mutationError) return
    const timer = setTimeout(() => setMutationError(null), 5000)
    return () => clearTimeout(timer)
  }, [mutationError])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
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

  useEffect(() => {
    if (!user) return

    let isFirstSubscribe = true

    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const task = payload.new as Task
            setTasks((prev) =>
              prev.some((t) => t.id === task.id) ? prev : [task, ...prev]
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            if (togglingIdsRef.current.has(updated.id)) return
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setTasks((prev) => prev.filter((t) => t.id !== deletedId))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (!isFirstSubscribe) fetchTasks()
          isFirstSubscribe = false
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [user, supabase, fetchTasks])

  // Reset status filter when switching to 'completed' view to avoid silent conflict
  const handleViewChange = useCallback((newView: View) => {
    if (newView === 'completed') setStatusFilter('all')
    setView(newView)
  }, [])

  const filteredTasks = useMemo(
    () => applyFilters(tasks, view, statusFilter, priorityFilter, sortBy),
    [tasks, view, statusFilter, priorityFilter, sortBy]
  )

  const handleToggleComplete = async (task: Task) => {
    if (togglingIds.has(task.id)) return
    const newStatus: Status = task.status === 'done' ? 'todo' : 'done'
    setTogglingIds((prev) => {
      const s = new Set(prev); s.add(task.id); togglingIdsRef.current = s; return s
    })
    // Optimistic update — revert on failure
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
    if (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
      setMutationError(error.message)
    }
    setTogglingIds((prev) => {
      const s = new Set(prev); s.delete(task.id); togglingIdsRef.current = s; return s
    })
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    const taskId = deletingTask.id
    setDeletingTask(null)
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) {
      setMutationError(error.message)
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        view={view}
        onViewChange={handleViewChange}
        tasks={tasks}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{viewTitle[view]}</h1>
                <p className="text-sm text-white/40 mt-0.5">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="hidden sm:inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>

            {mutationError && (
              <div className="flex items-center justify-between gap-2 text-sm text-rose-300 rounded-lg px-3 py-2 mb-4 border border-rose-500/30" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <span>{mutationError}</span>
                <button
                  onClick={() => setMutationError(null)}
                  className="shrink-0 text-rose-400 hover:text-rose-300"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

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

      {/* FAB — mobile only */}
      <button
        onClick={handleOpenCreate}
        className="fixed bottom-5 right-5 z-20 sm:hidden w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
        aria-label="New task"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showForm && (
        <TaskForm
          task={editingTask}
          userId={user?.id}
          onClose={handleCloseForm}
          onSuccess={() => {}}
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
