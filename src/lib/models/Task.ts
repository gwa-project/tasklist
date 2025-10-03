import { Schema, Types, model, models } from 'mongoose'
import type { TaskStatus } from '@/types'

export interface TaskDocument {
  name: string
  status: TaskStatus
  project: Types.ObjectId
  weight: number
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<TaskDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'done'],
      default: 'draft',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString()
    const projectRef = ret.project

    if (projectRef && typeof projectRef === 'object' && projectRef !== null) {
      if (projectRef._id) {
        projectRef.id = projectRef._id.toString()
        delete projectRef._id
      }
      ret.project = projectRef
      ret.projectId = projectRef.id
    } else {
      ret.projectId = projectRef?.toString()
    }

    delete ret._id
  },
})

const Task = models.Task || model<TaskDocument>('Task', taskSchema)

export default Task