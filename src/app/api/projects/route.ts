import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'

export async function GET() {
  await connectDB()
  const projects = await Project.find().sort({ createdAt: -1 })
  const payload = projects.map((project) => project.toJSON())
  return NextResponse.json(payload)
}

export async function POST(request: Request) {
  await connectDB()

  const body = await request.json().catch(() => null)
  const rawName = typeof body?.name === 'string' ? body.name.trim() : ''

  if (!rawName) {
    return NextResponse.json(
      { success: false, message: 'Nama project wajib diisi' },
      { status: 400 }
    )
  }

  const project = await Project.create({ name: rawName })

  return NextResponse.json(
    {
      success: true,
      message: 'Project berhasil dibuat',
      data: project.toJSON(),
    },
    { status: 201 }
  )
}