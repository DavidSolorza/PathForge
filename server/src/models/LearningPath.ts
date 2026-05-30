import mongoose, { Schema, Document } from 'mongoose'

export interface IResource {
  title: string
  type: 'video' | 'article' | 'documentation' | 'book' | 'practice'
  url: string
}

export interface ITopic {
  name: string
  content?: string
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  completedAt?: Date
  resources: IResource[]
  notes?: string
  reviewDueAt?: Date
  reviewInterval?: number
}

export interface IStage {
  name: string
  description: string
  order: number
  status: 'pending' | 'in_progress' | 'completed'
  topics: ITopic[]
}

export interface ILearningPath extends Document {
  userId: string
  title: string
  goal: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  stages: IStage[]
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'article', 'documentation', 'book', 'practice'], required: true },
    url: { type: String, required: true },
  },
  { _id: true },
)

const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    content: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    resources: { type: [ResourceSchema], default: [] },
    notes: { type: String },
    reviewDueAt: { type: Date },
    reviewInterval: { type: Number },
  },
  { _id: true },
)

const StageSchema = new Schema<IStage>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    topics: { type: [TopicSchema], default: [] },
  },
  { _id: true },
)

const LearningPathSchema = new Schema<ILearningPath>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    goal: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    progress: { type: Number, default: 0 },
    stages: { type: [StageSchema], default: [] },
  },
  { timestamps: true },
)

LearningPathSchema.index({ userId: 1, createdAt: -1 })

export const LearningPathModel = mongoose.model<ILearningPath>('LearningPath', LearningPathSchema)
