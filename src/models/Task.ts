import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus } from '@/types';

export interface ITask extends Document {
  name: string;
  status: TaskStatus;
  project_id: mongoose.Types.ObjectId;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [255, 'Task name cannot exceed 255 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'done'],
      default: 'draft',
      required: true,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [1, 'Weight must be at least 1'],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk performa query
TaskSchema.index({ project_id: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
