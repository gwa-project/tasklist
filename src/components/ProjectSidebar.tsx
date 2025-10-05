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
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5">
                <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200">Projects</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Daftar Project</h2>
              <p className="subtle-text text-sm">
                Kelola dan monitor progress semua project Anda
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari project..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-indigo-400/50 focus:bg-white/10"
              disabled={loading || projects.length === 0}
            />
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
                    className={`group relative cursor-pointer select-none overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-300 ${
                      isActive
                        ? 'border-indigo-400/60 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent shadow-lg shadow-indigo-500/20'
                        : 'border-white/10 bg-slate-900/40 hover:border-indigo-300/30 hover:bg-slate-900/60 hover:shadow-md'
                    }`}
                  >
                    <div className="absolute inset-0 bg-grid-soft opacity-0 transition-opacity duration-200 group-hover:opacity-30" aria-hidden="true" />
                    {isActive && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500" />
                    )}

                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-base font-bold text-white transition-colors group-hover:text-indigo-100">{project.name}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={project.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onAddTask(project)
                            }}
                            className="rounded-lg border border-white/15 bg-white/5 p-2 transition-all hover:border-indigo-300/30 hover:bg-indigo-500/10"
                            title="Tambah Task"
                          >
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onEditProject(project)
                            }}
                            className="rounded-lg border border-white/15 bg-white/5 p-2 transition-all hover:border-indigo-300/30 hover:bg-indigo-500/10"
                            title="Edit Project"
                          >
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">Progress</span>
                          <span className="font-bold text-white">{project.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/50 transition-all duration-500"
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400">Diperbarui {updatedLabel}</p>
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
