import { Priority } from '@/lib/types'

const config: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-emerald-500/[0.18] text-emerald-300 ring-emerald-500/30',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-500/[0.18] text-amber-300 ring-amber-500/30',
  },
  high: {
    label: 'High',
    className: 'bg-rose-500/[0.22] text-rose-300 ring-rose-500/35',
  },
}

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  )
}
