import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import mongoose from 'mongoose';

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await Task.findById(id).populate('project_id', 'name');

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task, { status: 200 });
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

    if (!body.project_id || !mongoose.Types.ObjectId.isValid(body.project_id)) {
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

    // Check if project exists
    const project = await Project.findById(body.project_id);
    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        name: body.name,
        status: body.status,
        project_id: body.project_id,
        weight: body.weight,
      },
      { new: true, runValidators: true }
    ).populate('project_id', 'name');

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update project progress
    await updateProjectProgress(body.project_id);

    return NextResponse.json(
      {
        success: true,
        message: 'Task berhasil diupdate',
        data: task,
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

    const projectId = task.project_id.toString();
    await Task.findByIdAndDelete(id);

    // Update project progress after deletion
    await updateProjectProgress(projectId);

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

// Helper function to update project progress
async function updateProjectProgress(projectId: string) {
  const tasks = await Task.find({ project_id: projectId });

  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, {
      description_progress: 0.0,
      status: 'draft',
    });
    return;
  }

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
  const completedWeight = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + task.weight, 0);

  const percentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  const progress = Math.floor(percentage * 10) / 10; // Round down to 1 decimal

  // Calculate status
  const allDone = tasks.every((task) => task.status === 'done');
  const hasInProgress = tasks.some((task) => task.status === 'in_progress');

  let status = 'draft';
  if (allDone) {
    status = 'done';
  } else if (hasInProgress) {
    status = 'in_progress';
  }

  await Project.findByIdAndUpdate(projectId, {
    description_progress: progress,
    status: status,
  });
}
