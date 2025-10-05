import type { Project } from '@/types'
import StatusBadge from './StatusBadge'

interface ProjectSidebarProps {
  projects: Project[]
  selectedProjectId: string | null
  loading: boolean
  onSelect: (projectId: string) => void
  onCreateProject: () => void
  onEditProject: (project: Project) => void
  onAddTask: (project: Project) => void
}

export default function ProjectSidebar({
  projects,
  selectedProjectId,
  loading,
  onSelect,
  onCreateProject,
  onEditProject,
  onAddTask,
}: ProjectSidebarProps) {
  const activeProjects = projects.filter((project) => project.status !== 'done').length
  const completedProjects = projects.filter((project) => project.status === 'done').length
  const completionRate = projects.length ? Math.round((completedProjects / projects.length) * 100) : 0

  return (
    <aside className="card flex h-full flex-col overflow-hidden border-white/5 bg-slate-900/50">
      <div className="space-y-6 border-b border-white/5 px-7 py-7">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-slate-200">
            Projects
          </span>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Workspace</h2>
              <p className="text-sm text-slate-300/80">{projects.length} project tersimpan, {completionRate}% selesai</p>
            </div>
            <button type="button" onClick={onCreateProject} className="button-primary whitespace-nowrap">
              + Project
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[20px] border border-white/5 bg-slate-900/70 p-4 text-xs text-slate-200 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">Aktif</p>
            <p className="text-xl font-semibold text-white">{activeProjects}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">Selesai</p>
            <p className="text-xl font-semibold text-emerald-200">{completedProjects}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">Completion</p>
            <p className="text-xl font-semibold text-sky-200">{completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="animate-pulse rounded-[24px] border border-white/5 bg-white/[0.04] p-5"
              >
                <div className="h-4 w-1/3 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-2/3 rounded-full bg-white/5" />
                <div className="mt-8 h-2 w-full rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-12 space-y-5 rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-semibold text-white">Belum ada project</p>
            <p className="text-sm text-slate-300/80">
              Buat satu project untuk mulai memisahkan prioritas dan timeline pekerjaan tim.
            </p>
            <button type="button" onClick={onCreateProject} className="button-primary">
              Buat Project Pertama
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => {
              const isActive = project.id === selectedProjectId

              return (
                <li key={project.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(project.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(project.id)
                      }
                    }}
                    className={`group relative cursor-pointer select-none rounded-[26px] border px-6 py-5 transition duration-300 ${
                      isActive
                        ? 'border-sky-400/50 bg-sky-500/15 shadow-[0_0_0_1px_rgba(14,165,233,0.15)]'
                        : 'border-white/5 bg-white/[0.02] hover:border-sky-400/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300/80">
                          <StatusBadge status={project.status} />
                          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide">
                            Progress {project.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onAddTask(project)
                          }}
                          className="button-soft h-9 rounded-full px-4 text-xs"
                        >
                          + Task
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditProject(project)
                          }}
                          className="button-soft h-9 rounded-full px-4 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
