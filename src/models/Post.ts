import { Document, Types } from 'mongoose'
import { IImage } from './Image'

export interface IPost extends Document {
  title: string
  slug: string
  desc?: string
  image?: IImage
  images?: IImage[]
  categoryId: Types.ObjectId
  content: string
  author: Types.ObjectId
  keywords?: string[]
  status: 'draft' | 'published' | 'deleted'
  tags?: string[]
  isDeleted?: boolean
  uploading?: boolean
  authorSEO: {
    authorId: string
    name: string
    avatar: string
  }
  titleSEO: string
  externalUrl?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface PostImage {
  id: string
  url: string
  cloudflareUrl?: string
}
