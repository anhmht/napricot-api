import { Document, Types } from 'mongoose'

export interface IThread extends Document {
  name: string
  messages: {
    sender: Types.ObjectId
    content: string
    timestamp: Date
  }[]
  participants: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}
