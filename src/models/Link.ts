import { Document, Types } from 'mongoose'

export interface ILink extends Document {
  words: string
  url: string
  posts: Types.ObjectId[]
  products: Types.ObjectId[]
  author: Types.ObjectId
  updatedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
