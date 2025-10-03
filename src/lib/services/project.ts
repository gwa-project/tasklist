import { Types } from 'mongoose'
import Project from '@/lib/models/Project'
import Task from '@/lib/models/Task'
import type { ProjectStatus } from '@/types'

export async function recalculateProjectAggregates(projectId: string) {
  if (!Types.ObjectId.isValid(projectId)) {
    return null
  }

  const project = await Project.findById(projectId)
  if (!project) {
    return null
  }

  const tasks = await Task.find({ project: projectId })
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight ?? 0), 0)
  const completedWeight = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + (task.weight ?? 0), 0)

  const progress = totalWeight === 0 ? 0 : Math.floor(((completedWeight / totalWeight) * 100) * 10) / 10

  let status: ProjectStatus = 'draft'

  if (tasks.length === 0) {
    status = 'draft'
  } else if (tasks.every((task) => task.status === 'done')) {
    status = 'done'
  } else if (tasks.some((task) => task.status === 'in_progress')) {
    status = 'in_progress'
  } else {
    status = 'draft'
  }

  project.progress = progress
  project.status = status
  await project.save()

  return project
}