import type { TaskFormData } from './types'

/** Validate password fields on the signup form. Returns an error string or null. */
export function validateSignupPasswords(
  password: string,
  confirmPassword: string
): string | null {
  if (password !== confirmPassword) return 'Passwords do not match'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

/** Validate the task title field. Returns an error string or null. */
export function validateTaskTitle(title: string): string | null {
  if (!title.trim()) return 'Title is required'
  return null
}

/** Build the database payload from TaskFormData. Empty strings become null. */
export function buildTaskPayload(formData: TaskFormData): {
  title: string
  description: string | null
  priority: TaskFormData['priority']
  due_date: string | null
  status: TaskFormData['status']
} {
  return {
    title: formData.title.trim(),
    description: formData.description.trim() || null,
    priority: formData.priority,
    due_date: formData.due_date || null,
    status: formData.status,
  }
}
