import mongoose, { Schema, Document } from 'mongoose'

export interface IStats extends Document {
  userId: string
  totalPaths: number
  completedTopics: number
  totalProgress: number
  streak: number
  favoriteCategory: string
  activeDays: number
  updatedAt: Date
}

const StatsSchema = new Schema<IStats>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalPaths: { type: Number, default: 0 },
    completedTopics: { type: Number, default: 0 },
    totalProgress: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    favoriteCategory: { type: String, default: '' },
    activeDays: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const StatsModel = mongoose.model<IStats>('Stats', StatsSchema)
