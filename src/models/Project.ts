import mongoose, { Schema, Document } from 'mongoose';
import { ProjectStatus } from '@/types';

export interface IProject extends Document {
  name: string;
  status: ProjectStatus;
  description_progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [255, 'Project name cannot exceed 255 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'done'],
      default: 'draft',
    },
    description_progress: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
