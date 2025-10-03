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
  return (
    <aside className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Projects</p>
            <h2 className="text-lg font-semibold text-white">Daftar Project</h2>
          </div>
          <button type="button" onClick={onCreateProject} className="button-primary whitespace-nowrap">
            + Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-400">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
            Memuat project...
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
            <p className="font-medium text-slate-200">Belum ada project</p>
            <p className="mt-2 text-sm text-slate-400">
              Tambahkan project pertama Anda untuk mulai mengelola task.
            </p>
            <button type="button" onClick={onCreateProject} className="button-primary mt-4">
              Buat Project Baru
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
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
                    className={`card card-hover cursor-pointer select-none border ${
                      isActive ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/40' : 'border-slate-800'
                    } px-5 py-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{project.name}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                          <StatusBadge status={project.status} />
                          <span className="text-xs text-slate-500">Progress {project.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onAddTask(project)
                          }}
                          className="button-ghost h-9 rounded-full border border-slate-700 px-3 text-xs"
                        >
                          + Task
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEditProject(project)
                          }}
                          className="button-ghost h-9 rounded-full border border-slate-700 px-3 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500"
                          style={{ width: `${Math.min(project.progress, 100)}%` }}
                        />
                      </div>
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