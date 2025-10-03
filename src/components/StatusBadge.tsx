import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

const LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  done: 'Selesai',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge-status-${status}`}>{LABELS[status]}</span>
}