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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="project-name">Nama Project</label>
        <input
          id="project-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Redesign Landing Page"
          disabled={loading}
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" className="button-ghost" onClick={onCancel} disabled={loading}>
            Batal
          </button>
          {onDelete ? (
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-500/20"
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