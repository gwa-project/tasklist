'use client'

import { useState } from 'react'
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
    <form className="space-y-7" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="project-name" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Project Name
          </label>
          <input
            id="project-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Peluncuran Aplikasi Mobile"
            disabled={loading}
            aria-invalid={Boolean(error)}
          />
        </div>
        {error ? <p className="text-sm font-medium text-rose-300/90">{error}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className="button-soft" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          {onDelete ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 transition duration-200 hover:bg-rose-500/25 disabled:opacity-50"
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
          {loading ? 'Menyimpan...' : 'Simpan Project'}
        </button>
      </div>
    </form>
  )
}
