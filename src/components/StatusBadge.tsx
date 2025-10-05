import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

const BADGE_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  done: 'Selesai',
}

const BADGE_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-slate-800/60 text-slate-200 ring-1 ring-inset ring-slate-500/40',
  in_progress: 'bg-amber-500/15 text-amber-100 ring-1 ring-inset ring-amber-400/40',
  done: 'bg-emerald-500/15 text-emerald-100 ring-1 ring-inset ring-emerald-400/40',
}

const DOT_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-slate-300/80',
  in_progress: 'bg-amber-300/80',
  done: 'bg-emerald-300/80',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] }
    >
      <span className={h-2 w-2 rounded-full } />
      {BADGE_LABELS[status]}
    </span>
  )
}
