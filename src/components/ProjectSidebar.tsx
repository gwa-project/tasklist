'use client'

import { useMemo, useState } from 'react'
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

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export default function ProjectSidebar({
  projects,
  selectedProjectId,
  loading,
  onSelect,
  onCreateProject,
  onEditProject,
  onAddTask,
}: ProjectSidebarProps) {
  const [query, setQuery] = useState('')

  const filteredProjects = useMemo(() => {
    if (!query.trim()) {
      return projects
    }

    const keyword = query.trim().toLowerCase()
    return projects.filter((project) => project.name.toLowerCase().includes(keyword))
  }, [projects, query])

  const emptyCopy = query.trim()
    ? 'Tidak ada project yang cocok dengan kata kunci yang dimasukkan.'
    : 'Belum ada project dibuat. Tambahkan project pertama Anda untuk mulai mengatur task dengan rapi.'

  return (
    <aside className="glass-panel flex h-full w-full flex-col overflow-hidden">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="pill-label text-[10px]">Projects</span>
              <h2 className="mt-2 text-2xl font-semibold text-white">Panel Project</h2>
              <p className="subtle-text mt-1">
                Kelola daftar project, lihat status, dan lompat cepat ke task terkait.
              </p>
            </div>
            <button type="button" onClick={onCreateProject} className="button-primary whitespace-nowrap">
              + Project Baru
            </button>
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari project berdasarkan nama"
              className="pl-4 pr-12"
              disabled={loading || projects.length === 0}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs uppercase tracking-[0.32em] text-slate-500">
              Cari
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-slate-300">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
            Memuat daftar project...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-white">Belum Ada Project</h3>
            <p className="mt-3 text-sm text-slate-400">{emptyCopy}</p>
            <button type="button" onClick={onCreateProject} className="button-primary mt-6">
              Buat Project
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredProjects.map((project) => {
              const isActive = project.id === selectedProjectId
              const updatedLabel = dateFormatter.format(new Date(project.updatedAt))

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
                    className={`group relative cursor-pointer select-none overflow-hidden rounded-3xl border px-5 py-5 transition ${
                      isActive
                        ? 'border-indigo-400/50 bg-gradient-to-br from-indigo-500/10 via-slate-900/70 to-slate-950 ring-1 ring-indigo-400/40'
                        : 'border-white/10 bg-slate-950/40 hover:border-slate-300/20 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="absolute inset-0 bg-grid-soft opacity-0 transition-opacity duration-200 group-hover:opacity-50" aria-hidden="true" />

                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <StatusBadge status={project.status} />
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                              Progress {project.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onAddTask(project)
                            }}
                            className="button-ghost h-9 rounded-full border-white/15 bg-white/5 px-4 text-xs"
                          >
                            + Task
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onEditProject(project)
                            }}
                            className="button-ghost h-9 rounded-full border-white/15 bg-white/5 px-4 text-xs"
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Timeline progres</span>
                          <span>Pembaruan {updatedLabel}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-500 transition-all duration-300"
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                          />
                        </div>
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
