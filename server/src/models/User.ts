import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  avatar?: string
  bio?: string
  favoriteCategories: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    bio: { type: String },
    favoriteCategories: { type: [String], default: [] },
  },
  { timestamps: true },
)

UserSchema.index({ email: 1 })

export const UserModel = mongoose.model<IUser>('User', UserSchema)
