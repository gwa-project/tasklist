'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ProjectSidebar from './ProjectSidebar'
import TaskBoard from './TaskBoard'
import Modal from './Modal'
import ProjectForm from './ProjectForm'
import TaskForm from './TaskForm'
import type { Project, ProjectPayload, Task, TaskPayload } from '@/types'

interface ToastMessage {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [projectForm, setProjectForm] = useState<{ mode: 'create' | 'edit'; project?: Project } | null>(null)
  const [taskForm, setTaskForm] = useState<{ mode: 'create' | 'edit'; task?: Task } | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToast({ type, message })
  }, [])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const loadProjects = useCallback(async (): Promise<Project[]> => {
    setProjectsLoading(true)
    try {
      const response = await fetch('/api/projects', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Gagal memuat project')
      }
      const data = (await response.json()) as Project[]
      setProjects(data)

      if (data.length === 0) {
        setSelectedProjectId(null)
        setTasks([])
      } else if (!selectedProjectId || !data.some((project) => project.id === selectedProjectId)) {
        setSelectedProjectId(data[0].id)
      }

      return data
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message || 'Gagal memuat project')
      return []
    } finally {
      setProjectsLoading(false)
    }
  }, [selectedProjectId, showToast])

  const loadTasks = useCallback(
    async (projectId: string, signal?: AbortSignal): Promise<Task[]> => {
      setTasksLoading(true)
      try {
        const response = await fetch(`/api/tasks?projectId=${projectId}`, {
          cache: 'no-store',
          signal,
        })

        if (!response.ok) {
          throw new Error('Gagal memuat task')
        }

        const data = (await response.json()) as Task[]
        setTasks(data)
        return data
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return []
        }
        console.error(error)
        showToast('error', (error as Error).message || 'Gagal memuat task')
        return []
      } finally {
        setTasksLoading(false)
      }
    },
    [showToast]
  )

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([])
      return
    }

    const controller = new AbortController()
    void loadTasks(selectedProjectId, controller.signal)

    return () => {
      controller.abort()
    }
  }, [selectedProjectId, loadTasks])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = setTimeout(() => setToast(null), 3600)
    return () => clearTimeout(timeout)
  }, [toast])

  const handleCreateProject = async (payload: ProjectPayload) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat project')
      }

      showToast('success', result.message ?? 'Project berhasil dibuat')
      setProjectForm(null)
      const updatedProjects = await loadProjects()
      const newProjectId = typeof result?.data?.id === 'string' ? result.data.id : updatedProjects[0]?.id ?? null
      setSelectedProjectId(newProjectId)
      if (newProjectId) {
        await loadTasks(newProjectId)
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateProject = async (projectId: string, payload: ProjectPayload) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui project')
      }

      showToast('success', result.message ?? 'Project berhasil diperbarui')
      setProjectForm(null)
      const updatedProjects = await loadProjects()
      const projectExists = updatedProjects.some((project) => project.id === projectId)
      const targetProjectId = projectExists ? projectId : updatedProjects[0]?.id ?? null
      setSelectedProjectId(targetProjectId)
      if (targetProjectId) {
        await loadTasks(targetProjectId)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Hapus project "${project.name}" beserta semua task di dalamnya?`)) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus project')
      }

      showToast('success', result.message ?? 'Project berhasil dihapus')
      setProjectForm(null)
      const updatedProjects = await loadProjects()
      const fallbackProject = updatedProjects[0]?.id ?? null
      setSelectedProjectId(fallbackProject)
      if (fallbackProject) {
        await loadTasks(fallbackProject)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateTask = async (payload: TaskPayload) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat task')
      }

      showToast('success', result.message ?? 'Task berhasil dibuat')
      setTaskForm(null)
      const updatedProjects = await loadProjects()
      const projectId = typeof result?.data?.projectId === 'string' ? result.data.projectId : payload.projectId
      const projectExists = updatedProjects.some((project) => project.id === projectId)
      const targetProjectId = projectExists ? projectId : updatedProjects[0]?.id ?? null
      setSelectedProjectId(targetProjectId)
      if (targetProjectId) {
        await loadTasks(targetProjectId)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTask = async (taskId: string, payload: TaskPayload) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui task')
      }

      showToast('success', result.message ?? 'Task berhasil diperbarui')
      setTaskForm(null)
      const updatedProjects = await loadProjects()
      const projectId = typeof result?.data?.projectId === 'string' ? result.data.projectId : payload.projectId
      const projectExists = updatedProjects.some((project) => project.id === projectId)
      const targetProjectId = projectExists ? projectId : updatedProjects[0]?.id ?? null
      setSelectedProjectId(targetProjectId)
      if (targetProjectId) {
        await loadTasks(targetProjectId)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Hapus task "${task.name}"?`)) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus task')
      }

      showToast('success', result.message ?? 'Task berhasil dihapus')
      const updatedProjects = await loadProjects()
      const projectExists = updatedProjects.some((project) => project.id === task.projectId)
      const targetProjectId = projectExists ? task.projectId : updatedProjects[0]?.id ?? null
      setSelectedProjectId(targetProjectId)
      if (targetProjectId) {
        await loadTasks(targetProjectId)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error(error)
      showToast('error', (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderToast = () => {
    if (!toast) {
      return null
    }

    const tone =
      toast.type === 'success'
        ? {
            wrapper: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
            accent: 'bg-emerald-400/70',
          }
        : toast.type === 'error'
          ? {
              wrapper: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
              accent: 'bg-rose-400/70',
            }
          : {
              wrapper: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
              accent: 'bg-sky-300/70',
            }

    return (
      <div
        className={`fixed right-6 top-6 z-50 flex min-w-[260px] items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_20px_60px_rgba(8,11,32,0.45)] backdrop-blur ${tone.wrapper}`}
      >
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 ${tone.accent}`}>
          {toast.type === 'success' ? 'OK' : toast.type === 'error' ? 'ERR' : 'INFO'}
        </span>
        <span>{toast.message}</span>
      </div>
    )
  }

  const completedProjects = projects.filter((project) => project.status === 'done').length
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + (project.progress ?? 0), 0) / projects.length)
    : 0
  const focusProjectName = selectedProject?.name ?? 'Belum dipilih'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-20 h-[420px] w-[420px] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -right-48 top-1/3 h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[160px]" />
        <div className="absolute bottom-[-30%] left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-12">
        <header className="space-y-10 rounded-[42px] border border-white/10 bg-white/[0.04] p-10 shadow-[0_40px_120px_rgba(8,11,32,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                Tasklist Command Center
              </span>
              <h1 className="text-4xl font-semibold text-white lg:text-5xl">
                Kelola perjalanan project dengan tampilan baru
              </h1>
              <p className="text-base text-slate-300/85">
                Rancang alur project, pantau beban kerja, dan arahkan tim pada prioritas terpenting melalui dashboard yang lebih imersif.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300/75">
                <span className="rounded-full bg-white/10 px-3 py-1 uppercase tracking-[0.3em]">{projects.length} Project</span>
                <span className="rounded-full bg-white/10 px-3 py-1 uppercase tracking-[0.3em]">
                  Fokus: {focusProjectName}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-end lg:w-auto lg:flex-col lg:items-end">
              <button type="button" onClick={() => setProjectForm({ mode: 'create' })} className="button-primary">
                + Project Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedProject) {
                    setTaskForm({ mode: 'create' })
                  } else {
                    showToast('info', 'Buat atau pilih project terlebih dahulu')
                  }
                }}
                className="button-soft"
              >
                + Task Baru
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Rata Progress</p>
              <p className="mt-3 text-3xl font-semibold text-white">{averageProgress}%</p>
              <p className="mt-2 text-xs text-slate-300/75">Akumulasi rata-rata progress seluruh project.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Project Selesai</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-200">{completedProjects}</p>
              <p className="mt-2 text-xs text-slate-300/75">Total project yang sudah masuk status selesai.</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Task Aktif</p>
              <p className="mt-3 text-3xl font-semibold text-sky-200">{tasks.length}</p>
              <p className="mt-2 text-xs text-slate-300/75">Task pada project terpilih yang sedang dimonitor.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[360px,1fr]">
          <ProjectSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            loading={projectsLoading}
            onSelect={(projectId) => setSelectedProjectId(projectId)}
            onCreateProject={() => setProjectForm({ mode: 'create' })}
            onEditProject={(project) => setProjectForm({ mode: 'edit', project })}
            onAddTask={(project) => {
              setSelectedProjectId(project.id)
              setTaskForm({ mode: 'create' })
            }}
          />

          <TaskBoard
            project={selectedProject}
            tasks={tasks}
            loading={tasksLoading}
            onCreateTask={() => {
              if (!selectedProject) {
                showToast('info', 'Pilih project terlebih dahulu')
                return
              }
              setTaskForm({ mode: 'create' })
            }}
            onEditTask={(task) => setTaskForm({ mode: 'edit', task })}
            onDeleteTask={(task) => {
              void handleDeleteTask(task)
            }}
          />
        </div>
      </div>

      {renderToast()}

      <Modal
        open={Boolean(projectForm)}
        onClose={() => {
          if (!submitting) {
            setProjectForm(null)
          }
        }}
        title={projectForm?.mode === 'edit' ? 'Edit Project' : 'Project Baru'}
        description={projectForm?.mode === 'edit' ? 'Perbarui detail project yang dipilih.' : 'Isi nama project untuk memulai.'}
      >
        <ProjectForm
          initialValues={projectForm?.project ? { name: projectForm.project.name } : undefined}
          loading={submitting}
          onCancel={() => {
            if (!submitting) {
              setProjectForm(null)
            }
          }}
          onSubmit={async (values) => {
            if (projectForm?.mode === 'edit' && projectForm.project) {
              await handleUpdateProject(projectForm.project.id, values)
            } else {
              await handleCreateProject(values)
            }
          }}
          onDelete={
            projectForm?.mode === 'edit' && projectForm.project
              ? async () => {
                  await handleDeleteProject(projectForm.project as Project)
                }
              : undefined
          }
        />
      </Modal>

      <Modal
        open={Boolean(taskForm)}
        onClose={() => {
          if (!submitting) {
            setTaskForm(null)
          }
        }}
        title={taskForm?.mode === 'edit' ? 'Edit Task' : 'Task Baru'}
        description={
          taskForm?.mode === 'edit'
            ? 'Perbarui informasi task, ubah status atau pindahkan ke project lain.'
            : 'Isi detail task untuk ditambahkan ke project yang dipilih.'
        }
      >
        <TaskForm
          initialValues={
            taskForm?.task
              ? {
                  name: taskForm.task.name,
                  status: taskForm.task.status,
                  projectId: taskForm.task.projectId,
                  weight: taskForm.task.weight,
                }
              : undefined
          }
          defaultProjectId={selectedProjectId}
          projects={projects}
          loading={submitting}
          onCancel={() => {
            if (!submitting) {
              setTaskForm(null)
            }
          }}
          onSubmit={async (values) => {
            if (taskForm?.mode === 'edit' && taskForm.task) {
              await handleUpdateTask(taskForm.task.id, values)
            } else {
              await handleCreateTask(values)
            }
          }}
          onDelete={
            taskForm?.mode === 'edit' && taskForm.task
              ? async () => {
                  await handleDeleteTask(taskForm.task as Task)
                  setTaskForm(null)
                }
              : undefined
          }
        />
      </Modal>
    </div>
  )
}
