import { Schema, model, models } from 'mongoose'
import type { ProjectStatus } from '@/types'

export interface ProjectDocument {
  name: string
  status: ProjectStatus
  progress: number
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
  },
  {
    timestamps: true,
  }
)

projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
  },
})

const Project = models.Project || model<ProjectDocument>('Project', projectSchema)

export default Project