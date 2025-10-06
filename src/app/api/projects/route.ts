import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const projects = await Project.find({ userId: session.userId }).sort({ createdAt: -1 })
    const payload = projects.map((project) => project.toJSON())
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json().catch(() => null)
    const rawName = typeof body?.name === 'string' ? body.name.trim() : ''

    if (!rawName) {
      return NextResponse.json(
        { success: false, message: 'Nama project wajib diisi' },
        { status: 400 }
      )
    }

    const project = await Project.create({
      name: rawName,
      userId: session.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Project berhasil dibuat',
        data: project.toJSON(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}