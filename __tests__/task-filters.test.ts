import {
  filterByView,
  filterByStatus,
  filterByPriority,
  sortTasks,
  applyFilters,
} from '@/lib/task-filters'
import { makeTask, TODAY, FUTURE, PAST } from './helpers'

// ─── filterByView ─────────────────────────────────────────────────────────────

describe('filterByView', () => {
  it("'all' returns all tasks regardless of status", () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ status: 'done' })]
    expect(filterByView(tasks, 'all')).toHaveLength(2)
  })

  it("'completed' returns only done tasks", () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ status: 'done', id: '2' })]
    const result = filterByView(tasks, 'completed')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('done')
  })

  it("'completed' returns empty array when no done tasks", () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ id: '2', status: 'in_progress' })]
    expect(filterByView(tasks, 'completed')).toHaveLength(0)
  })

  it("'today' returns tasks with today's due date", () => {
    const tasks = [makeTask({ due_date: TODAY }), makeTask({ id: '2', due_date: FUTURE })]
    const result = filterByView(tasks, 'today')
    expect(result).toHaveLength(1)
    expect(result[0].due_date).toBe(TODAY)
  })

  it("'today' excludes tasks without due_date", () => {
    const tasks = [makeTask({ due_date: null })]
    expect(filterByView(tasks, 'today')).toHaveLength(0)
  })

  it("'today' excludes past tasks", () => {
    const tasks = [makeTask({ due_date: PAST })]
    expect(filterByView(tasks, 'today')).toHaveLength(0)
  })

  it("'upcoming' returns future tasks (not today)", () => {
    const tasks = [makeTask({ due_date: FUTURE }), makeTask({ id: '2', due_date: TODAY })]
    const result = filterByView(tasks, 'upcoming')
    expect(result).toHaveLength(1)
    expect(result[0].due_date).toBe(FUTURE)
  })

  it("'upcoming' excludes tasks without due_date", () => {
    const tasks = [makeTask({ due_date: null })]
    expect(filterByView(tasks, 'upcoming')).toHaveLength(0)
  })

  it("'upcoming' excludes past tasks", () => {
    const tasks = [makeTask({ due_date: PAST })]
    expect(filterByView(tasks, 'upcoming')).toHaveLength(0)
  })
})

// ─── filterByStatus ───────────────────────────────────────────────────────────

describe('filterByStatus', () => {
  const tasks = [
    makeTask({ id: '1', status: 'todo' }),
    makeTask({ id: '2', status: 'in_progress' }),
    makeTask({ id: '3', status: 'done' }),
  ]

  it("'all' returns all tasks", () => {
    expect(filterByStatus(tasks, 'all', 'all')).toHaveLength(3)
  })

  it("filters to 'todo' tasks", () => {
    const result = filterByStatus(tasks, 'todo', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('todo')
  })

  it("filters to 'in_progress' tasks", () => {
    const result = filterByStatus(tasks, 'in_progress', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('in_progress')
  })

  it("filters to 'done' tasks", () => {
    const result = filterByStatus(tasks, 'done', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('done')
  })

  it("ignores statusFilter when view is 'completed'", () => {
    expect(filterByStatus(tasks, 'todo', 'completed')).toHaveLength(3)
  })

  it('handles empty task array', () => {
    expect(filterByStatus([], 'todo', 'all')).toHaveLength(0)
  })
})

// ─── filterByPriority ─────────────────────────────────────────────────────────

describe('filterByPriority', () => {
  const tasks = [
    makeTask({ id: '1', priority: 'low' }),
    makeTask({ id: '2', priority: 'medium' }),
    makeTask({ id: '3', priority: 'high' }),
  ]

  it("'all' returns all tasks", () => {
    expect(filterByPriority(tasks, 'all')).toHaveLength(3)
  })

  it("filters to 'high' priority", () => {
    const result = filterByPriority(tasks, 'high')
    expect(result).toHaveLength(1)
    expect(result[0].priority).toBe('high')
  })

  it("filters to 'low' priority", () => {
    const result = filterByPriority(tasks, 'low')
    expect(result).toHaveLength(1)
    expect(result[0].priority).toBe('low')
  })

  it("filters to 'medium' priority", () => {
    const result = filterByPriority(tasks, 'medium')
    expect(result).toHaveLength(1)
    expect(result[0].priority).toBe('medium')
  })
})

// ─── sortTasks ────────────────────────────────────────────────────────────────

describe('sortTasks', () => {
  it("'created_at' sorts newest first", () => {
    const tasks = [
      makeTask({ id: '1', created_at: '2026-01-01T00:00:00Z' }),
      makeTask({ id: '2', created_at: '2026-06-01T00:00:00Z' }),
    ]
    const result = sortTasks(tasks, 'created_at')
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('1')
  })

  it("'due_date' sorts ascending (earliest first)", () => {
    const tasks = [
      makeTask({ id: '1', due_date: '2026-12-01' }),
      makeTask({ id: '2', due_date: '2026-03-01' }),
    ]
    const result = sortTasks(tasks, 'due_date')
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('1')
  })

  it("'due_date' places nulls last", () => {
    const tasks = [
      makeTask({ id: '1', due_date: null }),
      makeTask({ id: '2', due_date: '2026-03-01' }),
    ]
    const result = sortTasks(tasks, 'due_date')
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('1')
  })

  it("'due_date' treats two nulls as equal (stable)", () => {
    const tasks = [
      makeTask({ id: '1', due_date: null }),
      makeTask({ id: '2', due_date: null }),
    ]
    const result = sortTasks(tasks, 'due_date')
    expect(result).toHaveLength(2)
  })

  it('does not mutate the original array', () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' })]
    const original = [...tasks]
    sortTasks(tasks, 'created_at')
    expect(tasks).toEqual(original)
  })
})

// ─── applyFilters ─────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  it('returns empty array when no tasks', () => {
    expect(applyFilters([], 'all', 'all', 'all', 'created_at')).toHaveLength(0)
  })

  it('applies all filters together', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo', priority: 'high' }),
      makeTask({ id: '2', status: 'done', priority: 'high' }),
      makeTask({ id: '3', status: 'todo', priority: 'low' }),
    ]
    const result = applyFilters(tasks, 'all', 'todo', 'high', 'created_at')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it("view='completed' ignores status filter", () => {
    const tasks = [
      makeTask({ id: '1', status: 'done' }),
      makeTask({ id: '2', status: 'done' }),
    ]
    const result = applyFilters(tasks, 'completed', 'todo', 'all', 'created_at')
    expect(result).toHaveLength(2)
  })
})
