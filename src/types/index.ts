export type TaskStatus = 'draft' | 'in_progress' | 'done'
export type ProjectStatus = TaskStatus

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  name: string
  status: TaskStatus
  projectId: string
  weight: number
  createdAt: string
  updatedAt: string
  project?: Project
}

export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface ProjectPayload {
  name: string
}

export interface TaskPayload {
  name: string
  status: TaskStatus
  projectId: string
  weight: number
}