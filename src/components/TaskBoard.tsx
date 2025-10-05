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
      <section className="card flex h-full flex-col items-center justify-center border-dashed border-white/10 bg-white/[0.04] text-center">
        <div className="max-w-sm space-y-4 px-8 py-16">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Tasklist
          </span>
          <h2 className="text-3xl font-semibold text-white">Pilih project untuk memulai</h2>
          <p className="text-sm text-slate-300/80">
            Sorot salah satu project di panel kiri atau buat project baru untuk melihat daftar task dan progresnya.
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
  const completionRate = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0

  return (
    <section className="card h-full border-white/5 bg-slate-900/55">
      <header className="space-y-7 border-b border-white/5 px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-slate-300">
              Project Overview
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white lg:text-4xl">{project.name}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={project.status} />
                <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Progress {project.progress}%
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Completion {completionRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-[0_10px_40px_rgba(8,11,32,0.35)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
              <span>Quick Stats</span>
              <span>{totalTasks} Tasks</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Bobot Total</span>
                <span className="font-semibold text-white">{totalWeight}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>In Progress</span>
                <span className="font-semibold text-amber-200">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Selesai</span>
                <span className="font-semibold text-emerald-200">{doneCount}</span>
              </div>
            </div>
            <button type="button" onClick={onCreateTask} className="button-primary w-full">
              + Task Baru
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-200 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-400">Draft</p>
            <p className="text-2xl font-semibold text-white">{draftCount}</p>
            <p className="text-xs text-slate-400">Task yang menunggu kickoff.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-400">Sedang Dikerjakan</p>
            <p className="text-2xl font-semibold text-amber-200">{inProgressCount}</p>
            <p className="text-xs text-slate-400">Task aktif yang mempengaruhi progres.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-400">Selesai</p>
            <p className="text-2xl font-semibold text-emerald-200">{doneCount}</p>
            <p className="text-xs text-slate-400">Task yang sudah close & siap dilaporkan.</p>
          </div>
        </div>
      </header>

      <div className="h-full overflow-y-auto px-8 pb-10 pt-8">
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`task-skeleton-${index}`}
                className="animate-pulse rounded-[24px] border border-white/5 bg-white/[0.05] px-6 py-5"
              >
                <div className="h-4 w-1/2 rounded-full bg-white/10" />
                <div className="mt-3 h-3 w-1/3 rounded-full bg-white/5" />
                <div className="mt-6 h-2 w-full rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-10 py-16 text-center">
            <p className="text-lg font-semibold text-white">Belum ada task</p>
            <p className="mt-3 max-w-md text-sm text-slate-300/80">
              Mulai pecah pekerjaan tim, atur status, dan tetapkan bobot agar progres project otomatis terukur.
            </p>
            <button type="button" onClick={onCreateTask} className="button-primary mt-6">
              Tambah Task Pertama
            </button>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-1 top-0 bottom-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li key={task.id} className="relative">
                  <div className="absolute -left-[1.35rem] top-6 h-3 w-3 rounded-full border border-white/40 bg-white/80" />
                  <div className="rounded-[24px] border border-white/5 bg-white/[0.05] px-6 py-5 transition duration-300 hover:border-sky-400/40 hover:bg-white/[0.08]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300/80">
                          <span className="rounded-full bg-white/10 px-3 py-1">Bobot {task.weight}</span>
                          <span className="rounded-full bg-white/10 px-3 py-1">
                            Diperbarui {formatter.format(new Date(task.updatedAt))}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => onEditTask(task)} className="button-soft h-10 rounded-full px-5 text-xs">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-rose-500/15 px-5 text-xs font-semibold text-rose-200 transition duration-200 hover:bg-rose-500/25"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
