import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

const STATUS_STYLES: Record<ProjectStatus, { label: string; badge: string; dot: string }> = {
  draft: {
    label: 'Draft',
    badge: 'bg-white/10 text-slate-200',
    dot: 'bg-slate-300',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-amber-400/20 text-amber-100',
    dot: 'bg-amber-300',
  },
  done: {
    label: 'Selesai',
    badge: 'bg-emerald-400/20 text-emerald-100',
    dot: 'bg-emerald-300',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]

  return (
    <span className={`badge ${style.badge}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
