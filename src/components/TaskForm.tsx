'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Project, TaskPayload } from '@/types'
import { TASK_STATUSES } from '@/lib/constants'

interface TaskFormProps {
  initialValues?: Partial<TaskPayload>
  projects: Project[]
  loading?: boolean
  onSubmit: (values: TaskPayload) => Promise<void> | void
  onCancel: () => void
  onDelete?: () => Promise<void> | void
  defaultProjectId?: string | null
}

const STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  done: 'Selesai',
}

export default function TaskForm({
  initialValues,
  projects,
  loading = false,
  onSubmit,
  onCancel,
  onDelete,
  defaultProjectId,
}: TaskFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [status, setStatus] = useState<(typeof TASK_STATUSES)[number]>(
    (initialValues?.status as (typeof TASK_STATUSES)[number]) ?? 'draft'
  )
  const [projectId, setProjectId] = useState(initialValues?.projectId ?? defaultProjectId ?? '')
  const [weight, setWeight] = useState(initialValues?.weight ?? 1)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initialValues?.projectId && defaultProjectId) {
      setProjectId(defaultProjectId)
    }
  }, [defaultProjectId, initialValues?.projectId])

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects]
  )

  const modeLabel = initialValues ? 'Perbarui informasi task agar sejalan dengan progres terbaru tim.' : 'Isi detail task untuk ditambahkan ke project pilihan Anda.'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Nama task wajib diisi')
      return
    }

    if (!projectId) {
      setError('Pilih project untuk task ini')
      return
    }

    if (weight < 1) {
      setError('Bobot minimal 1')
      return
    }

    setError('')
    await onSubmit({
      name: name.trim(),
      status,
      projectId,
      weight,
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div>
          <label htmlFor="task-name" className="text-sm font-semibold text-slate-100">
            Nama Task
          </label>
          <p className="subtle-text mt-1">{modeLabel}</p>
        </div>
        <input
          id="task-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Rancang dashboard analitik"
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="task-project">Project</label>
          <select
            id="task-project"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            disabled={loading || projects.length === 0}
          >
            <option value="" disabled>
              Pilih project
            </option>
            {projectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="subtle-text text-xs">Task akan otomatis mengikuti progres project yang dipilih.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="task-status">Status</label>
          <select
            id="task-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof TASK_STATUSES)[number])}
            disabled={loading}
          >
            {TASK_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {STATUS_LABELS[statusOption]}
              </option>
            ))}
          </select>
          <p className="subtle-text text-xs">Gunakan status untuk memicu perhitungan progres otomatis.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="task-weight">Bobot</label>
        <input
          id="task-weight"
          type="number"
          min={1}
          step={1}
          value={weight}
          onChange={(event) => setWeight(Number(event.target.value))}
          disabled={loading}
        />
        <p className="subtle-text text-xs">Bobot membantu menentukan porsi kontribusi task terhadap progres project.</p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="divider-soft" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className="button-ghost" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          {onDelete ? (
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:-translate-y-0.5 hover:border-rose-300/40 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={async () => {
                await onDelete?.()
              }}
              disabled={loading}
            >
              Hapus
            </button>
          ) : null}
        </div>
        <button type="submit" className="button-primary" disabled={loading || projects.length === 0}>
          {loading ? 'Menyimpan...' : initialValues ? 'Simpan Perubahan' : 'Simpan Task'}
        </button>
      </div>
    </form>
  )
}

