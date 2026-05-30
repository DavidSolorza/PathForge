import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity extends Document {
  userId: string
  type: 'path_created' | 'topic_completed' | 'path_completed'
  title: string
  pathName: string
  timestamp: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['path_created', 'topic_completed', 'path_completed'], required: true },
    title: { type: String, required: true },
    pathName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

ActivitySchema.index({ userId: 1, timestamp: -1 })

export const ActivityModel = mongoose.model<IActivity>('Activity', ActivitySchema)
