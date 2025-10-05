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

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

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

  const projectMetrics = useMemo(() => {
    const total = projects.length
    const done = projects.filter((project) => project.status === 'done').length
    const inProgress = projects.filter((project) => project.status === 'in_progress').length
    const draft = total - done - inProgress
    const averageProgress = total
      ? Math.round(
          projects.reduce((accumulator, project) => accumulator + (project.progress ?? 0), 0) / total
        )
      : 0

    return { total, done, inProgress, draft, averageProgress }
  }, [projects])

  const taskMetrics = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.status === 'done').length
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length
    const draft = total - done - inProgress
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)
    const completion = selectedProject?.progress ?? 0

    return { total, done, inProgress, draft, totalWeight, completion }
  }, [tasks, selectedProject])

  const overviewCards = useMemo(
    () => [
      {
        id: 'projects',
        label: 'Total Project',
        value: numberFormatter.format(projectMetrics.total),
        description: ${numberFormatter.format(projectMetrics.inProgress)} project aktif •  draft,
      },
      {
        id: 'progress',
        label: 'Rata-rata Progress',
        value: ${projectMetrics.averageProgress}%,
        description: ${numberFormatter.format(projectMetrics.done)} project selesai,
      },
      {
        id: 'tasks',
        label: selectedProject ? 'Task dalam Project Ini' : 'Task Aktif',
        value: numberFormatter.format(taskMetrics.total),
        description: ${numberFormatter.format(taskMetrics.inProgress)} berjalan •  selesai,
      },
      {
        id: 'weights',
        label: 'Total Bobot Task',
        value: numberFormatter.format(taskMetrics.totalWeight),
        description: selectedProject
          ? Progress real-time %
          : 'Pilih project untuk melihat detail task',
      },
    ],
    [projectMetrics, taskMetrics, selectedProject]
  )

  const heroSubtitle = useMemo(() => {
    if (selectedProject) {
      return Sedang meninjau .  task dengan progres %.
    }

    if (projectMetrics.total > 0) {
      return Kelola  project dengan progres rata-rata % dan pastikan tidak ada task yang terlewat.
    }

    return 'Mulai dengan membuat project baru, lalu tambahkan task dan pantau progres secara otomatis.'
  }, [projectMetrics, selectedProject, taskMetrics.total, taskMetrics.completion])

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
      showToast('error', 'Gagal memuat project')
      return []
    } finally {
      setProjectsLoading(false)
    }
  }, [selectedProjectId, showToast])

  const loadTasks = useCallback(
    async (projectId: string, signal?: AbortSignal): Promise<Task[]> => {
      setTasksLoading(true)
      try {
        const response = await fetch(/api/tasks?projectId=, {
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
        showToast('error', 'Gagal memuat task')
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
      const response = await fetch(/api/projects/, {
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
    if (!window.confirm(Hapus project "" beserta seluruh task di dalamnya?)) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(/api/projects/, {
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
      const response = await fetch(/api/tasks/, {
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
    if (!window.confirm(Hapus task ""?)) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(/api/tasks/, {
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
        ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-100 shadow-emerald-500/30'
        : toast.type === 'error'
          ? 'border border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-rose-500/30'
          : 'border border-slate-400/30 bg-slate-900/90 text-slate-100 shadow-slate-500/10'

    return (
      <div
        className={ixed right-6 top-6 z-[200] inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium shadow-[0_20px_45px_-28px_rgba(59,130,246,0.6)] backdrop-blur-lg }
      >
        {toast.message}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_farthest-side_at_20%_20%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(circle_farthest-side_at_80%_0%,rgba(45,212,191,0.14),transparent_55%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-6 lg:px-12">
        <section className="glass-panel overflow-hidden px-8 py-10 shadow-[0_32px_120px_-60px_rgba(59,130,246,0.6)]">
          <div className="absolute inset-0 bg-grid-soft opacity-30" aria-hidden="true" />
          <div className="absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_65%)] opacity-70" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <span className="pill-label text-[10px]">Project Tasklist</span>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                Rancang, pantau, dan tuntaskan project dengan antarmuka premium
              </h1>
              <p className="subtle-text text-base text-slate-300">{heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
                className="button-ghost"
              >
                + Task Baru
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <div key={card.id} className="stat-card">
              <p className="kpi-label">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              <p className="subtle-text mt-2 text-sm">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[360px,1fr]">
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
        </section>
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
        description={
          projectForm?.mode === 'edit'
            ? 'Perbarui detail project yang dipilih berikut dengan cepat.'
            : 'Isi nama project agar tim Anda dapat mulai merencanakan task.'
        }
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
            ? 'Perbarui informasi task, ubah status, atau pindahkan ke project lain sesuai kebutuhan.'
            : 'Isi detail task untuk ditambahkan ke project yang sedang aktif.'
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
