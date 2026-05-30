import mongoose, { Schema, Document } from 'mongoose'

export interface ILearningGoal extends Document {
  userId: string
  type: 'weekly_topics' | 'weekly_sessions' | 'custom'
  target: number
  current: number
  weekStart: string
  label: string
  createdAt: Date
  updatedAt: Date
}

const LearningGoalSchema = new Schema<ILearningGoal>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['weekly_topics', 'weekly_sessions', 'custom'], required: true },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    weekStart: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true },
)

LearningGoalSchema.index({ userId: 1, weekStart: 1 })

export const LearningGoalModel = mongoose.model<ILearningGoal>('LearningGoal', LearningGoalSchema)
