import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import Project from '@/lib/models/Project';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import { recalculateProjectAggregates } from '@/lib/services/project';

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify task belongs to user's project
    const project = await Project.findOne({ _id: task.project, userId: session.userId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(task.toJSON(), { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Task name is required' },
        { status: 400 }
      );
    }

    if (!body.status || !['draft', 'in_progress', 'done'].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status is required (draft, in_progress, done)' },
        { status: 400 }
      );
    }

    const projectIdInput = body.projectId || body.project_id;
    if (!projectIdInput || !mongoose.Types.ObjectId.isValid(projectIdInput)) {
      return NextResponse.json(
        { success: false, message: 'Valid project ID is required' },
        { status: 400 }
      );
    }

    if (!body.weight || body.weight < 1) {
      return NextResponse.json(
        { success: false, message: 'Weight must be at least 1' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectIdInput, userId: session.userId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    // Verify task exists and belongs to user's project
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    const existingProject = await Project.findOne({ _id: existingTask.project, userId: session.userId });
    if (!existingProject) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        name: body.name,
        status: body.status,
        project: projectIdInput,
        weight: body.weight,
      },
      { new: true, runValidators: true }
    ).populate('project');

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update project progress
    await recalculateProjectAggregates(projectIdInput);

    return NextResponse.json(
      {
        success: true,
        message: 'Task berhasil diupdate',
        data: task.toJSON(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify task belongs to user's project
    const project = await Project.findOne({ _id: task.project, userId: session.userId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const projectId = task.project.toString();
    await Task.findByIdAndDelete(id);

    // Update project progress after deletion
    await recalculateProjectAggregates(projectId);

    return NextResponse.json(
      {
        success: true,
        message: 'Task berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
