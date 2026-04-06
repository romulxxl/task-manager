'use client'

import { Task, View } from '@/lib/types'
import { isToday, isFuture, parseISO, isValid } from 'date-fns'
import { clsx } from 'clsx'

interface SidebarProps {
  view: View
  onViewChange: (view: View) => void
  tasks: Task[]
  isMobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  id: View
  label: string
  icon: React.ReactNode
  count: (tasks: Task[]) => number
}

const navItems: NavItem[] = [
  {
    id: 'all',
    label: 'All Tasks',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    count: (tasks) => tasks.filter((t) => t.status !== 'done').length,
  },
  {
    id: 'today',
    label: 'Today',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    count: (tasks) =>
      tasks.filter((t) => {
        if (!t.due_date) return false
        const d = parseISO(t.due_date)
        return isValid(d) && isToday(d) && t.status !== 'done'
      }).length,
  },
  {
    id: 'upcoming',
    label: 'Upcoming',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    count: (tasks) =>
      tasks.filter((t) => {
        if (!t.due_date) return false
        const d = parseISO(t.due_date)
        return isValid(d) && isFuture(d) && !isToday(d) && t.status !== 'done'
      }).length,
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    count: (tasks) => tasks.filter((t) => t.status === 'done').length,
  },
]

export default function Sidebar({ view, onViewChange, tasks, isMobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'bg-slate-900 flex flex-col shrink-0 z-40 transition-transform duration-300 ease-in-out',
          'fixed inset-y-0 left-0 w-72',
          'md:relative md:inset-auto md:w-56',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Navigation</span>
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const count = item.count(tasks)
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id); onMobileClose() }}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {count > 0 && (
                <span
                  className={clsx(
                    'text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                    active ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          {tasks.length} total task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>
    </aside>
    </>
  )
}
