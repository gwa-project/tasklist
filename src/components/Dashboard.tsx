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
        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
        : toast.type === 'error'
          ? 'bg-red-500/20 text-red-200 border border-red-500/40'
          : 'bg-slate-800 text-slate-200 border border-slate-700'

    return (
      <div className={`fixed right-6 top-6 z-50 rounded-2xl px-5 py-3 text-sm font-medium shadow-xl backdrop-blur ${tone}`}>
        {toast.message}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:px-8">
        <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
              Project Tasklist
            </span>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              Pantau progres project dan task secara real-time
            </h1>
            <p className="max-w-2xl text-sm text-slate-400 md:text-base">
              Tambahkan project, kelola task dengan bobot dan status yang jelas, lalu biarkan progress dan status project
              diperbarui otomatis sesuai alur kerja tim Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr] xl:grid-cols-[360px,1fr]">
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