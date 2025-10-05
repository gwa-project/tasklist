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

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function TaskBoard({ project, tasks, loading, onCreateTask, onEditTask, onDeleteTask }: TaskBoardProps) {
  if (!project) {
    return (
      <section className="glass-panel flex h-full flex-col items-center justify-center border-dashed border-white/10 bg-white/5 text-center">
        <div className="max-w-md space-y-4 px-6 py-14">
          <span className="pill-label text-[10px]">Taskboard</span>
          <h2 className="text-3xl font-semibold text-white">Pilih Project Terlebih Dahulu</h2>
          <p className="subtle-text text-sm">
            Pilih salah satu project di panel kiri, atau buat project baru untuk mulai membangun alur kerja yang lebih terstruktur.
          </p>
        </div>
      </section>
    )
  }

  const totalTasks = tasks.length
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const inProgressCount = tasks.filter((task) => task.status === 'in_progress').length
  const draftCount = totalTasks - doneCount - inProgressCount
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)

  const statusChips = [
    {
      label: 'Draft',
      value: draftCount,
      accent: 'border-white/10 bg-white/5 text-slate-200',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      accent: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    },
    {
      label: 'Selesai',
      value: doneCount,
      accent: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    },
  ]

  return (
    <section className="glass-panel flex h-full flex-col overflow-hidden">
      <div className="relative overflow-hidden border-b border-white/10 px-8 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_farthest-side_at_0%_0%,rgba(56,189,248,0.22),transparent_60%)] opacity-70" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-soft opacity-30" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <span className="pill-label text-[10px]">Ringkasan Project</span>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <p className="subtle-text max-w-xl text-sm">
                {project.status === 'done'
                  ? 'Project selesai. Tetap pantau riwayat task atau buat task lanjutan jika dibutuhkan.'
                  : 'Kelola task di bawah ini. Progress project akan mengikuti status dan bobot masing-masing task.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.32em] text-slate-300">
              Progress {project.progress}%
            </div>
            <button type="button" onClick={onCreateTask} className="button-primary whitespace-nowrap">
              + Task Baru
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/10 px-8 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <p className="kpi-label">Total Task</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalTasks}</p>
          <p className="subtle-text mt-1">{totalWeight} total bobot terakumulasi</p>
        </div>
        <div className="stat-card">
          <p className="kpi-label">Selesai</p>
          <p className="mt-3 text-3xl font-semibold text-white">{doneCount}</p>
          <p className="subtle-text mt-1">Task rampung siap diarsipkan</p>
        </div>
        <div className="stat-card">
          <p className="kpi-label">Sedang Berjalan</p>
          <p className="mt-3 text-3xl font-semibold text-white">{inProgressCount}</p>
          <p className="subtle-text mt-1">Terakhir diperbarui {dateTimeFormatter.format(new Date(project.updatedAt))}</p>
        </div>
        <div className="stat-card">
          <p className="kpi-label">Belum Dimulai</p>
          <p className="mt-3 text-3xl font-semibold text-white">{draftCount}</p>
          <p className="subtle-text mt-1">Siap diprioritaskan ke sprint berikutnya</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-8 py-4 text-xs text-slate-300">
        {statusChips.map((chip) => (
          <span key={chip.label} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] ${chip.accent}`}>
            <span className="font-semibold uppercase tracking-[0.24em]">{chip.label}</span>
            <span className="text-sm font-semibold">{chip.value}</span>
          </span>
        ))}
      </div>

      <div className="relative flex-1 overflow-y-auto px-6 pb-8 pt-4">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-slate-300">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-purple-400" />
            Memuat task terbaru...
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-white">Belum Ada Task</h3>
            <p className="mt-3 text-sm text-slate-400">
              Tambahkan task pertama untuk project ini. Atur status dan bobot agar progress project terhitung otomatis.
            </p>
            <button type="button" onClick={onCreateTask} className="button-primary mt-6">
              Tambah Task Pertama
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-5 transition duration-200 hover:-translate-y-1 hover:border-sky-300/30 hover:bg-slate-900/70"
              >
                <div className="absolute inset-0 bg-grid-soft opacity-0 transition-opacity duration-200 group-hover:opacity-40" aria-hidden="true" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">Bobot {task.weight}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        Diperbarui {dateTimeFormatter.format(new Date(task.updatedAt))}
                      </span>
                      {task.project && task.project.name !== project.name ? (
                        <span className="rounded-full border border-white/10 px-3 py-1">Project {task.project.name}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="button-ghost h-9 rounded-full border-white/15 bg-white/5 px-4 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      className="inline-flex h-9 items-center rounded-full border border-rose-400/30 bg-rose-500/10 px-4 text-sm font-semibold text-rose-200 transition hover:-translate-y-0.5 hover:border-rose-300/40 hover:bg-rose-500/15"
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
