import { Priority } from '@/lib/types'

const config: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-700 ring-green-200',
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700 ring-red-200',
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
