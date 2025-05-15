import { Document, Types } from 'mongoose'
import { IImage, ImageData } from './Image'

export interface ProductImage extends IImage {
  // Extends the base IImage
}

export interface SizeOption {
  label?: string
  costBonus?: number
}

export interface ColorOption {
  label?: string
  value?: string
  costBonus?: number
}

export interface FileItem {
  url?: string
}

export interface IProduct extends Document {
  name: string
  slug: string
  desc?: string
  image?: ProductImage
  images?: ProductImage[]
  contentImages?: ProductImage[]
  price: number
  size?: SizeOption[]
  color?: ColorOption[]
  type: 'clothing' | 'accessories' | 'digital'
  files?: FileItem[]
  tax?: number
  enableTax?: boolean
  categoryId: Types.ObjectId
  content?: string
  author: Types.ObjectId
  status: 'draft' | 'published' | 'deleted'
  tags?: string[]
  keywords?: string[]
  isDeleted?: boolean
  uploading?: boolean
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductRequestBody {
  name: string
  categoryId: string
  content: string
  price: number
  author: string
  type: string
  slug: string
  image: ImageData
  images: ImageData[]
  contentImages: ImageData[]
}
