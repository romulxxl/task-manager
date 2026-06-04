import {
  validateSignupPasswords,
  validateTaskTitle,
  buildTaskPayload,
} from '@/lib/auth-validation'

// ─── validateSignupPasswords ──────────────────────────────────────────────────

describe('validateSignupPasswords', () => {
  it('returns null when passwords match and meet length requirement', () => {
    expect(validateSignupPasswords('password123', 'password123')).toBeNull()
  })

  it('returns error when passwords do not match', () => {
    expect(validateSignupPasswords('abc12345', 'abc12346')).toBe('Passwords do not match')
  })

  it('returns error when password is shorter than 8 characters', () => {
    expect(validateSignupPasswords('short', 'short')).toBe('Password must be at least 8 characters')
  })

  it('returns null when password is exactly 8 characters', () => {
    expect(validateSignupPasswords('exactly8', 'exactly8')).toBeNull()
  })

  it('checks mismatch before length — mismatch error wins', () => {
    expect(validateSignupPasswords('abc', 'xyz')).toBe('Passwords do not match')
  })

  it('returns null for long matching passwords', () => {
    const pw = 'a'.repeat(64)
    expect(validateSignupPasswords(pw, pw)).toBeNull()
  })
})

// ─── validateTaskTitle ────────────────────────────────────────────────────────

describe('validateTaskTitle', () => {
  it('returns null for a normal title', () => {
    expect(validateTaskTitle('Buy groceries')).toBeNull()
  })

  it('returns error for an empty string', () => {
    expect(validateTaskTitle('')).toBe('Title is required')
  })

  it('returns error for whitespace-only input', () => {
    expect(validateTaskTitle('   ')).toBe('Title is required')
  })

  it('returns null for a title with surrounding spaces', () => {
    expect(validateTaskTitle('  valid title  ')).toBeNull()
  })
})

// ─── buildTaskPayload ─────────────────────────────────────────────────────────

describe('buildTaskPayload', () => {
  it('returns all fields correctly when fully filled', () => {
    const payload = buildTaskPayload({
      title: 'My Task',
      description: 'Some details',
      priority: 'high',
      due_date: '2026-06-10',
      status: 'in_progress',
    })
    expect(payload).toEqual({
      title: 'My Task',
      description: 'Some details',
      priority: 'high',
      due_date: '2026-06-10',
      status: 'in_progress',
    })
  })

  it('converts empty description to null', () => {
    const { description } = buildTaskPayload({
      title: 'Task',
      description: '',
      priority: 'low',
      due_date: '',
      status: 'todo',
    })
    expect(description).toBeNull()
  })

  it('converts whitespace-only description to null', () => {
    const { description } = buildTaskPayload({
      title: 'Task',
      description: '   ',
      priority: 'low',
      due_date: '',
      status: 'todo',
    })
    expect(description).toBeNull()
  })

  it('converts empty due_date to null', () => {
    const { due_date } = buildTaskPayload({
      title: 'Task',
      description: '',
      priority: 'medium',
      due_date: '',
      status: 'todo',
    })
    expect(due_date).toBeNull()
  })

  it('trims whitespace from title', () => {
    const { title } = buildTaskPayload({
      title: '  Trimmed  ',
      description: '',
      priority: 'medium',
      due_date: '',
      status: 'todo',
    })
    expect(title).toBe('Trimmed')
  })
})
