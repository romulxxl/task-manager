'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task, TaskFormData, Priority, Status } from '@/lib/types'
import { validateTaskTitle, buildTaskPayload } from '@/lib/auth-validation'

interface TaskFormProps {
  task?: Task | null
  userId?: string
  onClose: () => void
  onSuccess: () => void
}

const defaultFormData: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  status: 'todo',
}

const priorityOptions: { value: Priority; label: string; active: string; inactive: string }[] = [
  {
    value: 'low',
    label: 'Low',
    active: 'border-emerald-500/60 text-emerald-300 bg-emerald-500/[0.15]',
    inactive: 'border-white/[0.1] text-white/50 hover:border-white/20',
  },
  {
    value: 'medium',
    label: 'Medium',
    active: 'border-amber-500/60 text-amber-300 bg-amber-500/[0.15]',
    inactive: 'border-white/[0.1] text-white/50 hover:border-white/20',
  },
  {
    value: 'high',
    label: 'High',
    active: 'border-rose-500/60 text-rose-300 bg-rose-500/[0.15]',
    inactive: 'border-white/[0.1] text-white/50 hover:border-white/20',
  },
]

const statusOptions: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TaskForm({ task, userId, onClose, onSuccess }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(
    task
      ? {
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          due_date: task.due_date ?? '',
          status: task.status,
        }
      : defaultFormData
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleChange = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const titleError = validateTaskTitle(formData.title)
    if (titleError) {
      setError(titleError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = buildTaskPayload(formData)

      if (task) {
        const { error } = await supabase.from('tasks').update(payload).eq('id', task.id)
        if (error) throw error
      } else {
        const uid = userId ?? (await supabase.auth.getUser()).data.user?.id
        if (!uid) throw new Error('Not authenticated')
        const { error } = await supabase.from('tasks').insert({ ...payload, user_id: uid })
        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      console.error('Task save error:', err)
      const msg =
        err instanceof Error
          ? err.message
          : (err as { error_description?: string })?.error_description ?? JSON.stringify(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all border border-white/[0.12]'

  const inputStyle = { background: 'rgba(255,255,255,0.07)' }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:justify-end md:items-stretch">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full rounded-t-2xl md:rounded-none md:max-w-md md:h-full shadow-2xl flex flex-col max-h-[92vh] md:max-h-none border border-white/[0.1]"
        style={{ background: 'rgba(15,10,40,0.95)', backdropFilter: 'blur(24px)' }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="What needs to be done?"
                className={inputClass}
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('priority', opt.value)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      formData.priority === opt.value ? opt.active : opt.inactive
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as Status)}
                className={inputClass}
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#0f0a28' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className={inputClass}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    colorScheme: 'dark',
                    color: formData.due_date ? undefined : 'transparent',
                  }}
                />
                {!formData.due_date && (
                  <span className="absolute inset-0 flex items-center px-3 text-sm text-white/30 pointer-events-none">
                    mm/dd/yyyy
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-300 rounded-lg px-3 py-2 border border-rose-500/30"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.08] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-white/60 hover:text-white rounded-lg transition-colors border border-white/[0.1] hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : task ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
