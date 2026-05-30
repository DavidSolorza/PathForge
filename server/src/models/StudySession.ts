import mongoose, { Schema, Document } from 'mongoose'

export interface IStudySession extends Document {
  userId: string
  date: string
  duration: number
  topicsStudied: string[]
  createdAt: Date
}

const StudySessionSchema = new Schema<IStudySession>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    duration: { type: Number, default: 0 },
    topicsStudied: { type: [String], default: [] },
  },
  { timestamps: true },
)

StudySessionSchema.index({ userId: 1, date: 1 })

export const StudySessionModel = mongoose.model<IStudySession>('StudySession', StudySessionSchema)
