'use client'

import { useMemo, useState } from 'react'
import type { ProjectPayload } from '@/types'

interface ProjectFormProps {
  initialValues?: ProjectPayload
  loading?: boolean
  onSubmit: (values: ProjectPayload) => Promise<void> | void
  onCancel: () => void
  onDelete?: () => Promise<void> | void
}

export default function ProjectForm({ initialValues, loading = false, onSubmit, onCancel, onDelete }: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [error, setError] = useState('')

  const modeLabel = useMemo(() => (initialValues ? 'Perbarui informasi project di bawah ini.' : 'Isi detail project baru untuk mulai mengelola task dengan rapi.'), [initialValues])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Nama project wajib diisi')
      return
    }

    setError('')
    await onSubmit({ name: name.trim() })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div>
          <label htmlFor="project-name" className="text-sm font-semibold text-slate-100">
            Nama Project
          </label>
          <p className="subtle-text mt-1">{modeLabel}</p>
        </div>
        <input
          id="project-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Redesign landing page Q4"
          disabled={loading}
          autoFocus
        />
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </div>

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
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Menyimpan...' : initialValues ? 'Simpan Perubahan' : 'Simpan Project'}
        </button>
      </div>
    </form>
  )
}
