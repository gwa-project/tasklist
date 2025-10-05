'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task } from '@/types'

interface ToastMessage {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function DashboardNew() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState<any>(null)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [formVisible, setFormVisible] = useState(false)
  const [formType, setFormType] = useState<'project' | 'task'>('project')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    name: '',
    status: 'draft' as 'draft' | 'in_progress' | 'done',
    projectId: '',
    weight: 1,
  })

  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    // Load user data
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser(data.data)
        }
      })
      .catch((error) => console.error('Failed to load user:', error))
  }, [])

  const loadProjects = useCallback(async () => {
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
    async (projectId: string) => {
      try {
        const response = await fetch(`/api/tasks?projectId=${projectId}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Gagal memuat task')
        }

        const data = (await response.json()) as Task[]
        setTasks(data)
        return data
      } catch (error) {
        console.error(error)
        showToast('error', 'Gagal memuat task')
        return []
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

    void loadTasks(selectedProjectId)
  }, [selectedProjectId, loadTasks])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = setTimeout(() => setToast(null), 3600)
    return () => clearTimeout(timeout)
  }, [toast])

  const showForm = (type: 'project' | 'task', mode: 'create' | 'edit' = 'create', item?: Project | Task) => {
    setFormType(type)
    setFormMode(mode)

    if (mode === 'create') {
      setFormData({
        name: '',
        status: 'draft',
        projectId: type === 'task' && selectedProjectId ? selectedProjectId : '',
        weight: 1,
      })
      setEditingProject(null)
      setEditingTask(null)
    } else if (type === 'project' && item) {
      const proj = item as Project
      setEditingProject(proj)
      setFormData({
        name: proj.name,
        status: proj.status,
        projectId: '',
        weight: 1,
      })
    } else if (type === 'task' && item) {
      const task = item as Task
      setEditingTask(task)
      setFormData({
        name: task.name,
        status: task.status,
        projectId: task.projectId,
        weight: task.weight,
      })
    }

    setFormVisible(true)
  }

  const hideForm = () => {
    setFormVisible(false)
    setFormData({ name: '', status: 'draft', projectId: '', weight: 1 })
    setEditingProject(null)
    setEditingTask(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showToast('error', 'Nama harus diisi!')
      return
    }

    if (formType === 'task' && !formData.projectId) {
      showToast('error', 'Project harus dipilih untuk task!')
      return
    }

    setSubmitting(true)

    try {
      if (formType === 'project') {
        const url = formMode === 'edit' && editingProject
          ? `/api/projects/${editingProject.id}`
          : '/api/projects'

        const response = await fetch(url, {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Gagal menyimpan project')
        }

        showToast('success', result.message || 'Project berhasil disimpan')
        hideForm()
        await loadProjects()
      } else {
        const url = formMode === 'edit' && editingTask
          ? `/api/tasks/${editingTask.id}`
          : '/api/tasks'

        const response = await fetch(url, {
          method: formMode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            status: formData.status,
            projectId: formData.projectId,
            weight: formData.weight,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Gagal menyimpan task')
        }

        showToast('success', result.message || 'Task berhasil disimpan')
        hideForm()
        await loadProjects()
        if (formData.projectId) {
          await loadTasks(formData.projectId)
        }
      }
    } catch (error: any) {
      console.error(error)
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const item = formType === 'project' ? editingProject : editingTask
    if (!item) return

    const confirmMsg = formType === 'project'
      ? `Hapus project "${(item as Project).name}" beserta seluruh task di dalamnya?`
      : `Hapus task "${(item as Task).name}"?`

    if (!window.confirm(confirmMsg)) return

    setSubmitting(true)

    try {
      const url = formType === 'project'
        ? `/api/projects/${item.id}`
        : `/api/tasks/${item.id}`

      const response = await fetch(url, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus')
      }

      showToast('success', result.message || 'Berhasil dihapus')
      hideForm()
      await loadProjects()
      if (formType === 'task' && formData.projectId) {
        await loadTasks(formData.projectId)
      }
    } catch (error: any) {
      console.error(error)
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId)
  }

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="btn btn-primary" onClick={() => showForm('project', 'create')}>
            Add Project
          </button>
          <button className="btn btn-secondary" onClick={() => {
            if (!selectedProjectId) {
              showToast('info', 'Pilih project terlebih dahulu')
              return
            }
            showForm('task', 'create')
          }}>
            Add Task
          </button>
        </div>

        <div className="projects-list">
          {projectsLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Belum ada project. Klik "Add Project" untuk membuat project baru.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="project-header" onClick={() => showForm('project', 'edit', project)}>
                  <div className="project-info">
                    <span className="project-name">{project.name}</span>
                    <div className="project-meta">
                      <span className={`status-badge status-${project.status}`}>
                        {project.status.toUpperCase()}
                      </span>
                      <small className="project-progress">Progress: {project.progress}%</small>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, projectId: project.id })
                        showForm('task', 'create')
                      }}
                      title="Add Task to this Project"
                    >
                      ➕
                    </button>
                    <button
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleProject(project.id)
                      }}
                    >
                      {expandedProjects.has(project.id) ? '−' : '🔽'}
                    </button>
                  </div>
                </div>

                {expandedProjects.has(project.id) && (
                  <div className="tasks-list">
                    <div className="tasks-container">
                      {getProjectTasks(project.id).length === 0 ? (
                        <p style={{ padding: '10px', color: '#666', fontStyle: 'italic' }}>
                          Belum ada task
                        </p>
                      ) : (
                        getProjectTasks(project.id).map((task) => (
                          <div
                            key={task.id}
                            className="task-item"
                            onClick={() => showForm('task', 'edit', task)}
                          >
                            <div className="task-content">
                              <div className="task-info">
                                <span className="task-name">{task.name}</span>
                                <div className="task-meta">
                                  <small className="task-weight">Bobot: {task.weight}</small>
                                  <span className={`status-badge status-${task.status}`}>
                                    {task.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* User info at bottom */}
        {user && (
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '14px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Message */}
        <div className={`welcome-message ${formVisible ? 'hide' : ''}`}>
          <h1>Project Tracker</h1>
          <p>Kelola project dan task Anda dengan mudah.</p>
        </div>

        {/* Form Container */}
        <div className={`form-container ${formVisible ? 'show' : ''}`}>
          <h2>
            {formMode === 'edit'
              ? `Edit ${formType === 'project' ? 'Project' : 'Task'}`
              : `Add ${formType === 'project' ? 'Project' : 'Task'}`}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nama:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={submitting}
              />
            </div>

            {formType === 'project' && (
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <input
                  type="text"
                  id="status"
                  name="status"
                  className="form-control"
                  value={formMode === 'edit' && editingProject ? editingProject.status : 'draft'}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                />
              </div>
            )}

            {formType === 'task' && (
              <>
                <div className="form-group">
                  <label htmlFor="taskStatus">Status:</label>
                  <select
                    id="taskStatus"
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    disabled={submitting}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="projectSelect">Project:</label>
                  <select
                    id="projectSelect"
                    name="project_id"
                    className="form-control"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Bobot:</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="form-control"
                    min="1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    disabled={submitting}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={hideForm}
                disabled={submitting}
              >
                Cancel
              </button>
              {formMode === 'edit' && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Delete
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 500,
            zIndex: 1000,
            backgroundColor:
              toast.type === 'success' ? '#28a745' : toast.type === 'error' ? '#dc3545' : '#17a2b8',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
