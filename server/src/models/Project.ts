import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  userId: string
  name: string
  description: string
  technologies: string[]
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  repoUrl?: string
  demoUrl?: string
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'in_progress', 'completed', 'archived'], default: 'draft' },
    repoUrl: { type: String },
    demoUrl: { type: String },
  },
  { timestamps: true },
)

ProjectSchema.index({ userId: 1, status: 1 })

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema)
