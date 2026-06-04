import type { Task } from '@/lib/types'

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Test Task',
    description: null,
    priority: 'medium',
    due_date: null,
    status: 'todo',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    ...overrides,
  }
}

export const TODAY = new Date().toISOString().split('T')[0]
export const FUTURE = '2099-12-31'
export const PAST = '2000-01-01'
