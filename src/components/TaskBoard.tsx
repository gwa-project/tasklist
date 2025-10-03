import type { Project, Task } from '@/types'
import StatusBadge from './StatusBadge'

interface TaskBoardProps {
  project: Project | null
  tasks: Task[]
  loading: boolean
  onCreateTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

const formatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function TaskBoard({ project, tasks, loading, onCreateTask, onEditTask, onDeleteTask }: TaskBoardProps) {
  if (!project) {
    return (
      <section className="card flex h-full flex-col items-center justify-center border-dashed border-slate-800 bg-slate-900/30 text-center">
        <div className="max-w-md space-y-3 px-6 py-10">
          <p className="text-sm uppercase tracking-widest text-slate-500">Project Tracker</p>
          <h2 className="text-2xl font-semibold text-white">Pilih project untuk melihat task</h2>
          <p className="text-sm text-slate-400">
            Pilih salah satu project di sisi kiri, atau buat project baru untuk mulai mengatur task secara terstruktur.
          </p>
        </div>
      </section>
    )
  }

  const totalTasks = tasks.length
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const inProgressCount = tasks.filter((task) => task.status === 'in_progress').length
  const draftCount = totalTasks - doneCount - inProgressCount

  return (
    <section className="card h-full overflow-hidden">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Ringkasan Project</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
              <StatusBadge status={project.status} />
              <div className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
                Progress {project.progress}%
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              Total Task {totalTasks}
            </div>
            <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              Total Bobot {totalWeight}
            </div>
            <button type="button" onClick={onCreateTask} className="button-primary whitespace-nowrap">
              + Task
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 border-b border-slate-800 px-6 py-4 text-sm text-slate-300 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Draft</p>
          <p className="mt-2 text-2xl font-semibold text-slate-200">{draftCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{inProgressCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Selesai</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{doneCount}</p>
        </div>
      </div>

      <div className="h-full overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-400">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
            Memuat task...
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 py-16 text-center">
            <p className="font-medium text-slate-200">Belum ada task</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Tambahkan task untuk project ini, atur status dan bobotnya agar progress project terpantau otomatis.
            </p>
            <button type="button" onClick={onCreateTask} className="button-primary mt-4">
              Tambah Task Pertama
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="card border border-slate-800 bg-slate-900/70 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="rounded-full bg-slate-800/70 px-3 py-1">Bobot {task.weight}</span>
                      <span className="rounded-full bg-slate-800/70 px-3 py-1">
                        Diperbarui {formatter.format(new Date(task.updatedAt))}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="button-ghost h-9 rounded-full border border-slate-700 px-4 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      className="inline-flex h-9 items-center rounded-full bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}