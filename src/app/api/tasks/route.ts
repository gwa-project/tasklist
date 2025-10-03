import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import Project from '@/lib/models/Project'
import { recalculateProjectAggregates } from '@/lib/services/project'
import { TASK_STATUSES } from '@/lib/constants'

export async function GET(request: Request) {
  await connectDB()

  const { searchParams } = new URL(request.url)
  const projectIdParam = searchParams.get('project_id') ?? searchParams.get('projectId')

  const query: Record<string, unknown> = {}

  if (projectIdParam) {
    const normalizedProjectId = projectIdParam.trim()

    if (!Types.ObjectId.isValid(normalizedProjectId)) {
      return NextResponse.json([], { status: 200 })
    }

    query.project = normalizedProjectId
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 }).populate('project')
  const payload = tasks.map((task) => task.toJSON())

  return NextResponse.json(payload)
}

export async function POST(request: Request) {
  await connectDB()

  const body = await request.json().catch(() => null)

  const rawName = typeof body?.name === 'string' ? body.name.trim() : ''
  const rawStatus = typeof body?.status === 'string' ? body.status : ''
  const projectIdInput = typeof body?.projectId === 'string'
    ? body.projectId
    : typeof body?.project_id === 'string'
      ? body.project_id
      : ''
  const projectId = projectIdInput.trim()
  const weightValue = Number(body?.weight ?? 1)

  if (!rawName) {
    return NextResponse.json({ success: false, message: 'Nama task wajib diisi' }, { status: 400 })
  }

  if (!TASK_STATUSES.includes(rawStatus as (typeof TASK_STATUSES)[number])) {
    return NextResponse.json(
      { success: false, message: 'Status task tidak valid' },
      { status: 400 }
    )
  }

  if (!projectId || !Types.ObjectId.isValid(projectId)) {
    return NextResponse.json(
      { success: false, message: 'Project untuk task tidak valid' },
      { status: 400 }
    )
  }

  if (!Number.isInteger(weightValue) || weightValue < 1) {
    return NextResponse.json(
      { success: false, message: 'Bobot task minimal 1 dan harus bilangan bulat' },
      { status: 400 }
    )
  }

  const projectExists = await Project.exists({ _id: projectId })

  if (!projectExists) {
    return NextResponse.json({ success: false, message: 'Project tidak ditemukan' }, { status: 404 })
  }

  const task = await Task.create({
    name: rawName,
    status: rawStatus,
    project: projectId,
    weight: weightValue,
  })

  await recalculateProjectAggregates(projectId)
  const populatedTask = await Task.findById(task._id).populate('project')

  return NextResponse.json(
    {
      success: true,
      message: 'Task berhasil dibuat',
      data: populatedTask?.toJSON() ?? task.toJSON(),
    },
    { status: 201 }
  )
}