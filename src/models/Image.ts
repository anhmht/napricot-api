import { Document, Types } from 'mongoose'

// Basic image interface used in other models
export interface IImage {
  id?: Types.ObjectId | string
  url?: string
  thumbnailUrl?: string
  thumbnailPath?: string
  path?: string
  cloudflareUrl?: string
  isFeatured?: boolean
}

// For the actual Image model
export interface IImageDocument extends Document {
  path: string
  url: string
  thumbnailPath?: string
  thumbnailUrl?: string
  cloudflareUrl?: string
  createdAt: Date
  updatedAt: Date
}
