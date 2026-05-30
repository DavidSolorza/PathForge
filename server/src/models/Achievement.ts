import mongoose, { Schema, Document } from 'mongoose'

export interface IAchievement extends Document {
  userId: string
  achievementId: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'streak' | 'social' | 'milestone'
  unlockedAt: Date
  createdAt: Date
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, enum: ['learning', 'streak', 'social', 'milestone'], required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })

export const AchievementModel = mongoose.model<IAchievement>('Achievement', AchievementSchema)
