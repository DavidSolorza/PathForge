import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface IChatHistory extends Document {
  userId: string
  mode: 'chat' | 'generator'
  messages: IChatMessage[]
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: String, required: true, index: true },
    mode: { type: String, enum: ['chat', 'generator'], required: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true },
)

ChatHistorySchema.index({ userId: 1, mode: 1 })

export const ChatHistoryModel = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema)
