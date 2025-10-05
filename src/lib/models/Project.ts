import { Schema, model, models, Types } from 'mongoose'
import type { ProjectStatus } from '@/types'

export interface ProjectDocument {
  name: string
  status: ProjectStatus
  progress: number
  userId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<ProjectDocument>(
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
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      set: (value: number) => {
        if (typeof value !== 'number' || Number.isNaN(value)) {
          return 0
        }

        return Number(value.toFixed(1))
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString()
    delete ret._id
  },
})

const Project = models.Project || model<ProjectDocument>('Project', projectSchema)

export default Project