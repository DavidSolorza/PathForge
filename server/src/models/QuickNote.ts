import mongoose, { Schema, Document } from 'mongoose'

export interface IQuickNote extends Document {
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const QuickNoteSchema = new Schema<IQuickNote>(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
)

QuickNoteSchema.index({ userId: 1, updatedAt: -1 })

export const QuickNoteModel = mongoose.model<IQuickNote>('QuickNote', QuickNoteSchema)
