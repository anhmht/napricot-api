import { Document } from 'mongoose'
import { IImage } from './Image'

export interface ICategory extends Document {
  name: string
  slug: string
  desc?: string
  image?: IImage
  parentId?: string
  type: 'product' | 'post'
  createdAt: Date
  updatedAt: Date
}
