export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in_progress' | 'done'
export type SortBy = 'due_date' | 'created_at'
export type View = 'all' | 'today' | 'upcoming' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: Priority
  due_date: string | null
  status: Status
  created_at: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  due_date: string
  status: Status
}
