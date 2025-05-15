import { Document, Types } from 'mongoose'

// Basic image interface used in other models
export interface IImage {
  id?: Types.ObjectId | string
  url?: string
  thumbnail?: string
  path?: string
  cloudflareUrl?: string
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

// Interface for controller image data
export interface ImageData {
  id?: Types.ObjectId | string
  url?: string
  path?: string
  thumbnail?: string
  thumbnailUrl?: string
  _id?: string
  cloudflareUrl?: string
}
